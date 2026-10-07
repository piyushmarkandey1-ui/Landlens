'use client';

import { useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight,
  Database, FileCheck2, GitMerge, Layers,
  Play, ShieldCheck, Waypoints,
  FileText, Users, Activity
} from 'lucide-react';

const sources = [
  { name: 'Record of Rights', code: 'BHU-RoR', records: '8.9M', status: 'Live Sync', desc: 'Ownership, tenancy, mutation history' },
  { name: 'Cadastral Maps', code: 'BNAKSHA', records: '6.2M', status: 'Geo-rectified', desc: 'Polygon boundaries, geo-coordinates' },
  { name: 'Registration', code: 'DORIS', records: '4.1M', status: 'Active', desc: 'Deed registration, encumbrances' },
  { name: 'Master Plan 2031', code: 'RDA-GIS', records: '48 Zones', status: 'Enforced', desc: 'Zoning classification, road buffers' },
  { name: 'Municipal Tax', code: 'RMC-TAX', records: '1.2M', status: 'Connected', desc: 'Assessment IDs, utility linkage' },
  { name: 'Satellite AI', code: 'ISRO-CART', records: 'Monthly', status: 'Monitoring', desc: 'Encroachment & change detection' },
];

const metrics = [
  { value: '630M+', label: 'Addressable Parcels', sub: 'National cadastre scope' },
  { value: '10+', label: 'Connected Registries', sub: 'Real-time multi-agency sync' },
  { value: '4.2×', label: 'Faster Resolution', sub: 'Dispute turnaround time' },
  { value: '100%', label: 'ULPIN Standard', sub: 'ISO 19152 compliant' },
];

function generateSpherePoints(count: number, radius = 1.25): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const z = Math.random() * 2 - 1;
    const mag = Math.sqrt(x * x + y * y + z * z) || 1;
    const r = Math.cbrt(u) * radius;
    positions[i * 3] = (x / mag) * r;
    positions[i * 3 + 1] = (y / mag) * r;
    positions[i * 3 + 2] = (z / mag) * r;
  }
  return positions;
}

function ParcelPointField() {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => generateSpherePoints(1000, 1.25));

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.x = Math.sin(Date.now() / 6000) * 0.05;
    }
  });

  return (
    <group rotation={[0.15, 0, -0.15]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#C6A75E"
          size={0.007}
          sizeAttenuation
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  );
}

