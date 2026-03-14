import { Router, Request, Response, NextFunction } from 'express';
import { BankingUseCases } from '../../../core/application/BankingUseCases';

export function createBankingRouter(bankingUseCases: BankingUseCases): Router {
  const router = Router();

  router.get('/records', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        res.status(400).json({ success: false, error: 'shipId and year are required' });
        return;
      }
      const records = await bankingUseCases.getRecords(
        shipId as string,
        parseInt(year as string)
      );
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  });

  router.post('/bank', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year, amount } = req.body;
      if (!shipId || !year || !amount) {
        res.status(400).json({ success: false, error: 'shipId, year, and amount are required' });
        return;
      }
      const result = await bankingUseCases.bankSurplus(shipId, parseInt(year), parseFloat(amount));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  router.post('/apply', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year, amount } = req.body;
      if (!shipId || !year || !amount) {
        res.status(400).json({ success: false, error: 'shipId, year, and amount are required' });
        return;
      }
      const result = await bankingUseCases.applyBanked(shipId, parseInt(year), parseFloat(amount));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
