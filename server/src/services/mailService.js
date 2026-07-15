const nodemailer = require('nodemailer');
const env = require('../config/env');

function hasSmtpConfig() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}

function createTransporter() {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

async function sendMail(payload) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('Mail fallback payload:', payload);
    return { delivery: 'log' };
  }

  await transporter.sendMail(payload);
  return { delivery: 'smtp' };
}

async function sendOtpEmail({ email, otp, purpose }) {
  const subject = purpose === 'register' ? 'Your Crochus verification OTP' : 'Your Crochus password reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">Crochus OTP</h2>
      <p>Your one-time password is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This OTP will expire in 10 minutes.</p>
    </div>
  `;

  const result = await sendMail({
    from: env.smtpFrom,
    to: email,
    subject,
    html,
  });

  return {
    ...result,
    dev_otp: result.delivery === 'log' ? otp : undefined,
  };
}

async function sendContactEmail({ name, email, subject, message }) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Crochus Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>
  `;

  return sendMail({
    from: env.smtpFrom,
    to: env.contactReceiverEmail,
    replyTo: email,
    subject: subject || 'New Crochus inquiry',
    html,
  });
}

module.exports = {
  sendOtpEmail,
  sendContactEmail,
};

