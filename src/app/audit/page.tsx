'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { AUDIT_LOGS } from '@/lib/data';
import { Shield, Clock, Search } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import Link from 'next/link';

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  citizen: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  revenue_officer: 'bg-amber-50 text-amber-800 border-amber-200',
  planning_officer: 'bg-blue-50 text-blue-700 border-blue-200',
  registration_officer: 'bg-purple-50 text-purple-700 border-purple-200',
  district_admin: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  system_admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export default function AuditPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const filteredLogs = AUDIT_LOGS.filter(l => {
    const roleMatch = roleFilter === 'all' || l.userRole === roleFilter;
    const query = search.toLowerCase();
    const searchMatch = !query ||
      l.userName.toLowerCase().includes(query) ||
      l.action.toLowerCase().includes(query) ||
      l.details.toLowerCase().includes(query) ||
      (l.parcelId && l.parcelId.toLowerCase().includes(query));
    return roleMatch && searchMatch;
  });

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-2">
              <Shield size={11} /> Compliance & Immutability
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              System Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Immutable activity journal — every record access, mutation verification, workflow status change, and login event with user, IP, and timestamp.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <Clock size={13} className="text-slate-400" />
            <span>Audit log retention: <strong className="text-slate-800">7 Years</strong></span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'citizen', 'revenue_officer', 'planning_officer', 'registration_officer', 'district_admin', 'system_admin'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  roleFilter === role
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {role === 'all' ? 'All Roles' : ROLE_LABELS[role as UserRole]}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search user, action, parcel…"
              className="w-full bg-white border border-slate-200 rounded-xl text-xs text-slate-800 pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity / Parcel</th>
                  <th className="p-3.5">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => {
                  const roleBadge = ROLE_BADGE_STYLES[log.userRole as UserRole] || 'bg-slate-100 text-slate-700 border-slate-200';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ipAddress}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`chip text-[10px] font-semibold border px-2 py-0.5 rounded-md ${roleBadge}`}>
                          {ROLE_LABELS[log.userRole as UserRole] || log.userRole}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">{log.action}</td>
                      <td className="p-3.5">
                        <div className="text-slate-600">{log.entityType}</div>
                        {log.parcelId && (
                          <Link href={`/parcels/${log.parcelId}`} className="font-mono text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline">
                            {log.parcelId}
                          </Link>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-sm text-xs leading-relaxed">{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
            Showing <strong className="text-slate-800">{filteredLogs.length}</strong> logged audit records. In production environments, events are hashed and anchored to an immutable ledger.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
