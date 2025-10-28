/**
 * Tests for API utility functions
 *
 * To run these tests, first install a test framework:
 * npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
 *
 * Or for Jest:
 * npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
 */

import { apiFetch, ApiError, TimeoutError, isApiError, isTimeoutError } from '../api';

// Mock fetch globally
const originalFetch = global.fetch;

describe('apiFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('successful requests', () => {
    it('should successfully fetch data on 200 response', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await apiFetch({ url: '/api/test' });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
        signal: expect.any(AbortSignal),
      });
    });

    it('should send POST request with body', async () => {
      const mockData = { id: 1 };
      const requestBody = { name: 'New Item' };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await apiFetch({
        url: '/api/items',
        method: 'POST',
        body: requestBody,
      });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: expect.any(AbortSignal),
      });
    });

    it('should include custom headers', async () => {
      const mockData = { success: true };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      await apiFetch({
        url: '/api/test',
        headers: { Authorization: 'Bearer token123' },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        body: undefined,
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('HTTP error responses', () => {
    it('should throw ApiError on 404 response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ message: 'Resource not found' }),
        } as Response)
      );

      await expect(apiFetch({ url: '/api/missing' })).rejects.toThrow(ApiError);

      try {
        await apiFetch({ url: '/api/missing' });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Resource not found');
        }
      }
    });

    it('should throw ApiError on 400 response with validation details', async () => {
      const errorDetails = {
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email format' }],
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve(errorDetails),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/users', method: 'POST', body: {} });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(400);
          expect(error.message).toBe('Validation failed');
          expect(error.details).toEqual(errorDetails);
        }
      }
    });

    it('should throw ApiError on 401 response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({ message: 'Not authenticated' }),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/protected' });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(401);
          expect(error.message).toBe('Not authenticated');
        }
      }
    });

    it('should throw ApiError on 403 response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: () => Promise.resolve({ message: 'Access denied' }),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/admin' });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(403);
          expect(error.message).toBe('Access denied');
        }
      }
    });

    it('should throw ApiError on 429 response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: () => Promise.resolve({ message: 'Rate limit exceeded' }),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/data' });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(429);
          expect(error.message).toBe('Rate limit exceeded');
        }
      }
    });

    it('should throw ApiError on 500 response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ error: 'Server crashed' }),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/data' });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(500);
          expect(error.message).toBe('Server crashed');
        }
      }
    });

    it('should throw ApiError on 503 response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          json: () => Promise.resolve({ message: 'Service is down' }),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/data' });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(503);
          expect(error.message).toBe('Service is down');
        }
      }
    });

    it('should use statusText when error body is not JSON', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.reject(new Error('Invalid JSON')),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/data' });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(500);
          expect(error.message).toBe('Internal Server Error');
          expect(error.details).toBeUndefined();
        }
      }
    });
  });

  describe('timeout handling', () => {
    it('should throw TimeoutError when request times out', async () => {
      jest.useFakeTimers();

      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({ data: 'test' }),
              } as Response);
            }, 10000);
          })
      );

      const fetchPromise = apiFetch({ url: '/api/slow', timeout: 1000 });

      jest.advanceTimersByTime(1000);

      await expect(fetchPromise).rejects.toThrow(TimeoutError);

      try {
        await fetchPromise;
      } catch (error) {
        expect(isTimeoutError(error)).toBe(true);
        if (isTimeoutError(error)) {
          expect(error.message).toContain('1000ms');
        }
      }

      jest.useRealTimers();
    });

    it('should not timeout when request completes in time', async () => {
      jest.useFakeTimers();

      const mockData = { id: 1 };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const fetchPromise = apiFetch({ url: '/api/fast', timeout: 5000 });

      jest.advanceTimersByTime(100);

      const result = await fetchPromise;
      expect(result).toEqual(mockData);

      jest.useRealTimers();
    });
  });

  describe('network error handling', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Failed to fetch');
      global.fetch = jest.fn(() => Promise.reject(networkError));

      await expect(apiFetch({ url: '/api/test' })).rejects.toThrow('Failed to fetch');
    });

    it('should preserve error details through the error chain', async () => {
      const errorDetails = { field: 'email', issue: 'duplicate' };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          json: () => Promise.resolve({ message: 'Email already exists', ...errorDetails }),
        } as Response)
      );

      try {
        await apiFetch({ url: '/api/users', method: 'POST', body: { email: 'test@example.com' } });
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(409);
          expect(error.message).toBe('Email already exists');
          expect(error.details).toBeDefined();
          expect(error.details?.field).toBe('email');
        }
      }
    });
  });

  describe('external AbortSignal handling', () => {
    it('should respect external AbortSignal when aborted before request starts', async () => {
      const controller = new AbortController();
      controller.abort();

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        } as Response)
      );

      await expect(apiFetch({ url: '/api/test', signal: controller.signal })).rejects.toThrow();
    });

    it('should abort request when external signal is aborted during fetch', async () => {
      const controller = new AbortController();
      let fetchResolve: any;

      global.fetch = jest.fn((url, options) => {
        // Simulate external signal aborting during fetch
        setTimeout(() => controller.abort(), 10);

        return new Promise((resolve) => {
          fetchResolve = resolve;
          // Listen for abort on the signal passed to fetch
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              resolve({
                ok: false,
                status: 0,
              } as Response);
            });
          }
        });
      });

      await expect(apiFetch({ url: '/api/test', signal: controller.signal })).rejects.toThrow();
    });

    it('should work with external signal and timeout together', async () => {
      jest.useFakeTimers();
      const controller = new AbortController();

      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({ data: 'test' }),
              } as Response);
            }, 10000);
          })
      );

      const fetchPromise = apiFetch({
        url: '/api/slow',
        timeout: 1000,
        signal: controller.signal
      });

      jest.advanceTimersByTime(1000);

      await expect(fetchPromise).rejects.toThrow(TimeoutError);

      jest.useRealTimers();
    });

    it('should prioritize external abort over timeout', async () => {
      jest.useFakeTimers();
      const controller = new AbortController();

      global.fetch = jest.fn((url, options) => {
        return new Promise((resolve, reject) => {
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ data: 'test' }),
            } as Response);
          }, 10000);
        });
      });

      const fetchPromise = apiFetch({
        url: '/api/test',
        timeout: 5000,
        signal: controller.signal
      });

      // Abort externally before timeout
      jest.advanceTimersByTime(100);
      controller.abort();
      jest.advanceTimersByTime(100);

      await expect(fetchPromise).rejects.toThrow();

      jest.useRealTimers();
    });

    it('should successfully complete request when external signal is not aborted', async () => {
      const controller = new AbortController();
      const mockData = { id: 1, name: 'Test' };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await apiFetch({ url: '/api/test', signal: controller.signal });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
        signal: expect.any(AbortSignal),
      });
    });

    it('should handle external signal abort during response parsing', async () => {
      const controller = new AbortController();

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => {
            // Abort during JSON parsing
            controller.abort();
            return new Promise((resolve) => {
              setTimeout(() => resolve({ data: 'test' }), 100);
            });
          },
        } as Response)
      );

      // The request should not throw immediately since abort happens during parsing
      // This tests that cleanup happens properly even if abort occurs late
      const result = await apiFetch({ url: '/api/test', signal: controller.signal });
      expect(result).toEqual({ data: 'test' });
    });
  });
});
