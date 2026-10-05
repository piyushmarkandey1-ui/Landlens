'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { ArrowUpRight, ChevronRight, CircleDot, Database, FileCheck2, GitMerge, Layers3, Map, Play, ScanLine, Search, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';
// @ts-expect-error maath ships without types
import * as random from 'maath/random/dist/maath-random.esm';

const sources = ['RoR', 'Registration', 'Zoning', 'Master Plan', 'Tax', 'Satellite'];
const metrics = [
  ['630M+', 'addressable parcels'],
  ['10+', 'connected datasets'],
  ['4.2×', 'faster resolution'],
];

function ParcelField() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const [positions] = useState(() => random.inSphere(new Float32Array(4200), { radius: 1.3 }));
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.035;
      ref.current.rotation.x = Math.sin(Date.now() / 7000) * 0.08;
    }
  });
  return (
    <group rotation={[0.15, 0, -0.2]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#22d3ee" size={0.006} sizeAttenuation depthWrite={false} opacity={0.48} />
      </Points>
    </group>
  );
}

function ParcelDiagram() {
  return (
    <div className="relative aspect-square w-full max-w-[600px] overflow-hidden border border-cyan-300/15 bg-[#0b1728]/80 shadow-[0_40px_120px_rgba(0,0,0,.45)]">
      <div className="absolute inset-0 parcel-grid-bg opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(34,211,238,.16),transparent_34%),radial-gradient(circle_at_55%_55%,rgba(52,211,153,.1),transparent_52%)]" />
      <Canvas camera={{ position: [0, 0, 1.1], fov: 48 }}>
        <ambientLight intensity={0.6} />
        <ParcelField />
      </Canvas>
      <div className="absolute inset-[18%] border border-cyan-300/20 [clip-path:polygon(8%_16%,88%_4%,96%_72%,60%_96%,4%_78%)]" />
      <div className="absolute inset-[29%] border border-emerald-300/45 [clip-path:polygon(9%_18%,87%_4%,96%_74%,60%_96%,4%_78%)]" />
      <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 border border-cyan-200 bg-cyan-300/10 shadow-[0_0_45px_rgba(34,211,238,.45)] [clip-path:polygon(8%_16%,88%_4%,96%_72%,60%_96%,4%_78%)]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-12 items-center gap-2 font-mono text-[9px] uppercase tracking-[.2em] text-cyan-200"><CircleDot className="size-3" /> P-00427 / ACTIVE</div>
      {sources.map((source, i) => {
        const positions = ['left-[8%] top-[25%]', 'left-[4%] top-[63%]', 'right-[7%] top-[18%]', 'right-[3%] top-[43%]', 'right-[12%] bottom-[16%]', 'left-[24%] bottom-[8%]'];
        return <div key={source} className={`absolute ${positions[i]} flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.16em] text-slate-400`}><span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />{source}</div>;
      })}
      <div className="absolute bottom-5 left-5 font-mono text-[9px] uppercase tracking-[.18em] text-slate-600">21°15&apos;N · 81°37&apos;E / RAIPUR</div>
      <div className="absolute right-5 top-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-emerald-300"><span className="size-1.5 animate-pulse rounded-full bg-emerald-300" /> Live parcel model</div>
    </div>
  );
}

