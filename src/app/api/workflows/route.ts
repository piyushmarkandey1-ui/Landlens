import { NextResponse } from 'next/server';
import { WORKFLOW_TASKS } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parcelId = searchParams.get('parcel_id');
  const status = searchParams.get('status');

  let tasks = [...WORKFLOW_TASKS];
  if (parcelId) tasks = tasks.filter(t => t.parcelId === parcelId);
  if (status) tasks = tasks.filter(t => t.status.toLowerCase() === status.toLowerCase());

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), total: tasks.length, data_note: 'Synthetic demonstration data.' },
    data: tasks.map(t => ({
      task_id: t.id,
      parcel_id: t.parcelId,
      title: t.title,
      type: t.type,
      priority: t.priority,
      status: t.status,
      assigned_to: t.assignedTo,
      department: t.assignedDept,
      created_date: t.createdDate,
      due_date: t.dueDate,
      sla_hours: t.slaHours,
      hours_elapsed: t.hoursElapsed,
      sla_breached: t.hoursElapsed > t.slaHours,
      description: t.description,
      evidence: t.evidence,
      comments_count: t.comments.length,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { parcel_id, title, type, priority, assigned_to, department, description } = body;

  if (!parcel_id || !title || !type) {
    return NextResponse.json({ error: 'Required: parcel_id, title, type' }, { status: 400 });
  }

  const newTask = {
    task_id: `W${Date.now()}`,
    parcel_id,
    title,
    type,
    priority: priority || 'Medium',
    status: 'Open',
    assigned_to: assigned_to || 'Unassigned',
    department: department || 'Revenue',
    created_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    sla_hours: 168,
    hours_elapsed: 0,
    sla_breached: false,
    description: description || '',
    evidence: [],
    comments_count: 0,
  };

  return NextResponse.json({ meta: { api_version: '1.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data. Task not persisted.' }, data: newTask }, { status: 201 });
}
