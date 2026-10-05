'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Map, Activity, AlertTriangle, Workflow, MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { getDistrictOperations } from '@/lib/operations';
import { KpiGrid, SectionHeader, StatusPill } from '@/components/OperationalPrimitives';

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    color: '#0f172a',
    fontSize: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  labelStyle: { color: '#64748b', fontWeight: 600 }
};

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const operations = getDistrictOperations();

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
              <BarChart3 size={11} /> Executive District Command
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              District Analytics & Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Raipur district high-level telemetry: cross-departmental conflict throughput, agency SLA benchmarks, and village-level discrepancy hotspots.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <Map size={14} /> Open GIS Workspace
          </Link>
        </div>

        {/* Top 7 Metrics */}
        <KpiGrid metrics={operations.metrics} columns={7} />

        {/* Charts Grid 1 */}
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <SectionHeader
              title="District Monthly Velocity"
              subtitle="Comparison of mutation volume, detected discrepancies, and resolved workflows"
            />
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={operations.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 10 }} />
                  <Line type="monotone" dataKey="mutations" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Mutations Filed" />
                  <Line type="monotone" dataKey="conflicts" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="Conflicts Detected" />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Workflows Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <SectionHeader
              title="Workflow Resolution Funnel"
              subtitle="Systemic transition from automated alert to final legal verification"
            />
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Funnel dataKey="count" data={operations.workflowFunnel} isAnimationActive>
                    <LabelList position="right" fill="#334155" stroke="none" dataKey="stage" fontSize={11} fontWeight={600} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Grid 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <SectionHeader
              title="Agency SLA Performance"
              subtitle="Open task volume vs. overdue assignments across departments"
            />
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operations.departmentPerformance} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis type="category" dataKey="department" width={130} tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 500 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="open" fill="#3b82f6" name="Open Tasks" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="overdue" fill="#ef4444" name="SLA Overdue" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
              {operations.departmentPerformance.map(item => (
                <div key={item.department} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{item.department}</span>
                  <span className="font-mono text-slate-700">{item.averageHours}h avg SLA · {item.resolved} resolved</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <SectionHeader
              title="Discrepancy Hotspot Density"
              subtitle="Village-level concentration from cross-dataset land audit findings"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">
              {operations.heatmap.map(cell => (
                <Link
                  key={cell.village}
                  href={`/map?search=${encodeURIComponent(cell.village)}`}
                  className="rounded-xl border border-slate-200 p-3.5 hover:border-blue-400 hover:shadow-xs transition-all group"
                  style={{ background: `rgba(239,68,68,${Math.max(cell.intensity / 400, 0.04)})` }}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-rose-600" />
                    <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {cell.village}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-xl text-rose-700 mt-2">
                    {cell.conflicts}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {cell.parcels} parcels · {cell.intensity}% density
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Column Bottom Status */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Service requests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <SectionHeader title="Public Service Requests" subtitle="Current citizen certificate state" />
            <div className="space-y-2 mt-2">
              {operations.serviceRequests.map(item => (
                <div key={item.status} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-600 font-medium">{item.status}</span>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <SectionHeader title="Executive Shortcuts" subtitle="Direct access to operational views" />
            <div className="space-y-2 mt-2">
              <Link href="/map" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-800 hover:text-blue-700 transition-colors border border-slate-200/60">
                <Map size={14} className="text-blue-600" /> Inspect Spatial Hotspots on GIS Map
              </Link>
              <Link href="/workflows" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-xs font-semibold text-slate-800 hover:text-amber-800 transition-colors border border-slate-200/60">
                <Workflow size={14} className="text-amber-600" /> Escalate Overdue Inter-Agency Tasks
              </Link>
              <Link href="/alerts" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-xs font-semibold text-slate-800 hover:text-rose-800 transition-colors border border-slate-200/60">
                <AlertTriangle size={14} className="text-rose-600" /> Review Critical Discrepancies
              </Link>
              <Link href="/audit" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition-colors border border-slate-200/60">
                <Activity size={14} className="text-emerald-600" /> Verify System Audit Log Trail
              </Link>
            </div>
          </div>

          {/* Operational posture */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <SectionHeader title="Operational Posture" subtitle="Platform readiness & integrity" />
              <div className="flex items-center gap-2 mb-3 mt-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">Autonomous Monitoring Online</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                All 6 connected datasets are synchronized in the simulated environment. Cross-validation runs deterministically on every mutation and parcel query.
              </p>
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <StatusPill value="ULPIN Active" tone="success" />
              <StatusPill value="Audit Enabled" tone="info" />
              <StatusPill value="Simulated Data" tone="warning" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
