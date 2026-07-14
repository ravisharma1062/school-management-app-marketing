import { api } from './client';
import type { ProvisionResultDto, PublicSignupRequest, PublicTrialSignupRequest } from '@/types';

export const signupApi = {
  submit(request: PublicSignupRequest) {
    return api.post<void>('/signup-requests', request);
  },
};

export const trialSignupApi = {
  submit(request: PublicTrialSignupRequest) {
    return api.post<ProvisionResultDto>('/trial-signups', request);
  },
};
