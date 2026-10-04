'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { KpiMetric } from '@/lib/operations';

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-3">
      <div>
        <h2 className="font-heading font-semibold text-sm text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function KpiGrid({ metrics, columns = 3 }: { metrics: KpiMetric[]; columns?: 3 | 4 | 5 | 6 | 7 }) {
  const grid = columns === 7 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7' : columns === 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : columns === 5 ? 'grid-cols-2 md:grid-cols-5' : columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3';
  return (
    <div className={`grid ${grid} gap-3`}>
      {metrics.map(metric => (
        <Link key={metric.id} href={metric.href} className="surface-elevated p-3.5 min-w-0 hover:border-indigo-500/35 transition-colors group">
          <div className="flex items-start justify-between gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${metric.color}18`, color: metric.color }}>
              <span className="text-sm font-bold">{String(metric.value).length > 5 ? '#' : '•'}</span>
            </div>
            <ArrowUpRight size={13} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="font-heading font-bold text-xl text-white mt-3 truncate">{metric.value}</div>
          <div className="text-xs text-slate-400 truncate mt-0.5">{metric.label}</div>
          <div className="text-[10px] text-slate-600 truncate mt-1">{metric.detail}</div>
        </Link>
      ))}
    </div>
  );
}

export function StatusPill({ value, tone = 'neutral' }: { value: string; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  const styles = {
    success: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/12 text-red-400 border-red-500/20',
    info: 'bg-cyan-500/12 text-cyan-400 border-cyan-500/20',
    neutral: 'bg-slate-700/60 text-slate-400 border-slate-700',
  };
  return <span className={`chip text-[9px] border ${styles[tone]}`}>{value}</span>;
}

export function ProgressBar({ value, color = '#6366f1' }: { value: number; color?: string }) {
  return <div className="score-bar"><div className="score-bar-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} /></div>;
}

export function DetailLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">{children}<ChevronRight size={11} /></Link>;
}
