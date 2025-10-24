/**
 * Combo Processing Routes
 *
 * API endpoints for SMTP combo validation
 * Includes WebSocket support for real-time progress updates
 */

const express = require('express');
const router = express.Router();
const ComboProcessor = require('../lib/comboProcessor');
const comboParser = require('../lib/comboParser');

// Store active processing sessions
const activeSessions = new Map();

/**
 * POST /api/smtp/combo/parse
 * Parse combo list and validate format
 */
router.post('/parse', (req, res) => {
  try {
    const { text, format = 'auto' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid combo text'
      });
    }

    // Parse combos
    const parseResult = comboParser.parse(text, format);

    // Validate combos
    const validation = comboParser.validate(parseResult.combos);

    // Get statistics
    const stats = comboParser.getStats(parseResult.combos);

    res.json({
      success: true,
      combos: parseResult.combos,
      errors: parseResult.errors,
      validation,
      stats
    });

  } catch (error) {
    console.error('Error parsing combos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/smtp/combo/process
 * Start processing combo list
 */
router.post('/process', async (req, res) => {
  try {
    const { combos, threads = 5, options = {} } = req.body;

    if (!combos || !Array.isArray(combos) || combos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid combos array'
      });
    }

    // Create processor instance
    const processor = new ComboProcessor({
      threads: parseInt(threads) || 5,
      timeout: options.timeout || 10000,
      skipBlacklist: options.skipBlacklist || false,
      retryFailed: options.retryFailed || false,
      useProxy: options.useProxy || false // Enable proxy rotation for IP protection
    });

    // Store session
    activeSessions.set(processor.sessionId, {
      processor,
      startTime: new Date(),
      combos: combos.length
    });

    // Start processing (don't await - it runs in background)
    processor.processBatch(combos).then(() => {
      console.log(`Session ${processor.sessionId} completed`);
    }).catch((error) => {
      console.error(`Session ${processor.sessionId} error:`, error);
    });

    // Return session info immediately
    res.json({
      success: true,
      sessionId: processor.sessionId,
      total: combos.length,
      status: 'processing',
      message: 'Processing started. Connect to WebSocket for updates.'
    });

  } catch (error) {
    console.error('Error starting combo processing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/smtp/combo/status/:sessionId
 * Get current status of processing session
 */
router.get('/status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const stats = session.processor.getStats();

    res.json({
      success: true,
      sessionId,
      stats,
      startTime: session.startTime
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/smtp/combo/results/:sessionId
 * Get results from completed or running session
 */
router.get('/results/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = 'json' } = req.query;

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const results = session.processor.getAllResults();

    // Return formatted results based on format query
    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="smtp_results_${sessionId}.txt"`);
      res.send(session.processor.exportResults('txt'));
      return;
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="smtp_results_${sessionId}.csv"`);
      res.send(session.processor.exportResults('csv'));
      return;
    }

    // Default: JSON
    res.json({
      success: true,
      sessionId,
      results
    });

  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/smtp/combo/pause/:sessionId
 * Pause processing session
 */
router.post('/pause/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.processor.pause();

    res.json({
      success: true,
      message: 'Processing paused',
      stats: session.processor.getStats()
    });

  } catch (error) {
    console.error('Error pausing session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/smtp/combo/resume/:sessionId
 * Resume paused session
 */
router.post('/resume/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.processor.resume();

    res.json({
      success: true,
      message: 'Processing resumed',
      stats: session.processor.getStats()
    });

  } catch (error) {
    console.error('Error resuming session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/smtp/combo/stop/:sessionId
 * Stop processing session
 */
router.post('/stop/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.processor.stop();

    res.json({
      success: true,
      message: 'Processing stopped',
      stats: session.processor.getStats()
    });

  } catch (error) {
    console.error('Error stopping session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/smtp/combo/session/:sessionId
 * Delete session and cleanup resources
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Stop if still running
    if (session.processor.isRunning) {
      session.processor.stop();
    }

    // Cleanup
    session.processor.cleanup();
    activeSessions.delete(sessionId);

    res.json({
      success: true,
      message: 'Session deleted'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/smtp/combo/sessions
 * List all active sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = [];

    for (const [sessionId, session] of activeSessions.entries()) {
      sessions.push({
        sessionId,
        startTime: session.startTime,
        stats: session.processor.getStats()
      });
    }

    res.json({
      success: true,
      sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * WebSocket handler setup
 * This function should be called from app.js to set up WebSocket connections
 * @param {WebSocket.Server} wss - WebSocket server instance
 */
function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    // Extract session ID from URL
    const urlParts = req.url.split('/');
    const sessionId = urlParts[urlParts.length - 1];

    console.log(`WebSocket connected for session: ${sessionId}`);

    const session = activeSessions.get(sessionId);

    if (!session) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Session not found'
      }));
      ws.close();
      return;
    }

    const processor = session.processor;

    // Send initial stats
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      stats: processor.getStats()
    }));

    // Set up event listeners
    const progressHandler = (data) => {
      ws.send(JSON.stringify({
        type: 'progress',
        ...data
      }));
    };

    const validHandler = (result) => {
      ws.send(JSON.stringify({
        type: 'result',
        result
      }));
    };

    const invalidHandler = (result) => {
      ws.send(JSON.stringify({
        type: 'error',
        email: result.email,
        error: result.error
      }));
    };

    const completeHandler = (summary) => {
      ws.send(JSON.stringify({
        type: 'complete',
        summary
      }));
    };

    const pausedHandler = () => {
      ws.send(JSON.stringify({
        type: 'paused',
        stats: processor.getStats()
      }));
    };

    const resumedHandler = () => {
      ws.send(JSON.stringify({
        type: 'resumed',
        stats: processor.getStats()
      }));
    };

    const stoppedHandler = (stats) => {
      ws.send(JSON.stringify({
        type: 'stopped',
        stats
      }));
    };

    // Attach listeners
    processor.on('progress', progressHandler);
    processor.on('valid', validHandler);
    processor.on('invalid', invalidHandler);
    processor.on('complete', completeHandler);
    processor.on('paused', pausedHandler);
    processor.on('resumed', resumedHandler);
    processor.on('stopped', stoppedHandler);

    // Handle client messages (pause, resume, stop)
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.action) {
          case 'pause':
            processor.pause();
            break;
          case 'resume':
            processor.resume();
            break;
          case 'stop':
            processor.stop();
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    // Cleanup on disconnect
    ws.on('close', () => {
      console.log(`WebSocket disconnected for session: ${sessionId}`);
      processor.off('progress', progressHandler);
      processor.off('valid', validHandler);
      processor.off('invalid', invalidHandler);
      processor.off('complete', completeHandler);
      processor.off('paused', pausedHandler);
      processor.off('resumed', resumedHandler);
      processor.off('stopped', stoppedHandler);
    });
  });
}

// Export router and WebSocket setup function
module.exports = {
  router,
  setupWebSocket,
  activeSessions // Export for testing/debugging
};
