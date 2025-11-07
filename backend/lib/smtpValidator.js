/**
 * SMTP Credential Validator
 *
 * Tests SMTP credentials by attempting actual connection and authentication
 * Supports multiple ports, SSL/TLS, and fallback servers
 */

const nodemailer = require('nodemailer');
const securityConfig = require('./securityConfig');

function allowInvalidCertificates() {
  return securityConfig.getTlsPolicy().allowInvalidCertificates;
}

function minTlsVersion() {
  return securityConfig.getTlsPolicy().minVersion || 'TLSv1.2';
}

class SMTPValidator {
  /**
   * Test SMTP credentials with a single server
   * @param {Object} config - SMTP config {host, port, user, pass, timeout}
   * @returns {Promise<Object>} Validation result {valid, error, connectionTime}
   */
  async testCredentials(config) {
    const result = {
      valid: false,
      error: null,
      connectionTime: 0,
      host: config.host,
      port: config.port
    };

    const startTime = Date.now();

    try {
      // Determine if we should use SSL based on port
      const secure = config.port === 465;
      const requireTLS = config.port === 587;

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: secure, // true for 465, false for other ports
        auth: {
          user: config.user,
          pass: config.pass
        },
        tls: {
          rejectUnauthorized: !allowInvalidCertificates(),
          minVersion: minTlsVersion()
        },
        requireTLS: requireTLS, // Force STARTTLS for port 587
        connectionTimeout: config.timeout || 10000,
        greetingTimeout: config.timeout || 10000,
        socketTimeout: config.timeout || 10000,
        logger: false, // Disable logging
        debug: false
      });

      // Verify connection and authentication
      await transporter.verify();

      result.valid = true;
      result.connectionTime = Date.now() - startTime;

