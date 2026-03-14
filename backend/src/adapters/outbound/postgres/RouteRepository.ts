import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Route, CreateRouteInput, RouteComparison } from '../../../core/domain/Route';
import { IRouteRepository } from '../../../core/ports/IRouteRepository';

export class PostgresRouteRepository implements IRouteRepository {
  constructor(private readonly db: Pool) {}

  private mapRow(row: Record<string, unknown>): Route {
    return {
      id: row.id as string,
      routeId: row.route_id as string,
      vesselType: row.vessel_type as Route['vesselType'],
      fuelType: row.fuel_type as Route['fuelType'],
      year: row.year as number,
      ghgIntensity: parseFloat(row.ghg_intensity as string),
      fuelConsumption: parseFloat(row.fuel_consumption as string),
      distance: parseFloat(row.distance as string),
      totalEmissions: parseFloat(row.total_emissions as string),
      isBaseline: row.is_baseline as boolean,
      createdAt: new Date(row.created_at as string),
    };
  }

  async findAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    let query = 'SELECT * FROM routes WHERE 1=1';
    const params: unknown[] = [];
    let paramIdx = 1;

    if (filters?.vesselType) {
      query += ` AND vessel_type = $${paramIdx++}`;
      params.push(filters.vesselType);
    }
    if (filters?.fuelType) {
      query += ` AND fuel_type = $${paramIdx++}`;
      params.push(filters.fuelType);
    }
    if (filters?.year) {
      query += ` AND year = $${paramIdx++}`;
      params.push(filters.year);
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.query(query, params);
    return result.rows.map(row => this.mapRow(row));
  }

  async findById(id: string): Promise<Route | null> {
    const result = await this.db.query('SELECT * FROM routes WHERE id = $1', [id]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const result = await this.db.query('SELECT * FROM routes WHERE route_id = $1', [routeId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findBaseline(): Promise<Route | null> {
    const result = await this.db.query('SELECT * FROM routes WHERE is_baseline = true LIMIT 1');
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(input: CreateRouteInput): Promise<Route> {
    const id = uuidv4();
    const result = await this.db.query(
      `INSERT INTO routes (id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        input.routeId,
        input.vesselType,
        input.fuelType,
        input.year,
        input.ghgIntensity,
        input.fuelConsumption,
        input.distance,
        input.totalEmissions,
        input.isBaseline ?? false,
      ]
    );
    return this.mapRow(result.rows[0]);
  }

  async setBaseline(routeId: string): Promise<Route> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE routes SET is_baseline = false');
      const result = await client.query(
        'UPDATE routes SET is_baseline = true WHERE route_id = $1 RETURNING *',
        [routeId]
      );
      await client.query('COMMIT');
      if (!result.rows[0]) throw new Error(`Route ${routeId} not found`);
      return this.mapRow(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getComparison(): Promise<RouteComparison[]> {
    const baseline = await this.findBaseline();
    if (!baseline) return [];

    const others = await this.findAll();
    const comparisons = others.filter(r => r.routeId !== baseline.routeId);

    return comparisons.map(comparison => {
      const percentDiff = ((comparison.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
      const compliant = comparison.ghgIntensity <= 89.3368;
      return { baseline, comparison, percentDiff, compliant };
    });
  }
}
