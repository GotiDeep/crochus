const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('./apiError');

function encryptionKey() {
  const key = Buffer.from(env.settingsEncryptionKey, 'base64');
  if (key.length !== 32) {
    throw new ApiError(503, 'Server encryption is not configured');
  }
  return key;
}

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${encrypted.toString('base64')}`;
}

function decrypt(value) {
  const [ivValue, tagValue, encryptedValue] = String(value || '').split(':');
  if (!ivValue || !tagValue || !encryptedValue) throw new Error('Invalid encrypted SMTP password');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivValue, 'base64'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'base64')), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
