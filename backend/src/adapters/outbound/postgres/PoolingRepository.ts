import { Pool as PgPool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { CreatePoolInput, PoolAllocationResult, PoolWithMembers, allocatePool } from '../../../core/domain/Pooling';
import { IPoolingRepository } from '../../../core/ports/IPoolingRepository';
import { PostgresComplianceRepository } from './ComplianceRepository';

export class PostgresPoolingRepository implements IPoolingRepository {
  private complianceRepo: PostgresComplianceRepository;

  constructor(private readonly db: PgPool) {
    this.complianceRepo = new PostgresComplianceRepository(db);
  }

  async createPool(input: CreatePoolInput): Promise<PoolAllocationResult> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Fetch adjusted CB for each member
      const membersWithCb = await Promise.all(
        input.memberShipIds.map(async shipId => ({
          shipId,
          cb: await this.complianceRepo.getAdjustedCb(shipId, input.year),
        }))
      );

      // Run allocation algorithm
      const allocation = allocatePool(membersWithCb);

      const poolId = uuidv4();
      await client.query('INSERT INTO pools (id, year) VALUES ($1, $2)', [poolId, input.year]);

      for (const member of allocation) {
        await client.query(
          'INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4)',
          [poolId, member.shipId, member.cbBefore, member.cbAfter]
        );
      }

      await client.query('COMMIT');

      const poolSum = allocation.reduce((sum, m) => sum + m.cbAfter, 0);

      return {
        poolId,
        year: input.year,
        members: allocation,
        poolSum,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findPool(poolId: string): Promise<PoolWithMembers | null> {
    const poolResult = await this.db.query('SELECT * FROM pools WHERE id = $1', [poolId]);
    if (!poolResult.rows[0]) return null;

    const membersResult = await this.db.query(
      'SELECT * FROM pool_members WHERE pool_id = $1',
      [poolId]
    );

    const members = membersResult.rows.map(row => ({
      poolId: row.pool_id,
      shipId: row.ship_id,
      cbBefore: parseFloat(row.cb_before),
      cbAfter: parseFloat(row.cb_after),
    }));

    const poolSum = members.reduce((sum, m) => sum + m.cbAfter, 0);

    return {
      id: poolResult.rows[0].id,
      year: poolResult.rows[0].year,
      createdAt: new Date(poolResult.rows[0].created_at),
      members,
      poolSum,
    };
  }

  async listPools(year?: number): Promise<PoolWithMembers[]> {
    let query = 'SELECT id FROM pools';
    const params: unknown[] = [];
    if (year) {
      query += ' WHERE year = $1';
      params.push(year);
    }
    query += ' ORDER BY created_at DESC';

    const result = await this.db.query(query, params);
    const pools = await Promise.all(result.rows.map(row => this.findPool(row.id)));
    return pools.filter((p): p is PoolWithMembers => p !== null);
  }
}
