import { describe, expect, it } from 'vitest';
import { PLANS } from './plans';

describe('PLANS data (mirrors backend PlanDefaults — keep in sync)', () => {
  it('contains exactly the three plan tiers in ascending price order', () => {
    expect(PLANS).toHaveLength(3);
    expect(PLANS.map((p) => p.code)).toEqual(['BASIC', 'STANDARD', 'PREMIUM']);
    const prices = PLANS.map((p) => p.priceInr);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('every plan has the expected shape', () => {
    for (const plan of PLANS) {
      expect(plan.code).toMatch(/^(BASIC|STANDARD|PREMIUM)$/);
      expect(plan.name.length).toBeGreaterThan(0);
      expect(plan.priceInr).toBeGreaterThan(0);
      expect(Number.isInteger(plan.priceInr)).toBe(true);
      expect(plan.studentLimit.length).toBeGreaterThan(0);
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
      for (const feature of plan.features) {
        expect(feature.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('has unique codes and names', () => {
    expect(new Set(PLANS.map((p) => p.code)).size).toBe(PLANS.length);
    expect(new Set(PLANS.map((p) => p.name)).size).toBe(PLANS.length);
  });

  it('highlights exactly one plan (the "Most popular" badge)', () => {
    expect(PLANS.filter((p) => p.highlighted)).toHaveLength(1);
    expect(PLANS.find((p) => p.highlighted)?.code).toBe('STANDARD');
  });

  it('matches the backend-seeded pricing', () => {
    expect(PLANS.find((p) => p.code === 'BASIC')?.priceInr).toBe(999);
    expect(PLANS.find((p) => p.code === 'STANDARD')?.priceInr).toBe(2499);
    expect(PLANS.find((p) => p.code === 'PREMIUM')?.priceInr).toBe(4999);
  });
});
