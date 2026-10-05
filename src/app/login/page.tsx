'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_USERS, ROLE_LABELS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import {
  ArrowRight, Users, FileText, Layers, GitMerge, BarChart3,
  Settings, Shield, CheckCircle2, Sparkles, MapPin, Lock, Map
} from 'lucide-react';
import Link from 'next/link';

/* ── Role config ── */
const ROLES: Record<UserRole, {
  icon: React.ReactNode;
  desc: string;
  access: string[];
  accent: string;
  bgLight: string;
  borderLight: string;
}> = {
  citizen: {
    icon: <Users className="w-4 h-4" />,
    desc: 'Public parcel lookup, land use checks, "Can I build here?" automated analysis, and application tracking.',
    access: ['Public parcel records', 'Land use & zoning lookup', '"Can I build here?" tool', 'Service request tracking'],
    accent: '#16a34a', bgLight: '#f0fdf4', borderLight: '#bbf7d0',
  },
  revenue_officer: {
    icon: <FileText className="w-4 h-4" />,
    desc: 'Access Record of Rights (RoR), ownership lineage, dispute resolutions, and dispatch field survey teams.',
    access: ['Record of Rights (B-1/P-II)', 'Ownership & mutation history', 'Conflict resolution queue', 'Physical survey dispatch'],
    accent: '#d97706', bgLight: '#fffbeb', borderLight: '#fde68a',
  },
  planning_officer: {
    icon: <Layers className="w-4 h-4" />,
    desc: 'Review Master Plan 2031 alignments, road reservation buffers, and environmental spatial restrictions.',
    access: ['Zoning & Master Plan layers', 'Building permission review', 'Road reservation overlays', 'Satellite change detection'],
    accent: '#2563eb', bgLight: '#eff6ff', borderLight: '#bfdbfe',
  },
  registration_officer: {
    icon: <GitMerge className="w-4 h-4" />,
    desc: 'Validate deed registrations, check encumbrance status, and inspect cross-departmental record matches.',
    access: ['Deed registration records', 'Transaction & encumbrances', 'Document verification workflow', 'Revenue cross-check alerts'],
    accent: '#7c3aed', bgLight: '#fdf4ff', borderLight: '#e9d5ff',
  },
  district_admin: {
    icon: <BarChart3 className="w-4 h-4" />,
    desc: 'Executive district analytics, conflict density heatmaps, departmental performance KPIs, and escalations.',
    access: ['District executive command', 'Conflict hotspot heatmaps', 'Departmental SLA analytics', 'Inter-agency workflow escalation'],
    accent: '#0891b2', bgLight: '#f0f9ff', borderLight: '#bae6fd',
  },
  system_admin: {
    icon: <Settings className="w-4 h-4" />,
    desc: 'Manage administrative roles, federated data connectors, API health, audit trails, and system schema.',
    access: ['User & role administration', 'Dataset connector registry', 'Audit logs & telemetry', 'Schema version control'],
    accent: '#4f46e5', bgLight: '#eef2ff', borderLight: '#c7d2fe',
  },
};

const ORDER: UserRole[] = [
  'district_admin', 'revenue_officer', 'planning_officer',
  'registration_officer', 'citizen', 'system_admin',
];

export default function LoginPage() {
  const [selected, setSelected] = useState<UserRole>('district_admin');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 450));
    login(selected);
    router.push(selected === 'citizen' ? '/citizen' : '/dashboard');
  };

  const cfg = ROLES[selected];
  const user = DEMO_USERS[selected];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 parcel-grid-bg pointer-events-none opacity-40" />

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] -top-36 -left-36 rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute w-[450px] h-[450px] -bottom-24 -right-24 rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* ── Brand Header ── */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="gradient-brand w-8 h-8 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-base tracking-tight text-slate-900 block leading-tight">
                LandLens
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                GIS Intelligence Platform
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Select Demonstration Persona
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulated Raipur District environment — no credentials required
          </p>

          <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-medium">
            <Shield className="w-3 h-3 text-amber-600" />
            <span>Demonstration Environment · Synthetic Cadastral Data</span>
          </div>
        </motion.div>

        {/* ── Balanced 2-Column Role Card ── */}
        <motion.div
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="grid md:grid-cols-[270px_1fr]">
            {/* Left: Role list */}
            <div className="bg-slate-50/70 border-r border-slate-200/80 p-3 flex flex-col justify-between">
              <div>
                <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Select Role
                </div>
                <div className="space-y-1">
                  {ORDER.map((role) => {
                    const r = ROLES[role];
                    const isActive = selected === role;
                    return (
                      <button
                        key={role}
                        onClick={() => setSelected(role)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                          isActive
                            ? 'bg-white shadow-sm border border-slate-200/90 text-slate-900 font-semibold'
                            : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 border border-transparent'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{
                            background: isActive ? r.bgLight : 'rgba(0,0,0,0.04)',
                            color: isActive ? r.accent : '#64748b',
                          }}
                        >
                          {r.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs truncate leading-tight">
                            {ROLE_LABELS[role]}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                            {DEMO_USERS[role].department ?? 'Public Portal'}
                          </div>
                        </div>
                        {isActive && (
                          <motion.span
                            layoutId="activeRoleIndicator"
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: r.accent }}
                            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 px-2 flex items-center justify-between text-[11px] text-slate-400">
                <Link href="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
                  <Map className="w-3 h-3" /> Landing page
                </Link>
                <span>6 Personas</span>
              </div>
            </div>

            {/* Right: Selected Role Profile & Launch */}
            <div className="p-6 flex flex-col justify-between bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5"
                >
                  {/* Persona Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: cfg.bgLight, color: cfg.accent, border: `1px solid ${cfg.borderLight}` }}
                    >
                      {cfg.icon}
                      {ROLE_LABELS[selected]}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Raipur District
                    </span>
                  </div>

                  {/* User Profile Card */}
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div
                      className="gradient-brand w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
                    >
                      {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cfg.desc}
                  </p>

                  {/* Capabilities List */}
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Included Capabilities
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {cfg.access.map((item) => (
                        <div key={item} className="flex items-start gap-1.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: cfg.accent }} />
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-200/70">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.accent}, #4f46e5)`,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading Workspace…
                    </span>
                  ) : (
                    <>
                      <span>Launch {ROLE_LABELS[selected]} Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Clean 3-Metric Bottom Strip ── */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { icon: <MapPin className="w-3.5 h-3.5 text-indigo-600" />, value: '8.9M', label: 'Parcels Tracked' },
            { icon: <Shield className="w-3.5 h-3.5 text-cyan-600" />, value: '6 Depts', label: 'Integrated Agencies' },
            { icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />, value: 'ULPIN', label: 'Standards Compliant' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/70 px-3.5 py-2.5 flex items-center gap-2.5 shadow-xs"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 flex-shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold font-mono text-slate-900 leading-tight">
                  {item.value}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
