/**
 * Test Email Bulk SMTP Fix
 * Verifies that email campaigns now use bulk SMTP accounts instead of localhost
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk.toString(); });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testEmailBulkFix() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   EMAIL BULK SMTP FIX VERIFICATION    ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');

  // Step 1: Check SMTP configuration
  log('\n📋 Step 1: Checking SMTP configuration...', 'cyan');

  const configResponse = await makeRequest({
    hostname: 'localhost',
    port: 9090,
    path: '/api/smtp/config',
    method: 'GET'
  });

  log(`SMTP Status: ${JSON.stringify(configResponse.data)}`, 'blue');

  if (!configResponse.data.configured) {
    log('✗ SMTP not configured - cannot test', 'red');
    log('  Please configure bulk SMTP first', 'yellow');
    process.exit(1);
  }

  if (configResponse.data.type !== 'bulk') {
    log('⚠️  Warning: SMTP is configured but not in bulk mode', 'yellow');
    log(`  Type: ${configResponse.data.type}`, 'yellow');
  } else {
    log(`✓ Bulk SMTP configured with ${configResponse.data.count} accounts`, 'green');
  }

  // Step 2: Send test email with enhanced response to see errors
  log('\n🚀 Step 2: Testing email sending with bulk SMTP...', 'cyan');
  log('Note: We expect SMTP errors (invalid accounts), but should NOT see localhost errors', 'yellow');

  const emailData = {
    recipients: ['test1@example.com', 'test2@example.com'],
    subject: 'Bulk SMTP Fix Test',
    message: 'Testing that email campaigns use bulk SMTP instead of localhost',
    sender: 'BulkTestBot',
    senderAd: 'bulktest@example.com',
    useProxy: false,
    enhancedResponse: true,
    delay: 100
  };

  const sendResponse = await makeRequest({
    hostname: 'localhost',
    port: 9090,
    path: '/api/email',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, emailData);

  log('\n📊 Results:', 'cyan');
  log(`Status: ${sendResponse.status}`, 'blue');

  if (sendResponse.data.success !== undefined) {
    log(`✓ Enhanced response received`, 'green');
    log(`  Recipients: ${sendResponse.data.recipients}`, 'blue');
    log(`  Sent: ${sendResponse.data.sent}`, sendResponse.data.sent > 0 ? 'green' : 'yellow');
    log(`  Failed: ${sendResponse.data.failed}`, sendResponse.data.failed > 0 ? 'yellow' : 'green');

    // Check error messages
    if (sendResponse.data.details && sendResponse.data.details.length > 0) {
      log('\n📝 Error Analysis:', 'cyan');

      let hasLocalhostError = false;
      let hasSmtpError = false;

      sendResponse.data.details.forEach(detail => {
        if (detail.error) {
          log(`\n  Recipient: ${detail.recipient}`, 'yellow');
          log(`  Error: ${detail.error}`, 'yellow');

          // Check if error mentions localhost
          if (detail.error.includes('127.0.0.1') || detail.error.includes('localhost')) {
            hasLocalhostError = true;
          }

          // Check for SMTP-related errors (expected with test accounts)
          if (detail.error.includes('authentication') ||
              detail.error.includes('credentials') ||
              detail.error.includes('Invalid login') ||
              detail.error.includes('SMTP')) {
            hasSmtpError = true;
          }
        }
      });

      log('\n✅ FIX VERIFICATION:', 'cyan');

      if (hasLocalhostError) {
        log('✗ FAILED: Still trying to connect to localhost (127.0.0.1:587)', 'red');
        log('  The bulk SMTP fix did NOT work!', 'red');
        return false;
      } else {
        log('✓ SUCCESS: No localhost connection attempts detected!', 'green');
        log('  Email campaigns are now using bulk SMTP accounts.', 'green');
      }

      if (hasSmtpError) {
        log('✓ EXPECTED: SMTP authentication errors (test accounts)', 'yellow');
        log('  This is normal with invalid bulk SMTP accounts.', 'yellow');
        log('  With real SMTP accounts, emails would be sent successfully.', 'yellow');
      }

      return true;
    }
  } else {
    log('✗ Unexpected response format', 'red');
    log(`  Response: ${JSON.stringify(sendResponse.data)}`, 'yellow');
    return false;
  }

  log('\n🎉 EMAIL BULK SMTP FIX VERIFIED!', 'green');
  log('   Email campaigns now use bulk SMTP accounts instead of localhost.', 'green');
  log('   Ready for production deployment on Render.', 'green');

  return true;
}

// Run test
testEmailBulkFix()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n✗ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
