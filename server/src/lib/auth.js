const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signCustomerToken(user) {
  const secret = env.jwtSecret || 'crochus_default_cust_sec_key_32bytes';
  return jwt.sign(
    {
      sub: user.id,
      role: 'customer',
      email: user.email,
    },
    secret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function signAdminToken() {
  const secret = env.adminJwtSecret || env.jwtSecret || 'crochus_default_admin_sec_key_32bytes';
  return jwt.sign(
    {
      sub: 'admin',
      role: 'admin',
    },
    secret,
    { expiresIn: env.adminJwtExpiresIn }
  );
}

function verifyCustomerToken(token) {
  const secret = env.jwtSecret || 'crochus_default_cust_sec_key_32bytes';
  return jwt.verify(token, secret);
}

function verifyAdminToken(token) {
  const secret = env.adminJwtSecret || env.jwtSecret || 'crochus_default_admin_sec_key_32bytes';
  return jwt.verify(token, secret);
}

module.exports = {
  signCustomerToken,
  signAdminToken,
  verifyCustomerToken,
  verifyAdminToken,
};

