const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const readline = require('readline');
const multer = require('multer');
const sessionStore = require('../lib/redirectorSessionStore');

// Data directory
const DATA_DIR = path.join(__dirname, '../data');
const REDIRECTOR_LISTS_FILE = path.join(DATA_DIR, 'redirector-lists.json');

// Multer for large file uploads (disk storage)
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(DATA_DIR, 'uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, `redirector-${Date.now()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
});

// Active processing sessions for WebSocket updates (backward compatibility)
const activeSessions = new Map();

// WebSocket connections (will be set by app.js)
let wsConnections = null;

// Set WebSocket connections from app.js
function setWebSocketConnections(wss) {
  wsConnections = wss;
}

// Emit WebSocket update for a session
function emitWebSocketUpdate(sessionId, data) {
  if (!wsConnections) return;

  // Send to all clients listening to this session
  wsConnections.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN = 1
      try {
        client.send(JSON.stringify({
          sessionId,
          ...data
        }));
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  });
}

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Load redirector lists from disk
async function loadRedirectorLists() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(REDIRECTOR_LISTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // No file yet, return empty object
    }
    throw error;
  }
}

// Save redirector lists to disk
async function saveRedirectorLists(lists) {
  await ensureDataDir();
  await fs.writeFile(
    REDIRECTOR_LISTS_FILE,
    JSON.stringify(lists, null, 2),
    'utf8'
  );
}

// Extract URLs with redirect parameters
// Matches: grep "=http" behavior from the methodology
function extractRedirectUrls(text) {
  const lines = text.split('\n');
  const extracted = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Remove ID field if separated by pipe (like: 123456|https://...)
    // Matches: cut -d '|' -f 2
    if (line.includes('|')) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        line = parts.slice(1).join('|').trim(); // Take everything after first pipe
      }
    }

    // Check if line contains redirect parameter pattern
    // Matches: grep "=http" - finds URLs with parameters like ?url=http or &redirect=https
    if (line.includes('=http')) {
      extracted.push(line);
    }
  }

  return extracted;
}

// Replace redirect targets with {{url}} placeholder
// Matches the sed + re.sub pipeline:
// 1. sed 's/=http/=https\:\/\/example.com%23/g'
// 2. re.sub(r'https://example.com[^&]+', r'{{url}}', ...)
function prepareRedirectors(urls) {
  return urls.map(url => {
    // Replace all target URLs in parameters with {{url}} placeholder
    // Captures patterns like: ?url=https://example.com/path or &redir=http://target.com
    // Matches everything from =http:// to the next & or end of string
    return url.replace(/=https?:\/\/[^&\s]+/g, '={{url}}');
  });
}

// Remove duplicates based on first 20 characters
// Matches Python script: if not next[0:20] in prev
function removeDuplicates(urls) {
  const seen = new Set();
  const unique = [];

  for (const url of urls) {
    // Extract first 20 characters as domain signature (exactly like Python)
    const signature = url.substring(0, Math.min(20, url.length));

    if (!seen.has(signature)) {
      seen.add(signature);
      unique.push(url);
    }
  }

  return unique;
}

