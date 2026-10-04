'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, AlertTriangle, CheckCircle2, ArrowRight, FileCheck, MessageSquare, Workflow as WorkflowIcon, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { WORKFLOW_TASKS } from '@/lib/data';
import { getNotifications, recordAuditEvent } from '@/lib/operations';
import { ProgressBar, SectionHeader, StatusPill } from '@/components/OperationalPrimitives';
import type { WorkflowTask } from '@/lib/types';

const STATUS_TONE = { Open: 'danger', 'In Progress': 'warning', 'Pending Review': 'info', Resolved: 'success', Escalated: 'danger' } as const;
const PRIORITY_TONE = { Critical: 'danger', High: 'danger', Medium: 'warning', Low: 'info' } as const;
const NEXT_STATES: Record<WorkflowTask['status'], WorkflowTask['status'][]> = { Open: ['In Progress', 'Escalated'], 'In Progress': ['Pending Review', 'Escalated'], 'Pending Review': ['Resolved', 'In Progress'], Resolved: [], Escalated: ['In Progress', 'Pending Review'] };

export default function WorkflowsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState(WORKFLOW_TASKS);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(WORKFLOW_TASKS[0]?.id || '');
  const [comment, setComment] = useState('');
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const filtered = useMemo(() => tasks.filter(task => filter === 'all' || task.status === filter || task.priority === filter), [filter, tasks]);
  const selected = tasks.find(task => task.id === selectedId) || filtered[0];
  const updateStatus = (nextStatus: WorkflowTask['status']) => {
    if (!selected || !user) return;
    const previousStatus = selected.status;
    setTasks(current => current.map(task => task.id === selected.id ? { ...task, status: nextStatus } : task));
    recordAuditEvent({ userName: user.name, userRole: user.role, action: 'Updated Workflow Status', parcelId: selected.parcelId, dataset: 'Workflow Engine', previousState: previousStatus, newState: nextStatus, details: `${selected.id} transitioned from ${previousStatus} to ${nextStatus}.` });
  };
  const addComment = () => {
    if (!selected || !user || !comment.trim()) return;
    setTasks(current => current.map(task => task.id === selected.id ? { ...task, comments: [...task.comments, { id: `runtime-${Date.now()}`, author: user.name, role: user.role, comment: comment.trim(), timestamp: new Date().toISOString() }] } : task));
    recordAuditEvent({ userName: user.name, userRole: user.role, action: 'Added Workflow Comment', parcelId: selected.parcelId, dataset: 'Workflow Engine', previousState: selected.status, newState: selected.status, details: `Comment added to ${selected.id}.` });
    setComment('');
  };
  const open = tasks.filter(t => t.status === 'Open').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const review = tasks.filter(t => t.status === 'Pending Review').length;
  const overdue = tasks.filter(t => t.status !== 'Resolved' && t.hoursElapsed > t.slaHours).length;

  return <AppShell><div className="p-5 lg:p-6 max-w-7xl mx-auto">
    <div className="flex items-start justify-between gap-4 mb-5"><div><div className="text-[10px] text-indigo-400 uppercase tracking-widest font-medium mb-1">Workflow Engine</div><h1 className="font-heading font-bold text-2xl text-white flex items-center gap-2"><WorkflowIcon size={20} className="text-indigo-400" /> Operational Workflow Inbox</h1><p className="text-sm text-slate-500 mt-1">Alert → Task → Assignment → Verification → Review → Resolution. Every transition appends an audit event.</p></div><Link href="/map" className="flex items-center gap-1.5 text-xs text-cyan-400 border border-cyan-500/20 rounded-lg px-3 py-2"><MapPin size={13} /> GIS workspace</Link></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{[['Open', open, '#ef4444'], ['In Progress', inProgress, '#f59e0b'], ['Pending Review', review, '#8b5cf6'], ['Overdue', overdue, '#f97316']].map(([label, value, color]) => <button key={String(label)} onClick={() => setFilter(String(label) === 'Overdue' ? 'all' : String(label))} className="surface-elevated p-3 text-left hover:border-indigo-500/30"><div className="font-heading font-bold text-2xl" style={{ color: String(color) }}>{value}</div><div className="text-xs text-slate-500">{label}</div></button>)}</div>
    <div className="flex flex-wrap gap-1 mb-4">{['all', 'Open', 'In Progress', 'Pending Review', 'Critical', 'High', 'Resolved'].map(value => <button key={value} onClick={() => setFilter(value)} className={`px-3 py-1.5 rounded text-xs ${filter === value ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/25' : 'text-slate-500 bg-slate-900/50'}`}>{value}</button>)}</div>
    <div className="grid xl:grid-cols-[1fr_430px] gap-4"><div className="surface-card overflow-hidden"><div className="px-4 py-3 border-b border-indigo-950/40"><SectionHeader title="Task pipeline" subtitle={`${filtered.length} tasks · select one to advance its operational state`} /></div><div className="divide-y divide-slate-800/50 max-h-[680px] overflow-y-auto">{filtered.map(task => { const percent = Math.min((task.hoursElapsed / task.slaHours) * 100, 100); return <button key={task.id} onClick={() => setSelectedId(task.id)} className={`w-full text-left p-4 hover:bg-slate-800/30 ${selected?.id === task.id ? 'bg-indigo-950/35' : ''}`}><div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><StatusPill value={task.priority} tone={PRIORITY_TONE[task.priority]} /><StatusPill value={task.status} tone={STATUS_TONE[task.status]} /><span className="text-[10px] text-slate-600">{task.type}</span></div><div className="text-sm text-slate-200 font-medium truncate mt-2">{task.title}</div><div className="text-xs text-slate-500 flex items-center gap-2 mt-1"><User size={10} />{task.assignedTo}<span>·</span><Link href={`/parcels/${task.parcelId}`} onClick={event => event.stopPropagation()} className="text-indigo-400">{task.parcelId}</Link></div></div><div className="text-right flex-shrink-0"><div className={`text-[10px] ${task.hoursElapsed > task.slaHours ? 'text-red-400' : 'text-slate-600'}`}>{task.hoursElapsed > task.slaHours ? 'Overdue' : `Due ${task.dueDate}`}</div><div className="text-[10px] text-slate-600 mt-1">{task.hoursElapsed}h / {task.slaHours}h</div></div></div><div className="mt-3"><ProgressBar value={percent} color={task.hoursElapsed > task.slaHours ? '#ef4444' : '#6366f1'} /></div></button>})}</div></div>
      {selected && <div className="surface-card p-4 h-fit"><div className="flex items-start justify-between gap-3 mb-4"><div><div className="font-mono text-[10px] text-indigo-400">{selected.id} · {selected.parcelId}</div><h2 className="font-heading font-bold text-lg text-white mt-1">{selected.title}</h2></div><StatusPill value={selected.status} tone={STATUS_TONE[selected.status]} /></div><p className="text-xs text-slate-400 leading-relaxed mb-4">{selected.description}</p><div className="grid grid-cols-2 gap-2 mb-4"><div className="bg-slate-900/70 rounded-lg p-2"><div className="text-[10px] text-slate-600">Assigned</div><div className="text-xs text-slate-300 mt-1">{selected.assignedTo}</div></div><div className="bg-slate-900/70 rounded-lg p-2"><div className="text-[10px] text-slate-600">Department</div><div className="text-xs text-slate-300 mt-1">{selected.assignedDept}</div></div></div><div className="mb-4"><div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1"><FileCheck size={11} /> Evidence reviewed</div><div className="flex flex-wrap gap-1">{selected.evidence.map(item => <span key={item} className="chip bg-slate-800/70 text-slate-400 text-[10px]">{item}</span>)}</div></div><div className="mb-4"><div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Advance state</div><div className="flex flex-wrap gap-1.5">{NEXT_STATES[selected.status].map(next => <button key={next} onClick={() => updateStatus(next)} className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] hover:bg-indigo-500/25">{next}</button>)}{NEXT_STATES[selected.status].length === 0 && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Terminal state reached</span>}</div></div><div className="mb-4"><div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1"><MessageSquare size={11} /> Add verification note</div><textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Record evidence reviewed or field result..." className="form-input text-xs min-h-[70px] resize-y" /><button onClick={addComment} disabled={!comment.trim()} className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 disabled:opacity-40">Append audit note</button></div><Link href={`/parcels/${selected.parcelId}`} className="flex items-center justify-center gap-2 py-2.5 rounded-lg gradient-primary text-white text-xs font-semibold">Open Parcel 360 + evidence <ArrowRight size={12} /></Link><div className="mt-3 text-[10px] text-amber-400/75 bg-amber-500/5 border border-amber-500/15 rounded-lg p-2 flex gap-1.5"><AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />State changes are demo-local but append operational audit records for this session.</div></div>}
    </div><div className="mt-4 text-[10px] text-slate-600">Notifications: {getNotifications().filter(item => !item.read).length} unread operational events.</div>
  </div></AppShell>;
}
