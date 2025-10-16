/**
 * Inbox Searcher Routes
 *
 * API endpoints for searching email inboxes using validated SMTP credentials
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const imapHandler = require('../lib/imapHandler');
const tempStorage = require('../lib/tempStorage');
const proxyStorage = require('../lib/proxyStorage');

// Active search sessions
const activeSessions = new Map();

/**
 * Check if proxies are configured
 * GET /api/inbox/proxy-check
 */
router.get('/proxy-check', (req, res) => {
  try {
    const proxyConfig = proxyStorage.loadConfig();
    const hasProxies = proxyConfig && proxyConfig.proxies && proxyConfig.proxies.length > 0;

    res.json({
      success: true,
      hasProxies,
      proxyCount: hasProxies ? proxyConfig.proxies.length : 0,
      message: hasProxies
        ? `${proxyConfig.proxies.length} proxies configured`
        : 'No proxies configured. Please add proxies before using inbox searcher.'
    });
  } catch (err) {
    res.json({
      success: false,
      hasProxies: false,
      proxyCount: 0,
      message: 'Error checking proxy configuration'
    });
  }
});

/**
 * Start inbox search
 * POST /api/inbox/search
 *
 * Body: {
 *   smtpList: ["password1|user1@gmail.com", "password2|user2@yahoo.com"],
 *   keywords: ["invoice", "payment", "receipt"]
 * }
 */
