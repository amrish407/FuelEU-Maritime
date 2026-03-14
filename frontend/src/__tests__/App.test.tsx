import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../adapters/infrastructure/apiClient', () => ({
  routesApi: {
    getAll: vi.fn().mockResolvedValue([]),
    setBaseline: vi.fn(),
    getComparison: vi.fn().mockResolvedValue([]),
  },
  complianceApi: {
    getCb: vi.fn().mockResolvedValue({
      shipId: 'R001', year: 2024, cb: 0, ghgIntensity: 91.0,
      targetIntensity: 91.16, energyInScope: 205000000, isSurplus: false
    }),
    getAdjustedCb: vi.fn().mockResolvedValue({ shipId: 'R001', year: 2024, adjustedCb: 0 }),
  },
  bankingApi: {
    getRecords: vi.fn().mockResolvedValue([]),
    bankSurplus: vi.fn(),
    applyBanked: vi.fn(),
  },
  poolingApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText('FuelEU Maritime')).toBeInTheDocument();
  });

  it('renders all 4 tab buttons', () => {
    render(<App />);
    expect(screen.getAllByText('Routes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Compare').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Banking').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pooling').length).toBeGreaterThanOrEqual(1);
  });

  it('shows target intensity in header', () => {
    render(<App />);
    expect(screen.getAllByText(/89.3368/).length).toBeGreaterThanOrEqual(1);
  });
});