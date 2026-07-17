import { describe, expect, it } from 'vitest';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { api, extractErrorMessage, isDuplicateSignupError, isRateLimitError } from './client';

function axiosErrorWithResponse(status: number, data?: unknown): AxiosError {
  const response = {
    status,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data,
  } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', undefined, undefined, response);
}

describe('api instance', () => {
  it('targets the public API namespace', () => {
    expect(api.defaults.baseURL).toMatch(/\/api\/v1\/public$/);
  });

  it('sends JSON', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('extractErrorMessage', () => {
  it('prefers the backend "message" field', () => {
    const err = axiosErrorWithResponse(400, { message: 'School name is required', error: 'Bad Request' });
    expect(extractErrorMessage(err)).toBe('School name is required');
  });

  it('falls back to the backend "error" field when message is absent', () => {
    const err = axiosErrorWithResponse(500, { error: 'Internal Server Error' });
    expect(extractErrorMessage(err)).toBe('Internal Server Error');
  });

  it('falls back to the axios error message when the body has neither field', () => {
    const err = axiosErrorWithResponse(502, {});
    expect(extractErrorMessage(err)).toBe('Request failed with status code 502');
  });

  it('uses a network error message when there is no response at all', () => {
    const err = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(extractErrorMessage(err)).toBe('Network Error');
  });

  it('returns the message of a plain Error', () => {
    expect(extractErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns the default fallback for non-error values', () => {
    expect(extractErrorMessage('nope')).toBe('Something went wrong');
    expect(extractErrorMessage(undefined)).toBe('Something went wrong');
  });

  it('returns a custom fallback for non-error values', () => {
    expect(extractErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});

describe('isDuplicateSignupError', () => {
  it('is true for an axios 409', () => {
    expect(isDuplicateSignupError(axiosErrorWithResponse(409, { message: 'duplicate' }))).toBe(true);
  });

  it('is false for other statuses', () => {
    expect(isDuplicateSignupError(axiosErrorWithResponse(400))).toBe(false);
    expect(isDuplicateSignupError(axiosErrorWithResponse(429))).toBe(false);
  });

  it('is false for non-axios errors', () => {
    expect(isDuplicateSignupError(new Error('409'))).toBe(false);
    expect(isDuplicateSignupError(undefined)).toBe(false);
  });
});

describe('isRateLimitError', () => {
  it('is true for an axios 429', () => {
    expect(isRateLimitError(axiosErrorWithResponse(429))).toBe(true);
  });

  it('is false for other statuses and non-axios errors', () => {
    expect(isRateLimitError(axiosErrorWithResponse(409))).toBe(false);
    expect(isRateLimitError(new Error('429'))).toBe(false);
  });
});
