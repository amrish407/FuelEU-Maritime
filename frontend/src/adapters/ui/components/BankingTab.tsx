import { useState } from 'react';
import { Landmark, TrendingUp, TrendingDown, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useBanking } from '../useBanking';

const SHIP_OPTIONS = [
  { value: 'R001', label: 'R001 — Container / HFO / 2024' },
  { value: 'R002', label: 'R002 — BulkCarrier / LNG / 2024' },
  { value: 'R003', label: 'R003 — Tanker / MGO / 2024' },
  { value: 'R004', label: 'R004 — RoRo / HFO / 2025' },
  { value: 'R005', label: 'R005 — Container / LNG / 2025' },
];

const YEAR_OPTIONS = [2024, 2025];

function formatCb(val: number) {
  return `${val >= 0 ? '+' : ''}${(val / 1_000_000).toFixed(3)}M gCO₂e`;
}

export default function BankingTab() {
  const [selectedShip, setSelectedShip] = useState('R001');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [bankAmount, setBankAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');

  const { snapshot, records, loading, actionLoading, error, result, bankSurplus, applyBanked, refetch } =
    useBanking(selectedShip, selectedYear);

  const canBank = snapshot && snapshot.cb > 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Ship selector */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={16} className="text-sky-400" />
          <h3 className="font-display font-semibold text-white">Article 20 — Compliance Balance Banking</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Ship / Route</label>
            <select
              className="input-field min-w-[260px]"
              value={selectedShip}
              onChange={e => setSelectedShip(e.target.value)}
            >
              {SHIP_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#082f49' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Year</label>
            <select
              className="input-field"
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y} style={{ background: '#082f49' }}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button onClick={refetch} className="btn-ghost flex items-center gap-1.5">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="glass-card p-5" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <CheckCircle size={16} />
            <span className="font-semibold">Transaction Complete</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1">CB Before</p>
              <p className="font-mono font-bold" style={{ color: result.cbBefore >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCb(result.cbBefore)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Applied</p>
              <p className="font-mono font-bold text-sky-400">{formatCb(result.applied)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">CB After</p>
              <p className="font-mono font-bold" style={{ color: result.cbAfter >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCb(result.cbAfter)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CB snapshot KPIs */}
      {loading ? (
        <div className="glass-card p-10 text-center text-slate-500">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
          Computing compliance balance...
        </div>
      ) : snapshot ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="kpi-card">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Compliance Balance</span>
            <span className={`kpi-value ${snapshot.isSurplus ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCb(snapshot.cb)}
            </span>
            {snapshot.isSurplus
              ? <span className="badge-surplus self-start"><TrendingUp size={10} /> Surplus</span>
              : <span className="badge-deficit self-start"><TrendingDown size={10} /> Deficit</span>
            }
          </div>
          <div className="kpi-card">
            <span className="text-xs text-slate-400 uppercase tracking-wider">GHG Intensity</span>
            <span className="kpi-value text-white">{snapshot.ghgIntensity.toFixed(4)}</span>
            <span className="text-xs text-slate-500">gCO₂e/MJ</span>
          </div>
          <div className="kpi-card">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Target Intensity</span>
            <span className="kpi-value text-amber-400">{snapshot.targetIntensity.toFixed(4)}</span>
            <span className="text-xs text-slate-500">gCO₂e/MJ</span>
          </div>
          <div className="kpi-card">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Energy in Scope</span>
            <span className="kpi-value text-sky-400">
              {(snapshot.energyInScope / 1_000_000).toFixed(2)}M
            </span>
            <span className="text-xs text-slate-500">MJ</span>
          </div>
        </div>
      ) : null}

      {/* Banking actions */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Bank surplus */}
        <div className="glass-card p-5">
          <h4 className="font-semibold text-white mb-1">Bank Surplus CB</h4>
          <p className="text-xs text-slate-400 mb-4">
            Carry forward positive CB to offset future deficits
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Amount (gCO₂e)</label>
              <input
                type="number"
                className="input-field w-full"
                placeholder="e.g. 500000"
                value={bankAmount}
                onChange={e => setBankAmount(e.target.value)}
                disabled={!canBank}
              />
            </div>
            <button
              onClick={() => bankSurplus(parseFloat(bankAmount))}
              disabled={!canBank || !bankAmount || actionLoading}
              className="btn-success w-full flex items-center justify-center gap-2"
            >
              {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <TrendingUp size={14} />}
              Bank Surplus
            </button>
            {!canBank && snapshot && (
              <p className="text-xs text-red-400">⚠ CB ≤ 0 — no surplus to bank</p>
            )}
          </div>
        </div>

        {/* Apply banked */}
        <div className="glass-card p-5">
          <h4 className="font-semibold text-white mb-1">Apply Banked Surplus</h4>
          <p className="text-xs text-slate-400 mb-4">
            Use previously banked CB to offset current year deficit
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Amount (gCO₂e)</label>
              <input
                type="number"
                className="input-field w-full"
                placeholder="e.g. 200000"
                value={applyAmount}
                onChange={e => setApplyAmount(e.target.value)}
              />
            </div>
            <button
              onClick={() => applyBanked(parseFloat(applyAmount))}
              disabled={!applyAmount || actionLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <TrendingDown size={14} />}
              Apply Banked
            </button>
          </div>
        </div>
      </div>

      {/* Bank records */}
      {records.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="font-display font-semibold text-white">Banking Records</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Entry ID', 'Ship', 'Year', 'Amount (gCO₂e)', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="table-row-hover border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 font-mono text-sky-300">{r.shipId}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{r.year}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-emerald-400">
                      +{(r.amountGco2eq / 1_000_000).toFixed(3)}M
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
