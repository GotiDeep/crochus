const nodemailer = require('nodemailer');
const env = require('../config/env');
const { runFunction } = require('../config/db');
const { decrypt } = require('../lib/secureSettings');

async function getSmtpConfig() {
  let storedContactEmail = '';
  try {
    const publicSettings = await runFunction('sp_get_public_settings');
    if (publicSettings?.[0]?.contact_email) {
      storedContactEmail = publicSettings[0].contact_email;
    }
  } catch (err) {
    // Non-critical, ignore
  }

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
        receiver: stored.contact_receiver_email || storedContactEmail || stored.smtp_user,
        contactEmail: storedContactEmail || stored.contact_receiver_email || stored.smtp_user,
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
    receiver: storedContactEmail || env.contactReceiverEmail || env.smtpUser,
    contactEmail: storedContactEmail || env.contactReceiverEmail || env.smtpUser,
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

async function sendCustomerOrderEmail(order) {
  if (!order.customer_email) {
    console.warn(`[MailService] No customer email found for order #${order.id}, skipping customer notification.`);
    return null;
  }

  const config = await getSmtpConfig();
  const itemsHtml = (order.items || []).map((item) => {
    const photo = item.product?.photos?.[0] ? `<img src="${item.product.photos[0]}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #C8C49A; margin-right: 12px; vertical-align: middle;" />` : '';
    const code = item.product?.product_code ? `<span style="font-family: monospace; font-size: 11px; background: #E8E0CC; padding: 2px 6px; border-radius: 4px; color: #4A5C2F; margin-left: 6px;">${item.product.product_code}</span>` : '';
    const subtotal = (Number(item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN');
    return `
      <tr style="border-bottom: 1px solid #E8E0CC;">
        <td style="padding: 12px 0; vertical-align: middle;">
          ${photo}
          <span style="font-weight: 500; color: #2C3A1A;">${item.product?.name || 'Product'}</span>
          ${code}
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #6B7F4A; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #2C3A1A; vertical-align: middle;">₹${subtotal}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <div style="background-color: #F5F0E0; padding: 32px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2C3A1A;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 10px; border: 1px solid #C8C49A; overflow: hidden; box-shadow: 0 4px 16px rgba(74,92,47,0.08);">
        
        <!-- Header -->
        <div style="background: #4A5C2F; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 400; letter-spacing: 1px;">CROCHUS</h1>
          <p style="color: #D4C98A; margin: 4px 0 0; font-size: 13px; letter-spacing: 0.5px;">Order Confirmation</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          <h2 style="font-size: 18px; margin-top: 0; color: #2C3A1A;">Thank You for Your Order, ${order.customer_name}! 🌿</h2>
          <p style="color: #6B7F4A; line-height: 1.6; margin-bottom: 24px;">
            We've received your order <strong>#${order.id}</strong> and are preparing it with love and care. Every item is handmade, making it uniquely yours!
          </p>

          <!-- Order Summary Box -->
          <div style="background: #FDFAF2; border: 1px solid #C8C49A; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 1.5px solid #C8C49A; text-align: left; color: #6B7F4A; font-size: 12px; text-transform: uppercase;">
                  <th style="padding-bottom: 8px;">Item</th>
                  <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                  <th style="padding-bottom: 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding-top: 16px; font-weight: 600; font-size: 15px; color: #2C3A1A;">Total Amount:</td>
                  <td style="padding-top: 16px; text-align: right; font-weight: bold; font-size: 18px; color: #4A5C2F;">₹${Number(order.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Shipping Details -->
          <div style="border-top: 1px dashed #C8C49A; padding-top: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #4A5C2F; margin: 0 0 12px;">Delivery Address</h3>
            <p style="margin: 0; color: #2C3A1A; font-size: 14px; line-height: 1.5;">
              <strong>${order.customer_name}</strong><br />
              ${order.address}<br />
              Pincode: ${order.pincode}<br />
              Phone: ${order.phone}
            </p>
            ${order.note ? `<p style="margin-top: 10px; font-size: 13px; color: #6B7F4A;"><strong>Note:</strong> ${order.note}</p>` : ''}
          </div>

          <div style="background: #F5F0E0; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #6B7F4A; text-align: center;">
            Need help with your order? Reply directly to this email or reach out to us on WhatsApp!
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #FDFAF2; border-top: 1px solid #E8E0CC; padding: 16px; text-align: center; font-size: 12px; color: #6B7F4A;">
          © Crochus • Handmade Crochet & Crafts
        </div>
      </div>
    </div>
  `;

  return sendMail({
    from: config.from,
    to: order.customer_email,
    subject: `Order Confirmation #${order.id} — Crochus`,
    html,
  });
}

async function sendAdminOrderNotificationEmail(order) {
  const config = await getSmtpConfig();
  const adminRecipient = config.contactEmail || config.receiver || config.user;

  if (!adminRecipient) {
    console.warn(`[MailService] No admin email receiver configured in Settings, skipping admin notification for order #${order.id}`);
    return null;
  }

  console.log(`[MailService] Dispatching Admin Order Notification for order #${order.id} to: ${adminRecipient}`);

  const itemsHtml = (order.items || []).map((item) => {
    const photo = item.product?.photos?.[0] ? `<img src="${item.product.photos[0]}" alt="${item.product.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; margin-right: 10px; vertical-align: middle;" />` : '';
    const code = item.product?.product_code ? `<code style="background: #eee; padding: 2px 5px; border-radius: 3px; font-size: 11px;">${item.product.product_code}</code>` : '<span style="color: #999; font-size: 11px;">No code</span>';
    const subtotal = (Number(item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN');
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; vertical-align: middle;">
          ${photo}
          <strong>${item.product?.name || 'Product'}</strong>
        </td>
        <td style="padding: 10px; vertical-align: middle; text-align: center;">${code}</td>
        <td style="padding: 10px; vertical-align: middle; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; vertical-align: middle; text-align: right; font-weight: bold;">₹${subtotal}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <div style="background-color: #f4f6f8; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e1e4e8; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: #2C3A1A; padding: 20px 24px; color: #ffffff;">
          <span style="font-size: 12px; background: #D4C98A; color: #2C3A1A; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">New Order Placed</span>
          <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 600;">Order #${order.id}</h1>
        </div>

        <div style="padding: 24px;">
          <!-- Customer Info -->
          <div style="background: #fdfaf2; border: 1px solid #c8c49a; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5C2F;">Customer Details</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #555; width: 140px;"><strong>Name:</strong></td>
                <td style="padding: 4px 0;">${order.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #555;"><strong>Email:</strong></td>
                <td style="padding: 4px 0;"><a href="mailto:${order.customer_email || ''}" style="color: #4A5C2F;">${order.customer_email || '—'}</a></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #555;"><strong>Phone:</strong></td>
                <td style="padding: 4px 0;"><a href="tel:${order.phone}" style="color: #4A5C2F;">${order.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #555; vertical-align: top;"><strong>Delivery Address:</strong></td>
                <td style="padding: 4px 0;">${order.address}<br /><strong>Pincode:</strong> ${order.pincode}</td>
              </tr>
              ${order.note ? `
              <tr>
                <td style="padding: 4px 0; color: #555; vertical-align: top;"><strong>Customer Note:</strong></td>
                <td style="padding: 4px 0; color: #c0392b;"><em>${order.note}</em></td>
              </tr>` : ''}
            </table>
          </div>

          <!-- Items Ordered -->
          <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #2C3A1A;">Ordered Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Product</th>
                <th style="padding-bottom: 8px; text-align: center;">Product Code</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding-top: 16px; font-weight: bold; font-size: 15px;">Total Order Amount:</td>
                <td style="padding-top: 16px; text-align: right; font-weight: bold; font-size: 18px; color: #27ae60;">₹${Number(order.total || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="border-top: 1px solid #e1e4e8; padding-top: 16px; text-align: right;">
            <span style="font-size: 12px; color: #888;">Manage this order from your Crochus Admin Dashboard.</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendMail({
    from: config.from,
    to: adminRecipient,
    subject: `🚨 New Order #${order.id} received — ₹${Number(order.total || 0).toLocaleString('en-IN')} from ${order.customer_name}`,
    html,
  });
}

async function sendOrderDeliveredEmail(order) {
  if (!order.customer_email) {
    console.warn(`[MailService] No customer email found for order #${order.id}, skipping delivered email.`);
    return null;
  }

  const config = await getSmtpConfig();
  const itemsHtml = (order.items || []).map((item) => {
    const photo = item.product?.photos?.[0] ? `<img src="${item.product.photos[0]}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #C8C49A; margin-right: 12px; vertical-align: middle;" />` : '';
    const code = item.product?.product_code ? `<span style="font-family: monospace; font-size: 11px; background: #E8E0CC; padding: 2px 6px; border-radius: 4px; color: #4A5C2F; margin-left: 6px;">${item.product.product_code}</span>` : '';
    const subtotal = (Number(item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN');
    return `
      <tr style="border-bottom: 1px solid #E8E0CC;">
        <td style="padding: 12px 0; vertical-align: middle;">
          ${photo}
          <span style="font-weight: 500; color: #2C3A1A;">${item.product?.name || 'Product'}</span>
          ${code}
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #6B7F4A; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #2C3A1A; vertical-align: middle;">₹${subtotal}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <div style="background-color: #F5F0E0; padding: 32px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2C3A1A;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 10px; border: 1px solid #C8C49A; overflow: hidden; box-shadow: 0 4px 16px rgba(74,92,47,0.08);">
        
        <!-- Header -->
        <div style="background: #4A5C2F; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 400; letter-spacing: 1px;">CROCHUS</h1>
          <div style="display: inline-block; margin-top: 8px; background: #E8F5E0; color: #4A5C2F; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;">
            ✓ Delivered
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          <h2 style="font-size: 20px; margin-top: 0; color: #2C3A1A;">Your Package Has Arrived! 🎉</h2>
          <p style="color: #6B7F4A; line-height: 1.6; margin-bottom: 20px;">
            Hi <strong>${order.customer_name}</strong>, your handmade order <strong>#${order.id}</strong> has been successfully delivered! We hope you love your new piece as much as we loved crafting it for you.
          </p>

          <!-- Delivery Confirmation Banner -->
          <div style="background: #E8F5E0; border: 1.5px solid #4A5C2F; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <span style="font-size: 24px;">📦 ✨</span>
            <p style="margin: 6px 0 0; color: #4A5C2F; font-weight: 600; font-size: 15px;">Order #${order.id} has been delivered</p>
            <p style="margin: 4px 0 0; color: #6B7F4A; font-size: 13px;">Delivered to: ${order.address}, ${order.pincode}</p>
          </div>

          <!-- Items Summary -->
          <div style="background: #FDFAF2; border: 1px solid #C8C49A; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #4A5C2F; margin: 0 0 12px;">Delivered Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 1.5px solid #C8C49A; text-align: left; color: #6B7F4A; font-size: 12px; text-transform: uppercase;">
                  <th style="padding-bottom: 8px;">Item</th>
                  <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                  <th style="padding-bottom: 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding-top: 14px; font-weight: 600; font-size: 14px; color: #2C3A1A;">Total Paid:</td>
                  <td style="padding-top: 14px; text-align: right; font-weight: bold; font-size: 16px; color: #4A5C2F;">₹${Number(order.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Feedback & Support Note -->
          <div style="background: #F5F0E0; border-radius: 6px; padding: 16px; font-size: 13px; color: #2C3A1A; line-height: 1.6; text-align: center;">
            <p style="margin: 0 0 8px; font-weight: 600;">How was your experience? 🌿</p>
            <p style="margin: 0; color: #6B7F4A; font-size: 12px;">
              Tag us in your photos or reach out if you have any questions or feedback. We'd love to see how you style your Crochus piece!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #FDFAF2; border-top: 1px solid #E8E0CC; padding: 16px; text-align: center; font-size: 12px; color: #6B7F4A;">
          © Crochus • Handmade Crochet & Crafts
        </div>
      </div>
    </div>
  `;

  return sendMail({
    from: config.from,
    to: order.customer_email,
    subject: `Your order #${order.id} has been delivered! 🎉 — Crochus`,
    html,
  });
}

module.exports = {
  sendOtpEmail,
  sendContactEmail,
  sendTestEmail,
  sendCustomerOrderEmail,
  sendAdminOrderNotificationEmail,
  sendOrderDeliveredEmail,
};


