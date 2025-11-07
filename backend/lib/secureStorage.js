'use strict';

/**
 * Shared helper for encrypting configuration files at rest.
 * Encryption is enabled when CONFIG_SECRET is provided.
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SECRET = process.env.CONFIG_SECRET ? String(process.env.CONFIG_SECRET) : null;

function hasSecret() {
  return Boolean(SECRET && SECRET.length >= 16);
}

function deriveKey() {
  return crypto.createHash('sha256').update(SECRET, 'utf8').digest();
}

function encrypt(plainObject) {
  if (!hasSecret()) {
    return plainObject;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(), iv);
  const json = Buffer.from(JSON.stringify(plainObject), 'utf8');
  const encrypted = Buffer.concat([cipher.update(json), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: true,
    algorithm: ALGORITHM,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    payload: encrypted.toString('base64'),
    version: 1
  };
}

function decrypt(storedObject) {
  if (!storedObject || typeof storedObject !== 'object') {
    return storedObject;
  }

  if (storedObject.encrypted !== true) {
    return storedObject;
  }

  if (!hasSecret()) {
    throw new Error('Encrypted configuration detected but CONFIG_SECRET is not set');
  }

  if (storedObject.algorithm !== ALGORITHM) {
    throw new Error(`Unsupported encryption algorithm: ${storedObject.algorithm}`);
  }

  const iv = Buffer.from(storedObject.iv, 'base64');
  const tag = Buffer.from(storedObject.tag, 'base64');
  const payload = Buffer.from(storedObject.payload, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(), iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = {
  encrypt,
  decrypt,
  hasSecret
};
