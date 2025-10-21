/**
 * Debounce Email Filter
 * Removes dangerous emails hosted by security companies, AV vendors, and risky domains
 * Port of get_safe_mails.py functionality to Node.js
 */

const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class DebounceFilter {
  constructor() {
    this.whitelist = new Set();
    this.loadWhitelist();

    // Dangerous ISPs/Security vendors (50+ vendors)
    this.dangerousISPs = [
      'proofpoint', 'mimecast', 'barracuda', 'fireeye', 'sophos', 'symantec',
      'trendmicro', 'fortinet', 'mcafee', 'kaspersky', 'eset', 'avast', 'avg',
      'bitdefender', 'paloalto', 'checkpoint', 'ciscoironport', 'forcepoint',
      'zscaler', 'cloudflare', 'akamai', 'imperva', 'f5networks', 'radware',
      'arbor', 'corero', 'a10networks', 'citrix', 'juniper', 'sonicwall',
      'watchguard', 'webroot', 'carbonblack', 'crowdstrike', 'sentinelone',
      'cylance', 'malwarebytes', 'fidelis', 'secureworks', 'rsa', 'qualys',
      'rapid7', 'tenable', 'perimeterwatch', 'perimeterx', 'distilnetworks',
      'shapesecurity', 'incapsula', 'reblaze', 'edgecast', 'level3', 'limelight'
    ];

    // Whitelisted MX patterns (safe email providers)
    this.whitelistedMX = [
      // Google
      /google\.com$/i, /googlemail\.com$/i, /gmail\.com$/i,
      // Microsoft
      /outlook\.com$/i, /hotmail\.com$/i, /live\.com$/i, /office365\.com$/i,
      /microsoft\.com$/i, /exchange\.microsoft\.com$/i,
      // Yahoo
      /yahoo\.com$/i, /yahoodns\.net$/i, /ymail\.com$/i,
      // Apple
      /icloud\.com$/i, /me\.com$/i, /mac\.com$/i, /apple\.com$/i,
      // Other major providers
      /protonmail\.com$/i, /zoho\.com$/i, /fastmail\.com$/i, /gmx\.com$/i,
      /mail\.ru$/i, /yandex\.ru$/i, /aol\.com$/i, /comcast\.net$/i,
      // Popular hosting/domains
      /amazonaws\.com$/i, /cloudflare\.net$/i, /godaddy\.com$/i,
      /namecheap\.com$/i, /bluehost\.com$/i, /hostgator\.com$/i,
      // Email services
      /mailgun\.org$/i, /sendgrid\.net$/i, /sparkpostmail\.com$/i,
      /mandrillapp\.com$/i, /mailchimp\.com$/i, /constantcontact\.com$/i
    ];

    // Dangerous zones (government/education/military)
    this.dangerousZones = ['.gov', '.mil', '.edu'];

    // Dangerous usernames
    this.dangerousUsers = [
      'admin', 'staff', 'support', 'info', 'contact', 'postmaster',
      'webmaster', 'noreply', 'no-reply', 'abuse', 'security',
      'privacy', 'legal', 'compliance', 'help', 'helpdesk'
    ];
  }

  /**
   * Load domains whitelist from file
   */
  loadWhitelist() {
    try {
      const whitelistPath = path.join(__dirname, '../../domains_whitelist.txt');
      if (fs.existsSync(whitelistPath)) {
        const content = fs.readFileSync(whitelistPath, 'utf8');
        const domains = content.split('\n').map(d => d.trim()).filter(d => d.length > 0);
        this.whitelist = new Set(domains.map(d => d.toLowerCase()));
        console.log(`✅ Loaded ${this.whitelist.size} whitelisted domains`);
      } else {
        console.warn('⚠️  domains_whitelist.txt not found, using pattern-based filtering only');
      }
    } catch (error) {
      console.error('❌ Failed to load whitelist:', error.message);
    }
  }

  /**
   * Parse email list from text
   * @param {string} emailText - Raw text with emails (one per line or comma-separated)
   * @returns {Array} Array of unique email addresses
   */
  parseEmailList(emailText) {
    if (!emailText || typeof emailText !== 'string') {
      return [];
    }

    // Split by newlines and commas
    const lines = emailText.split(/[\n,]/).map(line => line.trim()).filter(line => line.length > 0);

    // Extract emails using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = new Set();

    lines.forEach(line => {
      const matches = line.match(emailRegex);
      if (matches) {
        matches.forEach(email => emails.add(email.toLowerCase()));
      }
    });

    return Array.from(emails);
  }

  /**
   * Check if domain is in whitelist
   */
  isWhitelisted(domain) {
    return this.whitelist.has(domain.toLowerCase());
  }

  /**
   * Check if MX record matches whitelisted patterns
   */
  isWhitelistedMX(mxRecord) {
    return this.whitelistedMX.some(pattern => pattern.test(mxRecord));
  }

  /**
   * Check if domain is in dangerous zone
   */
  isDangerousZone(email) {
    const domain = email.split('@')[1];
    return this.dangerousZones.some(zone => domain.endsWith(zone));
  }

  /**
   * Check if username is dangerous
   */
  isDangerousUser(email) {
    const username = email.split('@')[0].toLowerCase();
    return this.dangerousUsers.some(user => username === user || username.startsWith(user + '.'));
  }

  /**
   * Check if ISP/host is dangerous (security company)
   */
  isDangerousISP(hostname) {
    const lower = hostname.toLowerCase();
    return this.dangerousISPs.some(isp => lower.includes(isp));
  }

  /**
   * Get MX records for domain
   */
  async getMXRecords(domain) {
    try {
      const records = await dns.resolveMx(domain);
      return records.sort((a, b) => a.priority - b.priority).map(r => r.exchange);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get A records for hostname
   */
  async getARecords(hostname) {
    try {
      return await dns.resolve4(hostname);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get PTR records (reverse DNS)
   */
  async getPTRRecords(ip) {
    try {
      return await dns.reverse(ip);
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch website title (with timeout)
   */
  async getWebsiteTitle(domain) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null);
      }, 5000); // 5 second timeout

      const url = `https://${domain}`;
      https.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          // Stop if we have enough data to find title
          if (data.length > 10000) {
            res.destroy();
          }
        });
        res.on('end', () => {
          clearTimeout(timeout);
          const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
          resolve(titleMatch ? titleMatch[1] : null);
        });
      }).on('error', () => {
        clearTimeout(timeout);
        resolve(null);
      });
    });
  }

  /**
   * Check if website title contains security keywords
   */
  hasSecurityKeywords(title) {
    if (!title) return false;
    const keywords = [
      'security', 'firewall', 'antivirus', 'anti-virus', 'protection',
      'threat', 'malware', 'spam', 'filter', 'gateway', 'cloud security',
      'email security', 'cyber', 'defense', 'shield'
    ];
    const lower = title.toLowerCase();
    return keywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Process single email with full checks
   * @param {string} email - Email address to check
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Object} { email, safe, reason, details }
   */
  async processEmail(email, progressCallback = null) {
    const result = {
      email,
      safe: true,
      reason: null,
      details: {}
    };

    try {
      const domain = email.split('@')[1];
      const username = email.split('@')[0];

      // Check 1: Dangerous username
      if (this.isDangerousUser(email)) {
        result.safe = false;
        result.reason = 'Dangerous username (admin/staff/support)';
        return result;
      }

      // Check 2: Dangerous zone (.gov, .mil, .edu)
      if (this.isDangerousZone(email)) {
        result.safe = false;
        result.reason = 'Dangerous zone (.gov/.mil/.edu)';
        return result;
      }

      // Check 3: Domain whitelist (quick pass)
      if (this.isWhitelisted(domain)) {
        result.reason = 'Domain whitelisted';
        result.details.whitelisted = true;
        return result;
      }

      // Check 4: MX records
      if (progressCallback) progressCallback('Checking MX records...');
      const mxRecords = await this.getMXRecords(domain);
      result.details.mxRecords = mxRecords;

      if (mxRecords.length === 0) {
        result.safe = false;
        result.reason = 'No MX records found';
        return result;
      }

      // Check 5: Whitelisted MX patterns
      const hasWhitelistedMX = mxRecords.some(mx => this.isWhitelistedMX(mx));
      if (hasWhitelistedMX) {
        result.reason = 'Whitelisted MX provider';
        result.details.whitelistedMX = true;
        return result;
      }

      // Check 6: Dangerous ISP in MX records
      const dangerousMX = mxRecords.find(mx => this.isDangerousISP(mx));
      if (dangerousMX) {
        result.safe = false;
        result.reason = `Security vendor MX: ${dangerousMX}`;
        result.details.dangerousMX = dangerousMX;
        return result;
      }

      // Check 7: A records and PTR for primary MX
      if (progressCallback) progressCallback('Checking DNS records...');
      const primaryMX = mxRecords[0];
      const aRecords = await this.getARecords(primaryMX);
      result.details.aRecords = aRecords;

      if (aRecords.length > 0) {
        const ptrRecords = await this.getPTRRecords(aRecords[0]);
        result.details.ptrRecords = ptrRecords;

        // Check PTR for dangerous ISPs
        const dangerousPTR = ptrRecords.find(ptr => this.isDangerousISP(ptr));
        if (dangerousPTR) {
          result.safe = false;
          result.reason = `Security vendor PTR: ${dangerousPTR}`;
          result.details.dangerousPTR = dangerousPTR;
          return result;
        }
      }

      // Check 8: Website title (less reliable, optional)
      if (progressCallback) progressCallback('Checking website...');
      const title = await this.getWebsiteTitle(domain);
      result.details.websiteTitle = title;

      if (title && this.hasSecurityKeywords(title)) {
        result.safe = false;
        result.reason = `Security-related website: "${title}"`;
        return result;
      }

      // Passed all checks
      result.reason = 'Passed all safety checks';
      return result;

    } catch (error) {
      result.safe = false;
      result.reason = `Error: ${error.message}`;
      result.details.error = error.message;
      return result;
    }
  }

  /**
   * Process email list with concurrency control
   * @param {Array} emails - Array of email addresses
   * @param {Object} options - { concurrency, onProgress }
   * @returns {Object} { safe: [], dangerous: [], stats: {} }
   */
  async processEmailList(emails, options = {}) {
    const { concurrency = 10, onProgress = null } = options;

    const results = {
      safe: [],
      dangerous: [],
      stats: {
        total: emails.length,
        processed: 0,
        safe: 0,
        dangerous: 0,
        filterRate: 0
      }
    };

    // Process emails in batches with concurrency control
    const processBatch = async (batch) => {
      const promises = batch.map(email =>
        this.processEmail(email, (msg) => {
          if (onProgress) onProgress({ email, message: msg });
        })
      );
      return await Promise.all(promises);
    };

    // Split into batches
    for (let i = 0; i < emails.length; i += concurrency) {
      const batch = emails.slice(i, i + concurrency);
      const batchResults = await processBatch(batch);

      batchResults.forEach(result => {
        if (result.safe) {
          results.safe.push(result);
          results.stats.safe++;
        } else {
          results.dangerous.push(result);
          results.stats.dangerous++;
        }
        results.stats.processed++;

        // Calculate filter rate
        results.stats.filterRate = ((results.stats.dangerous / results.stats.processed) * 100).toFixed(1);

        // Progress callback
        if (onProgress) {
          onProgress({
            type: 'progress',
            processed: results.stats.processed,
            total: results.stats.total,
            safe: results.stats.safe,
            dangerous: results.stats.dangerous,
            filterRate: results.stats.filterRate,
            currentEmail: result.email,
            currentResult: result.safe ? 'SAFE' : 'DANGEROUS',
            currentReason: result.reason
          });
        }
      });
    }

    return results;
  }
}

module.exports = DebounceFilter;
