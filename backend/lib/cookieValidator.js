/**
 * Cookie Validation Utility
 *
 * Validates cookie files for Gmail and Outlook inbox searching
 * Supports the format used in cookie.txt sample file
 */

/**
 * Parse and validate a cookie text file
 * @param {string} fileContent - Raw content of the cookie file
 * @returns {Object} - { valid: boolean, cookies: Array, email: string, password: string, ipaddress: string, provider: string, error: string }
 */
function validateCookieFile(fileContent) {
  try {
    // Remove IIFE wrapper if present
    let cleanContent = fileContent.trim();

    // Check if it's wrapped in an IIFE
    if (cleanContent.startsWith('(() => {') && cleanContent.endsWith('})();')) {
      cleanContent = cleanContent.slice(8, -5);
    } else if (cleanContent.startsWith('(function() {') && cleanContent.endsWith('})();')) {
      cleanContent = cleanContent.slice(13, -5);
    }

    // Extract credentials using regex
    const ipMatch = cleanContent.match(/let\s+ipaddress\s*=\s*[`'"](.*?)[`'"]/);
    const emailMatch = cleanContent.match(/let\s+email\s*=\s*[`'"](.*?)[`'"]/);
    const passwordMatch = cleanContent.match(/let\s+password\s*=\s*[`'"](.*?)[`'"]/);
    const cookiesMatch = cleanContent.match(/let\s+cookies\s*=\s*(\[[\s\S]*?\]);/);

    if (!emailMatch || !cookiesMatch) {
      return {
        valid: false,
        error: 'Invalid cookie file format. Missing email or cookies array.'
      };
    }

    const email = emailMatch[1];
    const password = passwordMatch ? passwordMatch[1] : '';
    const ipaddress = ipMatch ? ipMatch[1] : '';

    // Detect provider from email or cookies
    let provider = detectProvider(email, cleanContent);

    // Parse cookies array
    let cookies;
    try {
      cookies = JSON.parse(cookiesMatch[1]);
    } catch (parseErr) {
      return {
        valid: false,
        error: 'Invalid cookies JSON format: ' + parseErr.message
      };
    }

    // Validate cookies array
    if (!Array.isArray(cookies) || cookies.length === 0) {
      return {
        valid: false,
        error: 'Cookies must be a non-empty array'
      };
    }

    // Validate each cookie object
    const requiredFields = ['name', 'value', 'domain'];
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];

      for (const field of requiredFields) {
        if (!cookie.hasOwnProperty(field)) {
          return {
            valid: false,
            error: `Cookie at index ${i} is missing required field: ${field}`
          };
        }
      }
    }

    // Validate that AT LEAST ONE cookie matches the provider domain
    // (Real browser sessions include cookies from CDN, analytics, etc.)
    const hasProviderCookie = cookies.some(cookie => {
      if (provider === 'gmail') {
        return cookie.domain.includes('google.com') || cookie.domain.includes('gmail.com');
      }
      if (provider === 'outlook') {
        return cookie.domain.includes('outlook.com') ||
               cookie.domain.includes('live.com') ||
               cookie.domain.includes('microsoft.com');
      }
      return false;
    });

    if (!hasProviderCookie) {
      return {
        valid: false,
        error: `No ${provider} cookies found. Please ensure cookies are from an active ${provider} session.`
      };
    }

    return {
      valid: true,
      cookies,
      email,
      password,
      ipaddress,
      provider,
      cookieCount: cookies.length
    };

  } catch (err) {
    return {
      valid: false,
      error: 'Failed to parse cookie file: ' + err.message
    };
  }
}

/**
 * Detect email provider from email address or cookie domains
 * @param {string} email - Email address
 * @param {string} content - File content to check for domains
 * @returns {string} - 'gmail' or 'outlook' or 'unknown'
 */
function detectProvider(email, content) {
  // Check email domain
  if (email) {
    const emailLower = email.toLowerCase();
    if (emailLower.includes('@gmail.com') || emailLower.includes('@googlemail.com')) {
      return 'gmail';
    }
    if (emailLower.includes('@outlook.com') ||
        emailLower.includes('@hotmail.com') ||
        emailLower.includes('@live.com') ||
        emailLower.includes('@msn.com')) {
      return 'outlook';
    }
  }

  // Check cookie domains in content
  const contentLower = content.toLowerCase();
  const hasGoogleDomain = contentLower.includes('google.com') || contentLower.includes('gmail.com');
  const hasOutlookDomain = contentLower.includes('outlook.com') ||
                           contentLower.includes('live.com') ||
                           contentLower.includes('microsoft.com');

  if (hasGoogleDomain && !hasOutlookDomain) return 'gmail';
  if (hasOutlookDomain && !hasGoogleDomain) return 'outlook';

  return 'unknown';
}

/**
 * Validate file size (max 50MB)
 * @param {number} sizeInBytes - File size in bytes
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateFileSize(sizeInBytes) {
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (sizeInBytes > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (50MB). File size: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
    };
  }

  return { valid: true };
}

/**
 * Validate multiple cookie files
 * @param {Array} files - Array of { name, content, size }
 * @returns {Object} - { valid: boolean, results: Array, errors: Array }
 */
function validateMultipleCookieFiles(files) {
  const results = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      errors.push({
        fileName: file.name,
        error: sizeValidation.error
      });
      continue;
    }

    // Validate content
    const validation = validateCookieFile(file.content);

    if (validation.valid) {
      results.push({
        fileName: file.name,
        email: validation.email,
        provider: validation.provider,
        cookieCount: validation.cookieCount,
        cookies: validation.cookies,
        password: validation.password,
        ipaddress: validation.ipaddress
      });
    } else {
      errors.push({
        fileName: file.name,
        error: validation.error
      });
    }
  }

  return {
    valid: errors.length === 0,
    validCount: results.length,
    errorCount: errors.length,
    results,
    errors
  };
}

/**
 * Sanitize cookie data for storage (remove sensitive info from logs)
 * @param {Object} cookieData - Cookie validation result
 * @returns {Object} - Sanitized version
 */
function sanitizeCookieData(cookieData) {
  return {
    email: cookieData.email,
    provider: cookieData.provider,
    cookieCount: cookieData.cookieCount,
    hasPassword: !!cookieData.password,
    hasIpAddress: !!cookieData.ipaddress
    // Note: Don't include actual cookies, password, or IP in logs
  };
}

module.exports = {
  validateCookieFile,
  validateFileSize,
  validateMultipleCookieFiles,
  detectProvider,
  sanitizeCookieData
};
