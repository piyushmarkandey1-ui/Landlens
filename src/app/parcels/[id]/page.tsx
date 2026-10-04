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
  ChevronDown, ChevronRight, ExternalLink, Map, Workflow, Layers } from 'lucide-react';
import Link from 'next/link';

function HealthBadge({ status }: { status: string }) {
  const cls = {
    Verified: 'health-verified',
    'Needs Review': 'health-attention',
    Conflict: 'health-conflict',
    Unavailable: 'health-unavailable',
  }[status] || 'health-unavailable';
  const icons = {
    Verified: <CheckCircle2 size={11} />,
    'Needs Review': <Clock size={11} />,
    Conflict: <AlertTriangle size={11} />,
    Unavailable: <Minus size={11} />,
  }[status];
  return (
    <span className={`chip ${cls} capitalize gap-1`}>
      {icons}
      {status}
    </span>
  );
}

function FindingStyle({ severity }: { severity: string }) {
  const styles: Record<string, { text: string; bg: string; border: string; badge: string }> = {
    CRITICAL: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500 text-white' },
    HIGH: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500 text-white' },
    MEDIUM: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500 text-white' },
    LOW: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500 text-white' },
  };
  return styles[severity] || styles.LOW;
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="surface-card mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <span className="text-indigo-400">{icon}</span>
          {title}
        </div>
        {open ? <ChevronDown size={14} className="text-slate-600" /> : <ChevronRight size={14} className="text-slate-600" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-800/50 last:border-0 gap-4">
      <span className="text-xs text-slate-500 flex-shrink-0 w-36">{label}</span>
      <span className={`text-xs text-right ${mono ? 'font-mono text-cyan-300' : 'text-slate-300'} flex-1`}>{value}</span>
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
        <div className="p-8 text-center text-slate-500">
          Parcel &quot;{id}&quot; not found.
          <Link href="/map" className="block mt-4 text-indigo-400 hover:underline">← Back to Map</Link>
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
        <div className="p-8 text-center text-slate-500">
          Intelligence data is unavailable for parcel &quot;{id}&quot;.
          <Link href="/map" className="block mt-4 text-indigo-400 hover:underline">← Back to Map</Link>
        </div>
      </AppShell>
    );
  }

  const statusColor = parcel.status === 'Active' ? '#10b981' : parcel.status === 'Disputed' ? '#ef4444' : parcel.status === 'Restricted' ? '#8b5cf6' : '#f59e0b';

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-6">
        {/* Back */}
        <Link href="/map" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Map
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-sm text-slate-500 mb-1">{parcel.ulpin}</div>
              <h1 className="font-heading font-bold text-3xl text-white mb-1">
                Parcel {parcel.id}
                <span className="ml-3 text-lg text-slate-500 font-normal">— {parcel.village}</span>
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <MapPin size={13} className="text-cyan-400" />
                {parcel.address}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-start">
              <span className="chip" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                {parcel.status}
              </span>
              <span className="chip bg-indigo-500/15 text-indigo-300 border-indigo-500/25">{parcel.landUse}</span>
              <span className="chip bg-slate-700/60 text-slate-400">{parcel.areaAcres} acres</span>
            </div>
          </div>
        </motion.div>

        {/* Land Truth Engine Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 p-4 rounded-xl border ${truth.summary.conflictCategories > 0 ? 'bg-red-500/5 border-red-500/20' : truth.summary.reviewCategories > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${truth.summary.conflictCategories > 0 ? 'bg-red-500/15 text-red-400' : truth.summary.reviewCategories > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              {truth.summary.issuesDetected > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading font-semibold text-white text-sm">Land Truth Engine</span>
                <span className="chip text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Deterministic analysis
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {truth.summary.issuesDetected > 0
                  ? `${truth.summary.issuesDetected} rule finding${truth.summary.issuesDetected === 1 ? '' : 's'} require review. Findings are shown with their source evidence; no combined score is used.`
                  : 'No rule findings were triggered for the available parcel data.'}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                <span className="text-slate-500">Rules evaluated: <strong className="text-slate-300">{truth.summary.rulesEvaluated}</strong></span>
                <span className="text-slate-500">Datasets compared: <strong className="text-slate-300">{truth.summary.datasetsCompared}</strong></span>
                <span className={truth.summary.issuesDetected > 0 ? 'text-red-400' : 'text-emerald-400'}>Issues detected: <strong>{truth.summary.issuesDetected}</strong></span>
                <span className="text-slate-500">Evidence records: <strong className="text-slate-300">{truth.summary.evidenceRecords}</strong></span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Main data sections */}
          <div className="lg:col-span-2 space-y-0">

            {/* Data Health */}
            <Section title="Data Health Overview" icon={<CheckCircle2 size={14} />}>
              <div className="grid grid-cols-2 gap-2">
                {truth.consistency.map(item => (
                  <div key={item.category} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60">
                    <span className="text-xs text-slate-500">{item.category}</span>
                    <HealthBadge status={item.status} />
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-slate-600">
                Statuses reflect available synthetic records: Verified, Needs Review, Conflict, or Unavailable.
              </div>
            </Section>

            {/* Parcel Identity */}
            <Section title="Parcel Identity" icon={<MapPin size={14} />}>
              <div className="divide-y divide-slate-800/50">
                <InfoRow label="ULPIN" value={parcel.ulpin} mono />
                <InfoRow label="Khasra No." value={parcel.khasraNo} mono />
                <InfoRow label="Survey No." value={parcel.surveyNo} mono />
                <InfoRow label="Area" value={`${parcel.areaAcres} acres (${parcel.area.toLocaleString()} sqm)`} />
                <InfoRow label="Land Use" value={parcel.landUse} />
                <InfoRow label="Zoning" value={parcel.zoning} />
                <InfoRow label="Tehsil" value={parcel.tehsil} />
                <InfoRow label="Village / Ward" value={parcel.village} />
                <InfoRow label="District" value={parcel.district} />
                <InfoRow label="State" value={parcel.state} />
                <InfoRow label="Coordinates" value={`${parcel.lat.toFixed(4)}°N, ${parcel.lng.toFixed(4)}°E`} mono />
              </div>
            </Section>

            {/* Ownership / RoR */}
            <Section title="Record of Rights (RoR)" icon={<FileText size={14} />}>
              {ror ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="chip bg-slate-700/60 text-slate-400 text-[10px]">{ror.source}</span>
                    <span className={`chip text-[10px] ${ror.isVerified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                      {ror.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="text-[10px] text-slate-600">Updated: {ror.lastUpdated}</span>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    <InfoRow label="Owner (RoR)" value={ror.ownerName} />
                    <InfoRow label="Khata No." value={ror.khataNo} mono />
                    <InfoRow label="Khatabi No." value={ror.khatabiNo} mono />
                    <InfoRow label="Area (RoR)" value={`${ror.areaAcres} acres (${ror.area} sqm)`} />
                    <InfoRow label="Land Type" value={ror.landType} />
                    {ror.cultivatorName && <InfoRow label="Cultivator" value={ror.cultivatorName} />}
                    {ror.irrigationSource && <InfoRow label="Irrigation" value={ror.irrigationSource} />}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 py-4 text-center">RoR not available for this parcel in demo dataset.</div>
              )}

              {owners.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Current Owner(s)</div>
                  {owners.filter(o => o.isCurrentOwner).map(owner => (
                    <div key={owner.id} className="flex items-start justify-between py-2 border-b border-slate-800/30 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{owner.name}</div>
                        <div className="text-xs text-slate-600">{owner.fatherName ? `S/D/W of ${owner.fatherName}` : ''} · {owner.ownershipType} · {owner.sharePercent}%</div>
                        <div className="text-xs text-slate-600">{owner.acquisitionType} · {owner.acquisitionDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Registration */}
            <Section title="Registration Records" icon={<GitMerge size={14} />} defaultOpen={registrations.length > 0}>
              {registrations.length > 0 ? registrations.map(reg => (
                <div key={reg.id} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-cyan-300">{reg.documentNo}</span>
                    <span className={`chip text-[10px] ${reg.status === 'Registered' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>{reg.status}</span>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    <InfoRow label="Registration Date" value={reg.registrationDate} />
                    <InfoRow label="Sale Value" value={`₹${(reg.saleValue / 100000).toFixed(2)} Lakh`} />
                    <InfoRow label="Stamp Duty" value={`₹${(reg.stampDuty / 1000).toFixed(0)}K`} />
                    <InfoRow label="Area (Deed)" value={`${reg.areaAcres} acres`} />
                    <InfoRow label="Seller" value={reg.sellerName} />
                    <InfoRow label="Buyer" value={reg.buyerName} />
                    <InfoRow label="SRO" value={reg.subRegistrarOffice} />
                  </div>
                </div>
              )) : (
                <div className="text-xs text-slate-600 py-4 text-center">No registration records found in demo dataset.</div>
              )}
            </Section>

            {/* Mutations */}
            {mutations.length > 0 && (
              <Section title={`Mutations (${mutations.length})`} icon={<GitMerge size={14} />} defaultOpen={false}>
                {mutations.map(m => (
                  <div key={m.id} className="py-2 border-b border-slate-800/50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-cyan-300">{m.mutationNo}</span>
                      <span className={`chip text-[10px] ${m.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' : m.status === 'Pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>{m.status}</span>
                    </div>
                    <div className="text-xs text-slate-400">{m.type} · {m.mutationDate}</div>
                    <div className="text-xs text-slate-500">{m.previousOwner} → {m.newOwner}</div>
                    {m.remarks && <div className="text-xs text-slate-600 mt-1">{m.remarks}</div>}
                  </div>
                ))}
              </Section>
            )}

            {/* Zoning */}
            <Section title="Zoning & Master Plan" icon={<Layers size={14} />} defaultOpen={false}>
              {zoning ? (
                <div>
                  {zoning.roadReservation && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/20 text-xs text-red-300">
                      ⚠️ This parcel falls within a {zoning.roadWidth}m Road Reservation Corridor. Development prohibited.
                    </div>
                  )}
                  <div className="divide-y divide-slate-800/50">
                    <InfoRow label="Current Zone" value={zoning.currentZone} />
                    {zoning.proposedZone && <InfoRow label="Proposed Zone" value={`${zoning.proposedZone} (Draft)`} />}
                    <InfoRow label="Master Plan" value={zoning.masterPlanPhase} />
                    <InfoRow label="Land Use Designation" value={zoning.landUseDesignation} />
                    <InfoRow label="FSI" value={zoning.fsi.toString()} />
                    <InfoRow label="Max Height" value={`${zoning.maxHeight}m`} />
                    <InfoRow label="Front Setback" value={`${zoning.setbackFront}m`} />
                    {zoning.roadReservation && <InfoRow label="Road Width Reserved" value={`${zoning.roadWidth}m`} />}
                    {zoning.remarks && <InfoRow label="Remarks" value={zoning.remarks} />}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 py-4 text-center">Zoning record not in demo dataset. Contact RDA.</div>
              )}
            </Section>

            {/* Building Permissions */}
            {permissions.length > 0 && (
              <Section title={`Building Permissions (${permissions.length})`} icon={<Building2 size={14} />} defaultOpen={false}>
                {permissions.map(bp => (
                  <div key={bp.id} className="py-2 border-b border-slate-800/50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-cyan-300">{bp.applicationNo}</span>
                      <span className={`chip text-[10px] ${bp.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' : bp.status === 'Rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{bp.status}</span>
                    </div>
                    <div className="text-xs text-slate-400">{bp.type} · Applied: {bp.appliedDate}</div>
                    {bp.approvedArea && <div className="text-xs text-slate-500">Area: {bp.approvedArea} sqm · Floors: {bp.floors}</div>}
                    {bp.validUpto && <div className="text-xs text-slate-600">Valid upto: {bp.validUpto}</div>}
                    <div className="text-xs text-slate-600">{bp.authority}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* Encumbrances */}
            {encumbrances.length > 0 && (
              <Section title={`Encumbrances & Mortgages (${encumbrances.length})`} icon={<Scale size={14} />} defaultOpen={false}>
                {encumbrances.map(e => (
                  <div key={e.id} className="py-2 border-b border-slate-800/50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-300">{e.type}</span>
                      <span className={`chip text-[10px] ${e.status === 'Active' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-700/60 text-slate-500'}`}>{e.status}</span>
                    </div>
                    <div className="text-xs text-slate-500">{e.creditorName}</div>
                    {e.amount && <div className="text-xs text-slate-600">₹{(e.amount / 100000).toFixed(2)} Lakh · {e.bankName}</div>}
                    <div className="text-xs text-slate-600">Since: {e.startDate}{e.endDate ? ` · Until: ${e.endDate}` : ''}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* Litigation */}
            {litigations.length > 0 && (
              <Section title={`Litigation (${litigations.length} Active)`} icon={<Scale size={14} />}>
                {litigations.map(lit => (
                  <div key={lit.id} className="py-3 border-b border-slate-800/50 last:border-0">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono text-xs text-rose-400">{lit.caseNo}</span>
                      <span className="chip text-[10px] bg-red-500/15 text-red-400">{lit.status}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">{lit.court} · {lit.caseType}</div>
                    <div className="text-xs text-slate-500">{lit.plaintiff} vs {lit.defendant}</div>
                    <div className="text-xs text-slate-600 mt-1">{lit.summary}</div>
                    {lit.nextHearingDate && <div className="text-xs text-amber-500 mt-1">Next Hearing: {lit.nextHearingDate}</div>}
                  </div>
                ))}
              </Section>
            )}

            {/* Satellite Changes */}
            {satChanges.length > 0 && (
              <Section title={`Satellite Change Detection (${satChanges.length})`} icon={<Satellite size={14} />} defaultOpen={false}>
                {satChanges.map(sc => (
                  <div key={sc.id} className="py-2 border-b border-slate-800/50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-300">{sc.changeType}</span>
                      <span className={`chip text-[10px] ${sc.verificationStatus === 'Pending' ? 'bg-amber-500/15 text-amber-400' : sc.verificationStatus === 'Verified' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/60 text-slate-500'}`}>{sc.verificationStatus}</span>
                    </div>
                    <div className="text-xs text-slate-500">Detected: {sc.detectedDate} · Confidence: {sc.confidence}%{sc.area ? ` · Area: ${sc.area} sqm` : ''}</div>
                  </div>
                ))}
              </Section>
            )}
          </div>

          {/* Right: Alerts + Tax + Valuation */}
          <div className="space-y-4">
            {/* Conflict Alerts */}
            <div className="surface-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="font-semibold text-sm text-white">Rule Findings</span>
                <span className="ml-auto chip bg-red-500/15 text-red-400 text-[10px]">{truth.conflicts.length}</span>
              </div>
              {truth.conflicts.length === 0 ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 py-2">
                  <CheckCircle2 size={13} /> No rule findings detected
                </div>
              ) : (
                <div className="space-y-2">
                  {truth.conflicts.map(finding => {
                    const colors = FindingStyle({ severity: finding.severity });
                    return (
                      <div key={finding.ruleId} className={`px-3 py-2.5 rounded-lg border ${colors.bg} ${colors.border}`}>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className={`chip ${colors.badge} text-[9px]`}>{finding.severity}</span>
                          <span className="text-[9px] text-slate-500">{finding.ruleId}</span>
                        </div>
                        <div className={`text-xs font-medium mb-1 ${colors.text}`}>{finding.name}</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{finding.description}</div>
                        <div className="mt-1.5 text-[10px] text-slate-600">
                          {finding.datasetsUsed.slice(0, 2).join(' · ')}
                        </div>
                        <div className="mt-2 text-[10px] text-indigo-400 font-medium">→ {finding.recommendedAction.split('.')[0]}.</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tax */}
            {tax && (
              <div className="surface-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={14} className="text-amber-400" />
                  <span className="font-semibold text-sm text-white">Property Tax</span>
                  <span className={`ml-auto chip text-[10px] ${tax.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : tax.status === 'Defaulter' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{tax.status}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Tax Demand</span><span className="text-slate-300">₹{tax.taxDemand.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="text-emerald-400">₹{tax.taxPaid.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Outstanding</span><span className={tax.taxDue > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>₹{tax.taxDue.toLocaleString()}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-600">Authority</span><span className="text-slate-600">{tax.authority}</span></div>
                </div>
              </div>
            )}

            {/* Valuation */}
            {valuation && (
              <div className="surface-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={14} className="text-cyan-400" />
                  <span className="font-semibold text-sm text-white">Valuation</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Circle Rate</span><span className="text-slate-300">₹{valuation.circleRate.toLocaleString()}/sqm</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Market Rate</span><span className="text-slate-300">₹{valuation.marketValue.toLocaleString()}/sqm</span></div>
                  <div className="flex justify-between font-medium"><span className="text-slate-400">Total Est. Value</span><span className="text-cyan-300">₹{(valuation.totalValue / 10000000).toFixed(2)} Cr</span></div>
                  <div className="text-[10px] text-slate-600 mt-1">{valuation.valuationAuthority} · {valuation.valuationDate}</div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="surface-card p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Actions</div>
              <div className="space-y-1.5">
                <Link href="/map" className="nav-item text-xs">
                  <Map size={13} className="text-cyan-400" /> View on Map
                </Link>
                <Link href="/workflows" className="nav-item text-xs">
                  <Workflow size={13} className="text-indigo-400" /> Create Workflow Task
                </Link>
                <button className="nav-item text-xs w-full text-left">
                  <FileText size={13} className="text-emerald-400" /> Generate Parcel Report
                </button>
                <button className="nav-item text-xs w-full text-left">
                  <ExternalLink size={13} className="text-amber-400" /> Export Data
                </button>
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
