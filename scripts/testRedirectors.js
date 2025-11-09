'use strict';

/**
 * Utility script to process a redirector dump and verify which entries
 * still land on the desired target URL. Mirrors backend logic.
 *
 * Usage: node scripts/testRedirectors.js <inputFile> <targetUrl> [outputFile]
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

if (process.argv.length < 4) {
  console.error('Usage: node scripts/testRedirectors.js <inputFile> <targetUrl> [outputFile]');
  process.exit(1);
}

const [, , inputFile, targetUrl, outputName = 'redirector_test_results.txt'] = process.argv;

if (!fs.existsSync(inputFile)) {
  console.error(`Input file not found: ${inputFile}`);
  process.exit(1);
}

function extractRedirectUrls(text) {
  const lines = text.split('\n');
  const extracted = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.includes('|')) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        line = parts.slice(1).join('|').trim();
      }
    }

    if (line.includes('=http')) {
      extracted.push(line);
    }
  }

  return extracted;
}

function prepareRedirectors(urls) {
  return urls.map(url => url.replace(/=https?:\/\/[^&\s]+/g, '={{url}}'));
}

function removeDuplicates(urls) {
  const seen = new Set();
  const unique = [];

  for (const url of urls) {
    const signature = url.substring(0, Math.min(20, url.length));
    if (!seen.has(signature)) {
      seen.add(signature);
      unique.push(url);
    }
  }

  return unique;
}

function embedTargetLink(redirectors, targetLink) {
  let cleanTarget = targetLink.replace(/^https?:\/\//, '');
  if (!cleanTarget.startsWith('//')) {
    cleanTarget = '//' + cleanTarget;
  }
  return redirectors.map(redirector => redirector.replace(/\{\{url\}\}/g, cleanTarget));
}

async function testRedirectUrl(url, expectedTarget) {
  const cleanTarget = expectedTarget.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
  const targetDomain = cleanTarget.split('/')[0];

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 10,
      validateStatus: status => status < 500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const finalUrl = response.request?.res?.responseUrl || response.config.url;
    const cleanFinal = finalUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
    const finalDomain = cleanFinal.split('/')[0];

    const valid =
      finalDomain === targetDomain ||
      finalDomain.endsWith('.' + targetDomain) ||
      targetDomain.endsWith('.' + finalDomain) ||
      cleanFinal.startsWith(cleanTarget);

    return { valid, finalUrl, error: valid ? null : `Final domain ${finalDomain} != ${targetDomain}` };
  } catch (error) {
    return { valid: false, finalUrl: null, error: error.message };
  }
}

async function testRedirectors(urls, expectedTarget, concurrency = 10) {
  const results = [];
  let index = 0;
  let completed = 0;
  let valid = 0;

  async function worker() {
    while (index < urls.length) {
      const currentIndex = index++;
      const url = urls[currentIndex];
      const result = await testRedirectUrl(url, expectedTarget);
      results[currentIndex] = { url, ...result };
      completed++;
      if (result.valid) valid++;

      if (completed % 50 === 0 || completed === urls.length) {
        process.stdout.write(`\rProcessed ${completed}/${urls.length} (valid: ${valid})`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  process.stdout.write('\n');
  return results;
}

(async () => {
  console.log(`Reading ${inputFile}...`);
  const rawText = fs.readFileSync(inputFile, 'utf8');

  const extracted = extractRedirectUrls(rawText);
  const prepared = prepareRedirectors(extracted);
  const unique = removeDuplicates(prepared);
  const finalList = embedTargetLink(unique, targetUrl);

  console.log(`Extracted: ${extracted.length}`);
  console.log(`Unique: ${unique.length}`);
  console.log(`Ready for testing: ${finalList.length}`);

  const results = await testRedirectors(finalList, targetUrl, 10);

  const validRedirectors = results.filter(r => r.valid).map(r => r.url);
  const invalidRedirectors = results.filter(r => !r.valid);

  const outputPath = path.resolve(outputName);
  fs.writeFileSync(outputPath, validRedirectors.join('\n'));

  console.log(`Valid redirectors: ${validRedirectors.length}`);
  console.log(`Invalid redirectors: ${invalidRedirectors.length}`);
  console.log(`Saved valid redirectors to: ${outputPath}`);

  if (invalidRedirectors.length > 0) {
    const sample = invalidRedirectors.slice(0, 5).map(r => ` - ${r.url} (${r.error})`).join('\n');
    console.log(`Sample invalid entries:\n${sample}`);
  }
})();
