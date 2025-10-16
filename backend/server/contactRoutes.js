/**
 * Contact Extractor Routes
 *
 * API endpoints for extracting contacts from email accounts
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const imapHandler = require('../lib/imapHandler');
const tempStorage = require('../lib/tempStorage');

// Active extraction sessions
const activeSessions = new Map();

/**
 * Start contact extraction
 * POST /api/contact/extract
 *
 * Body: {
 *   smtpList: ["password1|user1@gmail.com", "password2|user2@yahoo.com"],
 *   options: {
 *     deduplicate: true,
 *     includePhone: true
 *   }
 * }
 */
router.post('/extract', async (req, res) => {
  try {
    const { smtpList, options = {} } = req.body;

    // Validate inputs
    if (!smtpList || !Array.isArray(smtpList) || smtpList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'smtpList is required and must be a non-empty array'
      });
    }

    // Create session
    const sessionId = uuidv4();
    const sessionDir = tempStorage.createSession('contacts', sessionId);

    // Initialize session state
    const sessionState = {
      sessionId,
      status: 'processing',
      total: smtpList.length,
      completed: 0,
      failed: 0,
      totalContacts: 0,
      uniqueContacts: 0,
      startTime: Date.now(),
      options,
      results: { accounts: [] }
    };

    activeSessions.set(sessionId, sessionState);

    // Start processing asynchronously
    processContactExtraction(sessionId, smtpList, options);

    res.json({
      success: true,
      sessionId,
      message: `Extraction started for ${smtpList.length} accounts`
    });

  } catch (err) {
    console.error('Error starting contact extraction:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Process contact extraction for all accounts
 */
async function processContactExtraction(sessionId, smtpList, options) {
  const sessionState = activeSessions.get(sessionId);
  if (!sessionState) return;

  // Process accounts sequentially to avoid overwhelming servers
  for (const combo of smtpList) {
    await processContactAccount(sessionId, combo, options);
  }

  // Deduplicate if requested
  if (options.deduplicate) {
    deduplicateContacts(sessionId);
  }

  // Mark session as complete
  sessionState.status = 'completed';
  sessionState.endTime = Date.now();
  sessionState.duration = sessionState.endTime - sessionState.startTime;

  tempStorage.updateMetadata('contacts', sessionId, {
    status: 'completed',
    summary: {
      total: sessionState.total,
      completed: sessionState.completed,
      failed: sessionState.failed,
      totalContacts: sessionState.totalContacts,
      uniqueContacts: sessionState.uniqueContacts
    }
  });

  // Emit completion via WebSocket
  emitWebSocketUpdate(sessionId, {
    type: 'complete',
    summary: {
      total: sessionState.total,
      completed: sessionState.completed,
      failed: sessionState.failed,
      totalContacts: sessionState.totalContacts,
      uniqueContacts: sessionState.uniqueContacts
    }
  });
}

/**
 * Process single account for contact extraction
 */
async function processContactAccount(sessionId, comboString, options) {
  const sessionState = activeSessions.get(sessionId);
  if (!sessionState) return;

  let email = '';
  try {
    // Parse combo
    const combo = imapHandler.parseComboResult(comboString);
    email = combo.email;

    // Emit progress update
    emitWebSocketUpdate(sessionId, {
      type: 'progress',
      email,
      status: 'extracting',
      message: `Extracting contacts from ${email}...`
    });

    // Connect to IMAP
    const imap = await imapHandler.connect(combo.email, combo.password);

    // Extract contacts
    // For now, we'll extract from sent emails (contacts will be in "To:" field)
    const contacts = await extractContactsFromSent(imap, options);

    // Close connection
    imapHandler.disconnect(imap);

    // Prepare result
    const accountResult = {
      email,
      status: 'success',
      contactCount: contacts.length,
      contacts,
      timestamp: new Date().toISOString()
    };

    // Save result
    tempStorage.appendContactResult(sessionId, accountResult);

    // Update session state
    sessionState.completed++;
    sessionState.totalContacts += contacts.length;
    sessionState.results.accounts.push(accountResult);

    // Emit result update
    emitWebSocketUpdate(sessionId, {
      type: 'result',
      email,
      contactCount: contacts.length
    });

  } catch (err) {
    console.error(`Error extracting contacts from ${email}:`, err.message);

    // Save failed result
    const accountResult = {
      email,
      status: 'failed',
      contactCount: 0,
      contacts: [],
      error: err.message,
      timestamp: new Date().toISOString()
    };

    try {
      tempStorage.appendContactResult(sessionId, accountResult);
    } catch (saveErr) {
      console.error('Error saving failed result:', saveErr);
    }

    // Update session state
    sessionState.failed++;
    sessionState.results.accounts.push(accountResult);

    // Emit error update
    emitWebSocketUpdate(sessionId, {
      type: 'error',
      email,
      error: err.message
    });
  }
}

/**
 * Extract contacts from sent emails
 */
async function extractContactsFromSent(imap, options) {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) {
        return reject(err);
      }

      // Search for sent emails (look in Sent folder if available)
      const searchCriteria = ['ALL'];

      imap.search(searchCriteria, (err, uids) => {
        if (err) {
          return reject(err);
        }

        if (!uids || uids.length === 0) {
          return resolve([]);
        }

        // Limit to recent 100 messages
        const recentUids = uids.slice(-100);
        const contactsMap = new Map();

        const fetch = imap.fetch(recentUids, {
          bodies: ['HEADER.FIELDS (FROM TO CC)'],
          struct: true
        });

        fetch.on('message', (msg, seqno) => {
          msg.on('body', (stream, info) => {
            let buffer = '';
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
              const parsed = require('imap').parseHeader(buffer);

              // Extract emails from TO and CC fields
              const fields = [...(parsed.to || []), ...(parsed.cc || [])];

              fields.forEach(field => {
                // Extract email addresses from field
                const emailMatches = field.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g);
                if (emailMatches) {
                  emailMatches.forEach(extractedEmail => {
                    if (!contactsMap.has(extractedEmail.toLowerCase())) {
                      // Extract name if available
                      const nameMatch = field.match(/(.+?)<.*?>/);
                      const name = nameMatch ? nameMatch[1].trim().replace(/['"]/g, '') : '';

                      contactsMap.set(extractedEmail.toLowerCase(), {
                        email: extractedEmail,
                        name: name || extractedEmail.split('@')[0]
                      });
                    }
                  });
                }
              });
            });
          });
        });

        fetch.once('error', (err) => {
          reject(err);
        });

        fetch.once('end', () => {
          imap.end();
          const contacts = Array.from(contactsMap.values());
          resolve(contacts);
        });
      });
    });
  });
}

