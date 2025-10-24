/**
 * Test Optimized SMTP Validator
 * Tests a few combos from mix.txt to verify timeout optimizations work
 */

const ComboProcessor = require('./lib/comboProcessor');

// Sample combos from mix.txt (first few that Python script validated successfully)
const testCombos = [
  { email: 'example1@outlook.com', password: 'testpass123' },
  { email: 'example2@yahoo.com', password: 'testpass456' },
  { email: 'example3@gmail.com', password: 'testpass789' }
];

console.log('🧪 Testing Optimized SMTP Validator with timeout improvements');
console.log('=' .repeat(80));
console.log(`Testing ${testCombos.length} sample combos`);
console.log('Timeout settings:');
console.log('  - CONNECTION_TIMEOUT: 3s (was 10s)');
console.log('  - SOCKET_TIMEOUT: 5s (was 15s)');
console.log('  - DNS_TIMEOUT: 2s (new)');
console.log('  - SMTP_RESPONSE_TIMEOUT: 3s (was 10s)');
console.log('=' .repeat(80));
console.log('');

async function testOptimizedValidator() {
  const processor = new ComboProcessor({
    threads: 3,
    timeout: 3000, // Match new CONNECTION_TIMEOUT
    useAdvancedValidator: true // Use raw socket validator with optimizations
  });

  let testsPassed = 0;
  let testsFailed = 0;

  // Track timing
  const startTime = Date.now();

  // Listen for events
  processor.on('phase', (data) => {
    console.log(`  📍 [${data.email}] ${data.phase}: ${JSON.stringify(data)}`);
  });

  processor.on('valid', (result) => {
    testsPassed++;
    console.log('');
    console.log(`✅ VALID: ${result.email}`);
    console.log(`   SMTP: ${result.smtp}:${result.port}`);
    console.log(`   Connection Time: ${result.connectionTime}ms`);
    console.log(`   Used Neighbor: ${result.usedNeighbor}`);
    console.log(`   Attempts: ${result.attempts ? result.attempts.length : 0}`);
    console.log('');
  });

  processor.on('invalid', (result) => {
    testsFailed++;
    console.log('');
    console.log(`❌ INVALID: ${result.email}`);
    console.log(`   Error: ${result.error}`);
    console.log(`   Connection Time: ${result.connectionTime}ms`);
    if (result.attempts && result.attempts.length > 0) {
      console.log(`   Attempts: ${result.attempts.length}`);
      result.attempts.forEach((attempt, i) => {
        console.log(`     ${i+1}. ${attempt.server}:${attempt.port} - ${attempt.error || 'OK'}`);
      });
    }
    console.log('');
  });

  // Process batch
  try {
    const finalStats = await processor.processBatch(testCombos);
    const duration = Date.now() - startTime;

    console.log('');
    console.log('=' .repeat(80));
    console.log('📊 TEST RESULTS');
    console.log('=' .repeat(80));
    console.log(`Total: ${finalStats.total}`);
    console.log(`Processed: ${finalStats.processed}`);
    console.log(`Valid: ${finalStats.valid} (${testsPassed})`);
    console.log(`Invalid: ${finalStats.invalid} (${testsFailed})`);
    console.log(`Success Rate: ${finalStats.successRate}%`);
    console.log(`Duration: ${duration}ms (${(duration/1000).toFixed(2)}s)`);
    console.log(`Avg per combo: ${(duration/testCombos.length).toFixed(0)}ms`);
    console.log('');
    console.log('🎯 Comparison to Python:');
    console.log(`   Python avg: ~5.3μs/combo (very fast, compiled C)`);
    console.log(`   Our avg: ${(duration/testCombos.length).toFixed(0)}ms/combo`);
    console.log('   Note: Python timing is loop overhead only, not actual validation time');
    console.log('=' .repeat(80));

    // Check if optimizations helped
    const avgTime = duration / testCombos.length;
    if (avgTime < 5000) {
      console.log('✅ Timeout optimizations working - fast failure on invalid combos');
    } else {
      console.log('⚠️  Still slow - may need more optimization');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

// Run test with timeout protection
const TEST_TIMEOUT = 30000; // 30s max
const timeoutHandle = setTimeout(() => {
  console.error('');
  console.error('❌ TEST TIMED OUT after 30s');
  console.error('   This suggests DNS or connection timeouts are still too long');
  process.exit(1);
}, TEST_TIMEOUT);

testOptimizedValidator().finally(() => {
  clearTimeout(timeoutHandle);
});
