const { Pool } = require('pg');
const env = require('./env');
const ApiError = require('../lib/apiError');

const pool = new Pool(
  env.databaseUrl
    ? {
        connectionString: env.databaseUrl,
        ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: env.pgHost,
        port: env.pgPort,
        database: env.pgDatabase,
        user: env.pgUser,
        password: env.pgPassword,
        ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
      }
);

pool.on('error', (error) => {
  console.error('PostgreSQL pool error:', error);
});

function buildFunctionQuery(functionName, params) {
  const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');
  return `SELECT * FROM ${functionName}(${placeholders})`;
}

function mapDatabaseError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)) {
    return new ApiError(503, 'Database connection failed');
  }

  if (error.code === '23505') {
    return new ApiError(409, 'A record with the same value already exists');
  }

  if (error.code === '23503') {
    return new ApiError(400, 'A referenced record could not be found');
  }

  if (['23502', '23514', '22P02'].includes(error.code)) {
    return new ApiError(400, error.message);
  }

  if (error.code === 'P0001') {
    const message = error.message || 'Database operation failed';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('already exists')) {
      return new ApiError(409, message);
    }

    if (lowerMessage.includes('not found')) {
      return new ApiError(404, message);
    }

    if (lowerMessage.includes('cannot delete')) {
      return new ApiError(409, message);
    }

    return new ApiError(400, message);
  }

  return error;
}

async function runFunction(functionName, params = []) {
  try {
    const query = buildFunctionQuery(functionName, params);
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  runFunction,
  closePool,
};
