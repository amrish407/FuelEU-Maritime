import { Router, Request, Response, NextFunction } from 'express';
import { RouteUseCases } from '../../../core/application/RouteUseCases';

export function createRoutesRouter(routeUseCases: RouteUseCases): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vesselType, fuelType, year } = req.query;
      const routes = await routeUseCases.getAllRoutes({
        vesselType: vesselType as string | undefined,
        fuelType: fuelType as string | undefined,
        year: year ? parseInt(year as string) : undefined,
      });
      res.json({ success: true, data: routes });
    } catch (err) {
      next(err);
    }
  });

  router.post('/:routeId/baseline', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { routeId } = req.params;
      const route = await routeUseCases.setBaseline(routeId);
      res.json({ success: true, data: route });
    } catch (err) {
      next(err);
    }
  });

  router.get('/comparison', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comparisons = await routeUseCases.getComparison();
      res.json({ success: true, data: comparisons });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
