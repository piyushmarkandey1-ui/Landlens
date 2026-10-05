'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { ENHANCED_DATA_SOURCES } from '@/lib/adapters';
import { Database, CheckCircle2, AlertTriangle, Clock, XCircle, RefreshCw, ExternalLink, Filter } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  CONNECTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  SIMULATED: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  UNAVAILABLE: 'bg-red-500/15 text-red-400 border-red-500/25',
  STALE: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
};

const STATUS_ICONS: Record<string, React.ReactElement> = {
  CONNECTED: <CheckCircle2 size={12} />,
  SIMULATED: <Clock size={12} />,
  UNAVAILABLE: <XCircle size={12} />,
  STALE: <AlertTriangle size={12} />,
};

const CONNECTION_COLOR: Record<string, string> = {
  'Live REST API': 'text-emerald-400',
  'Demo Connector': 'text-amber-400',
  'Batch Import': 'text-orange-400',
  'Planned': 'text-slate-500',
};

export default function DataSourcesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [filterState, setFilterState] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const states = ['All', 'National', ...Array.from(new Set(ENHANCED_DATA_SOURCES.map(d => d.state).filter(s => s !== 'National'))).sort()];
  const statuses = ['All', 'CONNECTED', 'SIMULATED', 'STALE', 'UNAVAILABLE'];

  const filtered = ENHANCED_DATA_SOURCES.filter(ds => {
    if (filterState !== 'All' && ds.state !== filterState) return false;
    if (filterStatus !== 'All' && ds.api_status !== filterStatus) return false;
    return true;
  });

  const summary = {
    total: ENHANCED_DATA_SOURCES.length,
    connected: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'CONNECTED').length,
    simulated: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'SIMULATED').length,
    stale: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'STALE').length,
    unavailable: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'UNAVAILABLE').length,
  };

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-2xl text-white mb-1 flex items-center gap-2">
              <Database size={20} className="text-cyan-400" />
              Data Source Registry
            </h1>
            <p className="text-sm text-slate-500">
              Connected and planned government data systems. All records are synthetic demonstration data.
            </p>
          </div>
          <a
            href="/api/data-sources"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-300 text-xs hover:bg-indigo-500/10 transition-colors"
          >
            <ExternalLink size={11} /> JSON API
          </a>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Sources', count: summary.total, color: '#6366f1' },
            { label: 'Connected', count: summary.connected, color: '#10b981' },
            { label: 'Simulated', count: summary.simulated, color: '#f59e0b' },
            { label: 'Stale', count: summary.stale, color: '#f97316' },
            { label: 'Unavailable', count: summary.unavailable, color: '#ef4444' },
          ].map(item => (
            <div key={item.label} className="surface-elevated p-4">
              <div className="font-heading font-bold text-2xl mb-0.5" style={{ color: item.color }}>{item.count}</div>
              <div className="text-xs text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-500" />
            <span className="text-xs text-slate-500">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1 rounded-lg border transition-all ${filterStatus === s ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-slate-700/40 text-slate-500 hover:text-slate-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 ml-2">
            {states.map(s => (
              <button
                key={s}
                onClick={() => setFilterState(s)}
                className={`text-xs px-3 py-1 rounded-lg border transition-all ${filterState === s ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'border-slate-700/40 text-slate-500 hover:text-slate-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Source cards */}
        <div className="space-y-3">
          {filtered.map(ds => (
            <div key={ds.id} className="surface-card p-4 hover:border-indigo-500/20 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold">
                    {ds.short_name.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white">{ds.name}</span>
                      <span className={`chip text-[10px] ${STATUS_STYLES[ds.api_status]}`}>
                        {STATUS_ICONS[ds.api_status]}
                        <span className="ml-1">{ds.api_status}</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{ds.department} · {ds.ministry}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{ds.dataset}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className={`flex items-center gap-1 text-xs font-medium ${CONNECTION_COLOR[ds.connection_type]}`}>
                    {ds.connection_type}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-800/40 text-[11px]">
                <div>
                  <div className="text-slate-600 uppercase mb-0.5 text-[10px]">State/Coverage</div>
                  <div className="text-slate-400">{ds.state}</div>
                </div>
                <div>
                  <div className="text-slate-600 uppercase mb-0.5 text-[10px]">Records</div>
                  <div className="text-slate-400 font-mono">{ds.record_count > 0 ? ds.record_count.toLocaleString() : 'Raster'}</div>
                </div>
                <div>
                  <div className="text-slate-600 uppercase mb-0.5 text-[10px]">Last Synced</div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <RefreshCw size={9} className="text-slate-600" />
                    {new Date(ds.last_synced).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 uppercase mb-0.5 text-[10px]">Freshness</div>
                  <div className="text-slate-400">{ds.data_freshness_days === 1 ? 'Daily' : ds.data_freshness_days === 7 ? 'Weekly' : ds.data_freshness_days === 30 ? 'Monthly' : `${ds.data_freshness_days}d`}</div>
                </div>
                <div>
                  <div className="text-slate-600 uppercase mb-0.5 text-[10px]">Schema / Adapter</div>
                  <div className="text-slate-400 font-mono">v{ds.schema_version}</div>
                  <div className="text-amber-400/70 font-mono text-[10px] mt-0.5">{ds.adapter_id}</div>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-600">{ds.description}</div>
              {ds.endpoint_pattern && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                  <span className="text-slate-700">Mock endpoint:</span>
                  <a href={ds.endpoint_pattern.replace(':id', 'P001')} target="_blank" rel="noopener noreferrer" className="font-mono text-indigo-500/70 hover:text-indigo-400 transition-colors">
                    {ds.endpoint_pattern}
                  </a>
                </div>
              )}
              <div className="mt-1 text-[10px] text-slate-700 italic">{ds.notes}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400/80">
          <strong>Note:</strong> CONNECTED status will only be set when a real government API is live and verified.
          All current sources are SIMULATED (demo connector), STALE (outdated batch import), or UNAVAILABLE (planned).
          In production, adapter interfaces connect to each department's actual API or secure database export.
        </div>
      </div>
    </AppShell>
  );
}
