'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Search, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { CONFLICT_ALERTS, MUTATIONS, ROR_RECORDS } from '@/lib/data';
import { getRevenueMetrics, getRevenueWorkQueue } from '@/lib/operations';
import { KpiGrid, ProgressBar, SectionHeader, StatusPill } from '@/components/OperationalPrimitives';

const PRIORITY_TONE = { Critical: 'danger', High: 'danger', Medium: 'warning', Low: 'info' } as const;
const STATUS_TONE = { Open: 'danger', 'In Progress': 'warning', 'Pending Review': 'info', Resolved: 'success', Escalated: 'danger' } as const;

type RevenueTab = 'queue' | 'ror' | 'mutations' | 'conflicts';

export default function RevenuePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<RevenueTab>(() => {
    if (typeof window === 'undefined') return 'queue';
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    return requestedTab === 'queue' || requestedTab === 'ror' || requestedTab === 'mutations' || requestedTab === 'conflicts'
      ? requestedTab
      : 'queue';
  });
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const metrics = getRevenueMetrics();
  const queue = useMemo(
    () =>
      getRevenueWorkQueue().filter(row => {
        const query = search.toLowerCase();
        return (
          (!query || `${row.parcelId} ${row.issue} ${row.assigned} ${row.source}`.toLowerCase().includes(query)) &&
          (priorityFilter === 'all' || row.priority === priorityFilter)
        );
      }),
    [priorityFilter, search]
  );
  const filteredRoR = ROR_RECORDS.filter(
    r => !search || `${r.ownerName} ${r.khasraNo} ${r.village} ${r.parcelId}`.toLowerCase().includes(search.toLowerCase())
  );
  const conflicts = CONFLICT_ALERTS.filter(
    a => ['area_mismatch', 'ownership_conflict', 'boundary_discrepancy', 'tax_default'].includes(a.alertType) && a.status !== 'Resolved'
  );

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/80 mb-2">
              <FileText size={11} /> Revenue & Land Records Department
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              Revenue Officer Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Record of Rights (B-1/P-II), mutation approvals, ownership lineage verification, and physical survey dispatches.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <MapPin size={14} /> Open GIS Workspace
          </Link>
        </div>

        {/* Operational Metrics */}
        <KpiGrid metrics={metrics} columns={6} />

        {/* Tab Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl">
            {(
              [
                ['queue', 'My Work Queue'],
                ['ror', 'Record of Rights (RoR)'],
                ['mutations', 'Mutation Registry'],
                ['conflicts', 'Ownership Conflicts'],
              ] as [RevenueTab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search parcel, owner, issue…"
              className="w-full sm:w-60 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Tab 1: Queue */}
        {tab === 'queue' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <SectionHeader
                title="Active Revenue Work Queue"
                subtitle={`${queue.length} pending verification assignments`}
              />
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-[10px] font-semibold">
                {['all', 'Critical', 'High', 'Medium'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setPriorityFilter(filter)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      priorityFilter === filter ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter === 'all' ? 'All Priorities' : filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Parcel ID</th>
                    <th className="p-3.5">Issue Description</th>
                    <th className="p-3.5">Evidence Source</th>
                    <th className="p-3.5">Assigned Officer</th>
                    <th className="p-3.5">SLA Timeline</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queue.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <StatusPill value={row.priority} tone={PRIORITY_TONE[row.priority]} />
                      </td>
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${row.parcelId}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {row.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${row.parcelId}`}
                          className="font-medium text-slate-900 hover:text-blue-600 block transition-colors"
                        >
                          {row.issue}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {row.taskId || 'Automated Alert'}
                        </div>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-500 max-w-[180px] truncate">{row.source}</td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{row.assigned}</div>
                        <div className="text-[10px] text-slate-400">{row.department}</div>
                      </td>
                      <td className="p-3.5 min-w-[120px]">
                        <div
                          className={`text-[10px] font-semibold mb-1 ${
                            row.sla.includes('overdue') ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          {row.sla}
                        </div>
                        <ProgressBar
                          value={row.slaPercent}
                          color={row.sla.includes('overdue') ? '#ef4444' : '#f59e0b'}
                        />
                      </td>
                      <td className="p-3.5">
                        <StatusPill value={row.status} tone={STATUS_TONE[row.status]} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/parcels/${row.parcelId}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Inspect <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: RoR Records */}
        {tab === 'ror' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Bhuiyan Digital Land Records (B-1 / P-II)"
                subtitle="Synchronized with State Land Records Portal with cryptographic hash matching"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Khasra No.</th>
                    <th className="p-3.5">Parcel ID</th>
                    <th className="p-3.5">Khata</th>
                    <th className="p-3.5">Recorded Owner</th>
                    <th className="p-3.5">Village / Tehsil</th>
                    <th className="p-3.5">Recorded Area</th>
                    <th className="p-3.5">Integration Source</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoR.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{r.khasraNo}</td>
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${r.parcelId}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {r.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{r.khataNo}</td>
                      <td className="p-3.5 font-medium text-slate-900">{r.ownerName}</td>
                      <td className="p-3.5 text-slate-600">{r.village}</td>
                      <td className="p-3.5 font-mono text-slate-700">{r.areaAcres} ac</td>
                      <td className="p-3.5">
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                          {r.source}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {r.isVerified ? (
                          <StatusPill value="Verified" tone="success" />
                        ) : (
                          <StatusPill value="Needs Review" tone="warning" />
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/parcels/${r.parcelId}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Mutations */}
        {tab === 'mutations' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Mutation Tracking (Namantaran)"
                subtitle="Title transfer lineage, succession filings, and contested partition notices"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Mutation No.</th>
                    <th className="p-3.5">Parcel</th>
                    <th className="p-3.5">Order Date</th>
                    <th className="p-3.5">Transfer Type</th>
                    <th className="p-3.5">Previous Titleholder</th>
                    <th className="p-3.5">New Titleholder</th>
                    <th className="p-3.5">Legal Status</th>
                    <th className="p-3.5">Remarks / Objections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MUTATIONS.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{m.mutationNo}</td>
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${m.parcelId}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {m.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5 text-slate-500">{m.mutationDate}</td>
                      <td className="p-3.5">
                        <StatusPill value={m.type} tone="info" />
                      </td>
                      <td className="p-3.5 text-slate-600">{m.previousOwner}</td>
                      <td className="p-3.5 font-medium text-slate-900">{m.newOwner}</td>
                      <td className="p-3.5">
                        <StatusPill
                          value={m.status}
                          tone={m.status === 'Approved' ? 'success' : m.status === 'Pending' ? 'warning' : 'danger'}
                        />
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-[200px] truncate">{m.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Conflicts */}
        {tab === 'conflicts' && (
          <div className="space-y-3">
            {conflicts.map(alert => (
              <Link
                key={alert.id}
                href={`/parcels/${alert.parcelId}`}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 flex items-start gap-4 transition-all shadow-2xs hover:shadow-xs group block"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusPill
                      value={alert.severity.toUpperCase()}
                      tone={alert.severity === 'critical' || alert.severity === 'high' ? 'danger' : 'warning'}
                    />
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {alert.parcelId}
                    </span>
                    <span className="text-[11px] text-slate-400">· Alert ID: {alert.id}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {alert.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.description}</div>
                  <div className="text-[11px] text-blue-600 font-medium mt-2">
                    Evidence Datasets: {alert.datasetsCompared.join(' · ')}
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors self-center" />
              </Link>
            ))}
          </div>
        )}

        {/* Audit footer */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
          <span>
            Demonstration mode: Revenue mutations and title changes are logged in the immutable audit trail.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
