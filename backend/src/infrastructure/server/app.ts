import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pool from '../db/connection';
import { PostgresRouteRepository } from '../../adapters/outbound/postgres/RouteRepository';
import { PostgresComplianceRepository } from '../../adapters/outbound/postgres/ComplianceRepository';
import { PostgresBankingRepository } from '../../adapters/outbound/postgres/BankingRepository';
import { PostgresPoolingRepository } from '../../adapters/outbound/postgres/PoolingRepository';
import { RouteUseCases } from '../../core/application/RouteUseCases';
import { ComplianceUseCases } from '../../core/application/ComplianceUseCases';
import { BankingUseCases } from '../../core/application/BankingUseCases';
import { PoolingUseCases } from '../../core/application/PoolingUseCases';
import { createRoutesRouter } from '../../adapters/inbound/http/routesRouter';
import { createComplianceRouter } from '../../adapters/inbound/http/complianceRouter';
import { createBankingRouter } from '../../adapters/inbound/http/bankingRouter';
import { createPoolingRouter } from '../../adapters/inbound/http/poolingRouter';

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  // Wire up repositories
  const routeRepo = new PostgresRouteRepository(pool);
  const complianceRepo = new PostgresComplianceRepository(pool);
  const bankingRepo = new PostgresBankingRepository(pool);
  const poolingRepo = new PostgresPoolingRepository(pool);

  // Wire up use cases (dependency injection)
  const routeUseCases = new RouteUseCases(routeRepo);
  const complianceUseCases = new ComplianceUseCases(complianceRepo);
  const bankingUseCases = new BankingUseCases(bankingRepo, complianceRepo);
  const poolingUseCases = new PoolingUseCases(poolingRepo, complianceRepo);

  // Register routes
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
  app.use('/routes', createRoutesRouter(routeUseCases));
  app.use('/compliance', createComplianceRouter(complianceUseCases));
  app.use('/banking', createBankingRouter(bankingUseCases));
  app.use('/pools', createPoolingRouter(poolingUseCases));

  // Global error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  });

  return app;
}
