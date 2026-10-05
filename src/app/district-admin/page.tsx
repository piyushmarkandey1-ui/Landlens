'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { BarChart3, TrendingUp, AlertTriangle, Activity, Map, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DISTRICT_ANALYTICS, CONFLICT_ALERTS, WORKFLOW_TASKS } from '@/lib/data';
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
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
              <BarChart3 size={11} /> District Command & Analytics
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              District Land Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Raipur District • Inter-agency executive overview, conflict velocity metrics, and cross-departmental resolution queues.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <Map size={14} /> Open GIS Workspace
          </Link>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {[
            { label: 'Total Parcels', val: DISTRICT_ANALYTICS.totalParcels.toLocaleString(), tone: 'text-slate-900', border: 'border-slate-200' },
            { label: 'Active Conflicts', val: openConflicts.length, tone: 'text-rose-600', border: 'border-rose-200/60' },
            { label: 'Pending Workflows', val: pendingWorkflows.length, tone: 'text-amber-600', border: 'border-amber-200/60' },
            { label: 'Avg Resolution', val: `${avgResolutionTime} days`, tone: 'text-blue-600', border: 'border-blue-200/60' },
            { label: 'Data Quality', val: `${DISTRICT_ANALYTICS.dataQualityScore}%`, tone: 'text-emerald-600', border: 'border-emerald-200/60' },
          ].map(k => (
            <div key={k.label} className={`bg-white border ${k.border} p-4 rounded-xl shadow-xs`}>
              <div className={`text-2xl font-bold font-mono ${k.tone} mb-1 tracking-tight`}>{k.val}</div>
              <div className="text-xs font-semibold text-slate-600">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conflict Trends */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                <h2 className="font-heading font-bold text-sm text-slate-900">Conflict Resolution Velocity (6 Months)</h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                -24% Discrepancies
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CONFLICT_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConflicts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}
                  />
                  <Area type="monotone" dataKey="conflicts" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorConflicts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Activity size={18} className="text-blue-600" />
              <h2 className="font-heading font-bold text-sm text-slate-900">Agency SLA Compliance</h2>
            </div>
            <div className="space-y-4">
              {[
                { dept: 'Revenue Department', score: 94, color: '#10b981' },
                { dept: 'Town Planning & RDA', score: 88, color: '#2563eb' },
                { dept: 'Registration & Stamps', score: 91, color: '#8b5cf6' },
                { dept: 'Forest & Environment', score: 82, color: '#f59e0b' },
              ].map(item => (
                <div key={item.dept}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-slate-600 font-medium">{item.dept}</span>
                    <span className="font-mono font-bold text-slate-900">{item.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.score}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Hotspots & Workflow Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Conflict Hotspots */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Map size={18} className="text-rose-600" />
                <h2 className="font-heading font-bold text-sm text-slate-900">High-Density Conflict Zones</h2>
              </div>
              <Link href="/map" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View on Map <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2.5">
              {[
                { area: 'Amanaka Industrial Corridor', conflicts: 12, severity: 'Critical' },
                { area: 'Civil Lines Urban Extension', conflicts: 8, severity: 'High' },
                { area: 'Telibandha Lake Catchment', conflicts: 6, severity: 'Medium' },
                { area: 'Pandri Wholesale Zone', conflicts: 5, severity: 'Low' },
                { area: 'Shankar Nagar Master Buffer', conflicts: 4, severity: 'Low' },
              ].map(item => (
                <div key={item.area} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.area}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.conflicts} active boundary/zoning discrepancies</div>
                  </div>
                  <span className={`chip text-[10px] font-semibold border px-2 py-0.5 rounded-md ${
                    item.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    item.severity === 'High' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    item.severity === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <h2 className="font-heading font-bold text-sm text-slate-900">Inter-Agency Tasks Status</h2>
                </div>
                <Link href="/workflows" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  All Tasks <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="text-2xl font-bold font-mono text-emerald-700 mb-0.5">
                    {WORKFLOW_TASKS.filter(t => t.status === 'Resolved').length}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-800">Resolved</div>
                </div>
                <div className="text-center p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <div className="text-2xl font-bold font-mono text-amber-700 mb-0.5">
                    {WORKFLOW_TASKS.filter(t => t.status === 'In Progress').length}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-800">In Progress</div>
                </div>
                <div className="text-center p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                  <div className="text-2xl font-bold font-mono text-rose-700 mb-0.5">
                    {WORKFLOW_TASKS.filter(t => t.hoursElapsed > t.slaHours).length}
                  </div>
                  <div className="text-[11px] font-semibold text-rose-800">SLA Breach</div>
                </div>
                <div className="text-center p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
                  <div className="text-2xl font-bold font-mono text-purple-700 mb-0.5">
                    {WORKFLOW_TASKS.filter(t => t.status === 'Escalated').length}
                  </div>
                  <div className="text-[11px] font-semibold text-purple-800">Collector Escalation</div>
                </div>
              </div>
            </div>

            <Link
              href="/workflows"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
            >
              Open Inter-Departmental Workflow Engine <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
