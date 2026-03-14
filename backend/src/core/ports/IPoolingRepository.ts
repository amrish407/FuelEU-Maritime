import { CreatePoolInput, PoolAllocationResult, PoolWithMembers } from '../domain/Pooling';

export interface IPoolingRepository {
  createPool(input: CreatePoolInput): Promise<PoolAllocationResult>;
  findPool(poolId: string): Promise<PoolWithMembers | null>;
  listPools(year?: number): Promise<PoolWithMembers[]>;
}
