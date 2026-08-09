const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function withFallback(value, fallback) {
  return value === undefined ? fallback : value;
}

const publicAppUrl = process.env.PUBLIC_APP_URL || 'http://localhost:4200';

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  publicServerUrl: process.env.PUBLIC_SERVER_URL || 'http://localhost:3000',
  publicAppUrl,
  uploadDir: path.join(process.cwd(), 'server', 'uploads'),
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSsl: asBoolean(process.env.DATABASE_SSL, false),
  pgHost: process.env.PGHOST || 'localhost',
  pgPort: Number(process.env.PGPORT || 5432),
  pgDatabase: process.env.PGDATABASE || 'crochus',
  pgUser: process.env.PGUSER || 'postgres',
  pgPassword: withFallback(process.env.PGPASSWORD, 'postgres'),
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || '',
  adminJwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '7d',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: asBoolean(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'Crochus <no-reply@crochus.local>',
  contactReceiverEmail: process.env.CONTACT_RECEIVER_EMAIL || 'hello@crochus.com',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  corsOrigins: Array.from(
    new Set(
      [
        publicAppUrl,
        'http://localhost:4200',
        'http://127.0.0.1:4200',
      ].filter(Boolean)
    )
  ),
};
