import {
  Route,
  RouteComparison,
  ComplianceSnapshot,
  BankEntry,
  BankingResult,
  Pool,
  PoolAllocationResult,
  ApiResponse,
} from '../../core/domain/types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success || !res.ok) {
    throw new Error(json.error || 'API request failed');
  }
  return json.data as T;
}

// Routes
export const routesApi = {
  getAll: (filters?: { vesselType?: string; fuelType?: string; year?: number }) => {
    const params = new URLSearchParams();
    if (filters?.vesselType) params.set('vesselType', filters.vesselType);
    if (filters?.fuelType) params.set('fuelType', filters.fuelType);
    if (filters?.year) params.set('year', String(filters.year));
    const qs = params.toString();
    return request<Route[]>(`/routes${qs ? `?${qs}` : ''}`);
  },

  setBaseline: (routeId: string) =>
    request<Route>(`/routes/${routeId}/baseline`, { method: 'POST' }),

  getComparison: () => request<RouteComparison[]>('/routes/comparison'),
};

// Compliance
export const complianceApi = {
  getCb: (shipId: string, year: number) =>
    request<ComplianceSnapshot>(`/compliance/cb?shipId=${shipId}&year=${year}`),

  getAdjustedCb: (shipId: string, year: number) =>
    request<{ shipId: string; year: number; adjustedCb: number }>(
      `/compliance/adjusted-cb?shipId=${shipId}&year=${year}`
    ),
};

// Banking
export const bankingApi = {
  getRecords: (shipId: string, year: number) =>
    request<BankEntry[]>(`/banking/records?shipId=${shipId}&year=${year}`),

  bankSurplus: (shipId: string, year: number, amount: number) =>
    request<BankingResult>('/banking/bank', {
      method: 'POST',
      body: JSON.stringify({ shipId, year, amount }),
    }),

  applyBanked: (shipId: string, year: number, amount: number) =>
    request<BankingResult>('/banking/apply', {
      method: 'POST',
      body: JSON.stringify({ shipId, year, amount }),
    }),
};

// Pooling
export const poolingApi = {
  list: (year?: number) =>
    request<Pool[]>(`/pools${year ? `?year=${year}` : ''}`),

  create: (year: number, memberShipIds: string[]) =>
    request<PoolAllocationResult>('/pools', {
      method: 'POST',
      body: JSON.stringify({ year, memberShipIds }),
    }),
};
