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

class ImapHandler {
  constructor() {
    // IMAP server configurations for common providers
    this.imapConfigs = {
      'gmail.com': { host: 'imap.gmail.com', port: 993, tls: true },
      'googlemail.com': { host: 'imap.gmail.com', port: 993, tls: true },
      'yahoo.com': { host: 'imap.mail.yahoo.com', port: 993, tls: true },
      'outlook.com': { host: 'outlook.office365.com', port: 993, tls: true },
      'hotmail.com': { host: 'outlook.office365.com', port: 993, tls: true },
      'live.com': { host: 'outlook.office365.com', port: 993, tls: true },
      'aol.com': { host: 'imap.aol.com', port: 993, tls: true },
      'icloud.com': { host: 'imap.mail.me.com', port: 993, tls: true },
      'me.com': { host: 'imap.mail.me.com', port: 993, tls: true },
      'mail.ru': { host: 'imap.mail.ru', port: 993, tls: true },
      'yandex.com': { host: 'imap.yandex.com', port: 993, tls: true },
      'zoho.com': { host: 'imap.zoho.com', port: 993, tls: true },
      'protonmail.com': { host: 'imap.protonmail.com', port: 993, tls: true }
    };
  }

  /**
   * Parse combo result format (password|email) to extract credentials
   */
  parseComboResult(comboString) {
    const parts = comboString.trim().split('|');
    if (parts.length === 2) {
      return {
        password: parts[0],
        email: parts[1],
        username: parts[1],
        domain: parts[1].split('@')[1]
      };
    }
    // Also support email:password format
    const colonParts = comboString.trim().split(':');
    if (colonParts.length === 2) {
      return {
        email: colonParts[0],
        password: colonParts[1],
        username: colonParts[0],
        domain: colonParts[0].split('@')[1]
      };
    }
    throw new Error('Invalid combo format. Expected password|email or email:password');
  }

  /**
   * Get IMAP configuration for a domain
   * Similar to get_smtp_config() in Python script
   */
  async getImapConfig(domain) {
    domain = domain.toLowerCase();

    // Check if we have a pre-configured IMAP server
    if (this.imapConfigs[domain]) {
      return this.imapConfigs[domain];
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
      tlsOptions: { rejectUnauthorized: false },
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
