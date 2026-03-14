import { useState, useEffect, useCallback } from 'react';
import { ComplianceSnapshot, BankEntry, BankingResult } from '../../core/domain/types';
import { complianceApi, bankingApi } from '../infrastructure/apiClient';

export function useBanking(shipId: string, year: number) {
  const [snapshot, setSnapshot] = useState<ComplianceSnapshot | null>(null);
  const [records, setRecords] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BankingResult | null>(null);

  const fetchData = useCallback(async () => {
    if (!shipId || !year) return;
    setLoading(true);
    setError(null);
    try {
      const [snap, recs] = await Promise.all([
        complianceApi.getCb(shipId, year),
        bankingApi.getRecords(shipId, year),
      ]);
      setSnapshot(snap);
      setRecords(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch banking data');
    } finally {
      setLoading(false);
    }
  }, [shipId, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const bankSurplus = async (amount: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await bankingApi.bankSurplus(shipId, year, amount);
      setResult(res);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Banking failed');
    } finally {
      setActionLoading(false);
    }
  };

  const applyBanked = async (amount: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await bankingApi.applyBanked(shipId, year, amount);
      setResult(res);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apply failed');
    } finally {
      setActionLoading(false);
    }
  };

  return { snapshot, records, loading, actionLoading, error, result, bankSurplus, applyBanked, refetch: fetchData };
}
