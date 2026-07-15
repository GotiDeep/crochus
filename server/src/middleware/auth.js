const ApiError = require('../lib/apiError');
const { verifyAdminToken, verifyCustomerToken } = require('../lib/auth');

function getBearerToken(req) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
}

function requireCustomerAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    req.auth = verifyCustomerToken(token);
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

function requireAdminAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return next(new ApiError(401, 'Admin authentication required'));
  }

  try {
    req.auth = verifyAdminToken(token);
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired admin token'));
  }
}

module.exports = {
  requireCustomerAuth,
  requireAdminAuth,
};