router.post('/search', async (req, res) => {
  try {
    const { smtpList, keywords } = req.body;

    // Validate inputs
    if (!smtpList || !Array.isArray(smtpList) || smtpList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'smtpList is required and must be a non-empty array'
      });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'keywords is required and must be a non-empty array'
      });
    }

    // Check proxies
    const proxyConfig = proxyStorage.loadConfig();
    const hasProxies = proxyConfig && proxyConfig.proxies && proxyConfig.proxies.length > 0;

    if (!hasProxies) {
      return res.status(400).json({
        success: false,
        message: 'Proxy configuration required. Please add proxies before searching.'
      });
    }

    // Create session
    const sessionId = uuidv4();
    const sessionDir = tempStorage.createSession('inbox', sessionId);

    // Initialize session state
    const sessionState = {
      sessionId,
      status: 'processing',
      total: smtpList.length,
      completed: 0,
      failed: 0,
      totalMatches: 0,
      startTime: Date.now(),
      keywords,
      results: []
    };

    activeSessions.set(sessionId, sessionState);

    // Start processing asynchronously
    processInboxSearch(sessionId, smtpList, keywords);

    res.json({
      success: true,
      sessionId,
      message: `Search started for ${smtpList.length} accounts`
    });

  } catch (err) {
    console.error('Error starting inbox search:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Process inbox search for all accounts
 */
async function processInboxSearch(sessionId, smtpList, keywords) {
  const sessionState = activeSessions.get(sessionId);
  if (!sessionState) return;

  // Process accounts in parallel (limit concurrency to 5)
  const concurrency = 5;
  const chunks = [];

  for (let i = 0; i < smtpList.length; i += concurrency) {
    chunks.push(smtpList.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(combo => processInboxAccount(sessionId, combo, keywords))
    );
  }

  // Mark session as complete
  sessionState.status = 'completed';
  sessionState.endTime = Date.now();
  sessionState.duration = sessionState.endTime - sessionState.startTime;

  tempStorage.updateMetadata('inbox', sessionId, {
    status: 'completed',
    summary: {
      total: sessionState.total,
      completed: sessionState.completed,
      failed: sessionState.failed,
      totalMatches: sessionState.totalMatches
    }
  });

  // Emit completion via WebSocket if available
  emitWebSocketUpdate(sessionId, {
    type: 'complete',
    summary: {
      total: sessionState.total,
      completed: sessionState.completed,
      failed: sessionState.failed,
      totalMatches: sessionState.totalMatches
    }
  });
}

/**
 * Process single inbox account
 */
async function processInboxAccount(sessionId, comboString, keywords) {
  const sessionState = activeSessions.get(sessionId);
  if (!sessionState) return;

  let email = '';
  try {
    // Parse combo (password|email or email:password)
    const combo = imapHandler.parseComboResult(comboString);
    email = combo.email;

    // Emit progress update
    emitWebSocketUpdate(sessionId, {
      type: 'progress',
      email,
      status: 'searching',
      message: `Searching ${email}...`
    });

    // Connect to IMAP
    const imap = await imapHandler.connect(combo.email, combo.password);

    // Search for keywords
    const matches = await imapHandler.searchInbox(imap, keywords, 50);

    // Save result
    const result = {
      email,
      status: 'success',
      matchCount: matches.length,
      matches,
      timestamp: new Date().toISOString()
    };

    tempStorage.saveInboxResult(sessionId, email, result);

    // Update session state
    sessionState.completed++;
    sessionState.totalMatches += matches.length;
    sessionState.results.push(result);

    // Emit result update
    emitWebSocketUpdate(sessionId, {
      type: 'result',
      email,
      matchCount: matches.length,
      matches
    });

  } catch (err) {
    console.error(`Error searching ${email}:`, err.message);

    // Save failed result
    const result = {
      email,
      status: 'failed',
      matchCount: 0,
      matches: [],
      error: err.message,
      timestamp: new Date().toISOString()
    };

    try {
      tempStorage.saveInboxResult(sessionId, email, result);
    } catch (saveErr) {
      console.error('Error saving failed result:', saveErr);
    }

    // Update session state
    sessionState.failed++;
    sessionState.results.push(result);

    // Emit error update
    emitWebSocketUpdate(sessionId, {
      type: 'error',
      email,
      error: err.message
    });
  }
}

/**
 * Get search status
 * GET /api/inbox/status/:sessionId
 */
router.get('/status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionState = activeSessions.get(sessionId);

    if (!sessionState) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      sessionId,
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
 * GET /api/inbox/results/:sessionId
 */
router.get('/results/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const results = tempStorage.getInboxResults(sessionId);
    const metadata = tempStorage.getMetadata('inbox', sessionId);

    res.json({
      success: true,
      sessionId,
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
 * Delete session
 * DELETE /api/inbox/session/:sessionId
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    activeSessions.delete(sessionId);
    tempStorage.deleteSession('inbox', sessionId);

    res.json({
      success: true,
      message: 'Session deleted'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * List all sessions
 * GET /api/inbox/sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = tempStorage.listSessions('inbox');

    res.json({
      success: true,
      sessions
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
function emitWebSocketUpdate(sessionId, data) {
  if (global.emitInboxWebSocketUpdate) {
    global.emitInboxWebSocketUpdate(sessionId, data);
  } else {
    console.log(`[WS] Session ${sessionId}:`, data.type);
  }
}

/**
 * Setup WebSocket for inbox searcher
 */
function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const sessionId = req.url.split('/').pop();

    if (!sessionId) {
      ws.close();
      return;
    }

    console.log(`WebSocket connected for inbox session: ${sessionId}`);

    // Send initial status
    const sessionState = activeSessions.get(sessionId);
    if (sessionState) {
      ws.send(JSON.stringify({
        type: 'connected',
        sessionId,
        status: sessionState.status
      }));
    }

    // Store WebSocket connection
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, { websockets: [] });
    }

    const state = activeSessions.get(sessionId);
    if (!state.websockets) {
      state.websockets = [];
    }
    state.websockets.push(ws);

    ws.on('close', () => {
      console.log(`WebSocket disconnected for inbox session: ${sessionId}`);
      if (state.websockets) {
        const index = state.websockets.indexOf(ws);
        if (index > -1) {
          state.websockets.splice(index, 1);
        }
      }
    });
  });

  // Replace the placeholder emitWebSocketUpdate function
  global.emitInboxWebSocketUpdate = function(sessionId, data) {
    const sessionState = activeSessions.get(sessionId);
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
