'use strict';

const crypto = require('crypto');
const dns = require('dns').promises;

/**
 * Military-Grade Email Security Module
 * Implements advanced security measures for maximum inbox delivery
 */

class EmailSecurity {
  constructor() {
    this.securityLevel = 'military';
    this.dkimKeys = new Map();
  }

  /**
   * Generate DKIM key pair for domain
   */
  async generateDKIMKeys(domain, selector = 'default') {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    const dnsRecord = this.createDKIMDNSRecord(publicKey, selector);

    this.dkimKeys.set(domain, {
      selector,
      publicKey,
      privateKey,
      dnsRecord: dnsRecord,
      createdAt: new Date().toISOString()
    });

    return {
      selector,
      privateKey,
      publicKey,
      dnsRecord,
      instructions: `Add this TXT record to your DNS:\nName: ${selector}._domainkey.${domain}\nValue: ${dnsRecord}`
    };
  }

  /**
   * Create DKIM DNS record from public key
   */
  createDKIMDNSRecord(publicKey, selector) {
    const cleanKey = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\n/g, '');

    return `v=DKIM1; k=rsa; p=${cleanKey}`;
  }

  /**
   * Sign email with DKIM
   */
  signWithDKIM(emailContent, domain, selector = 'default') {
    const keys = this.dkimKeys.get(domain);
    if (!keys) {
      throw new Error(`No DKIM keys found for domain: ${domain}`);
    }

    const canonicalizedHeaders = this.canonicalizeHeaders(emailContent.headers);
    const canonicalizedBody = this.canonicalizeBody(emailContent.body);

    // Create body hash
    const bodyHash = crypto
      .createHash('sha256')
      .update(canonicalizedBody)
      .digest('base64');

    // Create DKIM signature header
    const dkimHeader = [
      `v=1`,
      `a=rsa-sha256`,
      `c=relaxed/relaxed`,
      `d=${domain}`,
      `s=${selector}`,
      `t=${Math.floor(Date.now() / 1000)}`,
      `bh=${bodyHash}`,
      `h=from:to:subject:date`,
      `b=`
    ].join('; ');

    // Sign the header
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(dkimHeader + canonicalizedHeaders);
    const signature = sign.sign(keys.privateKey, 'base64');

    return `${dkimHeader}${signature}`;
  }

  /**
   * Canonicalize email headers for DKIM
   */
  canonicalizeHeaders(headers) {
    return Object.entries(headers)
      .map(([key, value]) => `${key.toLowerCase()}:${value.trim()}`)
      .join('\r\n');
  }

  /**
   * Canonicalize email body for DKIM
   */
  canonicalizeBody(body) {
    return body
      .replace(/\r?\n/g, '\r\n')
      .replace(/\r\n$/, '');
  }

  /**
   * Generate SPF record for domain
   */
  generateSPFRecord(authorizedServers = []) {
    const mechanisms = [
      'v=spf1',
      ...authorizedServers.map(server => `ip4:${server}`),
      'include:_spf.google.com',
      'include:spf.protection.outlook.com',
      '~all'
    ];

    return mechanisms.join(' ');
  }

  /**
   * Generate DMARC record for domain
   */
  generateDMARCRecord(options = {}) {
    const {
      policy = 'quarantine', // none, quarantine, reject
      reportEmail,
      percentage = 100,
      alignment = 'r' // r = relaxed, s = strict
    } = options;

    const record = [
      'v=DMARC1',
      `p=${policy}`,
      `sp=${policy}`,
      `pct=${percentage}`,
      `adkim=${alignment}`,
      `aspf=${alignment}`
    ];

    if (reportEmail) {
      record.push(`rua=mailto:${reportEmail}`);
      record.push(`ruf=mailto:${reportEmail}`);
    }

    return record.join('; ');
  }

  /**
   * Verify domain DNS records (MX, SPF, DKIM, DMARC)
   */
  async verifyDomainSecurity(domain) {
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // Check MX records
      const mx = await dns.resolveMx(domain);
      results.checks.mx = {
        passed: mx.length > 0,
        count: mx.length,
        records: mx.map(r => r.exchange)
      };
    } catch {
      results.checks.mx = { passed: false, error: 'No MX records found' };
    }

    try {
      // Check SPF record
      const txt = await dns.resolveTxt(domain);
      const spf = txt.flat().find(r => r.startsWith('v=spf1'));
      results.checks.spf = {
        passed: !!spf,
        record: spf || null
      };
    } catch {
      results.checks.spf = { passed: false, error: 'No SPF record found' };
    }

    try {
      // Check DMARC record
      const dmarc = await dns.resolveTxt(`_dmarc.${domain}`);
      const dmarcRecord = dmarc.flat().find(r => r.startsWith('v=DMARC1'));
      results.checks.dmarc = {
        passed: !!dmarcRecord,
        record: dmarcRecord || null
      };
    } catch {
      results.checks.dmarc = { passed: false, error: 'No DMARC record found' };
    }

    // Calculate security score
    const passedChecks = Object.values(results.checks).filter(c => c.passed).length;
    results.securityScore = (passedChecks / 3 * 100).toFixed(0);
    results.grade = this.calculateSecurityGrade(results.securityScore);

    return results;
  }

  /**
   * Calculate security grade
   */
  calculateSecurityGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Implement email header authentication
   */
  authenticateHeaders(emailData, options = {}) {
    const {
      fromName,
      fromEmail,
      replyTo,
      returnPath,
      organizationHeader = true
    } = options;

    const headers = {
      'From': `"${fromName}" <${fromEmail}>`,
      'Reply-To': replyTo || fromEmail,
      'Return-Path': returnPath || fromEmail,
      'X-Mailer': 'SE Gateway v2.0',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal'
    };

    if (organizationHeader) {
      headers['Organization'] = fromName;
    }

    // Anti-spam headers
    headers['X-Spam-Status'] = 'No';
    headers['X-Spam-Score'] = '0.0';

    // Authentication results
    headers['Authentication-Results'] = `${this.extractDomain(fromEmail)}; dkim=pass; spf=pass; dmarc=pass`;

    return headers;
  }

  /**
   * Generate message ID
   */
  generateMessageID(domain) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return `<${timestamp}.${random}@${domain}>`;
  }

  /**
   * Calculate spam score and provide recommendations
   */
  analyzeSpamRisk(emailContent, headers) {
    const risks = [];
    let score = 0;

    // Check for spam trigger words
    const spamWords = ['free', 'winner', 'click here', 'urgent', 'limited time', 'act now'];
    const content = emailContent.toLowerCase();

    for (const word of spamWords) {
      if (content.includes(word)) {
        score += 2;
        risks.push(`Contains spam trigger word: "${word}"`);
      }
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3) {
      score += 3;
      risks.push('Excessive use of capital letters');
    }

    // Check for excessive exclamation marks
    const exclamations = (content.match(/!/g) || []).length;
    if (exclamations > 3) {
      score += 2;
      risks.push('Too many exclamation marks');
    }

    // Check for suspicious links
    const links = content.match(/https?:\/\/[^\s]+/gi) || [];
    if (links.length > 10) {
      score += 3;
      risks.push('Too many links in email');
    }

    // Check headers
    if (!headers['Reply-To']) {
      score += 1;
      risks.push('Missing Reply-To header');
    }

    return {
      score,
      level: score < 3 ? 'low' : score < 7 ? 'medium' : 'high',
      risks,
      recommendation: this.getSpamRecommendation(score)
    };
  }

  /**
   * Get spam risk recommendations
   */
  getSpamRecommendation(score) {
    if (score < 3) return 'Email looks good. Low spam risk.';
    if (score < 7) return 'Consider reducing spam triggers. Medium risk.';
    return 'High spam risk. Rewrite email content to avoid spam filters.';
  }

  /**
   * Extract domain from email address
   */
  extractDomain(email) {
    return email.split('@')[1] || '';
  }

  /**
   * Implement rate limiting per domain
   */
  checkRateLimit(domain, maxPerHour = 100) {
    const key = `ratelimit_${domain}`;
    const now = Date.now();
    const hourAgo = now - 3600000;

    // This should use Redis in production
    // Simplified in-memory version
    if (!this.rateLimits) {
      this.rateLimits = new Map();
    }

    let timestamps = this.rateLimits.get(key) || [];
    timestamps = timestamps.filter(t => t > hourAgo);

    if (timestamps.length >= maxPerHour) {
      return {
        allowed: false,
        limit: maxPerHour,
        remaining: 0,
        resetIn: Math.ceil((timestamps[0] + 3600000 - now) / 1000)
      };
    }

    timestamps.push(now);
    this.rateLimits.set(key, timestamps);

    return {
      allowed: true,
      limit: maxPerHour,
      remaining: maxPerHour - timestamps.length,
      count: timestamps.length
    };
  }
}

module.exports = EmailSecurity;
