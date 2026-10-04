'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Map, Database, Shield, Zap, ArrowRight, ChevronDown, GitMerge,
  AlertTriangle, CheckCircle2, Eye, BarChart3, Layers, Globe,
  FileText, Users, Building2, Landmark, Satellite, Brain,
  Lock, Activity, ChevronRight, Play, Search, Cpu
} from 'lucide-react';

const STATS = [
  { label: 'Land Parcels Across India', value: '630M+', sub: 'addressable via ULPIN' },
  { label: 'Datasets Connected', value: '10+', sub: 'in prototype' },
  { label: 'Conflict Types Detected', value: '10', sub: 'by Land Truth Engine' },
  { label: 'Avg. Resolution Time', value: '4.2×', sub: 'faster with automation' },
];

const FRAGMENTED_SYSTEMS = [
  { name: 'Bhu-Abhilekh', dept: 'Board of Revenue', color: '#6366f1' },
  { name: 'Bhu-Naksha', dept: 'DoLR / NIC', color: '#06b6d4' },
  { name: 'DORIS', dept: 'Registration Dept.', color: '#10b981' },
  { name: 'RMC Tax System', dept: 'Municipal Corp.', color: '#f59e0b' },
  { name: 'RDA Master Plan', dept: 'Development Auth.', color: '#8b5cf6' },
  { name: 'CERSAI', dept: 'Finance Ministry', color: '#ec4899' },
  { name: 'ISRO Bhuvan', dept: 'Space / NRSC', color: '#14b8a6' },
  { name: 'District Courts', dept: 'Law & Justice', color: '#ef4444' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: <Search size={18} />, title: 'Identify the Parcel', desc: 'Search by ULPIN, Khasra number, survey number, or location on the GIS map. Every parcel has a canonical identity.' },
  { step: '02', icon: <GitMerge size={18} />, title: 'Connect All Datasets', desc: 'LandLens pulls RoR, registration, master plan, taxation, encumbrance, litigation, satellite imagery, and more — normalized around the parcel ID.' },
  { step: '03', icon: <AlertTriangle size={18} />, title: 'Detect Inconsistencies', desc: 'The Land Truth Engine cross-checks every dataset pair. Area mismatches, ownership conflicts, planning violations, restriction overlaps — all detected automatically.' },
  { step: '04', icon: <Brain size={18} />, title: 'Explain with Evidence', desc: 'Every alert has a plain-English explanation, the datasets compared, the actual values, and the recommended next action.' },
  { step: '05', icon: <Activity size={18} />, title: 'Create Actionable Workflows', desc: 'Conflicts auto-generate tasks assigned to the right department with SLA tracking, field verification flows, and audit trails.' },
  { step: '06', icon: <CheckCircle2 size={18} />, title: 'Serve Every Stakeholder', desc: 'Citizen, Revenue Officer, Planning Officer, Registrar, District Administrator — each sees the right data in the right format.' },
];

const ROLE_FEATURES = [
  { role: 'Citizen', icon: <Users size={16} />, color: '#10b981', features: ['Parcel search by location', '"Can I build here?" check', 'Service request tracking', 'AI parcel explanation', 'Land use & zoning info'] },
  { role: 'Revenue Officer', icon: <FileText size={16} />, color: '#f59e0b', features: ['RoR & ownership records', 'Conflict queue & resolution', 'Field verification tasks', 'Mutation approval flow', 'Audit trail'] },
  { role: 'Planning Officer', icon: <Layers size={16} />, color: '#6366f1', features: ['Zoning & master plan', 'Road reservation alerts', 'Building permission review', 'Environmental restrictions', 'Satellite change detection'] },
  { role: 'District Admin', icon: <Building2 size={16} />, color: '#06b6d4', features: ['District analytics dashboard', 'Conflict hotspot map', 'Departmental performance', 'SLA monitoring', 'Escalation workflows'] },
];

