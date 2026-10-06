'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AppShell from '@/components/AppShell';
import AIAssistant from '@/components/AIAssistant';
import { useAuth } from '@/lib/auth';
import { parcelTruthEngine } from '@/lib/intelligence';
import {
  PARCELS, OWNERS, ROR_RECORDS, REGISTRATIONS, MUTATIONS,
  ZONING_RECORDS, BUILDING_PERMISSIONS, ENCUMBRANCES, TAX_RECORDS,
  LITIGATIONS, VALUATIONS, SATELLITE_CHANGES
} from '@/lib/data';
import {
  AlertTriangle, CheckCircle2, Clock, Minus, MapPin, ArrowLeft,
  FileText, GitMerge, Building2, DollarSign, Satellite, Scale,
  ChevronDown, ChevronRight, Map as MapIcon, Workflow
} from 'lucide-react';
import Link from 'next/link';
import { ProgressBar, StatusPill } from '@/components/OperationalPrimitives';

function HealthBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    Verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Needs Review': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    Conflict: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    Unavailable: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  };
  const current = styles[status] || styles.Unavailable;
  const icons = {
    Verified: <CheckCircle2 size={11} />,
    'Needs Review': <Clock size={11} />,
    Conflict: <AlertTriangle size={11} />,
    Unavailable: <Minus size={11} />,
  }[status];

  return (
    <span className={`chip text-[10px] font-semibold border px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${current.bg} ${current.text} ${current.border}`}>
      {icons}
      {status}
    </span>
  );
}

function FindingStyle({ severity }: { severity: string }) {
  const styles: Record<string, { text: string; bg: string; border: string; badge: string }> = {
    CRITICAL: { text: 'text-rose-700', bg: 'bg-rose-50/70', border: 'border-rose-200', badge: 'bg-rose-600 text-white' },
    HIGH: { text: 'text-amber-800', bg: 'bg-amber-50/70', border: 'border-amber-200', badge: 'bg-amber-600 text-white' },
    MEDIUM: { text: 'text-amber-800', bg: 'bg-amber-50/50', border: 'border-amber-200', badge: 'bg-amber-500 text-white' },
    LOW: { text: 'text-blue-700', bg: 'bg-blue-50/70', border: 'border-blue-200', badge: 'bg-blue-600 text-white' },
  };
  return styles[severity] || styles.LOW;
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl mb-4 overflow-hidden shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 font-heading">
          <span className="text-blue-600">{icon}</span>
          {title}
        </div>
        {open ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-xs text-slate-500 flex-shrink-0 w-40">{label}</span>
      <span className={`text-xs text-right ${mono ? 'font-mono text-blue-700 font-semibold' : 'text-slate-800 font-medium'} flex-1`}>{value}</span>
    </div>
  );
}

