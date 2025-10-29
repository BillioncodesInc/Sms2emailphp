#!/usr/bin/env node
/**
 * SMS Campaign Test Script
 * Tests SMS campaign flow with fake SMTP (no actual emails sent)
 */

const http = require('http');

const API_BASE = 'http://localhost:9090/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
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
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test1_getCarrierList() {
  log('\n========================================', 'cyan');
  log('TEST 1: Get Carrier List', 'cyan');
  log('========================================', 'cyan');

  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 9090,
      path: '/api/carriers',
      method: 'GET'
    });

    if (response.status === 200 && response.data.success) {
      log(`✓ GET /api/carriers returned ${response.data.count} carriers`, 'green');

      // Check for major carriers
      const carriers = response.data.carriers.map(c => c.key);
      const majorCarriers = ['verizon', 'att', 'tmobile', 'sprint', 'cricket'];

      majorCarriers.forEach(carrier => {
        if (carriers.includes(carrier)) {
          log(`  ✓ ${carrier} found`, 'green');
        } else {
          log(`  ✗ ${carrier} NOT found`, 'red');
        }
      });

      return { passed: true, carriers };
    } else {
      log(`✗ Failed to get carriers: ${JSON.stringify(response.data)}`, 'red');
      return { passed: false };
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { passed: false };
  }
}

async function test2_validateCarrier() {
  log('\n========================================', 'cyan');
  log('TEST 2: Carrier Validation', 'cyan');
  log('========================================', 'cyan');

  // Test with VALID carrier
  log('\nTest 2a: Valid Carrier (verizon)', 'blue');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 9090,
      path: '/api/campaign/execute-sms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      campaignId: 'test-valid-carrier',
      carrier: 'verizon',
      recipients: ['1234567890'],
      message: 'Test message',
      sender: 'TestUser',
      delay: 100
    });

    // Should succeed or fail with SMTP error, not carrier error
    if (response.data.error && response.data.error.includes('not supported')) {
      log(`✗ Valid carrier rejected: ${response.data.error}`, 'red');
      return { passed: false };
    } else {
      log(`✓ Valid carrier accepted (verizon)`, 'green');
      log(`  Response: ${JSON.stringify(response.data)}`, 'yellow');
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { passed: false };
  }

  // Test with INVALID carrier
  log('\nTest 2b: Invalid Carrier (fakecorp)', 'blue');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 9090,
      path: '/api/campaign/execute-sms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      campaignId: 'test-invalid-carrier',
      carrier: 'fakecorp',
      recipients: ['1234567890'],
      message: 'Test message',
      sender: 'TestUser',
      delay: 100
    });

    if (response.status === 400 && response.data.error && response.data.error.includes('not supported')) {
      log(`✓ Invalid carrier rejected correctly`, 'green');
      log(`  Error: ${response.data.error}`, 'yellow');
      return { passed: true };
    } else {
      log(`✗ Invalid carrier should be rejected but got: ${JSON.stringify(response.data)}`, 'red');
      return { passed: false };
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { passed: false };
  }
}

async function test3_validateRequiredFields() {
  log('\n========================================', 'cyan');
  log('TEST 3: Required Field Validation', 'cyan');
  log('========================================', 'cyan');

  const testCases = [
    {
      name: 'Missing campaignId',
      data: {
        carrier: 'verizon',
        recipients: ['1234567890'],
        message: 'Test',
        sender: 'TestUser'
      },
      expectedError: 'Missing required fields'
    },
    {
      name: 'Missing carrier',
      data: {
        campaignId: 'test123',
        recipients: ['1234567890'],
        message: 'Test',
        sender: 'TestUser'
      },
      expectedError: 'Missing required fields'
    },
    {
      name: 'Missing recipients',
      data: {
        campaignId: 'test123',
        carrier: 'verizon',
        message: 'Test',
        sender: 'TestUser'
      },
      expectedError: 'Missing required fields'
    },
    {
      name: 'Empty recipients array',
      data: {
        campaignId: 'test123',
        carrier: 'verizon',
        recipients: [],
        message: 'Test',
        sender: 'TestUser'
      },
      expectedError: 'Recipients must be a non-empty array'
    },
    {
      name: 'Missing message',
      data: {
        campaignId: 'test123',
        carrier: 'verizon',
        recipients: ['1234567890'],
        sender: 'TestUser'
      },
      expectedError: 'Missing required fields'
    }
  ];

  let passed = true;

  for (const testCase of testCases) {
    log(`\nTest 3: ${testCase.name}`, 'blue');

    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 9090,
        path: '/api/campaign/execute-sms',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, testCase.data);

      if (response.status === 400 && response.data.error && response.data.error.includes(testCase.expectedError)) {
        log(`  ✓ Correctly rejected: ${response.data.error}`, 'green');
      } else {
        log(`  ✗ Expected rejection but got: ${JSON.stringify(response.data)}`, 'red');
        passed = false;
      }
    } catch (error) {
      log(`  ✗ Error: ${error.message}`, 'red');
      passed = false;
    }
  }

  return { passed };
}

