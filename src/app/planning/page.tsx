'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layers, AlertTriangle, MapPin, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { BUILDING_PERMISSIONS, ENVIRONMENTAL_RESTRICTIONS, PARCELS, SATELLITE_CHANGES, ZONING_RECORDS } from '@/lib/data';
import { getDevelopmentReview, getPlanningMetrics } from '@/lib/operations';
import { KpiGrid, SectionHeader, StatusPill, ProgressBar } from '@/components/OperationalPrimitives';

type PlanningTab = 'review' | 'zoning' | 'permissions' | 'restrictions' | 'satellite';
const outcomeTone = {
  Eligible: 'success',
  'Review Required': 'warning',
  'Restriction Detected': 'danger',
} as const;

export default function PlanningPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<PlanningTab>(() => {
    if (typeof window === 'undefined') return 'review';
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    return ['review', 'zoning', 'permissions', 'restrictions', 'satellite'].includes(requestedTab || '')
      ? (requestedTab as PlanningTab)
      : 'review';
  });
  const [selectedParcelId, setSelectedParcelId] = useState('P003');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const metrics = getPlanningMetrics();
  const selectedReview = getDevelopmentReview(selectedParcelId);
  const reviewRows = useMemo(
    () =>
      PARCELS.map(parcel => ({ parcel, review: getDevelopmentReview(parcel.id) })).filter(item => {
        if (!search) return true;
        return `${item.parcel.id} ${item.parcel.village} ${item.parcel.landUse}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [search]
  );

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
              <Layers size={11} /> Planning & Town Country Department
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              Planning Officer Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Automated development screening, Master Plan 2031 alignments, environmental buffers, and satellite change detection.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <MapPin size={14} /> Open GIS Workspace
          </Link>
        </div>

        {/* Top Operational Metrics */}
        <KpiGrid metrics={metrics} columns={5} />

        {/* Tab Navigation & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl">
            {(
              [
                ['review', 'Development Review'],
                ['zoning', 'Zoning & Master Plan'],
                ['permissions', 'Building Permissions'],
                ['restrictions', 'Environmental Restrictions'],
                ['satellite', 'Satellite Change Detection'],
              ] as [PlanningTab, string][]
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
              placeholder="Filter parcel or village…"
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Tab 1: Development Review */}
        {tab === 'review' && (
          <div className="grid xl:grid-cols-[1fr_420px] gap-5 items-start">
            {/* Queue Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <SectionHeader
                  title="Development Screening Queue"
                  subtitle="Deterministic rules-engine cross-checking zoning, reservations, and RoR"
                />
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  {reviewRows.length} parcels
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
                {reviewRows.map(
                  ({ parcel, review }) =>
                    review && (
                      <button
                        key={parcel.id}
                        onClick={() => setSelectedParcelId(parcel.id)}
                        className={`w-full text-left p-4 hover:bg-slate-50/80 transition-all flex items-start justify-between gap-3 ${
                          selectedParcelId === parcel.id
                            ? 'bg-blue-50/60 border-l-4 border-l-blue-600'
                            : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {parcel.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {parcel.village}
                            </span>
                            <span className="text-[11px] text-slate-400">· {parcel.surveyNo}</span>
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {parcel.landUse} · {parcel.address}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                            <span className="font-medium text-slate-600">{review.reasons.length}</span> planning signals detected
                          </div>
                        </div>
                        <StatusPill value={review.outcome} tone={outcomeTone[review.outcome]} />
                      </button>
                    )
                )}
              </div>
            </div>

            {/* Selected Parcel Dossier */}
            {selectedReview && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-5 sticky top-6">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider text-blue-600 uppercase">
                      Selected Dossier
                    </span>
                    <h2 className="font-heading font-bold text-xl text-slate-900 mt-0.5">
                      Parcel {selectedReview.parcelId}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Deterministic screening against master plan and cadastral layers
                    </p>
                  </div>
                  <StatusPill value={selectedReview.outcome} tone={outcomeTone[selectedReview.outcome]} />
                </div>

                {/* Attribute Matrix */}
                <div className="space-y-2.5">
                  {[
                    ['Land Use (Revenue)', selectedReview.landUse],
                    ['Zoning (Master Plan)', selectedReview.zoning],
                    ['Master Plan Phase', selectedReview.masterPlan],
                    ['Building Permission', selectedReview.buildingPermission],
                    ['Road Reservation', selectedReview.roadReservation],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 text-xs"
                    >
                      <span className="text-slate-500 font-medium">{label}</span>
                      <span className="text-slate-900 font-semibold text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Environmental Restrictions */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Environmental Restrictions
                  </div>
                  {selectedReview.environmentalRestrictions.length ? (
                    selectedReview.environmentalRestrictions.map(item => (
                      <div
                        key={item}
                        className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-1.5 flex items-start gap-2"
                      >
                        <AlertTriangle size={13} className="text-rose-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>No active environmental restrictions flagged on this parcel.</span>
                    </div>
                  )}
                </div>

                {/* Evidence Chain */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Evidence Signals & Reasons
                  </div>
                  <div className="space-y-2">
                    {selectedReview.reasons.map(reason => (
                      <div
                        key={reason}
                        className="flex gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed"
                      >
                        <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">Datasets verified: </span>
                    {selectedReview.datasets.length ? selectedReview.datasets.join(' · ') : 'Revenue RoR, Master Plan 2031, Zoning'}
                  </div>
                  <Link
                    href={`/parcels/${selectedReview.parcelId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    Open Comprehensive Parcel 360 <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Zoning Records */}
        {tab === 'zoning' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Master Plan 2031 Zoning Designations"
                subtitle="Prescribed floor space index (FSI), height restrictions, and road expansion reservations"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Parcel ID</th>
                    <th className="p-3.5">Current Zone</th>
                    <th className="p-3.5">Proposed (2031)</th>
                    <th className="p-3.5">Master Plan Phase</th>
                    <th className="p-3.5">Land Use</th>
                    <th className="p-3.5">Permitted FSI</th>
                    <th className="p-3.5">Max Height</th>
                    <th className="p-3.5">Road Reservation</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ZONING_RECORDS.map(z => (
                    <tr key={z.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700">
                        <Link href={`/parcels/${z.parcelId}`} className="hover:underline">
                          {z.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <StatusPill value={z.currentZone} tone="info" />
                      </td>
                      <td className="p-3.5 font-medium text-amber-700">{z.proposedZone || '—'}</td>
                      <td className="p-3.5 text-slate-600">{z.masterPlanPhase}</td>
                      <td className="p-3.5 text-slate-800 font-medium">{z.landUseDesignation}</td>
                      <td className="p-3.5 font-mono text-slate-700">{z.fsi}</td>
                      <td className="p-3.5 font-mono text-slate-700">{z.maxHeight}m</td>
                      <td className="p-3.5">
                        {z.roadReservation ? (
                          <StatusPill value={`${z.roadWidth}m buffer overlap`} tone="danger" />
                        ) : (
                          <StatusPill value="Clear" tone="success" />
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/parcels/${z.parcelId}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Building Permissions */}
        {tab === 'permissions' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Municipal Building Permissions & Layout Approvals"
                subtitle="Cross-matched with revenue ownership records to detect unapproved constructions"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Application No.</th>
                    <th className="p-3.5">Parcel</th>
                    <th className="p-3.5">Applicant</th>
                    <th className="p-3.5">Structure Type</th>
                    <th className="p-3.5">Permission Status</th>
                    <th className="p-3.5">Built-up Area</th>
                    <th className="p-3.5">Application Date</th>
                    <th className="p-3.5">Validity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BUILDING_PERMISSIONS.map(bp => (
                    <tr key={bp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{bp.applicationNo}</td>
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${bp.parcelId}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {bp.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">{bp.applicantName}</td>
                      <td className="p-3.5 text-slate-600">{bp.type}</td>
                      <td className="p-3.5">
                        <StatusPill
                          value={bp.status}
                          tone={
                            bp.status === 'Approved'
                              ? 'success'
                              : bp.status === 'Rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        />
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {bp.approvedArea ? `${bp.approvedArea} sqm` : '—'}
                      </td>
                      <td className="p-3.5 text-slate-500">{bp.appliedDate}</td>
                      <td className="p-3.5 text-slate-500">{bp.validUpto || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Environmental Restrictions */}
        {tab === 'restrictions' && (
          <div className="space-y-3">
            {ENVIRONMENTAL_RESTRICTIONS.map(item => (
              <Link
                href={`/parcels/${item.parcelId}`}
                key={item.id}
                className="bg-white border border-slate-200 hover:border-rose-300 rounded-xl p-4 flex items-start gap-4 transition-all shadow-2xs hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0 mt-0.5">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusPill value={item.type} tone="danger" />
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.parcelId}
                    </span>
                    <span className="text-xs text-slate-500">· {item.authority}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Notification Reference: {item.notificationNo || 'Statutory Buffer Rule'}
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors self-center" />
              </Link>
            ))}
          </div>
        )}

        {/* Tab 5: Satellite Change Detection */}
        {tab === 'satellite' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Earth Observation & Change Detection Engine"
                subtitle="Sentinel-2 and high-resolution cadastral drone imagery overlays comparing physical footprint to RoR"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Parcel</th>
                    <th className="p-3.5">Detected Alteration</th>
                    <th className="p-3.5">Detection Timestamp</th>
                    <th className="p-3.5">AI Model Confidence</th>
                    <th className="p-3.5">Estimated Footprint</th>
                    <th className="p-3.5">Field Audit Status</th>
                    <th className="p-3.5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SATELLITE_CHANGES.map(sc => (
                    <tr key={sc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <Link
                          href={`/parcels/${sc.parcelId}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {sc.parcelId}
                        </Link>
                      </td>
                      <td className="p-3.5 font-medium text-slate-900">{sc.changeType}</td>
                      <td className="p-3.5 text-slate-500">{sc.detectedDate}</td>
                      <td className="p-3.5 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <ProgressBar
                              value={sc.confidence}
                              color={sc.confidence >= 80 ? '#10b981' : '#f59e0b'}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-slate-700">
                            {sc.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {sc.area ? `${sc.area} sqm` : '—'}
                      </td>
                      <td className="p-3.5">
                        <StatusPill
                          value={sc.verificationStatus}
                          tone={
                            sc.verificationStatus === 'Verified'
                              ? 'success'
                              : sc.verificationStatus === 'Pending'
                              ? 'warning'
                              : 'neutral'
                          }
                        />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/parcels/${sc.parcelId}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disclaimer banner */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
          <span>
            Planning outcomes shown here are algorithmic screening results produced by cross-matching cadastral datasets. Official development permission requires formal municipal clearance.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
