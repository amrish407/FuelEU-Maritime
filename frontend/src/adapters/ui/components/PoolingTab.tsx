import { useState } from 'react';
import { Users, Plus, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { usePooling } from '../usePooling';

const AVAILABLE_SHIPS = ['R001', 'R002', 'R003', 'R004', 'R005'];

function formatCb(val: number) {
  const abs = Math.abs(val / 1_000_000).toFixed(3);
  return `${val >= 0 ? '+' : '-'}${abs}M`;
}

export default function PoolingTab() {
  const [poolYear, setPoolYear] = useState(2024);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberCbs, setMemberCbs] = useState<Record<string, number>>({});

  const { pools, loading, creating, error, lastResult, createPool, getShipCb, refetch } = usePooling(poolYear);

  const poolSum = selectedMembers.reduce((s, id) => s + (memberCbs[id] ?? 0), 0);
  const isValidPool = selectedMembers.length >= 2 && poolSum >= 0;

  const addMember = async (shipId: string) => {
    if (selectedMembers.includes(shipId)) return;
    try {
      const { adjustedCb } = await getShipCb(shipId, poolYear);
      setMemberCbs(prev => ({ ...prev, [shipId]: adjustedCb }));
      setSelectedMembers(prev => [...prev, shipId]);
    } catch {
      /* ignore */
    }
  };

  const removeMember = (shipId: string) => {
    setSelectedMembers(prev => prev.filter(id => id !== shipId));
  };

  const handleCreatePool = async () => {
    if (!isValidPool) return;
    const result = await createPool(poolYear, selectedMembers);
    if (result) {
      setSelectedMembers([]);
      setMemberCbs({});
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-sky-400" />
          <h3 className="font-display font-semibold text-white">Article 21 — Compliance Balance Pooling</h3>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Pool Year</label>
            <select
              className="input-field"
              value={poolYear}
              onChange={e => setPoolYear(parseInt(e.target.value))}
            >
              {[2024, 2025].map(y => (
                <option key={y} value={y} style={{ background: '#082f49' }}>{y}</option>
              ))}
            </select>
          </div>
          <button onClick={refetch} className="btn-ghost flex items-center gap-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Success */}
      {lastResult && (
        <div className="glass-card p-5" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <CheckCircle size={16} />
            <span className="font-semibold">Pool Created — ID: <span className="font-mono text-xs">{lastResult.poolId.slice(0, 12)}…</span></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Ship', 'CB Before', 'CB After', 'Δ CB'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lastResult.members.map(m => (
                  <tr key={m.shipId} className="border-b border-white/5">
                    <td className="px-3 py-2 font-mono text-sky-300">{m.shipId}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: m.cbBefore >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCb(m.cbBefore)}
                    </td>
                    <td className="px-3 py-2 font-mono" style={{ color: m.cbAfter >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCb(m.cbAfter)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-400">
                      {formatCb(m.cbAfter - m.cbBefore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs">
            <span className="text-slate-400">Pool Sum: </span>
            <span className={`font-mono font-bold ${lastResult.poolSum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCb(lastResult.poolSum)}
            </span>
          </div>
        </div>
      )}

      {/* Pool builder */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Available ships */}
        <div className="glass-card p-5">
          <h4 className="font-semibold text-white mb-3">Available Ships</h4>
          <div className="space-y-2">
            {AVAILABLE_SHIPS.map(shipId => {
              const isAdded = selectedMembers.includes(shipId);
              return (
                <button
                  key={shipId}
                  onClick={() => addMember(shipId)}
                  disabled={isAdded}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: isAdded ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isAdded ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    cursor: isAdded ? 'default' : 'pointer',
                  }}
                >
                  <span className="font-mono text-sky-300">{shipId}</span>
                  {isAdded ? (
                    <span className="text-xs text-sky-400">Added ✓</span>
                  ) : (
                    <Plus size={14} className="text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pool configuration */}
        <div className="glass-card p-5">
          <h4 className="font-semibold text-white mb-3">Pool Members ({selectedMembers.length})</h4>

          {selectedMembers.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">Add ships from the left panel</p>
          ) : (
            <div className="space-y-2 mb-4">
              {selectedMembers.map(shipId => {
                const cb = memberCbs[shipId] ?? 0;
                return (
                  <div key={shipId} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="font-mono text-sm text-sky-300">{shipId}</span>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs font-bold ${cb >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCb(cb)}
                      </span>
                      <button onClick={() => removeMember(shipId)}
                        className="text-slate-500 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pool sum indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-4"
            style={{
              background: poolSum >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${poolSum >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
            <span className="text-xs font-medium" style={{ color: poolSum >= 0 ? '#10b981' : '#ef4444' }}>
              Pool Sum
            </span>
            <span className={`font-mono font-bold text-sm ${poolSum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCb(poolSum)} {poolSum >= 0 ? '✅' : '❌'}
            </span>
          </div>

          {/* Validation messages */}
          {selectedMembers.length > 0 && selectedMembers.length < 2 && (
            <p className="text-xs text-amber-400 mb-3">⚠ Need at least 2 members</p>
          )}
          {selectedMembers.length >= 2 && poolSum < 0 && (
            <p className="text-xs text-red-400 mb-3">⚠ Pool sum must be ≥ 0</p>
          )}

          <button
            onClick={handleCreatePool}
            disabled={!isValidPool || creating}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {creating ? <RefreshCw size={14} className="animate-spin" /> : <Users size={14} />}
            Create Pool
          </button>
        </div>
      </div>

      {/* Existing pools */}
      {pools.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="font-display font-semibold text-white">Existing Pools ({poolYear})</h3>
          </div>
          <div className="divide-y divide-white/5">
            {pools.map(pool => (
              <div key={pool.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-slate-400">{pool.id.slice(0, 16)}…</span>
                  <span className={`font-mono text-xs font-bold ${pool.poolSum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    Sum: {formatCb(pool.poolSum)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pool.members.map(m => (
                    <div key={m.shipId} className="px-2 py-1 rounded text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="font-mono text-sky-300">{m.shipId}</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span className={`font-mono ${m.cbAfter >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCb(m.cbAfter)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
