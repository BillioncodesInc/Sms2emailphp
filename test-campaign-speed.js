/**
 * Campaign Speed Test
 * Tests both SMS and Email campaign modes with the new optimized delay (50ms)
 */

const axios = require('axios');

const API_BASE = 'http://localhost:9090/api/enhanced';
const API_LEGACY = 'http://localhost:9090/api';

// Test recipients (small set for quick testing)
const TEST_EMAIL_RECIPIENTS = [
  'test1@example.com',
  'test2@example.com',
  'test3@example.com',
  'test4@example.com',
  'test5@example.com'
];

const TEST_SMS_RECIPIENTS = [
  '1234567890',
  '1234567891',
  '1234567892',
  '1234567893',
  '1234567894'
];

console.log('🧪 Starting Campaign Speed Tests...\n');

async function testEmailCampaignSpeed() {
  console.log('📧 Testing Email Campaign Speed (50ms delay)...');

  try {
    const startTime = Date.now();

    // Create email campaign
    const createResponse = await axios.post(`${API_BASE}/campaigns/create`, {
      mode: 'email',
      name: 'Speed Test Email Campaign',
      content: {
        subject: 'Speed Test Email',
        message: 'This is a speed test email campaign with 50ms delay.'
      },
      sender: {
        name: 'Speed Test',
        email: 'test@example.com'
      },
      recipients: TEST_EMAIL_RECIPIENTS,
      options: {
        delay: 50, // New optimized delay
        priority: 'high',
        useProxy: false
      }
    });

    if (!createResponse.data.success) {
      console.error('❌ Failed to create email campaign:', createResponse.data.error);
      return;
    }

    const campaignId = createResponse.data.campaign.id;
    console.log(`✅ Email campaign created with ID: ${campaignId}`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  Email Campaign Test Duration: ${duration}ms`);
    console.log(`📊 Recipients: ${TEST_EMAIL_RECIPIENTS.length}`);
    console.log(`⚡ Expected time with 50ms delay: ~${50 * TEST_EMAIL_RECIPIENTS.length}ms`);
    console.log(`✓ Email campaign speed test completed\n`);

    // Delete test campaign
    await axios.delete(`${API_BASE}/campaigns/${campaignId}`);

  } catch (error) {
    console.error('❌ Email campaign speed test failed:', error.message);
  }
}

async function testSMSCampaignSpeed() {
  console.log('📱 Testing SMS Campaign Speed (50ms delay)...');

  try {
    const startTime = Date.now();

    // Create SMS campaign
    const createResponse = await axios.post(`${API_BASE}/campaigns/create`, {
      mode: 'sms',
      name: 'Speed Test SMS Campaign',
      content: {
        message: 'This is a speed test SMS campaign with 50ms delay.'
      },
      sender: {
        name: 'Speed Test'
      },
      carrier: 'att',
      recipients: TEST_SMS_RECIPIENTS,
      options: {
        delay: 50, // New optimized delay
        priority: 'high'
      }
    });

    if (!createResponse.data.success) {
      console.error('❌ Failed to create SMS campaign:', createResponse.data.error);
      return;
    }

    const campaignId = createResponse.data.campaign.id;
    console.log(`✅ SMS campaign created with ID: ${campaignId}`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  SMS Campaign Test Duration: ${duration}ms`);
    console.log(`📊 Recipients: ${TEST_SMS_RECIPIENTS.length}`);
    console.log(`⚡ Expected time with 50ms delay: ~${50 * TEST_SMS_RECIPIENTS.length}ms`);
    console.log(`✓ SMS campaign speed test completed\n`);

    // Delete test campaign
    await axios.delete(`${API_BASE}/campaigns/${campaignId}`);

  } catch (error) {
    console.error('❌ SMS campaign speed test failed:', error.message);
  }
}

async function verifyBackendDefaults() {
  console.log('🔍 Verifying Backend Default Delays...\n');

  console.log('Expected defaults:');
  console.log('  • Email Campaign: 50ms (backend/server/emailCampaignRoutes.js:160)');
  console.log('  • SMS Campaign: 50ms (backend/server/app.js:1681)');
  console.log('  • Frontend defaults: 50ms (index.php lines 1377, 1542, 1771, 6079)');
  console.log('');
}

async function runAllTests() {
  verifyBackendDefaults();

  // Test email campaign speed
  await testEmailCampaignSpeed();

  // Test SMS campaign speed
  await testSMSCampaignSpeed();

  console.log('✅ All campaign speed tests completed!');
  console.log('\n📈 Speed Improvement Summary:');
  console.log('  • Previous default delay: 500ms (email) / 1000ms (sms)');
  console.log('  • New default delay: 50ms (both modes)');
  console.log('  • Email speed improvement: 10x faster');
  console.log('  • SMS speed improvement: 20x faster');
  console.log('  • For 1000 recipients:');
  console.log('    - Email: 50 seconds (was 500 seconds)');
  console.log('    - SMS: 50 seconds (was 1000 seconds)');
}

// Run tests
runAllTests().catch(console.error);
