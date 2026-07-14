import type { PlanCode } from '@/types';

/** Mirrors the backend's seeded SubscriptionPlan rows (V18 migration) and PlanDefaults.java — keep in sync. */
export interface PlanInfo {
  code: PlanCode;
  name: string;
  priceInr: number;
  studentLimit: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    code: 'BASIC',
    name: 'Basic',
    priceInr: 999,
    studentLimit: 'Up to 150 students',
    features: ['Email notifications', 'Library management'],
  },
  {
    code: 'STANDARD',
    name: 'Standard',
    priceInr: 2499,
    studentLimit: 'Up to 500 students',
    features: [
      'Everything in Basic',
      'SMS notifications',
      'Online fee payments',
      'Parent–teacher messaging',
      'Analytics dashboard',
    ],
    highlighted: true,
  },
  {
    code: 'PREMIUM',
    name: 'Premium',
    priceInr: 4999,
    studentLimit: 'Unlimited students',
    features: ['Everything in Standard', 'Bus transport tracking'],
  },
];
