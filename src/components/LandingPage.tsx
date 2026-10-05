'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight,
  Database, FileCheck2, GitMerge, Layers, MapPin,
  Play, Shield, ShieldCheck, Sparkles, Waypoints,
  FileText, Users, Eye, Activity
} from 'lucide-react';
// @ts-expect-error maath ships without types
import * as random from 'maath/random/dist/maath-random.esm';

const sources = [
  { name: 'Record of Rights', code: 'BHU-RoR', records: '8.9M', status: 'Live Sync', desc: 'Ownership, tenancy, mutation history' },
  { name: 'Cadastral Maps', code: 'BNAKSHA', records: '6.2M', status: 'Geo-rectified', desc: 'Polygon boundaries, geo-coordinates' },
  { name: 'Registration', code: 'DORIS', records: '4.1M', status: 'Active', desc: 'Deed registration, encumbrances' },
  { name: 'Master Plan 2031', code: 'RDA-GIS', records: '48 Zones', status: 'Enforced', desc: 'Zoning classification, road buffers' },
  { name: 'Municipal Tax', code: 'RMC-TAX', records: '1.2M', status: 'Connected', desc: 'Assessment IDs, utility linkage' },
  { name: 'Satellite AI', code: 'ISRO-CART', records: 'Monthly', status: 'Monitoring', desc: 'Encroachment & change detection' },
];

const metrics = [
  { value: '630M+', label: 'Addressable Parcels', sub: 'National scope' },
  { value: '10+', label: 'Connected Registries', sub: 'Real-time sync' },
  { value: '4.2×', label: 'Faster Resolution', sub: 'Dispute turnaround' },
  { value: '100%', label: 'ULPIN Compliant', sub: 'Standardized cadastre' },
];

function ParcelPointField() {
  const ref = useRef<any>(null);
  const [positions] = useState(() => random.inSphere(new Float32Array(3600), { radius: 1.25 }));

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.x = Math.sin(Date.now() / 6000) * 0.06;
    }
  });

  return (
    <group rotation={[0.15, 0, -0.15]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#38bdf8"
          size={0.007}
          sizeAttenuation
          depthWrite={false}
          opacity={0.65}
        />
      </Points>
    </group>
  );
}

