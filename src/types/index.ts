export type PlanCode = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface PublicSignupRequest {
  schoolName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  desiredPlan: PlanCode;
  wantsEmail: boolean;
  wantsSms: boolean;
  captchaToken: string;
}

/** MT-6b — no plan picker: every self-service trial starts on the BASIC plan. */
export interface PublicTrialSignupRequest {
  schoolName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  wantsEmail: boolean;
  wantsSms: boolean;
  captchaToken: string;
}

export interface ProvisionResultDto {
  schoolId: string;
  schoolSlug: string;
  adminEmail: string;
}
