import { RouteUseCases } from '../../core/application/RouteUseCases';
import { IRouteRepository } from '../../core/ports/IRouteRepository';
import { Route } from '../../core/domain/Route';

const mockRoute: Route = {
  id: '1',
  routeId: 'R001',
  vesselType: 'Container',
  fuelType: 'HFO',
  year: 2024,
  ghgIntensity: 91.0,
  fuelConsumption: 5000,
  distance: 12000,
  totalEmissions: 4500,
  isBaseline: true,
  createdAt: new Date(),
};

const mockRepo: jest.Mocked<IRouteRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByRouteId: jest.fn(),
  findBaseline: jest.fn(),
  create: jest.fn(),
  setBaseline: jest.fn(),
  getComparison: jest.fn(),
};

describe('RouteUseCases', () => {
  let useCases: RouteUseCases;

  beforeEach(() => {
    jest.clearAllMocks();
    useCases = new RouteUseCases(mockRepo);
  });

  describe('getAllRoutes', () => {
    it('returns all routes', async () => {
      mockRepo.findAll.mockResolvedValue([mockRoute]);
      const result = await useCases.getAllRoutes();
      expect(result).toHaveLength(1);
      expect(mockRepo.findAll).toHaveBeenCalledWith(undefined);
    });

    it('passes filters to repository', async () => {
      mockRepo.findAll.mockResolvedValue([]);
      await useCases.getAllRoutes({ vesselType: 'Container' });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ vesselType: 'Container' });
    });
  });

  describe('setBaseline', () => {
    it('sets baseline for existing route', async () => {
      mockRepo.findByRouteId.mockResolvedValue(mockRoute);
      mockRepo.setBaseline.mockResolvedValue({ ...mockRoute, isBaseline: true });
      const result = await useCases.setBaseline('R001');
      expect(result.isBaseline).toBe(true);
    });

    it('throws if route not found', async () => {
      mockRepo.findByRouteId.mockResolvedValue(null);
      await expect(useCases.setBaseline('INVALID')).rejects.toThrow('not found');
    });
  });

  describe('getComparison', () => {
    it('returns comparison data', async () => {
      mockRepo.getComparison.mockResolvedValue([]);
      const result = await useCases.getComparison();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
