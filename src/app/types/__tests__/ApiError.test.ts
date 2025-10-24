/**
 * Tests for ApiError class and error type guards
 *
 * To run these tests, first install a test framework:
 * npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
 *
 * Or for Jest:
 * npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
 */

import { ApiError, TimeoutError, isApiError, isTimeoutError, isNetworkError } from '../ApiError';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('ApiError');
      expect(error.details).toBeUndefined();
    });

    it('should create an ApiError with details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ApiError(400, 'Validation failed', details);

      expect(error.status).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual(details);
    });

    it('should maintain proper prototype chain', () => {
      const error = new ApiError(500, 'Server error');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ApiError).toBe(true);
      expect(Object.getPrototypeOf(error)).toBe(ApiError.prototype);
    });

    it('should capture stack trace', () => {
      const error = new ApiError(500, 'Server error');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('error type guards', () => {
    describe('isApiError', () => {
      it('should return true for ApiError instances', () => {
        const error = new ApiError(404, 'Not found');
        expect(isApiError(error)).toBe(true);
      });

      it('should return false for regular Error instances', () => {
        const error = new Error('Regular error');
        expect(isApiError(error)).toBe(false);
      });

      it('should return false for TimeoutError instances', () => {
        const error = new TimeoutError();
        expect(isApiError(error)).toBe(false);
      });

      it('should return false for non-error values', () => {
        expect(isApiError(null)).toBe(false);
        expect(isApiError(undefined)).toBe(false);
        expect(isApiError('string')).toBe(false);
        expect(isApiError(123)).toBe(false);
        expect(isApiError({})).toBe(false);
      });
    });

    describe('isTimeoutError', () => {
      it('should return true for TimeoutError instances', () => {
        const error = new TimeoutError();
        expect(isTimeoutError(error)).toBe(true);
      });

      it('should return false for ApiError instances', () => {
        const error = new ApiError(408, 'Timeout');
        expect(isTimeoutError(error)).toBe(false);
      });

      it('should return false for regular Error instances', () => {
        const error = new Error('Regular error');
        expect(isTimeoutError(error)).toBe(false);
      });

      it('should return false for non-error values', () => {
        expect(isTimeoutError(null)).toBe(false);
        expect(isTimeoutError(undefined)).toBe(false);
      });
    });

    describe('isNetworkError', () => {
      it('should return true for network-related errors', () => {
        const networkError1 = new Error('Failed to fetch');
        const networkError2 = new Error('Network request failed');
        const networkError3 = Object.assign(new Error('Connection failed'), { name: 'NetworkError' });

        expect(isNetworkError(networkError1)).toBe(true);
        expect(isNetworkError(networkError2)).toBe(true);
        expect(isNetworkError(networkError3)).toBe(true);
      });

      it('should return false for ApiError instances', () => {
        const error = new ApiError(500, 'Server error');
        expect(isNetworkError(error)).toBe(false);
      });

      it('should return false for TimeoutError instances', () => {
        const error = new TimeoutError();
        expect(isNetworkError(error)).toBe(false);
      });

      it('should return false for regular Error instances', () => {
        const error = new Error('Some other error');
        expect(isNetworkError(error)).toBe(false);
      });

      it('should return false for non-error values', () => {
        expect(isNetworkError(null)).toBe(false);
        expect(isNetworkError(undefined)).toBe(false);
      });
    });
  });
});

describe('TimeoutError', () => {
  describe('constructor', () => {
    it('should create a TimeoutError with default message', () => {
      const error = new TimeoutError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toBe('Request timeout');
      expect(error.name).toBe('TimeoutError');
    });

    it('should create a TimeoutError with custom message', () => {
      const error = new TimeoutError('Custom timeout message');

      expect(error.message).toBe('Custom timeout message');
      expect(error.name).toBe('TimeoutError');
    });

    it('should maintain proper prototype chain', () => {
      const error = new TimeoutError();

      expect(error instanceof Error).toBe(true);
      expect(error instanceof TimeoutError).toBe(true);
      expect(Object.getPrototypeOf(error)).toBe(TimeoutError.prototype);
    });

    it('should capture stack trace', () => {
      const error = new TimeoutError();

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });
});