      // Close connection immediately
      transporter.close();

    } catch (error) {
      result.error = this.categorizeError(error);
      result.connectionTime = Date.now() - startTime;
      result.rawError = error.message;
    }

    return result;
  }

  /**
   * Categorize SMTP errors into user-friendly messages
   * @param {Error} error - Error object
   * @returns {string} Categorized error message
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('invalid login') ||
        message.includes('authentication failed') ||
        message.includes('535') ||
        message.includes('bad username') ||
        message.includes('invalid credentials')) {
      return 'Invalid credentials';
    }

    // Connection errors
    if (message.includes('timeout') ||
        message.includes('timed out')) {
      return 'Connection timeout';
    }

    if (message.includes('enotfound') ||
        message.includes('getaddrinfo') ||
        message.includes('not found')) {
      return 'Server not found';
    }

    if (message.includes('econnrefused') ||
        message.includes('connection refused')) {
      return 'Connection refused';
    }

    if (message.includes('econnreset') ||
        message.includes('connection reset')) {
      return 'Connection reset';
    }

    // SSL/TLS errors
    if (message.includes('certificate') ||
        message.includes('ssl') ||
        message.includes('tls')) {
      return 'SSL/TLS error';
    }

    // Network errors
    if (message.includes('enetunreach') ||
        message.includes('network')) {
      return 'Network unreachable';
    }

    // Rate limiting
    if (message.includes('too many') ||
        message.includes('rate limit') ||
        message.includes('421')) {
      return 'Rate limited';
    }

    // Account issues
    if (message.includes('account') ||
        message.includes('disabled') ||
        message.includes('suspended')) {
      return 'Account disabled or suspended';
    }

    // Default: return first line of error
    return error.message.split('\n')[0].substring(0, 100);
  }

  /**
   * Test credentials with multiple fallback servers
   * Tries each server until one succeeds or all fail
   * @param {Array} servers - Array of server configs [{host, port}]
   * @param {string} user - Username
   * @param {string} pass - Password
   * @param {number} timeout - Connection timeout (ms)
   * @returns {Promise<Object>} First successful result or last error
   */
  async testWithFallbacks(servers, user, pass, timeout = 10000) {
    const results = [];
    let successResult = null;

    for (const server of servers) {
      const result = await this.testCredentials({
        host: server.host,
        port: server.port,
        user,
        pass,
        timeout
      });

      results.push(result);

      if (result.valid) {
        successResult = result;
        break; // Stop on first success
      }
    }

    if (successResult) {
      return {
        ...successResult,
        attempts: results.length,
        allResults: results
      };
    }

    // All failed - return summary
    return {
      valid: false,
      error: 'All servers failed',
      attempts: results.length,
      allResults: results,
      lastError: results[results.length - 1].error
    };
  }

  /**
   * Test credentials with common port variations
   * Tries ports 587, 465, 25, 2525 in order
   * @param {string} host - SMTP host
   * @param {string} user - Username
   * @param {string} pass - Password
   * @param {number} timeout - Connection timeout (ms)
   * @returns {Promise<Object>} First successful result or all errors
   */
  async testCommonPorts(host, user, pass, timeout = 10000) {
    const ports = [587, 465, 25, 2525];
    const servers = ports.map(port => ({ host, port }));

    return this.testWithFallbacks(servers, user, pass, timeout);
  }

  /**
   * Quick validation check (faster but less reliable)
   * Only attempts connection without full authentication
   * @param {Object} config - SMTP config
   * @returns {Promise<Object>} Quick validation result
   */
  async quickTest(config) {
    const result = {
      reachable: false,
      error: null,
      connectionTime: 0
    };

    const startTime = Date.now();

    try {
      const secure = config.port === 465;

      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: secure,
        connectionTimeout: 5000, // Shorter timeout
        greetingTimeout: 5000,
        logger: false,
        debug: false
      });

      // Just verify connection (no auth)
      await transporter.verify();

      result.reachable = true;
      result.connectionTime = Date.now() - startTime;

      transporter.close();

    } catch (error) {
      // Connection failed but that's okay for quick test
      result.error = this.categorizeError(error);
      result.connectionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Batch test multiple credentials in parallel (with concurrency limit)
   * @param {Array} credentials - Array of {host, port, user, pass}
   * @param {number} concurrency - Max parallel tests
   * @returns {Promise<Array>} Array of results
   */
  async batchTest(credentials, concurrency = 5) {
    const results = [];
    const queue = [...credentials];
    let activeTests = 0;

    return new Promise((resolve) => {
      const testNext = async () => {
        if (queue.length === 0 && activeTests === 0) {
          resolve(results);
          return;
        }

        if (queue.length === 0 || activeTests >= concurrency) {
          return;
        }

        const cred = queue.shift();
        activeTests++;

        const result = await this.testCredentials(cred);
        results.push({
          ...cred,
          ...result
        });

        activeTests--;
        testNext();
      };

      // Start workers
      for (let i = 0; i < concurrency; i++) {
        testNext();
      }
    });
  }

  /**
   * Validate SMTP config structure
   * @param {Object} config - Config to validate
   * @returns {Object} Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.host || typeof config.host !== 'string') {
      errors.push('Missing or invalid host');
    }

    if (!config.port || typeof config.port !== 'number') {
      errors.push('Missing or invalid port');
    }

    if (!config.user || typeof config.user !== 'string') {
      errors.push('Missing or invalid username');
    }

    if (!config.pass || typeof config.pass !== 'string') {
      errors.push('Missing or invalid password');
    }

    // Validate port range
    if (config.port < 1 || config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get recommended port based on host and configuration
   * @param {string} host - SMTP host
   * @returns {number} Recommended port
   */
  getRecommendedPort(host) {
    const hostLower = host.toLowerCase();

    // Gmail
    if (hostLower.includes('gmail')) {
      return 587; // TLS
    }

    // Outlook/Office365
    if (hostLower.includes('outlook') || hostLower.includes('office365')) {
      return 587; // TLS
    }

    // Yahoo
    if (hostLower.includes('yahoo')) {
      return 587; // TLS
    }

    // Default to TLS port
    return 587;
  }

  /**
   * Test if server supports STARTTLS
   * @param {string} host - SMTP host
   * @param {number} port - Port (usually 587 or 25)
   * @returns {Promise<boolean>} True if STARTTLS supported
   */
  async supportsSTARTTLS(host, port = 587) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        requireTLS: true,
        connectionTimeout: 5000,
        logger: false
      });

      await transporter.verify();
      transporter.close();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const smtpValidator = new SMTPValidator();

module.exports = smtpValidator;