export default function LandingPage() {
  const [active, setActive] = useState(0);

  return (
    <main className="landing-page-wrapper min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-[#07111f]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 lg:px-12">
          <Link href="/" className="group flex items-center gap-3"><span className="grid size-9 place-items-center border border-cyan-200/40 bg-cyan-300/10 font-mono text-xs font-semibold text-cyan-200 transition group-hover:bg-cyan-300/20">LL</span><span><span className="block font-heading text-sm font-semibold tracking-[.16em] text-white">LANDLENS</span><span className="block font-mono text-[8px] uppercase tracking-[.2em] text-slate-500">Geospatial intelligence</span></span></Link>
          <div className="hidden items-center gap-8 text-[11px] uppercase tracking-[.16em] text-slate-400 md:flex"><Link href="/map" className="transition hover:text-cyan-200">Map</Link><Link href="/parcels/P-00427" className="transition hover:text-cyan-200">Parcels</Link><Link href="/technical-architecture" className="transition hover:text-cyan-200">Architecture</Link><Link href="/analytics" className="transition hover:text-cyan-200">Analytics</Link></div>
          <Link href="/login" className="group flex items-center gap-2 border border-cyan-200/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-cyan-100 transition hover:bg-cyan-300 hover:text-[#07111f]">Enter platform <ArrowUpRight className="size-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
        </div>
      </nav>

      <motion.section className="relative min-h-screen border-b border-white/[.07] px-6 pb-20 pt-40 lg:px-12 lg:pt-32">
        <div className="absolute inset-0 parcel-grid-bg opacity-20" /><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(34,211,238,.11),transparent_35%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-152px)] max-w-[1440px] items-center gap-14 lg:grid-cols-[.84fr_1.16fr]">
          <div className="max-w-xl"><div className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.28em] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#34d399]" /> GIS intelligence platform · India</div><h1 className="font-heading text-[clamp(4rem,8vw,8.5rem)] font-semibold leading-[.82] tracking-[-.08em] text-white">LAND<br /><span className="text-cyan-200">LENS</span><span className="text-cyan-300/30">.</span></h1><p className="mt-10 max-w-md text-lg leading-relaxed text-slate-400">See the land. <span className="text-slate-100">Understand the data.</span> Connect fragmented records, planning, registration and spatial intelligence around every parcel.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/login" className="group flex items-center gap-3 bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#07111f] transition hover:bg-white">Explore LandLens <ArrowUpRight className="size-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link><Link href="/map" className="flex items-center gap-3 border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[.12em] text-slate-200 transition hover:border-cyan-200/60 hover:text-cyan-200"><Play className="size-3 fill-current" /> View GIS demo</Link></div><div className="mt-16 grid max-w-md grid-cols-3 border-t border-white/10 pt-5">{metrics.map(([value, label]) => <div key={label}><div className="font-heading text-2xl text-white">{value}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[.12em] text-slate-500">{label}</div></div>)}</div></div>
          <ParcelDiagram />
        </div>
        <div className="absolute bottom-7 left-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.2em] text-slate-600 lg:left-12"><ScanLine className="size-3 text-cyan-300" /> Scroll to inspect the intelligence layer <ChevronRight className="size-3" /></div>
      </motion.section>

      <section className="border-b border-white/[.07] bg-[#0b1728] px-6 py-24 lg:px-12"><div className="mx-auto max-w-[1440px]"><div className="grid gap-14 lg:grid-cols-[.72fr_1.28fr]"><div><div className="eyebrow text-cyan-300">01 / Fragmented → connected</div><h2 className="mt-5 max-w-md font-heading text-4xl font-semibold leading-tight tracking-[-.04em] text-white">One parcel.<br /><span className="text-slate-500">Every point of truth.</span></h2><p className="mt-6 max-w-sm leading-relaxed text-slate-400">LandLens creates a living evidence graph around the parcel — so every decision starts with context, not a disconnected document.</p><Link href="/map" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-cyan-200">Open live map <ArrowUpRight className="size-4" /></Link></div><div className="relative grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{sources.map((source, i) => <button key={source} onClick={() => setActive(i)} className={`group min-h-36 bg-[#0b1728] p-6 text-left transition hover:bg-[#112238] ${active === i ? 'bg-[#112238]' : ''}`}><div className="mb-10 flex items-center justify-between"><span className="font-mono text-[10px] text-slate-600">0{i + 1}</span><Database className={`size-4 ${active === i ? 'text-cyan-200' : 'text-slate-600'}`} /></div><div className="text-sm font-medium text-slate-200">{source}</div><div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.1em] text-emerald-300/70"><span className="size-1 rounded-full bg-emerald-300" /> connected</div></button>)}</div></div></div></section>

      <section className="relative px-6 py-28 lg:px-12"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(23,37,84,.7),transparent_60%)]" /><div className="relative mx-auto grid max-w-[1440px] items-center gap-16 lg:grid-cols-[1.1fr_.9fr]"><div className="relative border border-white/10 bg-[#0b1728] p-6 shadow-2xl lg:p-10"><div className="mb-8 flex items-start justify-between"><div><div className="eyebrow text-amber-300">02 / Land Truth Engine</div><h2 className="mt-4 font-heading text-3xl font-semibold tracking-[-.04em] text-white">When records disagree,<br /><span className="text-slate-500">evidence takes over.</span></h2></div><Waypoints className="size-7 text-cyan-300" /></div><div className="border border-rose-300/20 bg-rose-300/[.04] p-5"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-rose-300"><span className="size-2 rounded-full bg-rose-300" /> Conflict detected · area mismatch</div><div className="mt-6 grid grid-cols-3 gap-4 text-sm"><div><div className="font-mono text-[10px] text-slate-500">RoR</div><div className="mt-2 text-xl text-white">2.40 <small className="text-xs text-slate-500">acres</small></div></div><div><div className="font-mono text-[10px] text-slate-500">Registration</div><div className="mt-2 text-xl text-white">2.10 <small className="text-xs text-slate-500">acres</small></div></div><div><div className="font-mono text-[10px] text-slate-500">Difference</div><div className="mt-2 text-xl text-amber-300">{"0.30 "}<span className="text-xs text-slate-500">acres</span></div></div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="border border-white/10 p-4"><div className="eyebrow text-cyan-200">Evidence</div><div className="mt-3 text-sm text-slate-300">2 source records require review</div></div><div className="border border-white/10 p-4"><div className="eyebrow text-emerald-300">Recommended action</div><div className="mt-3 text-sm text-slate-300">Initiate field verification</div></div></div></div><div><div className="eyebrow text-emerald-300">03 / Explainable intelligence</div><h2 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-[-.04em] text-white">From alert<br />to <span className="text-cyan-200">action.</span></h2><p className="mt-6 max-w-md leading-relaxed text-slate-400">Every conflict becomes a clear next step. LandLens gives officers, planners and citizens the evidence to move with confidence.</p><div className="mt-9 flex flex-col gap-4 border-l border-cyan-300/30 pl-5 text-sm text-slate-300"><div className="flex items-center gap-3"><ShieldCheck className="size-4 text-emerald-300" /> Traceable source evidence</div><div className="flex items-center gap-3"><GitMerge className="size-4 text-cyan-300" /> Cross-system comparison</div><div className="flex items-center gap-3"><FileCheck2 className="size-4 text-amber-300" /> Auditable workflow output</div></div></div></div></section>

      <section className="border-t border-white/[.07] bg-[#f7f9fc] px-6 py-24 text-[#07111f] lg:px-12"><div className="mx-auto grid max-w-[1440px] items-end gap-12 lg:grid-cols-[1fr_1fr]"><div><div className="eyebrow text-[#087f8c]">Built for the land stack</div><h2 className="mt-5 max-w-lg font-heading text-4xl font-semibold leading-tight tracking-[-.04em]">A calmer way to navigate complexity.</h2></div><div className="grid gap-3 sm:grid-cols-2"><Link href="/citizen" className="group border border-[#07111f]/10 p-5 transition hover:border-[#087f8c]/50 hover:bg-white"><Map className="size-5 text-[#087f8c]" /><div className="mt-10 text-sm font-semibold">For citizens</div><p className="mt-2 text-xs leading-relaxed text-slate-500">Find your land, understand restrictions and request service without the maze.</p><ArrowUpRight className="mt-5 size-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link><Link href="/dashboard" className="group border border-[#07111f]/10 p-5 transition hover:border-[#087f8c]/50 hover:bg-white"><Layers3 className="size-5 text-[#087f8c]" /><div className="mt-10 text-sm font-semibold">For institutions</div><p className="mt-2 text-xs leading-relaxed text-slate-500">Govern parcels, conflicts and workflows from one operational view.</p><ArrowUpRight className="mt-5 size-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></div></div></section>

      <footer className="border-t border-white/[.07] bg-[#07111f] px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="font-mono text-[10px] uppercase tracking-[.2em] text-slate-600">LANDLENS / INTELLIGENCE LAYER FOR INDIA&apos;S LAND STACK</div><div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[.15em] text-slate-500"><Link href="/technical-architecture" className="hover:text-cyan-200">Architecture</Link><Link href="/login" className="hover:text-cyan-200">Platform login</Link><Sparkles className="size-3 text-cyan-300" /></div></div></footer>
    </main>
  );
}
