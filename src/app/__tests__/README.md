# API Error Handling Tests

This directory contains comprehensive tests for the typed API error handling system.

## Test Files

- `types/__tests__/ApiError.test.ts` - Tests for ApiError class and type guards
- `utils/__tests__/api.test.ts` - Tests for apiFetch and React Query hooks
- `hooks/__tests__/useApiErrorHandler.test.ts` - Tests for the error handler hook

## Running Tests

### Setting Up Testing Framework

First, install a testing framework. Choose one:

#### Option 1: Vitest (Recommended for Vite/Next.js)

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### Option 2: Jest

```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Running the Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch  # Jest
npm test       # Vitest (runs in watch mode by default)

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- ApiError.test.ts
```

## Test Coverage

The test suite covers:

### 1. ApiError Class Tests (`ApiError.test.ts`)
- ✅ Constructor creates proper ApiError instances
- ✅ Status codes are correctly assigned
- ✅ Error messages are preserved
- ✅ Details object is properly stored
- ✅ Prototype chain is maintained for instanceof checks
- ✅ Stack traces are captured

### 2. Type Guards Tests (`ApiError.test.ts`)
- ✅ `isApiError()` correctly identifies ApiError instances
- ✅ `isTimeoutError()` correctly identifies TimeoutError instances
- ✅ `isNetworkError()` correctly identifies network errors
- ✅ Type guards return false for other error types
- ✅ Type guards handle non-error values safely

### 3. API Fetch Tests (`api.test.ts`)
- ✅ Successful GET/POST/PUT/DELETE requests
- ✅ Request body serialization
- ✅ Custom headers handling
- ✅ HTTP error responses (400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504)
- ✅ Error response body parsing
- ✅ Fallback to statusText when response is not JSON
- ✅ Timeout handling with AbortController
- ✅ Network error propagation
- ✅ Error details preservation through error chain

### 4. Error Handler Hook Tests (`useApiErrorHandler.test.ts`)
- ✅ All HTTP status codes map to user-friendly messages
- ✅ TimeoutError produces appropriate user message
- ✅ Network errors produce appropriate user message
- ✅ Generic Error instances are handled
- ✅ Unknown error types are handled gracefully
- ✅ Hook returns null for no error
- ✅ Memoization works correctly
- ✅ `getErrorMessage` utility function works outside React

## Example Usage in Components

### Basic Usage

```tsx
import { useApiGet } from '@/app/utils/api';
import { useApiErrorHandler } from '@/app/hooks/useApiErrorHandler';

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useApiGet(`/api/users/${userId}`);
  const errorMessage = useApiErrorHandler(error);

  if (isLoading) return <div>Loading...</div>;

  if (errorMessage) {
    return (
      <div className={`alert alert-${errorMessage.severity}`}>
        <h3>{errorMessage.title}</h3>
        <p>{errorMessage.message}</p>
      </div>
    );
  }

  return <div>{/* Render user data */}</div>;
}
```

### With Mutations

```tsx
import { useApiMutation } from '@/app/utils/api';
import { useApiErrorHandler } from '@/app/hooks/useApiErrorHandler';

function CreateUserForm() {
  const mutation = useApiMutation(
    (data) => apiFetch({
      url: '/api/users',
      method: 'POST',
      body: data
    })
  );

  const errorMessage = useApiErrorHandler(mutation.error);

  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <div className={`alert alert-${errorMessage.severity}`}>
          {errorMessage.message}
        </div>
      )}
      {/* Form fields */}
    </form>
  );
}
```

### Outside React Components

```typescript
import { apiFetch, isApiError } from '@/app/utils/api';
import { getErrorMessage } from '@/app/hooks/useApiErrorHandler';

async function fetchData() {
  try {
    const data = await apiFetch({ url: '/api/data' });
    return data;
  } catch (error) {
    const userMessage = getErrorMessage(error);
    console.error(userMessage?.title, userMessage?.message);

    if (isApiError(error) && error.status === 401) {
      // Handle unauthorized specifically
      redirectToLogin();
    }

    throw error;
  }
}
```

## Extending the Tests

When adding new error handling features:

1. Add tests to the appropriate test file
2. Test both success and failure scenarios
3. Verify error details are preserved
4. Test type guards work correctly
5. Ensure user messages are clear and helpful

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```
