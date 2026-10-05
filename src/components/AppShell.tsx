'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Search, FileText, GitMerge, AlertTriangle,
  BarChart3, Workflow, Database, Shield, Settings, LogOut,
  Users, ChevronRight, Layers, Home, Bell, Menu, X, Sparkles,
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

/* ── Nav definition ── */
interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[] | 'all';
  badge?: number;
  group: string;
}

const NAV: NavItem[] = [
  { href: '/dashboard',          label: 'Dashboard',        icon: <LayoutDashboard size={15} />, roles: 'all',                                                                                       group: 'Main'      },
  { href: '/map',                label: 'GIS Map',           icon: <Map size={15} />,             roles: 'all',                                                                                       group: 'Main'      },
  { href: '/citizen',            label: 'Citizen Portal',    icon: <Home size={15} />,            roles: ['citizen','district_admin','system_admin'],                                                  group: 'Main'      },
  { href: '/officer',            label: 'Parcel Search',     icon: <Search size={15} />,          roles: ['revenue_officer','planning_officer','registration_officer','district_admin','system_admin'], group: 'Records'   },
  { href: '/revenue',            label: 'Revenue',           icon: <FileText size={15} />,        roles: ['revenue_officer','district_admin','system_admin'],                                          group: 'Records'   },
  { href: '/planning',           label: 'Planning',          icon: <Layers size={15} />,          roles: ['planning_officer','district_admin','system_admin'],                                         group: 'Records'   },
  { href: '/registration',       label: 'Registration',      icon: <GitMerge size={15} />,        roles: ['registration_officer','district_admin','system_admin'],                                     group: 'Records'   },
  { href: '/alerts',             label: 'Alerts',            icon: <AlertTriangle size={15} />,   roles: ['revenue_officer','planning_officer','district_admin','system_admin'],                       group: 'Operations', badge: 10 },
  { href: '/workflows',          label: 'Workflows',         icon: <Workflow size={15} />,        roles: ['revenue_officer','planning_officer','registration_officer','district_admin','system_admin'], group: 'Operations', badge: 4 },
  { href: '/analytics',          label: 'Analytics',         icon: <BarChart3 size={15} />,       roles: ['district_admin','system_admin'],                                                            group: 'Operations' },
  { href: '/data-sources',       label: 'Data Sources',      icon: <Database size={15} />,        roles: ['system_admin','district_admin'],                                                            group: 'System'    },
  { href: '/audit',              label: 'Audit Log',         icon: <Shield size={15} />,          roles: ['system_admin','district_admin','revenue_officer'],                                          group: 'System'    },
  { href: '/admin',              label: 'Admin',             icon: <Users size={15} />,           roles: ['system_admin'],                                                                             group: 'System'    },
  { href: '/settings',           label: 'Settings',          icon: <Settings size={15} />,        roles: 'all',                                                                                       group: 'System'    },
];

const GROUP_ORDER = ['Main', 'Records', 'Operations', 'System'];

/* ── Role badge colours ── */
const ROLE_BADGE: Record<UserRole, { bg: string; text: string; border: string }> = {
  citizen:               { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  revenue_officer:       { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  planning_officer:      { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  registration_officer:  { bg: '#fdf4ff', text: '#6b21a8', border: '#e9d5ff' },
  district_admin:        { bg: '#f0f9ff', text: '#0c4a6e', border: '#bae6fd' },
  system_admin:          { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' },
};

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="gradient-brand rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 select-none shadow-xs"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.35) }}
    >
      {initials}
    </div>
  );
}

function RolePill({ role }: { role: UserRole }) {
  const s = ROLE_BADGE[role];
  return (
    <span
      className="chip text-[10px]"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!user) return <>{children}</>;

  const visible = NAV.filter(i => i.roles === 'all' || (i.roles as UserRole[]).includes(user.role));
  const groups = GROUP_ORDER
    .map(g => ({ label: g, items: visible.filter(i => i.group === g) }))
    .filter(g => g.items.length > 0);

  const currentItem = visible.find(i => pathname === i.href || pathname.startsWith(i.href + '/'));
  const totalBadges = visible.reduce((n, i) => n + (i.badge ?? 0), 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-[236px] bg-white border-r border-slate-200/80 shadow-xs
          lg:relative lg:translate-x-0 lg:z-auto transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-200/80 group"
        >
          <div className="gradient-brand w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles size={13} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-sm tracking-tight text-slate-900">
              LandLens
            </div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              GIS Intelligence
            </div>
          </div>
        </Link>

        {/* User Card */}
        <div className="p-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <Avatar name={user.name} size={32} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {user.name}
              </div>
              <div className="mt-0.5">
                <RolePill role={user.role} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items with Animated Active Pill */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <div key={item.href} className="relative">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? 'text-indigo-700 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        {/* Animated sliding background pill */}
                        {active && (
                          <motion.div
                            layoutId="sidebarActiveBackground"
                            className="absolute inset-0 bg-indigo-50 border border-indigo-200/80 rounded-lg -z-10"
                            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                          />
                        )}

                        <span className={`flex-shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {item.icon}
                        </span>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-2.5 border-t border-slate-200/80">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ═══════════ MAIN VIEWPORT ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Sticky Header */}
        <header className="h-14 flex items-center justify-between gap-3 px-4 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile burger */}
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors font-medium">
                Dashboard
              </Link>
              {currentItem && currentItem.href !== '/dashboard' && (
                <>
                  <ChevronRight size={11} className="text-slate-300" />
                  <span className="font-semibold text-slate-900">
                    {currentItem.label}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Center search shortcut */}
          <Link
            href="/officer"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors w-64"
          >
            <Search size={13} />
            <span className="truncate flex-1">Search parcel or ULPIN…</span>
            <kbd className="font-mono text-[9px] bg-white border border-slate-200 px-1 rounded text-slate-400">⌘K</kbd>
          </Link>

          {/* Right: Live pill, Bell, Role */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-semibold text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Live Cadastre</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                onClick={() => setNotifOpen(v => !v)}
              >
                <Bell size={16} />
                {totalBadges > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    key="notif"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {totalBadges} new
                      </span>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {[
                        { title: '10 open conflict alerts', sub: 'Raipur Urban · Action required', color: '#b91c1c' },
                        { title: '4 workflows overdue', sub: 'Circle Officer SLA breach', color: '#b45309' },
                        { title: 'DORIS registration synced', sub: '342 new deeds indexed', color: '#15803d' },
                      ].map((n) => (
                        <div
                          key={n.title}
                          className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                        >
                          <div className="font-semibold leading-tight" style={{ color: n.color }}>{n.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{n.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 text-center">
                      <Link
                        href="/alerts"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View all alerts →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <RolePill role={user.role} />
          </div>
        </header>

        {/* Main scrollable body */}
        <main
          className="flex-1 overflow-y-auto relative"
          style={{ background: 'var(--bg-page)' }}
          onClick={() => notifOpen && setNotifOpen(false)}
        >
          <div className="absolute inset-0 parcel-grid-bg pointer-events-none opacity-30" />
          <div className="relative min-h-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
