'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { KpiMetric } from '@/lib/operations';

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-3">
      <div>
        <h2 className="font-heading font-semibold text-sm text-slate-900">{title}</h2>
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
        <Link key={metric.id} href={metric.href} className="surface-elevated p-3.5 min-w-0 bg-white border border-slate-200/80 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${metric.color}15`, color: metric.color }}>
              <span className="text-sm font-bold">{String(metric.value).length > 5 ? '#' : '•'}</span>
            </div>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="font-heading font-bold text-xl text-slate-900 mt-3 truncate">{metric.value}</div>
          <div className="text-xs text-slate-600 truncate mt-0.5 font-medium">{metric.label}</div>
          <div className="text-[10px] text-slate-400 truncate mt-1">{metric.detail}</div>
        </Link>
      ))}
    </div>
  );
}

export function StatusPill({ value, tone = 'neutral' }: { value: string; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return <span className={`chip text-[10px] font-medium border px-2 py-0.5 rounded-md ${styles[tone]}`}>{value}</span>;
}

export function ProgressBar({ value, color = '#2563eb' }: { value: number; color?: string }) {
  return <div className="score-bar h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60"><div className="score-bar-fill h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(value, 100)}%`, background: color }} /></div>;
}

export function DetailLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">{children}<ChevronRight size={11} /></Link>;
}
