const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { runFunction } = require('../config/db');
const { mapUserRow } = require('../lib/mappers');

exports.getProfile = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_get_customer_profile', [req.auth.sub]);
  const user = rows[0];

  if (!user) {
    throw new ApiError(404, 'Customer profile not found');
  }

  res.json(mapUserRow(user));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const fullName = String(req.body.full_name || '').trim();
  const mobile = String(req.body.mobile || '').trim();
  const address = String(req.body.address || '').trim();

  if (!fullName || !/^\d{10}$/.test(mobile)) {
    throw new ApiError(400, 'Please provide a valid full name and mobile number');
  }

  const rows = await runFunction('sp_update_customer_profile', [
    req.auth.sub,
    fullName,
    mobile,
    address,
  ]);

  res.json(mapUserRow(rows[0]));
});

