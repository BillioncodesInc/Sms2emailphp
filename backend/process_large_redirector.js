#!/usr/bin/env node

/**
 * Standalone Large Redirector File Processor
 *
 * Usage: node process_large_redirector.js <file_path> <target_url> <output_name> [batch_size]
 * Example: node process_large_redirector.js ./redirects.txt https://example.com my-list 50
 *
 * Handles files up to 1GB+ with:
 * - Line-by-line streaming (low memory)
 * - Concurrent validation (configurable batch size)
 * - Real-time progress updates
 * - SQLite persistence (resumable)
 * - Only saves valid redirectors
 */

const fs = require('fs');
const readline = require('readline');
const axios = require('axios');
const path = require('path');
const sessionStore = require('./lib/redirectorSessionStore');

// Command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node process_large_redirector.js <file_path> <target_url> <output_name> [batch_size]');
  console.error('Example: node process_large_redirector.js ./redirects.txt https://example.com my-list 50');
  process.exit(1);
}

const [filePath, targetUrl, outputName, batchSizeArg] = args;
const batchSize = parseInt(batchSizeArg) || 50;

// Validate inputs
if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

console.log(`
🚀 Large Redirector File Processor
================================================================================
File: ${filePath}
Target URL: ${targetUrl}
Output Name: ${outputName}
Batch Size: ${batchSize} concurrent requests
================================================================================
`);

// Extract redirector URLs with parameters
function extractRedirectUrls(line) {
  line = line.trim();
  if (!line) return null;

  // Remove ID field if separated by pipe
  if (line.includes('|')) {
    const parts = line.split('|');
    if (parts.length >= 2) {
      line = parts.slice(1).join('|').trim();
    }
  }

  // Check if line contains redirect parameter pattern
  if (line.includes('=http')) {
    return line;
  }

  return null;
}

// Replace redirect targets with {{url}} placeholder
function prepareRedirector(url) {
  return url.replace(/=https?:\/\/[^&\s]+/g, '={{url}}');
}

// Embed target link into redirector
function embedTargetLink(redirector, targetLink) {
  let cleanTarget = targetLink.replace(/^https?:\/\//, '');
  if (!cleanTarget.startsWith('//')) {
    cleanTarget = '//' + cleanTarget;
  }
  return redirector.replace(/\{\{url\}\}/g, cleanTarget);
}

// Test if URL redirects to target
async function testRedirectUrl(url, expectedTarget) {
  try {
    const cleanTarget = expectedTarget.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();

    const response = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 10,
      validateStatus: (status) => status < 500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const finalUrl = response.request?.res?.responseUrl || response.config.url;
    const cleanFinal = finalUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
    const redirectsCorrectly = cleanFinal.includes(cleanTarget) || cleanTarget.includes(cleanFinal.split('/')[0]);

    return {
      valid: redirectsCorrectly,
      accessible: true,
      status: response.status,
      finalUrl,
      redirectsTo: cleanFinal,
      expectedTarget: cleanTarget,
      error: redirectsCorrectly ? null : 'Does not redirect to target URL'
    };
  } catch (error) {
    if (error.response) {
      const finalUrl = error.request?.res?.responseUrl || error.config?.url || url;
      const cleanFinal = finalUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
      const cleanTarget = expectedTarget.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
      const redirectsCorrectly = cleanFinal.includes(cleanTarget) || cleanTarget.includes(cleanFinal.split('/')[0]);

      return {
        valid: redirectsCorrectly,
        accessible: true,
        status: error.response.status,
        finalUrl,
        redirectsTo: cleanFinal,
        expectedTarget: cleanTarget,
        error: redirectsCorrectly ? null : 'Does not redirect to target URL'
      };
    }

    return {
      valid: false,
      accessible: false,
      status: null,
      finalUrl: null,
      redirectsTo: null,
      expectedTarget: expectedTarget.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase(),
      error: error.message
    };
  }
}

// Test URLs concurrently in batches
async function testUrlsBatch(urls, expectedTarget, batchSize, progressCallback) {
  const results = [];
  const total = urls.length;
  let completed = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const result = await testRedirectUrl(url, expectedTarget);
        completed++;

        if (progressCallback) {
          progressCallback({
            url,
            result,
            completed,
            total,
            percent: Math.round((completed / total) * 100)
          });
        }

        return { url, ...result };
      })
    );

    results.push(...batchResults);
  }

  return results;
}

// Main processing function
async function processFile() {
  const sessionId = `file-${Date.now()}`;
  const startTime = Date.now();

  // Create session
  sessionStore.createSession(sessionId, targetUrl, batchSize);

  console.log('📖 Step 1: Reading and extracting URLs from file...\n');

  const urls = [];
  const seen = new Set();

  // Read file line by line
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const extracted = extractRedirectUrls(line);
    if (extracted) {
      const prepared = prepareRedirector(extracted);
      const signature = prepared.substring(0, Math.min(20, prepared.length));

      if (!seen.has(signature)) {
        seen.add(signature);
        const final = embedTargetLink(prepared, targetUrl);
        urls.push(final);

        if (urls.length % 10000 === 0) {
          process.stdout.write(`\r   Extracted: ${urls.length} URLs...`);
        }
      }
    }
  }

  console.log(`\r✅ Extracted ${urls.length} unique redirector URLs\n`);

  sessionStore.updateSession(sessionId, { total: urls.length });

  console.log(`🧪 Step 2: Validating URLs (batch size: ${batchSize})...\n`);

  let valid = 0;
  let invalid = 0;

  const results = await testUrlsBatch(urls, targetUrl, batchSize, (progress) => {
    if (progress.result.valid) {
      valid++;
    } else {
      invalid++;
    }

    sessionStore.updateSession(sessionId, {
      processed: progress.completed,
      valid,
      invalid
    });

    sessionStore.addResult(sessionId, progress.result);

    // Update progress every URL
    const status = progress.result.valid ? '✓' : '✗';
    process.stdout.write(`\r   Progress: ${progress.completed}/${progress.total} (${progress.percent}%) - Valid: ${valid}, Invalid: ${invalid} ${status}`);
  });

  console.log('\n\n✅ Validation complete!\n');

  sessionStore.updateSession(sessionId, {
    status: 'completed',
    endTime: Date.now()
  });

  const duration = Date.now() - startTime;

  console.log('📊 Results:');
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   Valid: ${valid}`);
  console.log(`   Invalid: ${invalid}`);
  console.log(`   Success Rate: ${Math.round((valid / urls.length) * 100)}%`);
  console.log(`   Duration: ${Math.round(duration / 1000)}s\n`);

  // Save valid URLs to file
  console.log('💾 Step 3: Saving valid redirectors...\n');

  const validUrls = sessionStore.getValidResults(sessionId);
  const outputFile = path.join(__dirname, 'data', `${outputName}.txt`);

  fs.writeFileSync(outputFile, validUrls.join('\n'));

  console.log(`✅ Saved ${validUrls.length} valid redirectors to: ${outputFile}\n`);

  // Cleanup session
  sessionStore.deleteSession(sessionId);

  console.log('================================================================================');
  console.log('✅ PROCESSING COMPLETE!');
  console.log('================================================================================');
}

// Run
processFile().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
