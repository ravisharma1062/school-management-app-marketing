import { api } from './client';
import type { PublicSignupRequest } from '@/types';

export const signupApi = {
  submit(request: PublicSignupRequest) {
    return api.post<void>('/signup-requests', request);
  },
};
