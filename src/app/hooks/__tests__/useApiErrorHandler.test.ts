/**
 * Tests for useApiErrorHandler hook
 *
 * To run these tests, first install a test framework:
 * npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
 *
 * Or for Jest:
 * npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
 */

import { renderHook } from '@testing-library/react';
import { useApiErrorHandler, getErrorMessage } from '../useApiErrorHandler';
import { ApiError, TimeoutError } from '../../types/ApiError';

describe('useApiErrorHandler', () => {
  describe('ApiError handling', () => {
    it('should return null for no error', () => {
      const { result } = renderHook(() => useApiErrorHandler(null));
      expect(result.current).toBeNull();
    });

    it('should return null for undefined error', () => {
      const { result } = renderHook(() => useApiErrorHandler(undefined));
      expect(result.current).toBeNull();
    });

    it('should map 400 Bad Request error', () => {
      const error = new ApiError(400, 'Invalid input');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Invalid Request',
        message: 'Invalid input',
        severity: 'warning',
      });
    });

    it('should map 401 Unauthorized error', () => {
      const error = new ApiError(401, 'Not authenticated');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Authentication Required',
        message: 'You need to be logged in to perform this action. Please sign in and try again.',
        severity: 'warning',
      });
    });

    it('should map 403 Forbidden error', () => {
      const error = new ApiError(403, 'Access denied');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Access Denied',
        message: 'Access denied',
        severity: 'error',
      });
    });

    it('should map 404 Not Found error', () => {
      const error = new ApiError(404, 'Resource not found');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Not Found',
        message: 'Resource not found',
        severity: 'info',
      });
    });

    it('should map 409 Conflict error', () => {
      const error = new ApiError(409, 'Email already exists');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Conflict',
        message: 'Email already exists',
        severity: 'warning',
      });
    });

    it('should map 422 Validation error', () => {
      const error = new ApiError(422, 'Invalid data format');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Validation Error',
        message: 'Invalid data format',
        severity: 'warning',
      });
    });

    it('should map 429 Rate Limit error', () => {
      const error = new ApiError(429, 'Rate limit exceeded');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Too Many Requests',
        message: "You're making requests too quickly. Please wait a moment and try again.",
        severity: 'warning',
      });
    });

    it('should map 500 Internal Server Error', () => {
      const error = new ApiError(500, 'Server crashed');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Server Error',
        message: "Something went wrong on our end. Please try again in a few moments.",
        severity: 'error',
      });
    });

    it('should map 502 Bad Gateway error', () => {
      const error = new ApiError(502, 'Bad gateway');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Bad Gateway',
        message: 'The server is temporarily unavailable. Please try again in a few moments.',
        severity: 'error',
      });
    });

    it('should map 503 Service Unavailable error', () => {
      const error = new ApiError(503, 'Service down');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        severity: 'error',
      });
    });

    it('should map 504 Gateway Timeout error', () => {
      const error = new ApiError(504, 'Gateway timeout');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Gateway Timeout',
        message: 'The server took too long to respond. Please try again.',
        severity: 'error',
      });
    });

    it('should handle unknown 4xx errors', () => {
      const error = new ApiError(418, "I'm a teapot");
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Request Error',
        message: "I'm a teapot",
        severity: 'warning',
      });
    });

    it('should handle unknown 5xx errors', () => {
      const error = new ApiError(599, 'Unknown server error');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        severity: 'error',
      });
    });

    it('should use fallback message when ApiError has no message', () => {
      const error = new ApiError(404, '');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current?.message).toBe('The requested resource could not be found.');
    });
  });

  describe('TimeoutError handling', () => {
    it('should map TimeoutError appropriately', () => {
      const error = new TimeoutError('Request timeout after 5000ms');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please check your connection and try again.',
        severity: 'warning',
      });
    });
  });

  describe('Network error handling', () => {
    it('should map network error (Failed to fetch)', () => {
      const error = new Error('Failed to fetch');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        severity: 'error',
      });
    });

    it('should map network error with Network keyword', () => {
      const error = new Error('Network request failed');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        severity: 'error',
      });
    });
  });

  describe('Generic error handling', () => {
    it('should handle generic Error instances', () => {
      const error = new Error('Something went wrong');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Unexpected Error',
        message: 'Something went wrong',
        severity: 'error',
      });
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current?.title).toBe('Unexpected Error');
      expect(result.current?.message).toBe('Something went wrong. Please try again.');
    });
  });

  describe('Unknown error handling', () => {
    it('should handle string errors', () => {
      const error = 'String error';
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Unknown Error',
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error',
      });
    });

    it('should handle object errors', () => {
      const error = { message: 'Object error' };
      const { result } = renderHook(() => useApiErrorHandler(error));

      expect(result.current).toEqual({
        title: 'Unknown Error',
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error',
      });
    });
  });

  describe('memoization', () => {
    it('should return same reference when error does not change', () => {
      const error = new ApiError(404, 'Not found');
      const { result, rerender } = renderHook(
        ({ err }: { err: ApiError }) => useApiErrorHandler(err),
        { initialProps: { err: error } }
      );

      const firstResult = result.current;
      rerender({ err: error });
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should return new reference when error changes', () => {
      const error1 = new ApiError(404, 'Not found');
      const error2 = new ApiError(500, 'Server error');

      const { result, rerender } = renderHook(
        ({ err }: { err: ApiError }) => useApiErrorHandler(err),
        { initialProps: { err: error1 } }
      );

      const firstResult = result.current;
      rerender({ err: error2 });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(firstResult?.title).toBe('Not Found');
      expect(secondResult?.title).toBe('Server Error');
    });
  });
});

describe('getErrorMessage', () => {
  it('should work the same as the hook for ApiError', () => {
    const error = new ApiError(404, 'Not found');
    const result = getErrorMessage(error);

    expect(result).toEqual({
      title: 'Not Found',
      message: 'Not found',
      severity: 'info',
    });
  });

  it('should work the same as the hook for TimeoutError', () => {
    const error = new TimeoutError();
    const result = getErrorMessage(error);

    expect(result).toEqual({
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please check your connection and try again.',
      severity: 'warning',
    });
  });

  it('should work the same as the hook for network errors', () => {
    const error = new Error('Failed to fetch');
    const result = getErrorMessage(error);

    expect(result).toEqual({
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      severity: 'error',
    });
  });

  it('should return null for no error', () => {
    const result = getErrorMessage(null);
    expect(result).toBeNull();
  });

  it('can be used outside React components', () => {
    // This test verifies that getErrorMessage doesn't require React context
    const error = new ApiError(500, 'Server error');
    const result = getErrorMessage(error);

    expect(result).toBeDefined();
    expect(result?.title).toBe('Server Error');
  });
});