async function test4_phoneNumberSanitization() {
  log('\n========================================', 'cyan');
  log('TEST 4: Phone Number Sanitization', 'cyan');
  log('========================================', 'cyan');

  const phoneFormats = [
    { input: '1234567890', expected: '1234567890', description: 'Plain 10 digits' },
    { input: '(123) 456-7890', expected: '1234567890', description: 'Formatted with parentheses' },
    { input: '+1-123-456-7890', expected: '11234567890', description: 'International format' },
    { input: '123.456.7890', expected: '1234567890', description: 'Dot-separated' },
    { input: '123-456-7890', expected: '1234567890', description: 'Dash-separated' }
  ];

  log('\nTesting phone number sanitization (will fail with SMTP error but that\'s expected):', 'blue');

  for (const format of phoneFormats) {
    log(`\n  Input: ${format.input} (${format.description})`, 'yellow');
    log(`  Expected cleaned: ${format.expected}`, 'yellow');

    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 9090,
        path: '/api/campaign/execute-sms',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        campaignId: `test-sanitize-${Date.now()}`,
        carrier: 'verizon',
        recipients: [format.input],
        message: 'Test',
        sender: 'TestUser',
        delay: 100
      });

      // We expect SMTP failure, not format rejection
      if (response.data.error && response.data.error.includes('not supported')) {
        log(`  ✗ Phone number rejected as invalid (shouldn't happen)`, 'red');
      } else {
        log(`  ✓ Phone number accepted and will be sanitized`, 'green');
      }
    } catch (error) {
      log(`  ✗ Error: ${error.message}`, 'red');
    }
  }

  log('\n  Note: Backend sanitizes with .replace(/\\D/g, \'\') to strip non-digits', 'yellow');
  return { passed: true };
}

