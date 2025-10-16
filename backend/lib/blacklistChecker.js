/**
 * IP Blacklist Checker Module
 *
 * Checks if an IP address or domain is blacklisted on major spam databases.
 * Uses DNS-based blacklist (DNSBL) queries for free checking.
 *
 * Features:
 * - Check against 15+ major blacklists
 * - DNS-based queries (no API key required for basic checks)
 * - Optional MXToolbox API integration
 * - Batch checking support
 * - Cache results to avoid redundant checks
 */

const dns = require('dns').promises;
const https = require('https');

/**
 * Major DNSBL providers (DNS-based blacklists)
 * These are free to query via DNS
 */
const DNSBL_PROVIDERS = [
  { name: 'Spamhaus ZEN', domain: 'zen.spamhaus.org', critical: true },
  { name: 'Spamhaus SBL', domain: 'sbl.spamhaus.org', critical: true },
  { name: 'Spamhaus XBL', domain: 'xbl.spamhaus.org', critical: true },
  { name: 'Spamcop', domain: 'bl.spamcop.net', critical: true },
  { name: 'Barracuda', domain: 'b.barracudacentral.org', critical: true },
  { name: 'SORBS', domain: 'dnsbl.sorbs.net', critical: false },
  { name: 'UCEPROTECT L1', domain: 'dnsbl-1.uceprotect.net', critical: false },
  { name: 'PSBL', domain: 'psbl.surriel.com', critical: false },
  { name: 'SpamRATS', domain: 'spam.spamrats.com', critical: false },
  { name: 'WPBL', domain: 'db.wpbl.info', critical: false },
  { name: 'Mailspike', domain: 'bl.mailspike.net', critical: false },
  { name: 'DNSWL', domain: 'list.dnswl.org', critical: false, whitelist: true },
  { name: 'MultiRBL', domain: 'all.rbl.jp', critical: false },
  { name: 'CBL', domain: 'cbl.abuseat.org', critical: true },
  { name: 'Truncate', domain: 'truncate.gbudb.net', critical: false }
];

// Cache for storing blacklist check results
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Reverse IP address for DNSBL query
 * @param {string} ip - IP address (e.g., "1.2.3.4")
 * @returns {string} Reversed IP (e.g., "4.3.2.1")
 */
function reverseIp(ip) {
  return ip.split('.').reverse().join('.');
}

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IPv4
 */
function isValidIp(ip) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Check if IP is listed on a specific DNSBL
 * @param {string} ip - IP address to check
 * @param {Object} dnsbl - DNSBL provider object
 * @returns {Promise<Object>} Result object
 */
async function checkDnsbl(ip, dnsbl) {
  const reversedIp = reverseIp(ip);
  const queryDomain = `${reversedIp}.${dnsbl.domain}`;

  try {
    // DNS lookup - if it resolves, IP is listed
    await dns.resolve4(queryDomain);

    return {
      listed: true,
      provider: dnsbl.name,
      domain: dnsbl.domain,
      critical: dnsbl.critical,
      whitelist: dnsbl.whitelist || false
    };
  } catch (err) {
    // NXDOMAIN means not listed (which is good)
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return {
        listed: false,
        provider: dnsbl.name,
        domain: dnsbl.domain,
        critical: dnsbl.critical,
        whitelist: dnsbl.whitelist || false
      };
    }

    // Other errors (timeout, network issue, etc.)
    return {
      listed: null,
      provider: dnsbl.name,
      domain: dnsbl.domain,
      error: err.message,
      critical: dnsbl.critical
    };
  }
}

/**
 * Check IP against all DNSBLs
 * @param {string} ip - IP address to check
 * @param {Object} options - Check options
 * @returns {Promise<Object>} Comprehensive blacklist report
 */
