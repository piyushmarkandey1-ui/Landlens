/**
 * Government operations layer.
 *
 * This module keeps operational views separate from GIS and the Land Truth
 * Engine. It derives queues, reviews, notifications and executive metrics
 * from the same parcel records so a future API adapter can replace the data
 * source without replacing dashboard components.
 */

import {
  AUDIT_LOGS,
  CONFLICT_ALERTS,
  DATA_SOURCES,
  DISTRICT_ANALYTICS,
  MONTHLY_MUTATIONS,
  MUTATIONS,
  PARCELS,
  REGISTRATIONS,
  SERVICE_REQUESTS,
  SATELLITE_CHANGES,
  WORKFLOW_TASKS,
  ZONING_RECORDS,
  BUILDING_PERMISSIONS,
} from './data';
import { DEMO_USERS } from './auth';
import { getParcelData, parcelTruthEngine } from './intelligence';
import type { AlertSeverity, AuditLog, UserRole, WorkflowTask } from './types';

export type OperationalPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type OperationalStatus = 'Open' | 'In Progress' | 'Pending Review' | 'Resolved' | 'Escalated';

export interface KpiMetric {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  href: string;
  color: string;
}

export interface WorkQueueItem {
  id: string;
  priority: OperationalPriority;
  parcelId: string;
  issue: string;
  source: string;
  assigned: string;
  department: string;
  sla: string;
  slaPercent: number;
  status: OperationalStatus;
  taskId?: string;
  ruleId?: string;
}

export interface DevelopmentReview {
  parcelId: string;
  landUse: string;
  zoning: string;
  masterPlan: string;
  buildingPermission: string;
  roadReservation: string;
  environmentalRestrictions: string[];
  outcome: 'Eligible' | 'Review Required' | 'Restriction Detected';
  reasons: string[];
  datasets: string[];
}

export interface TransactionTimelineEntry {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'attention' | 'current';
  dataset: string;
}

export interface RegistrationTransaction {
  registrationId: string;
  parcelId: string;
  documentNo: string;
  buyer: string;
  seller: string;
  date: string;
  amount: number;
  areaAcres: number;
  status: string;
  verificationStatus: 'Verified' | 'Needs Review' | 'Conflict';
  conflicts: string[];
  timeline: TransactionTimelineEntry[];
}

export interface DepartmentPerformance {
  department: string;
  open: number;
  inProgress: number;
  overdue: number;
  resolved: number;
  averageHours: number;
}

export interface DistrictOperations {
  metrics: KpiMetric[];
  departmentPerformance: DepartmentPerformance[];
  workflowFunnel: { stage: string; count: number; color: string }[];
  trend: { month: string; mutations: number; conflicts: number; resolved: number }[];
  heatmap: { village: string; parcels: number; conflicts: number; intensity: number }[];
  serviceRequests: { status: string; count: number }[];
}

export interface NotificationItem {
  id: string;
  type: 'conflict' | 'sla' | 'verification' | 'sync' | 'dataset' | 'workflow';
  title: string;
  description: string;
  timestamp: string;
  href: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  read: boolean;
}

export interface SystemHealthItem {
  name: string;
  status: 'Operational' | 'Demo Mode' | 'Simulated' | 'Degraded';
  uptime: string;
  latency: string;
  lastCheck: string;
}

export interface OperationalAuditEvent {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  parcelId?: string;
  dataset: string;
  previousState: string;
  newState: string;
  details: string;
}

let runtimeAuditSequence = 0;
const runtimeAuditEvents: OperationalAuditEvent[] = [];

const severityToPriority = (severity: AlertSeverity): OperationalPriority => {
  if (severity === 'critical') return 'Critical';
  if (severity === 'high') return 'High';
  if (severity === 'medium') return 'Medium';
  return 'Low';
};

const statusFromTask = (task: WorkflowTask): OperationalStatus => task.status;

const sourceForTask = (task: WorkflowTask) => {
  const alert = task.conflictAlertId ? CONFLICT_ALERTS.find(item => item.id === task.conflictAlertId) : undefined;
  if (alert) return alert.datasetsCompared.slice(0, 2).join(' + ');
  return task.evidence.slice(0, 2).join(' + ') || 'Workflow record';
};

