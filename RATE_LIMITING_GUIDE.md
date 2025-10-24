# API Rate Limiting Implementation Guide

## Overview

This guide documents the client-side API rate limiting implementation that throttles API calls to prevent accidental backend overuse. The system uses a queue-based approach to buffer excess requests and executes them as capacity becomes available.

## Architecture

### Core Components

1. **RateLimiter Class** (`src/app/utils/rateLimiter.ts`)
   - Manages request throttling with configurable max requests per second
   - Implements sliding window algorithm to track request timestamps
   - Maintains a queue for requests that exceed the rate limit
   - Emits warnings when queue capacity thresholds are reached

2. **Rate-Limited apiFetch** (`src/app/utils/api.ts`)
   - Wraps the original `apiFetch` function with rate limiting
   - All API calls automatically go through the rate limiter
   - Transparent to consumers - no API changes required

## Configuration

### Environment Variables

Set the rate limit via environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_RATE_LIMIT=10
```

- **Default**: 10 requests per second
- **Range**: Any positive integer
- **When to adjust**:
  - Decrease if backend is overloaded
  - Increase if you have higher capacity needs

### Programmatic Configuration

Use the `useRateLimiterConfig` hook to adjust settings at runtime:

```typescript
import { useRateLimiterConfig } from '@/app/utils/api';

function MyComponent() {
  const {
    getConfig,
    setMaxRequestsPerSecond,
    setQueueWarningThreshold,
    getQueueLength
  } = useRateLimiterConfig();

  // Get current configuration
  const config = getConfig();
  console.log(config.maxRequestsPerSecond); // 10
  console.log(config.queueWarningThreshold); // 20

  // Update rate limit
  setMaxRequestsPerSecond(15);

  // Update warning threshold
  setQueueWarningThreshold(30);

  // Check queue length
  const queueLength = getQueueLength();
  console.log(`${queueLength} requests queued`);
}
```

## How It Works

### Sliding Window Algorithm

The rate limiter uses a sliding window approach:

1. Each request records its timestamp
2. Before allowing a new request, timestamps older than 1 second are discarded
3. If remaining timestamps < max rate limit, request proceeds immediately
4. Otherwise, request is queued and scheduled when capacity becomes available

### Queue Processing

When requests exceed the rate limit:

1. Excess requests are added to a FIFO queue
2. A background processor calculates delay time until next slot is available
3. Requests are executed as capacity becomes available
4. Queue warnings are emitted when length exceeds threshold (default: 20)

### Example Flow

```
Time: 0ms    - Request 1-10 arrive (limit: 10/s)
Time: 0ms    - Requests 1-10 execute immediately
Time: 50ms   - Request 11 arrives
Time: 50ms   - Request 11 queued (over limit)
Time: 1000ms - Request 11 executes (window reset)
```

## Usage Examples

### Basic Usage (No Changes Required)

The rate limiter is automatically applied to all API calls:

```typescript
import { apiFetch } from '@/app/utils/api';

// This is automatically rate-limited
const data = await apiFetch<Character>({
  url: '/api/characters/123',
  method: 'GET'
});
```

### React Query Hooks

All React Query hooks automatically use rate-limited requests:

```typescript
import { useApiGet } from '@/app/utils/api';

function CharactersList() {
  // Automatically rate-limited
  const { data, error, isLoading } = useApiGet<Character[]>('/api/characters');

  // ... render logic
}
```

### Monitoring Queue Length

Monitor the queue to detect potential issues:

```typescript
import { rateLimiter } from '@/app/utils/api';

function ApiMonitor() {
  const queueLength = rateLimiter.getQueueLength();

  if (queueLength > 15) {
    console.warn(`High queue length: ${queueLength} requests pending`);
  }

  return <div>Queue: {queueLength} requests</div>;
}
```

### Dynamic Rate Adjustment

Adjust rate limits based on server feedback:

```typescript
import { useRateLimiterConfig } from '@/app/utils/api';

function AdaptiveRateLimiter() {
  const { setMaxRequestsPerSecond } = useRateLimiterConfig();

  useEffect(() => {
    // Listen for rate limit headers or errors
    const handleRateLimit = (event: CustomEvent) => {
      if (event.detail.status === 429) {
        // Reduce rate limit if we hit 429 Too Many Requests
        setMaxRequestsPerSecond(5);
      }
    };

    window.addEventListener('api-rate-limit', handleRateLimit);
    return () => window.removeEventListener('api-rate-limit', handleRateLimit);
  }, [setMaxRequestsPerSecond]);
}
```

## Testing

### Running Tests

```bash
npm test src/app/utils/__tests__/rateLimiter.test.ts
```

### Manual Testing

Test rapid successive calls to verify queuing behavior:

```typescript
// In browser console or test file
import { apiFetch } from '@/app/utils/api';

