/**
 * IMAP Handler Module
 *
 * Handles IMAP connections for inbox searching and contact extraction
 * Works with validated SMTP combo results format (password|email)
 *
 * Based on mailpass2smtp.py logic for domain detection and MX lookup
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const dns = require('dns').promises;
const securityConfig = require('./securityConfig');

function allowInvalidCertificates() {
  return Boolean(securityConfig.getTlsPolicy().allowInvalidCertificates);
}

function minTlsVersion() {
  return securityConfig.getTlsPolicy().minVersion || 'TLSv1.2';
}

class ImapHandler {
  constructor() {
    // IMAP server configurations for ALL major providers
    // Matches smtpValidatorAdvanced.js comprehensive provider support
    this.imapConfigs = {
      // Google
      'gmail.com': { host: 'imap.gmail.com', port: 993, tls: true },
      'googlemail.com': { host: 'imap.gmail.com', port: 993, tls: true },

      // Yahoo
      'yahoo.com': { host: 'imap.mail.yahoo.com', port: 993, tls: true },
      'ymail.com': { host: 'imap.mail.yahoo.com', port: 993, tls: true },
      'rocketmail.com': { host: 'imap.mail.yahoo.com', port: 993, tls: true },
      'yahoo.co.uk': { host: 'imap.mail.yahoo.com', port: 993, tls: true },
      'yahoo.fr': { host: 'imap.mail.yahoo.com', port: 993, tls: true },
      'yahoo.de': { host: 'imap.mail.yahoo.com', port: 993, tls: true },

      // Microsoft/Outlook/Hotmail/Live
      'outlook.com': { host: 'outlook.office365.com', port: 993, tls: true },
      'hotmail.com': { host: 'outlook.office365.com', port: 993, tls: true },
      'live.com': { host: 'outlook.office365.com', port: 993, tls: true },
      'msn.com': { host: 'outlook.office365.com', port: 993, tls: true },
      'outlook.co.uk': { host: 'outlook.office365.com', port: 993, tls: true },
      'hotmail.co.uk': { host: 'outlook.office365.com', port: 993, tls: true },
      'live.co.uk': { host: 'outlook.office365.com', port: 993, tls: true },

      // AOL
      'aol.com': { host: 'imap.aol.com', port: 993, tls: true },
      'aol.co.uk': { host: 'imap.aol.com', port: 993, tls: true },
      'aim.com': { host: 'imap.aol.com', port: 993, tls: true },

      // AT&T / SBC / Bellsouth
      'att.net': { host: 'imap.mail.att.net', port: 993, tls: true },
      'sbcglobal.net': { host: 'imap.mail.att.net', port: 993, tls: true },
      'bellsouth.net': { host: 'imap.mail.att.net', port: 993, tls: true },

      // Verizon
      'verizon.net': { host: 'incoming.verizon.net', port: 993, tls: true },

      // iCloud / Apple
      'icloud.com': { host: 'imap.mail.me.com', port: 993, tls: true },
      'me.com': { host: 'imap.mail.me.com', port: 993, tls: true },
      'mac.com': { host: 'imap.mail.me.com', port: 993, tls: true },

      // Zoho
      'zoho.com': { host: 'imap.zoho.com', port: 993, tls: true },
      'zoho.eu': { host: 'imap.zoho.eu', port: 993, tls: true },
      'zoho.in': { host: 'imap.zoho.in', port: 993, tls: true },

      // ProtonMail
      'protonmail.com': { host: '127.0.0.1', port: 1143, tls: false }, // ProtonMail Bridge required
      'proton.me': { host: '127.0.0.1', port: 1143, tls: false }, // ProtonMail Bridge required

      // GMX
      'gmx.com': { host: 'imap.gmx.com', port: 993, tls: true },
      'gmx.net': { host: 'imap.gmx.net', port: 993, tls: true },
      'gmx.de': { host: 'imap.gmx.de', port: 993, tls: true },

      // Mail.com
      'mail.com': { host: 'imap.mail.com', port: 993, tls: true },

      // Yandex
      'yandex.com': { host: 'imap.yandex.com', port: 993, tls: true },
      'yandex.ru': { host: 'imap.yandex.ru', port: 993, tls: true },

      // Mail.ru
      'mail.ru': { host: 'imap.mail.ru', port: 993, tls: true },

      // Fastmail
      'fastmail.com': { host: 'imap.fastmail.com', port: 993, tls: true },
      'fastmail.fm': { host: 'imap.fastmail.com', port: 993, tls: true },

      // Tutanota (requires desktop client, no direct IMAP)
      'tutanota.com': { host: null, port: null, tls: null, requiresClient: true },
      'tutanota.de': { host: null, port: null, tls: null, requiresClient: true },

      // QQ Mail
      'qq.com': { host: 'imap.qq.com', port: 993, tls: true },

      // Chinese providers
      '163.com': { host: 'imap.163.com', port: 993, tls: true },
      '126.com': { host: 'imap.126.com', port: 993, tls: true },

      // ISPs
      'earthlink.net': { host: 'imap.earthlink.net', port: 993, tls: true },
      'juno.com': { host: 'imap.juno.com', port: 993, tls: true },
      'netzero.net': { host: 'imap.netzero.net', port: 993, tls: true },
      'comcast.net': { host: 'imap.comcast.net', port: 993, tls: true },
      'compuserve.com': { host: 'imap.cs.com', port: 993, tls: true },
      'netscape.net': { host: 'imap.netscape.com', port: 993, tls: true }
    };

    // Custom DNS servers for resolution (matching smtpValidatorAdvanced.js)
    this.DNS_SERVERS = [
      '1.1.1.1',        // Cloudflare
      '8.8.8.8',        // Google Primary
      '8.8.4.4',        // Google Secondary
      '9.9.9.9',        // Quad9
      '208.67.222.222', // OpenDNS
      '208.67.220.220'  // OpenDNS Secondary
    ];
  }

  /**
   * Parse combo result format to extract credentials
   * Supports multiple formats:
   * - smtp|port|email|password (from combo validator output)
   * - password|email (legacy format)
   * - email:password (common format)
   */
  parseComboResult(comboString) {
    const parts = comboString.trim().split('|');

    // Format: smtp|port|email|password (from combo validator)
    // Example: smtp.gmail.com|587|user@gmail.com|password123
    if (parts.length === 4) {
      return {
        smtp: parts[0],
        port: parseInt(parts[1]),
        email: parts[2],
        password: parts[3],
        username: parts[2],
        domain: parts[2].split('@')[1]
      };
    }

    // Format: password|email (legacy format)
    if (parts.length === 2) {
      return {
        password: parts[0],
        email: parts[1],
        username: parts[1],
        domain: parts[1].split('@')[1]
      };
    }

    // Format: email:password (common format)
    const colonParts = comboString.trim().split(':');
    if (colonParts.length === 2) {
      return {
        email: colonParts[0],
        password: colonParts[1],
        username: colonParts[0],
        domain: colonParts[0].split('@')[1]
      };
    }

    throw new Error('Invalid combo format. Expected smtp|port|email|password, password|email, or email:password');
  }

  /**
   * Get IMAP configuration for a domain
   * Similar to get_smtp_config() in Python script
   * Enhanced with comprehensive provider support
   */
  async getImapConfig(domain) {
    domain = domain.toLowerCase();

    // Check if we have a pre-configured IMAP server
    if (this.imapConfigs[domain]) {
      const config = this.imapConfigs[domain];

      // Check for providers that require special client setup
      if (config.requiresClient) {
        throw new Error(`${domain} requires desktop client for IMAP access`);
      }

      return config;
    }

    // Try common IMAP server patterns
    const commonPatterns = [
      `imap.${domain}`,
      `mail.${domain}`,
      `webmail.${domain}`
    ];

    // Try MX record lookup
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        // Sort by priority (lower is better)
        mxRecords.sort((a, b) => a.priority - b.priority);
        const mxDomain = mxRecords[0].exchange;

        // Convert SMTP MX to IMAP (common pattern)
        const imapHost = mxDomain.replace(/^smtp\./, 'imap.');
        commonPatterns.unshift(imapHost);
      }
    } catch (err) {
      console.log(`MX lookup failed for ${domain}:`, err.message);
    }

    // Try each pattern
    for (const host of commonPatterns) {
      try {
        const config = {
          host: host,
          port: 993,
          tls: true
        };

        // Cache successful config
        this.imapConfigs[domain] = config;
        return config;
      } catch (err) {
        continue;
      }
    }

    // Default fallback
    return {
      host: `imap.${domain}`,
      port: 993,
      tls: true
    };
  }

  /**
   * Create IMAP connection
   */
  async connect(email, password, proxyConfig = null) {
    const domain = email.split('@')[1];
    const config = await this.getImapConfig(domain);

    const imapConfig = {
      user: email,
      password: password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: {
        rejectUnauthorized: !allowInvalidCertificates(),
        minVersion: minTlsVersion()
      },
      connTimeout: 10000,
      authTimeout: 10000
    };

    // TODO: Add proxy support
    // if (proxyConfig) {
    //   imapConfig.proxy = proxyConfig;
    // }

    return new Promise((resolve, reject) => {
      const imap = new Imap(imapConfig);

      imap.once('ready', () => {
        resolve(imap);
      });

      imap.once('error', (err) => {
        reject(new Error(`IMAP connection failed: ${err.message}`));
      });

      imap.connect();
    });
  }

  /**
   * Search inbox for keywords
   */
  async searchInbox(imap, keywords, maxResults = 50) {
    return new Promise((resolve, reject) => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          return reject(err);
        }

        // Build search criteria for keywords
        const searchCriteria = ['ALL'];
        // We'll filter by keywords after fetching (IMAP OR is complex)

        imap.search(searchCriteria, (err, uids) => {
          if (err) {
            return reject(err);
          }

          if (!uids || uids.length === 0) {
            return resolve([]);
          }

          // Limit to recent messages
          const recentUids = uids.slice(-maxResults);
          const results = [];

          const fetch = imap.fetch(recentUids, {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
            struct: true
          });

          fetch.on('message', (msg, seqno) => {
            let messageData = {};

            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', () => {
                const parsed = Imap.parseHeader(buffer);
                messageData.from = parsed.from ? parsed.from[0] : '';
                messageData.to = parsed.to ? parsed.to[0] : '';
                messageData.subject = parsed.subject ? parsed.subject[0] : '';
                messageData.date = parsed.date ? parsed.date[0] : '';
              });
            });

            msg.once('end', () => {
              // Filter by keywords in subject or from
              const matchedKeyword = keywords.find(keyword => {
                const lowerKeyword = keyword.toLowerCase();
                const subjectMatch = messageData.subject &&
                                    messageData.subject.toLowerCase().includes(lowerKeyword);
                const fromMatch = messageData.from &&
                                 messageData.from.toLowerCase().includes(lowerKeyword);
                return subjectMatch || fromMatch;
              });

              if (matchedKeyword) {
                results.push({
                  subject: messageData.subject,
                  from: messageData.from,
                  to: messageData.to,
                  date: messageData.date,
                  keyword: matchedKeyword,
                  preview: `From: ${messageData.from} - ${messageData.subject}`
                });
              }
            });
          });

          fetch.once('error', (err) => {
            reject(err);
          });

          fetch.once('end', () => {
            imap.end();
            resolve(results);
          });
        });
      });
    });
  }

  /**
   * Close IMAP connection
   */
  disconnect(imap) {
    if (imap) {
      imap.end();
    }
  }

  /**
   * Test IMAP connection (quick validation)
   */
  async testConnection(email, password) {
    try {
      const imap = await this.connect(email, password);
      this.disconnect(imap);
      return { success: true, message: 'Connection successful' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}

module.exports = new ImapHandler();
