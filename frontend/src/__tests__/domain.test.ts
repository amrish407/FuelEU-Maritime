import { describe, it, expect } from 'vitest';
import { FUEL_EU_TARGET_2025, FUEL_EU_TARGET_2024 } from '../core/domain/types';

describe('FuelEU Domain Constants', () => {
  it('2025 target is 2% below 2024 baseline', () => {
    const diff = (FUEL_EU_TARGET_2024 - FUEL_EU_TARGET_2025) / FUEL_EU_TARGET_2024;
    expect(diff * 100).toBeCloseTo(2, 1);
  });

  it('2025 target is 89.3368', () => {
    expect(FUEL_EU_TARGET_2025).toBe(89.3368);
  });
});

describe('Compliance Calculation Logic', () => {
  function computePercentDiff(comparison: number, baseline: number): number {
    return ((comparison / baseline) - 1) * 100;
  }

  it('LNG route R002 (88.0) has negative diff vs R001 baseline (91.0) — better', () => {
    const diff = computePercentDiff(88.0, 91.0);
    expect(diff).toBeLessThan(0);
  });

  it('MGO route R003 (93.5) has positive diff vs R001 baseline (91.0) — worse', () => {
    const diff = computePercentDiff(93.5, 91.0);
    expect(diff).toBeGreaterThan(0);
  });

  it('same intensity gives 0% diff', () => {
    expect(computePercentDiff(91.0, 91.0)).toBe(0);
  });

  it('formula matches spec: ((c/b) - 1) * 100', () => {
    const result = computePercentDiff(90.5, 91.0);
    expect(result).toBeCloseTo(((90.5 / 91.0) - 1) * 100, 5);
  });
});

describe('Compliance Status', () => {
  function isCompliant(ghgIntensity: number): boolean {
    return ghgIntensity <= FUEL_EU_TARGET_2025;
  }

  it('R002 LNG 88.0 is compliant', () => {
    expect(isCompliant(88.0)).toBe(true);
  });

  it('R003 MGO 93.5 is NOT compliant', () => {
    expect(isCompliant(93.5)).toBe(false);
  });

  it('R004 HFO 89.2 is compliant (below 89.3368)', () => {
    expect(isCompliant(89.2)).toBe(true);
  });

  it('exactly at target 89.3368 is compliant', () => {
    expect(isCompliant(89.3368)).toBe(true);
  });
});
