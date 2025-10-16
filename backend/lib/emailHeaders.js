/**
 * Email Headers Module
 *
 * Provides custom email headers to improve deliverability and bypass spam filters.
 * Based on professional email sender best practices.
 *
 * Features:
 * - Provider-specific headers (Gmail, Outlook, Yahoo, Apple Mail)
 * - Read receipt headers (6 types)
 * - Authentication headers
 * - Custom X-Mailer spoofing
 * - Priority and importance headers
 */

const crypto = require('crypto');

/**
 * Detect email provider from recipient address
 * @param {string} email - Recipient email address
 * @returns {string} Provider name (gmail, outlook, yahoo, apple, other)
 */
function detectProvider(email) {
  if (!email || typeof email !== 'string') {
    return 'other';
  }

  const domain = email.toLowerCase().split('@')[1];

  if (!domain) {
    return 'other';
  }

  // Gmail and Google Workspace
  if (domain.includes('gmail.com') || domain.includes('googlemail.com')) {
    return 'gmail';
  }

  // Outlook, Hotmail, Live, MSN
  if (domain.includes('outlook.') || domain.includes('hotmail.') ||
      domain.includes('live.') || domain.includes('msn.')) {
    return 'outlook';
  }

  // Yahoo
  if (domain.includes('yahoo.') || domain.includes('ymail.') || domain.includes('rocketmail.')) {
    return 'yahoo';
  }

  // Apple Mail (iCloud, me.com, mac.com)
  if (domain.includes('icloud.com') || domain.includes('me.com') || domain.includes('mac.com')) {
    return 'apple';
  }

  return 'other';
}

/**
 * Generate Message-ID header
 * @param {string} fromEmail - Sender email address
 * @returns {string} Message-ID
 */
function generateMessageId(fromEmail) {
  const domain = fromEmail.split('@')[1] || 'localhost';
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `<${timestamp}.${random}@${domain}>`;
}

/**
 * Get read receipt headers
 * Implements 6 types of receipt request headers for maximum compatibility
 * @param {string} replyTo - Email address to send receipts to
 * @returns {Object} Read receipt headers
 */
function getReadReceiptHeaders(replyTo) {
  if (!replyTo) {
    return {};
  }

  return {
    'Disposition-Notification-To': replyTo,
    'Return-Receipt-To': replyTo,
    'X-Confirm-Reading-To': replyTo,
    'Return-Path': replyTo,
    'Errors-To': replyTo,
    'X-Return-Receipt-To': replyTo
  };
}

/**
 * Get provider-specific headers optimized for deliverability
 * @param {string} provider - Provider name (gmail, outlook, yahoo, apple, other)
 * @param {Object} options - Header options
 * @returns {Object} Custom headers
 */
function getProviderHeaders(provider, options = {}) {
  const {
    fromEmail = 'noreply@example.com',
    priority = 'normal', // normal, high, low
    enableReadReceipt = false,
    replyTo = null,
    customMailer = null
  } = options;

  // Base headers for all providers
  const baseHeaders = {
    'Message-ID': generateMessageId(fromEmail),
    'X-Priority': priority === 'high' ? '1' : priority === 'low' ? '5' : '3',
    'Importance': priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'normal',
    'X-MSMail-Priority': priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Normal',
    'MIME-Version': '1.0'
  };

  // Add read receipt headers if enabled
  if (enableReadReceipt && replyTo) {
    Object.assign(baseHeaders, getReadReceiptHeaders(replyTo));
  }

  // Provider-specific optimizations
  switch (provider) {
    case 'gmail':
      return {
        ...baseHeaders,
        'X-Mailer': customMailer || 'Gmail/1.0',
        'X-Google-ID': crypto.randomBytes(16).toString('hex'),
        'X-Gm-Message-State': crypto.randomBytes(32).toString('base64'),
        'Precedence': 'bulk',
        'List-Unsubscribe': replyTo ? `<mailto:${replyTo}?subject=unsubscribe>` : undefined,
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      };

    case 'outlook':
      return {
        ...baseHeaders,
        'X-Mailer': customMailer || 'Microsoft Outlook 16.0',
        'Thread-Index': crypto.randomBytes(27).toString('base64'),
        'X-MS-Has-Attach': 'no',
        'X-MS-Exchange-Organization-SCL': '-1',
        'X-MS-TNEF-Correlator': crypto.randomBytes(16).toString('hex'),
        'X-Auto-Response-Suppress': 'All',
        'Precedence': 'bulk'
      };

    case 'yahoo':
      return {
        ...baseHeaders,
        'X-Mailer': customMailer || 'YahooMailClassic/1.0',
        'X-Yahoo-Newman-Id': crypto.randomBytes(16).toString('hex'),
        'X-Yahoo-Newman-Property': 'ymail-3',
        'X-YMail-OSG': crypto.randomBytes(32).toString('base64').substring(0, 40),
        'Precedence': 'bulk'
      };

    case 'apple':
      return {
        ...baseHeaders,
        'X-Mailer': customMailer || 'Apple Mail (2.3774.600.62)',
        'X-Uniform-Type-Identifier': `com.apple.mail-draft; uuid=${crypto.randomUUID()}`,
        'X-Universally-Unique-Identifier': crypto.randomUUID(),
        'Precedence': 'bulk'
      };

    default:
      return {
        ...baseHeaders,
        'X-Mailer': customMailer || 'Nodemailer/6.9',
        'Precedence': 'bulk',
        'List-Unsubscribe': replyTo ? `<mailto:${replyTo}?subject=unsubscribe>` : undefined
      };
  }
}

/**
 * Get custom headers for an email based on recipient
 * Main function to be called when sending emails
 *
 * @param {string} toEmail - Recipient email address
 * @param {Object} options - Header options
 * @returns {Object} Custom headers object
 */
function getCustomHeaders(toEmail, options = {}) {
  const provider = detectProvider(toEmail);
  const headers = getProviderHeaders(provider, options);

  // Remove undefined values
  Object.keys(headers).forEach(key => {
    if (headers[key] === undefined) {
      delete headers[key];
    }
  });

  return headers;
}

/**
 * Get bulk custom headers for multiple recipients
 * Optimized for batch processing
 *
 * @param {Array<string>} emails - Array of recipient email addresses
 * @param {Object} options - Header options
 * @returns {Array<Object>} Array of {email, headers} objects
 */
function getBulkCustomHeaders(emails, options = {}) {
  if (!Array.isArray(emails)) {
    return [];
  }

  return emails.map(email => ({
    email,
    provider: detectProvider(email),
    headers: getCustomHeaders(email, options)
  }));
}

/**
 * Validate email header options
 * @param {Object} options - Options to validate
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
function validateHeaderOptions(options) {
  const errors = [];

  if (options.priority && !['high', 'normal', 'low'].includes(options.priority)) {
    errors.push('Priority must be one of: high, normal, low');
  }

  if (options.fromEmail && !options.fromEmail.includes('@')) {
    errors.push('Invalid fromEmail format');
  }

  if (options.replyTo && !options.replyTo.includes('@')) {
    errors.push('Invalid replyTo format');
  }

  if (options.enableReadReceipt && !options.replyTo) {
    errors.push('replyTo is required when enableReadReceipt is true');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  detectProvider,
  generateMessageId,
  getReadReceiptHeaders,
  getProviderHeaders,
  getCustomHeaders,
  getBulkCustomHeaders,
  validateHeaderOptions
};
