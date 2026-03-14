import { useState } from 'react';
import { Anchor, TrendingUp, Landmark, Users } from 'lucide-react';
import RoutesTab from './adapters/ui/components/RoutesTab';
import CompareTab from './adapters/ui/components/CompareTab';
import BankingTab from './adapters/ui/components/BankingTab';
import PoolingTab from './adapters/ui/components/PoolingTab';

type TabId = 'routes' | 'compare' | 'banking' | 'pooling';

const TABS = [
  { id: 'routes' as TabId, label: 'Routes', icon: Anchor, desc: 'Fleet route management' },
  { id: 'compare' as TabId, label: 'Compare', icon: TrendingUp, desc: 'GHG intensity analysis' },
  { id: 'banking' as TabId, label: 'Banking', icon: Landmark, desc: 'Article 20 — CB banking' },
  { id: 'pooling' as TabId, label: 'Pooling', icon: Users, desc: 'Article 21 — CB pooling' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('routes');

  return (
    <div className="ocean-bg min-h-screen font-body">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: 'rgba(4, 30, 66, 0.85)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0369a1, #0ea5e9)' }}>
                <Anchor size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-white tracking-tight leading-none">
                  FuelEU Maritime
                </h1>
                <p className="text-xs text-slate-400 leading-none mt-0.5">
                  Compliance Dashboard — EU 2023/1805
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                <span className="text-emerald-400 font-medium">Live</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Target: 89.3368 gCO₂e/MJ
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="flex gap-1 -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === id
                    ? 'text-sky-400 border-sky-400'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/20'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-fade-in">
          {/* Tab description */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              {(() => {
                const tab = TABS.find(t => t.id === activeTab)!;
                const Icon = tab.icon;
                return (
                  <>
                    <Icon size={20} className="text-sky-400" />
                    <div>
                      <h2 className="font-display text-xl font-bold text-white">{tab.label}</h2>
                      <p className="text-sm text-slate-400">{tab.desc}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'banking' && <BankingTab />}
          {activeTab === 'pooling' && <PoolingTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-slate-600">
          <span>FuelEU Maritime Regulation (EU) 2023/1805 — Annex IV</span>
          <span className="font-mono">Articles 20–21 Banking & Pooling</span>
        </div>
      </footer>
    </div>
  );
}