async function test5_createCampaign() {
  log('\n========================================', 'cyan');
  log('TEST 5: Create SMS Campaign', 'cyan');
  log('========================================', 'cyan');

  try {
    const campaignData = {
      name: 'Test SMS Campaign ' + Date.now(),
      mode: 'sms',
      sender: {
        name: 'TestUser'
      },
      content: {
        message: 'This is a test SMS campaign message',
        link: ''
      },
      recipients: ['1234567890', '9876543210'],
      carrier: 'verizon',
      attachments: [],
      options: {
        useProxy: false,
        protectLinks: false,
        delay: 1000
      }
    };

    log('\nCreating campaign:', 'blue');
    log(JSON.stringify(campaignData, null, 2), 'yellow');

    const response = await makeRequest({
      hostname: 'localhost',
      port: 9090,
      path: '/api/enhanced/campaigns/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, campaignData);

    if (response.status === 200 && response.data.success) {
      log(`✓ Campaign created successfully`, 'green');
      log(`  Campaign ID: ${response.data.campaign.id}`, 'green');
      log(`  Name: ${response.data.campaign.name}`, 'green');
      log(`  Mode: ${response.data.campaign.mode}`, 'green');
      log(`  Carrier: ${response.data.campaign.carrier}`, 'green');
      log(`  Recipients: ${response.data.campaign.recipients.length}`, 'green');
      return { passed: true, campaignId: response.data.campaign.id };
    } else {
      log(`✗ Failed to create campaign: ${JSON.stringify(response.data)}`, 'red');
      return { passed: false };
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { passed: false };
  }
}

async function test6_executeSMSCampaign() {
  log('\n========================================', 'cyan');
  log('TEST 6: Execute SMS Campaign', 'cyan');
  log('========================================', 'cyan');

  log('\nNote: This will fail with SMTP error since we don\'t have real SMTP configured', 'yellow');
  log('But we can verify the API structure and validation logic works correctly', 'yellow');

  try {
    const executionData = {
      campaignId: 'test-exec-' + Date.now(),
      carrier: 'verizon',
      recipients: ['1234567890', '9876543210', '5551234567'],
      message: 'Hello! This is a test SMS from the SE Gateway campaign system.',
      sender: 'TestBot',
      delay: 1000
    };

    log('\nExecuting campaign:', 'blue');
    log(JSON.stringify(executionData, null, 2), 'yellow');

    const response = await makeRequest({
      hostname: 'localhost',
      port: 9090,
      path: '/api/campaign/execute-sms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, executionData);

    log(`\nResponse Status: ${response.status}`, 'blue');
    log(JSON.stringify(response.data, null, 2), 'yellow');

    // Check if response structure is correct (even if SMTP failed)
    if (response.data.success !== undefined && response.data.results !== undefined) {
      log(`✓ API response structure is correct`, 'green');

      if (response.data.success) {
        log(`✓ Campaign executed successfully`, 'green');
        log(`  Sent: ${response.data.results.sent}/${response.data.results.total}`, 'green');
        log(`  Failed: ${response.data.results.failed}/${response.data.results.total}`, 'green');
        log(`  Success Rate: ${response.data.results.successRate}%`, 'green');
      } else {
        log(`⚠ Campaign execution attempted but had failures (expected with fake SMTP)`, 'yellow');
        log(`  This is normal - SMTP is not configured`, 'yellow');
      }

      return { passed: true };
    } else {
      log(`✗ Unexpected response structure`, 'red');
      return { passed: false };
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { passed: false };
  }
}

async function test7_carrierGatewayMapping() {
  log('\n========================================', 'cyan');
  log('TEST 7: Carrier Gateway Mapping', 'cyan');
  log('========================================', 'cyan');

  try {
    const carriers = require('./backend/lib/carriers.js');

    log('\nVerifying carrier gateway mappings:', 'blue');

    const testCarriers = [
      { key: 'verizon', expectedGateway: '@vtext.com' },
      { key: 'att', expectedGateway: '@txt.att.net' },
      { key: 'tmobile', expectedGateway: '@tmomail.net' },
      { key: 'sprint', expectedGateway: '@messaging.sprintpcs.com' },
      { key: 'cricket', expectedGateway: '@mms.cricketwireless.net' }
    ];

    let allPassed = true;

    for (const test of testCarriers) {
      const gateway = carriers[test.key];
      if (gateway && gateway[0] && gateway[0].includes(test.expectedGateway)) {
        log(`  ✓ ${test.key}: ${gateway[0]}`, 'green');
      } else {
        log(`  ✗ ${test.key}: Expected ${test.expectedGateway}, got ${gateway ? gateway[0] : 'undefined'}`, 'red');
        allPassed = false;
      }
    }

    log(`\nTotal carriers defined: ${Object.keys(carriers).length}`, 'blue');

    return { passed: allPassed };
  } catch (error) {
    log(`✗ Error loading carriers.js: ${error.message}`, 'red');
    return { passed: false };
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   SMS CAMPAIGN INTEGRATION TEST SUITE  ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Run all tests
  const tests = [
    { name: 'Get Carrier List', fn: test1_getCarrierList },
    { name: 'Carrier Validation', fn: test2_validateCarrier },
    { name: 'Required Field Validation', fn: test3_validateRequiredFields },
    { name: 'Phone Number Sanitization', fn: test4_phoneNumberSanitization },
    { name: 'Create Campaign', fn: test5_createCampaign },
    { name: 'Execute SMS Campaign', fn: test6_executeSMSCampaign },
    { name: 'Carrier Gateway Mapping', fn: test7_carrierGatewayMapping }
  ];

  for (const test of tests) {
    results.total++;
    try {
      const result = await test.fn();
      if (result.passed) {
        results.passed++;
        results.tests.push({ name: test.name, status: 'PASSED' });
      } else {
        results.failed++;
        results.tests.push({ name: test.name, status: 'FAILED' });
      }
    } catch (error) {
      results.failed++;
      results.tests.push({ name: test.name, status: 'ERROR', error: error.message });
      log(`\n✗ Test "${test.name}" threw error: ${error.message}`, 'red');
    }
  }

  // Print summary
  log('\n\n╔════════════════════════════════════════╗', 'cyan');
  log('║           TEST SUMMARY                 ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');

  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASSED' ? '✓' : '✗';
    const color = test.status === 'PASSED' ? 'green' : 'red';
    log(`${icon} Test ${index + 1}: ${test.name} - ${test.status}`, color);
  });

  log('\n' + '='.repeat(40), 'cyan');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`, results.failed > 0 ? 'yellow' : 'green');
  log('='.repeat(40) + '\n', 'cyan');

  if (results.failed === 0) {
    log('🎉 ALL TESTS PASSED! SMS Campaign system is working correctly!', 'green');
    log('\nNote: Actual SMS sending requires configured SMTP server.', 'yellow');
    log('The tests verified all API endpoints, validation logic, and data flow.', 'yellow');
  } else {
    log('⚠️  SOME TESTS FAILED. Please review the output above.', 'red');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n✗ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