function ParcelConsole() {
  const [activeLayer, setActiveLayer] = useState<'all' | 'ror' | 'zoning' | 'satellite'>('all');

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Top telemetry bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 bg-slate-50/80">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-slate-900 font-semibold">ULPIN: CG-RPR-492001-00427</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-medium">
            21°15&apos;32&quot;N · 81°37&apos;48&quot;E
          </span>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative h-[320px] w-full bg-gradient-to-b from-slate-50/50 via-white to-blue-50/20">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* 3D points */}
        <Canvas camera={{ position: [0, 0, 1.2], fov: 46 }}>
          <ambientLight intensity={0.9} />
          <ParcelPointField />
        </Canvas>

        {/* Central Parcel Wireframe Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="relative w-44 h-44 rounded-xl border border-blue-500/40 bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-600" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-600" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-600" />

            {/* Inner crosshair info */}
            <div className="text-center font-mono p-3 bg-white/95 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[10px] text-blue-700 font-bold tracking-wider">PARCEL #427</div>
              <div className="text-xs text-slate-900 font-bold mt-0.5">2.40 ACRES</div>
              <div className="text-[9px] text-emerald-700 mt-1 flex items-center justify-center gap-1 font-semibold">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> VERIFIED CADASTRE
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating spatial badges */}
        <div className="absolute top-4 left-4 bg-white/95 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-700 shadow-xs">
          <span className="text-slate-400">Zone:</span> <span className="text-blue-700 font-semibold">Residential R-2</span>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/95 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-700 shadow-xs">
          <span className="text-slate-400">Khasra:</span> <span className="text-emerald-700 font-semibold">142/1 &amp; 142/2</span>
        </div>
      </div>

      {/* Layer selector bar */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider pl-1 hidden sm:inline font-semibold">
          Active Layers:
        </span>
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {[
            { id: 'all' as const, label: 'Composite' },
            { id: 'ror' as const, label: 'RoR Data' },
            { id: 'zoning' as const, label: 'Zoning' },
            { id: 'satellite' as const, label: 'Satellite' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveLayer(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeLayer === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
    <main className="landing-page-wrapper min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-blue-500/20 selection:text-blue-800">
      {/* ── Minimalist White Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="gradient-brand w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              LL
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900">
                LandLens
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded font-semibold">
                DILRMP GIS
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link href="/map" className="hover:text-blue-600 transition-colors">Cadastral Map</Link>
            <Link href="/parcels/P-00427" className="hover:text-blue-600 transition-colors">Parcel Registry</Link>
            <Link href="/technical-architecture" className="hover:text-blue-600 transition-colors">Architecture</Link>
            <Link href="/analytics" className="hover:text-blue-600 transition-colors">District Analytics</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all"
            >
              <span>Platform Login</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section (White & Light Professional) ── */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-slate-200/80 bg-white overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Value Prop */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold tracking-wide"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>INTELLIGENCE LAYER FOR INDIA&apos;S LAND STACK</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]"
              >
                One Parcel.{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Every Point of Truth.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal"
              >
                Connect fragmented cadastral maps, Record of Rights (RoR), deed registrations,
                and master plans into a single verified spatial evidence graph powered by ULPIN.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3.5 pt-2"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-blue-600" />
                  <span>Cadastral GIS Demo</span>
                </Link>
              </motion.div>

              {/* Metrics bar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                {metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                      {m.value}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{m.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: 3D Parcel Console */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-6 xl:col-span-5"
            >
              <ParcelConsole />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 1: Connected Evidence Graph ── */}
      <section className="py-20 border-b border-slate-200/80 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
              01 / Architecture
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-1.5 font-display">
              Connected Evidence Graph
            </h2>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Every parcel functions as an index across disparate government databases.
              Instead of hunting through siloed portals, officers and citizens see one unified spatial story.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {sources.map((s, i) => (
              <div
                key={s.name}
                onClick={() => setSelectedSource(i)}
                className={`cursor-pointer rounded-xl border p-5 transition-all bg-white ${
                  selectedSource === i
                    ? 'border-blue-500/80 shadow-md ring-1 ring-blue-500/20'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {s.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-bold text-slate-900">{s.name}</div>
                  <div className="font-mono text-[11px] text-slate-500 mt-0.5">{s.code}</div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">Records: {s.records}</span>
                  <span className="text-blue-600 font-semibold text-[11px] flex items-center gap-1">
                    Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Section 2: Land Truth Engine & Conflict Resolution ── */}
      <section className="py-20 border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left: Conflict card simulation */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                      <Waypoints className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Discrepancy Engine Alert</div>
                      <div className="font-mono text-[11px] text-slate-500">Parcel ULPIN: CG-RPR-492001-00104</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    High Severity
                  </span>
                </div>

                {/* Evidence comparison grid */}
                <div className="grid sm:grid-cols-3 gap-3 my-6">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] font-mono text-slate-500 font-medium">Record of Rights (RoR)</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">2.40 <span className="text-xs text-slate-500 font-normal">acres</span></div>
                    <div className="text-[10px] text-slate-400 mt-1">B-1 Khasra Entry 2023</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] font-mono text-slate-500 font-medium">Registered Deed</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">2.10 <span className="text-xs text-slate-500 font-normal">acres</span></div>
                    <div className="text-[10px] text-slate-400 mt-1">Sale Deed #8914/2021</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="text-[11px] font-mono text-amber-800 font-bold">Variance Detected</div>
                    <div className="text-xl font-bold text-amber-900 mt-1">0.30 <span className="text-xs text-amber-700 font-normal">acres</span></div>
                    <div className="text-[10px] text-amber-700 mt-1 font-medium">Field survey required</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">Recommended Action:</strong> Auto-dispatch task to Circle Officer for physical DGPS boundary survey.
                  </div>
                  <Link
                    href="/alerts"
                    className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Open Workflow
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Narrative */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                02 / Automated Governance
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight font-display">
                When Records Disagree, Spatial Evidence Resolves.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Land disputes usually fester in the gap between the Sub-Registrar&apos;s deed and the Revenue Tehsildar&apos;s record. LandLens cross-validates records against spatial ground truths.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Immutable audit trails linked to departmental source APIs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <GitMerge className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Automated multi-jurisdictional boundary conflict flags</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Actionable workflows with statutory SLA tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 3: Built for Every Stakeholder ── */}
      <section className="py-20 border-b border-slate-200/80 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
              03 / Persona Experience
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-1.5 font-display">
              Built for the Entire Land Ecosystem
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              One platform with tailored operational interfaces for each stakeholder.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {[
              {
                role: 'Citizen',
                href: '/citizen',
                icon: <Users className="w-5 h-5 text-emerald-600" />,
                title: 'Citizen Portal',
                desc: 'Instant parcel checks, "Can I build here?" analysis, and service request tracking without middlemen.',
              },
              {
                role: 'Revenue Officer',
                href: '/revenue',
                icon: <FileText className="w-5 h-5 text-amber-600" />,
                title: 'Revenue & RoR',
                desc: 'Mutation reviews, ownership lineage, encumbrance flags, and field survey dispatching.',
              },
              {
                role: 'Urban Planner',
                href: '/planning',
                icon: <Layers className="w-5 h-5 text-blue-600" />,
                title: 'Planning & Zoning',
                desc: 'Master plan alignment, road reservation overlays, and environmental restriction checks.',
              },
              {
                role: 'Administrator',
                href: '/dashboard',
                icon: <Activity className="w-5 h-5 text-indigo-600" />,
                title: 'District Command',
                desc: 'Executive analytics, conflict density heatmaps, departmental SLAs, and escalation queues.',
              },
            ].map((card) => (
              <Link
                key={card.role}
                href={card.href}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 inline-block mb-3.5">
                    {card.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                  <span>Enter portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 bg-white text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">LandLens</span>
            <span>·</span>
            <span>Digital Public Infrastructure for India&apos;s Land Stack</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] text-slate-600">
            <Link href="/map" className="hover:text-blue-600 transition-colors font-semibold">GIS Map</Link>
            <Link href="/technical-architecture" className="hover:text-blue-600 transition-colors font-semibold">Architecture</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors font-semibold">Demo Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
