/**
 * Demo script to test rate limiting behavior
 * Run with: npx ts-node src/app/utils/__tests__/rateLimiter-demo.ts
 * Or import and call testRateLimiting() from browser console
 */

import { RateLimiter } from '../rateLimiter';

// Mock API fetch function that simulates a request
const mockApiFetch = async (id: number): Promise<string> => {
  console.log(`[${new Date().toISOString()}] Request ${id} executing...`);
  // Simulate API response time
  await new Promise(resolve => setTimeout(resolve, 50));
  return `Response ${id}`;
};

/**
 * Test 1: Burst requests under rate limit
 */
export async function testBurstUnderLimit() {
  console.log('\n=== Test 1: Burst requests under rate limit ===');
  const limiter = new RateLimiter(10, 20); // 10 req/s

  console.log('Firing 5 rapid requests (under 10 req/s limit)...');
  const startTime = Date.now();

  const promises = Array(5).fill(null).map((_, i) =>
    limiter.execute(() => mockApiFetch(i))
  );

  console.log(`Queue length after burst: ${limiter.getQueueLength()}`);

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;

  console.log(`✓ Completed ${results.length} requests in ${duration}ms`);
  console.log(`  Average: ${(duration / results.length).toFixed(1)}ms per request`);
  console.log(`  Queue length: ${limiter.getQueueLength()}`);
}

/**
 * Test 2: Burst requests over rate limit
 */
export async function testBurstOverLimit() {
  console.log('\n=== Test 2: Burst requests over rate limit ===');
  const limiter = new RateLimiter(5, 20); // 5 req/s

  console.log('Firing 20 rapid requests (4x the 5 req/s limit)...');
  const startTime = Date.now();

  const promises = Array(20).fill(null).map((_, i) =>
    limiter.execute(() => mockApiFetch(i))
  );

  console.log(`Queue length after burst: ${limiter.getQueueLength()}`);

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;

  console.log(`✓ Completed ${results.length} requests in ${duration}ms`);
  console.log(`  Average: ${(duration / results.length).toFixed(1)}ms per request`);
  console.log(`  Expected ~3-4 seconds for 20 requests at 5 req/s`);
  console.log(`  Queue length: ${limiter.getQueueLength()}`);
}

/**
 * Test 3: Queue warning threshold
 */
export async function testQueueWarning() {
  console.log('\n=== Test 3: Queue warning threshold ===');
  const limiter = new RateLimiter(2, 5); // 2 req/s, warn at 5 queued

  console.log('Firing 10 requests to trigger queue warning...');

  // Capture console.warn
  const originalWarn = console.warn;
  let warningCaught = false;
  console.warn = (...args: unknown[]) => {
    if (args[0]?.toString().includes('Queue length has reached')) {
      warningCaught = true;
      console.log('⚠️  Queue warning triggered!');
    }
    originalWarn(...args);
  };

  const promises = Array(10).fill(null).map((_, i) =>
    limiter.execute(() => mockApiFetch(i))
  );

  console.log(`Queue length: ${limiter.getQueueLength()}`);

  await Promise.all(promises);
  console.warn = originalWarn;

  console.log(`✓ Warning ${warningCaught ? 'was' : 'was not'} triggered`);
}

/**
 * Test 4: Dynamic configuration
 */
export async function testDynamicConfig() {
  console.log('\n=== Test 4: Dynamic configuration ===');
  const limiter = new RateLimiter(5, 20);

  console.log('Initial config:', limiter.getConfig());

  // Test batch with initial rate
  console.log('\nTesting with 5 req/s...');
  const startTime1 = Date.now();
  const promises1 = Array(10).fill(null).map((_, i) =>
    limiter.execute(() => mockApiFetch(i))
  );
  await Promise.all(promises1);
  const duration1 = Date.now() - startTime1;
  console.log(`  Completed in ${duration1}ms`);

  // Update rate limit
  console.log('\nUpdating rate limit to 20 req/s...');
  limiter.setMaxRequestsPerSecond(20);
  console.log('New config:', limiter.getConfig());

  // Test batch with new rate
  console.log('\nTesting with 20 req/s...');
  const startTime2 = Date.now();
  const promises2 = Array(10).fill(null).map((_, i) =>
    limiter.execute(() => mockApiFetch(i + 10))
  );
  await Promise.all(promises2);
  const duration2 = Date.now() - startTime2;
  console.log(`  Completed in ${duration2}ms`);

  console.log(`✓ Higher rate limit resulted in ${((duration1 - duration2) / duration1 * 100).toFixed(1)}% faster execution`);
}

/**
 * Test 5: Error handling
 */
export async function testErrorHandling() {
  console.log('\n=== Test 5: Error handling ===');
  const limiter = new RateLimiter(10, 20);

  const mockFailingFetch = async (id: number): Promise<string> => {
    console.log(`[${new Date().toISOString()}] Request ${id} executing...`);
    if (id % 3 === 0) {
      throw new Error(`Request ${id} failed`);
    }
    return `Response ${id}`;
  };

  console.log('Firing 10 requests where some will fail...');
  const promises = Array(10).fill(null).map((_, i) =>
    limiter.execute(() => mockFailingFetch(i))
      .then(result => ({ success: true, result }))
      .catch(error => ({ success: false, error: (error as Error).message }))
  );

  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✓ Completed: ${successful} successful, ${failed} failed`);
  console.log('  Failed requests were properly handled without blocking queue');
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('\n🚀 Rate Limiter Demo - Running all tests...\n');

  await testBurstUnderLimit();
  await testBurstOverLimit();
  await testQueueWarning();
  await testDynamicConfig();
  await testErrorHandling();

  console.log('\n✅ All tests completed!\n');
}

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().catch(console.error);
}
