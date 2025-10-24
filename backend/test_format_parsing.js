/**
 * Test Format Parsing for Contact Extractor and Inbox Searcher
 * Verifies that all tools accept the combo validator output format
 */

const imapHandler = require('./lib/imapHandler');

console.log('🧪 Testing Format Parsing Compatibility');
console.log('=' .repeat(80));
console.log('');

// Test cases with different formats
const testCases = [
  {
    name: 'Combo Validator Output Format',
    input: 'smtp.ntlworld.com|587|p.conlon@ntlworld.com|Kayleigh16#',
    expected: {
      smtp: 'smtp.ntlworld.com',
      port: 587,
      email: 'p.conlon@ntlworld.com',
      password: 'Kayleigh16#',
      username: 'p.conlon@ntlworld.com',
      domain: 'ntlworld.com'
    }
  },
  {
    name: 'Legacy Format (password|email)',
    input: 'password123|user@gmail.com',
    expected: {
      password: 'password123',
      email: 'user@gmail.com',
      username: 'user@gmail.com',
      domain: 'gmail.com'
    }
  },
  {
    name: 'Common Format (email:password)',
    input: 'user@yahoo.com:mypassword',
    expected: {
      email: 'user@yahoo.com',
      password: 'mypassword',
      username: 'user@yahoo.com',
      domain: 'yahoo.com'
    }
  },
  {
    name: 'Gmail with SSL port',
    input: 'smtp.gmail.com|465|test@gmail.com|testpass123',
    expected: {
      smtp: 'smtp.gmail.com',
      port: 465,
      email: 'test@gmail.com',
      password: 'testpass123',
      username: 'test@gmail.com',
      domain: 'gmail.com'
    }
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input: "${testCase.input}"`);

  try {
    const result = imapHandler.parseComboResult(testCase.input);

    // Check all expected fields
    let testPassed = true;
    const errors = [];

    for (const [key, expectedValue] of Object.entries(testCase.expected)) {
      if (result[key] !== expectedValue) {
        testPassed = false;
        errors.push(`${key}: expected "${expectedValue}", got "${result[key]}"`);
      }
    }

    if (testPassed) {
      console.log('  ✅ PASS');
      passed++;
    } else {
      console.log('  ❌ FAIL');
      errors.forEach(err => console.log(`    - ${err}`));
      failed++;
    }

    // Show parsed result
    console.log('  Parsed:', JSON.stringify(result, null, 2).split('\n').join('\n  '));

  } catch (error) {
    console.log('  ❌ FAIL');
    console.log(`    Error: ${error.message}`);
    failed++;
  }

  console.log('');
});

// Test invalid formats
console.log('Testing Invalid Formats:');
console.log('');

const invalidCases = [
  'invalid',
  'only-one-part',
  'three|parts|only',
  ''
];

invalidCases.forEach((invalidInput, index) => {
  console.log(`Invalid Test ${index + 1}: "${invalidInput}"`);

  try {
    imapHandler.parseComboResult(invalidInput);
    console.log('  ❌ FAIL - Should have thrown error');
    failed++;
  } catch (error) {
    console.log('  ✅ PASS - Correctly rejected with:', error.message);
    passed++;
  }

  console.log('');
});

// Summary
console.log('=' .repeat(80));
console.log('📊 TEST SUMMARY');
console.log('=' .repeat(80));
console.log(`Total Tests: ${passed + failed}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log('');

if (failed === 0) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('');
  console.log('Format compatibility verified:');
  console.log('  ✅ Contact Extractor can use combo validator output');
  console.log('  ✅ Inbox Searcher can use combo validator output');
  console.log('  ✅ All formats (smtp|port|email|pass, password|email, email:password) supported');
  console.log('');
  console.log('Workflow:');
  console.log('  1. Run Combo Validator → Get smtp.server.com|587|email|password');
  console.log('  2. Copy valid results to Contact Extractor or Inbox Searcher');
  console.log('  3. Both tools will parse and use the credentials correctly');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('Please fix the parsing logic before using the tools together');
  process.exit(1);
}
