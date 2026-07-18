import axios, { type AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1/public`,
  headers: { 'Content-Type': 'application/json' },
});

/** Normalizes an axios error into a user-facing message from the backend ErrorResponse. */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

/**
 * Specifically an email already having an account/pending request — not just any 409. The
 * backend's generic DataIntegrityViolationException handler also returns 409 for unrelated
 * conflicts (e.g. a school-name/slug collision), so status alone can't distinguish them; only
 * the real email-duplicate paths set this code.
 */
export function isDuplicateSignupError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) return false;
  const data = error.response.data as { code?: string } | undefined;
  return data?.code === 'DUPLICATE_SIGNUP_EMAIL';
}

export function isRateLimitError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 429;
}