export default function Parcel360Page() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-500 max-w-lg mx-auto">
          <p className="text-base font-semibold text-slate-800">Parcel &quot;{id}&quot; not found</p>
          <p className="text-xs text-slate-500 mt-1">Please verify the parcel ID or search in the unified cadastre.</p>
          <Link href="/officer" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 underline">
            ← Back to Parcel Search
          </Link>
        </div>
      </AppShell>
    );
  }

  const owners = OWNERS.filter(o => o.parcelId === id);
  const ror = ROR_RECORDS.find(r => r.parcelId === id);
  const registrations = REGISTRATIONS.filter(r => r.parcelId === id);
  const mutations = MUTATIONS.filter(m => m.parcelId === id);
  const zoning = ZONING_RECORDS.find(z => z.parcelId === id);
  const permissions = BUILDING_PERMISSIONS.filter(b => b.parcelId === id);
  const encumbrances = ENCUMBRANCES.filter(e => e.parcelId === id);
  const tax = TAX_RECORDS.find(t => t.parcelId === id);
  const litigations = LITIGATIONS.filter(l => l.parcelId === id);
  const valuation = VALUATIONS.find(v => v.parcelId === id);
  const satChanges = SATELLITE_CHANGES.filter(s => s.parcelId === id);
  const truth = parcelTruthEngine.analyze(id);

  if (!truth) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-500 max-w-lg mx-auto">
          <p className="text-base font-semibold text-slate-800">Intelligence engine data unavailable</p>
          <Link href="/map" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700">
            ← Back to GIS Map
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/officer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={14} /> Back to Parcel Search
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all shadow-2xs"
          >
            <MapIcon size={13} /> View on GIS Map
          </Link>
        </div>

        {/* Parcel Header Bar */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                  ULPIN: {parcel.ulpin}
                </span>
                <span className="text-xs text-slate-500">• {parcel.village}, Raipur</span>
              </div>
              <h1 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">
                Parcel {parcel.id}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin size={13} className="text-blue-600 flex-shrink-0" />
                <span>{parcel.address}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`chip text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                parcel.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : parcel.status === 'Disputed'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : parcel.status === 'Restricted'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {parcel.status}
              </span>
              <span className="chip text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {parcel.landUse}
              </span>
              <span className="chip text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                {parcel.areaAcres} Acres ({parcel.area.toLocaleString()} sqm)
              </span>
            </div>
          </div>
        </motion.div>

        {/* Land Truth Engine Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl border shadow-xs ${
            truth.summary.conflictCategories > 0
              ? 'bg-rose-50/50 border-rose-200'
              : truth.summary.reviewCategories > 0
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-emerald-50/50 border-emerald-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
              truth.summary.conflictCategories > 0
                ? 'bg-rose-100 text-rose-700'
                : truth.summary.reviewCategories > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {truth.summary.issuesDetected > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading font-bold text-slate-900 text-sm">Land Truth Engine</span>
                <span className="chip text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  Deterministic Multi-Agency Screening
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {truth.summary.issuesDetected > 0
                  ? `${truth.summary.issuesDetected} conflict or discrepancy finding${truth.summary.issuesDetected === 1 ? '' : 's'} flagged across connected registries. Review source evidence below.`
                  : 'Zero discrepancy findings detected. All records match across Revenue, Cadastral GIS, DORIS, and RDA.'}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">Rules evaluated: <strong className="text-slate-800 font-semibold">{truth.summary.rulesEvaluated}</strong></span>
                <span className="text-slate-500">Datasets cross-checked: <strong className="text-slate-800 font-semibold">{truth.summary.datasetsCompared}</strong></span>
                <span className={truth.summary.issuesDetected > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                  Discrepancies: <strong>{truth.summary.issuesDetected}</strong>
                </span>
                <span className="text-slate-500">Evidence records: <strong className="text-slate-800 font-semibold">{truth.summary.evidenceRecords}</strong></span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2-Column Main Workspace */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Core Registries & Satellite */}
          <div className="lg:col-span-2 space-y-4">

            {/* Data Health Grid */}
            <Section title="Multi-Agency Data Health" icon={<CheckCircle2 size={16} />}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {truth.consistency.map(item => (
                  <div key={item.category} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-slate-500 mb-1.5">{item.category}</span>
                    <HealthBadge status={item.status} />
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                Statuses reflect real-time cross-verification against RoR, DORIS deeds, Bhu-Naksha, and RDA master plans.
              </div>
            </Section>

            {/* Satellite & AI Change Detection */}
            <Section title="Satellite & AI Temporal Change Detection" icon={<Satellite size={16} />}>
              <div className="space-y-3">
                <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl flex items-start gap-3">
                  <Satellite size={16} className="text-cyan-700 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <div className="font-semibold text-cyan-900">ISRO Bhuvan / Cartosat-3 Automated Screening</div>
                    <div className="text-cyan-700 mt-0.5">
                      High-resolution 0.5m orthophoto delta comparison against approved building permissions and agricultural zoning.
                    </div>
                  </div>
                </div>

                {satChanges.length > 0 ? (
                  <div className="space-y-2.5">
                    {satChanges.map(sc => (
                      <div key={sc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-900">{sc.changeType}</span>
                          <StatusPill
                            value={sc.verificationStatus}
                            tone={sc.verificationStatus === 'Verified' ? 'success' : sc.verificationStatus === 'Pending' ? 'warning' : 'neutral'}
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 mb-2">
                          <div><span className="text-slate-400 text-[10px] block">Detected Date</span>{sc.detectedDate}</div>
                          <div><span className="text-slate-400 text-[10px] block">Affected Area</span>{sc.area ? `${sc.area} sqm` : '—'}</div>
                          <div className="col-span-2">
                            <span className="text-slate-400 text-[10px] block">Detection Confidence ({sc.confidence}%)</span>
                            <div className="mt-1">
                              <ProgressBar value={sc.confidence} color={sc.confidence >= 80 ? '#059669' : '#d97706'} />
                            </div>
                          </div>
                        </div>
                        {sc.requiresVerification && (
                          <p className="text-[11px] text-amber-700 pt-2 border-t border-slate-200">
                            Requires on-ground field inspection verification. Status: {sc.verificationStatus}.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    <CheckCircle2 size={16} className="text-emerald-600 mx-auto mb-1.5" />
                    No unauthorised structural or land cover alterations flagged by multi-temporal satellite screening.
                  </div>
                )}
              </div>
            </Section>

            {/* Parcel Identity Details */}
            <Section title="Cadastral Identity" icon={<MapPin size={16} />}>
              <div className="divide-y divide-slate-100">
                <InfoRow label="ULPIN" value={parcel.ulpin} mono />
                <InfoRow label="Khasra Number" value={parcel.khasraNo} mono />
                <InfoRow label="Survey Reference" value={parcel.surveyNo} mono />
                <InfoRow label="Registered Area" value={`${parcel.areaAcres} Acres (${parcel.area.toLocaleString()} sqm)`} />
                <InfoRow label="Land Classification" value={parcel.landUse} />
                <InfoRow label="Master Plan Zone" value={parcel.zoning} />
                <InfoRow label="Revenue Tehsil" value={parcel.tehsil} />
                <InfoRow label="District / State" value={`${parcel.district}, ${parcel.state}`} />
              </div>
            </Section>

            {/* Record of Rights (RoR) */}
            <Section title="Record of Rights (B-1 / P-II)" icon={<FileText size={16} />}>
              {ror ? (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-100">
                    <InfoRow label="Owner Name" value={ror.ownerName} />
                    <InfoRow label="Father / Husband Name" value={owners.find(o => o.parcelId === id)?.fatherName || '—'} />
                    <InfoRow label="Khatauni Number" value={ror.khatabiNo || ror.khataNo} mono />
                    <InfoRow label="Khasra Number" value={ror.khasraNo} mono />
                    <InfoRow label="RoR Recorded Area" value={`${ror.area} sqm (${(ror.area / 4046.86).toFixed(2)} acres)`} />
                    <InfoRow label="Land Type" value={ror.landType} />
                    <InfoRow label="Tenancy Type" value={ror.cultivatorName ? `Cultivator: ${ror.cultivatorName}` : 'Self Cultivated'} />
                    <InfoRow label="Last Mutation Number" value={mutations[0]?.mutationNo || '—'} mono />
                    <InfoRow label="RoR Sync Timestamp" value={ror.lastUpdated} />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">No RoR record found in database.</div>
              )}
            </Section>

            {/* Ownership Chain */}
            <Section title={`Registered Owners (${owners.length})`} icon={<FileText size={16} />}>
              <div className="divide-y divide-slate-100">
                {owners.map(o => (
                  <div key={o.id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{o.name}</div>
                      <div className="text-[11px] text-slate-500">Father/Husband: {o.fatherName}</div>
                      <div className="text-[11px] text-slate-500">Share: {o.sharePercent}% · Acquired via {o.acquisitionType} ({o.acquisitionDate})</div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {o.sharePercent}%
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Deed Registrations */}
            {registrations.length > 0 && (
              <Section title={`Deed Registrations (${registrations.length})`} icon={<GitMerge size={16} />} defaultOpen={false}>
                <div className="divide-y divide-slate-100">
                  {registrations.map(reg => (
                    <div key={reg.id} className="py-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-blue-700">{reg.documentNo}</span>
                        <span className="text-slate-500">{reg.registrationDate}</span>
                      </div>
                      <div className="text-slate-700 font-medium">{reg.propertyType} · ₹{(reg.saleValue / 100000).toFixed(2)} Lakh</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Seller: {reg.sellerName} → Buyer: {reg.buyerName}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">SRO: {reg.subRegistrarOffice} · Stamp Duty: ₹{reg.stampDuty.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Mutations */}
            {mutations.length > 0 && (
              <Section title={`Mutations (${mutations.length})`} icon={<GitMerge size={16} />} defaultOpen={false}>
                <div className="divide-y divide-slate-100">
                  {mutations.map(m => (
                    <div key={m.id} className="py-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-semibold text-slate-900">Case #{m.mutationNo}</span>
                        <StatusPill value={m.status} tone={m.status === 'Approved' ? 'success' : m.status === 'Pending' ? 'warning' : 'danger'} />
                      </div>
                      <div className="text-slate-700 font-medium">{m.type} · Order Date: {m.mutationDate}</div>
                      <div className="text-slate-500 text-[11px]">Approving Authority: {m.approvedBy || 'Tehsildar / Sub-Divisional Officer'}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Zoning & Master Plan */}
            <Section title="Zoning & Master Plan 2031" icon={<Building2 size={16} />}>
              {zoning ? (
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Zone Classification" value={zoning.currentZone} />
                  {zoning.proposedZone && <InfoRow label="Proposed Master Plan Zone" value={`${zoning.proposedZone} (Draft)`} />}
                  <InfoRow label="Master Plan Phase" value={zoning.masterPlanPhase} />
                  <InfoRow label="Permissible Land Use" value={zoning.landUseDesignation} />
                  <InfoRow label="Floor Space Index (FSI)" value={zoning.fsi.toString()} />
                  <InfoRow label="Maximum Permissible Height" value={`${zoning.maxHeight}m`} />
                  <InfoRow label="Front Setback" value={`${zoning.setbackFront}m`} />
                  {zoning.roadReservation && <InfoRow label="Road Reservation Width" value={`${zoning.roadWidth}m (Corridor)`} />}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">Zoning record not available.</div>
              )}
            </Section>

            {/* Building Permissions */}
            {permissions.length > 0 && (
              <Section title={`Building Permissions (${permissions.length})`} icon={<Building2 size={16} />} defaultOpen={false}>
                <div className="divide-y divide-slate-100">
                  {permissions.map(bp => (
                    <div key={bp.id} className="py-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-blue-700">{bp.applicationNo}</span>
                        <StatusPill value={bp.status} tone={bp.status === 'Approved' ? 'success' : 'danger'} />
                      </div>
                      <div className="text-slate-700 font-medium">{bp.type} · Applied: {bp.appliedDate}</div>
                      {bp.approvedArea && <div className="text-slate-500 text-[11px]">Approved Area: {bp.approvedArea} sqm · {bp.floors} Floors</div>}
                      <div className="text-slate-400 text-[10px] mt-0.5">{bp.authority}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Encumbrances & Court Cases */}
            {encumbrances.length > 0 && (
              <Section title={`Encumbrances & Mortgages (${encumbrances.length})`} icon={<Scale size={16} />} defaultOpen={false}>
                <div className="divide-y divide-slate-100">
                  {encumbrances.map(e => (
                    <div key={e.id} className="py-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{e.type}</span>
                        <StatusPill value={e.status} tone={e.status === 'Active' ? 'warning' : 'neutral'} />
                      </div>
                      <div className="text-slate-700">{e.creditorName} {e.amount ? `· ₹${(e.amount / 100000).toFixed(2)} Lakh` : ''}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{e.bankName} · Since {e.startDate}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {litigations.length > 0 && (
              <Section title={`Court Litigations (${litigations.length})`} icon={<Scale size={16} />}>
                <div className="divide-y divide-slate-100">
                  {litigations.map(lit => (
                    <div key={lit.id} className="py-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-rose-700">{lit.caseNo}</span>
                        <StatusPill value={lit.status} tone="danger" />
                      </div>
                      <div className="text-slate-700 font-medium">{lit.court} · {lit.caseType}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{lit.plaintiff} vs {lit.defendant}</div>
                      <div className="text-slate-500 text-[11px] mt-1">{lit.summary}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

          </div>

          {/* Right Column: Rule Findings & Financials */}
          <div className="space-y-4">
            {/* Rule Findings Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">Rule Findings</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {truth.conflicts.length} Active
                </span>
              </div>

              {truth.conflicts.length === 0 ? (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={15} /> All rules satisfied without conflicts.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {truth.conflicts.map(finding => {
                    const colors = FindingStyle({ severity: finding.severity });
                    return (
                      <div key={finding.ruleId} className={`p-3 rounded-xl border ${colors.bg} ${colors.border}`}>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`chip text-[9px] font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                            {finding.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{finding.ruleId}</span>
                        </div>
                        <div className={`text-xs font-semibold mb-1 ${colors.text}`}>{finding.name}</div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{finding.description}</p>
                        <div className="mt-2 text-[10px] font-semibold text-blue-700 pt-1.5 border-t border-slate-200/60">
                          Recommended: {finding.recommendedAction.split('.')[0]}.
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Property Tax */}
            {tax && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-amber-600" />
                    <h3 className="font-heading font-bold text-sm text-slate-900">Municipal Property Tax</h3>
                  </div>
                  <StatusPill value={tax.status} tone={tax.status === 'Paid' ? 'success' : 'danger'} />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tax Demand</span>
                    <span className="font-medium text-slate-900">₹{tax.taxDemand.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Amount Paid</span>
                    <span className="font-medium text-emerald-700">₹{tax.taxPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Outstanding Due</span>
                    <span className={`font-bold ${tax.taxDue > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                      ₹{tax.taxDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">{tax.authority}</div>
                </div>
              </div>
            )}

            {/* Valuation */}
            {valuation && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <DollarSign size={16} className="text-blue-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">Government Valuation</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Circle Rate</span>
                    <span className="font-medium text-slate-900">₹{valuation.circleRate.toLocaleString()}/sqm</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Market Guide</span>
                    <span className="font-medium text-slate-900">₹{valuation.marketValue.toLocaleString()}/sqm</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 font-semibold">
                    <span className="text-slate-700">Total Est. Value</span>
                    <span className="text-blue-700">₹{(valuation.totalValue / 10000000).toFixed(2)} Cr</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{valuation.valuationAuthority} · {valuation.valuationDate}</div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Inter-Agency Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/map"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors bg-slate-50/50"
                >
                  <span className="flex items-center gap-2"><MapIcon size={14} /> Open GIS Boundary</span>
                  <ChevronRight size={13} className="text-slate-400" />
                </Link>
                <Link
                  href="/workflows"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors bg-slate-50/50"
                >
                  <span className="flex items-center gap-2"><Workflow size={14} /> Initiate Task Workflow</span>
                  <ChevronRight size={13} className="text-slate-400" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant parcelId={id} />
    </AppShell>
  );
}
