const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { runFunction } = require('../config/db');
const { sendContactEmail } = require('../services/mailService');

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

exports.submitContactMessage = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();

  if (!name || !validateEmail(email) || !message) {
    throw new ApiError(400, 'Please provide a valid name, email, and message');
  }

  await runFunction('sp_create_contact_message', [name, email, subject || null, message]);
  await sendContactEmail({ name, email, subject, message });

  res.status(201).json({
    message: 'Message sent successfully',
  });
});

