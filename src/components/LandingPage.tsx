'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  Map, Database, Shield, ArrowRight, CheckCircle2, AlertTriangle,
  Brain, Layers, BarChart3, GitMerge, Search, Activity, Eye,
  Lock, FileText, Users, Building2, Play, Zap, Satellite
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
// @ts-expect-error - maath does not have types
import * as random from 'maath/random/dist/maath-random.esm';

// ============================================================
// DATA
// ============================================================

const STATS = [
  { label: 'Land Parcels', value: '630M+', desc: 'ULPIN-addressable across India' },
  { label: 'Datasets', value: '10+', desc: 'Connected in prototype' },
  { label: 'Conflict Types', value: '10', desc: 'Detected automatically' },
  { label: 'Faster', value: '4.2×', desc: 'Conflict resolution time' },
];

const PROCESS_STEPS = [
  { num: '01', icon: <Search size={16} />, title: 'Connect', desc: 'Link fragmented land datasets via ULPIN' },
  { num: '02', icon: <Database size={16} />, title: 'Normalize', desc: 'Convert schemas to canonical parcel model' },
  { num: '03', icon: <GitMerge size={16} />, title: 'Cross-Check', desc: 'Compare records automatically across sources' },
  { num: '04', icon: <AlertTriangle size={16} />, title: 'Detect', desc: 'Find conflicts, gaps and inconsistencies' },
  { num: '05', icon: <Brain size={16} />, title: 'Explain', desc: 'Show evidence and recommended actions' },
  { num: '06', icon: <Activity size={16} />, title: 'Act', desc: 'Generate verification workflows and tasks' },
];

const ROLE_CARDS = [
  { 
    role: 'Citizen', 
    icon: <Users size={18} />, 
    color: '#10b981',
    features: ['Search parcels by location', '"Can I build here?" check', 'Service request tracking', 'Land use & restrictions']
  },
  { 
    role: 'Revenue Officer', 
    icon: <FileText size={18} />, 
    color: '#f59e0b',
    features: ['RoR & ownership records', 'Conflict resolution queue', 'Field verification tasks', 'Mutation workflows']
  },
  { 
    role: 'Planning Officer', 
    icon: <Layers size={18} />, 
    color: '#6366f1',
    features: ['Zoning & master plan', 'Building permissions', 'Road reservations', 'Satellite monitoring']
  },
  { 
    role: 'District Admin', 
    icon: <Building2 size={18} />, 
    color: '#06b6d4',
    features: ['Analytics dashboard', 'Conflict hotspot map', 'SLA monitoring', 'Performance tracking']
  },
];

// ============================================================
// 3D GEOSPATIAL VISUALIZATION
// ============================================================

function ParcelCloud(props: any) {
  const ref = useRef<any>(null);
  const [sphere] = useState(() => random.inSphere(new Float32Array(4000), { radius: 1.2 }));
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 16;
    }
  });
  
  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial 
          transparent 
          color="#6366f1" 
          size={0.004} 
          sizeAttenuation={true} 
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