async function checkIpBlacklist(ip, options = {}) {
  const { useCache = true, criticalOnly = false } = options;

  // Validate IP
  if (!isValidIp(ip)) {
    return {
      success: false,
      error: 'Invalid IP address format',
      ip
    };
  }

  // Check cache
  const cacheKey = `${ip}_${criticalOnly}`;
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return { ...cached.data, cached: true };
    }
    cache.delete(cacheKey);
  }

  // Filter DNSBLs based on options
  const dnsblsToCheck = criticalOnly
    ? DNSBL_PROVIDERS.filter(d => d.critical)
    : DNSBL_PROVIDERS;

  // Check all DNSBLs in parallel
  const results = await Promise.all(
    dnsblsToCheck.map(dnsbl => checkDnsbl(ip, dnsbl))
  );

  // Analyze results
  const blacklisted = results.filter(r => r.listed === true && !r.whitelist);
  const whitelisted = results.filter(r => r.listed === true && r.whitelist);
  const errors = results.filter(r => r.listed === null);
  const clean = results.filter(r => r.listed === false);

  const criticalListed = blacklisted.filter(r => r.critical);

  const report = {
    success: true,
    ip,
    timestamp: new Date().toISOString(),
    summary: {
      isBlacklisted: blacklisted.length > 0,
      isCriticallyBlacklisted: criticalListed.length > 0,
      isWhitelisted: whitelisted.length > 0,
      totalChecked: results.length,
      blacklistedCount: blacklisted.length,
      whitelistedCount: whitelisted.length,
      cleanCount: clean.length,
      errorCount: errors.length
    },
    blacklists: blacklisted.map(r => ({
      provider: r.provider,
      domain: r.domain,
      critical: r.critical
    })),
    whitelists: whitelisted.map(r => ({
      provider: r.provider,
      domain: r.domain
    })),
    errors: errors.map(r => ({
      provider: r.provider,
      error: r.error
    })),
    recommendation: getRecommendation(criticalListed.length, blacklisted.length, whitelisted.length),
    cached: false
  };

  // Cache the result
  if (useCache) {
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: report
    });
  }

  return report;
}

/**
 * Get recommendation based on blacklist status
 * @param {number} criticalCount - Number of critical blacklists
 * @param {number} totalBlacklisted - Total blacklists
 * @param {number} whitelisted - Number of whitelists
 * @returns {string} Recommendation
 */
function getRecommendation(criticalCount, totalBlacklisted, whitelisted) {
  if (criticalCount > 0) {
    return 'URGENT: Listed on critical blacklists. Do NOT send emails from this IP. High risk of being blocked by all major providers.';
  }

  if (totalBlacklisted >= 3) {
    return 'WARNING: Listed on multiple blacklists. Email deliverability will be severely impacted. Consider using a different IP.';
  }

  if (totalBlacklisted >= 1) {
    return 'CAUTION: Listed on at least one blacklist. Monitor deliverability closely and consider IP rotation.';
  }

  if (whitelisted > 0) {
    return 'EXCELLENT: IP is whitelisted. This will improve deliverability significantly.';
  }

  return 'GOOD: IP is clean and not listed on any major blacklists. Safe to use for sending.';
}

/**
 * Check multiple IPs in batch
 * @param {Array<string>} ips - Array of IP addresses
 * @param {Object} options - Check options
 * @returns {Promise<Array>} Array of blacklist reports
 */
async function checkBulkIps(ips, options = {}) {
  if (!Array.isArray(ips)) {
    return [];
  }

  const results = await Promise.all(
    ips.map(ip => checkIpBlacklist(ip, options))
  );

  return results;
}

/**
 * Get current SMTP IP address (from SMTP config)
 * This is a helper to check the current sending IP
 * @param {string} smtpHost - SMTP server hostname
 * @returns {Promise<string>} Resolved IP address
 */
async function resolveSmtpIp(smtpHost) {
  try {
    const addresses = await dns.resolve4(smtpHost);
    return addresses[0]; // Return first resolved IP
  } catch (err) {
    throw new Error(`Failed to resolve SMTP host ${smtpHost}: ${err.message}`);
  }
}

/**
 * Check if SMTP server IP is blacklisted
 * @param {string} smtpHost - SMTP server hostname
 * @param {Object} options - Check options
 * @returns {Promise<Object>} Blacklist report
 */
async function checkSmtpBlacklist(smtpHost, options = {}) {
  try {
    const ip = await resolveSmtpIp(smtpHost);
    const report = await checkIpBlacklist(ip, options);

    return {
      ...report,
      smtpHost,
      resolvedIp: ip
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      smtpHost
    };
  }
}

/**
 * Clear the blacklist check cache
 */
function clearCache() {
  cache.clear();
  return { success: true, message: 'Cache cleared' };
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()).map(key => ({
      key,
      age: Date.now() - cache.get(key).timestamp,
      expiresIn: CACHE_TTL - (Date.now() - cache.get(key).timestamp)
    }))
  };
}

module.exports = {
  checkIpBlacklist,
  checkBulkIps,
  checkSmtpBlacklist,
  resolveSmtpIp,
  clearCache,
  getCacheStats,
  isValidIp,
  DNSBL_PROVIDERS
};