// Embed target link into redirectors
function embedTargetLink(redirectors, targetLink) {
  // Clean target link (remove protocol)
  let cleanTarget = targetLink.replace(/^https?:\/\//, '');

  // Format as //domain.com/path
  if (!cleanTarget.startsWith('//')) {
    cleanTarget = '//' + cleanTarget;
  }

  return redirectors.map(redirector => {
    return redirector.replace(/\{\{url\}\}/g, cleanTarget);
  });
}

// Test if URL actually redirects to the target URL
async function testRedirectUrl(url, expectedTarget) {
  try {
    // Clean expected target for comparison (remove protocol and trailing slashes)
    const cleanTarget = expectedTarget.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();

    const response = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 10,
      validateStatus: (status) => status < 500, // Accept redirects and success
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Get the final URL after all redirects
    const finalUrl = response.request?.res?.responseUrl || response.config.url;
    const cleanFinal = finalUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();

    // Check if final URL contains the expected target
    const redirectsCorrectly = cleanFinal.includes(cleanTarget) || cleanTarget.includes(cleanFinal.split('/')[0]);

    return {
      valid: redirectsCorrectly,
      accessible: true,
      status: response.status,
      finalUrl: finalUrl,
      redirectsTo: cleanFinal,
      expectedTarget: cleanTarget,
      error: redirectsCorrectly ? null : 'Does not redirect to target URL'
    };
  } catch (error) {
    // Check if it's a redirect error with a final URL
    if (error.response) {
      const finalUrl = error.request?.res?.responseUrl || error.config?.url || url;
      const cleanFinal = finalUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
      const cleanTarget = expectedTarget.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
      const redirectsCorrectly = cleanFinal.includes(cleanTarget) || cleanTarget.includes(cleanFinal.split('/')[0]);

      return {
        valid: redirectsCorrectly,
        accessible: true,
        status: error.response.status,
        finalUrl: finalUrl,
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
async function testUrlsBatch(urls, expectedTarget, batchSize = 10, progressCallback) {
  const results = [];
  const total = urls.length;
  let completed = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    // Test batch concurrently
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const result = await testRedirectUrl(url, expectedTarget);
        completed++;

        // Call progress callback if provided
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

// Process raw redirector text
function processRedirectors(rawText, targetLink) {
  // Step 1: Extract URLs with redirect parameters
  const extracted = extractRedirectUrls(rawText);

  // Step 2: Prepare redirectors (replace targets with placeholder)
  const prepared = prepareRedirectors(extracted);

  // Step 3: Remove duplicates
  const unique = removeDuplicates(prepared);

  // Step 4: Embed target link
  const final = embedTargetLink(unique, targetLink);

  return {
    extracted: extracted.length,
    prepared: prepared.length,
    unique: unique.length,
    final: final
  };
}

// ============================================================================
// ROUTES
// ============================================================================

// Get all redirector lists
router.get('/lists', async (req, res) => {
  try {
    const lists = await loadRedirectorLists();

    // Return array of list metadata
    const listArray = Object.keys(lists).map(name => ({
      name,
      targetLink: lists[name].targetLink,
      count: lists[name].redirectors.length,
      createdAt: lists[name].createdAt,
      updatedAt: lists[name].updatedAt
    }));

    res.json({
      success: true,
      lists: listArray
    });
  } catch (error) {
    console.error('❌ Error loading redirector lists:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a specific redirector list
router.get('/lists/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const lists = await loadRedirectorLists();

    if (!lists[name]) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }

    res.json({
      success: true,
      list: lists[name]
    });
  } catch (error) {
    console.error('❌ Error loading redirector list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process redirectors with validation (streaming with WebSocket updates)
router.post('/process/stream', async (req, res) => {
  try {
    const { rawText, targetLink, testUrls = true } = req.body;

    if (!rawText || !targetLink) {
      return res.status(400).json({
        success: false,
        error: 'rawText and targetLink are required'
      });
    }

    // Check file size and warn if too large
    const textSizeInMB = Buffer.byteLength(rawText, 'utf8') / (1024 * 1024);
    if (textSizeInMB > 50) {
      return res.status(400).json({
        success: false,
        error: `Input text is too large (${Math.round(textSizeInMB)}MB). For files larger than 50MB, please use the command-line tool: node process_large_redirector.js <file_path> <target_url> <output_name> [batch_size]`,
        sizeInMB: Math.round(textSizeInMB),
        recommendation: 'Use the standalone processor: backend/process_large_redirector.js'
      });
    }

    // Create session ID
    const sessionId = uuidv4();

    // Initialize session state
    const sessionState = {
      sessionId,
      targetLink, // Store target link for saving later
      status: 'processing',
      total: 0,
      processed: 0,
      valid: 0,
      invalid: 0,
      startTime: Date.now(),
      results: []
    };

    activeSessions.set(sessionId, sessionState);

    // Return session ID immediately
    res.json({
      success: true,
      sessionId,
      message: 'Processing started. Connect to WebSocket for real-time updates.'
    });

    // Start processing asynchronously
    processRedirectorsStreaming(sessionId, rawText, targetLink, testUrls);

  } catch (error) {
    console.error('❌ Error starting streaming process:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Streaming processing function with WebSocket updates
async function processRedirectorsStreaming(sessionId, rawText, targetLink, testUrls) {
  const sessionState = activeSessions.get(sessionId);
  if (!sessionState) return;

  try {
    // Use the shared processRedirectors function for consistency
    emitWebSocketUpdate(sessionId, {
      type: 'phase',
      phase: 'processing',
      message: 'Processing redirectors...'
    });

    const result = processRedirectors(rawText, targetLink);
    sessionState.total = result.final.length;

    emitWebSocketUpdate(sessionId, {
      type: 'phase',
      phase: 'processed',
      message: `Processed ${result.final.length} redirectors`,
      stats: {
        extracted: result.extracted,
        prepared: result.prepared,
        unique: result.unique,
        final: result.final.length
      }
    });

    const final = result.final;

    // Step 5: Test URLs concurrently (if requested)
    if (testUrls) {
      emitWebSocketUpdate(sessionId, {
        type: 'phase',
        phase: 'testing',
        message: `Testing ${final.length} URLs for redirect validation...`,
        total: final.length
      });

      // Test URLs in batches of 10 concurrently
      const testResults = await testUrlsBatch(final, targetLink, 10, (progress) => {
        // Update session state
        sessionState.processed = progress.completed;
        if (progress.result.valid) {
          sessionState.valid++;
        } else {
          sessionState.invalid++;
        }

        // Emit real-time progress update
        emitWebSocketUpdate(sessionId, {
          type: 'progress',
          current: progress.completed,
          total: progress.total,
          valid: sessionState.valid,
          invalid: sessionState.invalid,
          url: progress.url,
          valid: progress.result.valid,
          accessible: progress.result.accessible,
          status: progress.result.status,
          finalUrl: progress.result.finalUrl,
          redirectsTo: progress.result.redirectsTo,
          expectedTarget: progress.result.expectedTarget,
          error: progress.result.error,
          percent: progress.percent
        });
      });

      // Store all results
      sessionState.results = testResults;
    } else {
      // No testing, just mark all as processed
      sessionState.processed = final.length;
      sessionState.results = final.map(url => ({
        url,
        valid: null,
        accessible: null,
        status: null,
        finalUrl: null,
        redirectsTo: null,
        expectedTarget: null,
        error: null
      }));
    }

    // Mark as complete
    sessionState.status = 'completed';
    sessionState.endTime = Date.now();
    sessionState.duration = sessionState.endTime - sessionState.startTime;

    emitWebSocketUpdate(sessionId, {
      type: 'complete',
      message: 'Processing completed',
      stats: {
        total: sessionState.total,
        processed: sessionState.processed,
        valid: sessionState.valid,
        invalid: sessionState.invalid,
        duration: sessionState.duration
      },
      results: sessionState.results
    });

  } catch (error) {
    console.error('❌ Error in streaming process:', error);
    sessionState.status = 'failed';
    sessionState.error = error.message;

    emitWebSocketUpdate(sessionId, {
      type: 'error',
      message: error.message
    });
  }
}

// Get session status
router.get('/process/stream/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionState = activeSessions.get(sessionId);

    if (!sessionState) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session: {
        sessionId: sessionState.sessionId,
        status: sessionState.status,
        total: sessionState.total,
        processed: sessionState.processed,
        valid: sessionState.valid,
        invalid: sessionState.invalid,
        duration: sessionState.endTime ? sessionState.duration : Date.now() - sessionState.startTime
      }
    });
  } catch (error) {
    console.error('❌ Error getting session status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get session results
router.get('/process/stream/:sessionId/results', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionState = activeSessions.get(sessionId);

    if (!sessionState) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      results: sessionState.results
    });
  } catch (error) {
    console.error('❌ Error getting session results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save redirector list from session results (validated URLs only)
router.post('/lists', async (req, res) => {
  try {
    const { name, sessionId, saveOnlyValid = true } = req.body;

    if (!name || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'name and sessionId are required'
      });
    }

    // Get session results
    const sessionState = activeSessions.get(sessionId);
    if (!sessionState) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    if (sessionState.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Session is not completed yet'
      });
    }

    // Load existing lists
    const lists = await loadRedirectorLists();

    // Check if name already exists
    if (lists[name]) {
      return res.status(400).json({
        success: false,
        error: 'A list with this name already exists'
      });
    }

    // Filter results based on validation
    let redirectorsToSave;
    if (saveOnlyValid) {
      // Save only URLs that successfully redirect to target
      redirectorsToSave = sessionState.results
        .filter(r => r.valid === true)
        .map(r => r.url);
    } else {
      // Save all URLs (including untested/invalid)
      redirectorsToSave = sessionState.results.map(r => r.url);
    }

    if (redirectorsToSave.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid redirectors to save. All URLs failed validation.'
      });
    }

    // Save list
    lists[name] = {
      name,
      targetLink: sessionState.targetLink,
      redirectors: redirectorsToSave,
      stats: {
        total: sessionState.total,
        valid: sessionState.valid,
        invalid: sessionState.invalid,
        saved: redirectorsToSave.length,
        validationEnabled: sessionState.results[0]?.valid !== null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveRedirectorLists(lists);

    console.log(`✅ Redirector list saved: ${name} (${redirectorsToSave.length} valid redirectors out of ${sessionState.total} total)`);

    res.json({
      success: true,
      list: lists[name],
      message: `Saved ${redirectorsToSave.length} validated redirectors`
    });
  } catch (error) {
    console.error('❌ Error saving redirector list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update redirector list
router.put('/lists/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { rawText, targetLink, newName } = req.body;

    // Load existing lists
    const lists = await loadRedirectorLists();

    if (!lists[name]) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }

    // If renaming, check new name doesn't exist
    if (newName && newName !== name && lists[newName]) {
      return res.status(400).json({
        success: false,
        error: 'A list with the new name already exists'
      });
    }

    // Process new redirectors if provided
    let updatedList;
    if (rawText && targetLink) {
      const result = processRedirectors(rawText, targetLink);
      updatedList = {
        name: newName || name,
        targetLink,
        redirectors: result.final,
        stats: {
          extracted: result.extracted,
          prepared: result.prepared,
          unique: result.unique,
          final: result.final.length
        },
        createdAt: lists[name].createdAt,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Just rename
      updatedList = {
        ...lists[name],
        name: newName || name,
        updatedAt: new Date().toISOString()
      };
    }

    // Delete old entry if renamed
    if (newName && newName !== name) {
      delete lists[name];
    }

    lists[newName || name] = updatedList;
    await saveRedirectorLists(lists);

    console.log(`✅ Redirector list updated: ${newName || name}`);

    res.json({
      success: true,
      list: updatedList
    });
  } catch (error) {
    console.error('❌ Error updating redirector list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete redirector list
router.delete('/lists/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // Load existing lists
    const lists = await loadRedirectorLists();

    if (!lists[name]) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }

    delete lists[name];
    await saveRedirectorLists(lists);

    console.log(`✅ Redirector list deleted: ${name}`);

    res.json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting redirector list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Download redirector list as text file
router.get('/lists/:name/download', async (req, res) => {
  try {
    const { name } = req.params;
    const lists = await loadRedirectorLists();

    if (!lists[name]) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }

    const content = lists[name].redirectors.join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.txt"`);
    res.send(content);
  } catch (error) {
    console.error('❌ Error downloading redirector list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a random redirector from a list (for rotation)
router.get('/lists/:name/random', async (req, res) => {
  try {
    const { name } = req.params;
    const lists = await loadRedirectorLists();

    if (!lists[name]) {
      return res.status(404).json({
        success: false,
        error: 'List not found'
      });
    }

    const redirectors = lists[name].redirectors;
    if (redirectors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'List is empty'
      });
    }

    // Get random redirector
    const randomIndex = Math.floor(Math.random() * redirectors.length);
    const redirector = redirectors[randomIndex];

    res.json({
      success: true,
      redirector,
      index: randomIndex,
      total: redirectors.length
    });
  } catch (error) {
    console.error('❌ Error getting random redirector:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, setWebSocketConnections };
