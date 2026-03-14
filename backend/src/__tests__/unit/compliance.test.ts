import {
  computeEnergyInScope,
  computeComplianceBalance,
  getTargetIntensity,
  FUEL_EU_CONSTANTS,
} from '../../core/domain/Compliance';

describe('Compliance Domain - computeEnergyInScope', () => {
  it('calculates energy correctly for 5000t fuel', () => {
    expect(computeEnergyInScope(5000)).toBe(5000 * 41000);
  });

  it('returns 0 for 0 fuel consumption', () => {
    expect(computeEnergyInScope(0)).toBe(0);
  });
});

describe('Compliance Domain - computeComplianceBalance', () => {
  it('returns positive CB (surplus) when actual < target', () => {
    const cb = computeComplianceBalance(89.3368, 88.0, 41000 * 4800);
    expect(cb).toBeGreaterThan(0);
  });

  it('returns negative CB (deficit) when actual > target', () => {
    const cb = computeComplianceBalance(89.3368, 91.0, 41000 * 5000);
    expect(cb).toBeLessThan(0);
  });

  it('returns 0 CB when actual equals target', () => {
    const energyInScope = 41000 * 5000;
    const cb = computeComplianceBalance(89.3368, 89.3368, energyInScope);
    expect(cb).toBe(0);
  });

  it('computes CB for R002 (LNG 2024): 88.0 vs target 91.16', () => {
    // R002: BulkCarrier LNG 2024, fuelConsumption=4800t
    const target = FUEL_EU_CONSTANTS.TARGET_INTENSITY_2024;
    const energy = computeEnergyInScope(4800);
    const cb = computeComplianceBalance(target, 88.0, energy);
    expect(cb).toBeCloseTo((91.16 - 88.0) * 4800 * 41000, 0);
    expect(cb).toBeGreaterThan(0);
  });

  it('computes CB for R001 (HFO 2024): 91.0 vs target 91.16', () => {
    const target = FUEL_EU_CONSTANTS.TARGET_INTENSITY_2024;
    const energy = computeEnergyInScope(5000);
    const cb = computeComplianceBalance(target, 91.0, energy);
    expect(cb).toBeCloseTo((91.16 - 91.0) * 5000 * 41000, 0);
    expect(cb).toBeGreaterThan(0);
  });
});

describe('Compliance Domain - getTargetIntensity', () => {
  it('returns 91.16 for year 2024', () => {
    expect(getTargetIntensity(2024)).toBe(FUEL_EU_CONSTANTS.TARGET_INTENSITY_2024);
  });

  it('returns 89.3368 for year 2025', () => {
    expect(getTargetIntensity(2025)).toBe(FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025);
  });

  it('returns 89.3368 for year 2028', () => {
    expect(getTargetIntensity(2028)).toBe(FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025);
  });
});
