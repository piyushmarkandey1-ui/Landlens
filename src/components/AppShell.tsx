'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Search, FileText, GitMerge, AlertTriangle,
  BarChart3, Workflow, Database, Shield, Settings, LogOut, Users,
  Layers, Home, Bell, Menu, HelpCircle, ChevronRight, X
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import { useState } from 'react';

interface NavItem { href: string; label: string; icon: ReactNode; roles: UserRole[] | 'all'; badge?: number }

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard />, roles: 'all' },
  { href: '/citizen', label: 'Find Land', icon: <Search />, roles: ['citizen', 'district_admin', 'system_admin'] },
  { href: '/map', label: 'GIS Map', icon: <Map />, roles: 'all' },
  { href: '/revenue', label: 'Revenue Workspace', icon: <FileText />, roles: ['revenue_officer', 'district_admin', 'system_admin'] },
  { href: '/planning', label: 'Planning & Zoning', icon: <Layers />, roles: ['planning_officer', 'district_admin', 'system_admin'] },
  { href: '/registration', label: 'Registrations', icon: <GitMerge />, roles: ['registration_officer', 'district_admin', 'system_admin'] },
  { href: '/workflows', label: 'Workflows', icon: <Workflow />, roles: ['revenue_officer', 'planning_officer', 'registration_officer', 'district_admin', 'system_admin'], badge: 4 },
  { href: '/alerts', label: 'Alerts', icon: <AlertTriangle />, roles: ['revenue_officer', 'planning_officer', 'district_admin', 'system_admin'], badge: 10 },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 />, roles: ['district_admin', 'system_admin'] },
  { href: '/data-sources', label: 'Data Sources', icon: <Database />, roles: ['district_admin', 'system_admin'] },
  { href: '/audit', label: 'Audit Log', icon: <Shield />, roles: ['revenue_officer', 'district_admin', 'system_admin'] },
  { href: '/admin', label: 'System Admin', icon: <Users />, roles: ['system_admin'] },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return <>{children}</>;
  const visibleItems = NAV_ITEMS.filter(item => item.roles === 'all' || item.roles.includes(user.role));
  const active = visibleItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  const roleLabel = ROLE_LABELS[user.role];

  return (
    <div className="app-shell min-h-screen bg-[#f5f7fa] text-slate-900">
      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#00c896] text-sm font-bold text-[#071b2b]">LL</span>
            <span><strong className="block text-white tracking-tight">LANDLENS</strong><small className="block text-[10px] uppercase tracking-[.16em] text-slate-400">Land intelligence</small></span>
          </Link>
          <button className="text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white">{user.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div><div className="min-w-0"><div className="truncate text-sm font-semibold text-white">{user.name}</div><div className="truncate text-xs text-slate-400">{roleLabel}</div></div></div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><span className="size-2 rounded-full bg-[#00c896]" /> Raipur district</div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">Workspace</p>
          <div className="flex flex-col gap-1">{visibleItems.map(item => { const isActive = pathname === item.href || pathname.startsWith(item.href + '/'); return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`app-nav-item ${isActive ? 'active' : ''}`}><span className="app-nav-icon">{item.icon}</span><span className="flex-1">{item.label}</span>{item.badge ? <span className="app-nav-badge">{item.badge}</span> : null}</Link> })}</div>
          <p className="px-3 pb-2 pt-7 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">Account</p>
          <Link href="/settings" className="app-nav-item"><Settings className="app-nav-icon" /><span>Settings</span></Link>
        </nav>
        <div className="border-t border-white/10 p-3"><button onClick={logout} className="app-nav-item w-full text-left text-slate-400 hover:text-white"><LogOut className="app-nav-icon" /><span>Sign out</span></button></div>
      </aside>
      {mobileOpen && <button className="app-sidebar-backdrop lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <div className="app-main flex min-w-0 flex-1 flex-col">
        <header className="app-topbar"><button className="mr-2 text-slate-500 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button><div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-xs text-slate-500"><Link href="/dashboard" className="hover:text-slate-900">Workspace</Link><ChevronRight size={13}/><span className="font-medium text-slate-900">{active?.label ?? 'Overview'}</span></div></div><div className="hidden max-w-md flex-1 md:flex"><div className="app-search"><Search size={16}/><input aria-label="Search parcels" placeholder="Search parcels, ULPIN, applications..." /></div></div><div className="ml-auto flex items-center gap-3"><span className="demo-badge"><span /> DEMO DATA</span><button className="topbar-icon" aria-label="Help"><HelpCircle /></button><button className="topbar-icon relative" aria-label="Notifications"><Bell /><span className="notification-dot" /></button><div className="hidden border-l border-slate-200 pl-3 sm:block"><div className="text-sm font-semibold text-slate-900">{user.name}</div><div className="text-xs text-slate-500">{roleLabel}</div></div></div></header>
        <main className="app-content"><div className="app-page-transition">{children}</div></main>
      </div>
    </div>
  );
}

export { NAV_ITEMS };
