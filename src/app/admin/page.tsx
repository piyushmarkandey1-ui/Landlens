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
    ['datasets', 'Dataset management', <Database size={13} key="datasets" />],
    ['departments', 'Departments', <Shield size={13} key="departments" />],
    ['users', 'Users', <Users size={13} key="users" />],
    ['roles', 'Roles', <UserCog size={13} key="roles" />],
    ['connectors', 'API connectors', <Code2 size={13} key="connectors" />],
    ['health', 'System health', <Server size={13} key="health" />],
    ['audit', 'Audit logs', <FileClock size={13} key="audit" />],
  ];

  return <AppShell><div className="p-5 lg:p-6 max-w-7xl mx-auto">
    <div className="mb-5"><div className="text-[10px] text-rose-400 uppercase tracking-widest font-medium mb-1">Platform Administration</div><h1 className="font-heading font-bold text-2xl text-white flex items-center gap-2"><Settings size={20} className="text-rose-400" /> System Administrator Console</h1><p className="text-sm text-slate-500 mt-1">Dataset management, department access, connectors, schema versions, freshness and system health.</p></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{[{ label: 'Datasets', value: overview.datasets.length, color: '#06b6d4' }, { label: 'Users', value: overview.users.length, color: '#6366f1' }, { label: 'Connectors', value: overview.connectors.length, color: '#f59e0b' }, { label: 'Health checks', value: overview.health.length, color: '#10b981' }].map(item => <div key={item.label} className="surface-elevated p-3"><div className="font-heading font-bold text-2xl" style={{ color: item.color }}>{item.value}</div><div className="text-xs text-slate-500">{item.label}</div></div>)}</div>
    <div className="flex flex-wrap gap-1 mb-4 border-b border-indigo-950/50 pb-2">{tabs.map(([id, label, icon]) => <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs ${tab === id ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/25' : 'text-slate-500 hover:text-slate-300'}`}>{icon}{label}</button>)}</div>

    {tab === 'datasets' && <div className="surface-card overflow-auto"><div className="px-4 py-3 border-b border-indigo-950/40"><SectionHeader title="Dataset management" subtitle="Status, schema version and freshness for every connected source." /></div><table className="data-table min-w-[950px]"><thead><tr><th>Dataset</th><th>Department</th><th>Mode</th><th>Schema</th><th>Last sync</th><th>Freshness</th><th>Records</th><th>Action</th></tr></thead><tbody>{overview.datasets.map(source => <tr key={source.id}><td><div className="text-xs text-slate-200 font-medium">{source.name}</div><div className="text-[10px] text-slate-600">{source.dataset}</div></td><td className="text-xs text-slate-500">{source.department}</td><td><StatusPill value={source.status} tone={source.status === 'Live' ? 'success' : source.status === 'Simulated' ? 'warning' : 'danger'} /></td><td className="font-mono text-xs">v{source.schemaVersion}</td><td className="text-xs">{new Date(source.lastSynced).toLocaleDateString()}</td><td className="text-xs">{source.dataFreshnessDays} days</td><td className="font-mono text-xs">{source.recordCount.toLocaleString()}</td><td><button className="text-xs text-indigo-400 flex items-center gap-1"><RefreshCw size={11} /> Sync</button></td></tr>)}</tbody></table></div>}
    {tab === 'departments' && <div className="grid md:grid-cols-2 gap-3">{overview.departments.map(item => <div key={item.department} className="surface-card p-4"><div className="flex items-start justify-between"><div><div className="text-sm font-semibold text-white">{item.department}</div><div className="text-xs text-slate-500 mt-1">{item.users} users · {item.openTasks} open tasks</div></div><Shield size={16} className="text-cyan-400" /></div><div className="mt-4 flex gap-2"><button className="px-2.5 py-1.5 rounded bg-slate-800 text-xs text-slate-300">Manage users</button><button className="px-2.5 py-1.5 rounded bg-indigo-500/15 text-indigo-300 text-xs">View workload</button></div></div>)}</div>}
    {tab === 'users' && <div className="surface-card overflow-auto"><table className="data-table min-w-[800px]"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>District</th><th>Status</th><th /></tr></thead><tbody>{overview.users.map(user => <tr key={user.id}><td className="text-xs font-medium text-slate-200">{user.name}</td><td className="text-xs text-slate-500">{user.email}</td><td><StatusPill value={user.role} tone="info" /></td><td className="text-xs">{user.department || 'Public Portal'}</td><td className="text-xs">{user.district || '—'}</td><td><StatusPill value="Active" tone="success" /></td><td><button className="text-xs text-indigo-400">Edit</button></td></tr>)}</tbody></table></div>}
    {tab === 'roles' && <div className="space-y-2">{overview.rolePermissions.map(item => <div key={item.role} className="surface-card p-4 flex items-center gap-4"><div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center"><UserCog size={15} className="text-rose-400" /></div><div className="flex-1"><div className="text-sm text-white font-medium">{item.role}</div><div className="text-xs text-slate-500">{item.scope}</div></div><StatusPill value={item.permissions} tone="info" /><button className="text-xs text-indigo-400">Configure</button></div>)}</div>}
    {tab === 'connectors' && <div className="surface-card overflow-auto"><table className="data-table min-w-[850px]"><thead><tr><th>Connector</th><th>Endpoint</th><th>Mode</th><th>Schema</th><th>Freshness</th><th>Status</th><th /></tr></thead><tbody>{overview.connectors.map(connector => <tr key={connector.name}><td className="text-xs text-slate-200">{connector.name}</td><td className="font-mono text-[10px] text-slate-500">{connector.endpoint}</td><td><StatusPill value={connector.mode} tone={connector.mode === 'Connected' ? 'success' : connector.mode === 'Demo Connector' ? 'warning' : 'neutral'} /></td><td className="font-mono text-xs">{connector.schema}</td><td className="text-xs">{connector.freshness}</td><td><StatusPill value={connector.status} tone={connector.status === 'Simulated' ? 'warning' : connector.status === 'Offline' ? 'danger' : 'success'} /></td><td><button className="text-xs text-indigo-400">Test</button></td></tr>)}</tbody></table></div>}
    {tab === 'health' && <div className="grid md:grid-cols-2 gap-3">{overview.health.map(item => <div key={item.name} className="surface-card p-4"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.status === 'Operational' ? 'bg-emerald-400' : item.status === 'Degraded' ? 'bg-red-400' : 'bg-amber-400'}`} /><span className="text-sm text-white">{item.name}</span><StatusPill value={item.status} tone={item.status === 'Operational' ? 'success' : item.status === 'Degraded' ? 'danger' : 'warning'} /></div><div className="grid grid-cols-3 gap-2 mt-3 text-xs"><div><div className="text-slate-600">Uptime</div><div className="text-slate-300">{item.uptime}</div></div><div><div className="text-slate-600">Latency</div><div className="text-slate-300">{item.latency}</div></div><div><div className="text-slate-600">Checked</div><div className="text-slate-300">{item.lastCheck}</div></div></div></div>)}</div>}
    {tab === 'audit' && <div className="surface-card overflow-auto"><table className="data-table min-w-[1000px]"><thead><tr><th>Timestamp</th><th>User / role</th><th>Action</th><th>Parcel</th><th>Dataset</th><th>Previous</th><th>New state</th><th>Details</th></tr></thead><tbody>{audit.map(event => <tr key={event.id}><td className="font-mono text-[10px] text-slate-600">{new Date(event.timestamp).toLocaleString('en-IN')}</td><td><div className="text-xs text-slate-300">{event.userName}</div><div className="text-[10px] text-indigo-400">{event.userRole}</div></td><td className="text-xs text-slate-200">{event.action}</td><td className="font-mono text-xs text-indigo-400">{event.parcelId || '—'}</td><td className="text-xs text-slate-500">{event.dataset}</td><td><StatusPill value={event.previousState} /></td><td><StatusPill value={event.newState} tone={event.newState.toLowerCase().includes('resolved') || event.newState.toLowerCase().includes('verified') ? 'success' : event.newState === 'Escalated' ? 'danger' : 'info'} /></td><td className="text-xs text-slate-500">{event.details}</td></tr>)}</tbody></table></div>}

    <div className="mt-4 p-3 rounded-lg bg-rose-500/5 border border-rose-500/15 text-[10px] text-rose-300/80 flex items-center gap-2"><AlertTriangle size={12} /> Administrative controls are represented with synthetic demo records. Production changes must be permission-controlled and append an immutable audit event.</div>
  </div></AppShell>;
}
