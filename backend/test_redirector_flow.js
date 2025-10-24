#!/usr/bin/env node

/**
 * Test redirector validation flow
 * Tests: Process -> Validate -> Save -> Download
 */

const axios = require('axios');

const API_BASE = 'http://localhost:9090/api/enhanced/redirector';

// Test data - simple redirect URL that should work
const testData = {
  rawText: `https://example.com/redirect?url=http://google.com
https://test.com/go?target=http://google.com`,
  targetLink: 'https://google.com'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRedirectorFlow() {
  console.log('🧪 Testing Redirector Validation Flow\n');
  console.log('=' .repeat(80));

  try {
    // Step 1: Start processing
    console.log('\n📝 Step 1: Starting redirector processing...');
    const processResponse = await axios.post(`${API_BASE}/process/stream`, {
      rawText: testData.rawText,
      targetLink: testData.targetLink,
      testUrls: true
    });

    if (!processResponse.data.success) {
      console.error('❌ Failed to start processing:', processResponse.data.error);
      process.exit(1);
    }

    const sessionId = processResponse.data.sessionId;
    console.log(`✅ Session created: ${sessionId}`);
    console.log(`   Message: ${processResponse.data.message}`);

    // Step 2: Wait for processing to complete
    console.log('\n⏳ Step 2: Waiting for processing to complete...');
    let completed = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!completed && attempts < maxAttempts) {
      await sleep(1000);
      attempts++;

      const statusResponse = await axios.get(`${API_BASE}/process/stream/${sessionId}`);

      if (statusResponse.data.success) {
        const session = statusResponse.data.session;
        console.log(`   Progress: ${session.processed}/${session.total} - Valid: ${session.valid}, Invalid: ${session.invalid}`);

        if (session.status === 'completed') {
          completed = true;
          console.log(`✅ Processing completed in ${Math.round(session.duration / 1000)}s`);
        } else if (session.status === 'failed') {
          console.error('❌ Processing failed');
          process.exit(1);
        }
      }
    }

    if (!completed) {
      console.error('❌ Processing timeout');
      process.exit(1);
    }

    // Step 3: Get results
    console.log('\n📊 Step 3: Fetching validation results...');
    const resultsResponse = await axios.get(`${API_BASE}/process/stream/${sessionId}/results`);

    if (resultsResponse.data.success) {
      const results = resultsResponse.data.results;
      console.log(`✅ Retrieved ${results.length} validation results`);

      results.forEach((result, i) => {
        const status = result.valid ? '✓ VALID' : '✗ INVALID';
        console.log(`   ${i + 1}. ${status} - ${result.url}`);
        if (result.finalUrl) {
          console.log(`      → Redirects to: ${result.finalUrl}`);
        }
        if (result.error) {
          console.log(`      ⚠ Error: ${result.error}`);
        }
      });
    }

    // Step 4: Save list
    console.log('\n💾 Step 4: Saving validated redirectors...');
    const listName = `test-list-${Date.now()}`;

    const saveResponse = await axios.post(`${API_BASE}/lists`, {
      name: listName,
      sessionId: sessionId,
      saveOnlyValid: true
    });

    if (saveResponse.data.success) {
      const list = saveResponse.data.list;
      console.log(`✅ List saved: ${listName}`);
      console.log(`   Redirectors saved: ${list.redirectors.length}`);
      console.log(`   Stats:`, list.stats);
    } else {
      console.error('❌ Failed to save:', saveResponse.data.error);
      process.exit(1);
    }

    // Step 5: Verify list exists
    console.log('\n🔍 Step 5: Verifying list in storage...');
    const listsResponse = await axios.get(`${API_BASE}/lists`);

    if (listsResponse.data.success) {
      const lists = listsResponse.data.lists;
      const savedList = lists.find(l => l.name === listName);

      if (savedList) {
        console.log(`✅ List found in storage`);
        console.log(`   Name: ${savedList.name}`);
        console.log(`   Count: ${savedList.count} redirectors`);
        console.log(`   Target: ${savedList.targetLink}`);
      } else {
        console.error('❌ List not found in storage');
        process.exit(1);
      }
    }

    // Step 6: Test download
    console.log('\n📥 Step 6: Testing download...');
    const downloadResponse = await axios.get(`${API_BASE}/lists/${listName}/download`);

    if (downloadResponse.status === 200) {
      const content = downloadResponse.data;
      const lines = content.trim().split('\n');
      console.log(`✅ Download successful`);
      console.log(`   Downloaded ${lines.length} redirectors`);
      console.log(`   First redirector: ${lines[0]}`);
    } else {
      console.error('❌ Download failed');
      process.exit(1);
    }

    // Step 7: Cleanup
    console.log('\n🧹 Step 7: Cleaning up test data...');
    const deleteResponse = await axios.delete(`${API_BASE}/lists/${listName}`);

    if (deleteResponse.data.success) {
      console.log(`✅ Test list deleted`);
    }

    console.log('\n' + '=' .repeat(80));
    console.log('✅ ALL TESTS PASSED!');
    console.log('=' .repeat(80));
    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testRedirectorFlow();
