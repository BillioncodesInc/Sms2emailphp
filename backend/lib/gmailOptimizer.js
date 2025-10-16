/**
 * Gmail Optimizer Module
 *
 * Implements Gmail-specific optimizations to improve deliverability and avoid spam filters.
 * Gmail has strict rate limiting and aggressive spam detection, so special handling is required.
 *
 * Features:
 * - Auto-detection of Gmail recipients
 * - Slow mode with 6-second delays between Gmail sends
 * - Gmail-specific sending statistics
 * - Batch optimization for mixed recipient lists
 *
 * Based on industry best practices for Gmail deliverability
 */

const emailHeaders = require('./emailHeaders');

// Gmail domains to detect
const GMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'google.com'
];

// Default delays (in milliseconds)
const DEFAULT_GMAIL_DELAY = 6000; // 6 seconds between Gmail sends
const DEFAULT_OTHER_DELAY = 1000; // 1 second between non-Gmail sends

/**
 * Check if email address is a Gmail address
 * @param {string} email - Email address to check
 * @returns {boolean} True if Gmail
 */
function isGmailAddress(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const domain = email.toLowerCase().split('@')[1];
  if (!domain) {
    return false;
  }

  return GMAIL_DOMAINS.some(gmailDomain => domain === gmailDomain || domain.endsWith('.' + gmailDomain));
}

/**
 * Separate recipients into Gmail and non-Gmail groups
 * @param {Array<string>} recipients - Array of email addresses
 * @returns {Object} Grouped recipients
 */
function groupRecipients(recipients) {
  if (!Array.isArray(recipients)) {
    return { gmail: [], other: [] };
  }

  const gmail = [];
  const other = [];

  recipients.forEach(email => {
    if (isGmailAddress(email)) {
      gmail.push(email);
    } else {
      other.push(email);
    }
  });

  return { gmail, other };
}

/**
 * Calculate optimal sending strategy for mixed recipient list
 * @param {Array<string>} recipients - Array of email addresses
 * @param {Object} options - Strategy options
 * @returns {Object} Sending strategy
 */
function calculateStrategy(recipients, options = {}) {
  const {
    gmailDelay = DEFAULT_GMAIL_DELAY,
    otherDelay = DEFAULT_OTHER_DELAY,
    interleave = true // Whether to interleave Gmail and non-Gmail sends
  } = options;

  const { gmail, other } = groupRecipients(recipients);

  // Calculate estimated time
  const gmailTime = gmail.length * gmailDelay;
  const otherTime = other.length * otherDelay;
  const totalTime = gmailTime + otherTime;

  // Create interleaved send order if requested
  let sendOrder = [];
  if (interleave && gmail.length > 0 && other.length > 0) {
    // Interleave to spread Gmail sends throughout the batch
    const ratio = other.length / gmail.length;
    let gmailIndex = 0;
    let otherIndex = 0;

    while (gmailIndex < gmail.length || otherIndex < other.length) {
      // Add non-Gmail emails based on ratio
      const otherCount = Math.floor(ratio);
      for (let i = 0; i < otherCount && otherIndex < other.length; i++) {
        sendOrder.push({
          email: other[otherIndex++],
          isGmail: false,
          delay: otherDelay
        });
      }

      // Add one Gmail email
      if (gmailIndex < gmail.length) {
        sendOrder.push({
          email: gmail[gmailIndex++],
          isGmail: true,
          delay: gmailDelay
        });
      }
    }
  } else {
    // Send all non-Gmail first, then Gmail
    other.forEach(email => {
      sendOrder.push({
        email,
        isGmail: false,
        delay: otherDelay
      });
    });

    gmail.forEach(email => {
      sendOrder.push({
        email,
        isGmail: true,
        delay: gmailDelay
      });
    });
  }

  return {
    total: recipients.length,
    gmailCount: gmail.length,
    otherCount: other.length,
    gmailPercentage: Math.round((gmail.length / recipients.length) * 100),
    estimatedTime: totalTime,
    estimatedTimeFormatted: formatDuration(totalTime),
    sendOrder,
    strategy: interleave ? 'interleaved' : 'sequential',
    delays: {
      gmail: gmailDelay,
      other: otherDelay
    }
  };
}

/**
 * Format duration in milliseconds to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get recommended delay for an email address
 * @param {string} email - Email address
 * @param {Object} options - Delay options
 * @returns {number} Delay in milliseconds
 */
