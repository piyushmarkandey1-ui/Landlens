'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ROLE_LABELS } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, Clock, FileText, Workflow,
  Map, BarChart3, Activity, ArrowRight, Database,
  Layers, ArrowUpRight, Sparkles, MapPin,
  ShieldCheck, ChevronRight, TrendingUp, Search
} from 'lucide-react';
import Link from 'next/link';
import {
  CONFLICT_ALERTS, WORKFLOW_TASKS, SERVICE_REQUESTS,
  DISTRICT_ANALYTICS, DATA_SOURCES,
} from '@/lib/data';

/* ─── Animated counter ─── */
function Counter({ value }: { value: string | number }) {
  const numericString = typeof value === 'string' ? value : String(value);
  const num = parseFloat(numericString.replace(/[^0-9.]/g, ''));
  const suffix = typeof value === 'string' ? numericString.replace(/[0-9.,]/g, '') : '';
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isNaN(num) || !spanRef.current) return;
    let raf: number;
    const start = performance.now();
    const duration = 750;
    const update = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const current = Math.round(ease * num);
      if (spanRef.current) spanRef.current.textContent = current.toLocaleString() + suffix;
      if (t < 1) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [num, suffix]);

  return <span ref={spanRef}>{isNaN(num) ? numericString : '0' + suffix}</span>;
}

/* ─── Balanced Minimalist KPI Card ─── */
interface KpiProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  href?: string;
  trend?: string;
  trendUp?: boolean;
}

function KpiCard({ icon, label, value, sub, iconBg, iconColor, href, trend, trendUp }: KpiProps) {
  const content = (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 20px -4px rgba(15,23,42,0.08)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-400/40 transition-colors flex flex-col justify-between h-[115px] group"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 tracking-tight">{label}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold font-display tracking-tight text-slate-900 tabular-nums">
          <Counter value={value} />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              trendUp
                ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-auto pt-1 border-t border-slate-100">
        <span className="truncate">{sub}</span>
        {href && (
          <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        )}
      </div>
    </motion.div>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}

const SEV_MAP: Record<string, { badge: string; dot: string }> = {
  critical: { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  high:     { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  medium:   { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  low:      { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role === 'citizen') router.push('/citizen');
  }, [isAuthenticated, user, router]);

  if (!user || user.role === 'citizen') return null;

  const openAlerts = CONFLICT_ALERTS.filter(a => a.status === 'Open' || a.status === 'Under Review');
  const criticalAlerts = openAlerts.filter(a => a.severity === 'critical');
  const openTasks = WORKFLOW_TASKS.filter(t => t.status === 'Open' || t.status === 'In Progress');
  const overdueTask = WORKFLOW_TASKS.filter(t => t.hoursElapsed > t.slaHours);
  const pendingServices = SERVICE_REQUESTS.filter(s => s.status !== 'Completed' && s.status !== 'Rejected');

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ── Top Command Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                {ROLE_LABELS[user.role]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{user.department ?? 'District Collectorate'}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> Raipur District, CG</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/officer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Lookup Parcel</span>
            </Link>

            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-xs"
            >
              <Map className="w-3.5 h-3.5 text-indigo-200" />
              <span>Live Cadastral GIS</span>
            </Link>
          </div>
        </div>

        {/* ── Critical Conflict Alert Banner ── */}
        <AnimatePresence>
          {criticalAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-xs">
                  <span className="font-bold text-rose-800">
                    {criticalAlerts.length} High-Risk Conflict{criticalAlerts.length > 1 ? 's' : ''} Requiring Review:
                  </span>{' '}
                  <span className="text-rose-700 truncate">
                    {criticalAlerts[0].title} on Parcel #{criticalAlerts[0].parcelId}
                  </span>
                </div>
              </div>
              <Link
                href="/alerts"
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs"
              >
                <span>Investigate</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 4 KPI Stats Grid (Balanced Ratios) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Open Disputes"
            value={openAlerts.length}
            sub={`${criticalAlerts.length} critical severity`}
            trend="+3 today"
            trendUp
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            iconBg="#fef2f2"
            iconColor="#dc2626"
            href="/alerts"
          />
          <KpiCard
            label="Active Workflows"
            value={openTasks.length}
            sub={overdueTask.length > 0 ? `${overdueTask.length} pending SLA` : 'All tasks within SLA'}
            trend={overdueTask.length > 0 ? 'Overdue' : 'On Track'}
            trendUp={overdueTask.length > 0}
            icon={<Workflow className="w-3.5 h-3.5" />}
            iconBg="#fffbeb"
            iconColor="#d97706"
            href="/workflows"
          />
          <KpiCard
            label="Citizen Requests"
            value={pendingServices.length}
            sub="Avg turnaround 2.4 days"
            icon={<FileText className="w-3.5 h-3.5" />}
            iconBg="#eff6ff"
            iconColor="#2563eb"
            href="/workflows"
          />
          <KpiCard
            label="Verified Cadastre"
            value="6.2M"
            sub="70% of 8.9M total district parcels"
            trend="70%"
            trendUp={false}
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            iconBg="#f0fdf4"
            iconColor="#16a34a"
            href="/map"
          />
        </div>

        {/* ── Main Operations Section: 2 Columns (65% / 35%) ── */}
        <div className="grid lg:grid-cols-12 gap-5">

          {/* Left: Conflict Alerts Queue */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-slate-900 font-display">
                  Conflict Queue
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  {openAlerts.length} pending
                </span>
              </div>
              <Link
                href="/alerts"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                <span>View all alerts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {CONFLICT_ALERTS.slice(0, 5).map((alert) => {
                const sev = SEV_MAP[alert.severity] ?? SEV_MAP.low;
                return (
                  <Link
                    key={alert.id}
                    href={`/parcels/${alert.parcelId}`}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sev.dot}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {alert.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="text-slate-600 font-medium">#{alert.parcelId}</span>
                          <span>·</span>
                          <span>Detected: {alert.detectedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${sev.badge} capitalize`}>
                        {alert.severity}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/40 text-center">
              <Link
                href="/alerts"
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
              >
                <span>Open dispute resolution workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right: Connected Data Feeds & Quick Actions */}
          <div className="lg:col-span-4 space-y-5">

            {/* Data Source Registry Health */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-slate-900 font-display">
                    Data Stream Health
                  </span>
                </div>
                <Link href="/data-sources" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                  {DATA_SOURCES.length} Active
                </Link>
              </div>

              <div className="p-2 space-y-1">
                {DATA_SOURCES.slice(0, 5).map((ds) => (
                  <div
                    key={ds.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-medium text-slate-700 truncate">{ds.shortName}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      Sync OK
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Operational Links */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Operational Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/map"
                  className="p-2.5 rounded-lg border border-slate-200/70 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center gap-2 text-slate-700"
                >
                  <Map className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-medium">Cadastral GIS</span>
                </Link>
                <Link
                  href="/workflows"
                  className="p-2.5 rounded-lg border border-slate-200/70 hover:border-amber-300 hover:bg-amber-50/40 transition-colors flex items-center gap-2 text-slate-700"
                >
                  <Workflow className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium">Task Inbox</span>
                </Link>
                <Link
                  href="/analytics"
                  className="p-2.5 rounded-lg border border-slate-200/70 hover:border-cyan-300 hover:bg-cyan-50/40 transition-colors flex items-center gap-2 text-slate-700"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-medium">KPI Reports</span>
                </Link>
                <Link
                  href="/revenue"
                  className="p-2.5 rounded-lg border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors flex items-center gap-2 text-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium">RoR Lineage</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
