'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { CONFLICT_ALERTS } from '@/lib/data';
import { SEVERITY_COLORS, ALERT_TYPE_LABELS } from '@/lib/engine';
import { AlertTriangle, Filter, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AlertsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const filtered = CONFLICT_ALERTS.filter(a => {
    const matchSeverity = filter === 'all' || a.severity === filter;
    const matchStatus = statusFilter === 'active'
      ? a.status === 'Open' || a.status === 'Under Review'
      : statusFilter === 'all' || a.status === statusFilter;
    return matchSeverity && matchStatus;
  });

  const counts = {
    critical: CONFLICT_ALERTS.filter(a => a.severity === 'critical' && a.status !== 'Resolved').length,
    high: CONFLICT_ALERTS.filter(a => a.severity === 'high' && a.status !== 'Resolved').length,
    medium: CONFLICT_ALERTS.filter(a => a.severity === 'medium' && a.status !== 'Resolved').length,
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl text-white mb-1 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-400" />
            Conflicts & Alerts
          </h1>
          <p className="text-sm text-slate-500">Land Truth Engine output — cross-dataset conflict detections requiring attention.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Critical', count: counts.critical, color: '#ef4444', filter: 'critical' },
            { label: 'High', count: counts.high, color: '#f97316', filter: 'high' },
            { label: 'Medium', count: counts.medium, color: '#eab308', filter: 'medium' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setFilter(f => f === item.filter ? 'all' : item.filter)}
              className="surface-elevated p-4 text-center hover:border-opacity-50 transition-all"
              style={{ borderColor: filter === item.filter ? item.color + '50' : '' }}
            >
              <div className="font-heading font-bold text-3xl mb-1" style={{ color: item.color }}>{item.count}</div>
              <div className="text-xs text-slate-500">{item.label} Alerts</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg">
            {['active', 'all', 'Resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg">
            {['all', 'critical', 'high', 'medium', 'low'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${filter === s ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-600" />
              No alerts match current filters.
            </div>
          ) : filtered.map(alert => {
            const colors = SEVERITY_COLORS[alert.severity];
            return (
              <div key={alert.id} className={`surface-card p-4 border-l-2 ${alert.severity === 'critical' ? 'border-l-red-500' : alert.severity === 'high' ? 'border-l-orange-500' : alert.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`chip ${colors.badge} text-[10px]`}>{alert.severity.toUpperCase()}</span>
                    <span className="chip bg-slate-700/60 text-slate-400 text-[10px]">{ALERT_TYPE_LABELS[alert.alertType]}</span>
                    <span className="chip bg-slate-800/80 text-slate-500 text-[10px]">{alert.parcelId}</span>
                  </div>
                  <span className={`chip text-[10px] flex-shrink-0 ${alert.status === 'Open' ? 'bg-red-500/15 text-red-400' : alert.status === 'Under Review' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {alert.status}
                  </span>
                </div>

                <h3 className={`font-semibold text-sm mb-1.5 ${colors.text}`}>{alert.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{alert.description}</p>

                {Object.keys(alert.values).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.entries(alert.values).map(([k, v]) => (
                      <div key={k} className="px-2.5 py-1.5 rounded bg-slate-900/60 border border-slate-800/60">
                        <div className="text-[10px] text-slate-600">{k}</div>
                        <div className="text-xs text-slate-300 font-medium">{v}</div>
                      </div>
                    ))}
                    {alert.difference && (
                      <div className="px-2.5 py-1.5 rounded bg-red-500/5 border border-red-500/15 col-span-2">
                        <div className="text-[10px] text-slate-600">Difference</div>
                        <div className="text-xs text-red-400 font-medium">{alert.difference}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-indigo-400">→ {alert.recommendedAction.split('.')[0]}.</div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-slate-600">{alert.detectedDate}</span>
                    <Link href={`/parcels/${alert.parcelId}`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                      View Parcel <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-600">
                  Sources: {alert.datasetsCompared.join(' · ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
