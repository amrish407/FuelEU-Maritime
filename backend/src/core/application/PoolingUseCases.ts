import {PoolAllocationResult, PoolWithMembers } from '../domain/Pooling';
import { IPoolingRepository } from '../ports/IPoolingRepository';
import { IComplianceRepository } from '../ports/IComplianceRepository';

export class PoolingUseCases {
  constructor(
    private readonly poolingRepo: IPoolingRepository,
    private readonly complianceRepo: IComplianceRepository
  ) {}

  async createPool(year: number, memberShipIds: string[]): Promise<PoolAllocationResult> {
    if (!memberShipIds || memberShipIds.length < 2) {
      throw new Error('A pool must have at least 2 members.');
    }

    // Validate all ships exist and get their CBs
    const cbSnapshots = await Promise.all(
      memberShipIds.map(id => this.complianceRepo.getAdjustedCb(id, year))
    );

    const total = cbSnapshots.reduce((sum, cb) => sum + cb, 0);
    if (total < 0) {
      throw new Error(`Pool sum (${total.toFixed(2)}) is negative — pool is invalid.`);
    }

    return this.poolingRepo.createPool({ year, memberShipIds });
  }

  async listPools(year?: number): Promise<PoolWithMembers[]> {
    return this.poolingRepo.listPools(year);
  }

  async getPool(poolId: string): Promise<PoolWithMembers | null> {
    return this.poolingRepo.findPool(poolId);
  }
}
