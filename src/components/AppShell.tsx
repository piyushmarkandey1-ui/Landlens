'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Search, FileText, GitMerge, AlertTriangle,
  BarChart3, Workflow, Database, Shield, Settings, LogOut,
  Users, ChevronRight, Layers, Home, Bell
} from 'lucide-react';
import { useAuth, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[] | 'all';
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, roles: 'all' },
  { href: '/map', label: 'GIS Map', icon: <Map size={16} />, roles: 'all' },
  { href: '/citizen', label: 'Citizen Portal', icon: <Home size={16} />, roles: ['citizen', 'district_admin', 'system_admin'] },
  { href: '/revenue-officer', label: 'Revenue', icon: <FileText size={16} />, roles: ['revenue_officer', 'district_admin', 'system_admin'] },
  { href: '/planning-officer', label: 'Planning', icon: <Layers size={16} />, roles: ['planning_officer', 'district_admin', 'system_admin'] },
  { href: '/registration-officer', label: 'Registration', icon: <GitMerge size={16} />, roles: ['registration_officer', 'district_admin', 'system_admin'] },
  { href: '/district-admin', label: 'District Admin', icon: <BarChart3 size={16} />, roles: ['district_admin', 'system_admin'] },
  { href: '/alerts', label: 'Alerts', icon: <AlertTriangle size={16} />, roles: ['revenue_officer', 'planning_officer', 'district_admin', 'system_admin'], badge: 10 },
  { href: '/workflows', label: 'Workflows', icon: <Workflow size={16} />, roles: ['revenue_officer', 'planning_officer', 'registration_officer', 'district_admin', 'system_admin'], badge: 4 },
  { href: '/data-sources', label: 'Data Sources', icon: <Database size={16} />, roles: ['system_admin', 'district_admin'] },
  { href: '/audit', label: 'Audit', icon: <Shield size={16} />, roles: ['system_admin', 'district_admin', 'revenue_officer'] },
  { href: '/admin', label: 'System Admin', icon: <Users size={16} />, roles: ['system_admin'] },
  { href: '/settings', label: 'Settings', icon: <Settings size={16} />, roles: 'all' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return <>{children}</>;

  const visibleItems = NAV_ITEMS.filter(item =>
    item.roles === 'all' || item.roles.includes(user.role)
  );

  const roleStyle = ROLE_COLORS[user.role];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* ============================================================
          SIDEBAR
          ============================================================ */}
      <aside className="w-64 flex-shrink-0 bg-slate-950 border-r border-indigo-950/50 flex flex-col">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-4 border-b border-indigo-950/50">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <span className="text-white text-sm font-bold">LL</span>
          </div>
          <div className="flex-1">
            <div className="font-heading font-bold text-white tracking-tight">LandLens</div>
            <div className="text-[9px] text-slate-500 tracking-wider uppercase leading-none">GIS Intelligence</div>
          </div>
        </Link>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md shadow-indigo-900/30">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-200 truncate">{user.name}</div>
              <div className={`chip text-[10px] mt-1 ${roleStyle}`}>
                {ROLE_LABELS[user.role]}
              </div>
            </div>
          </div>
          {user.district && (
            <div className="mt-2 text-xs text-slate-500">
              📍 {user.district}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-3 border-t border-indigo-950/40">
          <button
            onClick={logout}
            className="nav-item w-full text-left text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================
          MAIN CONTENT AREA
          ============================================================ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-indigo-950/50 flex items-center px-6 gap-4 bg-slate-950/90 backdrop-blur-xl flex-shrink-0">
          <div className="flex-1">
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
              <ChevronRight size={12} />
              <span className="text-slate-300 font-medium">
                {visibleItems.find(i => i.href === pathname || pathname.startsWith(i.href + '/'))?.label || 'Page'}
              </span>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-800/60 transition-colors text-slate-400 hover:text-slate-300">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            
            <div className={`chip ${roleStyle}`}>
              {ROLE_LABELS[user.role]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto parcel-grid-bg relative bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