async function testRateLimiting() {
  console.log('Firing 50 rapid requests...');

  const promises = Array(50).fill(null).map((_, i) =>
    apiFetch({ url: `/api/test?req=${i}` })
  );

  const results = await Promise.all(promises);
  console.log(`Completed ${results.length} requests`);
}

testRateLimiting();
```

Watch the console for queue warnings:
```
[RateLimiter] Queue length has reached 20 pending requests.
Consider reducing API call frequency or increasing rate limit.
```

## Performance Considerations

### Memory Usage

- Each queued request consumes minimal memory (~100 bytes)
- Timestamps array is automatically cleaned up (sliding window)
- No memory leaks - queue is processed and cleared

### Latency Impact

- Requests within rate limit: **No added latency**
- Queued requests: Delayed until capacity available
- Average delay per queued request: `1000ms / maxRequestsPerSecond`

### Optimization Tips

1. **Batch requests when possible** - Reduce total API calls
2. **Implement request deduplication** - Avoid duplicate in-flight requests
3. **Use React Query caching** - Minimize unnecessary requests
4. **Increase rate limit** - If backend can handle more load

## Troubleshooting

### High Queue Warnings

**Symptom**: Console shows frequent queue warnings

**Causes**:
- Too many API calls being made concurrently
- Rate limit too low for application needs
- Network slow, requests taking longer than expected

**Solutions**:
```typescript
// Option 1: Increase rate limit
setMaxRequestsPerSecond(20);

// Option 2: Increase warning threshold (if warnings are noise)
setQueueWarningThreshold(50);

// Option 3: Reduce API call frequency in application code
```

### Slow Response Times

**Symptom**: API calls taking longer than expected

**Diagnosis**:
```typescript
const queueLength = rateLimiter.getQueueLength();
console.log(`Queue length: ${queueLength}`);
```

**Solutions**:
- Increase rate limit if backend can handle it
- Review code for unnecessary API calls
- Implement better caching strategies

### Rate Limit Errors (429)

**Symptom**: Backend returning 429 Too Many Requests

**Solution**: The client-side rate limiter is not synchronized with backend. Reduce client limit:

```typescript
setMaxRequestsPerSecond(5); // Reduce from default 10
```

## API Reference

### RateLimiter Class

```typescript
class RateLimiter {
  constructor(maxRequestsPerSecond: number, queueWarningThreshold: number)

  // Execute a request with rate limiting
  execute<T>(requestFn: () => Promise<T>): Promise<T>

  // Get current queue length
  getQueueLength(): number

  // Update configuration
  setMaxRequestsPerSecond(max: number): void
  setQueueWarningThreshold(threshold: number): void

  // Get current configuration
  getConfig(): { maxRequestsPerSecond: number, queueWarningThreshold: number }
}
```

### useRateLimiterConfig Hook

```typescript
function useRateLimiterConfig(): {
  getConfig: () => { maxRequestsPerSecond: number, queueWarningThreshold: number }
  setMaxRequestsPerSecond: (max: number) => void
  setQueueWarningThreshold: (threshold: number) => void
  getQueueLength: () => number
}
```

## Migration Notes

### Existing Code

No changes required! All existing `apiFetch` calls are automatically rate-limited.

```typescript
// Before: No rate limiting
const data = await apiFetch({ url: '/api/data' });

// After: Automatically rate-limited (no code change)
const data = await apiFetch({ url: '/api/data' });
```

### Custom Fetch Implementations

If you have custom fetch wrappers that bypass `apiFetch`, consider updating them:

```typescript
// Before: Direct fetch (not rate-limited)
const response = await fetch('/api/data');

// After: Use apiFetch (rate-limited)
const data = await apiFetch({ url: '/api/data' });
```

## Future Enhancements

Potential improvements to consider:

1. **Per-endpoint rate limiting** - Different limits for different endpoints
2. **Token bucket algorithm** - Allow bursts while maintaining average rate
3. **Backend synchronization** - Coordinate with backend rate limit headers
4. **Metrics dashboard** - Visual monitoring of request patterns
5. **Request prioritization** - Queue critical requests first

## Support

For issues or questions:
- Review this guide
- Check console warnings for diagnostics
- Test with `rateLimiter.getQueueLength()`
- Adjust configuration as needed

## References

- Implementation: `src/app/utils/rateLimiter.ts`
- API integration: `src/app/utils/api.ts`
- Tests: `src/app/utils/__tests__/rateLimiter.test.ts`
