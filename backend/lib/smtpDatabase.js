/**
 * SMTP Auto-Configuration Database
 *
 * Loads and manages the 893+ domain SMTP configurations from autoconfigs_enriched.txt
 * Provides auto-detection of SMTP settings based on email domain
 *
 * Integrates with existing SMTP infrastructure (smtpStorage.js, text.js)
 */

const fs = require('fs');
const path = require('path');

class SMTPDatabase {
  constructor() {
    this.database = new Map(); // domain -> { servers: [{host, port}], loginTemplate }
    this.loaded = false;
    this.jsonDbPath = path.join(__dirname, '../data/smtp_database.json');
    this.textFilePath = path.join(__dirname, '../../autoconfigs_enriched.txt');
  }

  /**
   * Load SMTP configurations from JSON database (preferred) or text file (fallback)
   * JSON Format: Parsed and optimized database from parseAutoconfigs.js
   * Text Format: domain;smtp_host:smtp_port,smtp_host:smtp_port;login_template
   */
  load() {
    try {
      // Try loading from JSON database first (faster)
      if (fs.existsSync(this.jsonDbPath)) {
        return this.loadFromJson();
      }

      // Fallback to text file
      console.log('⚠️  JSON database not found, parsing text file...');
      return this.loadFromTextFile();

    } catch (error) {
      console.error('❌ Failed to load SMTP database:', error.message);
      return false;
    }
  }

  /**
   * Load from pre-parsed JSON database (fast)
   */
  loadFromJson() {
    try {
      const content = fs.readFileSync(this.jsonDbPath, 'utf-8');
      const data = JSON.parse(content);

      let loaded = 0;

      for (const [domain, config] of Object.entries(data.domains)) {
        // Convert to internal format
        const servers = config.servers.map(server => ({
          host: server.host,
          port: server.port,
          ssl: server.protocol === 'SSL',
          starttls: server.protocol === 'TLS',
          protocol: server.protocol
        }));

        this.database.set(domain.toLowerCase(), {
          domain,
          servers,
          loginTemplate: config.loginTemplate,
          source: 'json_database',
          supportsSSL: config.supportsSSL,
          supportsTLS: config.supportsTLS
        });

        loaded++;
      }

      this.loaded = true;
      console.log(`✅ SMTP Database loaded from JSON: ${loaded} domains`);
      return true;

    } catch (error) {
      console.error('❌ Failed to load JSON database:', error.message);
      return false;
    }
  }

  /**
   * Load from text file (fallback, slower)
   */
  loadFromTextFile() {
    try {
      if (!fs.existsSync(this.textFilePath)) {
        console.warn('⚠️  SMTP database text file not found:', this.textFilePath);
        return false;
      }

      const content = fs.readFileSync(this.textFilePath, 'utf-8');
      const lines = content.split('\n');

      let parsed = 0;
      let skipped = 0;

      for (const line of lines) {
        // Skip header lines and empty lines
        if (!line.trim() || line.startsWith('fetched from:') || line.startsWith('domain;')) {
          continue;
        }

        const parts = line.trim().split(';');
        if (parts.length !== 3) {
          skipped++;
          continue;
        }

        const [domain, serversStr, loginTemplate] = parts;

        // Parse multiple SMTP servers (comma-separated)
        const servers = serversStr.split(',').map(server => {
          const [host, port] = server.trim().split(':');
          return {
            host: host.trim(),
            port: parseInt(port) || 587,
            ssl: parseInt(port) === 465,
            starttls: parseInt(port) === 587
          };
        }).filter(s => s.host); // Filter out invalid entries

        if (servers.length === 0) {
          skipped++;
          continue;
        }

        this.database.set(domain.toLowerCase(), {
          domain,
          servers,
          loginTemplate: loginTemplate.trim(),
          source: 'autoconfigs_text'
        });

        parsed++;
      }

      this.loaded = true;
      console.log(`✅ SMTP Database loaded from text: ${parsed} domains (skipped: ${skipped})`);
      return true;

    } catch (error) {
      console.error('❌ Failed to load text database:', error.message);
      return false;
    }
  }

  /**
   * Get SMTP configuration for a domain
   * @param {string} domain - Email domain (e.g., "gmail.com")
   * @returns {Object|null} SMTP configuration or null
   */
  lookup(domain) {
    if (!this.loaded) {
      this.load();
    }

    return this.database.get(domain.toLowerCase()) || null;
  }