function ParcelConsole() {
  const [activeLayer, setActiveLayer] = useState<'all' | 'ror' | 'zoning' | 'satellite'>('all');

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)] overflow-hidden">
      {/* Top telemetry bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">ULPIN: CG-RPR-492001-00427</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-cyan-400/90 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md">
            21°15&apos;32&quot;N · 81°37&apos;48&quot;E
          </span>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative h-[320px] w-full bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.12),transparent_70%)]">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* 3D points */}
        <Canvas camera={{ position: [0, 0, 1.2], fov: 46 }}>
          <ambientLight intensity={0.7} />
          <ParcelPointField />
        </Canvas>

        {/* Central Parcel Wireframe Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="relative w-44 h-44 rounded-xl border border-cyan-400/40 bg-cyan-500/[0.04] backdrop-blur-[1px] flex items-center justify-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-300" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-300" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-300" />

            {/* Inner crosshair info */}
            <div className="text-center font-mono p-3 bg-slate-950/80 rounded-lg border border-cyan-500/30">
              <div className="text-[10px] text-cyan-300 font-semibold tracking-wider">PARCEL #427</div>
              <div className="text-xs text-white font-bold mt-0.5">2.40 ACRES</div>
              <div className="text-[9px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED BOUNDARY
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating spatial badges */}
        <motion.div
          className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 backdrop-blur-md shadow-lg"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-slate-400">Zone:</span> <span className="text-cyan-300 font-semibold">Residential R-2</span>
        </motion.div>

        <motion.div
          className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 backdrop-blur-md shadow-lg"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-slate-400">Khasra:</span> <span className="text-emerald-300 font-semibold">142/1 &amp; 142/2</span>
        </motion.div>
      </div>

      {/* Layer selector bar */}
      <div className="p-3 border-t border-white/[0.08] bg-slate-950/95 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider pl-1 hidden sm:inline">
          Active Layers:
        </span>
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {[
            { id: 'all', label: 'Composite' },
            { id: 'ror', label: 'RoR Data' },
            { id: 'zoning', label: 'Zoning' },
            { id: 'satellite', label: 'Satellite' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveLayer(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeLayer === tab.id
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [selectedSource, setSelectedSource] = useState(0);

  return (
    <main className="landing-page-wrapper min-h-screen bg-[#060d19] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ── Minimalist Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#060d19]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              LL
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                LandLens
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest bg-cyan-950/70 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                DPI GIS
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <Link href="/map" className="hover:text-cyan-300 transition-colors">Live Map</Link>
            <Link href="/parcels/P-00427" className="hover:text-cyan-300 transition-colors">Parcel Registry</Link>
            <Link href="/technical-architecture" className="hover:text-cyan-300 transition-colors">Architecture</Link>
            <Link href="/analytics" className="hover:text-cyan-300 transition-colors">District Analytics</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#060d19] hover:bg-slate-100 hover:shadow-lg hover:shadow-white/20 transition-all"
            >
              <span className="text-[#060d19]">Platform Login</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#060d19]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden border-b border-white/[0.08]">
        {/* Ambient Radial Lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Value Prop */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/25 bg-cyan-950/40 text-cyan-300 font-mono text-[11px] tracking-wide backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>INTELLIGENCE LAYER FOR INDIA&apos;S LAND STACK</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]"
              >
                One Parcel.{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
                  Every Point of Truth.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-xl"
              >
                Connect fragmented cadastral maps, Record of Rights (RoR), deed registrations,
                and master plans into a single verified evidence graph powered by ULPIN.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3.5 pt-2"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:-translate-y-0.5 transition-all"
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase border border-white/15 bg-white/5 backdrop-blur-md text-slate-200 hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                  <span>Interactive GIS Demo</span>
                </Link>
              </motion.div>

              {/* Metrics bar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                {metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-2xl font-bold font-mono tracking-tight text-white">
                      {m.value}
                    </div>
                    <div className="text-xs font-medium text-slate-300 mt-0.5">{m.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Interactive 3D Parcel Console */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 xl:col-span-5"
            >
              <ParcelConsole />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 1: Connected Evidence Graph ── */}
      <section className="py-24 border-b border-white/[0.08] bg-[#081324]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
              01 / Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Connected Evidence Graph
            </h2>
            <p className="text-slate-400 text-base mt-3 leading-relaxed">
              Every parcel functions as an index across disparate government databases.
              Instead of hunting through siloed portals, officers and citizens see one unified spatial story.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {sources.map((s, i) => (
              <motion.div
                key={s.name}
                whileHover={{ y: -3, borderColor: 'rgba(56, 189, 248, 0.4)' }}
                onClick={() => setSelectedSource(i)}
                className={`cursor-pointer rounded-xl border p-5 transition-all ${
                  selectedSource === i
                    ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-950/50'
                    : 'border-white/[0.08] bg-slate-900/60 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-white/[0.05] text-cyan-400 border border-white/[0.05]">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {s.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-semibold text-white">{s.name}</div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">{s.code}</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500">Volume: {s.records}</span>
                  <span className="text-cyan-400 font-medium text-[11px] flex items-center gap-1">
                    Explore <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Section 2: Land Truth Engine & Conflict Resolution ── */}
      <section className="py-24 border-b border-white/[0.08] relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left: Conflict card simulation */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-rose-500/25 bg-slate-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Waypoints className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Discrepancy Engine Alert</div>
                      <div className="font-mono text-[11px] text-slate-400">Parcel ULPIN: CG-RPR-492001-00104</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    High Severity
                  </span>
                </div>

                {/* Evidence comparison grid */}
                <div className="grid sm:grid-cols-3 gap-3 my-6">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                    <div className="text-[11px] font-mono text-slate-400">Record of Rights (RoR)</div>
                    <div className="text-xl font-bold text-white mt-1">2.40 <span className="text-xs text-slate-400 font-normal">acres</span></div>
                    <div className="text-[10px] text-slate-500 mt-1">B-1 Khasra Entry 2023</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                    <div className="text-[11px] font-mono text-slate-400">Registered Deed</div>
                    <div className="text-xl font-bold text-white mt-1">2.10 <span className="text-xs text-slate-400 font-normal">acres</span></div>
                    <div className="text-[10px] text-slate-500 mt-1">Sale Deed #8914/2021</div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30">
                    <div className="text-[11px] font-mono text-amber-300">Variance Detected</div>
                    <div className="text-xl font-bold text-amber-200 mt-1">0.30 <span className="text-xs text-amber-300/80 font-normal">acres</span></div>
                    <div className="text-[10px] text-amber-300/70 mt-1">Field survey required</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Prescribed Action:</strong> Auto-dispatch task to Circle Officer for physical DGPS boundary survey.
                  </div>
                  <Link
                    href="/alerts"
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
                  >
                    Open Workflow
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Narrative */}
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
                02 / Automated Governance
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                When Records Disagree, Spatial Evidence Resolves.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Land disputes usually fester in the gap between the Sub-Registrar&apos;s deed and the Revenue Tehsildar&apos;s record. LandLens instantly cross-validates records against spatial ground truths.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Immutable audit trails linked to departmental source APIs</span>
                </div>
                <div className="flex items-center gap-3">
                  <GitMerge className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Automated multi-jurisdictional conflict flags</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Actionable workflows with statutory SLA tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 3: Built for Every Stakeholder ── */}
      <section className="py-24 border-b border-white/[0.08] bg-[#07111f]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
              03 / Persona Experience
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Built for the Entire Land Ecosystem
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              One platform with tailored operational interfaces for each stakeholder.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {[
              {
                role: 'Citizen',
                href: '/citizen',
                icon: <Users className="w-5 h-5 text-emerald-400" />,
                title: 'Citizen Portal',
                desc: 'Instant parcel checks, "Can I build here?" analysis, and service request tracking without middlemen.',
              },
              {
                role: 'Revenue Officer',
                href: '/revenue',
                icon: <FileText className="w-5 h-5 text-amber-400" />,
                title: 'Revenue & RoR',
                desc: 'Mutation reviews, ownership lineage, encumbrance flags, and field survey dispatching.',
              },
              {
                role: 'Urban Planner',
                href: '/planning',
                icon: <Layers className="w-5 h-5 text-cyan-400" />,
                title: 'Planning & Zoning',
                desc: 'Master plan alignment, road reservation overlays, and environmental restriction checks.',
              },
              {
                role: 'Administrator',
                href: '/dashboard',
                icon: <Activity className="w-5 h-5 text-indigo-400" />,
                title: 'District Command',
                desc: 'Executive analytics, conflict density heatmaps, departmental SLAs, and escalation queues.',
              },
            ].map((card) => (
              <Link
                key={card.role}
                href={card.href}
                className="group rounded-2xl border border-white/[0.08] bg-slate-900/50 p-6 hover:bg-slate-900/90 hover:border-cyan-400/40 hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] inline-block mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-cyan-400 font-semibold">
                  <span>Enter view</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 bg-[#060d19] text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">LandLens</span>
            <span>·</span>
            <span>Digital Public Infrastructure for Land Intelligence</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <Link href="/map" className="hover:text-cyan-300 transition-colors">GIS Map</Link>
            <Link href="/technical-architecture" className="hover:text-cyan-300 transition-colors">Architecture</Link>
            <Link href="/login" className="hover:text-cyan-300 transition-colors">Demo Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
