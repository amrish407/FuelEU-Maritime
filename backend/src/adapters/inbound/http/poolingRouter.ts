import { Router, Request, Response, NextFunction } from 'express';
import { PoolingUseCases } from '../../../core/application/PoolingUseCases';

export function createPoolingRouter(poolingUseCases: PoolingUseCases): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year } = req.query;
      const pools = await poolingUseCases.listPools(year ? parseInt(year as string) : undefined);
      res.json({ success: true, data: pools });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year, memberShipIds } = req.body;
      if (!year || !memberShipIds || !Array.isArray(memberShipIds)) {
        res.status(400).json({ success: false, error: 'year and memberShipIds array are required' });
        return;
      }
      const result = await poolingUseCases.createPool(parseInt(year), memberShipIds);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:poolId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pool = await poolingUseCases.getPool(req.params.poolId);
      if (!pool) {
        res.status(404).json({ success: false, error: 'Pool not found' });
        return;
      }
      res.json({ success: true, data: pool });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