  /**
   * Get SMTP configuration from full email address
   * @param {string} email - Full email address (e.g., "user@gmail.com")
   * @returns {Object|null} SMTP configuration or null
   */
  lookupByEmail(email) {
    const domain = this.extractDomain(email);
    if (!domain) return null;

    return this.lookup(domain);
  }

  /**
   * Get SMTP login username from template
   * @param {string} email - Full email address
   * @param {string} template - Login template (%EMAILADDRESS%, %EMAILLOCALPART%, %EMAILDOMAIN%)
   * @returns {string} Formatted login username
   */
  formatLogin(email, template) {
    const [localPart, domain] = email.split('@');

    return template
      .replace('%EMAILADDRESS%', email)
      .replace('%EMAILLOCALPART%', localPart)
      .replace('%EMAILDOMAIN%', domain);
  }

  /**
   * Extract domain from email address
   * @param {string} email - Email address
   * @returns {string|null} Domain or null
   */
  extractDomain(email) {
    const match = email.match(/@([a-z0-9.-]+\.[a-z]{2,})$/i);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Search database by partial domain name
   * @param {string} query - Search query
   * @param {number} limit - Max results (default: 10)
   * @returns {Array} Array of matching domains
   */
  search(query, limit = 10) {
    if (!this.loaded) {
      this.load();
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [domain, config] of this.database) {
      if (domain.includes(lowerQuery)) {
        results.push({
          domain,
          ...config
        });

        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * Get statistics about the database
   * @returns {Object} Database statistics
   */
  getStats() {
    if (!this.loaded) {
      this.load();
    }

    const stats = {
      totalDomains: this.database.size,
      totalServers: 0,
      uniqueHosts: new Set(),
      ports: new Map(),
      loginTemplates: new Map()
    };

    for (const config of this.database.values()) {
      stats.totalServers += config.servers.length;

      for (const server of config.servers) {
        stats.uniqueHosts.add(server.host);
        stats.ports.set(server.port, (stats.ports.get(server.port) || 0) + 1);
      }

      stats.loginTemplates.set(
        config.loginTemplate,
        (stats.loginTemplates.get(config.loginTemplate) || 0) + 1
      );
    }

    return {
      totalDomains: stats.totalDomains,
      totalServers: stats.totalServers,
      uniqueHosts: stats.uniqueHosts.size,
      ports: Object.fromEntries(stats.ports),
      loginTemplates: Object.fromEntries(stats.loginTemplates)
    };
  }

  /**
   * Get all popular domains (common email providers)
   * @returns {Array} List of popular domains with configs
   */
  getPopularDomains() {
    const popular = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'aol.com', 'icloud.com', 'live.com', 'mail.com',
      'protonmail.com', 'yandex.com', 'mail.ru', 'zoho.com'
    ];

    return popular
      .map(domain => ({
        domain,
        config: this.lookup(domain)
      }))
      .filter(item => item.config !== null);
  }

  /**
   * Check if domain exists in database
   * @param {string} domain - Domain to check
   * @returns {boolean} True if exists
   */
  has(domain) {
    if (!this.loaded) {
      this.load();
    }

    return this.database.has(domain.toLowerCase());
  }

  /**
   * Get primary SMTP server for domain (first in list, usually the best)
   * @param {string} domain - Domain
   * @returns {Object|null} Primary server config
   */
  getPrimaryServer(domain) {
    const config = this.lookup(domain);
    if (!config || config.servers.length === 0) return null;

    return config.servers[0];
  }

  /**
   * Get all fallback servers for domain (all except primary)
   * @param {string} domain - Domain
   * @returns {Array} Fallback servers
   */
  getFallbackServers(domain) {
    const config = this.lookup(domain);
    if (!config || config.servers.length <= 1) return [];

    return config.servers.slice(1);
  }

  /**
   * Convert database config to format compatible with existing text.js module
   * @param {string} email - Email address
   * @returns {Object|null} Config in text.js format { service, host, port, secureConnection, user, pass }
   */
  toTextJsFormat(email) {
    const config = this.lookupByEmail(email);
    if (!config) return null;

    const primaryServer = config.servers[0];
    const user = this.formatLogin(email, config.loginTemplate);

    return {
      service: 'none', // Use custom SMTP (not Gmail/Yahoo service)
      host: primaryServer.host,
      port: primaryServer.port,
      secureConnection: primaryServer.ssl,
      user: user,
      // pass: will be provided by user
      source: 'autoconfig_database'
    };
  }
}

// Create singleton instance
const smtpDatabase = new SMTPDatabase();

// Auto-load on module import
smtpDatabase.load();

module.exports = smtpDatabase;
