import { Route, CreateRouteInput, RouteComparison } from '../domain/Route';

export interface IRouteRepository {
  findAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;

  findById(id: string): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;

  create(input: CreateRouteInput): Promise<Route>;
  setBaseline(routeId: string): Promise<Route>;

  getComparison(): Promise<RouteComparison[]>;
}
