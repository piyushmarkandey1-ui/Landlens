'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { ENHANCED_DATA_SOURCES } from '@/lib/adapters';
import { Database, CheckCircle2, AlertTriangle, Clock, XCircle, RefreshCw, ExternalLink, Filter } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  CONNECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SIMULATED: 'bg-amber-50 text-amber-800 border-amber-200',
  UNAVAILABLE: 'bg-rose-50 text-rose-700 border-rose-200',
  STALE: 'bg-orange-50 text-orange-800 border-orange-200',
};

const STATUS_ICONS: Record<string, React.ReactElement> = {
  CONNECTED: <CheckCircle2 size={12} />,
  SIMULATED: <Clock size={12} />,
  UNAVAILABLE: <XCircle size={12} />,
  STALE: <AlertTriangle size={12} />,
};

const CONNECTION_COLOR: Record<string, string> = {
  'Live REST API': 'text-emerald-700',
  'Demo Connector': 'text-amber-800',
  'Batch Import': 'text-orange-800',
  'Planned': 'text-slate-500',
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

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
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
              <Database size={11} /> Federated Registry
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              Data Source Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Connected and federated state and national land administration systems. All records are normalized synthetic demonstration feeds.
            </p>
          </div>
          <a
            href="/api/data-sources"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <ExternalLink size={13} className="text-blue-600" /> JSON API
          </a>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Sources', count: summary.total, color: '#4f46e5', bg: '#eef2ff' },
            { label: 'Connected', count: summary.connected, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Simulated', count: summary.simulated, color: '#d97706', bg: '#fffbeb' },
            { label: 'Stale', count: summary.stale, color: '#ea580c', bg: '#fff7ed' },
            { label: 'Unavailable', count: summary.unavailable, color: '#dc2626', bg: '#fef2f2' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="font-heading font-bold text-2xl mb-0.5" style={{ color: item.color }}>{item.count}</div>
              <div className="text-xs font-medium text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter size={13} className="text-slate-400" />
            <span>Filter Status:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 sm:ml-4">
            <span className="text-xs text-slate-500 font-medium flex items-center">State:</span>
            {states.map(s => (
              <button
                key={s}
                onClick={() => setFilterState(s)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  filterState === s
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Source cards */}
        <div className="space-y-3">
          {filtered.map(ds => (
            <div key={ds.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-blue-400 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold shadow-2xs">
                    {ds.short_name.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-sm text-slate-900">{ds.name}</span>
                      <span className={`chip text-[10px] font-semibold border px-2 py-0.5 rounded-md ${STATUS_STYLES[ds.api_status]}`}>
                        {STATUS_ICONS[ds.api_status]}
                        <span className="ml-1">{ds.api_status}</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{ds.department} · {ds.ministry}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{ds.dataset}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 ${CONNECTION_COLOR[ds.connection_type]}`}>
                    {ds.connection_type}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3.5 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider mb-0.5">State / Scope</div>
                  <div className="text-slate-800 font-medium">{ds.state}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider mb-0.5">Records</div>
                  <div className="text-slate-800 font-mono font-medium">{ds.record_count > 0 ? formatNumber(ds.record_count) : 'Raster Tiles'}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider mb-0.5">Last Synced</div>
                  <div className="text-slate-700 flex items-center gap-1 font-medium">
                    <RefreshCw size={10} className="text-slate-400" />
                    {new Date(ds.last_synced).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider mb-0.5">Freshness</div>
                  <div className="text-slate-800 font-medium">{ds.data_freshness_days === 1 ? 'Daily Sync' : ds.data_freshness_days === 7 ? 'Weekly Sync' : ds.data_freshness_days === 30 ? 'Monthly Sync' : `${ds.data_freshness_days}d cycle`}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider mb-0.5">Schema / Adapter</div>
                  <div className="text-blue-700 font-mono font-semibold">v{ds.schema_version}</div>
                  <div className="text-slate-500 font-mono text-[10px] mt-0.5">{ds.adapter_id}</div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">{ds.description}</div>
              {ds.endpoint_pattern && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Mock Endpoint:</span>
                  <a href={ds.endpoint_pattern.replace(':id', 'P001')} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:text-blue-800 underline">
                    {ds.endpoint_pattern}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold">Architectural Standard:</strong> CONNECTED status is assigned only when an official production agency API endpoint has established an active handshake.
          All demonstration sources currently operate via simulated connectors, state adapters, or scheduled batch mirrors.
          In live deployments, adapter interfaces map each department&apos;s authoritative API schema to the canonical ULPIN cadastre.
        </div>
      </div>
    </AppShell>
  );
}
