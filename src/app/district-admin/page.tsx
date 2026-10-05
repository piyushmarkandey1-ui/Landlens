'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, Activity, Map } from 'lucide-react';
import Link from 'next/link';
import { DISTRICT_ANALYTICS, CONFLICT_ALERTS, WORKFLOW_TASKS, PARCELS } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CONFLICT_TREND_DATA = [
  { month: 'Jan', conflicts: 145 },
  { month: 'Feb', conflicts: 132 },
  { month: 'Mar', conflicts: 128 },
  { month: 'Apr', conflicts: 119 },
  { month: 'May', conflicts: 124 },
  { month: 'Jun', conflicts: 110 },
];

export default function DistrictAdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'district_admin' && user?.role !== 'system_admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!user || (user.role !== 'district_admin' && user.role !== 'system_admin')) {
    return null;
  }

  const openConflicts = CONFLICT_ALERTS.filter(a => a.status === 'Open' || a.status === 'Under Review');
  const pendingWorkflows = WORKFLOW_TASKS.filter(t => t.status !== 'Resolved');
  const avgResolutionTime = 4.2;

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading font-bold text-4xl text-white mb-2">District Land Governance</h1>
          <p className="text-slate-400">Raipur District • Executive Overview</p>
        </motion.div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-white mb-1">{DISTRICT_ANALYTICS.totalParcels.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Total Parcels</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-red-400 mb-1">{openConflicts.length}</div>
            <div className="text-sm text-slate-400">Active Conflicts</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-amber-400 mb-1">{pendingWorkflows.length}</div>
            <div className="text-sm text-slate-400">Pending Workflows</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-cyan-400 mb-1">{avgResolutionTime} days</div>
            <div className="text-sm text-slate-400">Avg Resolution</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{DISTRICT_ANALYTICS.dataQualityScore}%</div>
            <div className="text-sm text-slate-400">Data Quality</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Conflict Trends */}
          <div className="lg:col-span-2 surface-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="font-heading font-semibold text-white">Conflict Resolution Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={CONFLICT_TREND_DATA}>
                <defs>
                  <linearGradient id="colorConflicts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="conflicts" stroke="#06b6d4" fillOpacity={1} fill="url(#colorConflicts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-violet-400" />
              <h2 className="font-heading font-semibold text-white">Department Performance</h2>
            </div>
            <div className="space-y-4">
              {[
                { dept: 'Revenue', score: 94, color: 'bg-emerald-400' },
                { dept: 'Planning', score: 88, color: 'bg-cyan-400' },
                { dept: 'Registration', score: 91, color: 'bg-violet-400' },
              ].map(item => (
                <div key={item.dept}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{item.dept}</span>
                    <span className="text-sm font-semibold text-white">{item.score}%</span>
                  </div>
                  <div className="score-bar">
                    <div className={`score-bar-fill ${item.color}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Hotspots & Workflow Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Conflict Hotspots */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Map size={18} className="text-red-400" />
                <h2 className="font-heading font-semibold text-white">Conflict Hotspots</h2>
              </div>
              <Link href="/map" className="text-xs text-indigo-400 hover:text-indigo-300">
                View Map →
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { area: 'Amanaka Industrial Area', conflicts: 12, severity: 'high' },
                { area: 'Civil Lines', conflicts: 8, severity: 'medium' },
                { area: 'Telibandha', conflicts: 6, severity: 'medium' },
                { area: 'Pandri', conflicts: 5, severity: 'low' },
                { area: 'Shankar Nagar', conflicts: 4, severity: 'low' },
              ].map(item => (
                <div key={item.area} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40">
                  <div>
                    <div className="text-sm text-slate-300">{item.area}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.conflicts} conflicts</div>
                  </div>
                  <span className={`chip text-[10px] ${
                    item.severity === 'high' ? 'bg-red-500/15 text-red-400' :
                    item.severity === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Status */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-400" />
              <h2 className="font-heading font-semibold text-white">Workflow Status</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg bg-slate-900/40">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {WORKFLOW_TASKS.filter(t => t.status === 'Resolved').length}
                </div>
                <div className="text-xs text-slate-400">Resolved</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-900/40">
                <div className="text-2xl font-bold text-amber-400 mb-1">
                  {WORKFLOW_TASKS.filter(t => t.status === 'In Progress').length}
                </div>
                <div className="text-xs text-slate-400">In Progress</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-900/40">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {WORKFLOW_TASKS.filter(t => t.hoursElapsed > t.slaHours).length}
                </div>
                <div className="text-xs text-slate-400">Overdue</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-900/40">
                <div className="text-2xl font-bold text-violet-400 mb-1">
                  {WORKFLOW_TASKS.filter(t => t.status === 'Escalated').length}
                </div>
                <div className="text-xs text-slate-400">Escalated</div>
              </div>
            </div>
            <Link href="/workflows" className="block text-center text-sm text-indigo-400 hover:text-indigo-300">
              View All Workflows →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
