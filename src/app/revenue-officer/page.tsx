'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { motion } from 'framer-motion';
import { AlertTriangle, FileText, GitMerge, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CONFLICT_ALERTS, WORKFLOW_TASKS, PARCELS } from '@/lib/data';

export default function RevenueOfficerPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'revenue_officer' && user?.role !== 'district_admin' && user?.role !== 'system_admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!user || (user.role !== 'revenue_officer' && user.role !== 'district_admin' && user.role !== 'system_admin')) {
    return null;
  }

  const verificationQueue = CONFLICT_ALERTS.filter(a => 
    (a.status === 'Open' || a.status === 'Under Review') && 
    (a.alertType === 'area_mismatch' || a.alertType === 'ownership_conflict')
  );

  const pendingMutations = WORKFLOW_TASKS.filter(t => 
    t.type === 'Mutation Approval' && t.status !== 'Resolved'
  );

  const recordConflicts = CONFLICT_ALERTS.filter(a => 
    a.alertType === 'ownership_conflict' || a.alertType === 'area_mismatch'
  );

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-white mb-2">Revenue Overview</h1>
          <p className="text-slate-400">Record of Rights, Mutations & Verification</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/map" className="surface-elevated p-5 hover:border-indigo-500/30 transition-colors">
            <div className="text-3xl font-bold text-white mb-1">{PARCELS.length}</div>
            <div className="text-sm text-slate-400">Total Parcels</div>
          </Link>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-amber-400 mb-1">{verificationQueue.length}</div>
            <div className="text-sm text-slate-400">Pending Verification</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-red-400 mb-1">{recordConflicts.length}</div>
            <div className="text-sm text-slate-400">Record Conflicts</div>
          </div>
          <div className="surface-elevated p-5">
            <div className="text-3xl font-bold text-cyan-400 mb-1">{pendingMutations.length}</div>
            <div className="text-sm text-slate-400">Pending Mutations</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Verification Queue */}
          <div className="lg:col-span-2">
            <div className="surface-card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <h2 className="font-heading font-semibold text-white">Verification Queue</h2>
                </div>
                <Link href="/alerts" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Parcel</th>
                      <th>Issue</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationQueue.slice(0, 8).map(alert => (
                      <tr key={alert.id}>
                        <td>
                          <Link href={`/parcels/${alert.parcelId}`} className="font-mono text-cyan-400 hover:text-cyan-300">
                            {alert.parcelId}
                          </Link>
                        </td>
                        <td className="text-slate-300">{alert.title}</td>
                        <td>
                          <span className={`chip ${
                            alert.severity === 'critical' ? 'bg-red-500/15 text-red-400' :
                            alert.severity === 'high' ? 'bg-orange-500/15 text-orange-400' :
                            'bg-amber-500/15 text-amber-400'
                          }`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`chip ${
                            alert.status === 'Open' ? 'bg-red-500/15 text-red-400' :
                            'bg-amber-500/15 text-amber-400'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td>
                          <Link 
                            href={`/parcels/${alert.parcelId}`}
                            className="text-indigo-400 hover:text-indigo-300 text-xs"
                          >
                            Review →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent RoR Activity */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-emerald-400" />
                <h2 className="font-heading font-semibold text-white">Recent RoR Activity</h2>
              </div>
              <div className="space-y-3">
                {[
                  { action: 'RoR Updated', parcel: 'P-0012', time: '2 hours ago', user: 'Field Officer' },
                  { action: 'Verification Completed', parcel: 'P-0034', time: '5 hours ago', user: 'You' },
                  { action: 'Mutation Approved', parcel: 'P-0089', time: '1 day ago', user: 'Senior Officer' },
                  { action: 'RoR Conflict Resolved', parcel: 'P-0156', time: '2 days ago', user: 'You' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-slate-800/50 last:border-0">
                    <div>
                      <div className="text-sm text-slate-300">{item.action}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <Link href={`/parcels/${item.parcel}`} className="font-mono text-cyan-400 hover:text-cyan-300">
                          {item.parcel}
                        </Link>
                        {' • '} {item.user}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Pending Mutations */}
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <GitMerge size={18} className="text-violet-400" />
                <h2 className="font-heading font-semibold text-white">Pending Mutations</h2>
              </div>
              <div className="space-y-3">
                {pendingMutations.slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-start justify-between">
                    <div>
                      <Link href={`/parcels/${task.parcelId}`} className="text-sm font-mono text-cyan-400 hover:text-cyan-300">
                        {task.parcelId}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">{task.title}</div>
                    </div>
                    <span className={`chip text-[10px] ${
                      task.priority === 'Critical' ? 'bg-red-500/15 text-red-400' :
                      task.priority === 'High' ? 'bg-orange-500/15 text-orange-400' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/workflows" className="block mt-4 text-xs text-indigo-400 hover:text-indigo-300 text-center">
                View All Mutations →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="surface-card p-5">
              <h2 className="font-heading font-semibold text-white mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Verified Today</span>
                  <span className="text-emerald-400 font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Avg. Resolution Time</span>
                  <span className="text-cyan-400 font-semibold">3.2 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Your Tasks</span>
                  <span className="text-amber-400 font-semibold">{pendingMutations.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="surface-card p-5">
              <h2 className="font-heading font-semibold text-white mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/map" className="nav-item">
                  <CheckCircle2 size={14} /> View GIS Map
                </Link>
                <Link href="/alerts" className="nav-item">
                  <AlertTriangle size={14} /> All Conflicts
                </Link>
                <Link href="/workflows" className="nav-item">
                  <GitMerge size={14} /> Workflow Inbox
                </Link>
                <Link href="/audit" className="nav-item">
                  <Clock size={14} /> Audit Trail
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
