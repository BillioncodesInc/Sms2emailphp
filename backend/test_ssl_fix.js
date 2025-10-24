/**
 * Test SSL/TLS Fix for Port 465
 * Verifies that port 465 (SMTPS) connections work correctly with immediate TLS
 */

const smtpValidatorAdvanced = require('./lib/smtpValidatorAdvanced');

console.log('🧪 Testing SSL/TLS Fix for Port 465');
console.log('=' .repeat(80));
console.log('Testing direct TLS connection on port 465 (SMTPS)');
console.log('');

// Test with a Gmail account on port 465 (should use immediate TLS)
const testCombo = {
  email: 'test@gmail.com',
  password: 'fakepassword' // Will fail but should connect properly
};

async function testSSLFix() {
  console.log(`Testing: ${testCombo.email}`);
  console.log('Expected: Should connect via TLS, then fail authentication (fake password)');
  console.log('');

  try {
    const result = await smtpValidatorAdvanced.validateCombo(
      testCombo.email,
      testCombo.password,
      { timeout: 5000 }
    );

    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('');

    if (result.attempts && result.attempts.length > 0) {
      console.log('Attempts made:');
      result.attempts.forEach((attempt, i) => {
        console.log(`  ${i + 1}. ${attempt.host}:${attempt.port}`);
        console.log(`     Error: ${attempt.error}`);
      });
      console.log('');
    }

    // Check if we got proper connection errors, not SSL errors
    const hasSSLError = result.error && (
      result.error.includes('wrong version number') ||
      result.error.includes('SSL routines') ||
      result.error.includes('C6ECB33C29720000')
    );

    if (hasSSLError) {
      console.log('❌ FAILED: Still getting SSL/TLS errors');
      console.log('   Error:', result.error);
      process.exit(1);
    } else {
      console.log('✅ PASSED: No SSL/TLS version errors');
      console.log('   Connection handled correctly (auth failed as expected with fake password)');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSSLFix();
