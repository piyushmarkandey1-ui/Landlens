'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { Database, Users, Shield, Server, RefreshCw, Settings, UserCog, Code2, FileClock, AlertTriangle } from 'lucide-react';
import { getAdminOverview, getOperationalAuditEvents } from '@/lib/operations';
import { SectionHeader, StatusPill } from '@/components/OperationalPrimitives';

type AdminTab = 'datasets' | 'departments' | 'users' | 'roles' | 'connectors' | 'health' | 'audit';

export default function AdminPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>(() => {
    if (typeof window === 'undefined') return 'datasets';
    const requested = new URLSearchParams(window.location.search).get('tab');
    return ['datasets', 'departments', 'users', 'roles', 'connectors', 'health', 'audit'].includes(requested || '') ? requested as AdminTab : 'datasets';
  });
  const overview = getAdminOverview();
  const audit = getOperationalAuditEvents();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const tabs: [AdminTab, string, React.ReactNode][] = [
    ['datasets', 'Datasets', <Database size={13} key="datasets" />],
    ['departments', 'Departments', <Shield size={13} key="departments" />],
    ['users', 'Users', <Users size={13} key="users" />],
    ['roles', 'Roles & RBAC', <UserCog size={13} key="roles" />],
    ['connectors', 'Connectors', <Code2 size={13} key="connectors" />],
    ['health', 'System Health', <Server size={13} key="health" />],
    ['audit', 'Audit Logs', <FileClock size={13} key="audit" />],
  ];

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200/80 mb-2">
              <Settings size={11} /> Platform Administration
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              System Administrator Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Dataset lifecycle, department access rights, federated connectors, schema governance, and system uptime telemetry.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: 'Active Datasets', value: overview.datasets.length, color: '#0891b2', bg: '#f0f9ff' },
            { label: 'Registered Users', value: overview.users.length, color: '#4f46e5', bg: '#eef2ff' },
            { label: 'API Connectors', value: overview.connectors.length, color: '#d97706', bg: '#fffbeb' },
            { label: 'Health Monitors', value: overview.health.length, color: '#16a34a', bg: '#f0fdf4' }
          ].map(item => (
            <div key={item.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="font-heading font-bold text-2xl" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
          {tabs.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Tab 1: Datasets */}
        {tab === 'datasets' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader title="Dataset Registry & Versioning" subtitle="Live synchronization status, schema definitions, and data freshness metrics." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="p-3.5">Dataset</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Schema</th>
                    <th className="p-3.5">Last Sync</th>
                    <th className="p-3.5">Freshness</th>
                    <th className="p-3.5">Records</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.datasets.map(source => (
                    <tr key={source.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{source.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{source.dataset}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{source.department}</td>
                      <td className="p-3.5">
                        <StatusPill value={source.status} tone={source.status === 'Live' ? 'success' : source.status === 'Simulated' ? 'warning' : 'danger'} />
                      </td>
                      <td className="p-3.5 font-mono text-blue-700 font-medium">v{source.schemaVersion}</td>
                      <td className="p-3.5 text-slate-600">{new Date(source.lastSynced).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-600">{source.dataFreshnessDays}d cycle</td>
                      <td className="p-3.5 font-mono font-medium text-slate-800">{source.recordCount.toLocaleString()}</td>
                      <td className="p-3.5 text-right">
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                          <RefreshCw size={11} /> Sync
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Departments */}
        {tab === 'departments' && (
          <div className="grid md:grid-cols-2 gap-4">
            {overview.departments.map(item => (
              <div key={item.department} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">{item.department}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.users} active officers · {item.openTasks} pending workflow tasks</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors">
                    Manage Roster
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors">
                    View Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Users */}
        {tab === 'users' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">District</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">{user.name}</td>
                      <td className="p-3.5 text-slate-600">{user.email}</td>
                      <td className="p-3.5">
                        <StatusPill value={user.role} tone="info" />
                      </td>
                      <td className="p-3.5 text-slate-700">{user.department || 'Public Citizen Portal'}</td>
                      <td className="p-3.5 text-slate-600">{user.district || '—'}</td>
                      <td className="p-3.5">
                        <StatusPill value="Active" tone="success" />
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Roles */}
        {tab === 'roles' && (
          <div className="space-y-3">
            {overview.rolePermissions.map(item => (
              <div key={item.role} className="bg-white border border-slate-200/80 rounded-2xl p-4.5 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                    <UserCog size={18} />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-slate-900">{item.role}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.scope}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill value={item.permissions} tone="info" />
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">Configure</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Connectors */}
        {tab === 'connectors' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="p-3.5">Connector</th>
                    <th className="p-3.5">Endpoint Pattern</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Schema</th>
                    <th className="p-3.5">Freshness</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.connectors.map(connector => (
                    <tr key={connector.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">{connector.name}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">{connector.endpoint}</td>
                      <td className="p-3.5">
                        <StatusPill value={connector.mode} tone={connector.mode === 'Connected' ? 'success' : connector.mode === 'Demo Connector' ? 'warning' : 'neutral'} />
                      </td>
                      <td className="p-3.5 font-mono text-blue-700 font-medium">{connector.schema}</td>
                      <td className="p-3.5 text-slate-600">{connector.freshness}</td>
                      <td className="p-3.5">
                        <StatusPill value={connector.status} tone={connector.status === 'Simulated' ? 'warning' : connector.status === 'Offline' ? 'danger' : 'success'} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">Test Handshake</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: System Health */}
        {tab === 'health' && (
          <div className="grid md:grid-cols-2 gap-4">
            {overview.health.map(item => (
              <div key={item.name} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.status === 'Operational' ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-amber-500 ring-2 ring-amber-100'}`} />
                    <span className="font-heading font-bold text-sm text-slate-900">{item.name}</span>
                  </div>
                  <StatusPill value={item.status} tone={item.status === 'Operational' ? 'success' : item.status === 'Degraded' ? 'danger' : 'warning'} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Uptime SLA</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{item.uptime}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Latency</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{item.latency}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Last Checked</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{item.lastCheck}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Operational Audit */}
        {tab === 'audit' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User / Role</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Parcel</th>
                    <th className="p-3.5">Dataset</th>
                    <th className="p-3.5">Prior State</th>
                    <th className="p-3.5">New State</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {audit.map(event => (
                    <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{event.userName}</div>
                        <div className="text-[10px] text-blue-600 font-medium">{event.userRole}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">{event.action}</td>
                      <td className="p-3.5 font-mono text-blue-700 font-semibold">{event.parcelId || '—'}</td>
                      <td className="p-3.5 text-slate-600">{event.dataset}</td>
                      <td className="p-3.5">
                        <StatusPill value={event.previousState} />
                      </td>
                      <td className="p-3.5">
                        <StatusPill
                          value={event.newState}
                          tone={
                            event.newState.toLowerCase().includes('resolved') || event.newState.toLowerCase().includes('verified')
                              ? 'success'
                              : event.newState === 'Escalated'
                              ? 'danger'
                              : 'info'
                          }
                        />
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs">{event.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disclaimer Note */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
          <AlertTriangle size={15} className="text-amber-700 flex-shrink-0" />
          <span>Administrative controls are demonstrated with synthetic state records. In production deployments, role modifications append an immutable event to the audit trail.</span>
        </div>
      </div>
    </AppShell>
  );
}
