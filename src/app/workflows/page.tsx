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
const NEXT_STATES: Record<WorkflowTask['status'], WorkflowTask['status'][]> = {
  Open: ['In Progress', 'Escalated'],
  'In Progress': ['Pending Review', 'Escalated'],
  'Pending Review': ['Resolved', 'In Progress'],
  Resolved: [],
  Escalated: ['In Progress', 'Pending Review'],
};

export default function WorkflowsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState(WORKFLOW_TASKS);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(WORKFLOW_TASKS[0]?.id || '');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const filtered = useMemo(
    () => tasks.filter(task => filter === 'all' || task.status === filter || task.priority === filter),
    [filter, tasks]
  );
  const selected = tasks.find(task => task.id === selectedId) || filtered[0];

  const updateStatus = (nextStatus: WorkflowTask['status']) => {
    if (!selected || !user) return;
    const previousStatus = selected.status;
    setTasks(current => current.map(task => (task.id === selected.id ? { ...task, status: nextStatus } : task)));
    recordAuditEvent({
      userName: user.name,
      userRole: user.role,
      action: 'Updated Workflow Status',
      parcelId: selected.parcelId,
      dataset: 'Workflow Engine',
      previousState: previousStatus,
      newState: nextStatus,
      details: `${selected.id} transitioned from ${previousStatus} to ${nextStatus}.`,
    });
  };

  const addComment = () => {
    if (!selected || !user || !comment.trim()) return;
    setTasks(current =>
      current.map(task =>
        task.id === selected.id
          ? {
              ...task,
              comments: [
                ...task.comments,
                {
                  id: `runtime-${Date.now()}`,
                  author: user.name,
                  role: user.role,
                  comment: comment.trim(),
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : task
      )
    );
    recordAuditEvent({
      userName: user.name,
      userRole: user.role,
      action: 'Added Workflow Comment',
      parcelId: selected.parcelId,
      dataset: 'Workflow Engine',
      previousState: selected.status,
      newState: selected.status,
      details: `Comment added to ${selected.id}.`,
    });
    setComment('');
  };

  const open = tasks.filter(t => t.status === 'Open').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const review = tasks.filter(t => t.status === 'Pending Review').length;
  const overdue = tasks.filter(t => t.status !== 'Resolved' && t.hoursElapsed > t.slaHours).length;

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
              <WorkflowIcon size={11} /> Cross-Agency Resolution Engine
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              Operational Workflow Inbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Alert → Task Allocation → Inter-Agency Verification → Review → Resolution. Every status transition updates the immutable audit ledger.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <MapPin size={14} /> Open GIS Workspace
          </Link>
        </div>

        {/* Workflow Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: 'Open Tasks', val: open, color: 'text-rose-600', filterVal: 'Open' },
            { label: 'In Progress', val: inProgress, color: 'text-amber-600', filterVal: 'In Progress' },
            { label: 'Pending Review', val: review, color: 'text-blue-600', filterVal: 'Pending Review' },
            { label: 'SLA Overdue', val: overdue, color: 'text-red-600', filterVal: 'all' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setFilter(item.filterVal)}
              className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-xl text-left shadow-xs transition-all group"
            >
              <div className={`font-mono font-bold text-2xl ${item.color} tracking-tight`}>{item.val}</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{item.label}</div>
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl w-fit">
          {['all', 'Open', 'In Progress', 'Pending Review', 'Critical', 'High', 'Resolved'].map(val => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === val
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
              }`}
            >
              {val === 'all' ? 'All Tasks' : val}
            </button>
          ))}
        </div>

        {/* Pipeline & Selected Task Dossier */}
        <div className="grid xl:grid-cols-[1fr_420px] gap-5 items-start">
          {/* Tasks Pipeline */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <SectionHeader
                title="Task Resolution Pipeline"
                subtitle={`${filtered.length} active tasks matching current filter`}
              />
            </div>
            <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {filtered.map(task => {
                const percent = Math.min((task.hoursElapsed / task.slaHours) * 100, 100);
                const isOverdue = task.hoursElapsed > task.slaHours;
                return (
                  <button
                    key={task.id}
                    onClick={() => setSelectedId(task.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50/80 transition-all ${
                      selected?.id === task.id
                        ? 'bg-blue-50/60 border-l-4 border-l-blue-600'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <StatusPill value={task.priority} tone={PRIORITY_TONE[task.priority]} />
                          <StatusPill value={task.status} tone={STATUS_TONE[task.status]} />
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {task.type}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <User size={12} className="text-slate-400" />
                            {task.assignedTo}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-blue-600 font-semibold">{task.parcelId}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-[11px] font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          {isOverdue ? 'Overdue' : `Due ${task.dueDate}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {task.hoursElapsed}h / {task.slaHours}h SLA
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={percent} color={isOverdue ? '#ef4444' : '#2563eb'} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Task Detail */}
          {selected && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-5 sticky top-6">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mb-1">
                    {selected.id} · {selected.parcelId}
                  </div>
                  <h2 className="font-heading font-bold text-lg text-slate-900 mt-1">
                    {selected.title}
                  </h2>
                </div>
                <StatusPill value={selected.status} tone={STATUS_TONE[selected.status]} />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selected.description}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Officer</div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">{selected.assignedTo}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Department</div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">{selected.assignedDept}</div>
                </div>
              </div>

              {/* Evidence Reviewed */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <FileCheck size={12} className="text-slate-500" /> Evidence Datasets Reviewed
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.evidence.map(item => (
                    <span key={item} className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* State Transitions */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                  Advance Operational State
                </div>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATES[selected.status].map(next => (
                    <button
                      key={next}
                      onClick={() => updateStatus(next)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                    >
                      Advance to: {next}
                    </button>
                  ))}
                  {NEXT_STATES[selected.status].length === 0 && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Task Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Add Verification Note */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <MessageSquare size={12} className="text-slate-500" /> Append Verification Note
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Record physical survey findings or legal clearance notes…"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[72px] resize-y"
                />
                <button
                  onClick={addComment}
                  disabled={!comment.trim()}
                  className="mt-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  Append Audit Entry
                </button>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/parcels/${selected.parcelId}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Open Comprehensive Parcel 360 <ArrowRight size={13} />
                </Link>
                <div className="mt-2.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 flex gap-1.5">
                  <AlertTriangle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>State transitions append timestamped records to the immutable session audit trail.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Operational Event Stream: {getNotifications().filter(item => !item.read).length} unread notifications recorded.
        </div>
      </div>
    </AppShell>
  );
}