function getRecommendedDelay(email, options = {}) {
  const {
    gmailDelay = DEFAULT_GMAIL_DELAY,
    otherDelay = DEFAULT_OTHER_DELAY
  } = options;

  return isGmailAddress(email) ? gmailDelay : otherDelay;
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send emails with Gmail optimization
 * This is a helper that wraps a send function with proper delays
 *
 * @param {Array<string>} recipients - Email addresses
 * @param {Function} sendFunction - Function that sends one email (async)
 * @param {Object} options - Send options
 * @returns {Promise<Object>} Results
 */
async function sendWithGmailOptimization(recipients, sendFunction, options = {}) {
  const {
    gmailDelay = DEFAULT_GMAIL_DELAY,
    otherDelay = DEFAULT_OTHER_DELAY,
    interleave = true,
    onProgress = null // Callback for progress updates
  } = options;

  const strategy = calculateStrategy(recipients, { gmailDelay, otherDelay, interleave });
  const results = {
    success: [],
    failed: [],
    strategy,
    startTime: new Date(),
    endTime: null,
    duration: null
  };

  let completed = 0;

  for (const item of strategy.sendOrder) {
    try {
      // Send the email
      const result = await sendFunction(item.email);
      results.success.push({
        email: item.email,
        isGmail: item.isGmail,
        result
      });
    } catch (err) {
      results.failed.push({
        email: item.email,
        isGmail: item.isGmail,
        error: err.message
      });
    }

    completed++;

    // Progress callback
    if (onProgress && typeof onProgress === 'function') {
      onProgress({
        completed,
        total: strategy.total,
        percentage: Math.round((completed / strategy.total) * 100),
        current: item.email,
        isGmail: item.isGmail
      });
    }

    // Apply delay before next send (except for last email)
    if (completed < strategy.total) {
      await sleep(item.delay);
    }
  }

  results.endTime = new Date();
  results.duration = results.endTime - results.startTime;

  return results;
}

/**
 * Get Gmail optimization recommendations
 * @param {Array<string>} recipients - Email addresses
 * @returns {Object} Recommendations
 */
function getRecommendations(recipients) {
  const { gmail, other } = groupRecipients(recipients);
  const gmailPercentage = (gmail.length / recipients.length) * 100;

  const recommendations = [];

  if (gmailPercentage > 50) {
    recommendations.push({
      severity: 'warning',
      message: `${gmailPercentage.toFixed(0)}% of recipients are Gmail users. Consider enabling Gmail slow mode.`,
      action: 'Enable slow mode with 6-second delays between Gmail sends'
    });
  }

  if (gmail.length > 100) {
    recommendations.push({
      severity: 'critical',
      message: `Sending to ${gmail.length} Gmail addresses. This will take approximately ${formatDuration(gmail.length * DEFAULT_GMAIL_DELAY)}.`,
      action: 'Consider splitting into smaller batches or using multiple SMTPs'
    });
  }

  if (gmailPercentage > 0 && gmailPercentage < 100) {
    recommendations.push({
      severity: 'info',
      message: 'Mixed recipient list detected (Gmail and non-Gmail).',
      action: 'Consider using interleaved sending to spread Gmail sends throughout the campaign'
    });
  }

  if (gmail.length > 0) {
    recommendations.push({
      severity: 'info',
      message: 'Gmail-specific headers will be applied automatically for better deliverability.',
      action: 'No action required - headers are handled automatically'
    });
  }

  return {
    gmailCount: gmail.length,
    otherCount: other.length,
    gmailPercentage: gmailPercentage.toFixed(1),
    recommendations,
    estimatedTime: formatDuration((gmail.length * DEFAULT_GMAIL_DELAY) + (other.length * DEFAULT_OTHER_DELAY))
  };
}

/**
 * Validate Gmail optimization options
 * @param {Object} options - Options to validate
 * @returns {Object} Validation result
 */
function validateOptions(options) {
  const errors = [];

  if (options.gmailDelay !== undefined) {
    if (typeof options.gmailDelay !== 'number' || options.gmailDelay < 0) {
      errors.push('gmailDelay must be a positive number');
    }
    if (options.gmailDelay < 3000) {
      errors.push('gmailDelay should be at least 3000ms (3 seconds) for Gmail safety');
    }
  }

  if (options.otherDelay !== undefined) {
    if (typeof options.otherDelay !== 'number' || options.otherDelay < 0) {
      errors.push('otherDelay must be a positive number');
    }
  }

  if (options.interleave !== undefined && typeof options.interleave !== 'boolean') {
    errors.push('interleave must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  isGmailAddress,
  groupRecipients,
  calculateStrategy,
  getRecommendedDelay,
  sendWithGmailOptimization,
  getRecommendations,
  validateOptions,
  formatDuration,
  sleep,
  DEFAULT_GMAIL_DELAY,
  DEFAULT_OTHER_DELAY,
  GMAIL_DOMAINS
};
