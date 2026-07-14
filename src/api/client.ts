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

export function isDuplicateSignupError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

export function isRateLimitError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 429;
}