const formatSla = (task: WorkflowTask) => {
  if (task.hoursElapsed > task.slaHours) return `${task.hoursElapsed - task.slaHours}h overdue`;
  return `${Math.max(task.slaHours - task.hoursElapsed, 0)}h remaining`;
};

const unique = <T,>(values: T[]) => Array.from(new Set(values));

/** Revenue Officer work queue derived from workflow tasks and relevant findings. */
export function getRevenueWorkQueue(): WorkQueueItem[] {
  const rows: WorkQueueItem[] = WORKFLOW_TASKS
    .filter(task => task.assignedDept === 'Revenue' || task.assignedDept === 'District Administration')
    .map(task => {
      const alert = task.conflictAlertId ? CONFLICT_ALERTS.find(item => item.id === task.conflictAlertId) : undefined;
      const priority = alert ? severityToPriority(alert.severity) : task.priority;
      return {
        id: task.id,
        priority,
        parcelId: task.parcelId,
        issue: task.title,
        source: sourceForTask(task),
        assigned: task.assignedTo,
        department: task.assignedDept,
        sla: formatSla(task),
        slaPercent: Math.min(Math.round((task.hoursElapsed / task.slaHours) * 100), 100),
        status: statusFromTask(task),
        taskId: task.id,
        ruleId: alert?.alertType,
      };
    });

  CONFLICT_ALERTS
    .filter(alert => ['area_mismatch', 'ownership_conflict', 'boundary_discrepancy', 'tax_default'].includes(alert.alertType))
    .filter(alert => !rows.some(row => row.parcelId === alert.parcelId && row.ruleId === alert.alertType))
    .forEach(alert => {
      rows.push({
        id: `ALERT-${alert.id}`,
        priority: severityToPriority(alert.severity),
        parcelId: alert.parcelId,
        issue: alert.title,
        source: alert.datasetsCompared.slice(0, 2).join(' + '),
        assigned: 'Revenue Queue',
        department: 'Revenue',
        sla: 'New assignment',
        slaPercent: 0,
        status: alert.status === 'Under Review' ? 'Pending Review' : 'Open',
        ruleId: alert.alertType,
      });
    });

  return rows.sort((a, b) => {
    const order: Record<OperationalPriority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

export function getRevenueMetrics(): KpiMetric[] {
  const queue = getRevenueWorkQueue();
  const ownershipConflicts = CONFLICT_ALERTS.filter(a => a.alertType === 'ownership_conflict' && a.status !== 'Resolved').length;
  const areaMismatches = CONFLICT_ALERTS.filter(a => a.alertType === 'area_mismatch' && a.status !== 'Resolved').length;
  return [
    { id: 'parcels', label: 'Total parcels', value: PARCELS.length, detail: 'Synthetic sample monitored', href: '/map', color: '#06b6d4' },
    { id: 'mutations', label: 'Pending mutations', value: MUTATIONS.filter(m => m.status === 'Pending').length, detail: 'Require officer review', href: '/revenue?tab=mutations', color: '#f59e0b' },
    { id: 'ownership', label: 'Ownership conflicts', value: ownershipConflicts, detail: 'Cross-dataset mismatch', href: '/revenue?tab=queue&issue=ownership', color: '#ef4444' },
    { id: 'area', label: 'Area mismatches', value: areaMismatches, detail: 'RoR vs registration', href: '/revenue?tab=queue&issue=area', color: '#f97316' },
    { id: 'verification', label: 'Verification tasks', value: queue.filter(row => row.status !== 'Resolved').length, detail: 'Open work queue', href: '/revenue?tab=queue', color: '#6366f1' },
    { id: 'disputed', label: 'Disputed parcels', value: PARCELS.filter(p => p.status === 'Disputed').length, detail: 'Require controlled action', href: '/alerts?status=active', color: '#8b5cf6' },
  ];
}

/** Planning review is a screening result, never a legal approval. */
export function getDevelopmentReview(parcelId: string): DevelopmentReview | null {
  const data = getParcelData(parcelId);
  const truth = parcelTruthEngine.analyze(parcelId);
  if (!data || !truth) return null;
  const conflicts = truth.conflicts;
  const restrictionFinding = conflicts.find(c => ['ROAD_RESERVATION_OVERLAP', 'RESTRICTION_OVERLAP'].includes(c.ruleId));
  const reviewFinding = conflicts.find(c => ['LAND_USE_ZONING_CONFLICT', 'MASTER_PLAN_CONFLICT', 'BUILDING_PERMISSION_MISSING', 'POTENTIAL_SATELLITE_CHANGE'].includes(c.ruleId));
  const reasons = conflicts.map(c => c.description);
  let outcome: DevelopmentReview['outcome'] = 'Eligible';
  if (restrictionFinding) outcome = 'Restriction Detected';
  else if (reviewFinding || data.parcel.status === 'Disputed' || !data.zoning) outcome = 'Review Required';
  return {
    parcelId,
    landUse: data.parcel.landUse,
    zoning: data.zoning ? `${data.zoning.currentZone} — ${data.zoning.landUseDesignation}` : 'Unavailable',
    masterPlan: data.zoning ? `${data.zoning.masterPlanPhase}${data.zoning.proposedZone ? ` → proposed ${data.zoning.proposedZone}` : ''}` : 'Unavailable',
    buildingPermission: data.buildingPermissions.length === 0 ? 'No record' : unique(data.buildingPermissions.map(p => p.status)).join(', '),
    roadReservation: data.zoning?.roadReservation ? `${data.zoning.roadWidth}m corridor` : 'No overlap detected',
    environmentalRestrictions: data.restrictions.filter(r => r.isActive).map(r => `${r.type} — ${r.authority}`),
    outcome,
    reasons: reasons.length > 0 ? reasons : ['No triggered planning rule for available records.'],
    datasets: unique(conflicts.flatMap(c => c.datasetsUsed)),
  };
}

export function getPlanningMetrics(): KpiMetric[] {
  const reviews = PARCELS.map(parcel => getDevelopmentReview(parcel.id)).filter(Boolean) as DevelopmentReview[];
  return [
    { id: 'zoning', label: 'Zoning conflicts', value: reviews.filter(r => r.reasons.some(reason => reason.toLowerCase().includes('zoning'))).length, detail: 'Land use / zoning checks', href: '/planning?tab=review', color: '#6366f1' },
    { id: 'master-plan', label: 'Master Plan conflicts', value: CONFLICT_ALERTS.filter(a => a.alertType === 'planning_conflict').length, detail: 'Plan designation review', href: '/planning?tab=review', color: '#8b5cf6' },
    { id: 'roads', label: 'Road reservations', value: ZONING_RECORDS.filter(z => z.roadReservation).length, detail: 'Development restrictions', href: '/planning?tab=review', color: '#ef4444' },
    { id: 'building', label: 'Building approvals', value: BUILDING_PERMISSIONS.filter(p => p.status === 'Approved').length, detail: 'Approved records in sample', href: '/planning?tab=permissions', color: '#10b981' },
    { id: 'changes', label: 'Potential changes', value: SATELLITE_CHANGES.filter(s => s.verificationStatus === 'Pending').length, detail: 'Field verification required', href: '/planning?tab=satellite', color: '#06b6d4' },
  ];
}

function getRegistrationConflicts(parcelId: string) {
  const truth = parcelTruthEngine.analyze(parcelId);
  return truth?.conflicts.filter(c => ['OWNER_MISMATCH', 'AREA_MISMATCH', 'ENCUMBRANCE_PRESENT', 'MORTGAGE_PRESENT', 'LITIGATION_PRESENT'].includes(c.ruleId)) || [];
}

export function getRegistrationTransactions(): RegistrationTransaction[] {
  return REGISTRATIONS.map(registration => {
    const data = getParcelData(registration.parcelId);
    const conflicts = getRegistrationConflicts(registration.parcelId);
    const mutation = data?.mutations.find(m => m.mutationDate >= registration.registrationDate);
    const timeline = [
      { date: registration.registrationDate, title: 'Registration recorded', description: `${registration.documentNo} recorded by ${registration.subRegistrarOffice}.`, status: 'completed', dataset: 'DORIS Registration' },
      ...(mutation ? [{ date: mutation.mutationDate, title: `Mutation ${mutation.status.toLowerCase()}`, description: `${mutation.previousOwner} → ${mutation.newOwner}.`, status: mutation.status === 'Approved' ? 'completed' as const : 'current' as const, dataset: 'Revenue Mutation Register' }] : []),
      ...conflicts.map(conflict => ({ date: '2024-03-01', title: conflict.name, description: conflict.description, status: 'attention' as const, dataset: conflict.datasetsUsed.join(' + ') })),
    ].sort((a, b) => a.date.localeCompare(b.date)) as TransactionTimelineEntry[];
    return {
      registrationId: registration.id,
      parcelId: registration.parcelId,
      documentNo: registration.documentNo,
      buyer: registration.buyerName,
      seller: registration.sellerName,
      date: registration.registrationDate,
      amount: registration.saleValue,
      areaAcres: registration.areaAcres,
      status: registration.status,
      verificationStatus: conflicts.some(c => c.ruleId === 'OWNER_MISMATCH' || c.ruleId === 'AREA_MISMATCH') ? 'Conflict' : conflicts.length > 0 ? 'Needs Review' : 'Verified',
      conflicts: conflicts.map(c => c.name),
      timeline,
    };
  });
}

export function getRegistrationMetrics(): KpiMetric[] {
  const transactions = getRegistrationTransactions();
  return [
    { id: 'pending', label: 'Pending registrations', value: REGISTRATIONS.filter(r => r.status === 'Pending').length, detail: 'Awaiting registration action', href: '/registration?status=pending', color: '#f59e0b' },
    { id: 'conflicts', label: 'Registration conflicts', value: transactions.filter(t => t.verificationStatus !== 'Verified').length, detail: 'Evidence needs verification', href: '/registration?status=conflict', color: '#ef4444' },
    { id: 'ownership', label: 'Ownership mismatch', value: transactions.filter(t => t.conflicts.some(c => c.toLowerCase().includes('owner'))).length, detail: 'RoR vs deed buyer', href: '/registration?status=conflict', color: '#f97316' },
    { id: 'area', label: 'Area mismatch', value: transactions.filter(t => t.conflicts.some(c => c.toLowerCase().includes('area'))).length, detail: 'Registration vs RoR', href: '/registration?status=conflict', color: '#8b5cf6' },
    { id: 'docs', label: 'Document verification', value: SERVICE_REQUESTS.filter(s => s.department.includes('Registration') && s.status !== 'Completed').length, detail: 'Requests in registration queue', href: '/registration?tab=services', color: '#06b6d4' },
  ];
}

export function getDistrictOperations(): DistrictOperations {
  const sampleConflicts = unique(CONFLICT_ALERTS.filter(a => a.status !== 'Resolved').map(a => a.parcelId)).length;
  const openWorkflows = WORKFLOW_TASKS.filter(t => t.status !== 'Resolved').length;
  const departments = unique(WORKFLOW_TASKS.map(t => t.assignedDept));
  const departmentPerformance = departments.map(department => {
    const tasks = WORKFLOW_TASKS.filter(t => t.assignedDept === department);
    return {
      department,
      open: tasks.filter(t => t.status === 'Open').length,
      inProgress: tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending Review').length,
      overdue: tasks.filter(t => t.status !== 'Resolved' && t.hoursElapsed > t.slaHours).length,
      resolved: tasks.filter(t => t.status === 'Resolved').length,
      averageHours: tasks.length ? Math.round(tasks.reduce((sum, t) => sum + t.hoursElapsed, 0) / tasks.length) : 0,
    };
  });
  const villages = unique(PARCELS.map(p => p.village));
  const heatmap = villages.map(village => {
    const parcels = PARCELS.filter(p => p.village === village);
    const conflicts = CONFLICT_ALERTS.filter(a => parcels.some(p => p.id === a.parcelId) && a.status !== 'Resolved').length;
    return { village, parcels: parcels.length, conflicts, intensity: Math.min(Math.round((conflicts / Math.max(parcels.length, 1)) * 100), 100) };
  }).sort((a, b) => b.intensity - a.intensity);
  const trend = MONTHLY_MUTATIONS.map((month, index) => ({
    month: month.month,
    mutations: month.count,
    conflicts: Math.round(2800 + index * 110),
    resolved: Math.round(2200 + index * 150),
  }));
  return {
    metrics: [
      { id: 'parcels', label: 'Parcels monitored', value: `${DISTRICT_ANALYTICS.totalParcels.toLocaleString()}`, detail: `${PARCELS.length} records in demo sample`, href: '/map', color: '#6366f1' },
      { id: 'conflicts', label: 'Data conflicts', value: DISTRICT_ANALYTICS.conflictParcels.toLocaleString(), detail: `${sampleConflicts} sample parcels flagged`, href: '/alerts', color: '#ef4444' },
      { id: 'workflows', label: 'Open workflows', value: openWorkflows, detail: 'Across district departments', href: '/workflows', color: '#f59e0b' },
      { id: 'resolution', label: 'Avg resolution time', value: '4.2 days', detail: 'Open workflow sample', href: '/workflows', color: '#06b6d4' },
      { id: 'workload', label: 'Department workload', value: WORKFLOW_TASKS.length, detail: 'Assigned tasks in sample', href: '/workflows', color: '#8b5cf6' },
      { id: 'changes', label: 'Potential changes', value: DISTRICT_ANALYTICS.potentialChanges.toLocaleString(), detail: 'Satellite detections', href: '/planning?tab=satellite', color: '#10b981' },
      { id: 'services', label: 'Service requests', value: DISTRICT_ANALYTICS.pendingServices.toLocaleString(), detail: 'Pending district requests', href: '/citizen', color: '#f97316' },
    ],
    departmentPerformance,
    workflowFunnel: [
      { stage: 'Alerts', count: CONFLICT_ALERTS.length, color: '#ef4444' },
      { stage: 'Tasks', count: WORKFLOW_TASKS.length, color: '#f59e0b' },
      { stage: 'Verification', count: WORKFLOW_TASKS.filter(t => t.type === 'Field Verification').length, color: '#06b6d4' },
      { stage: 'Review', count: WORKFLOW_TASKS.filter(t => t.status === 'Pending Review').length, color: '#8b5cf6' },
      { stage: 'Resolution', count: WORKFLOW_TASKS.filter(t => t.status === 'Resolved').length, color: '#10b981' },
    ],
    trend,
    heatmap,
    serviceRequests: ['Submitted', 'In Progress', 'Pending Documents', 'Completed'].map(status => ({ status, count: SERVICE_REQUESTS.filter(s => s.status === status).length })),
  };
}

export function getSystemHealth(): SystemHealthItem[] {
  return [
    { name: 'API Gateway', status: 'Operational', uptime: '99.94%', latency: '82 ms', lastCheck: 'just now' },
    { name: 'Database (PostGIS)', status: 'Operational', uptime: '99.99%', latency: '24 ms', lastCheck: 'just now' },
    { name: 'GIS Tile Server', status: 'Operational', uptime: '99.87%', latency: '118 ms', lastCheck: '1 min ago' },
    { name: 'Land Truth Engine', status: 'Operational', uptime: '100%', latency: '16 ms', lastCheck: 'just now' },
    { name: 'AI Assistant', status: 'Demo Mode', uptime: '100%', latency: 'deterministic', lastCheck: 'just now' },
    { name: 'Satellite Feed', status: 'Simulated', uptime: 'N/A', latency: 'batch', lastCheck: '20 Feb 2024' },
  ];
}

export function getAdminOverview() {
  return {
    datasets: DATA_SOURCES,
    users: Object.entries(DEMO_USERS).map(([role, user]) => ({ ...user, role: role as UserRole })),
    departments: unique(Object.values(DEMO_USERS).map(user => user.department || 'Public Portal')).map(department => ({
      department,
      users: Object.values(DEMO_USERS).filter(user => (user.department || 'Public Portal') === department).length,
      openTasks: WORKFLOW_TASKS.filter(task => task.assignedDept === department || task.assignedDept.includes(department.split(' ')[0])).length,
    })),
    rolePermissions: [
      { role: 'Revenue Officer', scope: 'RoR, ownership, mutation, conflict resolution', permissions: 'Read + workflow write' },
      { role: 'Planning Officer', scope: 'Zoning, master plan, building review', permissions: 'Read + review write' },
      { role: 'Registration Officer', scope: 'Deeds, transactions, encumbrances', permissions: 'Read + verification write' },
      { role: 'District Administrator', scope: 'District-wide analytics and escalation', permissions: 'Read all + escalate' },
      { role: 'System Administrator', scope: 'Users, datasets, connectors, schemas', permissions: 'Full administration' },
    ],
    connectors: DATA_SOURCES.map(source => ({
      name: source.name,
      endpoint: source.endpoint || `adapter://${source.shortName.toLowerCase()}`,
      mode: source.apiStatus,
      schema: `v${source.schemaVersion}`,
      freshness: `${source.dataFreshnessDays} days`,
      status: source.status,
    })),
    health: getSystemHealth(),
  };
}

const staticAuditDataset = (log: AuditLog) => {
  if (log.entityType === 'Dataset') return 'DORIS / Dataset Registry';
  if (log.entityType === 'RoR') return 'Bhu-Abhilekh RoR';
  if (log.entityType === 'Registration') return 'DORIS Registration';
  if (log.entityType === 'Workflow') return 'Workflow Engine';
  return log.entityType;
};

export function getOperationalAuditEvents(): OperationalAuditEvent[] {
  const staticEvents: OperationalAuditEvent[] = AUDIT_LOGS.map(log => {
    const transitions: Record<string, [string, string]> = {
      AL002: ['—', 'Open'],
      AL003: ['Open', 'In Progress'],
      AL005: ['v3.1', 'v3.2'],
      AL006: ['In Progress', 'Escalated'],
      AL007: ['Pending', 'Verified'],
    };
    const [previousState, newState] = transitions[log.id] || ['—', log.action.replace(/ .*/, '')];
    return {
      id: log.id,
      timestamp: log.timestamp,
      userName: log.userName,
      userRole: log.userRole,
      action: log.action,
      parcelId: log.parcelId,
      dataset: staticAuditDataset(log),
      previousState,
      newState,
      details: log.details,
    };
  });
  return [...runtimeAuditEvents, ...staticEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function recordAuditEvent(event: Omit<OperationalAuditEvent, 'id' | 'timestamp'> & { timestamp?: string }) {
  runtimeAuditSequence += 1;
  runtimeAuditEvents.unshift({
    ...event,
    id: `RUNTIME-${runtimeAuditSequence}`,
    timestamp: event.timestamp || new Date().toISOString(),
  });
}

export function getNotifications(): NotificationItem[] {
  return [
    { id: 'N001', type: 'conflict', title: 'New high-priority conflict', description: 'Ownership conflict detected for P002. Revenue review required.', timestamp: '2024-03-02T09:30:00Z', href: '/parcels/P002', severity: 'high', read: false },
    { id: 'N002', type: 'sla', title: 'Task approaching SLA', description: 'W001 has 168 hours elapsed of 336 hours.', timestamp: '2024-03-02T08:45:00Z', href: '/workflows', severity: 'medium', read: false },
    { id: 'N003', type: 'verification', title: 'Verification completed', description: 'Registration REG001 was cross-verified with the RoR.', timestamp: '2024-03-02T07:20:00Z', href: '/registration?tab=transactions', severity: 'info', read: true },
    { id: 'N004', type: 'sync', title: 'Data synchronization failed', description: 'DGCA connector is using its last available snapshot.', timestamp: '2024-03-01T18:05:00Z', href: '/data-sources', severity: 'high', read: false },
    { id: 'N005', type: 'dataset', title: 'New dataset version available', description: 'DORIS schema v4.0 is ready for adapter validation.', timestamp: '2024-03-01T14:00:00Z', href: '/admin?tab=datasets', severity: 'info', read: true },
    { id: 'N006', type: 'workflow', title: 'Review required', description: 'W002 is pending supervisor review after evidence collection.', timestamp: '2024-03-01T11:30:00Z', href: '/workflows', severity: 'medium', read: false },
  ];
}
