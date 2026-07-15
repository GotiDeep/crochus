const bcrypt = require('bcryptjs');
const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { runFunction } = require('../config/db');
const { signCustomerToken } = require('../lib/auth');
const { generateOtp } = require('../lib/otp');
const { mapUserRow } = require('../lib/mappers');
const { sendOtpEmail } = require('../services/mailService');

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

exports.register = asyncHandler(async (req, res) => {
  const fullName = String(req.body.full_name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const mobile = String(req.body.mobile || '').trim();
  const password = String(req.body.password || '');

  if (!fullName || !validateEmail(email) || !/^\d{10}$/.test(mobile) || password.length < 6) {
    throw new ApiError(400, 'Please provide a valid name, email, mobile number, and password');
  }

  const existingUsers = await runFunction('sp_get_customer_auth', [email]);
  if (existingUsers[0]) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await runFunction('sp_create_auth_otp', [
    'register',
    email,
    otp,
    expiresAt,
    fullName,
    mobile,
    passwordHash,
  ]);

  const mailResult = await sendOtpEmail({ email, otp, purpose: 'register' });

  res.status(201).json({
    message: 'OTP sent successfully',
    dev_otp: mailResult.dev_otp,
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();

  if (!validateEmail(email) || !/^\d{6}$/.test(otp)) {
    throw new ApiError(400, 'A valid email and 6-digit OTP are required');
  }

  const rows = await runFunction('sp_verify_registration_otp', [email, otp]);
  const user = rows[0];

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  res.json({
    token: signCustomerToken(user),
    user: mapUserRow(user),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!validateEmail(email) || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const rows = await runFunction('sp_get_customer_auth', [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({
    token: signCustomerToken(user),
    user: mapUserRow(user),
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!validateEmail(email)) {
    throw new ApiError(400, 'A valid email is required');
  }

  const existingUsers = await runFunction('sp_get_customer_auth', [email]);
  if (!existingUsers[0]) {
    throw new ApiError(404, 'Customer account not found');
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await runFunction('sp_create_password_reset_otp', [email, otp, expiresAt]);

  const mailResult = await sendOtpEmail({ email, otp, purpose: 'reset_password' });

  res.json({
    message: 'Password reset OTP sent successfully',
    dev_otp: mailResult.dev_otp,
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const newPassword = String(req.body.new_password || '');

  if (!validateEmail(email) || !/^\d{6}$/.test(otp) || newPassword.length < 6) {
    throw new ApiError(400, 'A valid email, OTP, and password are required');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await runFunction('sp_reset_customer_password', [email, otp, passwordHash]);

  res.json({
    message: 'Password reset successfully',
  });
});

