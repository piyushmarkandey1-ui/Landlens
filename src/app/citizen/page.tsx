'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Building2, FileText, Clock, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Minus, ArrowRight, Info,
  Shield, Database, X, Send, Sparkles, Globe,
  Layers, TreePine,
  UploadCloud, Hash, Map
} from 'lucide-react';
import Link from 'next/link';
import {
  PARCELS, ZONING_RECORDS, ENVIRONMENTAL_RESTRICTIONS,
  LITIGATIONS, BUILDING_PERMISSIONS, SERVICE_REQUESTS
} from '@/lib/data';
import { canIBuildHere } from '@/lib/engine';
import type { Parcel } from '@/lib/types';

// ─── Jargon glossary ────────────────────────────────────────────────────────
const GLOSSARY: Record<string, string> = {
  RoR: 'Record of Rights (RoR) is the official document that lists the owner, area, land type, and any encumbrances on a parcel. It\'s sometimes called "B1 Extract" or "Khasra Khatauni".',
  ULPIN: 'Unique Land Parcel Identification Number (ULPIN) is a 14-character national ID assigned to every plot of land in India, similar to Aadhaar for land.',
  Khasra: 'Khasra is the village-level land survey number that identifies a specific plot. It is used in revenue records and is the primary reference number for agricultural land.',
  Zoning: 'Zoning is a rule that specifies what kind of buildings or activities are allowed on land — e.g., Residential (houses), Commercial (shops), Agricultural (farming). You cannot build a factory in a residential zone.',
  Encumbrance: 'An Encumbrance is a legal claim on a property by someone other than the owner, such as a bank mortgage, court attachment, or lien. It means the land may not be freely sold until cleared.',
  Mutation: 'Mutation is the official updating of land ownership records when a property changes hands through sale, inheritance, or gift. Without mutation, the old owner\'s name stays in government records.',
};

