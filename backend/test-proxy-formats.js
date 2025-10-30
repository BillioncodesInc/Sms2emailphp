/**
 * Test Universal Proxy Format Parser
 * Verifies support for both user:pass@host:port and host:port:user:pass formats
 */

const { parseProxyString, parseProxyArray, proxyToUrl, isValidProxy } = require('./lib/proxyParser');

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

function testProxyFormats() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║   UNIVERSAL PROXY FORMAT PARSER TEST           ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');

  const testCases = [
    // Format 1: user:pass@host:port
    {
      input: 'username:password@proxy.example.com:8080',
      expected: { host: 'proxy.example.com', port: '8080', username: 'username', password: 'password' },
      description: 'Format 1: user:pass@host:port (with auth)'
    },
    // Format 2: host:port:user:pass
    {
      input: 'proxy.example.com:8080:username:password',
      expected: { host: 'proxy.example.com', port: '8080', username: 'username', password: 'password' },
      description: 'Format 2: host:port:user:pass (with auth)'
    },
    // Format 3: host:port (no auth)
    {
      input: 'proxy.example.com:8080',
      expected: { host: 'proxy.example.com', port: '8080' },
      description: 'Format 3: host:port (no auth)'
    },
    // IP addresses
    {
      input: 'user:pass@192.168.1.100:3128',
      expected: { host: '192.168.1.100', port: '3128', username: 'user', password: 'pass' },
      description: 'IP address with @ format'
    },
    {
      input: '192.168.1.100:3128:user:pass',
      expected: { host: '192.168.1.100', port: '3128', username: 'user', password: 'pass' },
      description: 'IP address with colon format'
    },
    {
      input: '192.168.1.100:3128',
      expected: { host: '192.168.1.100', port: '3128' },
      description: 'IP address without auth'
    },
    // Special characters in credentials
    {
      input: 'user@domain:p@ssw0rd!@proxy.com:8080',
      expected: { host: 'proxy.com', port: '8080', username: 'user@domain', password: 'p@ssw0rd!' },
      description: 'Special characters in username/password (@ format)'
    },
    // Invalid formats
    {
      input: 'proxy.com',
      expected: null,
      description: 'Invalid: hostname only (no port)'
    },
    {
      input: 'proxy.com:8080:user',
      expected: null,
      description: 'Invalid: 3 parts (incomplete credentials)'
    },
    {
      input: '',
      expected: null,
      description: 'Invalid: empty string'
    }
  ];

  log('\n📋 Running Test Cases:', 'cyan');
  log('═'.repeat(80), 'cyan');

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    log(`\n🧪 Test ${index + 1}: ${testCase.description}`, 'blue');
    log(`   Input: "${testCase.input}"`, 'blue');

    const result = parseProxyString(testCase.input);

    // Compare result with expected
    let testPassed = false;
    if (testCase.expected === null) {
      testPassed = result === null;
    } else {
      testPassed = result !== null &&
                   result.host === testCase.expected.host &&
                   result.port === testCase.expected.port &&
                   result.username === testCase.expected.username &&
                   result.password === testCase.expected.password;
    }

    if (testPassed) {
      log(`   ✓ PASSED`, 'green');
      if (result) {
        log(`   Output: ${JSON.stringify(result)}`, 'green');
      }
      passed++;
    } else {
      log(`   ✗ FAILED`, 'red');
      log(`   Expected: ${JSON.stringify(testCase.expected)}`, 'yellow');
      log(`   Got:      ${JSON.stringify(result)}`, 'red');
      failed++;
    }
  });

  // Test array parsing
  log('\n\n📊 Testing Array Parsing:', 'cyan');
  log('═'.repeat(80), 'cyan');

  const mixedProxies = [
    'user1:pass1@proxy1.com:8080',          // Format 1
    'proxy2.com:3128:user2:pass2',           // Format 2
    'proxy3.com:1080',                       // Format 3 (no auth)
    'hostname:8888',                         // Format 3 (valid host:port)
    '192.168.1.1:9050:admin:secret',         // Format 2 with IP
    'invalid',                               // Invalid (will be skipped - no port)
  ];

  log(`\nInput array (${mixedProxies.length} proxies):`, 'blue');
  mixedProxies.forEach((p, i) => log(`  ${i + 1}. ${p}`, 'blue'));

  const parsed = parseProxyArray(mixedProxies);

  log(`\nParsed result (${parsed.length} valid proxies):`, 'green');
  parsed.forEach((p, i) => {
    log(`  ${i + 1}. ${p.host}:${p.port}${p.username ? ` (user: ${p.username})` : ' (no auth)'}`, 'green');
  });

  if (parsed.length === 5) { // Should skip 1 invalid (no port)
    log(`\n✓ Array parsing correct (5 valid, 1 skipped)`, 'green');
    passed++;
  } else {
    log(`\n✗ Array parsing failed (expected 5, got ${parsed.length})`, 'red');
    failed++;
  }

  // Test proxy URL generation
  log('\n\n🔗 Testing Proxy URL Generation:', 'cyan');
  log('═'.repeat(80), 'cyan');

  const testProxy = { host: 'proxy.test.com', port: '8080', username: 'user', password: 'pass' };

  const socks5Url = proxyToUrl(testProxy, 'socks5');
  const httpUrl = proxyToUrl(testProxy, 'http');

  log(`\nProxy object: ${JSON.stringify(testProxy)}`, 'blue');
  log(`SOCKS5 URL: ${socks5Url}`, 'blue');
  log(`HTTP URL:   ${httpUrl}`, 'blue');

  if (socks5Url.includes('socks5://') && socks5Url.includes('user') && socks5Url.includes('proxy.test.com')) {
    log(`✓ SOCKS5 URL generation correct`, 'green');
    passed++;
  } else {
    log(`✗ SOCKS5 URL generation failed`, 'red');
    failed++;
  }

  if (httpUrl.includes('http://') && httpUrl.includes('user') && httpUrl.includes('proxy.test.com')) {
    log(`✓ HTTP URL generation correct`, 'green');
    passed++;
  } else {
    log(`✗ HTTP URL generation failed`, 'red');
    failed++;
  }

  // Test validation
  log('\n\n✅ Testing Proxy Validation:', 'cyan');
  log('═'.repeat(80), 'cyan');

  const validProxy = { host: 'proxy.com', port: '8080', username: 'user', password: 'pass' };
  const invalidProxy1 = { host: 'proxy.com' }; // Missing port
  const invalidProxy2 = { host: 'proxy.com', port: '99999' }; // Invalid port
  const invalidProxy3 = { host: 'proxy.com', port: '8080', username: 'user' }; // Username without password

  log(`\nValid proxy:   ${isValidProxy(validProxy)}`, isValidProxy(validProxy) ? 'green' : 'red');
  log(`Invalid (no port): ${isValidProxy(invalidProxy1)}`, !isValidProxy(invalidProxy1) ? 'green' : 'red');
  log(`Invalid (bad port): ${isValidProxy(invalidProxy2)}`, !isValidProxy(invalidProxy2) ? 'green' : 'red');
  log(`Invalid (incomplete auth): ${isValidProxy(invalidProxy3)}`, !isValidProxy(invalidProxy3) ? 'green' : 'red');

  if (isValidProxy(validProxy) && !isValidProxy(invalidProxy1) && !isValidProxy(invalidProxy2) && !isValidProxy(invalidProxy3)) {
    log(`\n✓ Validation working correctly`, 'green');
    passed++;
  } else {
    log(`\n✗ Validation failed`, 'red');
    failed++;
  }

  // Summary
  log('\n\n' + '═'.repeat(80), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('═'.repeat(80), 'cyan');

  const total = passed + failed;
  const passRate = ((passed / total) * 100).toFixed(1);

  log(`\nTotal Tests:  ${total}`, 'blue');
  log(`Passed:       ${passed}`, 'green');
  log(`Failed:       ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Pass Rate:    ${passRate}%`, passRate == 100 ? 'green' : 'yellow');

  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED!', 'green');
    log('   ✓ Both proxy formats supported (user:pass@host:port and host:port:user:pass)', 'green');
    log('   ✓ Array parsing working', 'green');
    log('   ✓ URL generation working', 'green');
    log('   ✓ Validation working', 'green');
  } else {
    log('\n❌ SOME TESTS FAILED', 'red');
  }

  log('\n' + '═'.repeat(80) + '\n', 'cyan');

  return failed === 0;
}

// Run tests
const success = testProxyFormats();
process.exit(success ? 0 : 1);
