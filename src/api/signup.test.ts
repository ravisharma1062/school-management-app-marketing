import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';
import { signupApi, trialSignupApi } from './signup';
import type { PublicSignupRequest, PublicTrialSignupRequest } from '@/types';

vi.mock('./client', () => ({
  api: { post: vi.fn() },
}));

const mockedPost = vi.mocked(api.post);

beforeEach(() => {
  mockedPost.mockReset();
  mockedPost.mockResolvedValue({ data: undefined });
});

describe('signupApi.submit', () => {
  it('POSTs the full request to /signup-requests', async () => {
    const request: PublicSignupRequest = {
      schoolName: 'Sunrise Public School',
      contactName: 'Priya Sharma',
      contactEmail: 'priya@sunrise.example',
      contactPhone: '+91 98765 43210',
      desiredPlan: 'STANDARD',
      wantsEmail: true,
      wantsSms: false,
      captchaToken: 'tok-123',
    };

    await signupApi.submit(request);

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith('/signup-requests', request);
  });

  it('propagates rejections from the http layer', async () => {
    const failure = new Error('network down');
    mockedPost.mockRejectedValueOnce(failure);

    await expect(
      signupApi.submit({
        schoolName: 's',
        contactName: 'c',
        contactEmail: 'e@example.com',
        contactPhone: '',
        desiredPlan: 'BASIC',
        wantsEmail: true,
        wantsSms: false,
        captchaToken: 't',
      }),
    ).rejects.toBe(failure);
  });
});

describe('trialSignupApi.submit', () => {
  it('POSTs the full request to /trial-signups', async () => {
    const request: PublicTrialSignupRequest = {
      schoolName: 'Sunrise Public School',
      contactName: 'Priya Sharma',
      contactEmail: 'priya@sunrise.example',
      contactPhone: '',
      wantsEmail: true,
      wantsSms: true,
      captchaToken: 'tok-456',
    };

    await trialSignupApi.submit(request);

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith('/trial-signups', request);
  });

  it('returns the provisioning result from the backend', async () => {
    const provisionResult = { schoolId: 'id-1', schoolSlug: 'sunrise', adminEmail: 'priya@sunrise.example' };
    mockedPost.mockResolvedValueOnce({ data: provisionResult });

    const response = await trialSignupApi.submit({
      schoolName: 's',
      contactName: 'c',
      contactEmail: 'e@example.com',
      contactPhone: '',
      wantsEmail: true,
      wantsSms: false,
      captchaToken: 't',
    });

    expect(response.data).toEqual(provisionResult);
  });
});
