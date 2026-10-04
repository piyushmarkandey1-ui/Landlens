'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_USERS, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import { ArrowRight, Users, FileText, Layers, GitMerge, BarChart3, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

const ROLE_DESCRIPTIONS: Record<UserRole, { desc: string; icon: React.ReactNode; access: string[] }> = {
  citizen: {
    desc: 'Search parcels, check land use, submit service requests, and track applications.',
    icon: <Users size={20} />,
    access: ['Public parcel information', 'Land use & zoning', '"Can I build here?" tool', 'Service request tracking'],
  },
  revenue_officer: {
    desc: 'Access RoR, ownership records, manage mutations and resolve conflicts.',
    icon: <FileText size={20} />,
    access: ['Record of Rights (RoR)', 'Ownership & mutation records', 'Conflict queue', 'Field verification tasks'],
  },
  planning_officer: {
    desc: 'Review zoning, master plans, building permissions, and environmental restrictions.',
    icon: <Layers size={20} />,
    access: ['Zoning & master plan', 'Building permissions', 'Road reservations', 'Satellite change alerts'],
  },
  registration_officer: {
    desc: 'Review registration records, transaction history, and document workflows.',
    icon: <GitMerge size={20} />,
    access: ['Registration records', 'Transaction history', 'Document verification', 'Encumbrance records'],
  },
  district_admin: {
    desc: 'District analytics, conflict resolution, departmental performance, and geographic hotspots.',
    icon: <BarChart3 size={20} />,
    access: ['District dashboard', 'Conflict hotspot map', 'Departmental KPIs', 'Workflow escalation'],
  },
  system_admin: {
    desc: 'Users, roles, datasets, API connections, metadata, and system health.',
    icon: <Settings size={20} />,
    access: ['User management', 'Dataset registry', 'API connectors', 'Full audit logs'],
  },
};

const ROLE_ORDER: UserRole[] = ['citizen', 'revenue_officer', 'planning_officer', 'registration_officer', 'district_admin', 'system_admin'];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    login(selectedRole);
    if (selectedRole === 'citizen') router.push('/citizen');
    else router.push('/dashboard');
  };

  const roleInfo = ROLE_DESCRIPTIONS[selectedRole];
  const user = DEMO_USERS[selectedRole];
  const roleColor = ROLE_COLORS[selectedRole];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">LL</span>
            </div>
            <span className="font-heading font-bold text-xl text-white">LandLens</span>
          </Link>
          <h1 className="font-heading font-bold text-3xl text-white mb-2">Select Your Role</h1>
          <p className="text-slate-400">Choose a demo role to explore the corresponding dashboard and features.</p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs">
            <Shield size={11} />
            Demo Mode — No real credentials required
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Role Selector */}
          <div className="surface-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Available Roles</div>
            <div className="space-y-1.5">
              {ROLE_ORDER.map(role => {
                const isSelected = selectedRole === role;
                const color = ROLE_COLORS[role];
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${isSelected ? '' : 'hover:bg-slate-800/60'}`}
                    style={isSelected ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' } : {}}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      {ROLE_DESCRIPTIONS[role].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200">{ROLE_LABELS[role]}</div>
                      <div className="text-[11px] text-slate-600">{DEMO_USERS[role].department || 'Public Portal'}</div>
                    </div>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Details + Login */}
          <div className="flex flex-col gap-4">
            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="surface-elevated p-5 flex-1"
            >
              <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-sm font-medium mb-4 ${roleColor}`}>
                {ROLE_DESCRIPTIONS[selectedRole].icon}
                {ROLE_LABELS[selectedRole]}
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-0.5">Signing in as</div>
                <div className="font-semibold text-white">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{roleInfo.desc}</p>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Access Includes</div>
              <ul className="space-y-1.5">
                {roleInfo.access.map(a => (
                  <li key={a} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </motion.div>

            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl gradient-primary text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-indigo-900/40"
            >
              Sign in as {ROLE_LABELS[selectedRole]}
              <ArrowRight size={18} />
            </button>
            <Link href="/" className="text-center text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← Back to Landing Page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
