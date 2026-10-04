/**
 * LandLens — Land Truth Engine
 * Rule-based conflict detection engine.
 * Every finding has evidence, source datasets, and recommended action.
 */

import type { ConflictAlert, Parcel, ZoningRecord, EnvironmentalRestriction, Litigation, BuildingPermission } from './types';
import { CONFLICT_ALERTS } from './data';

export type EngineResult = {
  parcelId: string;
  alerts: ConflictAlert[];
  dataHealthSummary: {
    score: number;
    issues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  explanation: string;
};

/**
 * Run the Land Truth Engine for a given parcel.
 * Returns all conflict alerts and a summary for that parcel.
 */
export function runLandTruthEngine(parcelId: string): EngineResult {
  const alerts = CONFLICT_ALERTS.filter(a => a.parcelId === parcelId);

  const critical = alerts.filter(a => a.severity === 'critical').length;
  const high = alerts.filter(a => a.severity === 'high').length;
  const medium = alerts.filter(a => a.severity === 'medium').length;
  const low = alerts.filter(a => a.severity === 'low').length;
  const issues = alerts.filter(a => a.status !== 'Resolved' && a.status !== 'Dismissed').length;

  // Score: 100 - deductions per severity
  let score = 100;
  score -= critical * 25;
  score -= high * 15;
  score -= medium * 8;
  score -= low * 3;
  score = Math.max(0, score);

  const explanation = buildExplanation(parcelId, alerts, score);

  return { parcelId, alerts, dataHealthSummary: { score, issues, critical, high, medium, low }, explanation };
}

function buildExplanation(parcelId: string, alerts: ConflictAlert[], score: number): string {
  if (alerts.length === 0) {
    return `No conflicts detected for this parcel across all connected datasets. All verified data is consistent.`;
  }

  const critical = alerts.filter(a => a.severity === 'critical');
  const high = alerts.filter(a => a.severity === 'high');

  const parts: string[] = [];
  if (critical.length > 0) {
    parts.push(`${critical.length} critical issue${critical.length > 1 ? 's' : ''} require immediate attention: ${critical.map(a => a.title).join('; ')}.`);
  }
  if (high.length > 0) {
    parts.push(`${high.length} high-severity issue${high.length > 1 ? 's' : ''} identified: ${high.map(a => a.title).join('; ')}.`);
  }

  return `The Land Truth Engine found ${alerts.length} alert${alerts.length > 1 ? 's' : ''} for this parcel (Data Integrity Score: ${score}/100). ${parts.join(' ')} Cross-check all evidence before taking legal or administrative action.`;
}

/**
 * Check if a parcel is eligible for building construction.
 * Returns a structured check result for the Citizen "Can I Build Here?" flow.
 */
export function canIBuildHere(parcelId: string, params: {
  parcel: Parcel;
  zoning?: ZoningRecord;
  restrictions?: EnvironmentalRestriction[];
  litigation?: Litigation[];
  buildingPermissions?: BuildingPermission[];
}): BuildabilityResult {
  const { parcel, zoning, restrictions = [], litigation = [], buildingPermissions = [] } = params;

  const checks: BuildCheck[] = [];

  // 1. Land Use Check
  const nonBuildableUses = ['Agricultural', 'Forest', 'Water Body'];
  if (nonBuildableUses.includes(parcel.landUse)) {
    checks.push({ name: 'Land Use', status: 'fail', detail: `Parcel is classified as ${parcel.landUse}. Residential/commercial construction not permitted on this land type without conversion.` });
  } else {
    checks.push({ name: 'Land Use', status: 'pass', detail: `Land use (${parcel.landUse}) permits construction subject to zoning conditions.` });
  }

  // 2. Zoning Check
  if (zoning) {
    if (zoning.roadReservation) {
      checks.push({ name: 'Master Plan / Zoning', status: 'fail', detail: `Parcel falls within a ${zoning.roadWidth}m road reservation corridor (${zoning.masterPlanPhase}). Development not permitted.` });
    } else if (zoning.fsi === 0) {
      checks.push({ name: 'Zoning / FSI', status: 'fail', detail: `Floor Space Index (FSI) is 0 for this zone (${zoning.currentZone}). Construction not permitted.` });
    } else {
      checks.push({ name: 'Zoning / FSI', status: 'pass', detail: `Zone ${zoning.currentZone} — FSI ${zoning.fsi}, Max Height ${zoning.maxHeight}m. Construction may be permitted.` });
    }
  } else {
    checks.push({ name: 'Zoning / FSI', status: 'unknown', detail: 'Zoning record not available. Verify with Raipur Development Authority before applying.' });
  }

  // 3. Environmental Restrictions
  const activeRestrictions = restrictions.filter(r => r.isActive);
  if (activeRestrictions.length > 0) {
    activeRestrictions.forEach(r => {
      checks.push({ name: `Environmental Restriction (${r.type})`, status: 'fail', detail: `${r.description} (Authority: ${r.authority}, Notification: ${r.notificationNo || 'N/A'})` });
    });
  } else {
    checks.push({ name: 'Environmental Restrictions', status: 'pass', detail: 'No active environmental restrictions found for this parcel.' });
  }

  // 4. Litigation Check
  const activeLitigation = litigation.filter(l => l.status === 'Active');
  if (activeLitigation.length > 0) {
    checks.push({ name: 'Litigation Status', status: 'review', detail: `Active court case(s) on this parcel (Case: ${activeLitigation[0].caseNo}). Obtain legal clearance before proceeding.` });
  } else {
    checks.push({ name: 'Litigation Status', status: 'pass', detail: 'No active litigation found for this parcel.' });
  }

  // 5. Disputed Status Check
  if (parcel.status === 'Disputed') {
    checks.push({ name: 'Parcel Status', status: 'review', detail: 'Parcel is currently marked as Disputed. Ownership must be cleared before construction approval.' });
  } else if (parcel.status === 'Restricted') {
    checks.push({ name: 'Parcel Status', status: 'fail', detail: 'Parcel is Restricted. Construction applications will not be processed until restriction is lifted.' });
  } else {
    checks.push({ name: 'Parcel Status', status: 'pass', detail: `Parcel status is ${parcel.status}.` });
  }

  // 6. Existing Permissions
  const activePermissions = buildingPermissions.filter(bp => bp.status === 'Approved');
  if (activePermissions.length > 0) {
    const bp = activePermissions[0];
    checks.push({ name: 'Existing Building Permission', status: 'info', detail: `Existing approved permission: ${bp.applicationNo} (${bp.type}). Expires: ${bp.validUpto || 'N/A'}. Verify if new application is needed.` });
  }

  // Determine overall result
  const hasFail = checks.some(c => c.status === 'fail');
  const hasReview = checks.some(c => c.status === 'review');
  const hasUnknown = checks.some(c => c.status === 'unknown');

  let overall: 'eligible' | 'review_required' | 'restricted';
  if (hasFail) overall = 'restricted';
  else if (hasReview || hasUnknown) overall = 'review_required';
  else overall = 'eligible';

  return { parcelId, checks, overall, generatedAt: new Date().toISOString() };
}

export type BuildCheck = {
  name: string;
  status: 'pass' | 'fail' | 'review' | 'unknown' | 'info';
  detail: string;
};

export type BuildabilityResult = {
  parcelId: string;
  checks: BuildCheck[];
  overall: 'eligible' | 'review_required' | 'restricted';
  generatedAt: string;
};

// Alert severity color mapping
export const SEVERITY_COLORS = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500 text-white' },
  high: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500 text-white' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500 text-white' },
  low: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500 text-white' },
} as const;

export const ALERT_TYPE_LABELS: Record<string, string> = {
  area_mismatch: 'Area Mismatch',
  ownership_conflict: 'Ownership Conflict',
  planning_conflict: 'Planning Conflict',
  encumbrance_active: 'Active Encumbrance',
  litigation_active: 'Active Litigation',
  satellite_change: 'Satellite Change Detected',
  tax_default: 'Tax Default',
  restriction_overlap: 'Restriction Overlap',
  boundary_discrepancy: 'Boundary Discrepancy',
  permission_expired: 'Permission Expired',
};
