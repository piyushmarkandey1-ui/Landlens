'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GitMerge, ArrowRight, CheckCircle2, Search, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { ENCUMBRANCES, SERVICE_REQUESTS } from '@/lib/data';
import { getRegistrationMetrics, getRegistrationTransactions } from '@/lib/operations';
import { KpiGrid, SectionHeader, StatusPill } from '@/components/OperationalPrimitives';

type RegistrationTab = 'transactions' | 'encumbrances' | 'services';
const verificationTone = { Verified: 'success', 'Needs Review': 'warning', Conflict: 'danger' } as const;

export default function RegistrationPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<RegistrationTab>(() => {
    if (typeof window === 'undefined') return 'transactions';
    const queryTab = new URLSearchParams(window.location.search).get('tab');
    return queryTab === 'transactions' || queryTab === 'encumbrances' || queryTab === 'services' ? queryTab : 'transactions';
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const metrics = getRegistrationMetrics();
  const transactions = useMemo(() => getRegistrationTransactions().filter(item => !search || `${item.parcelId} ${item.documentNo} ${item.buyer} ${item.seller}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const selected = transactions.find(item => item.registrationId === selectedId) || transactions[0];

  return (
    <AppShell>
      <div className="p-5 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-5"><div><div className="text-[10px] text-violet-400 uppercase tracking-widest font-medium mb-1">Registration Operations</div><h1 className="font-heading font-bold text-2xl text-white flex items-center gap-2"><GitMerge size={20} className="text-violet-400" /> Registration Officer Console</h1><p className="text-sm text-slate-500 mt-1">Document verification, transaction timelines and encumbrance review.</p></div><Link href="/map" className="flex items-center gap-1.5 text-xs text-cyan-400 border border-cyan-500/20 rounded-lg px-3 py-2">Open GIS workspace</Link></div>
        <KpiGrid metrics={metrics} columns={5} />
        <div className="flex flex-wrap items-center gap-1 mt-6 mb-4 border-b border-indigo-950/50 pb-2">{([['transactions', 'Transaction Review'], ['encumbrances', 'Encumbrances'], ['services', 'Document Requests']] as [RegistrationTab, string][]).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 rounded text-xs font-medium ${tab === id ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/25' : 'text-slate-500 hover:text-slate-300'}`}>{label}</button>)}<div className="ml-auto flex items-center gap-2"><Search size={13} className="text-slate-600" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search document, parcel, buyer" className="form-input text-xs w-56" /></div></div>

        {tab === 'transactions' && <div className="grid xl:grid-cols-[1fr_410px] gap-4"><div className="surface-card overflow-hidden"><div className="px-4 py-3 border-b border-indigo-950/40"><SectionHeader title="Registration Verification Queue" subtitle={`${transactions.length} transaction records · conflicts link to source evidence`} /></div><div className="overflow-x-auto"><table className="data-table min-w-[900px]"><thead><tr><th>Document</th><th>Parcel</th><th>Buyer / Seller</th><th>Date</th><th>Amount</th><th>Area</th><th>Verification</th><th /></tr></thead><tbody>{transactions.map(item => <tr key={item.registrationId} className={selected?.registrationId === item.registrationId ? 'bg-indigo-950/30' : ''}><td className="font-mono text-xs text-cyan-300">{item.documentNo}</td><td><Link href={`/parcels/${item.parcelId}`} className="font-mono text-xs text-indigo-400">{item.parcelId}</Link></td><td><div className="text-xs text-slate-200">{item.buyer}</div><div className="text-[10px] text-slate-600">from {item.seller}</div></td><td className="text-xs">{item.date}</td><td className="font-mono text-xs">₹{(item.amount / 100000).toFixed(1)}L</td><td className="font-mono text-xs">{item.areaAcres} ac</td><td><StatusPill value={item.verificationStatus} tone={verificationTone[item.verificationStatus]} /></td><td><button onClick={() => setSelectedId(item.registrationId)} className="text-indigo-400"><ArrowRight size={14} /></button></td></tr>)}</tbody></table></div></div>{selected && <div className="surface-card p-4 h-fit"><div className="flex items-start justify-between gap-3 mb-4"><div><div className="text-[10px] uppercase tracking-wider text-violet-400">Transaction Timeline</div><h2 className="font-heading font-bold text-lg text-white mt-1">{selected.documentNo}</h2><Link href={`/parcels/${selected.parcelId}`} className="font-mono text-xs text-indigo-400">{selected.parcelId}</Link></div><StatusPill value={selected.verificationStatus} tone={verificationTone[selected.verificationStatus]} /></div><div className="relative ml-2 border-l border-indigo-500/25 pl-5 space-y-5">{selected.timeline.map((entry, index) => <div key={`${entry.date}-${entry.title}-${index}`} className="relative"><div className={`absolute -left-[25px] top-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${entry.status === 'completed' ? 'bg-emerald-400' : entry.status === 'attention' ? 'bg-red-400' : 'bg-amber-400'}`} /><div className="flex items-center gap-2"><span className="font-mono text-[10px] text-slate-600">{entry.date}</span><StatusPill value={entry.dataset} /></div><div className="text-xs font-semibold text-slate-200 mt-1">{entry.title}</div><div className="text-[11px] text-slate-500 mt-0.5">{entry.description}</div></div>)}</div>{selected.conflicts.length > 0 && <div className="mt-4 pt-3 border-t border-slate-800/50"><div className="text-[10px] uppercase tracking-wider text-red-400 mb-2">Verification attention</div>{selected.conflicts.map(conflict => <div key={conflict} className="flex gap-2 text-xs text-slate-400 mb-1"><ShieldAlert size={12} className="text-red-400 flex-shrink-0" />{conflict}</div>)}</div>}<Link href={`/parcels/${selected.parcelId}`} className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg gradient-primary text-white text-xs font-semibold">Open Parcel 360 evidence <ArrowRight size={12} /></Link></div>}</div>}

        {tab === 'encumbrances' && <div className="surface-card overflow-auto"><table className="data-table min-w-[850px]"><thead><tr><th>Registration</th><th>Parcel</th><th>Type</th><th>Creditor</th><th>Amount</th><th>Period</th><th>Status</th></tr></thead><tbody>{ENCUMBRANCES.map(item => <tr key={item.id}><td className="font-mono text-xs">{item.registrationNo}</td><td><Link href={`/parcels/${item.parcelId}`} className="font-mono text-xs text-indigo-400">{item.parcelId}</Link></td><td><StatusPill value={item.type} tone={item.type === 'Mortgage' ? 'warning' : 'info'} /></td><td className="text-xs">{item.creditorName}</td><td className="font-mono text-xs">{item.amount ? `₹${(item.amount / 100000).toFixed(1)}L` : '—'}</td><td className="text-xs">{item.startDate} → {item.endDate || 'open'}</td><td><StatusPill value={item.status} tone={item.status === 'Active' ? 'warning' : 'success'} /></td></tr>)}</tbody></table></div>}
        {tab === 'services' && <div className="surface-card overflow-auto"><table className="data-table min-w-[850px]"><thead><tr><th>Tracking</th><th>Citizen</th><th>Type</th><th>Parcel</th><th>Status</th><th>Submitted</th><th>Expected</th><th>Officer</th></tr></thead><tbody>{SERVICE_REQUESTS.filter(item => item.department.includes('Registration') || item.type === 'Encumbrance Certificate').map(item => <tr key={item.id}><td className="font-mono text-xs text-cyan-300">{item.trackingId}</td><td className="text-xs">{item.citizenName}</td><td><StatusPill value={item.type} tone="info" /></td><td><Link href={`/parcels/${item.parcelId}`} className="font-mono text-xs text-indigo-400">{item.parcelId}</Link></td><td><StatusPill value={item.status} tone={item.status === 'Completed' ? 'success' : 'warning'} /></td><td className="text-xs">{item.submittedDate}</td><td className="text-xs">{item.expectedDate}</td><td className="text-xs text-slate-500">{item.assignedOfficer || 'Unassigned'}</td></tr>)}</tbody></table></div>}
        <div className="mt-4 text-[10px] text-slate-600 flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-500" /> Verification flags are based on synthetic cross-dataset records and require document review.</div>
      </div>
    </AppShell>
  );
}
