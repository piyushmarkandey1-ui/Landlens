'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { motion } from 'framer-motion';
import { GitMerge, FileText, Scale, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { REGISTRATIONS, ENCUMBRANCES, CONFLICT_ALERTS } from '@/lib/data';

export default function RegistrationOfficerPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'registration_officer' && user?.role !== 'district_admin' && user?.role !== 'system_admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!user || (user.role !== 'registration_officer' && user.role !== 'district_admin' && user.role !== 'system_admin')) {
    return null;
  }

  const recentRegistrations = REGISTRATIONS.filter(r => r.status === 'Registered').slice(0, 10);
  const pendingRegistrations = REGISTRATIONS.filter(r => r.status === 'Pending');
  const activeEncumbrances = ENCUMBRANCES.filter(e => e.status === 'Active');

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-white mb-2">Registration</h1>
          <p className="text-slate-400">Property Transactions & Document Verification</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-white mb-1">{REGISTRATIONS.length}</div>
            <div className="text-sm text-slate-400">Total Registrations</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-amber-400 mb-1">{pendingRegistrations.length}</div>
            <div className="text-sm text-slate-400">Pending Review</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{recentRegistrations.length}</div>
            <div className="text-sm text-slate-400">This Month</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-violet-400 mb-1">{activeEncumbrances.length}</div>
            <div className="text-sm text-slate-400">Active Encumbrances</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="surface-card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitMerge size={18} className="text-cyan-400" />
                  <h2 className="font-heading font-semibold text-white">Recent Transactions</h2>
                </div>
                <Link href="/workflows" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document No</th>
                      <th>Parcel</th>
                      <th>Transaction</th>
                      <th>Value</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRegistrations.map(reg => (
                      <tr key={reg.id}>
                        <td className="font-mono text-cyan-400">{reg.documentNo}</td>
                        <td>
                          <Link href={`/parcels/${reg.parcelId}`} className="font-mono text-cyan-400 hover:text-cyan-300">
                            {reg.parcelId}
                          </Link>
                        </td>
                        <td className="text-slate-300">
                          <div className="text-sm">{reg.sellerName}</div>
                          <div className="text-xs text-slate-500">→ {reg.buyerName}</div>
                        </td>
                        <td className="text-slate-300">₹{(reg.saleValue / 100000).toFixed(2)}L</td>
                        <td className="text-slate-400 text-xs">{reg.registrationDate}</td>
                        <td>
                          <span className={`chip ${
                            reg.status === 'Registered' ? 'bg-emerald-500/15 text-emerald-400' :
                            reg.status === 'Pending' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-slate-500/15 text-slate-400'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Review */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-amber-400" />
                <h2 className="font-heading font-semibold text-white">Records Requiring Review</h2>
              </div>
              <div className="space-y-3">
                {pendingRegistrations.slice(0, 4).map(reg => (
                  <div key={reg.id} className="flex items-start justify-between py-3 border-b border-slate-800/50 last:border-0">
                    <div>
                      <div className="font-mono text-sm text-cyan-400">{reg.documentNo}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        <Link href={`/parcels/${reg.parcelId}`} className="hover:text-cyan-400">
                          {reg.parcelId}
                        </Link>
                        {' • '}
                        {reg.registrationDate}
                      </div>
                    </div>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">Review →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Active Encumbrances */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Scale size={18} className="text-violet-400" />
                <h2 className="font-heading font-semibold text-white">Active Encumbrances</h2>
              </div>
              <div className="space-y-3">
                {activeEncumbrances.slice(0, 5).map(enc => (
                  <div key={enc.id}>
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/parcels/${enc.parcelId}`} className="text-sm font-mono text-cyan-400 hover:text-cyan-300">
                        {enc.parcelId}
                      </Link>
                      <span className="chip text-[10px] bg-amber-500/15 text-amber-400">Active</span>
                    </div>
                    <div className="text-xs text-slate-400">{enc.type}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{enc.creditorName}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="surface-card p-5">
              <h2 className="font-heading font-semibold text-white mb-4">Today&apos;s Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Registrations</span>
                  <span className="text-emerald-400 font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Documents Verified</span>
                  <span className="text-cyan-400 font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Stamp Duty</span>
                  <span className="text-amber-400 font-semibold">₹24.5L</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="surface-card p-5">
              <h2 className="font-heading font-semibold text-white mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/map" className="nav-item">
                  <GitMerge size={14} /> View on Map
                </Link>
                <Link href="/workflows" className="nav-item">
                  <FileText size={14} /> Document Queue
                </Link>
                <Link href="/audit" className="nav-item">
                  <Scale size={14} /> Audit Trail
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
