/**
 * Integration Examples: Typed API Error Handling
 *
 * This file demonstrates how to use the typed error handling system in real scenarios.
 * These are example patterns, not executable tests.
 */

import { apiFetch, isApiError, isTimeoutError, isNetworkError } from '../api';
import { getErrorMessage } from '../../hooks/useApiErrorHandler';

// Example 1: Basic API call with typed error handling
async function basicExample() {
  try {
    const users = await apiFetch({ url: '/api/users' });
    console.log('Users:', users);
  } catch (error) {
    if (isApiError(error)) {
      // TypeScript knows error has status, message, and details
      console.error(`API Error ${error.status}:`, error.message);

      if (error.status === 404) {
        console.log('No users found');
      } else if (error.status === 401) {
        console.log('Redirecting to login...');
      }
    } else if (isTimeoutError(error)) {
      console.error('Request timed out');
    } else if (isNetworkError(error)) {
      console.error('Network connection failed');
    }
  }
}

// Example 2: User-friendly error messages
async function userFriendlyExample() {
  try {
    const data = await apiFetch({
      url: '/api/users',
      method: 'POST',
      body: { email: 'test@example.com' },
    });
    return data;
  } catch (error) {
    const userMessage = getErrorMessage(error);

    if (userMessage) {
      // Display to user
      console.log(`[${userMessage.severity.toUpperCase()}] ${userMessage.title}`);
      console.log(userMessage.message);

      // You could use this with a toast notification:
      // toast[userMessage.severity](userMessage.title, userMessage.message);
    }

    throw error; // Re-throw for further handling
  }
}

// Example 3: Handling specific status codes
async function specificStatusHandling() {
  try {
    const response = await apiFetch({
      url: '/api/protected-resource',
      method: 'GET',
    });
    return response;
  } catch (error) {
    if (isApiError(error)) {
      switch (error.status) {
        case 401:
          // Redirect to login
          console.log('User not authenticated, redirecting...');
          break;

        case 403:
          // Show access denied message
          console.log('Access denied');
          break;

        case 404:
          // Resource not found
          console.log('Resource does not exist');
          break;

        case 429:
          // Rate limit exceeded
          console.log('Too many requests, please slow down');
          break;

        case 500:
        case 502:
        case 503:
          // Server errors - might retry
          console.log('Server error, retrying...');
          break;

        default:
          console.log('Unknown error:', error.message);
      }
    }

    throw error;
  }
}

// Example 4: With timeout
async function timeoutExample() {
  try {
    const data = await apiFetch({
      url: '/api/slow-operation',
      method: 'POST',
      body: { operation: 'generate-report' },
      timeout: 30000, // 30 seconds
    });
    return data;
  } catch (error) {
    if (isTimeoutError(error)) {
      console.log('Operation took too long. Please try again.');
      // Maybe offer to retry with longer timeout
    } else if (isApiError(error)) {
      console.log(`Server responded with error: ${error.message}`);
    }

    throw error;
  }
}

// Example 5: Accessing error details
async function detailedErrorHandling() {
  try {
    const user = await apiFetch({
      url: '/api/users',
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: '123',
      },
    });
    return user;
  } catch (error) {
    if (isApiError(error) && error.status === 422) {
      // TypeScript knows error.details exists
      console.log('Validation failed');

      if (error.details) {
        // Display field-specific errors
        console.log('Validation errors:', error.details);

        // Example: { errors: [{ field: 'email', message: 'Invalid format' }] }
        if (Array.isArray(error.details.errors)) {
          error.details.errors.forEach((err: any) => {
            console.log(`- ${err.field}: ${err.message}`);
          });
        }
      }
    }

    throw error;
  }
}

// Example 6: Batch operations with error accumulation
async function batchOperationsExample(userIds: string[]) {
  const results = [];
  const errors = [];

  for (const userId of userIds) {
    try {
      const user = await apiFetch({ url: `/api/users/${userId}` });
      results.push(user);
    } catch (error) {
      if (isApiError(error)) {
        errors.push({
          userId,
          status: error.status,
          message: error.message,
        });
      } else {
        errors.push({
          userId,
          status: 0,
          message: 'Unknown error',
        });
      }
    }
  }

  return { results, errors };
}

// Example 7: Conditional retry logic
async function retryExample(url: string, maxRetries = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFetch({ url, timeout: 5000 });
    } catch (error) {
      lastError = error;

      if (isApiError(error)) {
        // Don't retry client errors (4xx) except rate limits
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Wait longer between retries
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retry ${attempt}/${maxRetries} in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (isTimeoutError(error) || isNetworkError(error)) {
        // Retry network and timeout errors
        const waitTime = 2000 * attempt;
        console.log(`Network error, retry ${attempt}/${maxRetries} in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Unknown error - don't retry
        throw error;
      }
    }
  }

  throw lastError;
}

// Example 8: Error reporting/logging
async function errorLoggingExample() {
  try {
    return await apiFetch({ url: '/api/data' });
  } catch (error) {
    // Log to error tracking service (e.g., Sentry)
    if (isApiError(error)) {
      // logToSentry({
      //   type: 'ApiError',
      //   status: error.status,
      //   message: error.message,
      //   details: error.details,
      //   url: '/api/data',
      // });
    } else if (isTimeoutError(error)) {
      // logToSentry({ type: 'TimeoutError', message: error.message });
    } else if (isNetworkError(error)) {
      // logToSentry({ type: 'NetworkError', message: error.message });
    }

    throw error;
  }
}

export {
  basicExample,
  userFriendlyExample,
  specificStatusHandling,
  timeoutExample,
  detailedErrorHandling,
  batchOperationsExample,
  retryExample,
  errorLoggingExample,
};