/**
 * Deduplicate contacts across all accounts
 */
function deduplicateContacts(sessionId) {
  const results = tempStorage.getContactResults(sessionId);
  const sessionState = activeSessions.get(sessionId);

  if (!results || !results.accounts) return;

  const globalContactsMap = new Map();

  // Collect all contacts
  results.accounts.forEach(account => {
    if (account.contacts) {
      account.contacts.forEach(contact => {
        const key = contact.email.toLowerCase();
        if (!globalContactsMap.has(key)) {
          globalContactsMap.set(key, contact);
        }
      });
    }
  });

  // Update unique count
  if (sessionState) {
    sessionState.uniqueContacts = globalContactsMap.size;
  }

  // Save deduplicated list
  results.uniqueContacts = Array.from(globalContactsMap.values());
  results.summary = {
    totalContacts: sessionState ? sessionState.totalContacts : 0,
    uniqueContacts: globalContactsMap.size,
    duplicatesRemoved: (sessionState ? sessionState.totalContacts : 0) - globalContactsMap.size
  };

  // Update temp storage
  const sessionDir = tempStorage.baseTempDir + `/contacts-${sessionId}`;
  const resultsFile = require('path').join(sessionDir, 'results.json');
  require('fs').writeFileSync(resultsFile, JSON.stringify(results, null, 2));
}

/**
 * Get extraction status
 * GET /api/contact/status/:sessionId
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
      totalContacts: sessionState.totalContacts,
      uniqueContacts: sessionState.uniqueContacts
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * Get extraction results
 * GET /api/contact/results/:sessionId
 */
router.get('/results/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const results = tempStorage.getContactResults(sessionId);
    const metadata = tempStorage.getMetadata('contacts', sessionId);

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
 * DELETE /api/contact/session/:sessionId
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    activeSessions.delete(sessionId);
    tempStorage.deleteSession('contacts', sessionId);

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
 * GET /api/contact/sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = tempStorage.listSessions('contacts');

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
  if (global.emitContactWebSocketUpdate) {
    global.emitContactWebSocketUpdate(sessionId, data);
  } else {
    console.log(`[WS] Session ${sessionId}:`, data.type);
  }
}

/**
 * Setup WebSocket for contact extractor
 */
function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const sessionId = req.url.split('/').pop();

    if (!sessionId) {
      ws.close();
      return;
    }

    console.log(`WebSocket connected for contacts session: ${sessionId}`);

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
      console.log(`WebSocket disconnected for contacts session: ${sessionId}`);
      if (state.websockets) {
        const index = state.websockets.indexOf(ws);
        if (index > -1) {
          state.websockets.splice(index, 1);
        }
      }
    });
  });

  // Replace the placeholder emitWebSocketUpdate function
  global.emitContactWebSocketUpdate = function(sessionId, data) {
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
