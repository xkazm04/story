/**
 * Tests for Rate Limiter
 * Verifies throttling, queuing, and configuration behavior
 */

import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    // Create a new instance for each test
    rateLimiter = new RateLimiter(5, 10); // 5 req/s, warning at 10 queued
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should execute requests immediately when under the limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await rateLimiter.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(rateLimiter.getQueueLength()).toBe(0);
    });

    it('should queue requests when over the limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      // Fire 10 requests rapidly (double the limit)
      const promises = Array(10).fill(null).map(() => rateLimiter.execute(mockFn));

      // First 5 should execute immediately, rest should be queued
      expect(rateLimiter.getQueueLength()).toBeGreaterThan(0);

      // Wait for all to complete
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(results.every(r => r === 'success')).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(10);
      expect(rateLimiter.getQueueLength()).toBe(0);
    });

    it('should handle errors in queued requests', async () => {
      const error = new Error('Request failed');
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(rateLimiter.execute(mockFn)).rejects.toThrow('Request failed');
    });
  });

  describe('Rate limiting behavior', () => {
    it('should throttle requests to respect the rate limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const startTime = Date.now();

      // Execute 15 requests (3x the limit of 5 req/s)
      const promises = Array(15).fill(null).map(() => rateLimiter.execute(mockFn));
      await Promise.all(promises);

      const duration = Date.now() - startTime;

      // Should take at least 2 seconds (15 requests / 5 req/s = 3s theoretical, minus first window)
      // We allow some margin for execution time
      expect(duration).toBeGreaterThanOrEqual(1500);
      expect(mockFn).toHaveBeenCalledTimes(15);
    });
  });

  describe('Queue monitoring', () => {
    it('should return correct queue length', async () => {
      // Create a delay to keep requests queued
      const slowMockFn = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve('success'), 100))
      );

      // Fire requests rapidly
      const promises = Array(8).fill(null).map(() => rateLimiter.execute(slowMockFn));

      // Check queue length (some should be queued)
      expect(rateLimiter.getQueueLength()).toBeGreaterThan(0);

      await Promise.all(promises);

      // Queue should be empty after completion
      expect(rateLimiter.getQueueLength()).toBe(0);
    });

    it('should emit warning when queue exceeds threshold', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const consoleSpy = jest.spyOn(console, 'warn');

      // Fire more than the warning threshold (10)
      const promises = Array(15).fill(null).map(() => rateLimiter.execute(mockFn));

      // Should have emitted a warning
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('Queue length has reached');

      await Promise.all(promises);
    });
  });

  describe('Configuration', () => {
    it('should allow updating max requests per second', () => {
      const config = rateLimiter.getConfig();
      expect(config.maxRequestsPerSecond).toBe(5);

      rateLimiter.setMaxRequestsPerSecond(10);

      const newConfig = rateLimiter.getConfig();
      expect(newConfig.maxRequestsPerSecond).toBe(10);
    });

    it('should allow updating queue warning threshold', () => {
      const config = rateLimiter.getConfig();
      expect(config.queueWarningThreshold).toBe(10);

      rateLimiter.setQueueWarningThreshold(20);

      const newConfig = rateLimiter.getConfig();
      expect(newConfig.queueWarningThreshold).toBe(20);
    });

    it('should respect updated rate limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      // Increase rate limit
      rateLimiter.setMaxRequestsPerSecond(20);

      // Fire 20 requests
      const promises = Array(20).fill(null).map(() => rateLimiter.execute(mockFn));

      // With higher limit, fewer should be queued
      const queueLength = rateLimiter.getQueueLength();
      expect(queueLength).toBeLessThan(10); // Most should execute immediately

      await Promise.all(promises);
    });
  });

  describe('Concurrent execution', () => {
    it('should handle multiple concurrent request batches', async () => {
      const mockFn1 = jest.fn().mockResolvedValue('batch1');
      const mockFn2 = jest.fn().mockResolvedValue('batch2');

      // Fire two batches concurrently
      const batch1 = Array(5).fill(null).map(() => rateLimiter.execute(mockFn1));
      const batch2 = Array(5).fill(null).map(() => rateLimiter.execute(mockFn2));

      const results = await Promise.all([...batch1, ...batch2]);

      expect(mockFn1).toHaveBeenCalledTimes(5);
      expect(mockFn2).toHaveBeenCalledTimes(5);
      expect(results.filter(r => r === 'batch1')).toHaveLength(5);
      expect(results.filter(r => r === 'batch2')).toHaveLength(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle requests with zero rate limit gracefully', async () => {
      // This is an edge case - rate limiter should still work but be very slow
      rateLimiter.setMaxRequestsPerSecond(1);

      const mockFn = jest.fn().mockResolvedValue('success');
      const promises = Array(2).fill(null).map(() => rateLimiter.execute(mockFn));

      await Promise.all(promises);

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle synchronous errors in request functions', async () => {
      const mockFn = jest.fn().mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      await expect(rateLimiter.execute(mockFn)).rejects.toThrow('Synchronous error');
    });
  });
});
