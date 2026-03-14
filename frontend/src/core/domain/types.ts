// Core domain types - mirroring backend entities

export type VesselType = 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
export type FuelType = 'HFO' | 'LNG' | 'MGO' | 'VLSFO' | 'Methanol' | 'Ammonia';

export interface Route {
  id: string;
  routeId: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
  createdAt: string;
}

export interface RouteComparison {
  baseline: Route;
  comparison: Route;
  percentDiff: number;
  compliant: boolean;
}

export interface ComplianceSnapshot {
  shipId: string;
  year: number;
  ghgIntensity: number;
  targetIntensity: number;
  energyInScope: number;
  cb: number;
  isSurplus: boolean;
}

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt: string;
}

export interface BankingResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
  bankEntryId: string;
}

export interface PoolMember {
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface Pool {
  id: string;
  year: number;
  createdAt: string;
  members: PoolMember[];
  poolSum: number;
}

export interface PoolAllocationResult {
  poolId: string;
  year: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
    cbAfter: number;
  }>;
  poolSum: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const FUEL_EU_TARGET_2025 = 89.3368;
export const FUEL_EU_TARGET_2024 = 91.16;
