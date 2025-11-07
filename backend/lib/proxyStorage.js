/**
 * Proxy Configuration Persistent Storage
 * Saves proxy configs to disk so they survive server restarts
 */

const fs = require('fs');
const path = require('path');
const secureStorage = require('./secureStorage');

// Storage file path - in backend/data directory
const STORAGE_DIR = path.join(__dirname, '../data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'proxy-config.json');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('✅ Created proxy storage directory:', STORAGE_DIR);
  }
}

/**
 * Save proxy configuration to disk
 * @param {Object} config - Proxy configuration object
 * @param {Array} config.proxies - Array of proxy objects
 * @param {string} config.protocol - Protocol type (http, socks4, socks5)
 * @returns {boolean} Success status
 */
function saveConfig(config) {
  try {
    ensureStorageDir();

    const dataToSave = {
      ...config,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    const payload = secureStorage.encrypt(dataToSave);

    fs.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf8');
    console.log('✅ Proxy config saved to disk:', STORAGE_FILE);
    return true;
  } catch (error) {
    console.error('❌ Failed to save proxy config:', error.message);
    return false;
  }
}

/**
 * Load proxy configuration from disk
 * @returns {Object|null} Saved config or null if not found
 */
function loadConfig() {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      console.log('ℹ️  No saved proxy config found (first run)');
      return null;
    }

    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    const raw = JSON.parse(data);
    const config = secureStorage.decrypt(raw);

    console.log('✅ Proxy config loaded from disk');
    console.log('   Proxy Count:', config.proxies ? config.proxies.length : 0);
    console.log('   Protocol:', config.protocol);
    console.log('   Last Updated:', config.lastUpdated);

    return config;
  } catch (error) {
    console.error('❌ Failed to load proxy config:', error.message);
    return null;
  }
}

/**
 * Check if saved config exists
 * @returns {boolean}
 */
function hasConfig() {
  return fs.existsSync(STORAGE_FILE);
}

/**
 * Clear saved configuration (useful for testing or reset)
 * @returns {boolean} Success status
 */
function clearConfig() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
      console.log('✅ Proxy config cleared');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to clear proxy config:', error.message);
    return false;
  }
}

/**
 * Get config info (without exposing sensitive data)
 * @returns {Object|null} Safe config info
 */
function getConfigInfo() {
  try {
    const config = loadConfig();
    if (!config) return null;

    return {
      proxyCount: config.proxies ? config.proxies.length : 0,
      protocol: config.protocol,
      lastUpdated: config.lastUpdated,
      version: config.version
    };
  } catch (error) {
    console.error('❌ Failed to get proxy config info:', error.message);
    return null;
  }
}

module.exports = {
  saveConfig,
  loadConfig,
  hasConfig,
  clearConfig,
  getConfigInfo,
  STORAGE_FILE
};
