import { useState, useEffect, useCallback } from 'react';
import { Pool, PoolAllocationResult } from '../../core/domain/types';
import { poolingApi, complianceApi } from '../infrastructure/apiClient';

export function usePooling(year?: number) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PoolAllocationResult | null>(null);

  const fetchPools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await poolingApi.list(year);
      setPools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchPools(); }, [fetchPools]);

  const createPool = async (poolYear: number, memberShipIds: string[]) => {
    setCreating(true);
    setError(null);
    try {
      const result = await poolingApi.create(poolYear, memberShipIds);
      setLastResult(result);
      await fetchPools();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pool creation failed');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const getShipCb = async (shipId: string, shipYear: number) => {
    return complianceApi.getAdjustedCb(shipId, shipYear);
  };

  return { pools, loading, creating, error, lastResult, createPool, getShipCb, refetch: fetchPools };
}
