/**
 * Debounce Email Filter Routes
 * Real-time email filtering with WebSocket progress updates
 */

const express = require('express');
const router = express.Router();
const DebounceFilter = require('../lib/debounceFilter');
const { v4: uuidv4 } = require('uuid');

// Store active sessions (in production, use Redis or database)
const sessions = new Map();

// Session cleanup (remove sessions older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [sessionId, session] of sessions.entries()) {
    if (session.createdAt < oneHourAgo) {
      sessions.delete(sessionId);
      console.log(`🗑️  Cleaned up debounce session: ${sessionId}`);
    }
  }
}, 300000); // Check every 5 minutes

/**
 * POST /parse - Parse email list and return count
 */
router.post('/parse', async (req, res) => {
  try {
    const { emailText } = req.body;

    if (!emailText) {
      return res.status(400).json({
        success: false,
        error: 'Email text is required'
      });
    }

    const filter = new DebounceFilter();
    const emails = filter.parseEmailList(emailText);

    return res.json({
      success: true,
      count: emails.length,
      emails: emails.slice(0, 10), // Preview first 10
      hasMore: emails.length > 10
    });

  } catch (error) {
    console.error('❌ Parse error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /process - Start email filtering process
 * Creates a session and processes emails with WebSocket updates
 */
router.post('/process', async (req, res) => {
  try {
    const { emailText, concurrency = 50 } = req.body;

    if (!emailText) {
      return res.status(400).json({
        success: false,
        error: 'Email text is required'
      });
    }

    const filter = new DebounceFilter();
    const emails = filter.parseEmailList(emailText);

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid emails found in the input'
      });
    }

    // Create session
    const sessionId = uuidv4();
    const session = {
      sessionId,
      status: 'processing',
      createdAt: Date.now(),
      emails: emails,
      results: {
        safe: [],
        dangerous: [],
        stats: {
          total: emails.length,
          processed: 0,
          safe: 0,
          dangerous: 0,
          filterRate: 0
        }
      },
      error: null
    };

    sessions.set(sessionId, session);

    // Start processing in background
    processEmailsAsync(sessionId, emails, filter, concurrency);

    return res.json({
      success: true,
      sessionId,
      totalEmails: emails.length,
      message: 'Processing started. Use WebSocket to monitor progress.'
    });

  } catch (error) {
    console.error('❌ Process error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /status/:sessionId - Get processing status
 */
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  return res.json({
    success: true,
    sessionId,
    status: session.status,
    results: session.results,
    error: session.error
  });
});

/**
 * GET /results/:sessionId - Get processing results
 */
router.get('/results/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  if (session.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Processing not completed yet',
      status: session.status
    });
  }

  return res.json({
    success: true,
    sessionId,
    results: session.results
  });
});

/**
 * GET /download/:sessionId - Download results as text files
 */
router.get('/download/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { type = 'safe' } = req.query; // 'safe' or 'dangerous'

  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  if (session.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Processing not completed yet'
    });
  }

  const results = session.results;
  let emails = [];
  let filename = '';

  if (type === 'safe') {
    emails = results.safe.map(r => r.email);
    filename = `safe_emails_${sessionId}.txt`;
  } else if (type === 'dangerous') {
    emails = results.dangerous.map(r => `${r.email} | ${r.reason}`);
    filename = `dangerous_emails_${sessionId}.txt`;
  } else {
    return res.status(400).json({
      success: false,
      error: 'Invalid type. Use "safe" or "dangerous"'
    });
  }

  const content = emails.join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(content);
});

/**
 * DELETE /session/:sessionId - Delete session
 */
router.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    return res.json({
      success: true,
      message: 'Session deleted'
    });
  }

  return res.status(404).json({
    success: false,
    error: 'Session not found'
  });
});

/**
 * Process emails asynchronously with WebSocket updates
 */
async function processEmailsAsync(sessionId, emails, filter, concurrency) {
  const session = sessions.get(sessionId);

  try {
    console.log(`🚀 Starting debounce for session ${sessionId} (${emails.length} emails)`);

    const results = await filter.processEmailList(emails, {
      concurrency,
      onProgress: (progress) => {
        // Update session with real-time progress
        if (progress.type === 'progress' && session.results) {
          session.results.stats.processed = progress.processed;
          session.results.stats.safe = progress.safe;
          session.results.stats.dangerous = progress.dangerous;
          session.results.stats.filterRate = progress.filterRate;
        }

        // Send WebSocket update
        broadcastProgress(sessionId, progress);
      }
    });

    // Update session with final results
    session.status = 'completed';
    session.results = results;

    console.log(`✅ Debounce completed for session ${sessionId}`);
    console.log(`   Safe: ${results.stats.safe} | Dangerous: ${results.stats.dangerous} | Filter Rate: ${results.stats.filterRate}%`);

    // Send completion message
    broadcastProgress(sessionId, {
      type: 'completed',
      results: results.stats
    });

  } catch (error) {
    console.error(`❌ Debounce error for session ${sessionId}:`, error);
    session.status = 'error';
    session.error = error.message;

    broadcastProgress(sessionId, {
      type: 'error',
      error: error.message
    });
  }
}

/**
 * Broadcast progress to WebSocket clients
 * This will be called by the WebSocket handler in app.js
 */
function broadcastProgress(sessionId, data) {
  // WebSocket clients listening for this session will receive updates
  // The actual WebSocket broadcasting is handled in app.js
  const message = {
    sessionId,
    timestamp: Date.now(),
    ...data
  };

  // Store last message in session for polling fallback
  const session = sessions.get(sessionId);
  if (session) {
    session.lastMessage = message;
  }

  // Emit to global WebSocket manager if available
  if (global.debounceWSManager) {
    global.debounceWSManager.broadcast(sessionId, message);
  }
}

/**
 * GET /health - Health check endpoint
 */
router.get('/health', (req, res) => {
  return res.json({
    success: true,
    status: 'healthy',
    activeSessions: sessions.size,
    uptime: process.uptime()
  });
});

module.exports = router;
