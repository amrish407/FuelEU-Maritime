import { Route, CreateRouteInput, RouteComparison } from '../domain/Route';
import { IRouteRepository } from '../ports/IRouteRepository';

export class RouteUseCases {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async getAllRoutes(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    return this.routeRepo.findAll(filters);
  }

  async setBaseline(routeId: string): Promise<Route> {
    const route = await this.routeRepo.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route not found: ${routeId}`);
    }
    return this.routeRepo.setBaseline(routeId);
  }

  async getComparison(): Promise<RouteComparison[]> {
    return this.routeRepo.getComparison();
  }

  async createRoute(input: CreateRouteInput): Promise<Route> {
    return this.routeRepo.create(input);
  }
}
