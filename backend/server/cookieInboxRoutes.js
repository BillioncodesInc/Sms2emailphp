/**
 * Cookie-Based Inbox Searcher Routes
 *
 * API endpoints for searching email inboxes using cookie authentication
 * Supports Gmail and Outlook
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cookieValidator = require('../lib/cookieValidator');
const cookieInboxHandler = require('../lib/cookieInboxHandler');
const tempStorage = require('../lib/tempStorage');

// Configure multer for file uploads (max 50MB total)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 100 // Max 100 files
  },
  fileFilter: (req, file, cb) => {
    // Only accept .txt files
    if (path.extname(file.originalname).toLowerCase() === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  }
});

// Active search sessions
const activeSessions = new Map();

/**
 * Upload and validate cookie files
 * POST /api/cookie-inbox/upload
 *
 * Accepts multiple .txt files or a folder of .txt files
 */
router.post('/upload', upload.array('cookieFiles', 100), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    console.log(`[CookieInbox] Received ${req.files.length} files for validation`);

    // Parse and validate all files
    const files = req.files.map(file => ({
      name: file.originalname,
      content: file.buffer.toString('utf8'),
      size: file.size
    }));

    const validation = cookieValidator.validateMultipleCookieFiles(files);

    if (validation.errorCount > 0) {
      console.log(`[CookieInbox] Validation errors:`, validation.errors);
    }

    // Create a session to store validated cookies temporarily
    const sessionId = uuidv4();
    const sessionDir = tempStorage.createSession('cookie-inbox', sessionId);

    // Save validated cookie data
    validation.results.forEach((result, index) => {
      const cookieFile = path.join(sessionDir, `cookie_${index}.json`);
      fs.writeFileSync(cookieFile, JSON.stringify(result, null, 2));
    });

    // Save session metadata
    tempStorage.updateMetadata('cookie-inbox', sessionId, {
      uploadedAt: new Date().toISOString(),
      validCount: validation.validCount,
      errorCount: validation.errorCount,
      providers: {
        gmail: validation.results.filter(r => r.provider === 'gmail').length,
        outlook: validation.results.filter(r => r.provider === 'outlook').length
      }
    });

    res.json({
      success: true,
      sessionId,
      validCount: validation.validCount,
      errorCount: validation.errorCount,
      errors: validation.errors,
      accounts: validation.results.map(r => ({
        email: r.email,
        provider: r.provider,
        cookieCount: r.cookieCount
      })),
      message: `Validated ${validation.validCount} of ${req.files.length} files`
    });

  } catch (err) {
    console.error('[CookieInbox] Upload error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Start cookie-based inbox search
 * POST /api/cookie-inbox/search
 *
 * Body: {
 *   sessionId: "uuid-from-upload",
 *   keywords: ["invoice", "payment", "receipt"],
 *   provider: "gmail" | "outlook" | "all" (optional, defaults to "all")
 * }
 */
router.post('/search', async (req, res) => {
  try {
    const { sessionId, keywords, provider = 'all' } = req.body;

    // Validate inputs
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required. Please upload cookie files first.'
      });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'keywords is required and must be a non-empty array'
      });
    }

    // Load cookie data from session
    const sessionDir = tempStorage.getSessionPath('cookie-inbox', sessionId);
    if (!fs.existsSync(sessionDir)) {
      return res.status(404).json({
        success: false,
        message: 'Session not found. Please upload cookie files again.'
      });
    }

    // Read all cookie files
    const cookieFiles = fs.readdirSync(sessionDir)
      .filter(f => f.startsWith('cookie_') && f.endsWith('.json'));

    if (cookieFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid cookie data found in session'
      });
    }

    const cookieDataArray = cookieFiles.map(file => {
      const filePath = path.join(sessionDir, file);
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }).filter(data => {
      // Filter by provider if specified
      if (provider === 'all') return true;
      return data.provider === provider;
    });

    if (cookieDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No accounts found for provider: ${provider}`
      });
    }

    // Create search session
    const searchSessionId = uuidv4();

    // Initialize session state
    const sessionState = {
      sessionId: searchSessionId,
      uploadSessionId: sessionId,
      status: 'processing',
      total: cookieDataArray.length,
      completed: 0,
      failed: 0,
      totalMatches: 0,
      startTime: Date.now(),
      keywords,
      provider,
      results: []
    };

    activeSessions.set(searchSessionId, sessionState);

    // Start processing asynchronously
    processCookieInboxSearch(searchSessionId, cookieDataArray, keywords);

    res.json({
      success: true,
      searchSessionId,
      accountCount: cookieDataArray.length,
      message: `Search started for ${cookieDataArray.length} accounts`
    });

  } catch (err) {
    console.error('[CookieInbox] Search start error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Process cookie-based inbox search for all accounts
 */
async function processCookieInboxSearch(searchSessionId, cookieDataArray, keywords) {
  const sessionState = activeSessions.get(searchSessionId);
  if (!sessionState) return;

  try {
    // Progress callback
    const progressCallback = (update) => {
      if (update.type === 'result') {
        const result = update.result;

        // Update session state
        sessionState.completed++;
        if (result.success) {
          sessionState.totalMatches += result.matchCount;
        } else {
          sessionState.failed++;
        }

        // Save result
        const resultData = {
          email: result.email,
          provider: result.provider,
          status: result.success ? 'success' : 'failed',
          matchCount: result.matchCount,
          matches: result.matches,
          error: result.error,
          timestamp: new Date().toISOString()
        };

        tempStorage.saveInboxResult(searchSessionId, result.email, resultData);
        sessionState.results.push(resultData);

        // Emit WebSocket update
        emitWebSocketUpdate(searchSessionId, {
          type: 'result',
          email: result.email,
          matchCount: result.matchCount,
          matches: result.matches,
          progress: {
            total: sessionState.total,
            completed: sessionState.completed,
            failed: sessionState.failed,
            percentage: Math.round((sessionState.completed + sessionState.failed) / sessionState.total * 100)
          }
        });

      } else if (update.type === 'error') {
        sessionState.failed++;

        emitWebSocketUpdate(searchSessionId, {
          type: 'error',
          email: update.email,
          error: update.error
        });

      } else if (update.type === 'progress') {
        emitWebSocketUpdate(searchSessionId, {
          type: 'progress',
          email: update.email,
          status: update.status
        });
      }
    };

    // Search all accounts (concurrency: 3 to avoid browser resource issues)
    await cookieInboxHandler.searchMultipleAccounts(
      cookieDataArray,
      keywords,
      progressCallback,
      50, // maxResults per account
      3   // concurrency
    );

    // Mark session as complete
    sessionState.status = 'completed';
    sessionState.endTime = Date.now();
    sessionState.duration = sessionState.endTime - sessionState.startTime;

    tempStorage.updateMetadata('inbox', searchSessionId, {
      status: 'completed',
      summary: {
        total: sessionState.total,
        completed: sessionState.completed,
        failed: sessionState.failed,
        totalMatches: sessionState.totalMatches
      }
    });

    // Emit completion
    emitWebSocketUpdate(searchSessionId, {
      type: 'complete',
      summary: {
        total: sessionState.total,
        completed: sessionState.completed,
        failed: sessionState.failed,
        totalMatches: sessionState.totalMatches,
        duration: sessionState.duration
      }
    });

  } catch (err) {
    console.error('[CookieInbox] Processing error:', err);
    sessionState.status = 'error';
    sessionState.error = err.message;

    emitWebSocketUpdate(searchSessionId, {
      type: 'error',
      message: err.message
    });
  }
}

/**
 * Get search status
 * GET /api/cookie-inbox/status/:searchSessionId
 */
router.get('/status/:searchSessionId', (req, res) => {
  try {
    const { searchSessionId } = req.params;
    const sessionState = activeSessions.get(searchSessionId);

    if (!sessionState) {
      return res.status(404).json({
        success: false,
        message: 'Search session not found'
      });
    }

    res.json({
      success: true,
      searchSessionId,
      status: sessionState.status,
      progress: {
        total: sessionState.total,
        completed: sessionState.completed,
        failed: sessionState.failed,
        percentage: Math.round((sessionState.completed + sessionState.failed) / sessionState.total * 100)
      },
      totalMatches: sessionState.totalMatches
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Get search results
 * GET /api/cookie-inbox/results/:searchSessionId
 */
router.get('/results/:searchSessionId', (req, res) => {
  try {
    const { searchSessionId } = req.params;
    const results = tempStorage.getInboxResults(searchSessionId);
    const metadata = tempStorage.getMetadata('inbox', searchSessionId);

    res.json({
      success: true,
      searchSessionId,
      metadata,
      results
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Delete search session
 * DELETE /api/cookie-inbox/session/:searchSessionId
 */
router.delete('/session/:searchSessionId', (req, res) => {
  try {
    const { searchSessionId } = req.params;

    activeSessions.delete(searchSessionId);
    tempStorage.deleteSession('inbox', searchSessionId);

    res.json({
      success: true,
      message: 'Search session deleted'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Delete upload session
 * DELETE /api/cookie-inbox/upload-session/:sessionId
 */
router.delete('/upload-session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    tempStorage.deleteSession('cookie-inbox', sessionId);

    res.json({
      success: true,
      message: 'Upload session deleted'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Emit WebSocket update
 */
function emitWebSocketUpdate(searchSessionId, data) {
  if (global.emitCookieInboxWebSocketUpdate) {
    global.emitCookieInboxWebSocketUpdate(searchSessionId, data);
  } else {
    console.log(`[WS] Cookie Session ${searchSessionId}:`, data.type);
  }
}

/**
 * Setup WebSocket for cookie inbox searcher
 */
function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const searchSessionId = req.url.split('/').pop();

    if (!searchSessionId) {
      ws.close();
      return;
    }

    console.log(`[CookieInbox] WebSocket connected: ${searchSessionId}`);

    // Send initial status
    const sessionState = activeSessions.get(searchSessionId);
    if (sessionState) {
      ws.send(JSON.stringify({
        type: 'connected',
        searchSessionId,
        status: sessionState.status
      }));
    }

    // Store WebSocket connection
    if (!activeSessions.has(searchSessionId)) {
      activeSessions.set(searchSessionId, { websockets: [] });
    }

    const state = activeSessions.get(searchSessionId);
    if (!state.websockets) {
      state.websockets = [];
    }
    state.websockets.push(ws);

    ws.on('close', () => {
      console.log(`[CookieInbox] WebSocket disconnected: ${searchSessionId}`);
      if (state.websockets) {
        const index = state.websockets.indexOf(ws);
        if (index > -1) {
          state.websockets.splice(index, 1);
        }
      }
    });
  });

  // Register global WebSocket emitter
  global.emitCookieInboxWebSocketUpdate = function(searchSessionId, data) {
    const sessionState = activeSessions.get(searchSessionId);
    if (sessionState && sessionState.websockets) {
      const message = JSON.stringify(data);
      sessionState.websockets.forEach(ws => {
        if (ws.readyState === 1) { // OPEN
          ws.send(message);
        }
      });
    }
  };
}

// Export router and setup function
module.exports = { router, setupWebSocket };
