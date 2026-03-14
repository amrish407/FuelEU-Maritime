// Compliance Balance domain entity

export interface ShipCompliance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number;       // Compliance Balance in gCO2e
  createdAt: Date;
}

export interface ComplianceSnapshot {
  shipId: string;
  year: number;
  ghgIntensity: number;
  targetIntensity: number;
  energyInScope: number;      // MJ
  cb: number;                  // Compliance Balance gCO2e
  isSurplus: boolean;
}

// FuelEU Maritime Annex IV constants
export const FUEL_EU_CONSTANTS = {
  TARGET_INTENSITY_2025: 89.3368,   // gCO2e/MJ — 2% below 91.16
  TARGET_INTENSITY_2024: 91.16,     // gCO2e/MJ baseline
  ENERGY_DENSITY_MJ_PER_TONNE: 41000,  // MJ/t for typical marine fuels
} as const;

export function computeEnergyInScope(fuelConsumptionTonnes: number): number {
  return fuelConsumptionTonnes * FUEL_EU_CONSTANTS.ENERGY_DENSITY_MJ_PER_TONNE;
}

export function computeComplianceBalance(
  targetIntensity: number,
  actualIntensity: number,
  energyInScope: number
): number {
  return (targetIntensity - actualIntensity) * energyInScope;
}

export function getTargetIntensity(year: number): number {
  // FuelEU step-down schedule per Annex IV
  if (year <= 2024) return FUEL_EU_CONSTANTS.TARGET_INTENSITY_2024;
  if (year <= 2029) return FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025;
  return FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025; // simplified for scope
}
