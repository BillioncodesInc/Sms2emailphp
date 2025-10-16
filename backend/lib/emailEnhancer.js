/**
 * Email Enhancer Module
 *
 * Provides advanced email content enhancements to improve deliverability and bypass spam filters.
 *
 * Features:
 * - Zero-width font tracking (invisible tracking without images)
 * - HTML attribute shuffling (makes each email unique)
 * - Macro expansion system ({email}, {firstname}, {url}, etc.)
 * - Content variation for mass sends
 *
 * Based on professional email sender best practices
 */

const crypto = require('crypto');

/**
 * Zero-Width Font Characters
 * These characters are invisible but can be detected when email is opened
 */
const ZERO_WIDTH_CHARS = [
  '\u200B', // Zero-width space
  '\u200C', // Zero-width non-joiner
  '\u200D', // Zero-width joiner
  '\uFEFF'  // Zero-width no-break space
];

/**
 * Generate zero-width font CSS for tracking
 * Embeds invisible characters that can be used for tracking opens
 *
 * @param {string} trackingId - Unique tracking identifier
 * @returns {string} CSS style block with zero-width fonts
 */
function generateZeroWidthTracking(trackingId) {
  if (!trackingId) {
    trackingId = crypto.randomBytes(8).toString('hex');
  }

  // Convert tracking ID to binary representation using zero-width characters
  const binary = trackingId.split('').map(char => {
    const code = char.charCodeAt(0).toString(2).padStart(8, '0');
    return code.split('').map(bit =>
      bit === '1' ? ZERO_WIDTH_CHARS[1] : ZERO_WIDTH_CHARS[0]
    ).join('');
  }).join(ZERO_WIDTH_CHARS[2]);

  // Embed in CSS that applies zero-width characters to specific elements
  const css = `
<style type="text/css">
  .zw-track::after {
    content: "${binary}";
    font-size: 0;
    line-height: 0;
    display: inline;
    color: transparent;
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }
</style>`;

  return {
    css,
    trackingId,
    marker: '<span class="zw-track"></span>'
  };
}

/**
 * Shuffle HTML attributes to make content unique
 * This helps avoid spam filters that detect identical mass emails
 *
 * @param {string} html - HTML content
 * @returns {string} HTML with shuffled attributes
 */
function shuffleAttributes(html) {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // Find all HTML tags with multiple attributes
  return html.replace(/<([a-z][a-z0-9]*)\s+([^>]+)>/gi, (match, tagName, attributes) => {
    // Parse attributes
    const attrRegex = /([a-z][a-z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
    const attrs = [];
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      const name = attrMatch[1];
      const value = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';
      attrs.push({ name, value });
    }

    // Shuffle attributes (using Fisher-Yates algorithm)
    for (let i = attrs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [attrs[i], attrs[j]] = [attrs[j], attrs[i]];
    }

    // Rebuild tag
    const shuffledAttrs = attrs.map(attr =>
      attr.value ? `${attr.name}="${attr.value}"` : attr.name
    ).join(' ');

    return `<${tagName} ${shuffledAttrs}>`;
  });
}

/**
 * Add random whitespace variations
 * Adds invisible variations to make each email slightly different
 *
 * @param {string} html - HTML content
 * @param {Object} options - Variation options
 * @returns {string} HTML with variations
 */
function addWhitespaceVariations(html, options = {}) {
  const { intensity = 'low' } = options;

  if (!html || typeof html !== 'string') {
    return html;
  }

  // Determine how many variations to add
  const variationCount = intensity === 'high' ? 10 : intensity === 'medium' ? 5 : 2;

  let result = html;

  for (let i = 0; i < variationCount; i++) {
    // Find random position between tags
    const tagEnds = [];
    let match;
    const regex = />/g;

    while ((match = regex.exec(result)) !== null) {
      tagEnds.push(match.index + 1);
    }

    if (tagEnds.length === 0) break;

    // Pick random position
    const randomPos = tagEnds[Math.floor(Math.random() * tagEnds.length)];

    // Insert random whitespace (space, newline, or zero-width)
    const whitespaces = [' ', '\n', '\r\n', ZERO_WIDTH_CHARS[0]];
    const randomWhitespace = whitespaces[Math.floor(Math.random() * whitespaces.length)];

    result = result.slice(0, randomPos) + randomWhitespace + result.slice(randomPos);
  }

  return result;
}

/**
 * Macro expansion system
 * Expands macros like {email}, {firstname}, {url} in content
 *
 * @param {string} content - Content with macros
 * @param {Object} data - Data to expand macros with
 * @returns {string} Content with expanded macros
 */
function expandMacros(content, data = {}) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let result = content;

  // Standard macro replacements
  const macros = {
    email: data.email || '',
    firstname: data.firstname || data.first_name || '',
    lastname: data.lastname || data.last_name || '',
    name: data.name || data.fullname || '',
    company: data.company || '',
    phone: data.phone || '',
    url: data.url || data.link || '',
    unsubscribe: data.unsubscribe || data.unsubscribe_url || '',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    year: new Date().getFullYear().toString(),
    ...data // Include any additional custom macros
  };

  // Replace macros in format {macro_name}
  Object.keys(macros).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, macros[key]);
  });

  // Handle conditional macros {if:fieldname}content{/if}
  result = result.replace(/\{if:([^}]+)\}(.*?)\{\/if\}/gi, (match, field, content) => {
    return macros[field.trim()] ? content : '';
  });

  return result;
}

