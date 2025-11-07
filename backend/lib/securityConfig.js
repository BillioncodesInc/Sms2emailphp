'use strict';

/**
 * Security configuration storage.
 * Handles API key management, rate limiting options, and TLS policy.
 * All values are persisted to disk (with optional encryption via CONFIG_SECRET).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const secureStorage = require('./secureStorage');

const STORAGE_DIR = path.join(__dirname, '../data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'security-config.json');

const DEFAULT_RATE_LIMIT = {
  enabled: false,
  windowMs: 15 * 60 * 1000,
  max: 1000
};

const DEFAULT_TLS_POLICY = {
  allowInvalidCertificates: process.env.SMTP_ALLOW_INVALID_CERTS === 'true',
  minVersion: process.env.SMTP_MIN_TLS_VERSION || 'TLSv1.2'
};

const DEFAULT_CONFIG = {
  apiKeyHash: null,
  apiKeyHint: null,
  apiKeyHeader: 'x-api-key',
  rateLimit: { ...DEFAULT_RATE_LIMIT },
  tls: { ...DEFAULT_TLS_POLICY },
  updatedAt: null
};

let cachedConfig = null;
const subscribers = new Set();

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDeep(target, updates) {
  const result = Array.isArray(target) ? [...target] : { ...target };

  Object.entries(updates || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeDeep(result[key], value);
    } else {
      result[key] = value;
    }
  });

  return result;
}

function loadConfigFromDisk() {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return clone(DEFAULT_CONFIG);
    }

    const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const decrypted = secureStorage.decrypt(parsed);

    const config = mergeDeep(DEFAULT_CONFIG, decrypted || {});
    config.rateLimit = mergeDeep(DEFAULT_RATE_LIMIT, config.rateLimit || {});
    config.tls = mergeDeep(DEFAULT_TLS_POLICY, config.tls || {});

    return config;
  } catch (error) {
    console.error('❌ Failed to load security config:', error.message);
    return clone(DEFAULT_CONFIG);
  }
}

function saveConfigToDisk(config) {
  try {
    ensureStorageDir();
    const payload = secureStorage.encrypt(config);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf8');
    cachedConfig = config;
    notifySubscribers();
    return true;
  } catch (error) {
    console.error('❌ Failed to save security config:', error.message);
    return false;
  }
}

function getConfig() {
  if (!cachedConfig) {
    cachedConfig = loadConfigFromDisk();
  }
  return clone(cachedConfig);
}

function updateConfig(partial = {}) {
  const current = getConfig();
  const next = mergeDeep(current, partial);
  next.updatedAt = new Date().toISOString();
  saveConfigToDisk(next);
  return getConfig();
}

function setApiKey(apiKey) {
  const current = getConfig();

  const trimmedInput = String(apiKey ?? '').trim();

  if (!trimmedInput) {
    current.apiKeyHash = null;
    current.apiKeyHint = null;
    current.updatedAt = new Date().toISOString();
    saveConfigToDisk(current);
    return getConfig();
  }

  const hashHex = crypto.createHash('sha256').update(trimmedInput, 'utf8').digest('hex');
  const hint = trimmedInput.length >= 4 ? trimmedInput.slice(-4) : trimmedInput;

  current.apiKeyHash = hashHex;
  current.apiKeyHint = hint;
  current.updatedAt = new Date().toISOString();
  saveConfigToDisk(current);
  return getConfig();
}

function verifyApiKey(candidate) {
  const config = cachedConfig || getConfig();
  if (!config.apiKeyHash) {
    return false;
  }
  if (!candidate) {
    return false;
  }
  const candidateHash = crypto.createHash('sha256').update(String(candidate).trim(), 'utf8').digest('hex');
  try {
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    const storedBuffer = Buffer.from(config.apiKeyHash, 'hex');
    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
  } catch (error) {
    console.error('Failed to verify API key:', error.message);
    return false;
  }
}

function isApiKeyConfigured() {
  const config = cachedConfig || getConfig();
  return Boolean(config.apiKeyHash);
}

function getApiKeyHeader() {
  const config = cachedConfig || getConfig();
  return config.apiKeyHeader || 'x-api-key';
}

function getRateLimitSettings() {
  const config = cachedConfig || getConfig();
  return clone(config.rateLimit || DEFAULT_RATE_LIMIT);
}

function getTlsPolicy() {
  const config = cachedConfig || getConfig();
  const policy = config.tls || DEFAULT_TLS_POLICY;
  return {
    allowInvalidCertificates: Boolean(policy.allowInvalidCertificates),
    minVersion: policy.minVersion || 'TLSv1.2'
  };
}

function subscribe(listener) {
  if (typeof listener === 'function') {
    subscribers.add(listener);
  }
  return () => subscribers.delete(listener);
}

function notifySubscribers() {
  const snapshot = getConfig();
  subscribers.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Security config subscriber error:', error.message);
    }
  });
}

module.exports = {
  getConfig,
  updateConfig,
  setApiKey,
  verifyApiKey,
  isApiKeyConfigured,
  getApiKeyHeader,
  getRateLimitSettings,
  getTlsPolicy,
  subscribe
};
