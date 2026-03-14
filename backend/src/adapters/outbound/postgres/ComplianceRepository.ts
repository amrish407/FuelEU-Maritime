import { Pool } from 'pg';
import {
  ShipCompliance,
  ComplianceSnapshot,
  computeEnergyInScope,
  computeComplianceBalance,
  getTargetIntensity,
} from '../../../core/domain/Compliance';
import { IComplianceRepository } from '../../../core/ports/IComplianceRepository';

export class PostgresComplianceRepository implements IComplianceRepository {
  constructor(private readonly db: Pool) {}

  async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    const result = await this.db.query(
      'SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      cbGco2eq: parseFloat(row.cb_gco2eq),
      createdAt: new Date(row.created_at),
    };
  }

  async upsert(data: Omit<ShipCompliance, 'id' | 'createdAt'>): Promise<ShipCompliance> {
    const result = await this.db.query(
      `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
       VALUES ($1, $2, $3)
       ON CONFLICT (ship_id, year) DO UPDATE SET cb_gco2eq = EXCLUDED.cb_gco2eq
       RETURNING *`,
      [data.shipId, data.year, data.cbGco2eq]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      cbGco2eq: parseFloat(row.cb_gco2eq),
      createdAt: new Date(row.created_at),
    };
  }

  async computeSnapshot(shipId: string, year: number): Promise<ComplianceSnapshot> {
    // Look up route data for the ship
    const routeResult = await this.db.query(
      'SELECT * FROM routes WHERE route_id = $1 AND year = $2 LIMIT 1',
      [shipId, year]
    );

    if (routeResult.rows[0]) {
      const route = routeResult.rows[0];
      const ghgIntensity = parseFloat(route.ghg_intensity);
      const fuelConsumption = parseFloat(route.fuel_consumption);
      const targetIntensity = getTargetIntensity(year);
      const energyInScope = computeEnergyInScope(fuelConsumption);
      const cb = computeComplianceBalance(targetIntensity, ghgIntensity, energyInScope);

      // Store snapshot
      await this.upsert({ shipId, year, cbGco2eq: cb });

      return {
        shipId,
        year,
        ghgIntensity,
        targetIntensity,
        energyInScope,
        cb,
        isSurplus: cb > 0,
      };
    }

    // Fall back to stored compliance record
    const stored = await this.findByShipAndYear(shipId, year);
    if (!stored) throw new Error(`No compliance data found for ship ${shipId}, year ${year}`);

    const targetIntensity = getTargetIntensity(year);
    return {
      shipId,
      year,
      ghgIntensity: 0,
      targetIntensity,
      energyInScope: 0,
      cb: stored.cbGco2eq,
      isSurplus: stored.cbGco2eq > 0,
    };
  }

  async getAdjustedCb(shipId: string, year: number): Promise<number> {
    // Get base CB
    const snapshot = await this.computeSnapshot(shipId, year);
    let cb = snapshot.cb;

    // Add banked surplus applications (net banking effect)
    const bankResult = await this.db.query(
      `SELECT SUM(CASE WHEN entry_type = 'apply' THEN amount_gco2eq ELSE -amount_gco2eq END) as net_banked
       FROM bank_entries WHERE ship_id = $1 AND year = $2`,
      [shipId, year]
    );
    const netBanked = parseFloat(bankResult.rows[0]?.net_banked || '0');
    cb += netBanked;

    return cb;
  }
}
