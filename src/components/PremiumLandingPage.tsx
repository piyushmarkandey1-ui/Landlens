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
    <div className="min-h-screen bg-[#1F2A44]">
      
      {/* ============================================================
          NAVIGATION - Deep Royal Navy
          ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1F2A44]/95 backdrop-blur-xl border-b border-[#C6A75E]/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-xl text-white">
            LANDLENS
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-[#E8DCC8] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-[#E8DCC8] hover:text-white transition-colors">How It Works</a>
            <a href="#for-citizens" className="text-[#E8DCC8] hover:text-white transition-colors">For Citizens</a>
            <a href="#for-government" className="text-[#E8DCC8] hover:text-white transition-colors">For Government</a>
            <a href="#technology" className="text-[#E8DCC8] hover:text-white transition-colors">Technology</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/map" 
              className="hidden sm:block text-sm text-[#E8DCC8] hover:text-white transition-colors px-4 py-2 font-medium"
            >
              Explore Map
            </Link>
            <Link 
              href="/login" 
              className="inline-flex min-w-[102px] items-center justify-center rounded-lg bg-[#C6A75E] px-5 py-2.5 text-sm font-bold text-[#1F2A44] shadow-lg shadow-[#C6A75E]/30 transition-all hover:bg-[#d4b36e] hover:shadow-xl hover:shadow-[#C6A75E]/40"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO SECTION - Deep Royal Navy with white/beige text
          ============================================================ */}
      <section className="pt-32 pb-20 px-6 bg-[#1F2A44]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-[#C6A75E]/15 text-[#C6A75E] text-xs font-bold mb-6 uppercase tracking-wider border border-[#C6A75E]/30">
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
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#C6A75E] hover:bg-[#d4b36e] text-[#1F2A44] font-bold rounded-lg transition-all shadow-lg shadow-[#C6A75E]/30 hover:shadow-xl hover:shadow-[#C6A75E]/40"
              >
                Explore LandLens <ArrowRight size={18} />
              </Link>
              <Link 
                href="/map" 
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg border-2 border-[#C6A75E] transition-colors"
              >
                View GIS Demo
              </Link>
            </div>
          </motion.div>

          {/* Right Visual - Beige card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-[#E8DCC8] rounded-2xl p-8 relative overflow-hidden border-2 border-[#C6A75E]/20">
              {/* Stylized GIS Visual */}
              <div className="absolute inset-0 opacity-15">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <g stroke="#1F2A44" strokeWidth="0.5" fill="none">
                    {[...Array(20)].map((_, i) => (
                      <g key={i}>
                        <line x1={i * 20} y1="0" x2={i * 20} y2="400" />
                        <line x1="0" y1={i * 20} x2="400" y2={i * 20} />
                      </g>
                    ))}
                  </g>
                  <rect x="100" y="100" width="200" height="200" stroke="#1F2A44" strokeWidth="2" fill="rgba(198, 167, 94, 0.15)" />
                  <rect x="120" y="120" width="80" height="80" stroke="#1F2A44" strokeWidth="1.5" fill="rgba(198, 167, 94, 0.2)" />
                  <rect x="210" y="120" width="80" height="80" stroke="#1F2A44" strokeWidth="1.5" fill="rgba(198, 167, 94, 0.25)" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#1F2A44" strokeWidth="3" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#1F2A44" strokeWidth="3" />
                </svg>
              </div>
              
              {/* Central Focus Card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs border-2 border-[#C6A75E]/30">
                  <div className="text-xs font-mono text-[#C6A75E] font-semibold mb-2">CG-RPR-0001-0001</div>
                  <div className="font-bold text-[#1F2A44] mb-3 text-lg">Parcel P-00427</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#2A3655]">Records</span>
                      <span className="font-mono text-[#C6A75E] font-bold">✓ 8 Connected</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#2A3655]">Status</span>
                      <span className="font-mono text-[#1F2A44] font-semibold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          PROJECT INTRODUCTION - Warm Beige section
          ============================================================ */}
      <section className="py-20 px-6 bg-[#E8DCC8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-[#1F2A44] mb-6">
            Land Governance, Simplified.
          </h2>
          <p className="text-lg text-[#2A3655] leading-relaxed mb-12 max-w-2xl mx-auto">
            Land information is often distributed across different records, departments and systems. LandLens brings these datasets together around each parcel, giving citizens and government officials a clearer and more connected view of the land.
          </p>
          
          {/* Simple Flow */}
          <div className="grid md:grid-cols-3 gap-8 items-center max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-[#C6A75E]/20">
              <div className="text-sm font-bold text-[#2A3655] mb-3 uppercase tracking-wider">Fragmented Data</div>
              <div className="space-y-2 text-xs text-[#2A3655] font-medium">
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
              <ArrowRight size={32} className="text-[#C6A75E] mb-2 hidden md:block" />
              <div className="font-heading font-bold text-xl text-[#1F2A44]">LANDLENS</div>
            </div>
            
            <div className="bg-[#1F2A44] text-white rounded-xl p-6 shadow-lg border-2 border-[#C6A75E]/40">
              <div className="text-sm font-bold text-[#E8DCC8] mb-3 uppercase tracking-wider">One Parcel View</div>
              <div className="flex items-center justify-center h-16">
                <Map size={40} className="text-[#C6A75E]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION - Deep Royal Navy
          ============================================================ */}
      <section id="features" className="py-20 px-6 bg-[#1F2A44]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-white mb-4">
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
                className="bg-[#E8DCC8] rounded-xl p-8 border-2 border-[#C6A75E]/30 hover:border-[#C6A75E] hover:shadow-xl hover:shadow-[#C6A75E]/20 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1F2A44] text-[#C6A75E] flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="text-4xl font-bold text-[#C6A75E]/20">{feature.num}</div>
                </div>
                <h3 className="font-heading font-bold text-xl text-[#1F2A44] mb-3">{feature.title}</h3>
                <p className="text-[#2A3655] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          LAND TRUTH ENGINE - Warm Beige
          ============================================================ */}
      <section className="py-20 px-6 bg-[#E8DCC8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl lg:text-5xl text-[#1F2A44] mb-6">
              Don&apos;t Just Store the Data.<br />Understand It.
            </h2>
            <p className="text-xl text-[#2A3655] max-w-3xl mx-auto">
              LandLens compares information from multiple sources to identify where records agree, where they differ and where human verification may be required.
            </p>
          </div>
          
          <div className="bg-white backdrop-blur rounded-2xl p-8 lg:p-12 border-2 border-[#C6A75E]/30 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex flex-wrap gap-3 mb-6">
                  {['RoR', 'Registration', 'Zoning', 'Master Plan', 'Restrictions'].map(item => (
                    <span key={item} className="px-3 py-1.5 bg-[#E8DCC8] border border-[#C6A75E]/40 rounded-lg text-sm font-semibold text-[#1F2A44]">{item}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <ArrowRight size={24} className="text-[#C6A75E]" />
                  <span className="font-bold text-lg text-[#1F2A44]">Land Truth Engine</span>
                </div>
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                  <div className="font-bold text-red-700 mb-2">AREA MISMATCH</div>
                  <div className="space-y-1 text-sm mb-4 text-[#2A3655]">
                    <div>RoR: <span className="font-mono font-bold">2.40 acres</span></div>
                    <div>Registration: <span className="font-mono font-bold">2.10 acres</span></div>
                  </div>
                  <div className="inline-block px-3 py-1 bg-red-600 text-white rounded text-xs font-bold uppercase">
                    Review Required
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#C6A75E] mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#1F2A44] mb-1">Evidence</div>
                    <div className="text-sm text-[#2A3655]">Every finding shows the exact datasets compared and values found.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#C6A75E] mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#1F2A44] mb-1">Datasets Compared</div>
                    <div className="text-sm text-[#2A3655]">Transparent cross-checking across all available records.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#C6A75E] mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#1F2A44] mb-1">Recommended Action</div>
                    <div className="text-sm text-[#2A3655]">Clear next steps for verification and resolution.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS - Deep Royal Navy
          ============================================================ */}
      <section id="how-it-works" className="py-20 px-6 bg-[#1F2A44]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-white mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="text-6xl font-bold text-[#C6A75E]/20 mb-4">{step.num}</div>
                <h3 className="font-heading font-bold text-xl text-white mb-2">{step.title}</h3>
                <p className="text-[#E8DCC8] leading-relaxed">{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 text-[#C6A75E]/40" size={24} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHO LANDLENS IS FOR - Warm Beige
          ============================================================ */}
      <section className="py-20 px-6 bg-[#E8DCC8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Citizens */}
            <div id="for-citizens" className="bg-white rounded-2xl p-10 border-2 border-[#C6A75E]/30">
              <Users size={40} className="text-[#C6A75E] mb-6" />
              <h2 className="font-heading font-bold text-3xl text-[#1F2A44] mb-4">For Citizens</h2>
              <p className="text-lg text-[#2A3655] mb-8">Find and understand land information.</p>
              
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
                    <CheckCircle2 size={18} className="text-[#C6A75E] flex-shrink-0" />
                    <span className="text-[#2A3655] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A75E] hover:bg-[#d4b36e] text-[#1F2A44] font-bold rounded-lg transition-all shadow-lg shadow-[#C6A75E]/30"
              >
                Explore Citizen Experience <ArrowRight size={18} />
              </Link>
            </div>

            {/* For Government */}
            <div id="for-government" className="bg-[#1F2A44] text-white rounded-2xl p-10 border-2 border-[#C6A75E]/40">
              <Building2 size={40} className="text-[#C6A75E] mb-6" />
              <h2 className="font-heading font-bold text-3xl mb-4">For Government</h2>
              <p className="text-lg text-[#E8DCC8] mb-8">Turn fragmented land data into actionable intelligence.</p>
              
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
                    <CheckCircle2 size={18} className="text-[#C6A75E] flex-shrink-0" />
                    <span className="text-[#E8DCC8] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A75E] hover:bg-[#d4b36e] text-[#1F2A44] font-bold rounded-lg transition-all shadow-lg shadow-[#C6A75E]/30"
              >
                Explore Government Platform <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TECHNOLOGY - Deep Royal Navy
          ============================================================ */}
      <section id="technology" className="py-20 px-6 bg-[#1F2A44]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-white mb-6">
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
                className="bg-[#E8DCC8] rounded-xl p-4 border-2 border-[#C6A75E]/30 flex items-center gap-4 hover:border-[#C6A75E] transition-all"
              >
                <Database size={20} className="text-[#C6A75E]" />
                <span className="font-bold text-[#1F2A44]">{layer}</span>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center text-sm text-[#E8DCC8] mt-12 leading-relaxed max-w-2xl mx-auto">
            LandLens is designed around interoperable APIs and a common parcel-centric data model, allowing different datasets and state-specific schemas to be connected without forcing every department into the same source system.
          </p>
        </div>
      </section>

      {/* ============================================================
          TRUST / SECURITY - Warm Beige
          ============================================================ */}
      <section className="py-20 px-6 bg-[#E8DCC8]">
        <div className="max-w-4xl mx-auto text-center">
          <Shield size={48} className="text-[#C6A75E] mx-auto mb-6" />
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-[#1F2A44] mb-6">
            Built for Responsible Land Governance
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {TRUST_ITEMS.map(item => (
              <div key={item} className="bg-white rounded-xl p-6 border-2 border-[#C6A75E]/30">
                <Lock size={24} className="text-[#C6A75E] mx-auto mb-3" />
                <div className="font-bold text-[#1F2A44]">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA - Deep Royal Navy
          ============================================================ */}
      <section className="py-32 px-6 bg-[#1F2A44]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl lg:text-6xl text-white mb-8">
            See Every Parcel<br />With More Clarity.
          </h2>
          <p className="text-xl text-[#E8DCC8] mb-12 max-w-2xl mx-auto">
            Explore LandLens and experience a more connected way to understand land information.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C6A75E] hover:bg-[#d4b36e] text-[#1F2A44] font-bold text-lg rounded-lg transition-all shadow-xl shadow-[#C6A75E]/30"
            >
              Explore LandLens <ArrowRight size={20} />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold text-lg rounded-lg border-2 border-[#C6A75E] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER - Warm Beige
          ============================================================ */}
      <footer className="bg-[#E8DCC8] border-t-2 border-[#C6A75E]/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="font-heading font-bold text-xl text-[#1F2A44] mb-4">LANDLENS</div>
              <p className="text-sm text-[#2A3655]">The Intelligence Layer for Land Governance</p>
            </div>
            
            <div>
              <div className="font-bold text-[#1F2A44] mb-3">Platform</div>
              <ul className="space-y-2 text-sm text-[#2A3655] font-medium">
                <li><a href="#features" className="hover:text-[#1F2A44]">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[#1F2A44]">How It Works</a></li>
                <li><a href="#technology" className="hover:text-[#1F2A44]">Technology</a></li>
                <li><Link href="/login" className="hover:text-[#1F2A44]">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-bold text-[#1F2A44] mb-3">For</div>
              <ul className="space-y-2 text-sm text-[#2A3655] font-medium">
                <li><a href="#for-citizens" className="hover:text-[#1F2A44]">Citizens</a></li>
                <li><a href="#for-government" className="hover:text-[#1F2A44]">Government</a></li>
              </ul>
            </div>
            
            <div>
              <div className="font-bold text-[#1F2A44] mb-3">Product</div>
              <ul className="space-y-2 text-sm text-[#2A3655] font-medium">
                <li><Link href="/map" className="hover:text-[#1F2A44]">Explore Map</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t-2 border-[#C6A75E]/20">
            <p className="text-xs text-[#2A3655] text-center font-medium">
              Prototype / Demonstration Platform • Synthetic Demonstration Data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
