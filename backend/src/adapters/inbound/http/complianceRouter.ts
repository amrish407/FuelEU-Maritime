import { Router, Request, Response, NextFunction } from 'express';
import { ComplianceUseCases } from '../../../core/application/ComplianceUseCases';

export function createComplianceRouter(complianceUseCases: ComplianceUseCases): Router {
  const router = Router();

  router.get('/cb', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        res.status(400).json({ success: false, error: 'shipId and year are required' });
        return;
      }
      const snapshot = await complianceUseCases.getComplianceBalance(
        shipId as string,
        parseInt(year as string)
      );
      res.json({ success: true, data: snapshot });
    } catch (err) {
      next(err);
    }
  });

  router.get('/adjusted-cb', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        res.status(400).json({ success: false, error: 'shipId and year are required' });
        return;
      }
      const result = await complianceUseCases.getAdjustedCb(
        shipId as string,
        parseInt(year as string)
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
