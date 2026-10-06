'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { Settings, User, Shield, Palette } from 'lucide-react';
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
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200 mb-2">
            <Settings size={11} /> Preferences & Configuration
          </div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
            Account & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage your user session preferences, interface settings, and security protocols.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <User size={15} className="text-blue-600" />
            <span className="font-heading font-bold text-sm text-slate-900">User Profile</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="font-heading font-bold text-base text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
              <div className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {ROLE_LABELS[user.role]}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
            <div>
              <div className="text-slate-400 font-medium mb-0.5">Assigned Department</div>
              <div className="text-slate-800 font-semibold">{user.department || 'Public Citizen Portal'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium mb-0.5">Operating District</div>
              <div className="text-slate-800 font-semibold">{user.district || 'Raipur District, CG'}</div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Palette size={15} className="text-indigo-600" />
            <span className="font-heading font-bold text-sm text-slate-900">Interface & Workspace Preferences</span>
          </div>
          {[
            ['Cadastral Intelligence Light Theme', 'Standardised high-contrast white surfaces and government GIS layout.', true],
            ['Synthetic Demo Data Banner', 'Display demonstration watermark badge at bottom of workspace.', true],
            ['AI Parcel Copilot', 'Enable contextual AI reasoning modal across parcel inspections.', true],
            ['Immutable Audit Journal', 'Log all query searches and status changes to the compliance trail.', true],
          ].map(([label, desc, defaultOn]) => (
            <div key={label as string} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
              <div>
                <div className="text-xs font-semibold text-slate-900">{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </div>
              <div className={`w-9 h-5 rounded-full flex items-center ${defaultOn ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'} px-0.5 cursor-pointer`}>
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>
          ))}
        </div>

        {/* Security & Access Protocols */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Shield size={15} className="text-emerald-600" />
            <span className="font-heading font-bold text-sm text-slate-900">Security & Access Protocols</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="text-slate-600">Authentication Method</div>
              <span className="chip text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">Role-Based Demo Auth</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="text-slate-600">Session Timeout Policy</div>
              <span className="text-slate-800 font-medium">8 Hours (State Gov Default)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="text-slate-600">Access Control Enforcement</div>
              <span className="chip text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">Strict Multi-Agency RBAC</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            In enterprise deployments: Single Sign-On (SSO) via DigiLocker / Parichay, biometric authentication, and multi-factor authorization protect production land administration records.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
