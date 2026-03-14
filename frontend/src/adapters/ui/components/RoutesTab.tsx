import { useState } from 'react';
import { Filter, Target, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRoutes } from '../useRoutes';
import { Route, FUEL_EU_TARGET_2025 } from '../../../core/domain/types';

const VESSEL_TYPES = ['', 'Container', 'BulkCarrier', 'Tanker', 'RoRo'];
const FUEL_TYPES = ['', 'HFO', 'LNG', 'MGO', 'VLSFO'];
const YEARS = [0, 2024, 2025, 2026];

export default function RoutesTab() {
  const [filters, setFilters] = useState<{
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }>({});

  const { routes, loading, error, setBaseline, refetch } = useRoutes(filters);
  const [settingBaseline, setSettingBaseline] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSetBaseline = async (route: Route) => {
    setSettingBaseline(route.routeId);
    try {
      await setBaseline(route.routeId);
      setSuccessMsg(`${route.routeId} set as baseline`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setSettingBaseline(null);
    }
  };

  const updateFilter = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* KPI summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-card">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Total Routes</span>
          <span className="kpi-value text-white">{routes.length}</span>
        </div>
        <div className="kpi-card">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Baseline Set</span>
          <span className="kpi-value text-sky-400">
            {routes.find(r => r.isBaseline)?.routeId || '—'}
          </span>
        </div>
        <div className="kpi-card">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Compliant</span>
          <span className="kpi-value text-emerald-400">
            {routes.filter(r => r.ghgIntensity <= FUEL_EU_TARGET_2025).length}
          </span>
        </div>
        <div className="kpi-card">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Avg GHG (gCO₂e/MJ)</span>
          <span className="kpi-value text-amber-400">
            {routes.length > 0
              ? (routes.reduce((s, r) => s + r.ghgIntensity, 0) / routes.length).toFixed(2)
              : '—'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-sky-400" />
          <span className="text-sm font-medium text-slate-300">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="input-field"
            value={filters.vesselType || ''}
            onChange={e => updateFilter('vesselType', e.target.value)}
          >
            {VESSEL_TYPES.map(v => (
              <option key={v} value={v} style={{ background: '#082f49' }}>
                {v || 'All Vessel Types'}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            value={filters.fuelType || ''}
            onChange={e => updateFilter('fuelType', e.target.value)}
          >
            {FUEL_TYPES.map(f => (
              <option key={f} value={f} style={{ background: '#082f49' }}>
                {f || 'All Fuel Types'}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            value={filters.year || 0}
            onChange={e => updateFilter('year', parseInt(e.target.value))}
          >
            {YEARS.map(y => (
              <option key={y} value={y} style={{ background: '#082f49' }}>
                {y || 'All Years'}
              </option>
            ))}
          </select>
          <button onClick={refetch} className="btn-ghost flex items-center gap-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success / Error messages */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
          <CheckCircle size={15} />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Route ID', 'Vessel Type', 'Fuel Type', 'Year', 'GHG Intensity', 'Fuel Cons. (t)', 'Distance (km)', 'Total Emis. (t)', 'Compliant', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                    Loading routes...
                  </td>
                </tr>
              ) : routes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    No routes found. Check backend connection.
                  </td>
                </tr>
              ) : (
                routes.map(route => {
                  const compliant = route.ghgIntensity <= FUEL_EU_TARGET_2025;
                  return (
                    <tr key={route.id} className="table-row-hover transition-colors border-b border-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-sky-300">{route.routeId}</span>
                          {route.isBaseline && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                              style={{ background: 'rgba(240, 165, 0, 0.15)', color: '#f0a500', border: '1px solid rgba(240, 165, 0, 0.3)' }}>
                              Baseline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{route.vesselType}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8' }}>
                          {route.fuelType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{route.year}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-semibold ${compliant ? 'text-emerald-400' : 'text-red-400'}`}>
                          {route.ghgIntensity.toFixed(4)}
                        </span>
                        <span className="text-slate-500 text-xs ml-1">gCO₂e/MJ</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{route.fuelConsumption.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{route.distance.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{route.totalEmissions.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {compliant
                          ? <span className="badge-surplus">✅ Yes</span>
                          : <span className="badge-deficit">❌ No</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSetBaseline(route)}
                          disabled={route.isBaseline || settingBaseline === route.routeId}
                          className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5"
                        >
                          <Target size={12} />
                          {route.isBaseline ? 'Baseline' : 'Set Baseline'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target reference */}
      <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
        <div className="w-3 h-0.5 bg-amber-400 rounded" />
        <span>FuelEU 2025 Target: <span className="font-mono text-amber-400">89.3368 gCO₂e/MJ</span> (−2% vs 2024 baseline of 91.16)</span>
      </div>
    </div>
  );
}
