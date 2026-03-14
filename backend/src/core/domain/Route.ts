// Core domain entity — no framework dependencies

export type VesselType = 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
export type FuelType = 'HFO' | 'LNG' | 'MGO' | 'VLSFO' | 'Methanol' | 'Ammonia';

export interface Route {
  id: string;
  routeId: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensity: number;       // gCO2e/MJ
  fuelConsumption: number;    // tonnes
  distance: number;            // km
  totalEmissions: number;     // tonnes
  isBaseline: boolean;
  createdAt: Date;
}

export interface CreateRouteInput {
  routeId: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline?: boolean;
}

export interface RouteComparison {
  baseline: Route;
  comparison: Route;
  percentDiff: number;
  compliant: boolean;
}