/**
 * Extract firstname from full name or email
 * @param {string} nameOrEmail - Full name or email address
 * @returns {string} First name
 */
function extractFirstname(nameOrEmail) {
  if (!nameOrEmail) return '';

  // If it's an email, extract name part
  if (nameOrEmail.includes('@')) {
    const namePart = nameOrEmail.split('@')[0];
    // Try to extract firstname from email (e.g., john.doe@example.com -> john)
    const parts = namePart.split(/[._-]/);
    return capitalizeFirst(parts[0]);
  }

  // If it's a full name, get first word
  const parts = nameOrEmail.trim().split(/\s+/);
  return capitalizeFirst(parts[0]);
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate unique content variation for each recipient
 * Combines multiple techniques to make each email unique
 *
 * @param {string} html - Original HTML content
 * @param {Object} recipientData - Recipient-specific data
 * @param {Object} options - Enhancement options
 * @returns {string} Enhanced HTML
 */
function enhanceEmail(html, recipientData = {}, options = {}) {
  const {
    enableZeroWidth = true,
    enableAttributeShuffle = true,
    enableWhitespaceVariation = false,
    enableMacros = true,
    trackingId = null,
    variationIntensity = 'low'
  } = options;

  if (!html || typeof html !== 'string') {
    return html;
  }

  let result = html;

  // 1. Expand macros first
  if (enableMacros) {
    // Auto-extract firstname if not provided
    if (!recipientData.firstname && recipientData.email) {
      recipientData.firstname = extractFirstname(recipientData.email);
    }
    if (!recipientData.name && recipientData.email) {
      recipientData.name = extractFirstname(recipientData.email);
    }

    result = expandMacros(result, recipientData);
  }

  // 2. Add zero-width tracking
  if (enableZeroWidth) {
    const tracking = generateZeroWidthTracking(trackingId || recipientData.email);

    // Insert CSS in head or at beginning
    if (result.includes('</head>')) {
      result = result.replace('</head>', tracking.css + '</head>');
    } else if (result.includes('<body')) {
      result = result.replace('<body', tracking.css + '<body');
    } else {
      result = tracking.css + result;
    }

    // Insert marker at end of body or content
    if (result.includes('</body>')) {
      result = result.replace('</body>', tracking.marker + '</body>');
    } else {
      result += tracking.marker;
    }
  }

  // 3. Shuffle HTML attributes
  if (enableAttributeShuffle) {
    result = shuffleAttributes(result);
  }

  // 4. Add whitespace variations
  if (enableWhitespaceVariation) {
    result = addWhitespaceVariations(result, { intensity: variationIntensity });
  }

  return result;
}

/**
 * Batch enhance multiple emails
 * @param {string} html - Template HTML
 * @param {Array<Object>} recipients - Array of recipient data
 * @param {Object} options - Enhancement options
 * @returns {Array<Object>} Array of {email, html} objects
 */
function batchEnhance(html, recipients, options = {}) {
  if (!Array.isArray(recipients)) {
    return [];
  }

  return recipients.map(recipient => ({
    email: recipient.email,
    html: enhanceEmail(html, recipient, options),
    recipientData: recipient
  }));
}

/**
 * Validate enhancement options
 * @param {Object} options - Options to validate
 * @returns {Object} Validation result
 */
function validateOptions(options) {
  const errors = [];

  if (options.variationIntensity && !['low', 'medium', 'high'].includes(options.variationIntensity)) {
    errors.push('variationIntensity must be one of: low, medium, high');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get available macros documentation
 * @returns {Array} Array of macro documentation
 */
function getAvailableMacros() {
  return [
    { macro: '{email}', description: 'Recipient email address' },
    { macro: '{firstname}', description: 'Recipient first name' },
    { macro: '{lastname}', description: 'Recipient last name' },
    { macro: '{name}', description: 'Recipient full name' },
    { macro: '{company}', description: 'Recipient company' },
    { macro: '{phone}', description: 'Recipient phone number' },
    { macro: '{url}', description: 'Custom URL or link' },
    { macro: '{unsubscribe}', description: 'Unsubscribe link' },
    { macro: '{date}', description: 'Current date' },
    { macro: '{time}', description: 'Current time' },
    { macro: '{year}', description: 'Current year' },
    { macro: '{if:fieldname}content{/if}', description: 'Conditional content (shows if field exists)' }
  ];
}

module.exports = {
  generateZeroWidthTracking,
  shuffleAttributes,
  addWhitespaceVariations,
  expandMacros,
  extractFirstname,
  enhanceEmail,
  batchEnhance,
  validateOptions,
  getAvailableMacros,
  ZERO_WIDTH_CHARS
};
