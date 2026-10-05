'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { CONFLICT_ALERTS } from '@/lib/data';
import { SEVERITY_COLORS, ALERT_TYPE_LABELS } from '@/lib/engine';
import { AlertTriangle, ExternalLink, CheckCircle2, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SEV_DOT: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#22c55e',
};

const SEV_CHIP: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
  high:     { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  medium:   { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  low:      { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
};

const STATUS_CHIP: Record<string, { bg: string; text: string; border: string }> = {
  Open:          { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
  'Under Review': { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  Resolved:      { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
};

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
      style={{
        background: active ? 'var(--c-indigo-600)' : '#fff',
        color:      active ? '#fff' : 'var(--text-tertiary)',
        border:     `1px solid ${active ? 'var(--c-indigo-600)' : 'var(--border)'}`,
        boxShadow:  active ? 'var(--shadow-indigo)' : 'var(--shadow-xs)',
        transition: 'all var(--duration-fast)',
      }}
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
      <div className="page-container">

        {/* Header */}
        <div className="page-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="font-display font-bold text-2xl"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
              >
                Conflicts & Alerts
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Land Truth Engine — cross-dataset conflict detections requiring attention
              </p>
            </div>
            <span className="chip chip-red mt-1">{counts.critical + counts.high + counts.medium} active</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {([
            { label: 'Critical', count: counts.critical, sev: 'critical', dot: '#ef4444', bg: '#fff1f2', border: '#fecdd3', text: '#9f1239' },
            { label: 'High',     count: counts.high,     sev: 'high',     dot: '#f97316', bg: '#fff7ed', border: '#fed7aa', text: '#9a3412' },
            { label: 'Medium',   count: counts.medium,   sev: 'medium',   dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
          ] as const).map((item, i) => (
            <motion.button
              key={item.label}
              onClick={() => setSev(s => s === item.sev ? 'all' : item.sev)}
              className="card-action text-left p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                borderLeft: sev === item.sev ? `3px solid ${item.dot}` : undefined,
                background: sev === item.sev ? item.bg : '#fff',
                borderColor: sev === item.sev ? item.border : undefined,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: item.dot }} />
                <span className="text-xs font-semibold" style={{ color: item.text }}>{item.label}</span>
              </div>
              <div
                className="font-display font-bold text-3xl"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
              >
                {item.count}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>open alerts</div>
            </motion.button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-label mr-1">Status</span>
            {['active', 'all', 'Resolved'].map(s => (
              <FilterPill key={s} label={s === 'active' ? 'Active' : s} active={status === s} onClick={() => setStatus(s)} />
            ))}
          </div>
          <div className="w-px h-5" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-1.5">
            <span className="text-label mr-1">Severity</span>
            {['all', 'critical', 'high', 'medium', 'low'].map(s => (
              <FilterPill key={s} label={s} active={sev === s} onClick={() => setSev(s)} />
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} alert{filtered.length !== 1 ? 's' : ''} matching current filters
        </p>

        {/* Alert list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card flex flex-col items-center py-16 text-center"
              >
                <CheckCircle2 size={32} style={{ color: 'var(--c-green-500)', marginBottom: 12 }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  No alerts match these filters
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Try adjusting the severity or status filter above
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
                    className="card overflow-hidden"
                    style={{ borderLeft: `3px solid ${dot}` }}
                  >
                    <div className="p-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="chip capitalize"
                            style={{ background: s.bg, color: s.text, borderColor: s.border }}
                          >
                            {alert.severity}
                          </span>
                          <span
                            className="chip"
                            style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)', borderColor: 'var(--border)' }}
                          >
                            {ALERT_TYPE_LABELS[alert.alertType as keyof typeof ALERT_TYPE_LABELS] ?? alert.alertType}
                          </span>
                          <span className="chip chip-slate font-mono text-[10px]">{alert.parcelId}</span>
                        </div>
                        <span
                          className="chip flex-shrink-0"
                          style={{ background: st.bg, color: st.text, borderColor: st.border }}
                        >
                          {alert.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>
                        {alert.title}
                      </h3>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-tertiary)' }}>
                        {alert.description}
                      </p>

                      {/* Values grid */}
                      {Object.keys(alert.values).length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          {Object.entries(alert.values).map(([k, v]) => (
                            <div
                              key={k}
                              className="panel-inset px-3 py-2"
                            >
                              <div className="text-label text-[9px]">{k}</div>
                              <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                                {String(v)}
                              </div>
                            </div>
                          ))}
                          {alert.difference && (
                            <div
                              className="px-3 py-2 rounded-lg col-span-2 sm:col-span-1"
                              style={{ background: 'var(--c-red-50)', border: '1px solid var(--c-red-100)' }}
                            >
                              <div className="text-label text-[9px]">Difference</div>
                              <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--c-red-700)' }}>
                                {alert.difference}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommended action */}
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
                        style={{ background: 'var(--c-indigo-50)', border: '1px solid var(--c-indigo-100)' }}
                      >
                        <span className="text-xs" style={{ color: 'var(--c-indigo-400)' }}>→</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--c-indigo-700)' }}>
                          {alert.recommendedAction.split('.')[0]}.
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          Detected {alert.detectedDate} · {(alert.datasetsCompared as string[]).join(' · ')}
                        </span>
                        <Link
                          href={`/parcels/${alert.parcelId}`}
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: 'var(--c-indigo-600)' }}
                        >
                          View Parcel <ExternalLink size={11} />
                        </Link>
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
