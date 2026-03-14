import { useState, useEffect, useCallback } from 'react';
import { Route, RouteComparison } from '../../core/domain/types';
import { routesApi } from '../infrastructure/apiClient';

interface UseRoutesFilters {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}

export function useRoutes(filters?: UseRoutesFilters) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routesApi.getAll(filters);
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  }, [filters?.vesselType, filters?.fuelType, filters?.year]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  const setBaseline = async (routeId: string) => {
    try {
      await routesApi.setBaseline(routeId);
      await fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set baseline');
    }
  };

  return { routes, loading, error, refetch: fetchRoutes, setBaseline };
}

export function useComparison() {
  const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparisons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routesApi.getComparison();
      setComparisons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comparisons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComparisons(); }, [fetchComparisons]);

  return { comparisons, loading, error, refetch: fetchComparisons };
}