const TECH_LAYERS = [
  { label: 'Citizen & Govt Applications', color: '#10b981' },
  { label: 'AI / Analytics / GIS Interface', color: '#06b6d4' },
  { label: 'Land Truth Engine', color: '#6366f1' },
  { label: 'Canonical Parcel Schema (ULPIN)', color: '#8b5cf6' },
  { label: 'Data Normalization Layer', color: '#f59e0b' },
  { label: 'Adapter / API Layer', color: '#f97316' },
  { label: 'Source Government Systems', color: '#ef4444' },
];

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {value}
    </motion.span>
  );
}

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-indigo-950/40 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">LL</span>
            </div>
            <span className="font-heading font-bold text-white tracking-wide">LandLens</span>
            <span className="text-[10px] text-slate-600 hidden sm:block">Intelligence Layer for India&apos;s Land Stack</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/map" className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
              <Map size={14} /> Live Map
            </Link>
            <Link href="/technical-architecture" className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
              <Cpu size={14} /> Architecture
            </Link>
            <Link href="/login" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Sign In <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-14 overflow-hidden gradient-hero">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-900/20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-900/15 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Geospatial visualization */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Smart India Hackathon — Land Governance Innovation
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading font-bold leading-none mb-6"
          >
            <span className="block text-6xl sm:text-7xl lg:text-8xl text-white mb-2">LandLens</span>
            <span className="block text-xl sm:text-2xl gradient-text font-medium tracking-wide">
              The Intelligence Layer for India&apos;s Land Stack
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            From fragmented land records to one intelligent parcel. An interoperable GIS intelligence layer connecting land records, registration, planning, taxation, infrastructure and citizen services around every parcel.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            <Link href="/login" className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-900/40">
              Explore LandLens <ArrowRight size={16} />
            </Link>
            <Link href="/map" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium hover:bg-slate-700/80 transition-colors">
              <Map size={16} className="text-cyan-400" /> View Live Map
            </Link>
            <Link href="/technical-architecture" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium hover:bg-slate-700/80 transition-colors">
              <Cpu size={16} className="text-violet-400" /> Architecture
            </Link>
          </motion.div>

          {/* Geo visualization — India → Raipur → Parcel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative mx-auto"
            style={{ width: 520, maxWidth: '100%', height: 200 }}
          >
            {/* Concentric zoom rings */}
            {[200, 160, 120, 80, 48].map((size, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: size, height: size,
                  left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderColor: `rgba(99, 102, 241, ${0.08 + i * 0.06})`,
                  background: i === 4 ? 'rgba(99,102,241,0.12)' : 'transparent',
                }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            {/* Labels */}
            {[
              { label: 'India', size: 200, offset: -16 },
              { label: 'Chhattisgarh', size: 160, offset: -12 },
              { label: 'Raipur District', size: 120, offset: -8 },
              { label: 'Village / Ward', size: 80, offset: -6 },
              { label: 'Parcel', size: 48, offset: 0 },
            ].map(({ label, size, offset }, i) => (
              <div
                key={i}
                className="absolute text-center pointer-events-none"
                style={{ left: '50%', top: `calc(50% - ${size / 2}px + ${offset}px)`, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
              >
                <span className={`text-xs font-mono ${i === 4 ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>{label}</span>
              </div>
            ))}
            {/* Center ULPIN */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-center">
                <div className="text-[10px] font-mono text-indigo-400 font-bold">CG-RJP-0001-0001</div>
                <div className="text-[9px] text-slate-600 mt-0.5">ULPIN</div>
              </div>
            </div>

            {/* Orbiting data nodes */}
            {['RoR', 'Reg', 'Tax', 'Plan', 'Sat'].map((label, i) => (
              <motion.div
                key={label}
                className="absolute w-8 h-8 rounded-full bg-slate-900 border border-indigo-500/40 flex items-center justify-center"
                style={{ left: '50%', top: '50%', transformOrigin: '-60px 0' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 2 }}
              >
                <span className="text-[8px] text-indigo-300 font-bold">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-slate-600"
        >
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-indigo-950/40 bg-slate-950/80">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-heading font-bold text-4xl gradient-text mb-1">
                <AnimatedCounter value={s.value} />
              </div>
              <div className="text-sm text-white font-medium">{s.label}</div>
              <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FRAGMENTED TODAY ──────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-rose-400 uppercase tracking-wider mb-3">The Problem</div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4">India&apos;s land data is fragmented across siloed systems</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Eight or more departments hold different pieces of the same land story — with no common identifier, no cross-checking, and no unified view for anyone.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {FRAGMENTED_SYSTEMS.map((sys, i) => (
            <motion.div
              key={sys.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="surface-card p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full rounded-l" style={{ background: sys.color }} />
              <div className="pl-2">
                <div className="font-semibold text-sm text-slate-200 mb-1">{sys.name}</div>
                <div className="text-xs text-slate-500">{sys.dept}</div>
              </div>
              {/* Disconnected indicator */}
              <div className="absolute top-2 right-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-300 text-sm">
            <AlertTriangle size={16} />
            No common parcel identifier · No cross-department verification · Citizens navigate each system manually
          </div>
        </div>
      </section>

      {/* ── UNIFIED WITH LANDLENS ─────────────────────────────────── */}
      <section className="py-24 bg-indigo-950/10 border-y border-indigo-950/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">The Solution</div>
            <h2 className="font-heading font-bold text-4xl text-white mb-4">Unified around every parcel with ULPIN</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">LandLens uses the parcel&apos;s ULPIN as the universal key — pulling every dataset into one coherent, cross-checked intelligence view.</p>
          </div>

          {/* Architecture flow */}
          <div className="flex flex-col items-center gap-1 max-w-lg mx-auto">
            {TECH_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{
                  background: `${layer.color}08`,
                  borderColor: `${layer.color}25`,
                  width: `${100 - i * 5}%`,
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                <span className="text-sm text-slate-300">{layer.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">How It Works</div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4">From parcel identity to actionable intelligence</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="surface-elevated p-6 group hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>
                <span className="font-mono text-4xl font-bold text-slate-800 mt-1">{step.step}</span>
              </div>
              <h3 className="font-heading font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LAND TRUTH ENGINE ─────────────────────────────────────── */}
      <section className="py-24 bg-slate-900/40 border-y border-indigo-950/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-mono text-violet-400 uppercase tracking-wider mb-3">Signature Feature</div>
              <h2 className="font-heading font-bold text-4xl text-white mb-6">The Land Truth Engine</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">Every conflict has evidence. Every finding has a source dataset. Every alert has a recommended action. LandLens never produces a score without an explanation.</p>

              <div className="flex items-center gap-2 flex-wrap text-sm text-slate-500 mb-8">
                {['DATA', '→', 'CROSS-CHECK', '→', 'CONFLICT', '→', 'CHANGE', '→', 'RISK', '→', 'EXPLANATION', '→', 'ACTION'].map((s, i) => (
                  <span key={i} className={s === '→' ? 'text-indigo-800' : 'px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-xs font-mono'}>{s}</span>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { icon: '🔴', title: 'Area Mismatch', desc: 'RoR: 2.40 acres · Registration: 2.10 acres → 12.5% discrepancy detected' },
                  { icon: '🟠', title: 'Planning Conflict', desc: 'Land use: Agricultural · Master Plan: Road Corridor → No development permitted' },
                  { icon: '🟡', title: 'Satellite Change', desc: 'Construction detected Jan 2024 · 87% confidence · Verification required' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Parcel Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-mono text-slate-500">CG-RJP-0002-0001</div>
                  <div className="font-heading font-bold text-xl text-white">Parcel P006</div>
                  <div className="text-xs text-slate-500">Amanaka Industrial Area, Raipur</div>
                </div>
                <span className="chip bg-red-500/15 text-red-400 border border-red-500/25">Disputed</span>
              </div>

              <div className="grid grid-cols-2 gap-px bg-slate-800/40 rounded-lg overflow-hidden mb-4">
                {[['Ownership', 'conflict'], ['Registration', 'conflict'], ['Area', 'conflict'], ['Zoning', 'verified'], ['Tax', 'conflict'], ['Litigation', 'conflict']].map(([label, status]) => (
                  <div key={label} className={`px-3 py-2 bg-slate-900/80 flex items-center justify-between`}>
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-emerald-400' : status === 'conflict' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="px-3 py-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
                  <div className="text-xs font-bold text-red-400 mb-0.5">🔴 CRITICAL — Ownership Conflict</div>
                  <div className="text-xs text-slate-400">RoR: Amanaka Steel · Registration: Prakash Sahu · Mutation Pending · Court Attachment Active</div>
                </div>
                <div className="px-3 py-2.5 rounded-lg bg-orange-500/8 border border-orange-500/20">
                  <div className="text-xs font-bold text-orange-400 mb-0.5">🟠 HIGH — Area Mismatch</div>
                  <div className="text-xs text-slate-400">RoR: 2.40 acres vs Registration: 2.10 acres · 12.5% difference</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 rounded-lg gradient-primary text-white text-xs font-semibold">View Evidence</button>
                <button className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">Create Task</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ROLE-BASED EXPERIENCE ─────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-3">Role-Based Access</div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4">The right view for every stakeholder</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Six distinct roles — each with dedicated dashboards, permission-controlled data, and purpose-built workflows.</p>
        </div>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {ROLE_FEATURES.map((r, i) => (
            <button
              key={r.role}
              onClick={() => setActiveRole(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeRole === i ? 'text-white' : 'text-slate-500 bg-slate-800/60 hover:text-slate-300'}`}
              style={activeRole === i ? { background: `${r.color}20`, border: `1px solid ${r.color}40`, color: r.color } : {}}
            >
              {r.icon} {r.role}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-lg mx-auto surface-elevated p-6"
            style={{ borderColor: `${ROLE_FEATURES[activeRole].color}25` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ROLE_FEATURES[activeRole].color}20`, color: ROLE_FEATURES[activeRole].color }}>
                {ROLE_FEATURES[activeRole].icon}
              </div>
              <div>
                <div className="font-heading font-bold text-white">{ROLE_FEATURES[activeRole].role}</div>
                <div className="text-xs text-slate-500">Role-specific dashboard & tools</div>
              </div>
            </div>
            <ul className="space-y-2">
              {ROLE_FEATURES[activeRole].features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 size={13} style={{ color: ROLE_FEATURES[activeRole].color }} className="flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── AI / GIS INTELLIGENCE ─────────────────────────────────── */}
      <section className="py-24 bg-indigo-950/10 border-y border-indigo-950/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { icon: <Brain size={22} />, color: '#6366f1', title: 'AI Parcel Assistant', desc: 'Parcel-aware AI that answers questions using actual connected data — not a generic chatbot. Every response cites its sources.' },
            { icon: <Satellite size={22} />, color: '#06b6d4', title: 'Satellite Change Detection', desc: 'Bi-annual imagery comparison detects construction, boundary shifts, and vegetation clearing before field officers verify.' },
            { icon: <BarChart3 size={22} />, color: '#10b981', title: 'District Analytics', desc: 'Real-time dashboards showing conflicts by geography, resolution times, data quality scores, and departmental workload.' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="surface-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>
              <h3 className="font-heading font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECURITY ──────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">Security & Governance</div>
            <h2 className="font-heading font-bold text-4xl text-white mb-6">Built for government-grade trust</h2>
            <div className="space-y-4">
              {[
                { icon: <Lock size={16} />, title: 'Role-Based Access Control', desc: '6 roles, granular permissions — citizens see public data, officers see their department, admins see everything.' },
                { icon: <Shield size={16} />, title: 'Full Audit Trail', desc: 'Every access, every change, every workflow action is logged with user, timestamp, IP, and context.' },
                { icon: <Database size={16} />, title: 'Data Provenance', desc: 'Every record shows its source dataset, sync timestamp, and schema version. No unattributed data.' },
                { icon: <Eye size={16} />, title: 'No Legal Certainty Claims', desc: 'LandLens explains and flags — it never makes legal determinations. Officers and courts retain authority.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium text-slate-200 text-sm">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card p-6">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-3 font-medium">Sample Audit Trail</div>
            {[
              { time: '11:30:15', user: 'Revenue Insp. Suresh', action: 'Viewed Parcel P006', role: 'Revenue Officer' },
              { time: '11:30:42', user: 'Revenue Insp. Suresh', action: 'Created Workflow Task W004', role: 'Revenue Officer' },
              { time: '11:45:00', user: 'Planning Off. Rani', action: 'Updated Workflow W003 → In Progress', role: 'Planning Officer' },
              { time: '12:00:01', user: 'Citizen: Ramesh Sharma', action: 'Submitted Service Request SR001', role: 'Citizen' },
              { time: '14:00:00', user: 'Admin: Priya Gupta', action: 'Updated Dataset Metadata DS003', role: 'System Admin' },
            ].map((entry, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-slate-800/50 last:border-0">
                <span className="font-mono text-[10px] text-slate-600 flex-shrink-0 mt-0.5">{entry.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300 truncate">{entry.action}</div>
                  <div className="text-[10px] text-slate-600">{entry.user} · {entry.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading font-bold text-5xl text-white mb-6">
            Experience the future of <span className="gradient-text">land governance</span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg">Explore LandLens with 120+ synthetic parcels in Raipur, Chhattisgarh. Every role, every workflow, every dataset — live in the prototype.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-xl shadow-indigo-900/40">
              Launch LandLens <ArrowRight size={18} />
            </Link>
            <Link href="/technical-architecture" className="flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 font-semibold hover:bg-slate-700/80 transition-colors">
              <Cpu size={18} className="text-violet-400" /> View Architecture
            </Link>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-600">
            <span>⚠️ Synthetic demonstration data</span>
            <span>·</span>
            <span>No real government records</span>
            <span>·</span>
            <span>SIH Hackathon Prototype</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-950/40 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">LL</span>
            </div>
            <span className="text-sm font-heading font-bold text-slate-400">LandLens</span>
            <span className="text-xs text-slate-700">— Smart India Hackathon 2024</span>
          </div>
          <div className="text-xs text-slate-700 text-center">
            All land records are synthetic demonstration data. Not affiliated with any government department.
          </div>
        </div>
      </footer>
    </div>
  );
}
