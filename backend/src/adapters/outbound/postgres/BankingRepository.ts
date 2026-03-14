import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { BankEntry, BankingResult, BankSurplusInput, ApplyBankedInput } from '../../../core/domain/Banking';
import { IBankingRepository } from '../../../core/ports/IBankingRepository';

export class PostgresBankingRepository implements IBankingRepository {
  constructor(private readonly db: Pool) {}

  async findRecords(shipId: string, year: number): Promise<BankEntry[]> {
    const result = await this.db.query(
      'SELECT * FROM bank_entries WHERE ship_id = $1 AND year = $2 ORDER BY created_at DESC',
      [shipId, year]
    );
    return result.rows.map(row => ({
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      amountGco2eq: parseFloat(row.amount_gco2eq),
      createdAt: new Date(row.created_at),
    }));
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await this.db.query(
      `SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'bank' THEN amount_gco2eq ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN entry_type = 'apply' THEN amount_gco2eq ELSE 0 END), 0) AS net_banked
       FROM bank_entries
       WHERE ship_id = $1 AND year = $2`,
      [shipId, year]
    );
    return parseFloat(result.rows[0]?.net_banked || '0');
  }

  async bankSurplus(input: BankSurplusInput): Promise<BankingResult> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get current CB
      const cbResult = await client.query(
        'SELECT cb_gco2eq FROM ship_compliance WHERE ship_id = $1 AND year = $2',
        [input.shipId, input.year]
      );
      const cbBefore = parseFloat(cbResult.rows[0]?.cb_gco2eq || '0');

      // Insert bank entry
      const id = uuidv4();
      await client.query(
        `INSERT INTO bank_entries (id, ship_id, year, amount_gco2eq, entry_type)
         VALUES ($1, $2, $3, $4, 'bank')`,
        [id, input.shipId, input.year, input.amount]
      );

      await client.query('COMMIT');

      return {
        cbBefore,
        applied: input.amount,
        cbAfter: cbBefore - input.amount,
        bankEntryId: id,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async applyBanked(input: ApplyBankedInput): Promise<BankingResult> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get current CB
      const cbResult = await client.query(
        'SELECT cb_gco2eq FROM ship_compliance WHERE ship_id = $1 AND year = $2',
        [input.shipId, input.year]
      );
      const cbBefore = parseFloat(cbResult.rows[0]?.cb_gco2eq || '0');

      // Insert apply entry
      const id = uuidv4();
      await client.query(
        `INSERT INTO bank_entries (id, ship_id, year, amount_gco2eq, entry_type)
         VALUES ($1, $2, $3, $4, 'apply')`,
        [id, input.shipId, input.year, input.amount]
      );

      // Update compliance record
      await client.query(
        `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
         VALUES ($1, $2, $3)
         ON CONFLICT (ship_id, year) DO UPDATE SET cb_gco2eq = ship_compliance.cb_gco2eq + $3`,
        [input.shipId, input.year, input.amount]
      );

      await client.query('COMMIT');

      return {
        cbBefore,
        applied: input.amount,
        cbAfter: cbBefore + input.amount,
        bankEntryId: id,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
