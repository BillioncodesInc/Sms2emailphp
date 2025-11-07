/**
 * SMTP Configuration Persistent Storage
 * Saves SMTP configs to disk so they survive server restarts
 * No environment variables needed!
 */

const fs = require('fs');
const path = require('path');
const secureStorage = require('./secureStorage');

// Storage file path - in backend/data directory
const STORAGE_DIR = path.join(__dirname, '../data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'smtp-config.json');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('✅ Created SMTP storage directory:', STORAGE_DIR);
  }
}

/**
 * Save SMTP configuration to disk
 * @param {Object} config - SMTP configuration object
 * @param {string} config.type - 'single' or 'bulk'
 * @param {Object} config.data - SMTP data (service, user, pass, etc.)
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
    console.log('✅ SMTP config saved to disk:', STORAGE_FILE);
    return true;
  } catch (error) {
    console.error('❌ Failed to save SMTP config:', error.message);
    return false;
  }
}

/**
 * Load SMTP configuration from disk
 * @returns {Object|null} Saved config or null if not found
 */
function loadConfig() {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      console.log('ℹ️  No saved SMTP config found (first run)');
      return null;
    }

    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    const raw = JSON.parse(data);
    const config = secureStorage.decrypt(raw);

    console.log('✅ SMTP config loaded from disk');
    console.log('   Type:', config.type);
    console.log('   Last Updated:', config.lastUpdated);

    return config;
  } catch (error) {
    console.error('❌ Failed to load SMTP config:', error.message);
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
      console.log('✅ SMTP config cleared');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to clear SMTP config:', error.message);
    return false;
  }
}

/**
 * Get config info (without exposing passwords)
 * @returns {Object|null} Safe config info
 */
function getConfigInfo() {
  try {
    const config = loadConfig();
    if (!config) return null;

    // Return safe info without passwords
    const info = {
      type: config.type,
      lastUpdated: config.lastUpdated,
      version: config.version
    };

    if (config.type === 'single' && config.data) {
      info.service = config.data.service;
      info.user = config.data.user;
      info.hasPassword = !!config.data.pass;
    } else if (config.type === 'bulk' && config.data) {
      info.service = config.data.service;
      info.accountCount = config.data.smtplist ? config.data.smtplist.split('\n').length : 0;
    }

    return info;
  } catch (error) {
    console.error('❌ Failed to get config info:', error.message);
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
