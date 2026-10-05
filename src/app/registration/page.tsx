'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GitMerge, ArrowRight, CheckCircle2, Search, ShieldAlert, MapPin } from 'lucide-react';
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
    return queryTab === 'transactions' || queryTab === 'encumbrances' || queryTab === 'services'
      ? queryTab
      : 'transactions';
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const metrics = getRegistrationMetrics();
  const transactions = useMemo(
    () =>
      getRegistrationTransactions().filter(
        item =>
          !search ||
          `${item.parcelId} ${item.documentNo} ${item.buyer} ${item.seller}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [search]
  );
  const selected = transactions.find(item => item.registrationId === selectedId) || transactions[0];

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/80 mb-2">
              <GitMerge size={11} /> Registration & Stamps Department
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              Registration Officer Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Deed registration validation, encumbrance verification, cross-agency mutation checks, and citizen certificate requests.
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
        <KpiGrid metrics={metrics} columns={5} />

        {/* Tab Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl">
            {(
              [
                ['transactions', 'Transaction & Deed Review'],
                ['encumbrances', 'Encumbrances & Mortgages'],
                ['services', 'Certificate Requests'],
              ] as [RegistrationTab, string][]
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
              placeholder="Search document, parcel, buyer…"
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Tab 1: Transaction Review */}
        {tab === 'transactions' && (
          <div className="grid xl:grid-cols-[1fr_420px] gap-5 items-start">
            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <SectionHeader
                  title="Deed Verification Queue"
                  subtitle={`${transactions.length} deeds requiring title consistency checks`}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Document No.</th>
                      <th className="p-3.5">Parcel</th>
                      <th className="p-3.5">Parties</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Consideration</th>
                      <th className="p-3.5">Deed Area</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(item => (
                      <tr
                        key={item.registrationId}
                        onClick={() => setSelectedId(item.registrationId)}
                        className={`cursor-pointer transition-colors ${
                          selected?.registrationId === item.registrationId
                            ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="p-3.5 font-mono font-bold text-slate-900">{item.documentNo}</td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-blue-600">{item.parcelId}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-900">{item.buyer}</div>
                          <div className="text-[10px] text-slate-400">from {item.seller}</div>
                        </td>
                        <td className="p-3.5 text-slate-500">{item.date}</td>
                        <td className="p-3.5 font-mono text-slate-700 font-medium">
                          ₹{(item.amount / 100000).toFixed(1)}L
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{item.areaAcres} ac</td>
                        <td className="p-3.5">
                          <StatusPill
                            value={item.verificationStatus}
                            tone={verificationTone[item.verificationStatus]}
                          />
                        </td>
                        <td className="p-3.5 text-right">
                          <button className="text-blue-600 hover:text-blue-800">
                            <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Transaction Detail */}
            {selected && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-5 sticky top-6">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider text-purple-600 uppercase">
                      Deed Audit Trail
                    </span>
                    <h2 className="font-heading font-bold text-lg text-slate-900 mt-0.5">
                      {selected.documentNo}
                    </h2>
                    <Link
                      href={`/parcels/${selected.parcelId}`}
                      className="font-mono text-xs font-bold text-blue-600 hover:underline"
                    >
                      Parcel: {selected.parcelId}
                    </Link>
                  </div>
                  <StatusPill
                    value={selected.verificationStatus}
                    tone={verificationTone[selected.verificationStatus]}
                  />
                </div>

                {/* Timeline */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3">
                    Verification Milestones
                  </div>
                  <div className="relative ml-2 border-l border-slate-200 pl-4 space-y-4">
                    {selected.timeline.map((entry, index) => (
                      <div key={`${entry.date}-${entry.title}-${index}`} className="relative">
                        <div
                          className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                            entry.status === 'completed'
                              ? 'bg-emerald-500'
                              : entry.status === 'attention'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">{entry.date}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">
                            {entry.dataset}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 mt-1">{entry.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{entry.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflicts / Attention */}
                {selected.conflicts.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 mb-2">
                      Cross-Agency Discrepancies
                    </div>
                    <div className="space-y-1.5">
                      {selected.conflicts.map(conflict => (
                        <div
                          key={conflict}
                          className="flex gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200"
                        >
                          <ShieldAlert size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{conflict}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/parcels/${selected.parcelId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    Open Comprehensive Parcel 360 <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Encumbrances */}
        {tab === 'encumbrances' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Encumbrance & Mortgage Register (Form 15/16)"
                subtitle="Bank charges, court injunctions, and financial liabilities registered against parcels"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Charge Registration</th>
                    <th className="p-3.5">Parcel ID</th>
                    <th className="p-3.5">Encumbrance Type</th>
                    <th className="p-3.5">Financial Creditor</th>
                    <th className="p-3.5">Claim Amount</th>
                    <th className="p-3.5">Period Covered</th>
                    <th className="p-3.5">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ENCUMBRANCES.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{item.registrationNo}</td>
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${item.parcelId}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {item.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <StatusPill
                          value={item.type}
                          tone={item.type === 'Mortgage' ? 'warning' : 'info'}
                        />
                      </td>
                      <td className="p-3.5 font-medium text-slate-900">{item.creditorName}</td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {item.amount ? `₹${(item.amount / 100000).toFixed(1)}L` : '—'}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {item.startDate} → {item.endDate || 'Ongoing'}
                      </td>
                      <td className="p-3.5">
                        <StatusPill
                          value={item.status}
                          tone={item.status === 'Active' ? 'warning' : 'success'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Citizen Service Requests */}
        {tab === 'services' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Public Certificate & Verification Applications"
                subtitle="Encumbrance certificates (EC), certified deed copies, and title verification requests"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Tracking Number</th>
                    <th className="p-3.5">Citizen Applicant</th>
                    <th className="p-3.5">Service Requested</th>
                    <th className="p-3.5">Parcel</th>
                    <th className="p-3.5">Application Status</th>
                    <th className="p-3.5">Submission Date</th>
                    <th className="p-3.5">SLA Deadline</th>
                    <th className="p-3.5">Assigned Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SERVICE_REQUESTS.filter(
                    item => item.department.includes('Registration') || item.type === 'Encumbrance Certificate'
                  ).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{item.trackingId}</td>
                      <td className="p-3.5 font-medium text-slate-900">{item.citizenName}</td>
                      <td className="p-3.5">
                        <StatusPill value={item.type} tone="info" />
                      </td>
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${item.parcelId}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {item.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <StatusPill
                          value={item.status}
                          tone={item.status === 'Completed' ? 'success' : 'warning'}
                        />
                      </td>
                      <td className="p-3.5 text-slate-500">{item.submittedDate}</td>
                      <td className="p-3.5 text-slate-500">{item.expectedDate}</td>
                      <td className="p-3.5 text-slate-600">{item.assignedOfficer || 'Auto-Allocated'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
          <span>
            Demonstration mode: Deed verification cross-matches Registration e-Panjeeyan data with Revenue Bhuiyan databases.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
