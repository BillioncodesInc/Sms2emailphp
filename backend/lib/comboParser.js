/**
 * Combo Parser Module
 *
 * Parses email:password combo lists in various formats
 * Supported formats:
 * - email:password
 * - password:email
 * - email|password
 * - password|email
 * - Auto-detection
 */

class ComboParser {
  /**
   * Parse combo text into structured array
   * @param {string} text - Raw combo text (one combo per line)
   * @param {string} format - Format hint (email:password, password:email, auto)
   * @returns {Object} { combos: [{email, password}], errors: [{line, text, error}] }
   */
  parse(text, format = 'auto') {
    if (!text || typeof text !== 'string') {
      return { combos: [], errors: [{ line: 0, text: '', error: 'Empty input' }] };
    }

    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#')); // Skip empty lines and comments

    const combos = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        const combo = this.parseLine(lines[i], format);
        if (combo) {
          combos.push(combo);
        }
      } catch (error) {
        errors.push({
          line: i + 1,
          text: lines[i],
          error: error.message
        });
      }
    }

    return { combos, errors };
  }

  /**
   * Parse a single combo line
   * @param {string} line - Single combo line
   * @param {string} format - Format hint
   * @returns {Object} { email, password }
   */
  parseLine(line, format) {
    // Detect separator
    let separator = ':';
    if (line.includes('|') && !line.includes(':')) {
      separator = '|';
    } else if (line.includes(':') && line.includes('|')) {
      // Both present - prefer :
      separator = ':';
    }

    const parts = line.split(separator);
    if (parts.length !== 2) {
      throw new Error('Invalid format - expected 2 parts separated by : or |');
    }

    const [part1, part2] = parts.map(p => p.trim());

    if (!part1 || !part2) {
      throw new Error('Empty email or password');
    }

    // Auto-detect format based on email pattern
    if (format === 'auto') {
      if (this.isEmail(part1)) {
        return { email: part1, password: part2 };
      } else if (this.isEmail(part2)) {
        return { email: part2, password: part1 };
      } else {
        throw new Error('No valid email found in either position');
      }
    }

    // Use specified format
    if (format === 'email:password' || format === 'email|password') {
      if (!this.isEmail(part1)) {
        throw new Error('First part is not a valid email');
      }
      return { email: part1, password: part2 };
    }

    if (format === 'password:email' || format === 'password|email') {
      if (!this.isEmail(part2)) {
        throw new Error('Second part is not a valid email');
      }
      return { email: part2, password: part1 };
    }

    throw new Error('Unknown format');
  }

  /**
   * Validate email format
   * @param {string} str - String to validate
   * @returns {boolean} True if valid email
   */
  isEmail(str) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Validate combo list before processing
   * Checks for duplicates, invalid emails, empty passwords
   * @param {Array} combos - Array of combo objects
   * @returns {Object} Validation result
   */
  validate(combos) {
    const issues = [];
    const seen = new Set();
    const uniqueEmails = new Set();

    for (let i = 0; i < combos.length; i++) {
      const combo = combos[i];

      // Check duplicates (exact combo)
      const key = `${combo.email}:${combo.password}`;
      if (seen.has(key)) {
        issues.push({
          index: i,
          email: combo.email,
          issue: 'Duplicate combo'
        });
      }
      seen.add(key);

      // Track unique emails
      uniqueEmails.add(combo.email);

      // Validate email format
      if (!this.isEmail(combo.email)) {
        issues.push({
          index: i,
          email: combo.email,
          issue: 'Invalid email format'
        });
      }

      // Check password length
      if (combo.password.length < 1) {
        issues.push({
          index: i,
          email: combo.email,
          issue: 'Empty password'
        });
      }

      // Warn about weak passwords (optional)
      if (combo.password.length < 6) {
        issues.push({
          index: i,
          email: combo.email,
          issue: 'Warning: Password shorter than 6 characters',
          severity: 'warning'
        });
      }
    }

    return {
      valid: issues.filter(i => i.severity !== 'warning').length === 0,
      issues,
      stats: {
        total: combos.length,
        unique: seen.size,
        uniqueEmails: uniqueEmails.size,
        duplicates: combos.length - seen.size,
        errors: issues.filter(i => i.severity !== 'warning').length,
        warnings: issues.filter(i => i.severity === 'warning').length
      }
    };
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
   * Group combos by domain
   * Useful for batch processing by domain
   * @param {Array} combos - Array of combo objects
   * @returns {Map} Map of domain -> combos[]
   */
  groupByDomain(combos) {
    const groups = new Map();

    for (const combo of combos) {
      const domain = this.extractDomain(combo.email);
      if (domain) {
        if (!groups.has(domain)) {
          groups.set(domain, []);
        }
        groups.get(domain).push(combo);
      }
    }

    return groups;
  }

  /**
   * Get statistics about combo list
   * @param {Array} combos - Array of combo objects
   * @returns {Object} Statistics
   */
  getStats(combos) {
    const domains = new Map();
    const passwordLengths = [];

    for (const combo of combos) {
      const domain = this.extractDomain(combo.email);
      if (domain) {
        domains.set(domain, (domains.get(domain) || 0) + 1);
      }
      passwordLengths.push(combo.password.length);
    }

    // Calculate password length statistics
    const avgPasswordLength = passwordLengths.length > 0
      ? passwordLengths.reduce((a, b) => a + b, 0) / passwordLengths.length
      : 0;

    const sortedPasswordLengths = [...passwordLengths].sort((a, b) => a - b);
    const medianPasswordLength = sortedPasswordLengths.length > 0
      ? sortedPasswordLengths[Math.floor(sortedPasswordLengths.length / 2)]
      : 0;

    // Get top domains
    const topDomains = Array.from(domains.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    return {
      totalCombos: combos.length,
      uniqueDomains: domains.size,
      topDomains,
      passwordStats: {
        avgLength: Math.round(avgPasswordLength * 10) / 10,
        medianLength: medianPasswordLength,
        minLength: Math.min(...passwordLengths),
        maxLength: Math.max(...passwordLengths)
      }
    };
  }

  /**
   * Sanitize combo list (remove invalid entries)
   * @param {Array} combos - Array of combo objects
   * @returns {Array} Sanitized combos
   */
  sanitize(combos) {
    return combos.filter(combo => {
      return this.isEmail(combo.email) && combo.password.length >= 1;
    });
  }

  /**
   * Remove duplicates from combo list
   * @param {Array} combos - Array of combo objects
   * @returns {Array} Deduplicated combos
   */
  deduplicate(combos) {
    const seen = new Set();
    const unique = [];

    for (const combo of combos) {
      const key = `${combo.email}:${combo.password}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(combo);
      }
    }

    return unique;
  }

  /**
   * Format combos for export
   * @param {Array} combos - Array of combo objects
   * @param {string} format - Output format (email:password, password:email, etc.)
   * @returns {string} Formatted text
   */
  format(combos, format = 'email:password') {
    const separator = format.includes('|') ? '|' : ':';

    return combos.map(combo => {
      if (format.startsWith('email')) {
        return `${combo.email}${separator}${combo.password}`;
      } else {
        return `${combo.password}${separator}${combo.email}`;
      }
    }).join('\n');
  }
}

// Create singleton instance
const comboParser = new ComboParser();

module.exports = comboParser;
