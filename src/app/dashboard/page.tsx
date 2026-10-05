'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle2, Database, FileText, Map, Workflow } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { CONFLICT_ALERTS, DATA_SOURCES, DISTRICT_ANALYTICS, SERVICE_REQUESTS, WORKFLOW_TASKS } from '@/lib/data';

function MetricCard({ label, value, detail, icon, tone, href }: { label: string; value: string | number; detail: string; icon: React.ReactNode; tone: string; href: string }) {
  return <Link href={href} className="metric-card">
    <div className={`metric-icon ${tone}`}>{icon}</div>
    <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    <ArrowRight className="metric-arrow" />
  </Link>;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); else if (user?.role === 'citizen') router.push('/citizen'); }, [isAuthenticated, user, router]);
  if (!user || user.role === 'citizen') return null;

  const openAlerts = CONFLICT_ALERTS.filter((alert) => alert.status !== 'Resolved');
  const criticalAlerts = openAlerts.filter((alert) => alert.severity === 'critical');
  const activeTasks = WORKFLOW_TASKS.filter((task) => task.status === 'Open' || task.status === 'In Progress');
  const pendingServices = SERVICE_REQUESTS.filter((request) => request.status !== 'Completed' && request.status !== 'Rejected');

  return <AppShell>
    <div className="workspace-page">
      <section className="page-heading">
        <div><p className="eyebrow">{ROLE_LABELS[user.role]} workspace</p><h1>Good morning, {user.name.split(' ')[0]}</h1><p>Here is what needs your attention across Raipur land records.</p></div>
        <div className="heading-actions"><Link href="/map" className="button button-secondary"><Map data-icon="inline-start" /> Open GIS map</Link><Link href="/workflows" className="button button-primary"><Workflow data-icon="inline-start" /> View work queue</Link></div>
      </section>

      {criticalAlerts.length > 0 && <div className="notice notice-critical"><AlertTriangle /><div><strong>{criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} require attention</strong><span>{criticalAlerts[0].title}</span></div><Link href="/alerts">Review alerts <ArrowRight data-icon="inline-end" /></Link></div>}

      <div className="metric-grid">
        <MetricCard label="Open conflicts" value={openAlerts.length} detail={`${criticalAlerts.length} critical`} icon={<AlertTriangle />} tone="tone-red" href="/alerts" />
        <MetricCard label="Active workflows" value={activeTasks.length} detail="Across departments" icon={<Workflow />} tone="tone-amber" href="/workflows" />
        <MetricCard label="Pending services" value={pendingServices.length} detail="Citizen requests" icon={<FileText />} tone="tone-indigo" href="/workflows" />
        <MetricCard label="Verified parcels" value="6.23M" detail="Of 8.9M total" icon={<CheckCircle2 />} tone="tone-green" href="/map" />
      </div>

      <div className="dashboard-grid">
        <section className="panel panel-wide"><div className="panel-header"><div><p className="eyebrow">Operational queue</p><h2>Recent conflict alerts</h2></div><Link href="/alerts" className="text-link">View all <ArrowRight data-icon="inline-end" /></Link></div><div className="alert-list">{CONFLICT_ALERTS.slice(0, 5).map((alert) => <Link href={`/parcels/${alert.parcelId}`} className="alert-row" key={alert.id}><span className={`severity-dot severity-${alert.severity}`} /><div className="row-main"><strong>{alert.title}</strong><span>{alert.parcelId} · Detected {alert.detectedDate}</span></div><span className={`status-badge ${alert.status === 'Open' ? 'status-conflict' : 'status-review'}`}>{alert.status}</span><ArrowRight className="row-arrow" /></Link>)}</div></section>
        <aside className="panel"><div className="panel-header"><div><p className="eyebrow">Connected systems</p><h2>Data health</h2></div><Database className="panel-icon" /></div><div className="data-health-list">{DATA_SOURCES.slice(0, 5).map((source) => <div className="health-row" key={source.id}><span>{source.shortName}</span><span className={`status-badge ${source.status === 'Simulated' ? 'status-pending' : 'status-verified'}`}>{source.status}</span></div>)}</div><Link href="/data-sources" className="text-link panel-footer-link">Open registry <ArrowRight data-icon="inline-end" /></Link></aside>
      </div>

      <section className="panel district-panel"><div className="panel-header"><div><p className="eyebrow">District snapshot</p><h2>Land governance overview</h2></div><Link href="/analytics" className="text-link">Open analytics <BarChart3 data-icon="inline-end" /></Link></div><div className="snapshot-grid">{[{ label: 'Total parcels', value: '8.9M' }, { label: 'Conflicts', value: '1,24,000' }, { label: 'Pending mutations', value: '42,300' }, { label: 'Tax defaulters', value: '28,000' }, { label: 'Data quality', value: `${DISTRICT_ANALYTICS.dataQualityScore}%` }].map((item) => <div className="snapshot-item" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div></section>
    </div>
  </AppShell>;
}
