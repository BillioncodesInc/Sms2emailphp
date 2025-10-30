/**
 * Nodemailer Transporter Pool
 *
 * Manages a pool of reusable nodemailer transporters to improve performance
 * and reduce connection overhead. Supports proxy rotation and bulk SMTP configurations.
 */

const nodemailer = require('nodemailer');

class TransporterPool {
  constructor(options = {}) {
    this.pool = new Map(); // Map<poolKey, {transporter, lastUsed, messageCount}>
    this.maxPoolSize = options.maxPoolSize || 10;
    this.maxMessagesPerConnection = options.maxMessagesPerConnection || 100;
    this.idleTimeout = options.idleTimeout || 300000; // 5 minutes
    this.connectionTimeout = options.connectionTimeout || 10000; // 10 seconds (reduced from 30 for faster proxy failures)
    this.cleanupInterval = null;
    this.debugEnabled = options.debugEnabled || false;

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Create a unique pool key based on SMTP config and proxy
   * @param {Object} smtpConfig - SMTP configuration object
   * @param {Object|null} proxyConfig - Proxy configuration (optional)
   * @returns {string} - Unique pool key
   */
  createPoolKey(smtpConfig, proxyConfig = null) {
    const smtpUser = smtpConfig.auth?.user || 'default';
    const smtpHost = smtpConfig.host || smtpConfig.service || 'default';
    const proxyStr = proxyConfig ? this.buildProxyUrl(proxyConfig) : 'no-proxy';

    return `${smtpUser}@${smtpHost}:${proxyStr}`;
  }

  /**
   * Build proxy URL from proxy configuration
   * @param {Object} proxyConfig - Proxy configuration
   * @returns {string} - Proxy URL
   */
  buildProxyUrl(proxyConfig) {
    const scheme = proxyConfig.protocol &&
      (proxyConfig.protocol === 'socks5' || proxyConfig.protocol === 'socks4' || proxyConfig.protocol === 'socks')
      ? proxyConfig.protocol
      : 'http';

    const auth = (proxyConfig.username && proxyConfig.password)
      ? `${encodeURIComponent(proxyConfig.username)}:${encodeURIComponent(proxyConfig.password)}@`
      : '';

    return `${scheme}://${auth}${proxyConfig.host}:${proxyConfig.port}`;
  }

  /**
   * Get a transporter from the pool or create a new one
   * @param {Object} smtpConfig - SMTP transport configuration
   * @param {Object|null} proxyConfig - Optional proxy configuration
   * @returns {Object} - Nodemailer transporter
   */
  getTransporter(smtpConfig, proxyConfig = null) {
    const poolKey = this.createPoolKey(smtpConfig, proxyConfig);

    // Check if we have a valid transporter in the pool
    if (this.pool.has(poolKey)) {
      const poolEntry = this.pool.get(poolKey);

      // Check if transporter is still valid
      if (poolEntry.messageCount < this.maxMessagesPerConnection) {
        poolEntry.lastUsed = Date.now();
        poolEntry.messageCount++;

        if (this.debugEnabled) {
          console.log(`♻️  Reusing transporter: ${poolKey} (${poolEntry.messageCount}/${this.maxMessagesPerConnection})`);
        }

        return poolEntry.transporter;
      } else {
        // Transporter exceeded max messages, close and remove from pool
        if (this.debugEnabled) {
          console.log(`🔄 Transporter exceeded max messages, recreating: ${poolKey}`);
        }
        this.closeTransporter(poolKey);
      }
    }

    // Check pool size limit
    if (this.pool.size >= this.maxPoolSize) {
      // Remove oldest transporter
      this.removeOldestTransporter();
    }

    // Create new transporter with proxy if provided
    const config = { ...smtpConfig };
    if (proxyConfig) {
      config.proxy = this.buildProxyUrl(proxyConfig);
    }

    // Add connection timeout
    if (!config.connectionTimeout) {
      config.connectionTimeout = this.connectionTimeout;
    }

    // Add socket timeout (for hanging connections)
    if (!config.socketTimeout) {
      config.socketTimeout = this.connectionTimeout;
    }

    // Add greeting timeout (for slow SMTP handshakes)
    if (!config.greetingTimeout) {
      config.greetingTimeout = this.connectionTimeout;
    }

    // Enable connection pooling in nodemailer
    config.pool = true;
    config.maxConnections = 1; // Each pool entry handles 1 connection
    config.maxMessages = this.maxMessagesPerConnection;

    const transporter = nodemailer.createTransport(config);

    // Add to pool
    this.pool.set(poolKey, {
      transporter,
      lastUsed: Date.now(),
      messageCount: 1,
      config: smtpConfig,
      proxy: proxyConfig
    });

    if (this.debugEnabled) {
      console.log(`✨ Created new transporter: ${poolKey} (pool size: ${this.pool.size}/${this.maxPoolSize})`);
    }

    return transporter;
  }

  /**
   * Close a specific transporter and remove from pool
   * @param {string} poolKey - Pool key to remove
   */
  closeTransporter(poolKey) {
    if (this.pool.has(poolKey)) {
      const poolEntry = this.pool.get(poolKey);

      try {
        poolEntry.transporter.close();
      } catch (err) {
        if (this.debugEnabled) {
          console.error(`Error closing transporter ${poolKey}:`, err.message);
        }
      }

      this.pool.delete(poolKey);

      if (this.debugEnabled) {
        console.log(`🗑️  Closed transporter: ${poolKey}`);
      }
    }
  }

  /**
   * Remove the oldest (least recently used) transporter from pool
   */
  removeOldestTransporter() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.pool.entries()) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      if (this.debugEnabled) {
        console.log(`🧹 Removing oldest transporter to make room: ${oldestKey}`);
      }
      this.closeTransporter(oldestKey);
    }
  }

  /**
   * Clean up idle transporters that haven't been used for idleTimeout
   */
  cleanupIdleTransporters() {
    const now = Date.now();
    const keysToRemove = [];

    for (const [key, entry] of this.pool.entries()) {
      if (now - entry.lastUsed > this.idleTimeout) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      if (this.debugEnabled) {
        console.log(`⏰ Cleaning up idle transporter: ${key}`);
      }
      this.closeTransporter(key);
    }

    if (keysToRemove.length > 0 && this.debugEnabled) {
      console.log(`🧹 Cleaned up ${keysToRemove.length} idle transporter(s)`);
    }
  }

  /**
   * Start the cleanup interval to remove idle transporters
   */
  startCleanupInterval() {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleTransporters();
    }, 60000);
  }

  /**
   * Stop the cleanup interval
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Close all transporters and clear the pool
   */
  closeAll() {
    if (this.debugEnabled) {
      console.log(`🛑 Closing all ${this.pool.size} transporter(s)...`);
    }

    for (const [key, entry] of this.pool.entries()) {
      try {
        entry.transporter.close();
      } catch (err) {
        if (this.debugEnabled) {
          console.error(`Error closing transporter ${key}:`, err.message);
        }
      }
    }

    this.pool.clear();
    this.stopCleanupInterval();

    if (this.debugEnabled) {
      console.log('✅ All transporters closed');
    }
  }

  /**
   * Get pool statistics
   * @returns {Object} - Pool statistics
   */
  getStats() {
    const stats = {
      poolSize: this.pool.size,
      maxPoolSize: this.maxPoolSize,
      transporters: []
    };

    for (const [key, entry] of this.pool.entries()) {
      stats.transporters.push({
        key,
        messageCount: entry.messageCount,
        maxMessages: this.maxMessagesPerConnection,
        lastUsed: new Date(entry.lastUsed).toISOString(),
        idleTime: Math.round((Date.now() - entry.lastUsed) / 1000) + 's',
        hasProxy: !!entry.proxy
      });
    }

    return stats;
  }
}

// Create singleton instance with default options
let poolInstance = null;

/**
 * Initialize the transporter pool with custom options
 * @param {Object} options - Pool configuration options
 * @returns {TransporterPool} - Pool instance
 */
function initializePool(options = {}) {
  if (poolInstance) {
    poolInstance.closeAll();
  }

  poolInstance = new TransporterPool(options);
  return poolInstance;
}

/**
 * Get the current pool instance (creates default if not initialized)
 * @returns {TransporterPool} - Pool instance
 */
function getPool() {
  if (!poolInstance) {
    poolInstance = new TransporterPool();
  }
  return poolInstance;
}

module.exports = {
  TransporterPool,
  initializePool,
  getPool
};
