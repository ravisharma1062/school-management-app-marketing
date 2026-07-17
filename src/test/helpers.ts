import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

/** Builds a realistic AxiosError carrying an HTTP response, as axios would produce for a 4xx/5xx. */
export function axiosErrorWithResponse(status: number, data?: unknown): AxiosError {
  const response = {
    status,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data,
  } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', undefined, undefined, response);
}
