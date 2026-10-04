'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, Clock, FileText, Workflow,
  Map, BarChart3, TrendingUp, Activity, ArrowRight, Zap,
  Database, Users, Layers
} from 'lucide-react';
import Link from 'next/link';
import { CONFLICT_ALERTS, WORKFLOW_TASKS, SERVICE_REQUESTS, DISTRICT_ANALYTICS, PARCELS, DATA_SOURCES } from '@/lib/data';
import { ROLE_LABELS } from '@/lib/auth';

function StatCard({ icon, label, value, sub, color, href }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; href?: string }) {
  const content = (
    <div className="surface-elevated p-4 hover:border-indigo-500/25 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        {href && <ArrowRight size={13} className="text-slate-700 mt-1" />}
      </div>
      <div className="font-heading font-bold text-2xl text-white mb-0.5">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs text-slate-500 mb-1">Welcome back,</div>
            <h1 className="font-heading font-bold text-2xl text-white">{user.name}</h1>
            <div className="text-sm text-slate-500">{ROLE_LABELS[user.role]} · {user.department} · Raipur, Chhattisgarh</div>
          </motion.div>
        </div>

        {/* Critical Alert Banner */}
        {criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/25 flex items-center gap-3"
          >
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-400 font-semibold text-sm">{criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Attention — </span>
              <span className="text-slate-400 text-sm">{criticalAlerts[0].title}</span>
            </div>
            <Link href="/alerts" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              View <ArrowRight size={11} />
            </Link>
          </motion.div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<AlertTriangle size={16} />} label="Open Conflicts" value={openAlerts.length} sub={`${criticalAlerts.length} critical`} color="#ef4444" href="/alerts" />
          <StatCard icon={<Workflow size={16} />} label="Active Workflows" value={openTasks.length} sub={`${overdueTask.length} overdue`} color="#f59e0b" href="/workflows" />
          <StatCard icon={<FileText size={16} />} label="Pending Services" value={pendingServices.length} sub="citizen requests" color="#6366f1" href="/workflows" />
          <StatCard icon={<CheckCircle2 size={16} />} label="Verified Parcels" value="6.23M" sub="of 8.9M total" color="#10b981" href="/map" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <div className="lg:col-span-2">
            <div className="surface-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-400" />
                  <span className="font-heading font-semibold text-white text-sm">Recent Conflict Alerts</span>
                </div>
                <Link href="/alerts" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all <ArrowRight size={11} /></Link>
              </div>
              <div className="space-y-2">
                {CONFLICT_ALERTS.slice(0, 5).map(alert => (
                  <Link
                    key={alert.id}
                    href={`/parcels/${alert.parcelId}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/40 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-400' : alert.severity === 'high' ? 'bg-orange-400' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-300 font-medium truncate">{alert.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{alert.parcelId} · {alert.detectedDate}</div>
                    </div>
                    <span className={`chip text-[10px] flex-shrink-0 ${alert.status === 'Open' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                      {alert.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Data Health */}
            <div className="surface-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database size={13} className="text-cyan-400" />
                <span className="font-semibold text-sm text-white">Data Sources</span>
              </div>
              <div className="space-y-2">
                {DATA_SOURCES.slice(0, 5).map(ds => (
                  <div key={ds.id} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 truncate pr-2">{ds.shortName}</span>
                    <span className={`chip text-[9px] ${ds.status === 'Simulated' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                      {ds.status}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/data-sources" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-3">
                All {DATA_SOURCES.length} sources <ArrowRight size={10} />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="surface-card p-4">
              <div className="text-sm font-semibold text-white mb-3">Quick Actions</div>
              <div className="space-y-1.5">
                {[
                  { label: 'Open GIS Map', icon: <Map size={13} />, href: '/map' },
                  { label: 'View Conflict Alerts', icon: <AlertTriangle size={13} />, href: '/alerts' },
                  { label: 'Workflow Inbox', icon: <Workflow size={13} />, href: '/workflows' },
                  { label: 'District Analytics', icon: <BarChart3 size={13} />, href: '/analytics' },
                  { label: 'Technical Architecture', icon: <Layers size={13} />, href: '/technical-architecture' },
                ].map(action => (
                  <Link key={action.label} href={action.href} className="nav-item">
                    {action.icon}
                    <span className="text-xs">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* District Summary */}
        <div className="mt-6 surface-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-indigo-400" />
            <span className="font-heading font-semibold text-white text-sm">District Overview — Raipur</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {[
              { label: 'Total Parcels', value: '8.9M' },
              { label: 'Conflicts', value: '1,24,000' },
              { label: 'Pending Mutations', value: '42,300' },
              { label: 'Tax Defaulters', value: '28,000' },
              { label: 'Data Quality', value: `${DISTRICT_ANALYTICS.dataQualityScore}%` },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="font-heading font-bold text-xl text-white">{item.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