// ─── Tooltip wrapper ─────────────────────────────────────────────────────────
function GlossaryTip({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-0.5">
      <button
        onClick={() => setOpen(o => !o)}
        className="underline decoration-dotted decoration-blue-500/60 text-blue-600 hover:text-blue-700 transition-colors font-medium"
      >
        {term}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            className="absolute bottom-full left-0 mb-2 w-72 z-50 bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-xs text-slate-700 leading-relaxed"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-semibold text-blue-600">{term}</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            </div>
            {GLOSSARY[term]}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// ─── Build intent options ────────────────────────────────────────────────────
const BUILD_INTENTS = [
  { id: 'house', label: 'Build a House', icon: '🏠', desc: 'New residential construction' },
  { id: 'commercial', label: 'Build Commercial Property', icon: '🏢', desc: 'Shops, offices, or warehouses' },
  { id: 'buy', label: 'Buy Land', icon: '🤝', desc: 'Purchase or invest in land' },
  { id: 'sell', label: 'Sell Land', icon: '📋', desc: 'Transfer or sell your property' },
  { id: 'permission', label: 'Apply for Permission', icon: '📝', desc: 'Building approval or NOC' },
];

// ─── Service catalogue ───────────────────────────────────────────────────────
const SERVICES = [
  { id: 'mutation', icon: '🔄', title: 'Request Mutation', desc: 'Update ownership after purchase or inheritance' },
  { id: 'ownership', icon: '✅', title: 'Ownership Verification', desc: 'Get a verified ownership certificate' },
  { id: 'correction', icon: '✏️', title: 'Record Correction', desc: 'Fix errors in land records' },
  { id: 'building', icon: '🏗️', title: 'Building Permission', desc: 'Apply to construct or modify a structure' },
  { id: 'landuse', icon: '🗺️', title: 'Land-Use Inquiry', desc: 'Ask about permitted uses for your parcel' },
  { id: 'document', icon: '📄', title: 'Document Request', desc: 'Get copies of RoR, EC, or valuation certificates' },
  { id: 'grievance', icon: '📢', title: 'General Grievance', desc: 'Report a land record issue or complaint' },
];

// ─── Application timeline stages ────────────────────────────────────────────
const TIMELINE_STEPS = ['Submitted', 'Received', 'Under Review', 'Officer Verification', 'Decision', 'Completed'];

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Disputed: 'bg-red-500/15 text-red-400 border-red-500/25',
  'Under Review': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Restricted: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const CHECK_ICONS = {
  pass: <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />,
  fail: <XCircle size={15} className="text-red-400 flex-shrink-0" />,
  review: <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />,
  unknown: <Minus size={15} className="text-slate-500 flex-shrink-0" />,
  info: <Info size={15} className="text-blue-400 flex-shrink-0" />,
};

// ─── AI citizen messages ──────────────────────────────────────────────────────
const CITIZEN_PROMPTS = [
  { q: 'What does this mean?', a: (pid: string) => `This parcel (${pid}) is a registered land plot in Raipur. The information shown comes from official government datasets including land records (Bhu-Abhilekh), planning maps (RDA), and registration data (DORIS). Always verify critical decisions with the relevant government office.` },
  { q: 'Why is my parcel flagged?', a: (pid: string) => `Parcels can be flagged for reasons like an active court case, area mismatch between different records, or a road reservation corridor passing through them. Check the Restrictions section on this page for specific flags on ${pid}.` },
  { q: 'What should I verify?', a: () => 'Before buying or building: (1) Get an Encumbrance Certificate from the Sub-Registrar Office, (2) Verify the RoR with the Patwari, (3) Check with RDA if the land is in a special zone, (4) Confirm there are no active court cases.' },
  { q: 'Which service should I apply for?', a: () => 'Use the Services tab below. For ownership transfer → apply for Mutation. For building → Building Permission. For a certificate copy → Document Request. For errors in records → Record Correction.' },
];

// ─── Parcel At-a-Glance card ─────────────────────────────────────────────────
function ParcelSummaryCard({ parcel }: { parcel: Parcel }) {
  const restrictions = ENVIRONMENTAL_RESTRICTIONS.filter(r => r.parcelId === parcel.id && r.isActive).length +
    LITIGATIONS.filter(l => l.parcelId === parcel.id && l.status === 'Active').length;
  const zoning = ZONING_RECORDS.find(z => z.parcelId === parcel.id);
  const datasets = Object.values(parcel.dataHealth).filter(v => v !== 'unavailable').length;

  const items = [
    { label: 'Land Use', value: parcel.landUse, icon: <TreePine size={14} /> },
    { label: 'Area', value: `${parcel.areaAcres} acres`, icon: <Layers size={14} /> },
    { label: 'Planning', value: zoning ? (zoning.roadReservation ? 'Review required' : 'No issues') : 'Check required', icon: <Globe size={14} />, warn: !!(zoning?.roadReservation) },
    { label: 'Restrictions', value: restrictions > 0 ? `${restrictions} detected` : 'None found', icon: <Shield size={14} />, warn: restrictions > 0 },
    { label: 'Records', value: `${datasets} connected datasets`, icon: <Database size={14} /> },
  ];

  return (
    <div className="citizen-card mb-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-5 rounded-full bg-blue-600" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">At a glance</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2 text-slate-600">
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
            <span className={`text-sm font-semibold ${item.warn ? 'text-amber-700' : 'text-slate-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Data transparency panel ─────────────────────────────────────────────────
function TransparencyPanel({ parcel }: { parcel: Parcel }) {
  const [open, setOpen] = useState(false);
  const sources = [
    { section: 'Ownership & RoR', dataset: `Bhu-Abhilekh (${parcel.village})`, dept: 'Board of Revenue, CG', updated: '2024-03-01', status: 'Simulated' },
    { section: 'Land Boundaries', dataset: `Bhu-Naksha (ULPIN: ${parcel.ulpin})`, dept: 'DoLR / NIC', updated: '2024-02-15', status: 'Simulated' },
    { section: 'Registration', dataset: 'DORIS', dept: 'Registration Dept, CG', updated: '2024-03-01', status: 'Simulated' },
    { section: 'Zoning / Master Plan', dataset: 'RDA Master Plan 2031', dept: 'Raipur Development Authority', updated: '2024-01-01', status: 'Simulated' },
    { section: 'Restrictions', dataset: 'Environmental & Airport Records', dept: 'DGCA / Forest Dept', updated: '2023-12-01', status: 'Simulated' },
    { section: 'Court Cases', dataset: 'District Court Registry', dept: 'District Court Raipur', updated: '2024-02-29', status: 'Simulated' },
  ];

  return (
    <div className="citizen-card mb-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Database size={15} className="text-blue-600" />
          <span className="text-sm font-semibold text-slate-900">Where does this information come from?</span>
        </div>
        <ChevronRight size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              {sources.map(s => (
                <div key={s.section} className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{s.section}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.dataset} · {s.dept}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Last updated: {s.updated}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold whitespace-nowrap flex-shrink-0">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 italic px-1">
                ⚠ All data shown is synthetic demonstration data. It does not represent real ownership or legal status.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Can I Build Here — guided check ────────────────────────────────────────
function BuildCheckPanel({ parcel }: { parcel: Parcel }) {
  const [intent, setIntent] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  const zoning = ZONING_RECORDS.find(z => z.parcelId === parcel.id);
  const restrictions = ENVIRONMENTAL_RESTRICTIONS.filter(e => e.parcelId === parcel.id);
  const litigation = LITIGATIONS.filter(l => l.parcelId === parcel.id);
  const buildingPermissions = BUILDING_PERMISSIONS.filter(b => b.parcelId === parcel.id);

  const result = ran ? canIBuildHere(parcel.id, { parcel, zoning, restrictions, litigation, buildingPermissions }) : null;

  return (
    <div className="citizen-card mb-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={16} className="text-blue-600" />
        <span className="text-base font-bold text-slate-900">Can I Build Here?</span>
      </div>

      {!ran && (
        <>
          <p className="text-xs text-slate-500 mb-3 font-medium">Select your intended land use or action:</p>
          <div className="space-y-2">
            {BUILD_INTENTS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setIntent(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  intent === opt.id
                    ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-2xs ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-slate-50/80'
                }`}
              >
                <span className="text-xl flex-shrink-0">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{opt.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                </div>
                {intent === opt.id && <CheckCircle2 size={16} className="ml-auto text-blue-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
          {intent && (
            <button
              onClick={() => setRan(true)}
              className="mt-4 w-full citizen-btn-primary"
            >
              Evaluate this parcel <ArrowRight size={14} />
            </button>
          )}
        </>
      )}

      {ran && result && (
        <div>
          {/* Overall verdict */}
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 border ${
            result.overall === 'eligible'
              ? 'bg-emerald-500/8 border-emerald-500/20'
              : result.overall === 'restricted'
              ? 'bg-red-500/8 border-red-500/20'
              : 'bg-amber-500/8 border-amber-500/20'
          }`}>
            <span className="text-2xl flex-shrink-0">
              {result.overall === 'eligible' ? '✅' : result.overall === 'restricted' ? '🚫' : '⚠️'}
            </span>
            <div>
              <div className={`font-bold text-base ${
                result.overall === 'eligible' ? 'text-emerald-300'
                  : result.overall === 'restricted' ? 'text-red-300' : 'text-amber-300'
              }`}>
                {result.overall === 'eligible'
                  ? 'Looks compatible with available data'
                  : result.overall === 'restricted'
                  ? 'Restriction detected'
                  : 'Review required'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {result.overall === 'eligible'
                  ? 'No blocking restrictions found in available records. You still need formal approval from authorities.'
                  : result.overall === 'restricted'
                  ? 'One or more restrictions prevent this activity on this parcel.'
                  : 'Some factors need professional or official review before proceeding.'}
              </div>
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-2 mb-4">
            {result.checks.map((check, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                  check.status === 'fail'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : check.status === 'pass'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : check.status === 'review'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <span className="mt-0.5">{CHECK_ICONS[check.status]}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{check.name}</div>
                  <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{check.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
            <strong>Important:</strong> This is an automated pre-check based on available public records. It does not constitute legal advice or any form of approval. Always obtain official clearances from Raipur Municipal Corporation (RMC) and Raipur Development Authority (RDA) before proceeding.
          </div>

          <button
            onClick={() => { setRan(false); setIntent(null); }}
            className="mt-3 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            ← Change selection
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Service request flow ─────────────────────────────────────────────────────
function ServicePanel({ parcel }: { parcel: Parcel }) {
  const [step, setStep] = useState<'list' | 'form' | 'tracking'>('list');
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', notes: '' });

  const myRequests = SERVICE_REQUESTS.filter(r => r.parcelId === parcel.id).slice(0, 3);

  const handleSubmit = () => {
    const tId = `TRK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    setTrackingId(tId);
    setStep('tracking');
  };

  if (step === 'tracking' && trackingId) {
    const activeStep = 1; // Demo: "Received" stage
    return (
      <div className="citizen-card mb-4">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <div className="font-bold text-white text-lg">Request Submitted!</div>
          <div className="text-sm text-slate-400 mt-1">Your tracking number:</div>
          <div className="font-mono text-cyan-300 font-bold text-lg mt-1">{trackingId}</div>
        </div>

        {/* Timeline */}
        <div className="space-y-0 mb-5">
          {TIMELINE_STEPS.map((s, i) => (
            <div key={s} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  i < activeStep ? 'bg-emerald-500 border-emerald-500' :
                  i === activeStep ? 'bg-indigo-600 border-indigo-400' :
                  'bg-slate-800 border-slate-700'
                }`}>
                  {i < activeStep
                    ? <CheckCircle2 size={13} className="text-white" />
                    : <span className="text-[10px] font-bold text-slate-300">{i + 1}</span>
                  }
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`w-0.5 h-6 ${i < activeStep ? 'bg-emerald-500/50' : 'bg-slate-700/50'}`} />
                )}
              </div>
              <div className={`pb-2 ${i === TIMELINE_STEPS.length - 1 ? '' : 'mb-0'}`}>
                <div className={`text-sm font-medium ${
                  i < activeStep ? 'text-emerald-400' :
                  i === activeStep ? 'text-indigo-300' : 'text-slate-600'
                }`}>{s}</div>
                {i === activeStep && (
                  <div className="text-[11px] text-slate-500 mt-0.5">Processing — expected within 7 working days</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { setStep('list'); setSelectedService(null); setTrackingId(''); }}
          className="w-full citizen-btn-ghost text-sm">
          ← Back to Services
        </button>
      </div>
    );
  }

  if (step === 'form' && selectedService) {
    return (
      <div className="citizen-card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{selectedService.icon}</span>
          <div>
            <div className="font-bold text-white">{selectedService.title}</div>
            <div className="text-xs text-slate-500">{parcel.address}</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Your Full Name *</label>
            <input
              className="form-input text-sm"
              placeholder="Enter your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Mobile Number *</label>
            <input
              className="form-input text-sm"
              placeholder="+91 xxxxxxxxxx"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Parcel Reference</label>
            <input className="form-input text-sm opacity-60 cursor-not-allowed" value={`${parcel.id} — ${parcel.ulpin}`} readOnly />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Additional Notes</label>
            <textarea
              className="form-input text-sm resize-none"
              rows={3}
              placeholder="Any additional information..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Document upload (demo) */}
          <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-4 text-center">
            <UploadCloud size={20} className="text-slate-500 mx-auto mb-2" />
            <div className="text-xs text-slate-500">Tap to upload documents</div>
            <div className="text-[11px] text-slate-600 mt-1">Aadhaar, Previous RoR, Registration Deed</div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.name || !form.phone}
          className="w-full citizen-btn-primary disabled:opacity-40 disabled:cursor-not-allowed mb-2"
        >
          Submit Request <ArrowRight size={14} />
        </button>
        <button onClick={() => setStep('list')} className="w-full citizen-btn-ghost text-sm">← Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4">
      {/* Service catalogue */}
      <div className="citizen-card">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-blue-600" />
          <span className="font-bold text-slate-900">Apply for a Service</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {SERVICES.map(svc => (
            <button
              key={svc.id}
              onClick={() => { setSelectedService(svc); setStep('form'); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all text-left group shadow-2xs"
            >
              <span className="text-xl flex-shrink-0">{svc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{svc.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{svc.desc}</div>
              </div>
              <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Existing requests */}
      {myRequests.length > 0 && (
        <div className="citizen-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-slate-500" />
            <span className="font-semibold text-slate-900 text-sm">Recent Requests</span>
          </div>
          <div className="space-y-3">
            {myRequests.map(req => {
              const stage = req.status === 'Completed' ? 5 : req.status === 'In Progress' ? 2 : req.status === 'Submitted' ? 0 : 1;
              return (
                <div key={req.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{req.type}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{req.trackingId}</div>
                    </div>
                    <span className={`chip text-[10px] font-semibold border px-2 py-0.5 rounded-md flex-shrink-0 ${
                      req.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : req.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  {/* Mini timeline */}
                  <div className="flex items-center gap-1">
                    {TIMELINE_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full ${i <= stage ? 'bg-blue-600' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 font-medium">
                    {TIMELINE_STEPS[Math.min(stage, TIMELINE_STEPS.length - 1)]} · Expected: {req.expectedDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Citizen AI chat ──────────────────────────────────────────────────────────
function CitizenAI({ parcel }: { parcel: Parcel }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = (text?: string) => {
    const q = text || input;
    if (!q.trim()) return;
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setTimeout(() => {
      const prompt = CITIZEN_PROMPTS.find(p => q.toLowerCase().includes(p.q.toLowerCase().split(' ')[1] || ''));
      const answer = prompt ? prompt.a(parcel.id) : `I can help you understand information about parcel ${parcel.id}. This parcel is located at ${parcel.address} with ${parcel.areaAcres} acres of ${parcel.landUse} land. For legal advice or official information, please contact the relevant government department.`;
      setMessages(m => [...m, { role: 'bot', text: answer }]);
    }, 600);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Sparkles size={22} className="text-white" />
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            className="fixed bottom-0 right-0 left-0 sm:bottom-4 sm:right-4 sm:left-auto z-50 w-full sm:w-96 bg-white border border-slate-200 sm:rounded-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80 sm:rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shadow-xs">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">LandLens Assistant</div>
                  <div className="text-[10px] text-slate-500">Ask about your land in plain language</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-white">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 text-center mb-3">Ask me anything about this parcel</p>
                  {CITIZEN_PROMPTS.map(p => (
                    <button
                      key={p.q}
                      onClick={() => handleSend(p.q)}
                      className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-colors leading-relaxed"
                    >
                      &ldquo;{p.q}&rdquo;
                    </button>
                  ))}
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200/80'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 sm:rounded-b-2xl">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about this land…"
                  className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                />
                <button onClick={() => handleSend()} className="text-blue-600 hover:text-blue-800 transition-colors">
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">Answers use available parcel records. Not legal advice.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CitizenPage() {
  const [query, setQuery] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'build' | 'services'>('info');
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedReq, setTrackedReq] = useState<typeof SERVICE_REQUESTS[0] | null>(null);
  const [showTrack, setShowTrack] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const searchResults = query.length >= 2
    ? PARCELS.filter(p =>
        p.ulpin.toLowerCase().includes(query.toLowerCase()) ||
        p.khasraNo.toLowerCase().includes(query.toLowerCase()) ||
        p.surveyNo?.toLowerCase().includes(query.toLowerCase()) ||
        p.village.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase()) ||
        p.address.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSelect = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setQuery('');
    setActiveTab('info');
    setShowTrack(false);
  };

  const handleTrack = () => {
    const req = SERVICE_REQUESTS.find(r =>
      r.trackingId.toLowerCase() === trackQuery.toLowerCase() ||
      r.id.toLowerCase() === trackQuery.toLowerCase()
    );
    setTrackedReq(req || null);
  };

  const zoning = selectedParcel ? ZONING_RECORDS.find(z => z.parcelId === selectedParcel.id) : null;
  const envRestrictions = selectedParcel ? ENVIRONMENTAL_RESTRICTIONS.filter(r => r.parcelId === selectedParcel.id) : [];
  const activeLitigation = selectedParcel ? LITIGATIONS.filter(l => l.parcelId === selectedParcel.id && l.status === 'Active') : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ── Citizen Nav ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="text-white text-[10px] font-bold">LL</span>
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-slate-900">LandLens</span>
              <span className="text-[10px] text-slate-500 ml-1.5 font-medium">Citizen Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowTrack(t => !t); setSelectedParcel(null); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs font-semibold"
            >
              <Hash size={12} /> Track
            </button>
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-900 transition-colors hidden sm:block font-medium">
              Officer Login →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pb-32">

        {/* ── Hero ──────────────────────────────────────────────── */}
        {!selectedParcel && !showTrack && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-10 pb-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-5">
              <Shield size={11} /> Official land information · Raipur, Chhattisgarh
            </div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-3 leading-tight tracking-tight">
              Understand your land.<br className="hidden sm:block" />
              <span className="gradient-text">One parcel at a time.</span>
            </h1>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              Search by <GlossaryTip term="Khasra" /> number, <GlossaryTip term="ULPIN" />, survey number, or location.
              Get plain-language information about any plot.
            </p>
          </motion.div>
        )}

        {/* ── Search ────────────────────────────────────────────── */}
        {!showTrack && (
          <div className="mb-6">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Khasra number, ULPIN, Survey No., Village or Address…"
                className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all outline-none"
                autoFocus={!selectedParcel}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}

              {/* Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl z-50 divide-y divide-slate-100">
                  {searchResults.map(parcel => (
                    <button
                      key={parcel.id}
                      onClick={() => handleSelect(parcel)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <MapPin size={14} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{parcel.id} — {parcel.village}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">{parcel.address}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-mono font-medium text-slate-600">{parcel.ulpin}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-600">{parcel.landUse}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-600">Khasra {parcel.khasraNo}</span>
                        </div>
                      </div>
                      <span className={`chip text-[10px] flex-shrink-0 ${STATUS_COLORS[parcel.status] || ''}`}>
                        {parcel.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick samples + CTAs */}
            {!selectedParcel && !query && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { label: 'P001 · Tatibandh', id: 'P001' },
                    { label: 'P006 · Amanaka', id: 'P006' },
                    { label: 'P013 · Pachpedi Naka', id: 'P013' },
                    { label: 'P009 · Devendra Nagar', id: 'P009' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => { const p = PARCELS.find(p => p.id === s.id); if (p) handleSelect(p); }}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 shadow-2xs transition-colors font-medium"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 justify-center mt-2">
                  <Link href="/map" className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border border-slate-700/40 text-slate-400 hover:text-slate-300 hover:border-slate-600/60 transition-colors">
                    <Map size={13} /> Explore Map
                  </Link>
                  <button onClick={() => setShowTrack(true)} className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border border-slate-700/40 text-slate-400 hover:text-slate-300 hover:border-slate-600/60 transition-colors">
                    <Clock size={13} /> Track Service
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Track Application ─────────────────────────────────── */}
        {showTrack && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setShowTrack(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={16} />
              </button>
              <h2 className="font-bold text-white">Track Application</h2>
            </div>

            <div className="citizen-card mb-4">
              <p className="text-sm text-slate-400 mb-3">Enter your tracking number to check status</p>
              <div className="flex gap-2">
                <input
                  className="form-input text-sm flex-1"
                  placeholder="e.g. TRK-2024-001001"
                  value={trackQuery}
                  onChange={e => setTrackQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                />
                <button onClick={handleTrack} className="citizen-btn-primary px-4 py-2 text-sm whitespace-nowrap">
                  Search
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {['TRK-2024-001001', 'TRK-2024-002002', 'TRK-2024-004004'].map(tid => (
                  <button key={tid} onClick={() => { setTrackQuery(tid); }} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/30 text-slate-500 hover:text-slate-300 transition-colors">
                    {tid}
                  </button>
                ))}
              </div>
            </div>

            {trackedReq && (
              <div className="citizen-card">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <div className="font-bold text-white">{trackedReq.type}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{trackedReq.citizenName} · {trackedReq.department}</div>
                    <div className="font-mono text-[11px] text-cyan-400 mt-1">{trackedReq.trackingId}</div>
                  </div>
                  <span className={`chip text-[10px] flex-shrink-0 ${trackedReq.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400' : trackedReq.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {trackedReq.status}
                  </span>
                </div>

                {/* Full timeline */}
                {(() => {
                  const stage = trackedReq.status === 'Completed' ? 5 : trackedReq.status === 'In Progress' ? 2 : trackedReq.status === 'Submitted' ? 0 : 1;
                  return (
                    <div className="space-y-0">
                      {TIMELINE_STEPS.map((s, i) => (
                        <div key={s} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                              i < stage ? 'bg-emerald-500 border-emerald-500' :
                              i === stage ? 'bg-indigo-600 border-indigo-400 ring-2 ring-indigo-500/30' :
                              'bg-slate-800 border-slate-700'
                            }`}>
                              {i < stage
                                ? <CheckCircle2 size={14} className="text-white" />
                                : <span className="text-[11px] font-bold text-slate-300">{i + 1}</span>
                              }
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                              <div className={`w-0.5 h-7 ${i < stage ? 'bg-emerald-500/40' : 'bg-slate-700/40'}`} />
                            )}
                          </div>
                          <div className="pb-1 pt-1.5">
                            <div className={`text-sm font-medium ${
                              i < stage ? 'text-emerald-400' :
                              i === stage ? 'text-white' : 'text-slate-600'
                            }`}>{s}</div>
                            {i === stage && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Current stage · Expected by {trackedReq.expectedDate}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {trackedReq.remarks && (
                  <div className="mt-4 px-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-300">
                    <strong>Officer Note:</strong> {trackedReq.remarks}
                  </div>
                )}
              </div>
            )}

            {trackQuery && !trackedReq && (
              <div className="citizen-card text-center py-8 text-slate-500 text-sm">
                No application found for &ldquo;{trackQuery}&rdquo;. Try one of the sample IDs above.
              </div>
            )}
          </motion.div>
        )}

        {/* ── Parcel Result ─────────────────────────────────────── */}
        {selectedParcel && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* Parcel header */}
            <div className="citizen-card mb-4">
              {/* Status + ID */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-mono text-[10px] text-slate-600 mb-0.5">{selectedParcel.ulpin}</div>
                  <div className="font-heading font-bold text-xl text-white">{selectedParcel.id}</div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-0.5">
                    <MapPin size={11} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">{selectedParcel.address}</span>
                  </div>
                </div>
                <span className={`chip text-[10px] flex-shrink-0 ${STATUS_COLORS[selectedParcel.status] || ''}`}>
                  {selectedParcel.status}
                </span>
              </div>

              {/* Key facts grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { k: 'Land Use', v: selectedParcel.landUse },
                  { k: 'Area', v: `${selectedParcel.areaAcres} acres` },
                  { k: 'Khasra No.', v: selectedParcel.khasraNo },
                  { k: 'Zoning', v: selectedParcel.zoning },
                  { k: 'Village', v: selectedParcel.village },
                  { k: 'Survey No.', v: selectedParcel.surveyNo },
                ].map(({ k, v }) => (
                  <div key={k} className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{k}</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              {/* Quick action */}
              <Link
                href={`/parcels/${selectedParcel.id}`}
                className="flex items-center justify-center gap-2 w-full text-xs py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-semibold transition-colors"
              >
                View Full Parcel 360° <ArrowRight size={12} />
              </Link>
            </div>

            {/* At-a-glance */}
            <ParcelSummaryCard parcel={selectedParcel} />

            {/* Tabs */}
            <div className="flex gap-1.5 mb-4 bg-slate-100/90 border border-slate-200 p-1 rounded-2xl">
              {([
                { id: 'info' as const, label: 'Land Info', icon: <FileText size={13} /> },
                { id: 'build' as const, label: 'Can I Build?', icon: <Building2 size={13} /> },
                { id: 'services' as const, label: 'Services', icon: <Clock size={13} /> },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ── Info tab ── */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                {/* Land use & zoning */}
                <div className="citizen-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="citizen-section-title text-slate-500 font-bold uppercase tracking-wider text-[11px] mb-3">Land Use & Zoning</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Current Land Use</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedParcel.landUse}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <GlossaryTip term="Zoning" /> Category
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{selectedParcel.zoning}</span>
                    </div>
                    {zoning && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-500">Master Plan</span>
                          <span className="text-sm font-semibold text-slate-900">{zoning.masterPlanPhase}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-500">FSI Allowed</span>
                          <span className="text-sm font-semibold text-slate-900">{zoning.fsi}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-500">Max Height</span>
                          <span className="text-sm font-semibold text-slate-900">{zoning.maxHeight}m</span>
                        </div>
                        {zoning.roadReservation && (
                          <div className="flex items-start gap-2.5 mt-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                            <AlertTriangle size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-rose-900">Road Reservation Buffer</div>
                              <div className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                                This parcel falls within a {zoning.roadWidth}m road expansion corridor. Development is restricted. Verify with RDA before any activity.
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Restrictions & Encumbrances */}
                <div className="citizen-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="citizen-section-title text-slate-500 font-bold uppercase tracking-wider text-[11px] mb-3">Restrictions & <GlossaryTip term="Encumbrance" /></div>
                  {envRestrictions.length === 0 && activeLitigation.length === 0 ? (
                    <div className="flex items-center gap-2 py-2 text-sm text-emerald-700 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      No restrictions or active court cases found in connected records.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {envRestrictions.map(r => (
                        <div key={r.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200">
                          <XCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-semibold text-rose-900">{r.type}</div>
                            <div className="text-xs text-rose-700 mt-0.5">{r.description}</div>
                            <div className="text-[10px] text-slate-500 mt-1">Authority: {r.authority}</div>
                          </div>
                        </div>
                      ))}
                      {activeLitigation.map(l => (
                        <div key={l.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-semibold text-amber-900">Active Court Case</div>
                            <div className="text-xs text-amber-700 mt-0.5">Case No: {l.caseNo} · {l.caseType}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{l.court} · Next hearing: {l.nextHearingDate || 'TBD'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 italic mt-3">
                    For legal encumbrances, obtain an <GlossaryTip term="Encumbrance" /> Certificate from the Sub-Registrar Office.
                  </p>
                </div>

                {/* Registration/Application status */}
                <div className="citizen-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="citizen-section-title text-slate-500 font-bold uppercase tracking-wider text-[11px] mb-3">Registration & Application Status</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Parcel Status</span>
                      <span className={`chip text-[10px] ${STATUS_COLORS[selectedParcel.status] || ''}`}>{selectedParcel.status}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Ownership Records</span>
                      <span className={`text-xs font-semibold ${selectedParcel.dataHealth.ownership === 'verified' ? 'text-emerald-700' : selectedParcel.dataHealth.ownership === 'conflict' ? 'text-rose-700' : 'text-amber-700'}`}>
                        {selectedParcel.dataHealth.ownership === 'verified' ? 'Verified' : selectedParcel.dataHealth.ownership === 'conflict' ? 'Conflict detected' : selectedParcel.dataHealth.ownership === 'attention' ? 'Needs attention' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-500">Building Permission</span>
                      <span className={`text-xs font-semibold ${selectedParcel.dataHealth.buildingPermission === 'verified' ? 'text-emerald-700' : selectedParcel.dataHealth.buildingPermission === 'unavailable' ? 'text-slate-400' : 'text-amber-700'}`}>
                        {selectedParcel.dataHealth.buildingPermission === 'verified' ? 'On record' : selectedParcel.dataHealth.buildingPermission === 'unavailable' ? 'No records' : 'Needs attention'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic mt-3">
                    Publicly available status only. For official certified extracts, visit the Revenue Tehsildar or Sub-Registrar.
                  </p>
                </div>

                {/* Transparency */}
                <TransparencyPanel parcel={selectedParcel} />

                {/* Glossary strip */}
                <div className="citizen-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="citizen-section-title text-slate-500 font-bold uppercase tracking-wider text-[11px] mb-3">Land terms explained</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(GLOSSARY).map(term => (
                      <GlossaryTip key={term} term={term} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Build Check tab ── */}
            {activeTab === 'build' && <BuildCheckPanel parcel={selectedParcel} />}

            {/* ── Services tab ── */}
            {activeTab === 'services' && <ServicePanel parcel={selectedParcel} />}
          </motion.div>
        )}

        {/* ── Empty state ─────────────────────────────────────────── */}
        {!selectedParcel && !showTrack && !query && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2">
            {[
              { icon: <Search size={20} />, title: 'Search Any Parcel', desc: 'Find parcels by Khasra, ULPIN, survey number or address', color: 'text-blue-600 bg-blue-50 border border-blue-200' },
              { icon: <Building2 size={20} />, title: 'Can I Build Here?', desc: 'Check zoning and restrictions before starting any construction', color: 'text-indigo-600 bg-indigo-50 border border-indigo-200' },
              { icon: <Clock size={20} />, title: 'Track Applications', desc: 'Check status of mutation requests, RoR copies and services', color: 'text-emerald-600 bg-emerald-50 border border-emerald-200' },
            ].map(item => (
              <div key={item.title} className="citizen-card bg-white border border-slate-200 rounded-2xl text-center py-6 px-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>{item.icon}</div>
                <div className="font-bold text-slate-900 text-sm mb-1">{item.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI assistant floating button (only when parcel selected) */}
      {selectedParcel && <CitizenAI parcel={selectedParcel} />}
    </div>
  );
}
