const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a string formatted as: iv:authTag:encryptedContent (all in hex)
 */
function encrypt(text) {
  const keyHex = process.env.CERTIFICADO_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('CERTIFICADO_ENCRYPTION_KEY is not defined in environment variables');
  }

  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string previously encrypted with the encrypt function.
 */
function decrypt(encryptedText) {
  const keyHex = process.env.CERTIFICADO_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('CERTIFICADO_ENCRYPTION_KEY is not defined in environment variables');
  }

  const [ivHex, authTagHex, encryptedContent] = encryptedText.split(':');
  if (!ivHex || !authTagHex || !encryptedContent) {
    throw new Error('Invalid encrypted text format');
  }

  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
