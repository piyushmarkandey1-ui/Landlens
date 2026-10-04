'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/auth';

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl text-white mb-1 flex items-center gap-2">
            <Settings size={20} className="text-slate-400" />
            Settings
          </h1>
          <p className="text-sm text-slate-500">Account preferences and system configuration.</p>
        </div>

        {/* Profile */}
        <div className="surface-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User size={14} className="text-indigo-400" />
            <span className="font-semibold text-sm text-white">Profile</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-white">{user.name}</div>
              <div className="text-sm text-slate-500">{user.email}</div>
              <div className="text-xs text-indigo-400 mt-0.5">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-slate-600 mb-1">Department</div><div className="text-slate-300">{user.department || 'Public Portal'}</div></div>
            <div><div className="text-xs text-slate-600 mb-1">District</div><div className="text-slate-300">{user.district || 'N/A'}</div></div>
          </div>
        </div>

        {/* Preferences */}
        <div className="surface-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={14} className="text-violet-400" />
            <span className="font-semibold text-sm text-white">Preferences</span>
          </div>
          {[
            ['Dark Mode', 'Always on — LandLens is designed for dark mode.', true],
            ['Demo Data Banner', 'Show synthetic data indicator at bottom of screen.', true],
            ['AI Assistant', 'Enable parcel AI assistant popup.', true],
            ['Audit Logging', 'Log all parcel views and actions.', true],
          ].map(([label, desc, defaultOn]) => (
            <div key={label as string} className="flex items-center justify-between py-3 border-b border-slate-800/40 last:border-0">
              <div>
                <div className="text-sm text-slate-300">{label}</div>
                <div className="text-xs text-slate-600">{desc}</div>
              </div>
              <div className={`w-9 h-5 rounded-full flex items-center ${defaultOn ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'} px-0.5`}>
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </div>
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-emerald-400" />
            <span className="font-semibold text-sm text-white">Security</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
              <div className="text-sm text-slate-400">Authentication Method</div>
              <span className="chip text-[10px] bg-amber-500/15 text-amber-400">Demo Mode</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
              <div className="text-sm text-slate-400">Session Timeout</div>
              <span className="text-xs text-slate-500">8 hours (govt default)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="text-sm text-slate-400">Audit Logging</div>
              <span className="chip text-[10px] bg-emerald-500/15 text-emerald-400">Enabled</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-600">
            In production: Supabase Auth / government SSO, MFA, session management, and role assignment would be managed by department IT administrators.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
