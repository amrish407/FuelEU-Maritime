import { RefreshCw, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts';
import { useComparison } from '../useRoutes';
import { FUEL_EU_TARGET_2025 } from '../../../core/domain/types';

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const compliant = value <= FUEL_EU_TARGET_2025;
    return (
      <div className="glass-card p-3 text-xs shadow-xl">
        <p className="font-mono font-bold text-sky-300 mb-1">{label}</p>
        <p className="text-slate-300">
          GHG: <span className={`font-mono font-bold ${compliant ? 'text-emerald-400' : 'text-red-400'}`}>
            {value.toFixed(4)} gCO₂e/MJ
          </span>
        </p>
        <p className="text-slate-400 mt-0.5">
          {compliant ? '✅ Compliant' : '❌ Non-compliant'}
        </p>
      </div>
    );
  }
  return null;
};

export default function CompareTab() {
  const { comparisons, loading, error, refetch } = useComparison();

  const chartData = comparisons.map(c => ({
    name: c.comparison.routeId,
    ghgIntensity: c.comparison.ghgIntensity,
    baseline: c.baseline.ghgIntensity,
    percentDiff: c.percentDiff,
    compliant: c.compliant,
  }));

  // Include baseline in chart
  if (comparisons.length > 0) {
    const baseline = comparisons[0].baseline;
    chartData.unshift({
      name: `${baseline.routeId} (BL)`,
      ghgIntensity: baseline.ghgIntensity,
      baseline: baseline.ghgIntensity,
      percentDiff: 0,
      compliant: baseline.ghgIntensity <= FUEL_EU_TARGET_2025,
    });
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header actions */}
      <div className="flex justify-end">
        <button onClick={refetch} className="btn-ghost flex items-center gap-1.5 text-sm">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Routes Compared</span>
          <span className="kpi-value text-white">{comparisons.length}</span>
        </div>
        <div className="kpi-card">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Compliant</span>
          <span className="kpi-value text-emerald-400">
            {comparisons.filter(c => c.compliant).length}
          </span>
        </div>
        <div className="kpi-card">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Non-Compliant</span>
          <span className="kpi-value text-red-400">
            {comparisons.filter(c => !c.compliant).length}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-1">GHG Intensity Comparison</h3>
        <p className="text-xs text-slate-400 mb-6">
          gCO₂e/MJ — Red line = FuelEU 2025 target (89.3368)
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <RefreshCw size={24} className="animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                domain={[85, 96]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <ReferenceLine
                y={FUEL_EU_TARGET_2025}
                stroke="#ef4444"
                strokeDasharray="6 3"
                strokeWidth={2}
                label={{ value: `Target ${FUEL_EU_TARGET_2025}`, position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }}
              />
              <Bar dataKey="ghgIntensity" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.compliant ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Comparison Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="font-display font-semibold text-white">Baseline vs Routes</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: percentDiff = ((comparison / baseline) − 1) × 100
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Route ID', 'Vessel Type', 'Fuel Type', 'Year', 'GHG Intensity', 'Baseline GHG', '% Difference', 'Compliant'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                  Loading...
                </td></tr>
              ) : comparisons.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  No comparison data. Set a baseline route first.
                </td></tr>
              ) : (
                comparisons.map(c => (
                  <tr key={c.comparison.id} className="table-row-hover border-b border-white/5">
                    <td className="px-4 py-3 font-mono text-sky-300">{c.comparison.routeId}</td>
                    <td className="px-4 py-3 text-slate-300">{c.comparison.vesselType}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8' }}>
                        {c.comparison.fuelType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{c.comparison.year}</td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      <span className={c.compliant ? 'text-emerald-400' : 'text-red-400'}>
                        {c.comparison.ghgIntensity.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{c.baseline.ghgIntensity.toFixed(4)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold ${c.percentDiff < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.percentDiff > 0 ? '+' : ''}{c.percentDiff.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.compliant
                        ? <span className="badge-surplus">✅ Compliant</span>
                        : <span className="badge-deficit">❌ Non-compliant</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
