/**
 * Email Campaign WebSocket Routes
 * Provides real-time email campaign execution with progress tracking
 */

const text = require('../lib/text');
const AttachmentStorage = require('../lib/attachmentStorage');
const fs = require('fs').promises;

// Initialize attachment storage
const attachmentStorage = new AttachmentStorage();
attachmentStorage.initialize().catch(console.error);

// Store active email campaign sessions
const activeSessions = new Map();

/**
 * Setup WebSocket route for email campaign execution
 * @param {*} wss - WebSocket server instance
 */
function setupEmailCampaignWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const sessionId = req.url.split('/').pop();

    // Validate session ID
    if (!sessionId || sessionId === 'email-campaign') {
      ws.close(1008, 'Invalid session ID');
      return;
    }

    console.log(`[Email Campaign WS] Client connected: ${sessionId}`);

    // Store WebSocket connection
    activeSessions.set(sessionId, { ws, startTime: Date.now() });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages (campaign start command)
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'start') {
          await executeEmailCampaign(sessionId, data.payload, ws);
        }
      } catch (error) {
        console.error(`[Email Campaign WS] Error processing message:`, error);
        ws.send(JSON.stringify({
          type: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log(`[Email Campaign WS] Client disconnected: ${sessionId}`);
      activeSessions.delete(sessionId);
    });

    ws.on('error', (error) => {
      console.error(`[Email Campaign WS] Error:`, error);
      activeSessions.delete(sessionId);
    });
  });
}

/**
 * Execute email campaign with real-time WebSocket updates
 */
async function executeEmailCampaign(sessionId, payload, ws) {
  const {
    campaignId,
    recipients,
    subject,
    message,
    sender,
    senderAd,
    useProxy,
    delay,
    protectLinks,
    linkProtectionLevel,
    attachmentIds
  } = payload;

  // Validate inputs
  if (!Array.isArray(recipients) || recipients.length === 0) {
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Recipients must be a non-empty array',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  console.log(`[Email Campaign] Starting campaign ${campaignId} with ${recipients.length} recipients`);

  // Process attachments if provided
  let htmlContent = null;
  let emailAttachments = [];

  if (Array.isArray(attachmentIds) && attachmentIds.length > 0) {
    console.log(`[Email Campaign] Processing ${attachmentIds.length} attachment(s)`);

    for (const attachmentId of attachmentIds) {
      try {
        const attachment = attachmentStorage.getAttachment(attachmentId);

        if (!attachment) {
          console.warn(`[Email Campaign] Attachment ${attachmentId} not found, skipping`);
          continue;
        }

        // Check if this attachment should be used as HTML content
        if (attachment.useAsHtmlContent) {
          // Read file content as HTML
          const content = await fs.readFile(attachment.path, 'utf8');
          htmlContent = content;
          console.log(`[Email Campaign] Using attachment "${attachment.name}" as HTML content (${content.length} chars)`);
        } else {
          // Regular attachment - add to attachments array
          emailAttachments.push({
            filename: attachment.originalName || attachment.name,
            path: attachment.path
          });
          console.log(`[Email Campaign] Added regular attachment: "${attachment.name}"`);
        }
      } catch (error) {
        console.error(`[Email Campaign] Error processing attachment ${attachmentId}:`, error);
        ws.send(JSON.stringify({
          type: 'warning',
          message: `Failed to process attachment: ${error.message}`,
          timestamp: new Date().toISOString()
        }));
      }
    }
  }

  // Send start notification
  ws.send(JSON.stringify({
    type: 'start',
    campaignId,
    total: recipients.length,
    timestamp: new Date().toISOString()
  }));

  const results = {
    sent: 0,
    failed: 0,
    total: recipients.length,
    details: []
  };

  const sendDelay = delay || 50; // Reduced from 500ms → 100ms → 50ms for maximum sending speed

  // Process each recipient
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const progress = {
      current: i + 1,
      total: recipients.length,
      percentage: Math.round(((i + 1) / recipients.length) * 100)
    };

    // Get current SMTP info (if bulk mode is enabled)
    let smtpInfo = 'Default SMTP';
    try {
      const smtpConfig = text.getCurrentSmtpInfo ? text.getCurrentSmtpInfo() : null;
      if (smtpConfig) {
        smtpInfo = smtpConfig.user || smtpConfig.host || 'Bulk SMTP';
      }
    } catch (e) {
      // Ignore if method doesn't exist
    }

    // Send progress update BEFORE sending
    ws.send(JSON.stringify({
      type: 'progress',
      progress,
      currentRecipient: recipient,
      currentSmtp: smtpInfo,
      sent: results.sent,
      failed: results.failed,
      timestamp: new Date().toISOString()
    }));

    // Send email to this recipient
    try {
      await new Promise((resolve, reject) => {
        text.email(
          [recipient],
          subject,
          message,
          senderAd ? `"${sender}" <${senderAd}>` : sender,
          useProxy,
          htmlContent,
          emailAttachments,
          (err, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(info);
            }
          }
        );
      });

      // Success
      results.sent++;
      results.details.push({
        recipient,
        status: 'sent',
        smtp: smtpInfo,
        timestamp: new Date().toISOString()
      });

      // Send success update
      ws.send(JSON.stringify({
        type: 'sent',
        recipient,
        smtp: smtpInfo,
        progress,
        sent: results.sent,
        failed: results.failed,
        timestamp: new Date().toISOString()
      }));

      console.log(`[Email Campaign] ✓ Sent to ${recipient} via ${smtpInfo}`);

    } catch (error) {
      // Failure
      results.failed++;
      const errorMessage = error.message || String(error);
      results.details.push({
        recipient,
        status: 'failed',
        error: errorMessage,
        smtp: smtpInfo,
        timestamp: new Date().toISOString()
      });

      // Send failure update
      ws.send(JSON.stringify({
        type: 'failed',
        recipient,
        error: errorMessage,
        smtp: smtpInfo,
        progress,
        sent: results.sent,
        failed: results.failed,
        timestamp: new Date().toISOString()
      }));

      console.log(`[Email Campaign] ✗ Failed to send to ${recipient}: ${errorMessage}`);
    }

    // Apply delay between sends (except after last one)
    if (i < recipients.length - 1 && sendDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, sendDelay));
    }
  }

  // Calculate final stats
  const successRate = results.total > 0
    ? Math.round((results.sent / results.total) * 100)
    : 0;

  // Send completion notification
  ws.send(JSON.stringify({
    type: 'completed',
    campaignId,
    results: {
      sent: results.sent,
      failed: results.failed,
      total: results.total,
      successRate,
      details: results.details
    },
    timestamp: new Date().toISOString()
  }));

  console.log(`[Email Campaign] Completed ${campaignId}: ${results.sent}/${results.total} sent (${successRate}%)`);
}

/**
 * Get active session count
 */
function getActiveSessionCount() {
  return activeSessions.size;
}

module.exports = {
  setupEmailCampaignWebSocket,
  getActiveSessionCount
};
