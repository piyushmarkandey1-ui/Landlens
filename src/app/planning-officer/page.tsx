'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { motion } from 'framer-motion';
import { Layers, Building2, Map, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CONFLICT_ALERTS, BUILDING_PERMISSIONS, ZONING_RECORDS } from '@/lib/data';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function PlanningOfficerPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'planning_officer' && user?.role !== 'district_admin' && user?.role !== 'system_admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!user || (user.role !== 'planning_officer' && user.role !== 'district_admin' && user.role !== 'system_admin')) {
    return null;
  }

  const planningConflicts = CONFLICT_ALERTS.filter(a => 
    a.alertType === 'planning_conflict' || a.alertType === 'restriction_overlap'
  );

  const pendingPermissions = BUILDING_PERMISSIONS.filter(p => 
    p.status === 'Pending' || p.status === 'Under Review'
  );

  const restrictedParcels = CONFLICT_ALERTS.filter(a => 
    a.alertType === 'restriction_overlap'
  ).length;

  return (
    <AppShell>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading font-bold text-3xl text-white mb-2">Planning Intelligence</h1>
            <p className="text-slate-400">Zoning, Master Plans & Development Control</p>
          </motion.div>
        </div>

        {/* KPIs */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="surface-elevated p-4">
              <div className="text-2xl font-bold text-white mb-1">{ZONING_RECORDS.length}</div>
              <div className="text-xs text-slate-400">Zoned Parcels</div>
            </div>
            <div className="surface-elevated p-4">
              <div className="text-2xl font-bold text-amber-400 mb-1">{pendingPermissions.length}</div>
              <div className="text-xs text-slate-400">Pending Permissions</div>
            </div>
            <div className="surface-elevated p-4">
              <div className="text-2xl font-bold text-red-400 mb-1">{planningConflicts.length}</div>
              <div className="text-xs text-slate-400">Planning Conflicts</div>
            </div>
            <div className="surface-elevated p-4">
              <div className="text-2xl font-bold text-violet-400 mb-1">{restrictedParcels}</div>
              <div className="text-xs text-slate-400">Restricted Parcels</div>
            </div>
          </div>
        </div>

        {/* Main Content - Map Focus */}
        <div className="flex-1 px-6 pb-6">
          <div className="grid lg:grid-cols-3 gap-6 h-full">
            {/* Map */}
            <div className="lg:col-span-2 surface-card overflow-hidden rounded-xl">
              <div className="h-12 px-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <Map size={16} className="text-cyan-400" />
                  <span className="font-semibold text-white text-sm">Planning Intelligence Map</span>
                </div>
                <Link href="/map" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Full Screen →
                </Link>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <MapView height="100%" />
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-4 overflow-y-auto">
              {/* Planning Conflicts */}
              <div className="surface-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-400" />
                  <h2 className="font-heading font-semibold text-white text-sm">Planning Conflicts</h2>
                </div>
                <div className="space-y-2">
                  {planningConflicts.slice(0, 4).map(alert => (
                    <Link 
                      key={alert.id}
                      href={`/parcels/${alert.parcelId}`}
                      className="block p-3 rounded-lg bg-slate-900/40 hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="font-mono text-xs text-cyan-400 mb-1">{alert.parcelId}</div>
                      <div className="text-sm text-slate-300">{alert.title}</div>
                      <div className={`chip text-[10px] mt-2 ${
                        alert.severity === 'critical' ? 'bg-red-500/15 text-red-400' :
                        'bg-orange-500/15 text-orange-400'
                      }`}>
                        {alert.severity}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/alerts" className="block mt-3 text-xs text-indigo-400 hover:text-indigo-300 text-center">
                  View All Conflicts →
                </Link>
              </div>

              {/* Building Permissions */}
              <div className="surface-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={16} className="text-emerald-400" />
                  <h2 className="font-heading font-semibold text-white text-sm">Pending Permissions</h2>
                </div>
                <div className="space-y-2">
                  {pendingPermissions.slice(0, 3).map(perm => (
                    <div key={perm.id} className="p-2 rounded bg-slate-900/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-cyan-400">{perm.applicationNo}</span>
                        <span className={`chip text-[9px] ${
                          perm.status === 'Pending' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-blue-500/15 text-blue-400'
                        }`}>
                          {perm.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{perm.type}</div>
                      <div className="text-xs text-slate-500 mt-1">{perm.applicantName}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Development Checks */}
              <div className="surface-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={16} className="text-violet-400" />
                  <h2 className="font-heading font-semibold text-white text-sm">Development Checks</h2>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Road Reservations</span>
                    <span className="text-red-400 font-semibold">3 Issues</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Zoning Violations</span>
                    <span className="text-amber-400 font-semibold">5 Pending</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">FSI Compliance</span>
                    <span className="text-emerald-400 font-semibold">Checked</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="surface-card p-4">
                <h2 className="font-heading font-semibold text-white text-sm mb-3">Quick Actions</h2>
                <div className="space-y-1.5">
                  <Link href="/map" className="nav-item text-xs">
                    <Map size={12} /> Full Map View
                  </Link>
                  <Link href="/workflows" className="nav-item text-xs">
                    <Building2 size={12} /> Permission Queue
                  </Link>
                  <Link href="/alerts" className="nav-item text-xs">
                    <AlertTriangle size={12} /> All Conflicts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
