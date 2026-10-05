'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_USERS, ROLE_LABELS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import { ArrowRight, Map } from 'lucide-react';
import Link from 'next/link';

const ROLES: UserRole[] = ['citizen', 'revenue_officer', 'planning_officer', 'registration_officer', 'district_admin', 'system_admin'];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    login(selectedRole);
    if (selectedRole === 'citizen') router.push('/citizen');
    else router.push(`/${selectedRole.replace('_', '-')}`);
  };

  const user = DEMO_USERS[selectedRole];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12">
        <div>
          <Link href="/" className="font-heading font-bold text-2xl">LANDLENS</Link>
          <p className="text-slate-400 text-sm mt-2">The Intelligence Layer for Land Governance</p>
        </div>
        
        <div>
          <h1 className="font-heading font-bold text-4xl mb-4">Welcome to LandLens</h1>
          <p className="text-xl text-slate-300 max-w-md">
            Access the tools and information relevant to your role.
          </p>
        </div>
        
        {/* Stylized GIS Visual */}
        <div className="relative h-32 opacity-20">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            <g stroke="currentColor" strokeWidth="0.5" fill="none">
              {[...Array(40)].map((_, i) => (
                <line key={i} x1={i * 10} y1="0" x2={i * 10} y2="100" />
              ))}
              {[...Array(10)].map((_, i) => (
                <line key={i} x1="0" y1={i * 10} x2="400" y2={i * 10} />
              ))}
            </g>
            <rect x="50" y="20" width="60" height="60" stroke="currentColor" strokeWidth="1.5" fill="rgba(6, 182, 212, 0.1)" />
            <rect x="120" y="30" width="40" height="40" stroke="currentColor" strokeWidth="1" fill="rgba(16, 185, 129, 0.1)" />
          </svg>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="font-heading font-bold text-2xl text-slate-900">LANDLENS</Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-600 mb-8">Choose your role to access LandLens</p>
            
            {/* Demo Role Selector */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Demo Mode</div>
              <div className="text-sm text-amber-700">Select a role to explore the platform. This is a prototype environment with synthetic data.</div>
            </div>
            
            <div className="space-y-3 mb-8">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedRole === role
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{ROLE_LABELS[role]}</div>
                      <div className="text-sm text-slate-600">{DEMO_USERS[role].department || 'Public Access'}</div>
                    </div>
                    {selectedRole === role && (
                      <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="text-xs text-slate-500 mb-1">Signing in as</div>
              <div className="font-semibold text-slate-900">{user.name}</div>
              <div className="text-sm text-slate-600">{user.email}</div>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors mb-4"
            >
              Continue as {ROLE_LABELS[selectedRole]} <ArrowRight size={18} />
            </button>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                ← Back to Home
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/map" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
                <Map size={14} /> Explore Map
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
