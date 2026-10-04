'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { AUDIT_LOGS } from '@/lib/data';
import { Shield, Filter } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export default function AuditPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const logs = roleFilter === 'all' ? AUDIT_LOGS : AUDIT_LOGS.filter(l => l.userRole === roleFilter);

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl text-white mb-1 flex items-center gap-2">
            <Shield size={20} className="text-emerald-400" />
            Audit Logs
          </h1>
          <p className="text-sm text-slate-500">Complete activity trail — every access, change, and workflow action with user, timestamp, and context.</p>
        </div>

        <div className="flex gap-1 mb-5 flex-wrap bg-slate-900/60 p-1 rounded-lg w-fit">
          {['all', 'citizen', 'revenue_officer', 'planning_officer', 'district_admin', 'system_admin'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${roleFilter === role ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {role === 'all' ? 'All Roles' : ROLE_LABELS[role as UserRole]}
            </button>
          ))}
        </div>

        <div className="surface-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const roleColor = ROLE_COLORS[log.userRole] || 'text-slate-400 bg-slate-700/60';
                return (
                  <tr key={log.id}>
                    <td className="font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <div className="text-xs text-slate-300">{log.userName}</div>
                      <div className="text-[10px] text-slate-600 font-mono">{log.ipAddress}</div>
                    </td>
                    <td>
                      <span className={`chip text-[9px] ${roleColor}`}>
                        {ROLE_LABELS[log.userRole]}
                      </span>
                    </td>
                    <td className="text-xs text-slate-300">{log.action}</td>
                    <td>
                      <div className="text-xs text-slate-500">{log.entityType}</div>
                      {log.parcelId && <div className="text-[10px] font-mono text-indigo-400">{log.parcelId}</div>}
                    </td>
                    <td className="text-xs text-slate-500 max-w-xs">{log.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-slate-600">Showing {logs.length} entries (demo dataset). Production system logs all user activity in immutable audit trail.</div>
      </div>
    </AppShell>
  );
}
