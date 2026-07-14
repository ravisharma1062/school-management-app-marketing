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
