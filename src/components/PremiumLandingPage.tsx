'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Map, CheckCircle2, Shield, GitMerge,
  Brain, Activity, Users, Building2, Database, Lock
} from 'lucide-react';

const FEATURES = [
  {
    num: '01',
    title: 'Parcel 360',
    desc: 'See land records, location, ownership status, zoning, planning information and related data in one place.',
    icon: <Map size={24} />
  },
  {
    num: '02',
    title: 'Land Truth Engine',
    desc: 'Cross-check connected datasets and identify inconsistencies, restrictions and records that require verification.',
    icon: <GitMerge size={24} />
  },
  {
    num: '03',
    title: 'GIS Intelligence',
    desc: 'Explore parcels, boundaries, zoning, infrastructure, restrictions and spatial information directly on an interactive map.',
    icon: <Map size={24} />
  },
  {
    num: '04',
    title: 'Evidence-Based AI',
    desc: 'Ask questions about a parcel and receive explanations grounded in the available records and evidence.',
    icon: <Brain size={24} />
  },
  {
    num: '05',
    title: 'Smart Workflows',
    desc: 'Convert detected issues into verification tasks and track them across departments.',
    icon: <Activity size={24} />
  },
  {
    num: '06',
    title: 'Citizen Services',
    desc: 'Search parcels, understand public land information, track applications and submit service requests.',
    icon: <Users size={24} />
  }
];

const HOW_IT_WORKS = [
  { num: '01', title: 'Connect', desc: 'Bring relevant land datasets together.' },
  { num: '02', title: 'Identify', desc: 'Connect records using a common parcel identity such as ULPIN / Parcel ID.' },
  { num: '03', title: 'Understand', desc: 'Cross-check information, detect conflicts and explain evidence.' },
  { num: '04', title: 'Act', desc: 'Create verification tasks and enable citizens/officers to take the next step.' }
];

const TRUST_ITEMS = [
  'Secure Authentication',
  'Role-Based Access',
  'Data Provenance',
  'Audit Trails',
  'Evidence-Based AI',
  'Human Verification'
];

