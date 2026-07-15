const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signCustomerToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: 'customer',
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function signAdminToken() {
  return jwt.sign(
    {
      sub: 'admin',
      role: 'admin',
    },
    env.adminJwtSecret,
    { expiresIn: env.adminJwtExpiresIn }
  );
}

function verifyCustomerToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function verifyAdminToken(token) {
  return jwt.verify(token, env.adminJwtSecret);
}

module.exports = {
  signCustomerToken,
  signAdminToken,
  verifyCustomerToken,
  verifyAdminToken,
};

