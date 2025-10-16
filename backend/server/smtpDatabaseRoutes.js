/**
 * SMTP Database API Routes
 * Provides access to 891-domain SMTP auto-configuration database
 */

const express = require('express');
const router = express.Router();
const smtpDatabase = require('../lib/smtpDatabase');

/**
 * GET /api/smtp/database/stats
 * Get database statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = smtpDatabase.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database statistics'
    });
  }
});

/**
 * GET /api/smtp/database/popular
 * Get popular email providers
 */
router.get('/popular', (req, res) => {
  try {
    const popular = smtpDatabase.getPopularDomains();

    res.json({
      success: true,
      providers: popular
    });
  } catch (error) {
    console.error('Error getting popular domains:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular domains'
    });
  }
});

/**
 * GET /api/smtp/database/search?q=gmail
 * Search domains by pattern
 */
router.get('/search', (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const results = smtpDatabase.search(query, limit);

    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search database'
    });
  }
});

/**
 * POST /api/smtp/database/lookup
 * Lookup SMTP configuration by email address
 * Body: { email: "user@gmail.com" }
 */
router.post('/lookup', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    // Validate email format
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const config = smtpDatabase.lookupByEmail(email);

    if (!config) {
      return res.json({
        success: false,
        found: false,
        message: `No SMTP configuration found for ${email.split('@')[1]}`
      });
    }

    // Format login username
    const login = smtpDatabase.formatLogin(email, config.loginTemplate);

    res.json({
      success: true,
      found: true,
      email,
      domain: config.domain,
      smtp: {
        primary: config.servers[0],
        alternates: config.servers.slice(1),
        totalServers: config.servers.length
      },
      auth: {
        loginTemplate: config.loginTemplate,
        username: login
      },
      features: {
        ssl: config.supportsSSL,
        tls: config.supportsTLS
      }
    });
  } catch (error) {
    console.error('Error looking up SMTP config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup SMTP configuration'
    });
  }
});

/**
 * GET /api/smtp/database/:domain
 * Get SMTP configuration for specific domain
 */
router.get('/:domain', (req, res) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const config = smtpDatabase.lookup(domain);

    if (!config) {
      return res.json({
        success: false,
        found: false,
        message: `No SMTP configuration found for ${domain}`,
        suggestion: 'Try using auto-discovery or manual configuration'
      });
    }

    res.json({
      success: true,
      found: true,
      domain: config.domain,
      smtp: {
        primary: config.servers[0],
        alternates: config.servers.slice(1),
        allServers: config.servers
      },
      loginTemplate: config.loginTemplate,
      features: {
        ssl: config.supportsSSL,
        tls: config.supportsTLS
      },
      source: config.source
    });
  } catch (error) {
    console.error('Error getting domain config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get domain configuration'
    });
  }
});

/**
 * POST /api/smtp/database/autoconfig
 * Auto-configure SMTP settings from email
 * Body: { email: "user@gmail.com", password: "pass123" }
 * Returns complete SMTP configuration ready to use
 */
router.post('/autoconfig', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const config = smtpDatabase.lookupByEmail(email);

    if (!config) {
      return res.json({
        success: false,
        found: false,
        message: `No auto-configuration available for ${email.split('@')[1]}`,
        suggestion: 'Please configure SMTP settings manually or use auto-discovery'
      });
    }

    // Get primary server
    const primaryServer = config.servers[0];
    const login = smtpDatabase.formatLogin(email, config.loginTemplate);

    // Convert to text.js compatible format
    const textJsConfig = smtpDatabase.toTextJsFormat(email);

    res.json({
      success: true,
      found: true,
      email,
      config: {
        // Nodemailer format
        host: primaryServer.host,
        port: primaryServer.port,
        secure: primaryServer.ssl, // true for 465, false for other ports
        auth: {
          user: login,
          pass: password || '' // Password provided by user
        },
        tls: {
          rejectUnauthorized: false // For compatibility
        }
      },
      // text.js compatible format
      textJsFormat: {
        ...textJsConfig,
        pass: password || ''
      },
      alternateServers: config.servers.slice(1).map(server => ({
        host: server.host,
        port: server.port,
        secure: server.ssl
      })),
      metadata: {
        domain: config.domain,
        loginTemplate: config.loginTemplate,
        source: 'autoconfig_database'
      }
    });
  } catch (error) {
    console.error('Error auto-configuring SMTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to auto-configure SMTP'
    });
  }
});

module.exports = router;