// ============================================================
// MAIN LANDING PAGE
// ============================================================

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.96]);

  return (
    <div className="landing-page-wrapper min-h-screen bg-slate-950 text-slate-100">
      
      {/* ============================================================
          NAVIGATION
          ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-indigo-950/30 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <span className="text-white text-sm font-bold">LL</span>
            </div>
            <div>
              <div className="font-heading font-bold text-white tracking-tight">LandLens</div>
              <div className="text-[9px] text-slate-500 tracking-wider uppercase leading-none">GIS Intelligence</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link 
              href="/map" 
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
            >
              <Map size={14} /> Live Map
            </Link>
            <Link 
              href="/technical-architecture" 
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
            >
              <Layers size={14} /> Architecture
            </Link>
            <Link 
              href="/login" 
              className="flex items-center gap-1.5 px-5 py-2.5 ml-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-900/40"
            >
              Explore LandLens <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section 
        ref={heroRef} 
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden gradient-hero-bg"
      >
        <div className="absolute inset-0 parcel-grid-bg opacity-30" />
        
        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl" />

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/8 text-emerald-300 text-xs font-semibold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              GIS Intelligence for Land Governance
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6"
            >
              Every parcel.
              <br />
              <span className="gradient-text">One intelligent view.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl"
            >
              Connect land records, registration, planning, taxation and spatial data around a common parcel identity. From fragmented systems to intelligent governance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity shadow-xl shadow-indigo-900/40"
              >
                <Play size={16} /> Explore LandLens
              </Link>
              <Link 
                href="/map" 
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 font-medium hover:bg-slate-700/70 transition-colors"
              >
                <Map size={16} className="text-cyan-400" /> View GIS Demo
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mt-10 pt-10 border-t border-slate-800/50"
            >
              {STATS.slice(0, 2).map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-slate-300 font-medium mt-1">{stat.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              {/* 3D Parcel Cloud */}
              <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 1], fov: 50 }}>
                  <ParcelCloud />
                </Canvas>
              </div>
              
              {/* Center Overlay — ULPIN Focus */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                {/* Concentric targeting rings */}
                {[180, 120, 70].map((size, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border"
                    style={{
                      width: size,
                      height: size,
                      borderColor: i === 2 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.15)',
                      background: i === 2 ? 'rgba(99,102,241,0.08)' : 'transparent',
                    }}
                    animate={{ 
                      scale: [1, 1.03, 1],
                      opacity: [0.6, 0.8, 0.6]
                    }}
                    transition={{ 
                      duration: 2.5 + i * 0.5, 
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
                
                {/* ULPIN Display */}
                <div className="relative z-20 text-center">
                  <div className="font-mono text-sm font-bold text-cyan-300 bg-slate-900/90 px-4 py-2 rounded-lg border border-cyan-500/30 shadow-lg backdrop-blur-sm mb-2">
                    CG-RPR-0001-0001
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Unique Land Parcel ID
                  </div>
                </div>
              </div>

              {/* Floating Data Labels */}
              <div className="absolute top-8 right-4 text-xs bg-slate-900/80 px-3 py-1.5 rounded border border-emerald-500/30 text-emerald-300 backdrop-blur-sm">
                <CheckCircle2 size={10} className="inline mr-1" /> RoR Linked
              </div>
              <div className="absolute bottom-16 left-6 text-xs bg-slate-900/80 px-3 py-1.5 rounded border border-cyan-500/30 text-cyan-300 backdrop-blur-sm">
                <Database size={10} className="inline mr-1" /> 8 Datasets
              </div>
              <div className="absolute top-1/3 left-4 text-xs bg-slate-900/80 px-3 py-1.5 rounded border border-violet-500/30 text-violet-300 backdrop-blur-sm">
                <Layers size={10} className="inline mr-1" /> GIS Ready
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================
          HOW IT WORKS — Compact Horizontal Process
          ============================================================ */}
      <section className="py-20 border-y border-indigo-950/30 bg-gradient-section-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-eyebrow text-cyan-400 mb-3">How It Works</div>
            <h2 className="text-h2 font-heading text-white mb-4">From fragmented data to intelligent parcel</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              LandLens connects, normalizes, and cross-checks land data automatically — then explains every finding with evidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="relative surface-card p-5 text-center group hover:border-indigo-500/30 transition-colors"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/20 transition-colors">
                  {step.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          LAND TRUTH ENGINE — Hero Feature
          ============================================================ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-eyebrow text-violet-400 mb-3">Signature Feature</div>
            <h2 className="text-h1 font-heading text-white mb-4">Land Truth Engine</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              Don't just store land data — understand what the records collectively say. Every alert has evidence. Every conflict has context. Every recommendation has a source.
            </p>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GitMerge size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Cross-Dataset Verification</div>
                  <div className="text-xs text-slate-500 mt-0.5">Compares RoR, registration, zoning, tax, restrictions and satellite data automatically</div>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Eye size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Explainable Intelligence</div>
                  <div className="text-xs text-slate-500 mt-0.5">Shows exact datasets compared, values found, and recommended next actions</div>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Automated Workflows</div>
                  <div className="text-xs text-slate-500 mt-0.5">Conflicts generate verification tasks with SLA tracking and audit trails</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Intelligence Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="intelligence-panel p-6"
          >
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-indigo-500/20">
              <div>
                <div className="text-xs font-mono text-slate-500">CG-RPR-0002-0001</div>
                <div className="font-heading text-lg font-bold text-white mt-1">Parcel P-00427</div>
                <div className="text-xs text-slate-400 mt-0.5">Khasra 128/3, Amanaka, Raipur</div>
              </div>
              <div className="status-badge status-conflict">
                <AlertTriangle size={12} /> Review Required
              </div>
            </div>

            {/* Data Health Grid */}
            <div className="text-eyebrow mb-3">Data Health</div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Ownership', status: 'conflict' },
                { label: 'Registration', status: 'attention' },
                { label: 'Area', status: 'conflict' },
                { label: 'Zoning', status: 'verified' },
                { label: 'Building', status: 'verified' },
                { label: 'Tax', status: 'verified' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'verified' ? 'bg-emerald-400' :
                    item.status === 'attention' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                </div>
              ))}
            </div>

            {/* Conflicts */}
            <div className="text-eyebrow mb-3">Land Truth Analysis</div>
            <div className="space-y-2 mb-5">
              <div className="px-4 py-3 rounded-lg bg-red-500/8 border border-red-500/25">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-red-300">Area Mismatch Detected</div>
                    <div className="text-xs text-slate-400 mt-1">RoR: 2.40 acres • Registration: 2.10 acres • Difference: 0.30 acres (12.5%)</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-red-500/15">
                  Recommended action: Verify registration record with Sub-Registrar Office
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                View Evidence
              </button>
              <button className="flex-1 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-sm font-medium hover:bg-slate-700/80 transition-colors">
                Create Task
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          ROLE-BASED EXPERIENCE
          ============================================================ */}
      <section className="py-20 border-y border-indigo-950/30 bg-gradient-section-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-eyebrow text-emerald-400 mb-3">For Every Stakeholder</div>
            <h2 className="text-h2 font-heading text-white mb-4">The right view for every role</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Citizen, officer, planner, administrator — each role sees relevant data with appropriate permissions and workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLE_CARDS.map((card, i) => (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="surface-elevated p-5 hover:border-indigo-500/25 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${card.color}15`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <div className="font-heading text-base font-semibold text-white">{card.role}</div>
                </div>
                <ul className="space-y-2">
                  {card.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle2 size={12} style={{ color: card.color }} className="flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          INTELLIGENCE FEATURES
          ============================================================ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <Brain size={24} />, 
              color: '#6366f1', 
              title: 'AI Parcel Intelligence', 
              desc: 'Ask questions about any parcel using actual connected data. Every response cites source datasets and evidence.' 
            },
            { 
              icon: <Satellite size={24} />, 
              color: '#06b6d4', 
              title: 'Satellite Monitoring', 
              desc: 'Bi-annual imagery comparison detects construction, boundary changes and land use shifts before field verification.' 
            },
            { 
              icon: <BarChart3 size={24} />, 
              color: '#10b981', 
              title: 'District Analytics', 
              desc: 'Real-time dashboards showing conflicts by geography, resolution times, data quality scores and SLA tracking.' 
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="surface-card p-6 text-center hover:border-indigo-500/20 transition-all"
            >
              <div 
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${item.color}12`, color: item.color }}
              >
                {item.icon}
              </div>
              <h3 className="text-h3 font-heading text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECURITY & GOVERNANCE
          ============================================================ */}
      <section className="py-20 border-y border-indigo-950/30 bg-gradient-section-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-eyebrow text-emerald-400 mb-3">Security & Trust</div>
              <h2 className="text-h2 font-heading text-white mb-6">Built for government-grade governance</h2>
              
              <div className="space-y-4">
                {[
                  { icon: <Lock size={18} />, title: 'Role-Based Access', desc: 'Granular permissions — citizens see public data, officers see their department, admins see all.' },
                  { icon: <Shield size={18} />, title: 'Complete Audit Trail', desc: 'Every access, change, and workflow action logged with user, timestamp, and IP address.' },
                  { icon: <Database size={18} />, title: 'Data Provenance', desc: 'Every record shows source dataset, sync timestamp, and schema version. No unattributed data.' },
                  { icon: <Eye size={18} />, title: 'Explainable Intelligence', desc: 'LandLens explains and flags — never makes legal determinations. Officers retain authority.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="text-eyebrow mb-4">Audit Trail Sample</div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { time: '11:30:15', user: 'Revenue Officer', action: 'Viewed Parcel P-0061', color: 'text-cyan-400' },
                  { time: '11:30:42', user: 'Revenue Officer', action: 'Created Verification Task W004', color: 'text-emerald-400' },
                  { time: '11:45:00', user: 'Planning Officer', action: 'Updated W003 → In Progress', color: 'text-amber-400' },
                  { time: '12:00:01', user: 'Citizen', action: 'Submitted Service Request SR001', color: 'text-violet-400' },
                ].map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 px-3 rounded bg-slate-900/60 border border-slate-800/60">
                    <span className="text-slate-500">{log.time}</span>
                    <span className={log.color}>{log.user}</span>
                    <span className="text-slate-400 flex-1">{log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
          ============================================================ */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            Start with one parcel.
            <br />
            <span className="gradient-text">See the entire land story.</span>
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            LandLens connects fragmented land records around every parcel. From data chaos to intelligent governance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-bold text-base hover:opacity-90 transition-opacity shadow-xl shadow-indigo-900/40"
            >
              Explore LandLens <ArrowRight size={18} />
            </Link>
            <Link 
              href="/map" 
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 font-semibold text-base hover:bg-slate-700/70 transition-colors"
            >
              <Map size={18} /> View Live GIS Map
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="border-t border-indigo-950/30 bg-slate-950/80 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">LL</span>
              </div>
              <div>
                <div className="font-heading font-bold text-white">LandLens</div>
                <div className="text-xs text-slate-500">Intelligence Layer for India's Land Stack</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/technical-architecture" className="hover:text-white transition-colors">Architecture</Link>
              <Link href="/map" className="hover:text-white transition-colors">Live Map</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-indigo-950/30 text-center">
            <p className="text-xs text-slate-500">
              Smart India Hackathon 2024 — Land Governance Innovation • Demonstration prototype with synthetic data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
