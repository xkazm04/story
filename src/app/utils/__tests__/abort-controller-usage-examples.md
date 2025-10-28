# AbortController Usage Examples

This document provides examples of how to use the AbortController feature in the apiFetch utility to cancel in-flight requests.

## Overview

The `apiFetch` utility now supports request cancellation through the `signal` parameter, which accepts an `AbortSignal`. This feature:

- Prevents race conditions when components unmount
- Reduces memory usage by canceling unnecessary requests
- Eliminates "state update on unmounted component" warnings
- Ensures only the latest request's response is processed

## Automatic Cancellation with React Query

When using `useApiGet`, request cancellation is automatic. React Query provides an AbortSignal that is automatically passed to `apiFetch`:

```typescript
import { useApiGet } from '../utils/api';

function UserProfile({ userId }: { userId: string }) {
  // Request is automatically cancelled when:
  // 1. Component unmounts
  // 2. userId changes (new query supersedes old one)
  // 3. Query is disabled
  const { data, error, isLoading } = useApiGet(`/api/users/${userId}`);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data.name}</div>;
}
```

## Manual Cancellation with AbortController

For custom fetch operations, you can manually control cancellation:

```typescript
import { apiFetch } from '../utils/api';

function SearchComponent() {
  const [controller, setController] = useState<AbortController | null>(null);

  const handleSearch = async (query: string) => {
    // Cancel previous request if still running
    if (controller) {
      controller.abort();
    }

    // Create new controller for this request
    const newController = new AbortController();
    setController(newController);

    try {
      const results = await apiFetch({
        url: `/api/search?q=${query}`,
        signal: newController.signal
      });

      // Process results...
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled - this is expected
        console.log('Search cancelled');
      } else {
        // Handle other errors
        console.error('Search error:', error);
      }
    }
  };

  useEffect(() => {
    // Cleanup: cancel any pending request when component unmounts
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);

  return (
    <input onChange={(e) => handleSearch(e.target.value)} />
  );
}
```

## Combining Timeout and Cancellation

You can use both timeout and external cancellation together:

```typescript
const controller = new AbortController();

// Request will be cancelled by whichever happens first:
// 1. External abort (controller.abort())
// 2. 5 second timeout
const data = await apiFetch({
  url: '/api/slow-endpoint',
  timeout: 5000,
  signal: controller.signal
});

// Cancel manually if needed
controller.abort();
```

## Usage in Custom Hooks

Create reusable hooks with built-in cancellation:

```typescript
function useDebounceSearch(query: string, delay: number = 300) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const data = await apiFetch({
          url: `/api/search?q=${query}`,
          signal: controller.signal
        });

        setResults(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }, delay);

    // Cleanup: clear timeout and abort request
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, delay]);

  return { results, isLoading };
}
```

## Race Condition Prevention

Without cancellation, race conditions can occur:

```typescript
// BAD: Race condition possible
async function loadUserData(userId: string) {
  // If userId changes quickly, older responses might arrive after newer ones
  const data = await apiFetch({ url: `/api/users/${userId}` });
  setUserData(data); // Might set stale data!
}

// GOOD: Race condition prevented
async function loadUserData(userId: string, signal: AbortSignal) {
  const data = await apiFetch({
    url: `/api/users/${userId}`,
    signal
  });
  // If signal was aborted, request throws and we never set stale data
  setUserData(data);
}
```

## Best Practices

1. **Always use AbortController for user-initiated actions**: Search inputs, autocomplete, filtering, etc.

2. **Let React Query handle cancellation automatically**: Use `useApiGet` for standard queries.

3. **Clean up in useEffect**: Always return a cleanup function that aborts pending requests.

4. **Don't swallow AbortErrors**: Let them propagate naturally or handle them specifically.

5. **Create one controller per request**: Don't reuse AbortControllers across multiple requests.

## Error Handling

When a request is aborted, the fetch API throws an `AbortError`:

```typescript
try {
  const data = await apiFetch({ url: '/api/data', signal });
} catch (error) {
  if (error.name === 'AbortError') {
    // Request was cancelled - usually not an error condition
    console.log('Request cancelled');
  } else if (isApiError(error)) {
    // HTTP error (4xx, 5xx)
    console.error('API error:', error.status, error.message);
  } else if (isTimeoutError(error)) {
    // Request timed out
    console.error('Request timeout');
  } else {
    // Network or other error
    console.error('Request failed:', error);
  }
}
```

## Memory Leak Prevention

The implementation properly cleans up event listeners:

- Uses `{ once: true }` flag when adding abort listeners
- Clears timeout timers with `clearTimeout()`
- AbortController signals are automatically cleaned up by the browser
- React Query automatically aborts queries on unmount

This ensures no memory leaks from lingering event listeners or incomplete network requests.
