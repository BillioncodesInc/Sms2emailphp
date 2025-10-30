/**
 * Test Email Campaign WebSocket Implementation
 * Verifies real-time updates, SMTP display, progress tracking, and error handling
 */

const WebSocket = require('ws');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEmailCampaignWebSocket() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║   EMAIL CAMPAIGN WEBSOCKET TEST                ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');

  return new Promise((resolve, reject) => {
    const sessionId = `test-${Date.now()}`;
    const wsUrl = `ws://localhost:9090/ws/email-campaign/${sessionId}`;

    log(`\n📡 Connecting to: ${wsUrl}`, 'cyan');

    const ws = new WebSocket(wsUrl);
    const testRecipients = [
      'test1@example.com',
      'test2@example.com',
      'test3@example.com'
    ];

    let receivedMessages = [];
    let stats = { sent: 0, failed: 0, progress: [] };

    ws.on('open', () => {
      log('✓ WebSocket connected', 'green');
      log('\n📤 Sending campaign start command...', 'cyan');

      // Send campaign start command
      ws.send(JSON.stringify({
        type: 'start',
        payload: {
          campaignId: 'test-campaign-001',
          recipients: testRecipients,
          subject: 'WebSocket Test Email',
          message: 'Testing real-time email campaign with WebSocket',
          sender: 'Test Sender',
          senderAd: 'test@example.com',
          useProxy: false,
          delay: 100
        }
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      receivedMessages.push(message);

      log(`\n📨 Received: ${message.type}`, 'blue');

      if (message.type === 'connected') {
        log(`   Session ID: ${message.sessionId}`, 'blue');

      } else if (message.type === 'start') {
        log(`   Campaign: ${message.campaignId}`, 'blue');
        log(`   Total Recipients: ${message.total}`, 'blue');

      } else if (message.type === 'progress') {
        log(`   📧 Progress: ${message.progress.current}/${message.progress.total} (${message.progress.percentage}%)`, 'yellow');
        log(`   Current Recipient: ${message.currentRecipient}`, 'yellow');
        log(`   Current SMTP: ${message.currentSmtp}`, 'magenta');
        log(`   Sent: ${message.sent} | Failed: ${message.failed}`, 'yellow');
        stats.progress.push(message);

      } else if (message.type === 'sent') {
        stats.sent++;
        log(`   ✓ Sent to: ${message.recipient}`, 'green');
        log(`   Via SMTP: ${message.smtp}`, 'green');

      } else if (message.type === 'failed') {
        stats.failed++;
        log(`   ✗ Failed: ${message.recipient}`, 'red');
        log(`   Error: ${message.error}`, 'red');
        log(`   SMTP: ${message.smtp}`, 'red');

      } else if (message.type === 'completed') {
        log(`\n✅ CAMPAIGN COMPLETED!`, 'green');
        log(`   Sent: ${message.results.sent}`, 'green');
        log(`   Failed: ${message.results.failed}`, 'yellow');
        log(`   Total: ${message.results.total}`, 'blue');
        log(`   Success Rate: ${message.results.successRate}%`, message.results.successRate > 0 ? 'green' : 'red');

        // Verify results
        log('\n🔍 VERIFICATION:', 'cyan');

        const checks = [];

        // Check 1: Received all message types
        const messageTypes = [...new Set(receivedMessages.map(m => m.type))];
        const expectedTypes = ['connected', 'start', 'progress', 'completed'];
        const hasAllTypes = expectedTypes.every(type => messageTypes.includes(type));

        if (hasAllTypes) {
          log('✓ All message types received (connected, start, progress, completed)', 'green');
          checks.push(true);
        } else {
          log(`✗ Missing message types. Expected: ${expectedTypes.join(', ')}. Got: ${messageTypes.join(', ')}`, 'red');
          checks.push(false);
        }

        // Check 2: Progress updates for each recipient
        if (stats.progress.length >= testRecipients.length) {
          log(`✓ Progress updates received (${stats.progress.length} updates for ${testRecipients.length} recipients)`, 'green');
          checks.push(true);
        } else {
          log(`✗ Insufficient progress updates (${stats.progress.length} < ${testRecipients.length})`, 'red');
          checks.push(false);
        }

        // Check 3: SMTP info included
        const hasSmtpInfo = stats.progress.every(p => p.currentSmtp);
        if (hasSmtpInfo) {
          log('✓ SMTP account information included in all progress updates', 'green');
          checks.push(true);
        } else {
          log('✗ SMTP account information missing from some updates', 'red');
          checks.push(false);
        }

        // Check 4: Progress percentage increases
        const percentages = stats.progress.map(p => p.progress.percentage);
        const isIncreasing = percentages.every((p, i) => i === 0 || p >= percentages[i - 1]);
        if (isIncreasing) {
          log(`✓ Progress percentage increases correctly: ${percentages.join('% → ')}%`, 'green');
          checks.push(true);
        } else {
          log(`✗ Progress percentage doesn't increase correctly: ${percentages.join('% → ')}%`, 'red');
          checks.push(false);
        }

        // Check 5: Total sent + failed = total recipients
        const totalProcessed = message.results.sent + message.results.failed;
        if (totalProcessed === message.results.total) {
          log(`✓ All recipients processed: ${totalProcessed} = ${message.results.total}`, 'green');
          checks.push(true);
        } else {
          log(`✗ Recipient count mismatch: ${totalProcessed} ≠ ${message.results.total}`, 'red');
          checks.push(false);
        }

        // Check 6: Status messages (sent/failed) received
        const statusMessages = receivedMessages.filter(m => m.type === 'sent' || m.type === 'failed');
        if (statusMessages.length === testRecipients.length) {
          log(`✓ Status messages for all recipients: ${statusMessages.length}`, 'green');
          checks.push(true);
        } else {
          log(`✗ Status message count mismatch: ${statusMessages.length} ≠ ${testRecipients.length}`, 'red');
          checks.push(false);
        }

        const allPassed = checks.every(c => c);

        log('\n' + '═'.repeat(50), 'cyan');
        if (allPassed) {
          log('🎉 ALL TESTS PASSED!', 'green');
          log('   ✓ WebSocket real-time updates working', 'green');
          log('   ✓ SMTP account display implemented', 'green');
          log('   ✓ Progress tracking functional', 'green');
          log('   ✓ Error handling correct', 'green');
        } else {
          log('❌ SOME TESTS FAILED', 'red');
          log('   Check the verification results above', 'yellow');
        }
        log('═'.repeat(50), 'cyan');

        ws.close();
        resolve(allPassed);

      } else if (message.type === 'error') {
        log(`\n❌ ERROR: ${message.error}`, 'red');
        ws.close();
        reject(new Error(message.error));
      }
    });

    ws.on('error', (error) => {
      log(`\n❌ WebSocket Error: ${error.message}`, 'red');
      reject(error);
    });

    ws.on('close', () => {
      log('\n🔌 WebSocket connection closed', 'blue');
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        log('\n⏱️  Test timed out after 30 seconds', 'yellow');
        ws.close();
        reject(new Error('Test timeout'));
      }
    }, 30000);
  });
}

// Run test
testEmailCampaignWebSocket()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
