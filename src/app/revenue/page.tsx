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
    return requestedTab === 'queue' || requestedTab === 'ror' || requestedTab === 'mutations' || requestedTab === 'conflicts' ? requestedTab : 'queue';
  });
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const metrics = getRevenueMetrics();
  const queue = useMemo(() => getRevenueWorkQueue().filter(row => {
    const query = search.toLowerCase();
    return (!query || `${row.parcelId} ${row.issue} ${row.assigned} ${row.source}`.toLowerCase().includes(query)) && (priorityFilter === 'all' || row.priority === priorityFilter);
  }), [priorityFilter, search]);
  const filteredRoR = ROR_RECORDS.filter(r => !search || `${r.ownerName} ${r.khasraNo} ${r.village} ${r.parcelId}`.toLowerCase().includes(search.toLowerCase()));
  const conflicts = CONFLICT_ALERTS.filter(a => ['area_mismatch', 'ownership_conflict', 'boundary_discrepancy', 'tax_default'].includes(a.alertType) && a.status !== 'Resolved');

  return (
    <AppShell>
      <div className="p-5 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="text-[10px] text-amber-400 uppercase tracking-widest font-medium mb-1">Revenue Operations</div>
            <h1 className="font-heading font-bold text-2xl text-white flex items-center gap-2"><FileText size={20} className="text-amber-400" /> Revenue Officer Console</h1>
            <p className="text-sm text-slate-500 mt-1">RoR, mutation, ownership and field verification operations for Raipur district.</p>
          </div>
          <Link href="/map" className="flex items-center gap-1.5 text-xs text-cyan-400 border border-cyan-500/20 rounded-lg px-3 py-2 hover:bg-cyan-500/10"><MapPin size={13} /> Open GIS workspace</Link>
        </div>

        <KpiGrid metrics={metrics} columns={6} />

        <div className="flex flex-wrap items-center gap-1 mt-6 mb-4 border-b border-indigo-950/50 pb-2">
          {([['queue', 'My Work Queue'], ['ror', 'Record of Rights'], ['mutations', 'Mutations'], ['conflicts', 'Conflicts']] as [RevenueTab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 rounded text-xs font-medium ${tab === id ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/25' : 'text-slate-500 hover:text-slate-300'}`}>{label}</button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Search size={13} className="text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parcel, owner, issue" className="form-input text-xs w-52" />
          </div>
        </div>

        {tab === 'queue' && (
          <div className="surface-card overflow-hidden">
            <div className="px-4 py-3 border-b border-indigo-950/40 flex flex-wrap items-center justify-between gap-2">
              <SectionHeader title="My Work Queue" subtitle={`${queue.length} assignments · clicking a task opens Parcel 360 evidence`} />
              <div className="flex gap-1">{['all', 'Critical', 'High', 'Medium'].map(filter => <button key={filter} onClick={() => setPriorityFilter(filter)} className={`px-2 py-1 rounded text-[10px] ${priorityFilter === filter ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{filter}</button>)}</div>
            </div>
            <div className="overflow-x-auto"><table className="data-table min-w-[900px]"><thead><tr><th>Priority</th><th>Parcel</th><th>Issue</th><th>Source</th><th>Assigned</th><th>SLA</th><th>Status</th><th /></tr></thead><tbody>
              {queue.map(row => <tr key={row.id}>
                <td><StatusPill value={row.priority} tone={PRIORITY_TONE[row.priority]} /></td>
                <td><Link href={`/parcels/${row.parcelId}`} className="font-mono text-xs text-cyan-300 hover:underline">{row.parcelId}</Link></td>
                <td><Link href={`/parcels/${row.parcelId}`} className="text-xs text-slate-200 hover:text-white">{row.issue}</Link><div className="text-[10px] text-slate-600 mt-0.5">{row.taskId || 'Alert generated'}</div></td>
                <td className="text-[10px] text-slate-500 max-w-[180px]">{row.source}</td>
                <td><div className="text-xs text-slate-300">{row.assigned}</div><div className="text-[10px] text-slate-600">{row.department}</div></td>
                <td className="min-w-[110px]"><div className={`text-[10px] mb-1 ${row.sla.includes('overdue') ? 'text-red-400' : 'text-slate-500'}`}>{row.sla}</div><ProgressBar value={row.slaPercent} color={row.sla.includes('overdue') ? '#ef4444' : '#f59e0b'} /></td>
                <td><StatusPill value={row.status} tone={STATUS_TONE[row.status]} /></td>
                <td><Link href={`/parcels/${row.parcelId}`} className="text-indigo-400"><ArrowRight size={14} /></Link></td>
              </tr>)}
            </tbody></table></div>
          </div>
        )}

        {tab === 'ror' && <div className="surface-card overflow-auto"><table className="data-table min-w-[850px]"><thead><tr><th>Khasra</th><th>Parcel</th><th>Khata</th><th>Owner</th><th>Village</th><th>Area</th><th>Source</th><th>Verification</th><th /></tr></thead><tbody>{filteredRoR.map(r => <tr key={r.id}><td className="font-mono text-xs">{r.khasraNo}</td><td><Link href={`/parcels/${r.parcelId}`} className="text-xs font-mono text-indigo-400">{r.parcelId}</Link></td><td className="font-mono text-xs text-cyan-300">{r.khataNo}</td><td className="text-xs font-medium">{r.ownerName}</td><td className="text-xs">{r.village}</td><td className="text-xs font-mono">{r.areaAcres} ac</td><td><StatusPill value={r.source} /></td><td>{r.isVerified ? <StatusPill value="Verified" tone="success" /> : <StatusPill value="Needs Review" tone="warning" />}</td><td><Link href={`/parcels/${r.parcelId}`}><ExternalLink size={12} className="text-indigo-400" /></Link></td></tr>)}</tbody></table></div>}

        {tab === 'mutations' && <div className="surface-card overflow-auto"><table className="data-table min-w-[850px]"><thead><tr><th>Mutation</th><th>Parcel</th><th>Date</th><th>Type</th><th>Previous owner</th><th>New owner</th><th>Status</th><th>Remarks</th></tr></thead><tbody>{MUTATIONS.map(m => <tr key={m.id}><td className="font-mono text-xs">{m.mutationNo}</td><td><Link href={`/parcels/${m.parcelId}`} className="text-indigo-400 font-mono text-xs">{m.parcelId}</Link></td><td className="text-xs">{m.mutationDate}</td><td><StatusPill value={m.type} tone="info" /></td><td className="text-xs">{m.previousOwner}</td><td className="text-xs font-medium">{m.newOwner}</td><td><StatusPill value={m.status} tone={m.status === 'Approved' ? 'success' : m.status === 'Pending' ? 'warning' : 'danger'} /></td><td className="text-xs text-slate-600">{m.remarks || '—'}</td></tr>)}</tbody></table></div>}

        {tab === 'conflicts' && <div className="space-y-2">{conflicts.map(alert => <Link key={alert.id} href={`/parcels/${alert.parcelId}`} className="surface-card p-4 flex items-start gap-3 hover:border-indigo-500/35 block"><AlertTriangle size={15} className="text-red-400 mt-0.5" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><StatusPill value={alert.severity.toUpperCase()} tone={alert.severity === 'critical' || alert.severity === 'high' ? 'danger' : 'warning'} /><span className="font-mono text-[10px] text-indigo-400">{alert.parcelId}</span></div><div className="text-sm text-slate-200 mt-1">{alert.title}</div><div className="text-xs text-slate-500 mt-1">{alert.description}</div><div className="text-[10px] text-indigo-400 mt-2">Evidence: {alert.datasetsCompared.join(' · ')}</div></div><ArrowRight size={14} className="text-slate-600" /></Link>)}</div>}

        <div className="mt-4 text-[10px] text-slate-600 flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-500" /> All actions are based on synthetic demonstration records and require officer verification.</div>
      </div>
    </AppShell>
  );
}
