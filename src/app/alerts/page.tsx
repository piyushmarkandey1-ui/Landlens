'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { CONFLICT_ALERTS } from '@/lib/data';
import { ALERT_TYPE_LABELS } from '@/lib/engine';
import { AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SEV_DOT: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#22c55e',
};

const SEV_CHIP: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  high:     { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  medium:   { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  low:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const STATUS_CHIP: Record<string, { bg: string; text: string; border: string }> = {
  Open:          { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Under Review': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Resolved:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize border ${
        active
          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

export default function AlertsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [sev,    setSev]    = useState('all');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const filtered = CONFLICT_ALERTS.filter(a => {
    const okSev    = sev    === 'all' || a.severity === sev;
    const okStatus = status === 'active'
      ? a.status === 'Open' || a.status === 'Under Review'
      : status === 'all' || a.status === status;
    return okSev && okStatus;
  });

  const counts = {
    critical: CONFLICT_ALERTS.filter(a => a.severity === 'critical' && a.status !== 'Resolved').length,
    high:     CONFLICT_ALERTS.filter(a => a.severity === 'high'     && a.status !== 'Resolved').length,
    medium:   CONFLICT_ALERTS.filter(a => a.severity === 'medium'   && a.status !== 'Resolved').length,
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200/80 mb-2">
              <AlertTriangle size={11} /> Cross-Agency Integrity
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              Discrepancies & Conflict Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Land Truth Engine — deterministic cross-dataset discrepancies requiring inter-agency verification.
            </p>
          </div>
          <span className="self-start sm:self-auto chip text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {counts.critical + counts.high + counts.medium} Active Flags
          </span>
        </div>

        {/* Severity Count Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { label: 'Critical Severity', count: counts.critical, sev: 'critical', dot: '#ef4444', bg: 'bg-rose-50/70', border: 'border-rose-200', text: 'text-rose-700' },
            { label: 'High Severity',     count: counts.high,     sev: 'high',     dot: '#f97316', bg: 'bg-orange-50/70', border: 'border-orange-200', text: 'text-orange-800' },
            { label: 'Medium Severity',   count: counts.medium,   sev: 'medium',   dot: '#f59e0b', bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-800' },
          ] as const).map((item, i) => (
            <motion.button
              key={item.label}
              onClick={() => setSev(s => s === item.sev ? 'all' : item.sev)}
              className={`text-left p-5 rounded-2xl border transition-all shadow-xs cursor-pointer ${
                sev === item.sev ? `${item.bg} ${item.border} ring-2 ring-blue-200` : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: item.dot }} />
                <span className={`text-xs font-semibold ${item.text}`}>{item.label}</span>
              </div>
              <div className="font-heading font-bold text-3xl text-slate-900 tracking-tight">
                {item.count}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Active conflicts in queue</div>
            </motion.button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Status:</span>
            {['active', 'all', 'Resolved'].map(s => (
              <FilterPill key={s} label={s === 'active' ? 'Active' : s} active={status === s} onClick={() => setStatus(s)} />
            ))}
          </div>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Severity:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map(s => (
              <FilterPill key={s} label={s} active={sev === s} onClick={() => setSev(s)} />
            ))}
          </div>
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white border border-slate-200/80 rounded-2xl flex flex-col items-center py-16 text-center shadow-xs"
              >
                <CheckCircle2 size={32} className="text-emerald-500 mb-3" />
                <p className="text-sm font-semibold text-slate-900">
                  No alerts match these filters
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting the severity or status filter above.
                </p>
              </motion.div>
            ) : (
              filtered.map((alert, i) => {
                const s   = SEV_CHIP[alert.severity]   ?? SEV_CHIP.low;
                const st  = STATUS_CHIP[alert.status]  ?? STATUS_CHIP.Open;
                const dot = SEV_DOT[alert.severity]    ?? '#94a3b8';

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.03, duration: 0.22 }}
                    className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden hover:border-blue-400 transition-colors"
                    style={{ borderLeft: `4px solid ${dot}` }}
                  >
                    <div className="p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`chip text-[10px] font-semibold px-2 py-0.5 rounded-md border capitalize ${s.bg} ${s.text} ${s.border}`}>
                            {alert.severity}
                          </span>
                          <span className={`chip text-[10px] font-semibold px-2 py-0.5 rounded-md border ${st.bg} ${st.text} ${st.border}`}>
                            {alert.status}
                          </span>
                          <span className="chip text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                            {ALERT_TYPE_LABELS[alert.alertType] ?? alert.alertType}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                          {alert.detectedDate}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {alert.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-4 pt-3.5 border-t border-slate-100 flex-wrap text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Target Parcel:</span>
                          <Link
                            href={`/parcels/${alert.parcelId}`}
                            className="font-mono font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 underline"
                          >
                            {alert.parcelId} <ExternalLink size={11} />
                          </Link>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Sources: <span className="font-medium text-slate-700">{alert.datasetsCompared.join(' · ')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
