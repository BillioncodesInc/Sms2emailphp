/**
 * SMTP Proxy Manager
 *
 * Manages proxy rotation for SMTP validation to protect IP reputation
 * Supports SOCKS5, SOCKS4, and HTTP proxies with authentication
 */

const proxyStorage = require('./proxyStorage');

class SMTPProxyManager {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.protocol = 'socks5'; // Default protocol
    this.isLoaded = false;
  }

  /**
   * Load proxies from disk storage
   * @returns {boolean} Success status
   */
  loadProxies() {
    try {
      const config = proxyStorage.loadConfig();

      if (!config || !config.proxies || config.proxies.length === 0) {
        console.log('⚠️  No proxies configured for SMTP validation');
        this.isLoaded = false;
        return false;
      }

      this.proxies = config.proxies;
      this.protocol = config.protocol || 'socks5';
      this.currentIndex = 0;
      this.isLoaded = true;

      console.log(`✅ Loaded ${this.proxies.length} proxies for SMTP validation (${this.protocol})`);
      return true;

    } catch (error) {
      console.error('❌ Failed to load proxies:', error.message);
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * Get next proxy in rotation (round-robin)
   * @returns {Object|null} Proxy configuration or null if no proxies
   */
  getNextProxy() {
    if (!this.isLoaded || this.proxies.length === 0) {
      return null;
    }

    const proxy = this.proxies[this.currentIndex];

    // Move to next proxy for next call (round-robin)
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

    return {
      ...proxy,
      protocol: this.protocol
    };
  }

  /**
   * Get random proxy (alternative to round-robin)
   * @returns {Object|null} Proxy configuration or null if no proxies
   */
  getRandomProxy() {
    if (!this.isLoaded || this.proxies.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    return {
      ...this.proxies[randomIndex],
      protocol: this.protocol
    };
  }

  /**
   * Get all proxies
   * @returns {Array} Array of proxy configurations
   */
  getAllProxies() {
    return this.proxies.map(proxy => ({
      ...proxy,
      protocol: this.protocol
    }));
  }

  /**
   * Get proxy count
   * @returns {number} Number of configured proxies
   */
  getProxyCount() {
    return this.proxies.length;
  }

  /**
   * Check if proxies are loaded and available
   * @returns {boolean} True if proxies available
   */
  hasProxies() {
    return this.isLoaded && this.proxies.length > 0;
  }

  /**
   * Format proxy for SOCKS connection
   * @param {Object} proxy - Proxy configuration
   * @returns {Object} Formatted proxy config for socks-proxy-agent
   */
  formatProxyForSocks(proxy) {
    if (!proxy) return null;

    const protocol = proxy.protocol || this.protocol;
    let proxyUrl = `${protocol}://`;

    // Add authentication if provided
    if (proxy.username && proxy.password) {
      proxyUrl += `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`;
    }

    proxyUrl += `${proxy.host}:${proxy.port}`;

    return {
      url: proxyUrl,
      host: proxy.host,
      port: parseInt(proxy.port),
      protocol: protocol,
      auth: proxy.username ? {
        username: proxy.username,
        password: proxy.password
      } : null
    };
  }

  /**
   * Reset rotation index (start from beginning)
   */
  resetRotation() {
    this.currentIndex = 0;
  }

  /**
   * Reload proxies from disk (useful if config changed)
   * @returns {boolean} Success status
   */
  reload() {
    console.log('🔄 Reloading proxy configuration...');
    return this.loadProxies();
  }

  /**
   * Get statistics about proxy usage
   * @returns {Object} Proxy statistics
   */
  getStats() {
    return {
      total: this.proxies.length,
      loaded: this.isLoaded,
      protocol: this.protocol,
      currentIndex: this.currentIndex
    };
  }
}

// Create singleton instance
const smtpProxyManager = new SMTPProxyManager();

module.exports = smtpProxyManager;
