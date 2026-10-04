'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Search, FileText, GitMerge, AlertTriangle,
  BarChart3, Workflow, Database, Shield, Settings, LogOut,
  Users, ChevronRight, Layers, Home
} from 'lucide-react';
import { useAuth, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import NotificationCenter from '@/components/NotificationCenter';

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
  { href: '/citizen', label: 'Citizen Services', icon: <Home size={16} />, roles: ['citizen', 'district_admin', 'system_admin'] },
  { href: '/officer', label: 'Parcel Search', icon: <Search size={16} />, roles: ['revenue_officer', 'planning_officer', 'registration_officer', 'district_admin', 'system_admin'] },
  { href: '/revenue', label: 'Revenue Records', icon: <FileText size={16} />, roles: ['revenue_officer', 'district_admin', 'system_admin'] },
  { href: '/planning', label: 'Planning & Zoning', icon: <Layers size={16} />, roles: ['planning_officer', 'district_admin', 'system_admin'] },
  { href: '/registration', label: 'Registrations', icon: <GitMerge size={16} />, roles: ['registration_officer', 'district_admin', 'system_admin'] },
  { href: '/alerts', label: 'Conflicts & Alerts', icon: <AlertTriangle size={16} />, roles: ['revenue_officer', 'planning_officer', 'district_admin', 'system_admin'], badge: 10 },
  { href: '/workflows', label: 'Workflows', icon: <Workflow size={16} />, roles: ['revenue_officer', 'planning_officer', 'registration_officer', 'district_admin', 'system_admin'], badge: 4 },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 size={16} />, roles: ['district_admin', 'system_admin'] },
  { href: '/data-sources', label: 'Data Sources', icon: <Database size={16} />, roles: ['system_admin', 'district_admin'] },
  { href: '/audit', label: 'Audit Logs', icon: <Shield size={16} />, roles: ['system_admin', 'district_admin', 'revenue_officer'] },
  { href: '/admin', label: 'Administration', icon: <Users size={16} />, roles: ['system_admin'] },
  { href: '/technical-architecture', label: 'Architecture', icon: <Layers size={16} />, roles: 'all' },
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
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-slate-950 border-r border-indigo-950/60 flex flex-col">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4 border-b border-indigo-950/60">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">LL</span>
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-white tracking-wide">LandLens</div>
            <div className="text-[10px] text-slate-500">Intelligence Layer</div>
          </div>
        </Link>

        {/* User Info */}
        <div className="px-3 py-3 border-b border-indigo-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-200 truncate">{user.name}</div>
              <div className={`chip text-[10px] mt-0.5 ${roleStyle}`}>
                {ROLE_LABELS[user.role]}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {visibleItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-sm">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500/80 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={12} className="text-indigo-400 flex-shrink-0" />}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-12 border-b border-indigo-950/60 flex items-center px-4 gap-4 bg-slate-950/80 backdrop-blur flex-shrink-0">
          <div className="flex-1">
            <nav className="flex items-center gap-1 text-xs text-slate-500">
              <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Home</Link>
              <ChevronRight size={10} />
              <span className="text-slate-400">{visibleItems.find(i => i.href === pathname || pathname.startsWith(i.href + '/'))?.label || 'Page'}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
             <NotificationCenter />
            <div className={`chip text-[10px] ${roleStyle}`}>
              {ROLE_LABELS[user.role]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-grid-pattern-sm relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
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
