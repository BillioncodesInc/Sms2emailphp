'use strict';

const crypto = require('crypto-js');
const { URL } = require('url');

/**
 * 11-Step Enhanced Link Obfuscation System
 * Military-grade link protection with rotation and replacement
 */

class LinkProtection {
  constructor() {
    // Link rotation pool
    this.redirectDomains = [
      'link-guard.io',
      'secure-redirect.net',
      'safe-link.co',
      'protected-url.com',
      'link-shield.org'
    ];

    // TLD variations for obfuscation
    this.tldVariations = ['.co', '.io', '.net', '.org', '.site', '.online', '.tech'];

    // Character substitution map
    this.charSubstitution = {
      'a': ['а', 'ɑ', 'α'],
      'e': ['е', 'ė', 'ē'],
      'o': ['о', 'ο', 'ọ'],
      'i': ['і', 'ɪ', 'ї'],
      'c': ['с', 'ϲ', 'ċ']
    };
  }

  /**
   * STEP 1: Base64 URL Encoding
   */
  step1_base64Encode(url) {
    const base64 = Buffer.from(url).toString('base64');
    // URL-safe base64
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * STEP 2: AES-256 Encryption
   */
  step2_aesEncrypt(url, key = 'SE_GATEWAY_SECRET_KEY_2025') {
    if (!url) {
      console.warn('Step2: URL is empty, skipping AES encryption');
      return url;
    }
    if (!key) {
      key = 'SE_GATEWAY_SECRET_KEY_2025';
    }
    try {
      const encrypted = crypto.AES.encrypt(url, key).toString();
      return encodeURIComponent(encrypted);
    } catch (error) {
      console.error('AES encryption error:', error.message);
      return url; // Return original URL if encryption fails
    }
  }

  /**
   * STEP 3: URL Fragment Splitting
   */
  step3_fragmentSplit(url) {
    const parts = url.match(/.{1,10}/g) || [];
    return parts.join(':');
  }

  /**
   * STEP 4: Homoglyph Character Substitution
   */
  step4_homoglyphSubstitution(url) {
    let obfuscated = url;
    for (const [char, substitutes] of Object.entries(this.charSubstitution)) {
      const regex = new RegExp(char, 'gi');
      obfuscated = obfuscated.replace(regex, () => {
        return substitutes[Math.floor(Math.random() * substitutes.length)];
      });
    }
    return obfuscated;
  }

  /**
   * STEP 5: URL Shortening Simulation
   */
  step5_shortCode(url) {
    const hash = crypto.SHA256(url + Date.now()).toString();
    return hash.substring(0, 8);
  }

  /**
   * STEP 6: Redirect Chain Generation
   */
  step6_redirectChain(url, depth = 3) {
    let chain = url;
    for (let i = 0; i < depth; i++) {
      const domain = this.redirectDomains[i % this.redirectDomains.length];
      const encoded = this.step1_base64Encode(chain);
      chain = `https://${domain}/r/${encoded}`;
    }
    return chain;
  }

  /**
   * STEP 7: TLD Rotation
   */
  step7_tldRotation(url) {
    try {
      const urlObj = new URL(url);
      const currentTLD = urlObj.hostname.split('.').pop();
      const newTLD = this.tldVariations[Math.floor(Math.random() * this.tldVariations.length)];
      urlObj.hostname = urlObj.hostname.replace(`.${currentTLD}`, newTLD);
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * STEP 8: Query Parameter Obfuscation
   */
  step8_queryObfuscation(url, originalUrl) {
    const params = [
      `u=${this.step1_base64Encode(originalUrl)}`,
      `t=${Date.now()}`,
      `h=${crypto.SHA256(originalUrl).toString().substring(0, 16)}`,
      `s=${Math.random().toString(36).substring(7)}`,
      `v=2.0`,
      `ref=organic`
    ];
    return `${url}?${params.join('&')}`;
  }

  /**
   * STEP 9: Unicode Encoding
   */
  step9_unicodeEncode(url) {
    return Array.from(url)
      .map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
      .join('');
  }

  /**
   * STEP 10: HTML Entity Encoding
   */
  step10_htmlEntityEncode(url) {
    return Array.from(url)
      .map(char => `&#${char.charCodeAt(0)};`)
      .join('');
  }

  /**
   * STEP 11: Zero-Width Character Injection
   */
  step11_zeroWidthInjection(url) {
    const zeroWidth = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
    let result = '';
    for (let i = 0; i < url.length; i++) {
      result += url[i];
      if (i % 3 === 0 && i > 0) {
        result += zeroWidth[Math.floor(Math.random() * zeroWidth.length)];
      }
    }
    return result;
  }

  /**
   * Master Obfuscation Method
   * Applies all 11 steps with configurable intensity
   */
  obfuscateLink(url, options = {}) {
    const {
      level = 'high', // low, medium, high, maximum
      includeSteps = 'all', // array of step numbers or 'all'
      customKey = null,
      redirectDepth = 2
    } = options;

    const levelConfig = {
      low: [1, 5, 8],
      medium: [1, 2, 5, 6, 8],
      high: [1, 2, 3, 5, 6, 8, 10],
      maximum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };

    const steps = includeSteps === 'all' ? levelConfig[level] : includeSteps;
    let obfuscatedUrl = url;
    const originalUrl = url;

    const stepExecutions = [];

    for (const stepNum of steps) {
      try {
        switch (stepNum) {
          case 1:
            obfuscatedUrl = this.step1_base64Encode(obfuscatedUrl);
            stepExecutions.push({ step: 1, name: 'Base64 Encoding' });
            break;
          case 2:
            obfuscatedUrl = this.step2_aesEncrypt(obfuscatedUrl, customKey);
            stepExecutions.push({ step: 2, name: 'AES-256 Encryption' });
            break;
          case 3:
            obfuscatedUrl = this.step3_fragmentSplit(obfuscatedUrl);
            stepExecutions.push({ step: 3, name: 'Fragment Splitting' });
            break;
          case 4:
            obfuscatedUrl = this.step4_homoglyphSubstitution(obfuscatedUrl);
            stepExecutions.push({ step: 4, name: 'Homoglyph Substitution' });
            break;
          case 5:
            const shortCode = this.step5_shortCode(originalUrl);
            stepExecutions.push({ step: 5, name: 'Short Code', code: shortCode });
            break;
          case 6:
            obfuscatedUrl = this.step6_redirectChain(originalUrl, redirectDepth);
            stepExecutions.push({ step: 6, name: 'Redirect Chain' });
            break;
          case 7:
            obfuscatedUrl = this.step7_tldRotation(obfuscatedUrl);
            stepExecutions.push({ step: 7, name: 'TLD Rotation' });
            break;
          case 8:
            obfuscatedUrl = this.step8_queryObfuscation(obfuscatedUrl, originalUrl);
            stepExecutions.push({ step: 8, name: 'Query Obfuscation' });
            break;
          case 9:
            const unicodeEncoded = this.step9_unicodeEncode(obfuscatedUrl);
            stepExecutions.push({ step: 9, name: 'Unicode Encoding', encoded: unicodeEncoded.substring(0, 50) + '...' });
            break;
          case 10:
            const htmlEncoded = this.step10_htmlEntityEncode(obfuscatedUrl);
            stepExecutions.push({ step: 10, name: 'HTML Entity Encoding', encoded: htmlEncoded.substring(0, 50) + '...' });
            break;
          case 11:
            obfuscatedUrl = this.step11_zeroWidthInjection(obfuscatedUrl);
            stepExecutions.push({ step: 11, name: 'Zero-Width Injection' });
            break;
        }
      } catch (error) {
        console.error(`Step ${stepNum} failed:`, error.message);
      }
    }

    return {
      original: originalUrl,
      obfuscated: obfuscatedUrl,
      steps: stepExecutions,
      level,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Batch link replacement in text/HTML
   */
  replaceLinksInContent(content, options = {}) {
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s<>"]+)/gi;

    const replacements = [];
    const processedContent = content.replace(urlPattern, (match) => {
      const result = this.obfuscateLink(match, options);
      replacements.push({
        original: match,
        replacement: result.obfuscated
      });
      return result.obfuscated;
    });

    return {
      content: processedContent,
      replacements,
      count: replacements.length
    };
  }

  /**
   * Generate tracking pixel with obfuscated URL
   */
  generateTrackingPixel(trackingUrl) {
    const obfuscated = this.obfuscateLink(trackingUrl, { level: 'high' });
    return `<img src="${obfuscated.obfuscated}" width="1" height="1" style="display:none;" alt="" />`;
  }

  /**
   * Create redirect HTML page
   */
  createRedirectPage(targetUrl, delay = 0) {
    const obfuscated = this.obfuscateLink(targetUrl, { level: 'medium' });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="${delay};url=${targetUrl}">
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: Arial, sans-serif;
      color: white;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      border: 4px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
  <script>
    // Fallback redirect
    setTimeout(function() {
      window.location.href = "${targetUrl}";
    }, ${delay * 1000});
  </script>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Redirecting securely...</p>
  </div>
</body>
</html>
    `.trim();
  }
}

module.exports = LinkProtection;