export default function PremiumLandingPage() {
  return (
    <div className="landlens-premium min-h-screen bg-[#F4EBDD] text-[#1F2A44]">
      
      {/* ============================================================
          NAVIGATION
          ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1F2A44]/95 backdrop-blur-xl border-b border-[#C6A75E]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-xl text-white">
            LANDLENS
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#for-citizens" className="text-slate-600 hover:text-slate-900 transition-colors">For Citizens</a>
            <a href="#for-government" className="text-slate-600 hover:text-slate-900 transition-colors">For Government</a>
            <a href="#technology" className="text-slate-600 hover:text-slate-900 transition-colors">Technology</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/map" 
              className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Explore Map
            </Link>
            <Link 
              href="/login" 
              aria-label="Log in to LandLens"
              className="inline-flex min-w-[102px] items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition-colors hover:bg-slate-700 hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
            >
              <span className="!text-white">Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="pt-32 pb-20 px-6 bg-[#1F2A44] text-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-[#C6A75E]/15 text-[#E8DCC8] text-xs font-medium mb-6 uppercase tracking-wider">
              GIS Intelligence for Land Governance
            </div>
            
            <h1 className="font-heading font-bold text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
              LANDLENS
            </h1>
            
            <p className="text-2xl lg:text-3xl text-white font-medium leading-tight mb-6">
              One parcel. Every record.<br />One intelligent view.
            </p>
            
            <p className="text-lg text-[#E8DCC8] leading-relaxed mb-8 max-w-xl">
              LandLens connects fragmented land records, maps, planning, registration and spatial data around a common parcel identity — making land information easier to understand, verify and act upon.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#C6A75E] hover:bg-[#E8DCC8] text-[#071A2B] font-semibold rounded-lg transition-colors"
              >
                Explore LandLens <ArrowRight size={18} />
              </Link>
              <Link 
                href="/map" 
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg border-2 border-[#E8DCC8] transition-colors"
              >
                View GIS Demo
              </Link>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 relative overflow-hidden">
              {/* Stylized GIS Visual */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Grid lines */}
                  <g stroke="#1e293b" strokeWidth="0.5" fill="none">
                    {[...Array(20)].map((_, i) => (
                      <g key={i}>
                        <line x1={i * 20} y1="0" x2={i * 20} y2="400" />
                        <line x1="0" y1={i * 20} x2="400" y2={i * 20} />
                      </g>
                    ))}
                  </g>
                  {/* Parcel boundaries */}
                  <rect x="100" y="100" width="200" height="200" stroke="#0f172a" strokeWidth="2" fill="rgba(6, 182, 212, 0.1)" />
                  <rect x="120" y="120" width="80" height="80" stroke="#0f172a" strokeWidth="1.5" fill="rgba(16, 185, 129, 0.15)" />
                  <rect x="210" y="120" width="80" height="80" stroke="#0f172a" strokeWidth="1.5" fill="rgba(99, 102, 241, 0.15)" />
                  {/* Roads */}
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#475569" strokeWidth="3" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#475569" strokeWidth="3" />
                </svg>
              </div>
              
              {/* Central Focus */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs">
                  <div className="text-xs font-mono text-cyan-600 mb-2">CG-RPR-0001-0001</div>
                  <div className="font-semibold text-slate-900 mb-3">Parcel P-00427</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Records</span>
                      <span className="font-mono text-emerald-600">✓ 8 Connected</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Status</span>
                      <span className="font-mono text-slate-900">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SIMPLE PROJECT INTRODUCTION
          ============================================================ */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 mb-6">
            Land Governance, Simplified.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-2xl mx-auto">
            Land information is often distributed across different records, departments and systems. LandLens brings these datasets together around each parcel, giving citizens and government officials a clearer and more connected view of the land.
          </p>
          
          {/* Simple Flow */}
          <div className="grid md:grid-cols-3 gap-8 items-center max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Fragmented Data</div>
              <div className="space-y-2 text-xs text-slate-600">
                <div>RoR</div>
                <div>Registration</div>
                <div>Planning</div>
                <div>Tax</div>
                <div>Zoning</div>
                <div>Maps</div>
                <div>Restrictions</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <ArrowRight size={32} className="text-slate-400 mb-2 hidden md:block" />
              <div className="font-heading font-bold text-xl text-slate-900">LANDLENS</div>
            </div>
            
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
              <div className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">One Parcel View</div>
              <div className="flex items-center justify-center h-16">
                <Map size={40} className="text-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
          ============================================================ */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 mb-4">
              Everything You Need to Understand a Parcel
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-xl p-8 border-2 border-slate-200 hover:border-slate-900 transition-all ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="text-4xl font-bold text-slate-200">{feature.num}</div>
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          LAND TRUTH ENGINE
          ============================================================ */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl lg:text-5xl mb-6">
              Don&apos;t Just Store the Data.<br />Understand It.
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              LandLens compares information from multiple sources to identify where records agree, where they differ and where human verification may be required.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 lg:p-12 border border-white/10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex flex-wrap gap-3 mb-6">
                  {['RoR', 'Registration', 'Zoning', 'Master Plan', 'Restrictions'].map(item => (
                    <span key={item} className="px-3 py-1.5 bg-white/10 rounded-lg text-sm">{item}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <ArrowRight size={24} className="text-cyan-400" />
                  <span className="font-semibold text-lg">Land Truth Engine</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                  <div className="font-semibold text-red-400 mb-2">AREA MISMATCH</div>
                  <div className="space-y-1 text-sm mb-4">
                    <div>RoR: <span className="font-mono">2.40 acres</span></div>
                    <div>Registration: <span className="font-mono">2.10 acres</span></div>
                  </div>
                  <div className="inline-block px-3 py-1 bg-red-500/20 rounded text-xs font-semibold uppercase">
                    Review Required
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Evidence</div>
                    <div className="text-sm text-slate-300">Every finding shows the exact datasets compared and values found.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Datasets Compared</div>
                    <div className="text-sm text-slate-300">Transparent cross-checking across all available records.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Recommended Action</div>
                    <div className="text-sm text-slate-300">Clear next steps for verification and resolution.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="text-6xl font-bold text-slate-100 mb-4">{step.num}</div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 text-slate-300" size={24} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHO LANDLENS IS FOR
          ============================================================ */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Citizens */}
            <div id="for-citizens" className="bg-white rounded-2xl p-10 border-2 border-slate-200">
              <Users size={40} className="text-emerald-600 mb-6" />
              <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">For Citizens</h2>
              <p className="text-lg text-slate-600 mb-8">Find and understand land information.</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Search parcel',
                  'View map',
                  'Check land use',
                  'Understand zoning',
                  'View public restrictions',
                  'Track applications',
                  'Submit service requests',
                  'Ask Parcel AI'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Explore Citizen Experience <ArrowRight size={18} />
              </Link>
            </div>

            {/* For Government */}
            <div id="for-government" className="bg-slate-900 text-white rounded-2xl p-10">
              <Building2 size={40} className="text-cyan-400 mb-6" />
              <h2 className="font-heading font-bold text-3xl mb-4">For Government</h2>
              <p className="text-lg text-slate-300 mb-8">Turn fragmented land data into actionable intelligence.</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Parcel verification',
                  'Conflict detection',
                  'Planning intelligence',
                  'Registration workflows',
                  'Department dashboards',
                  'Verification tasks',
                  'Analytics',
                  'Audit trails'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
              >
                Explore Government Platform <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TECHNOLOGY
          ============================================================ */}
      <section id="technology" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 mb-6">
              Built to Connect
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              'State / Department Systems',
              'API & Adapter Layer',
              'Common Parcel Data Model',
              'ULPIN / Parcel ID',
              'GIS + PostGIS',
              'Land Truth Engine',
              'AI + Analytics',
              'Citizen + Government'
            ].map((layer, i) => (
              <motion.div
                key={layer}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-4 border-2 border-slate-200 flex items-center gap-4"
              >
                <Database size={20} className="text-slate-400" />
                <span className="font-medium text-slate-900">{layer}</span>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center text-sm text-slate-600 mt-12 leading-relaxed max-w-2xl mx-auto">
            LandLens is designed around interoperable APIs and a common parcel-centric data model, allowing different datasets and state-specific schemas to be connected without forcing every department into the same source system.
          </p>
        </div>
      </section>

      {/* ============================================================
          TRUST / SECURITY
          ============================================================ */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <Shield size={48} className="text-slate-900 mx-auto mb-6" />
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 mb-6">
            Built for Responsible Land Governance
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {TRUST_ITEMS.map(item => (
              <div key={item} className="bg-white rounded-xl p-6 border border-slate-200">
                <Lock size={24} className="text-slate-400 mx-auto mb-3" />
                <div className="font-semibold text-slate-900">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
          ============================================================ */}
      <section className="py-32 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl lg:text-6xl mb-8">
            See Every Parcel<br />With More Clarity.
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Explore LandLens and experience a more connected way to understand land information.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 !text-slate-900 font-bold text-lg rounded-lg transition-colors"
            >
              <span className="!text-slate-900">Explore LandLens</span> <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold text-lg rounded-lg border-2 border-white transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="font-heading font-bold text-xl text-slate-900 mb-4">LANDLENS</div>
              <p className="text-sm text-slate-600">The Intelligence Layer for Land Governance</p>
            </div>
            
            <div>
              <div className="font-semibold text-slate-900 mb-3">Platform</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-slate-900">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-slate-900">How It Works</a></li>
                <li><a href="#technology" className="hover:text-slate-900">Technology</a></li>
                <li><Link href="/login" className="hover:text-slate-900">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold text-slate-900 mb-3">For</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#for-citizens" className="hover:text-slate-900">Citizens</a></li>
                <li><a href="#for-government" className="hover:text-slate-900">Government</a></li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold text-slate-900 mb-3">Product</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/map" className="hover:text-slate-900">Explore Map</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Prototype / Demonstration Platform • Synthetic Demonstration Data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
