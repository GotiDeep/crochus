const nodemailer = require('nodemailer');
const env = require('../config/env');
const { runFunction } = require('../config/db');
const { decrypt } = require('../lib/secureSettings');

async function getSmtpConfig() {
  try {
    const [stored] = await runFunction('sp_get_smtp_settings');
    if (stored?.smtp_host && stored?.smtp_user && stored?.smtp_password_encrypted) {
      return {
        host: stored.smtp_host,
        port: Number(stored.smtp_port),
        secure: Boolean(stored.smtp_secure),
        user: stored.smtp_user,
        pass: decrypt(stored.smtp_password_encrypted),
        from: stored.smtp_from || stored.smtp_user,
        receiver: stored.contact_receiver_email || stored.smtp_user,
      };
    }
  } catch (error) {
    if (env.nodeEnv === 'production') throw error;
    console.warn('Stored SMTP settings unavailable; using environment settings:', error.message);
  }

  return {
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    user: env.smtpUser,
    pass: env.smtpPass,
    from: env.smtpFrom,
    receiver: env.contactReceiverEmail,
  };
}

function createTransporter(config) {
  if (!config.host || !config.user || !config.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

async function sendMail(payload) {
  const transporter = createTransporter(await getSmtpConfig());

  if (!transporter) {
    console.log('Mail fallback payload:', payload);
    return { delivery: 'log' };
  }

  await transporter.sendMail(payload);
  return { delivery: 'smtp' };
}

async function sendOtpEmail({ email, otp, purpose }) {
  const config = await getSmtpConfig();
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
    from: config.from,
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
  const config = await getSmtpConfig();
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
    from: config.from,
    to: config.receiver,
    replyTo: email,
    subject: subject || 'New Crochus inquiry',
    html,
  });
}

async function sendTestEmail(to) {
  const config = await getSmtpConfig();
  const transporter = createTransporter(config);
  if (!transporter) throw new Error('SMTP settings are incomplete');
  await transporter.sendMail({ from: config.from, to, subject: 'Crochus SMTP test', text: 'Your Crochus SMTP settings are working.' });
}

module.exports = {
  sendOtpEmail,
  sendContactEmail,
  sendTestEmail,
};
