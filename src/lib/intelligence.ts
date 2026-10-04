/**
 * LandLens — Intelligence System
 * ==============================
 * Independent, reusable services for land data intelligence.
 * 
 * Services:
 *   1. Data Gathering (getParcelData)
 *   2. conflictDetector — deterministic rule engine with 14 rules
 *   3. parcelTruthEngine — data consistency checks per category
 *   4. changeDetector — satellite & temporal change detection
 *   5. evidenceService — structured evidence retrieval
 *   6. parcelAssistant — parcel-aware AI question answering
 *   7. reportGenerator — Parcel Intelligence Report
 *
 * Architecture allows future real APIs to replace mock data
 * without rewriting any UI or service logic.
 *
 * ⚠ All records are synthetic demonstration data.
 */

import {
  PARCELS, OWNERS, ROR_RECORDS, REGISTRATIONS, MUTATIONS,
  ZONING_RECORDS, BUILDING_PERMISSIONS, TAX_RECORDS,
  ENVIRONMENTAL_RESTRICTIONS, ENCUMBRANCES, LITIGATIONS,
  SATELLITE_CHANGES, VALUATIONS, DATA_SOURCES
} from './data';
import type {
  Parcel, Owner, RoRRecord, Registration, Mutation,
  ZoningRecord, BuildingPermission, EnvironmentalRestriction,
  TaxRecord, Encumbrance, Litigation, SatelliteChange, Valuation,
  DataSource
} from './types';


// ============================================================================
// 1. DATA GATHERING SERVICE
// ============================================================================

export interface ParcelData {
  parcel: Parcel;
  owners: Owner[];
  ror?: RoRRecord;
  registration?: Registration;
  registrations: Registration[];
  mutations: Mutation[];
  zoning?: ZoningRecord;
  buildingPermissions: BuildingPermission[];
  tax?: TaxRecord;
  restrictions: EnvironmentalRestriction[];
  encumbrances: Encumbrance[];
  litigations: Litigation[];
  satelliteChanges: SatelliteChange[];
  valuation?: Valuation;
  dataSources: DataSource[];
}

/**
 * Gathers all connected data for a parcel.
 * This is the single data access point — future API integration
 * replaces only this function.
 */
export function getParcelData(parcelId: string): ParcelData | null {
  const parcel = PARCELS.find(p => p.id === parcelId);
  if (!parcel) return null;
  return {
    parcel,
    owners: OWNERS.filter(o => o.parcelId === parcelId),
    ror: ROR_RECORDS.find(r => r.parcelId === parcelId),
    registration: REGISTRATIONS.find(r => r.parcelId === parcelId),
    registrations: REGISTRATIONS.filter(r => r.parcelId === parcelId),
    mutations: MUTATIONS.filter(m => m.parcelId === parcelId),
    zoning: ZONING_RECORDS.find(z => z.parcelId === parcelId),
    buildingPermissions: BUILDING_PERMISSIONS.filter(b => b.parcelId === parcelId),
    tax: TAX_RECORDS.find(t => t.parcelId === parcelId),
    restrictions: ENVIRONMENTAL_RESTRICTIONS.filter(r => r.parcelId === parcelId),
    encumbrances: ENCUMBRANCES.filter(e => e.parcelId === parcelId),
    litigations: LITIGATIONS.filter(l => l.parcelId === parcelId),
    satelliteChanges: SATELLITE_CHANGES.filter(s => s.parcelId === parcelId),
    valuation: VALUATIONS.find(v => v.parcelId === parcelId),
    dataSources: DATA_SOURCES,
  };
}


// ============================================================================
// 2. CONFLICT DETECTOR — DETERMINISTIC RULE ENGINE (14 Rules)
// ============================================================================

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  datasets_used: string[];
}

export interface RuleResult {
  ruleId: string;
  name: string;
  severity: Severity;
  datasetsUsed: string[];
  description: string;
  evidence: Record<string, string | number>;
  recommendedAction: string;
}

export interface EngineRule extends RuleDefinition {
  evaluate: (data: ParcelData) => RuleResult | null;
}

// ---- RULE DEFINITIONS ----

export const RULES: EngineRule[] = [
  // 1. AREA_MISMATCH
  {
    id: 'AREA_MISMATCH',
    name: 'Area Mismatch',
    description: 'Compares the area listed in Record of Rights (RoR) with the latest Registration deed. A discrepancy may indicate encroachment, illegal sub-division, or clerical error.',
    severity: 'MEDIUM',
    datasets_used: ['RoR (Bhu-Abhilekh)', 'Registration (DORIS)'],
    evaluate: (data) => {
      if (!data.ror || !data.registration) return null;
      if (data.ror.areaAcres === data.registration.areaAcres) return null;
      const diff = Math.abs(data.ror.areaAcres - data.registration.areaAcres);
      const pct = ((diff / data.ror.areaAcres) * 100).toFixed(1);
      return {
        ruleId: 'AREA_MISMATCH',
        name: 'Area Mismatch',
        severity: parseFloat(pct) > 10 ? 'HIGH' : 'MEDIUM',
        datasetsUsed: ['RoR (Bhu-Abhilekh)', 'Registration (DORIS)'],
        description: `Registration area differs from RoR by ${diff.toFixed(2)} acres (${pct}% discrepancy).`,
        evidence: {
          'RoR Area': `${data.ror.areaAcres} acres (${data.ror.area} sqm)`,
          'Registration Area': `${data.registration.areaAcres} acres (${data.registration.area} sqm)`,
          'Difference': `${diff.toFixed(2)} acres (${pct}%)`,
        },
        recommendedAction: 'Verify the latest registration record and initiate cadastral re-measurement by Survey Patwari.',
      };
    },
  },

  // 2. OWNER_MISMATCH
  {
    id: 'OWNER_MISMATCH',
    name: 'Owner Mismatch',
    description: 'Compares the owner name in RoR with the buyer name in the latest Registration deed. Mismatch may indicate pending mutation or disputed transfer.',
    severity: 'HIGH',
    datasets_used: ['RoR (Bhu-Abhilekh)', 'Registration (DORIS)'],
    evaluate: (data) => {
      if (!data.ror || !data.registration) return null;
      const rorOwner = data.ror.ownerName.toLowerCase().trim();
      const regBuyer = data.registration.buyerName.toLowerCase().trim();
      if (rorOwner === regBuyer) return null;
      // Check if one contains the other (partial match for joint owners)
      if (rorOwner.includes(regBuyer) || regBuyer.includes(rorOwner)) return null;
      return {
        ruleId: 'OWNER_MISMATCH',
        name: 'Owner Mismatch',
        severity: 'HIGH',
        datasetsUsed: ['RoR (Bhu-Abhilekh)', 'Registration (DORIS)'],
        description: `RoR owner "${data.ror.ownerName}" does not match registered buyer "${data.registration.buyerName}". Mutation may be pending or delayed.`,
        evidence: {
          'RoR Owner': data.ror.ownerName,
          'Registered Buyer': data.registration.buyerName,
          'Registration Date': data.registration.registrationDate,
          'RoR Last Updated': data.ror.lastUpdated,
        },
        recommendedAction: 'Verify if mutation application has been filed. Check for pending mutation or court stay order.',
      };
    },
  },

  // 3. LAND_USE_ZONING_CONFLICT
  {
    id: 'LAND_USE_ZONING_CONFLICT',
    name: 'Land Use vs Zoning Conflict',
    description: 'Compares the actual land use recorded in RoR with the designated zoning in the Master Plan.',
    severity: 'HIGH',
    datasets_used: ['RoR (Bhu-Abhilekh)', 'Master Plan (RDA)'],
    evaluate: (data) => {
      if (!data.zoning) return null;
      const ZONE_USE_MAP: Record<string, string[]> = {
        'R1': ['Residential'], 'R2': ['Residential'],
        'C1': ['Commercial'], 'C2': ['Commercial'],
        'I1': ['Industrial'],
        'A1': ['Agricultural'],
        'G': ['Government', 'Institutional'],
        'MX': ['Mixed Use', 'Commercial', 'Residential'],
        'OS': ['Open Space'],
        'RD': [],
      };
      const allowedUses = ZONE_USE_MAP[data.zoning.currentZone] || [];
      if (allowedUses.length === 0 || allowedUses.includes(data.parcel.landUse)) return null;
      return {
        ruleId: 'LAND_USE_ZONING_CONFLICT',
        name: 'Land Use vs Zoning Conflict',
        severity: 'HIGH',
        datasetsUsed: ['RoR (Bhu-Abhilekh)', 'Master Plan (RDA)'],
        description: `Parcel land use is "${data.parcel.landUse}" but zoning designation is "${data.zoning.currentZone}" (${data.zoning.landUseDesignation}). Usage does not match zoning.`,
        evidence: {
          'Current Land Use': data.parcel.landUse,
          'Zoning Designation': data.zoning.currentZone,
          'Land Use Designation': data.zoning.landUseDesignation,
          'Master Plan': data.zoning.masterPlanPhase,
        },
        recommendedAction: 'Verify if land use conversion has been applied for or approved. Contact Raipur Development Authority.',
      };
    },
  },

  // 4. MASTER_PLAN_CONFLICT
  {
    id: 'MASTER_PLAN_CONFLICT',
    name: 'Master Plan Conflict',
    description: 'Checks if the current zoning will change in the next master plan phase, indicating potential future restrictions.',
    severity: 'MEDIUM',
    datasets_used: ['Master Plan (RDA)'],
    evaluate: (data) => {
      if (!data.zoning || !data.zoning.proposedZone) return null;
      if (data.zoning.currentZone === data.zoning.proposedZone) return null;
      return {
        ruleId: 'MASTER_PLAN_CONFLICT',
        name: 'Master Plan Conflict',
        severity: 'MEDIUM',
        datasetsUsed: ['Master Plan (RDA)'],
        description: `Zoning is proposed to change from "${data.zoning.currentZone}" to "${data.zoning.proposedZone}" in the upcoming master plan revision.`,
        evidence: {
          'Current Zone': data.zoning.currentZone,
          'Proposed Zone': data.zoning.proposedZone,
          'Master Plan Phase': data.zoning.masterPlanPhase,
          'Remarks': data.zoning.remarks || 'None',
        },
        recommendedAction: 'Review proposed zoning changes before any long-term investment or construction planning.',
      };
    },
  },

  // 5. ROAD_RESERVATION_OVERLAP
  {
    id: 'ROAD_RESERVATION_OVERLAP',
    name: 'Road Reservation Overlap',
    description: 'Checks if the parcel falls within a planned road corridor. Construction is prohibited on reserved parcels.',
    severity: 'CRITICAL',
    datasets_used: ['Master Plan (RDA)', 'Zoning Records'],
    evaluate: (data) => {
      if (!data.zoning?.roadReservation) return null;
      return {
        ruleId: 'ROAD_RESERVATION_OVERLAP',
        name: 'Road Reservation Overlap',
        severity: 'CRITICAL',
        datasetsUsed: ['Master Plan (RDA)', 'Zoning Records'],
        description: `Parcel falls within a ${data.zoning.roadWidth}m road reservation corridor under ${data.zoning.masterPlanPhase}. No development permitted.`,
        evidence: {
          'Road Width': `${data.zoning.roadWidth}m`,
          'Master Plan Phase': data.zoning.masterPlanPhase,
          'FSI': data.zoning.fsi,
          'Land Use Designation': data.zoning.landUseDesignation,
        },
        recommendedAction: 'Halt all construction activity. Check acquisition status with Land Acquisition Officer. No building permission will be issued.',
      };
    },
  },

  // 6. BUILDING_PERMISSION_MISSING
  {
    id: 'BUILDING_PERMISSION_MISSING',
    name: 'Building Permission Missing',
    description: 'Checks if the parcel has construction detected by satellite but no approved building permission on record.',
    severity: 'HIGH',
    datasets_used: ['Building Permissions', 'Satellite Imagery'],
    evaluate: (data) => {
      const constructionChanges = data.satelliteChanges.filter(
        s => (s.changeType === 'Construction Started' || s.changeType === 'Structure Added') && s.verificationStatus !== 'Dismissed'
      );
      if (constructionChanges.length === 0) return null;
      const hasApproved = data.buildingPermissions.some(bp => bp.status === 'Approved');
      if (hasApproved) return null;
      return {
        ruleId: 'BUILDING_PERMISSION_MISSING',
        name: 'Building Permission Missing',
        severity: 'HIGH',
        datasetsUsed: ['Building Permissions', 'Satellite Imagery (ISRO Bhuvan)'],
        description: `Satellite imagery detected "${constructionChanges[0].changeType}" (${constructionChanges[0].confidence}% confidence) but no approved building permission found on record.`,
        evidence: {
          'Change Type': constructionChanges[0].changeType,
          'Detection Date': constructionChanges[0].detectedDate,
          'Confidence': `${constructionChanges[0].confidence}%`,
          'Approved Permissions': '0',
        },
        recommendedAction: 'Dispatch field officer to verify construction activity. If confirmed unauthorized, issue stop-work notice.',
      };
    },
  },

  // 7. RESTRICTION_OVERLAP
  {
    id: 'RESTRICTION_OVERLAP',
    name: 'Environmental/Regulatory Restriction',
    description: 'Checks if the parcel has active environmental or regulatory restrictions that limit development.',
    severity: 'HIGH',
    datasets_used: ['Environmental Restrictions', 'DGCA / SDMA / RDA'],
    evaluate: (data) => {
      const active = data.restrictions.filter(r => r.isActive);
      if (active.length === 0) return null;
      const evidence: Record<string, string | number> = {};
      active.forEach((r, i) => {
        evidence[`Restriction ${i + 1}`] = `${r.type} — ${r.authority}`;
        if (r.notificationNo) evidence[`Notification ${i + 1}`] = r.notificationNo;
      });
      return {
        ruleId: 'RESTRICTION_OVERLAP',
        name: 'Environmental/Regulatory Restriction',
        severity: 'HIGH',
        datasetsUsed: active.map(r => r.authority),
        description: `${active.length} active restriction(s) found: ${active.map(r => r.type).join(', ')}. Development may be restricted.`,
        evidence,
        recommendedAction: `Obtain NOC from ${active.map(r => r.authority).join(', ')} before any development activity.`,
      };
    },
  },

  // 8. TAX_STATUS_ANOMALY
  {
    id: 'TAX_STATUS_ANOMALY',
    name: 'Tax Status Anomaly',
    description: 'Checks for property tax defaults or partial payments that may indicate financial disputes or non-compliance.',
    severity: 'MEDIUM',
    datasets_used: ['Municipal Tax (RMC)'],
    evaluate: (data) => {
      if (!data.tax) return null;
      if (data.tax.status === 'Paid' || data.tax.status === 'Exempted') return null;
      const sev: Severity = data.tax.status === 'Defaulter' ? 'HIGH' : 'MEDIUM';
      return {
        ruleId: 'TAX_STATUS_ANOMALY',
        name: 'Tax Status Anomaly',
        severity: sev,
        datasetsUsed: ['Municipal Tax (RMC)'],
        description: `Property tax status: ${data.tax.status}. Outstanding amount: ₹${data.tax.taxDue.toLocaleString()} for FY ${data.tax.financialYear}.`,
        evidence: {
          'Tax Demand': `₹${data.tax.taxDemand.toLocaleString()}`,
          'Tax Paid': `₹${data.tax.taxPaid.toLocaleString()}`,
          'Tax Due': `₹${data.tax.taxDue.toLocaleString()}`,
          'Financial Year': data.tax.financialYear,
          'Status': data.tax.status,
        },
        recommendedAction: data.tax.status === 'Defaulter'
          ? 'Initiate tax recovery proceedings. Coordinate with Revenue Officer for attachment if unpaid.'
          : 'Notify owner of partial payment. Issue reminder notice for remaining dues.',
      };
    },
  },

  // 9. ENCUMBRANCE_PRESENT
  {
    id: 'ENCUMBRANCE_PRESENT',
    name: 'Active Encumbrance',
    description: 'Checks for active encumbrances (liens, easements, court attachments) that restrict property transfer.',
    severity: 'MEDIUM',
    datasets_used: ['CERSAI', 'Registration (DORIS)'],
    evaluate: (data) => {
      const active = data.encumbrances.filter(e => e.status === 'Active' && e.type !== 'Mortgage');
      if (active.length === 0) return null;
      const evidence: Record<string, string | number> = {};
      active.forEach((e, i) => {
        evidence[`Encumbrance ${i + 1}`] = `${e.type} — ${e.creditorName}`;
        evidence[`Registration No ${i + 1}`] = e.registrationNo;
      });
      return {
        ruleId: 'ENCUMBRANCE_PRESENT',
        name: 'Active Encumbrance',
        severity: active.some(e => e.type === 'Attachment' || e.type === 'Court Order') ? 'CRITICAL' : 'MEDIUM',
        datasetsUsed: ['CERSAI', 'Registration (DORIS)'],
        description: `${active.length} active encumbrance(s) found: ${active.map(e => e.type).join(', ')}. Property transfer may be restricted.`,
        evidence,
        recommendedAction: 'Obtain Encumbrance Certificate from Sub-Registrar Office. Verify release status before proceeding with any transaction.',
      };
    },
  },

  // 10. MORTGAGE_PRESENT
  {
    id: 'MORTGAGE_PRESENT',
    name: 'Active Mortgage',
    description: 'Checks for active mortgages or charges registered against the parcel.',
    severity: 'LOW',
    datasets_used: ['CERSAI', 'Registration (DORIS)'],
    evaluate: (data) => {
      const mortgages = data.encumbrances.filter(e => e.status === 'Active' && e.type === 'Mortgage');
      if (mortgages.length === 0) return null;
      const totalAmount = mortgages.reduce((sum, m) => sum + (m.amount || 0), 0);
      const evidence: Record<string, string | number> = {
        'Active Mortgages': mortgages.length,
        'Total Amount': `₹${totalAmount.toLocaleString()}`,
      };
      mortgages.forEach((m, i) => {
        evidence[`Lender ${i + 1}`] = m.bankName || m.creditorName;
        if (m.amount) evidence[`Amount ${i + 1}`] = `₹${m.amount.toLocaleString()}`;
      });
      return {
        ruleId: 'MORTGAGE_PRESENT',
        name: 'Active Mortgage',
        severity: 'LOW',
        datasetsUsed: ['CERSAI', 'Registration (DORIS)'],
        description: `${mortgages.length} active mortgage(s) totalling ₹${totalAmount.toLocaleString()}. Property is pledged as security.`,
        evidence,
        recommendedAction: 'Verify outstanding loan balance. Obtain NOC from lender before property transfer or construction.',
      };
    },
  },

  // 11. LITIGATION_PRESENT
  {
    id: 'LITIGATION_PRESENT',
    name: 'Active Litigation',
    description: 'Checks for active court cases on the parcel that may restrict transfer, mutation, or development.',
    severity: 'HIGH',
    datasets_used: ['District Court Registry'],
    evaluate: (data) => {
      const activeCases = data.litigations.filter(l => l.status === 'Active');
      if (activeCases.length === 0) return null;
      const evidence: Record<string, string | number> = {};
      activeCases.forEach((l, i) => {
        evidence[`Case ${i + 1}`] = l.caseNo;
        evidence[`Court ${i + 1}`] = l.court;
        evidence[`Type ${i + 1}`] = l.caseType;
        evidence[`Parties ${i + 1}`] = `${l.plaintiff} vs ${l.defendant}`;
        if (l.nextHearingDate) evidence[`Next Hearing ${i + 1}`] = l.nextHearingDate;
      });
      return {
        ruleId: 'LITIGATION_PRESENT',
        name: 'Active Litigation',
        severity: activeCases.length > 1 ? 'CRITICAL' : 'HIGH',
        datasetsUsed: ['District Court Registry'],
        description: `${activeCases.length} active court case(s) found. Case: ${activeCases[0].caseNo} (${activeCases[0].caseType}). Transfer and mutation may be restricted.`,
        evidence,
        recommendedAction: 'Review court stay orders. Freeze mutation until court order is obtained. Consult legal counsel.',
      };
    },
  },

  // 12. POTENTIAL_SATELLITE_CHANGE
  {
    id: 'POTENTIAL_SATELLITE_CHANGE',
    name: 'Satellite Change Detected',
    description: 'Identifies structural or land cover changes detected via satellite imagery analysis that require field verification.',
    severity: 'MEDIUM',
    datasets_used: ['Satellite Imagery (ISRO Bhuvan)'],
    evaluate: (data) => {
      const pending = data.satelliteChanges.filter(s => s.verificationStatus === 'Pending');
      if (pending.length === 0) return null;
      const highest = pending.reduce((max, s) => s.confidence > max.confidence ? s : max, pending[0]);
      const evidence: Record<string, string | number> = {
        'Changes Detected': pending.length,
      };
      pending.forEach((s, i) => {
        evidence[`Change ${i + 1}`] = `${s.changeType} (${s.confidence}% confidence)`;
        evidence[`Date ${i + 1}`] = s.detectedDate;
        if (s.area) evidence[`Area ${i + 1}`] = `${s.area} sqm`;
      });
      return {
        ruleId: 'POTENTIAL_SATELLITE_CHANGE',
        name: 'Satellite Change Detected',
        severity: highest.confidence >= 85 ? 'HIGH' : 'MEDIUM',
        datasetsUsed: ['Satellite Imagery (ISRO Bhuvan)'],
        description: `${pending.length} pending satellite change(s) detected. Primary: "${highest.changeType}" with ${highest.confidence}% confidence on ${highest.detectedDate}.`,
        evidence,
        recommendedAction: 'Dispatch field surveyor to verify detected changes. Cross-reference with building permission records.',
      };
    },
  },

  // 13. DATA_STALE
  {
    id: 'DATA_STALE',
    name: 'Stale Data Warning',
    description: 'Checks if critical data sources have not been updated recently, reducing reliability of cross-checks.',
    severity: 'LOW',
    datasets_used: ['All Connected Sources'],
    evaluate: (data) => {
      if (!data.ror) return null;
      const lastUpdated = new Date(data.ror.lastUpdated);
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 180) return null; // 6 months threshold
      return {
        ruleId: 'DATA_STALE',
        name: 'Stale Data Warning',
        severity: 'LOW',
        datasetsUsed: ['RoR (Bhu-Abhilekh)'],
        description: `Record of Rights was last updated ${daysSince} days ago (${data.ror.lastUpdated}). Data may not reflect current ground reality.`,
        evidence: {
          'RoR Last Updated': data.ror.lastUpdated,
          'Days Since Update': daysSince,
          'Source': data.ror.source,
          'Verification Status': data.ror.isVerified ? 'Verified' : 'Unverified',
        },
        recommendedAction: 'Request fresh RoR extract from Bhu-Abhilekh. Verify with recent field inspection.',
      };
    },
  },

  // 14. MISSING_DATA
  {
    id: 'MISSING_DATA',
    name: 'Missing Data',
    description: 'Identifies critical datasets that are unavailable for this parcel, limiting the reliability of cross-checks.',
    severity: 'LOW',
    datasets_used: ['All Connected Sources'],
    evaluate: (data) => {
      const missing: string[] = [];
      if (!data.ror) missing.push('Record of Rights (RoR)');
      if (data.registrations.length === 0) missing.push('Registration Records');
      if (!data.zoning) missing.push('Zoning / Master Plan');
      if (!data.tax) missing.push('Property Tax Records');
      if (data.buildingPermissions.length === 0) missing.push('Building Permissions');
      if (missing.length === 0) return null;
      const evidence: Record<string, string | number> = {
        'Missing Datasets': missing.length,
      };
      missing.forEach((m, i) => {
        evidence[`Missing ${i + 1}`] = m;
      });
      return {
        ruleId: 'MISSING_DATA',
        name: 'Missing Data',
        severity: missing.length >= 3 ? 'MEDIUM' : 'LOW',
        datasetsUsed: ['All Connected Sources'],
        description: `${missing.length} dataset(s) unavailable: ${missing.join(', ')}. Cross-checking is limited.`,
        evidence,
        recommendedAction: 'Request data linkage from respective departments. Priority: ' + missing[0] + '.',
      };
    },
  },
];

// ---- Conflict Detector Service ----

export const conflictDetector = {
  /** Run all rules against a parcel and return triggered results */
  evaluate(parcelId: string): RuleResult[] {
    const data = getParcelData(parcelId);
    if (!data) return [];
    const results: RuleResult[] = [];
    for (const rule of RULES) {
      const result = rule.evaluate(data);
      if (result) results.push(result);
    }
    // Sort by severity
    const order: Record<Severity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    results.sort((a, b) => order[a.severity] - order[b.severity]);
    return results;
  },

  /** Get all rule definitions (for display) */
  getRuleDefinitions(): RuleDefinition[] {
    return RULES.map(({ id, name, description, severity, datasets_used }) => ({
      id, name, description, severity, datasets_used,
    }));
  },
};


// ============================================================================
// 3. PARCEL TRUTH ENGINE — Data Consistency
// ============================================================================

export type ConsistencyStatus = 'Verified' | 'Needs Review' | 'Conflict' | 'Unavailable';

export interface DataConsistency {
  category: string;
  status: ConsistencyStatus;
  detail?: string;
}

export interface TruthEngineResult {
  parcelId: string;
  consistency: DataConsistency[];
  conflicts: RuleResult[];
  summary: {
    rulesEvaluated: number;
    datasetsCompared: number;
    issuesDetected: number;
    evidenceRecords: number;
    verifiedCategories: number;
    conflictCategories: number;
    reviewCategories: number;
    unavailableCategories: number;
  };
}

export const parcelTruthEngine = {
  /** Run full truth engine analysis on a parcel */
  analyze(parcelId: string): TruthEngineResult | null {
    const data = getParcelData(parcelId);
    if (!data) return null;

    const conflicts = conflictDetector.evaluate(parcelId);
    const hasConflict = (ruleId: string) => conflicts.some(r => r.ruleId === ruleId);

    const consistency: DataConsistency[] = [
      {
        category: 'Ownership',
        status: !data.ror ? 'Unavailable'
          : hasConflict('OWNER_MISMATCH') ? 'Conflict'
            : data.litigations.some(l => l.status === 'Active' && l.caseType.toLowerCase().includes('title')) ? 'Needs Review'
              : 'Verified',
        detail: hasConflict('OWNER_MISMATCH')
          ? conflicts.find(c => c.ruleId === 'OWNER_MISMATCH')?.description
          : undefined,
      },
      {
        category: 'Area',
        status: (!data.ror || data.registrations.length === 0) ? 'Unavailable'
          : hasConflict('AREA_MISMATCH') ? 'Needs Review'
            : 'Verified',
        detail: hasConflict('AREA_MISMATCH')
          ? conflicts.find(c => c.ruleId === 'AREA_MISMATCH')?.description
          : undefined,
      },
      {
        category: 'Registration',
        status: data.registrations.length === 0 ? 'Unavailable' : 'Verified',
      },
      {
        category: 'Zoning',
        status: !data.zoning ? 'Unavailable'
          : hasConflict('LAND_USE_ZONING_CONFLICT') ? 'Conflict'
            : 'Verified',
        detail: hasConflict('LAND_USE_ZONING_CONFLICT')
          ? conflicts.find(c => c.ruleId === 'LAND_USE_ZONING_CONFLICT')?.description
          : undefined,
      },
      {
        category: 'Planning',
        status: !data.zoning ? 'Unavailable'
          : hasConflict('ROAD_RESERVATION_OVERLAP') ? 'Conflict'
            : hasConflict('MASTER_PLAN_CONFLICT') ? 'Needs Review'
              : 'Verified',
        detail: hasConflict('ROAD_RESERVATION_OVERLAP')
          ? conflicts.find(c => c.ruleId === 'ROAD_RESERVATION_OVERLAP')?.description
          : hasConflict('MASTER_PLAN_CONFLICT')
            ? conflicts.find(c => c.ruleId === 'MASTER_PLAN_CONFLICT')?.description
            : undefined,
      },
      {
        category: 'Building',
        status: data.buildingPermissions.length === 0
          ? (hasConflict('BUILDING_PERMISSION_MISSING') ? 'Conflict' : 'Unavailable')
          : data.buildingPermissions.some(bp => bp.status === 'Expired') ? 'Needs Review'
            : 'Verified',
        detail: hasConflict('BUILDING_PERMISSION_MISSING')
          ? conflicts.find(c => c.ruleId === 'BUILDING_PERMISSION_MISSING')?.description
          : undefined,
      },
      {
        category: 'Tax',
        status: !data.tax ? 'Unavailable'
          : hasConflict('TAX_STATUS_ANOMALY') ? 'Needs Review'
            : 'Verified',
        detail: hasConflict('TAX_STATUS_ANOMALY')
          ? conflicts.find(c => c.ruleId === 'TAX_STATUS_ANOMALY')?.description
          : undefined,
      },
      {
        category: 'Restrictions',
        status: hasConflict('RESTRICTION_OVERLAP') ? 'Conflict'
          : data.restrictions.filter(r => r.isActive).length > 0 ? 'Needs Review'
            : 'Verified',
        detail: hasConflict('RESTRICTION_OVERLAP')
          ? conflicts.find(c => c.ruleId === 'RESTRICTION_OVERLAP')?.description
          : undefined,
      },
      {
        category: 'Litigation',
        status: hasConflict('LITIGATION_PRESENT') ? 'Conflict'
          : data.litigations.length > 0 ? 'Needs Review'
            : 'Verified',
        detail: hasConflict('LITIGATION_PRESENT')
          ? conflicts.find(c => c.ruleId === 'LITIGATION_PRESENT')?.description
          : undefined,
      },
    ];

    const evidenceRecords = conflicts.reduce((sum, c) => sum + Object.keys(c.evidence).length, 0);
    const connectedSources = new Set<string>();
    conflicts.forEach(c => c.datasetsUsed.forEach(d => connectedSources.add(d)));
    // Count base datasets even if no conflicts
    if (data.ror) connectedSources.add('RoR');
    if (data.registrations.length > 0) connectedSources.add('Registration');
    if (data.zoning) connectedSources.add('Zoning');
    if (data.tax) connectedSources.add('Tax');
    if (data.buildingPermissions.length > 0) connectedSources.add('Building Permissions');
    if (data.encumbrances.length > 0) connectedSources.add('Encumbrances');
    if (data.litigations.length > 0) connectedSources.add('Courts');
    if (data.satelliteChanges.length > 0) connectedSources.add('Satellite');

    return {
      parcelId,
      consistency,
      conflicts,
      summary: {
        rulesEvaluated: RULES.length,
        datasetsCompared: connectedSources.size,
        issuesDetected: conflicts.length,
        evidenceRecords,
        verifiedCategories: consistency.filter(c => c.status === 'Verified').length,
        conflictCategories: consistency.filter(c => c.status === 'Conflict').length,
        reviewCategories: consistency.filter(c => c.status === 'Needs Review').length,
        unavailableCategories: consistency.filter(c => c.status === 'Unavailable').length,
      },
    };
  },
};


// ============================================================================
// 4. CHANGE DETECTOR
// ============================================================================

export interface ChangeReport {
  parcelId: string;
  satelliteChanges: SatelliteChange[];
  pendingCount: number;
  verifiedCount: number;
  highestConfidence: number;
  summary: string;
}

export const changeDetector = {
  /** Detect and summarize changes for a parcel */
  analyze(parcelId: string): ChangeReport | null {
    const data = getParcelData(parcelId);
    if (!data) return null;

    const changes = data.satelliteChanges;
    const pending = changes.filter(s => s.verificationStatus === 'Pending');
    const verified = changes.filter(s => s.verificationStatus === 'Verified');
    const highest = changes.length > 0
      ? Math.max(...changes.map(s => s.confidence))
      : 0;

    let summary: string;
    if (changes.length === 0) {
      summary = 'No satellite changes detected for this parcel.';
    } else if (pending.length > 0) {
      summary = `${pending.length} pending change(s) require field verification. Highest confidence: ${highest}%.`;
    } else {
      summary = `${verified.length} verified change(s) on record. No pending verifications.`;
    }

    return {
      parcelId,
      satelliteChanges: changes,
      pendingCount: pending.length,
      verifiedCount: verified.length,
      highestConfidence: highest,
      summary,
    };
  },
};


// ============================================================================
// 5. EVIDENCE SERVICE
// ============================================================================

export interface EvidencePackage {
  parcelId: string;
  conflictId: string;
  rule: RuleDefinition;
  evidence: Record<string, string | number>;
  datasetsUsed: string[];
  description: string;
  recommendedAction: string;
}

export const evidenceService = {
  /** Get structured evidence for a specific conflict rule on a parcel */
  getEvidence(ruleId: string, parcelId: string): EvidencePackage | null {
    const data = getParcelData(parcelId);
    if (!data) return null;
    const rule = RULES.find(r => r.id === ruleId);
    if (!rule) return null;
    const result = rule.evaluate(data);
    if (!result) return null;
    return {
      parcelId,
      conflictId: ruleId,
      rule: { id: rule.id, name: rule.name, description: rule.description, severity: rule.severity, datasets_used: rule.datasets_used },
      evidence: result.evidence,
      datasetsUsed: result.datasetsUsed,
      description: result.description,
      recommendedAction: result.recommendedAction,
    };
  },

  /** Get all evidence for all triggered conflicts on a parcel */
  getAllEvidence(parcelId: string): EvidencePackage[] {
    const conflicts = conflictDetector.evaluate(parcelId);
    return conflicts.map(c => ({
      parcelId,
      conflictId: c.ruleId,
      rule: RULES.find(r => r.id === c.ruleId)!,
      evidence: c.evidence,
      datasetsUsed: c.datasetsUsed,
      description: c.description,
      recommendedAction: c.recommendedAction,
    }));
  },
};


// ============================================================================
// 6. PARCEL AI ASSISTANT
// ============================================================================

export interface AssistantResponse {
  answer: string;
  evidence: Record<string, string | number>;
  datasetsUsed: string[];
  recommendedAction: string;
  suggestedActions: { label: string; action: string; params?: Record<string, string> }[];
  meta: {
    rulesEvaluated: number;
    datasetsCompared: number;
    issuesDetected: number;
    evidenceAvailable: number;
  };
  disclaimer?: string;
}

export const parcelAssistant = {
  ask(question: string, parcelId: string): AssistantResponse {
    const data = getParcelData(parcelId);
    const truth = parcelTruthEngine.analyze(parcelId);
    const conflicts = truth?.conflicts || [];
    const consistency = truth?.consistency || [];
    const meta = truth?.summary || {
      rulesEvaluated: RULES.length,
      datasetsCompared: 0,
      issuesDetected: 0,
      evidenceRecords: 0,
      verifiedCategories: 0,
      conflictCategories: 0,
      reviewCategories: 0,
      unavailableCategories: 0,
    };

    const assistantMeta = {
      rulesEvaluated: meta.rulesEvaluated,
      datasetsCompared: meta.datasetsCompared,
      issuesDetected: meta.issuesDetected,
      evidenceAvailable: meta.evidenceRecords,
    };

    const disclaimer = 'This demonstration uses synthetic records. LandLens does not provide definitive legal advice.';

    if (!data) {
      return {
        answer: 'Insufficient information to determine this. No parcel data found for the given ID.',
        evidence: {},
        datasetsUsed: [],
        recommendedAction: 'Select a valid parcel from the GIS map.',
        suggestedActions: [{ label: 'Open Map', action: 'navigate', params: { path: '/map' } }],
        meta: assistantMeta,
        disclaimer,
      };
    }

    const q = question.toLowerCase();

    // ---- "What is wrong?" / "Why flagged?" ----
    if (q.includes('wrong') || q.includes('flag') || q.includes('issue') || q.includes('problem') || q.includes('why')) {
      if (conflicts.length === 0) {
        return {
          answer: 'No active conflicts were detected for this parcel across all connected datasets. All categories show as Verified or Unavailable.',
          evidence: {},
          datasetsUsed: [...new Set(consistency.filter(c => c.status === 'Verified').map(() => 'Cross-check'))],
          recommendedAction: 'No immediate action required. Continue periodic monitoring.',
          suggestedActions: [
            { label: 'View on Map', action: 'show_map', params: { parcelId } },
          ],
          meta: assistantMeta,
          disclaimer,
        };
      }

      const lines = conflicts.map(c =>
        `${c.severity === 'CRITICAL' ? '🔴' : c.severity === 'HIGH' ? '🟠' : c.severity === 'MEDIUM' ? '🟡' : '🔵'} **${c.name}**: ${c.description}`
      );

      const allEvidence: Record<string, string | number> = {};
      const allDatasets = new Set<string>();
      conflicts.forEach(c => {
        Object.entries(c.evidence).forEach(([k, v]) => {
          allEvidence[`[${c.name}] ${k}`] = v;
        });
        c.datasetsUsed.forEach(d => allDatasets.add(d));
      });

      return {
        answer: `${conflicts.length} potential issue${conflicts.length > 1 ? 's were' : ' was'} detected.\n\n${lines.join('\n\n')}`,
        evidence: allEvidence,
        datasetsUsed: Array.from(allDatasets),
        recommendedAction: conflicts[0].recommendedAction,
        suggestedActions: [
          { label: 'View Evidence', action: 'show_evidence', params: { parcelId } },
          { label: 'View on Map', action: 'show_map', params: { parcelId } },
          { label: 'Create Verification Task', action: 'create_task', params: { parcelId } },
        ],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- "Can I build here?" ----
    if (q.includes('build') || q.includes('construct') || q.includes('develop')) {
      const roadRule = conflicts.find(c => c.ruleId === 'ROAD_RESERVATION_OVERLAP');
      const restrictionRule = conflicts.find(c => c.ruleId === 'RESTRICTION_OVERLAP');
      const zoningRule = conflicts.find(c => c.ruleId === 'LAND_USE_ZONING_CONFLICT');
      const litRule = conflicts.find(c => c.ruleId === 'LITIGATION_PRESENT');
      const nonBuildable = ['Agricultural', 'Forest', 'Water Body', 'Open Space'];

      const blockers: string[] = [];
      const evidence: Record<string, string | number> = {};

      if (roadRule) {
        blockers.push(`🔴 Parcel falls within a road reservation corridor. ${roadRule.description}`);
        Object.assign(evidence, roadRule.evidence);
      }
      if (restrictionRule) {
        blockers.push(`🟠 Active environmental/regulatory restrictions. ${restrictionRule.description}`);
        Object.assign(evidence, restrictionRule.evidence);
      }
      if (nonBuildable.includes(data.parcel.landUse)) {
        blockers.push(`🟠 Land use is "${data.parcel.landUse}". Construction not permitted without land use conversion.`);
        evidence['Current Land Use'] = data.parcel.landUse;
      }
      if (zoningRule) {
        blockers.push(`🟡 ${zoningRule.description}`);
        Object.assign(evidence, zoningRule.evidence);
      }
      if (litRule) {
        blockers.push(`🟠 Active litigation may block building approval. ${litRule.description}`);
      }
      if (data.parcel.status === 'Disputed') {
        blockers.push('🟠 Parcel status is Disputed. Ownership must be cleared first.');
      }
      if (data.parcel.status === 'Restricted') {
        blockers.push('🔴 Parcel is Restricted. Building applications will not be processed.');
      }

      if (blockers.length === 0) {
        return {
          answer: `Based on available data, this parcel **may be eligible for construction** subject to local bylaws.\n\n• Zone: ${data.zoning?.currentZone || data.parcel.zoning}\n• FSI: ${data.zoning?.fsi || 'Check with RDA'}\n• Max Height: ${data.zoning?.maxHeight || 'Check with RDA'}m\n• Status: ${data.parcel.status}`,
          evidence: {
            'Zone': data.zoning?.currentZone || data.parcel.zoning,
            'FSI': data.zoning?.fsi || 'N/A',
            'Max Height': data.zoning?.maxHeight ? `${data.zoning.maxHeight}m` : 'N/A',
            'Existing Permissions': data.buildingPermissions.length,
          },
          datasetsUsed: ['Master Plan (RDA)', 'Zoning Records', 'Building Permissions'],
          recommendedAction: 'Apply for building permission with Raipur Municipal Corporation. Obtain NOC from RDA.',
          suggestedActions: [
            { label: 'View Zoning Details', action: 'navigate', params: { path: `/parcels/${parcelId}` } },
          ],
          meta: assistantMeta,
          disclaimer,
        };
      }

      return {
        answer: `**Construction is not recommended.** ${blockers.length} issue${blockers.length > 1 ? 's' : ''} found:\n\n${blockers.join('\n\n')}`,
        evidence,
        datasetsUsed: ['Master Plan (RDA)', 'Environmental Restrictions', 'Building Permissions', 'Court Records'],
        recommendedAction: blockers.length > 0
          ? (roadRule?.recommendedAction || restrictionRule?.recommendedAction || 'Consult with RDA and legal counsel before proceeding.')
          : 'Apply for building permission.',
        suggestedActions: [
          { label: 'View Evidence', action: 'show_evidence', params: { parcelId } },
          { label: 'View on Map', action: 'show_map', params: { parcelId } },
        ],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- "What changed?" ----
    if (q.includes('change') || q.includes('satellite') || q.includes('detect')) {
      const changes = changeDetector.analyze(parcelId);
      if (!changes || changes.satelliteChanges.length === 0) {
        return {
          answer: 'No satellite changes detected for this parcel in the available imagery.',
          evidence: {},
          datasetsUsed: ['Satellite Imagery (ISRO Bhuvan)'],
          recommendedAction: 'No action required. Imagery is reviewed bi-annually.',
          suggestedActions: [],
          meta: assistantMeta,
          disclaimer,
        };
      }

      const evidence: Record<string, string | number> = {};
      changes.satelliteChanges.forEach((s, i) => {
        evidence[`Change ${i + 1}`] = `${s.changeType} (${s.confidence}% conf.)`;
        evidence[`Date ${i + 1}`] = s.detectedDate;
        evidence[`Status ${i + 1}`] = s.verificationStatus;
      });

      return {
        answer: `${changes.satelliteChanges.length} satellite change(s) detected:\n\n${changes.satelliteChanges.map(s =>
          `• **${s.changeType}** — ${s.confidence}% confidence — ${s.detectedDate} — Status: ${s.verificationStatus}`
        ).join('\n')}`,
        evidence,
        datasetsUsed: ['Satellite Imagery (ISRO Bhuvan)'],
        recommendedAction: changes.pendingCount > 0
          ? 'Dispatch field surveyor to verify detected changes.'
          : 'All changes verified. No further action needed.',
        suggestedActions: changes.pendingCount > 0
          ? [{ label: 'Create Verification Task', action: 'create_task', params: { parcelId } }]
          : [],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- "What documents?" / "verify" ----
    if (q.includes('document') || q.includes('verify') || q.includes('officer')) {
      const docs: string[] = [];
      if (data.ror) docs.push('Record of Rights (B1 Extract)');
      if (data.registrations.length > 0) docs.push('Registration Deed / Sale Deed');
      if (data.mutations.some(m => m.status === 'Pending')) docs.push('Mutation Application & Court Order');
      if (data.zoning) docs.push('Zoning Certificate from RDA');
      if (data.encumbrances.length > 0) docs.push('Encumbrance Certificate');
      if (data.litigations.length > 0) docs.push('Court Case Order / Stay Order');
      if (data.tax) docs.push('Property Tax Receipt');
      docs.push('Survey / Cadastral Map (Bhu-Naksha)');
      if (data.restrictions.length > 0) docs.push('Environmental NOC from ' + data.restrictions[0].authority);

      return {
        answer: `The following documents should be verified for parcel ${data.parcel.ulpin}:\n\n${docs.map((d, i) => `${i + 1}. ${d}`).join('\n')}`,
        evidence: { 'Documents Required': docs.length },
        datasetsUsed: ['Cross-referenced all connected sources'],
        recommendedAction: 'Revenue Officer should verify RoR and Mutation records. Registration Officer should verify deeds.',
        suggestedActions: [
          { label: 'Generate Report', action: 'generate_report', params: { parcelId } },
        ],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- "Which department?" ----
    if (q.includes('department') || q.includes('who should') || q.includes('handle') || q.includes('responsible')) {
      const depts: string[] = [];
      if (conflicts.some(c => ['OWNER_MISMATCH', 'AREA_MISMATCH', 'TAX_STATUS_ANOMALY'].includes(c.ruleId))) {
        depts.push('Revenue Department (Board of Revenue)');
      }
      if (conflicts.some(c => ['ROAD_RESERVATION_OVERLAP', 'LAND_USE_ZONING_CONFLICT', 'MASTER_PLAN_CONFLICT'].includes(c.ruleId))) {
        depts.push('Raipur Development Authority (RDA)');
      }
      if (conflicts.some(c => c.ruleId === 'BUILDING_PERMISSION_MISSING')) {
        depts.push('Raipur Municipal Corporation (Building Section)');
      }
      if (conflicts.some(c => c.ruleId === 'LITIGATION_PRESENT')) {
        depts.push('District Court / Legal Cell');
      }
      if (conflicts.some(c => c.ruleId === 'RESTRICTION_OVERLAP')) {
        depts.push(data.restrictions[0]?.authority || 'Environmental Authority');
      }
      if (depts.length === 0) depts.push('No specific department intervention required for current issues.');

      return {
        answer: `Based on detected issues, the following department(s) should handle this parcel:\n\n${depts.map(d => `• ${d}`).join('\n')}`,
        evidence: { 'Issues': conflicts.length, 'Departments': depts.length },
        datasetsUsed: conflicts.flatMap(c => c.datasetsUsed).filter((v, i, a) => a.indexOf(v) === i),
        recommendedAction: 'Coordinate inter-departmental response through District Collector office.',
        suggestedActions: [
          { label: 'Create Task', action: 'create_task', params: { parcelId } },
        ],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- "What records disagree?" ----
    if (q.includes('disagree') || q.includes('mismatch') || q.includes('inconsisten') || q.includes('conflict')) {
      if (conflicts.length === 0) {
        return {
          answer: 'No dataset disagreements found. All connected records appear consistent for this parcel.',
          evidence: {},
          datasetsUsed: ['All connected sources'],
          recommendedAction: 'Continue periodic monitoring.',
          suggestedActions: [],
          meta: assistantMeta,
          disclaimer,
        };
      }

      const allEvidence: Record<string, string | number> = {};
      const allDatasets = new Set<string>();
      conflicts.forEach(c => {
        Object.entries(c.evidence).forEach(([k, v]) => allEvidence[`[${c.name}] ${k}`] = v);
        c.datasetsUsed.forEach(d => allDatasets.add(d));
      });

      return {
        answer: `${conflicts.length} record disagreement${conflicts.length > 1 ? 's' : ''} found:\n\n${conflicts.map(c => `• **${c.name}**: ${c.description}`).join('\n\n')}`,
        evidence: allEvidence,
        datasetsUsed: Array.from(allDatasets),
        recommendedAction: conflicts[0].recommendedAction,
        suggestedActions: [
          { label: 'View Evidence', action: 'show_evidence', params: { parcelId } },
        ],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- Owner questions ----
    if (q.includes('owner') || q.includes('who own') || q.includes('ownership')) {
      const ownerConflict = conflicts.find(c => c.ruleId === 'OWNER_MISMATCH');
      if (ownerConflict) {
        return {
          answer: `**Ownership inconsistency detected:**\n\n${ownerConflict.description}`,
          evidence: ownerConflict.evidence,
          datasetsUsed: ownerConflict.datasetsUsed,
          recommendedAction: ownerConflict.recommendedAction,
          suggestedActions: [
            { label: 'View Evidence', action: 'show_evidence', params: { parcelId } },
          ],
          meta: assistantMeta,
          disclaimer,
        };
      }
      const currentOwners = data.owners.filter(o => o.isCurrentOwner);
      if (currentOwners.length > 0) {
        const evidence: Record<string, string | number> = {};
        currentOwners.forEach((o, i) => {
          evidence[`Owner ${i + 1}`] = `${o.name} (${o.sharePercent}%)`;
          evidence[`Type ${i + 1}`] = o.ownershipType;
          evidence[`Acquisition ${i + 1}`] = `${o.acquisitionType} — ${o.acquisitionDate}`;
        });
        return {
          answer: `Ownership information for ${data.parcel.ulpin}:\n\n${currentOwners.map(o => `• **${o.name}** — ${o.sharePercent}% share — ${o.ownershipType} — ${o.acquisitionType} (${o.acquisitionDate})`).join('\n')}`,
          evidence,
          datasetsUsed: ['RoR (Bhu-Abhilekh)', 'Owner Records'],
          recommendedAction: 'No ownership conflict detected. Verify with latest RoR extract.',
          suggestedActions: [],
          meta: assistantMeta,
          disclaimer,
        };
      }
      if (data.ror) {
        return {
          answer: `According to the Record of Rights (${data.ror.source}), the registered owner is **${data.ror.ownerName}**.`,
          evidence: { 'RoR Owner': data.ror.ownerName, 'Source': data.ror.source, 'Last Updated': data.ror.lastUpdated },
          datasetsUsed: ['RoR (Bhu-Abhilekh)'],
          recommendedAction: 'Verify with latest RoR B1 extract.',
          suggestedActions: [],
          meta: assistantMeta,
          disclaimer,
        };
      }
      return {
        answer: 'Insufficient information to determine ownership. No RoR or Owner record found in connected datasets.',
        evidence: {},
        datasetsUsed: [],
        recommendedAction: 'Request RoR data linkage from Revenue Department.',
        suggestedActions: [],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- Area questions ----
    if (q.includes('area') || q.includes('size') || q.includes('acres') || q.includes('sqm')) {
      const areaConflict = conflicts.find(c => c.ruleId === 'AREA_MISMATCH');
      if (areaConflict) {
        return {
          answer: `**Area inconsistency detected:**\n\n${areaConflict.description}`,
          evidence: areaConflict.evidence,
          datasetsUsed: areaConflict.datasetsUsed,
          recommendedAction: areaConflict.recommendedAction,
          suggestedActions: [{ label: 'View Evidence', action: 'show_evidence', params: { parcelId } }],
          meta: assistantMeta,
          disclaimer,
        };
      }
      return {
        answer: `Parcel area: **${data.parcel.areaAcres} acres** (${data.parcel.area.toLocaleString()} sqm).${data.ror ? `\nRoR: ${data.ror.areaAcres} acres` : ''}${data.registration ? `\nRegistration: ${data.registration.areaAcres} acres` : ''}`,
        evidence: {
          'Parcel Area': `${data.parcel.areaAcres} acres`,
          ...(data.ror ? { 'RoR Area': `${data.ror.areaAcres} acres` } : {}),
          ...(data.registration ? { 'Registration Area': `${data.registration.areaAcres} acres` } : {}),
        },
        datasetsUsed: ['Parcel Registry', ...(data.ror ? ['RoR'] : []), ...(data.registration ? ['Registration'] : [])],
        recommendedAction: 'No area discrepancy detected.',
        suggestedActions: [],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- Zoning / planning questions ----
    if (q.includes('zon') || q.includes('plan') || q.includes('fsi') || q.includes('setback') || q.includes('height')) {
      if (!data.zoning) {
        return {
          answer: 'Zoning record not available in connected datasets for this parcel. Contact Raipur Development Authority.',
          evidence: {},
          datasetsUsed: [],
          recommendedAction: 'Request zoning data linkage from RDA.',
          suggestedActions: [],
          meta: assistantMeta,
          disclaimer,
        };
      }
      return {
        answer: `**Zoning Information:**\n\n• Zone: ${data.zoning.currentZone}\n• Land Use: ${data.zoning.landUseDesignation}\n• FSI: ${data.zoning.fsi}\n• Max Height: ${data.zoning.maxHeight}m\n• Front Setback: ${data.zoning.setbackFront}m\n• Master Plan: ${data.zoning.masterPlanPhase}${data.zoning.roadReservation ? `\n• ⚠️ Road Reservation: ${data.zoning.roadWidth}m corridor` : ''}${data.zoning.proposedZone ? `\n• Proposed Zone Change: ${data.zoning.proposedZone}` : ''}`,
        evidence: {
          'Zone': data.zoning.currentZone,
          'FSI': data.zoning.fsi,
          'Max Height': `${data.zoning.maxHeight}m`,
          'Master Plan': data.zoning.masterPlanPhase,
        },
        datasetsUsed: ['Master Plan (RDA)'],
        recommendedAction: 'Verify current zoning parameters with RDA before construction.',
        suggestedActions: [],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- Tax questions ----
    if (q.includes('tax') || q.includes('dues') || q.includes('payment')) {
      if (!data.tax) {
        return {
          answer: 'No property tax records found in connected datasets for this parcel.',
          evidence: {},
          datasetsUsed: [],
          recommendedAction: 'Check with Raipur Municipal Corporation.',
          suggestedActions: [],
          meta: assistantMeta,
          disclaimer,
        };
      }
      return {
        answer: `**Property Tax Status: ${data.tax.status}**\n\n• Demand: ₹${data.tax.taxDemand.toLocaleString()}\n• Paid: ₹${data.tax.taxPaid.toLocaleString()}\n• Outstanding: ₹${data.tax.taxDue.toLocaleString()}\n• FY: ${data.tax.financialYear}\n• Authority: ${data.tax.authority}`,
        evidence: {
          'Status': data.tax.status,
          'Tax Demand': `₹${data.tax.taxDemand.toLocaleString()}`,
          'Tax Paid': `₹${data.tax.taxPaid.toLocaleString()}`,
          'Tax Due': `₹${data.tax.taxDue.toLocaleString()}`,
        },
        datasetsUsed: ['Municipal Tax (RMC)'],
        recommendedAction: data.tax.taxDue > 0 ? 'Clear outstanding dues to avoid recovery proceedings.' : 'Tax is current. No action required.',
        suggestedActions: [],
        meta: assistantMeta,
        disclaimer,
      };
    }

    // ---- Litigation / court questions ----
    if (q.includes('court') || q.includes('case') || q.includes('litigat') || q.includes('dispute') || q.includes('legal')) {
      const activeLit = data.litigations.filter(l => l.status === 'Active');
      if (activeLit.length === 0) {
        return {
          answer: 'No active litigation records found for this parcel in the connected District Court registry.',
          evidence: {},
          datasetsUsed: ['District Court Registry'],
          recommendedAction: 'Obtain Encumbrance Certificate from Sub-Registrar for official confirmation.',
          suggestedActions: [],
          meta: assistantMeta,
          disclaimer,
        };
      }
      const evidence: Record<string, string | number> = {};
      activeLit.forEach((l, i) => {
        evidence[`Case ${i + 1}`] = l.caseNo;
        evidence[`Court ${i + 1}`] = l.court;
        evidence[`Parties ${i + 1}`] = `${l.plaintiff} vs ${l.defendant}`;
      });
      return {
        answer: `**${activeLit.length} active court case(s):**\n\n${activeLit.map(l => `• **${l.caseNo}** — ${l.court}\n  ${l.caseType}: ${l.plaintiff} vs ${l.defendant}\n  Filed: ${l.filedDate} | Status: ${l.status}${l.nextHearingDate ? ` | Next Hearing: ${l.nextHearingDate}` : ''}\n  ${l.summary}`).join('\n\n')}`,
        evidence,
        datasetsUsed: ['District Court Registry'],
        recommendedAction: 'Consult legal counsel. Do not process mutation until court order received.',
        suggestedActions: [],
        meta: assistantMeta,
        disclaimer: 'LandLens does not provide legal advice. Consult qualified legal counsel.',
      };
    }

    // ---- Default / generic ----
    return {
      answer: `I can answer questions about parcel **${data.parcel.ulpin}** (${data.parcel.id}). Try asking:\n\n• "What is wrong with this parcel?"\n• "Can I build here?"\n• "What changed?"\n• "Who owns this parcel?"\n• "What documents should an officer verify?"\n• "Which department should handle this?"\n• "What records disagree?"`,
      evidence: {},
      datasetsUsed: [],
      recommendedAction: 'Ask a specific question about this parcel.',
      suggestedActions: [
        { label: 'Why is this flagged?', action: 'ask', params: { question: 'Why is this parcel flagged?' } },
        { label: 'Can I build here?', action: 'ask', params: { question: 'Can I build here?' } },
        { label: 'What changed?', action: 'ask', params: { question: 'What changed?' } },
      ],
      meta: assistantMeta,
      disclaimer,
    };
  },
};


// ============================================================================
// 7. REPORT GENERATOR — Parcel Intelligence Report
// ============================================================================

export interface IntelligenceReportSection {
  title: string;
  content: Record<string, string | number | undefined>[];
}

export interface ParcelIntelligenceReport {
  title: string;
  generatedAt: string;
  parcelId: string;
  ulpin: string;
  disclaimer: string;
  sections: IntelligenceReportSection[];
  truthEngine: TruthEngineResult;
}

export const reportGenerator = {
  generate(parcelId: string): ParcelIntelligenceReport | null {
    const data = getParcelData(parcelId);
    const truth = parcelTruthEngine.analyze(parcelId);
    if (!data || !truth) return null;

    const sections: IntelligenceReportSection[] = [
      // 1. Parcel Identity
      {
        title: 'Parcel Identity',
        content: [{
          'ULPIN': data.parcel.ulpin,
          'Parcel ID': data.parcel.id,
          'Khasra No': data.parcel.khasraNo,
          'Survey No': data.parcel.surveyNo,
          'Area': `${data.parcel.areaAcres} acres (${data.parcel.area.toLocaleString()} sqm)`,
          'Village': data.parcel.village,
          'Tehsil': data.parcel.tehsil,
          'District': data.parcel.district,
          'State': data.parcel.state,
          'Coordinates': `${data.parcel.lat.toFixed(4)}°N, ${data.parcel.lng.toFixed(4)}°E`,
          'Status': data.parcel.status,
          'Land Use': data.parcel.landUse,
          'Zoning': data.parcel.zoning,
        }],
      },
      // 2. Data Sources Connected
      {
        title: 'Data Sources',
        content: [
          { 'RoR (Bhu-Abhilekh)': data.ror ? `Connected — ${data.ror.source}` : 'Not Available' },
          { 'Registration (DORIS)': data.registrations.length > 0 ? `${data.registrations.length} record(s)` : 'Not Available' },
          { 'Master Plan (RDA)': data.zoning ? 'Connected' : 'Not Available' },
          { 'Municipal Tax (RMC)': data.tax ? `Connected — ${data.tax.status}` : 'Not Available' },
          { 'Building Permissions': data.buildingPermissions.length > 0 ? `${data.buildingPermissions.length} record(s)` : 'Not Available' },
          { 'Encumbrances (CERSAI)': data.encumbrances.length > 0 ? `${data.encumbrances.length} record(s)` : 'None' },
          { 'Court Records': data.litigations.length > 0 ? `${data.litigations.length} case(s)` : 'None' },
          { 'Satellite Imagery': data.satelliteChanges.length > 0 ? `${data.satelliteChanges.length} change(s)` : 'No changes' },
        ],
      },
      // 3. Ownership Information [SYNTHETIC]
      {
        title: 'Ownership Information',
        content: data.owners.filter(o => o.isCurrentOwner).map(o => ({
          'Name': o.name,
          'Type': o.ownershipType,
          'Share': `${o.sharePercent}%`,
          'Acquisition': `${o.acquisitionType} — ${o.acquisitionDate}`,
          '[SYNTHETIC DATA]': 'This record is demonstration data.',
        })),
      },
    ];

    // 4. Registration
    if (data.registrations.length > 0) {
      sections.push({
        title: 'Registration Records',
        content: data.registrations.map(r => ({
          'Document No': r.documentNo,
          'Date': r.registrationDate,
          'Buyer': r.buyerName,
          'Seller': r.sellerName,
          'Value': `₹${r.saleValue.toLocaleString()}`,
          'Area': `${r.areaAcres} acres`,
          'Status': r.status,
        })),
      });
    }

    // 5. Land Use & Zoning
    if (data.zoning) {
      sections.push({
        title: 'Land Use & Planning',
        content: [{
          'Current Zone': data.zoning.currentZone,
          'Land Use Designation': data.zoning.landUseDesignation,
          'FSI': data.zoning.fsi,
          'Max Height': `${data.zoning.maxHeight}m`,
          'Master Plan': data.zoning.masterPlanPhase,
          'Road Reservation': data.zoning.roadReservation ? `Yes — ${data.zoning.roadWidth}m` : 'No',
          'Proposed Zone': data.zoning.proposedZone || 'No change proposed',
        }],
      });
    }

    // 6. Building Permissions
    if (data.buildingPermissions.length > 0) {
      sections.push({
        title: 'Building Permissions',
        content: data.buildingPermissions.map(bp => ({
          'Application': bp.applicationNo,
          'Type': bp.type,
          'Status': bp.status,
          'Applied': bp.appliedDate,
          'Approved': bp.approvedDate || 'N/A',
          'Valid Until': bp.validUpto || 'N/A',
          'Authority': bp.authority,
        })),
      });
    }

    // 7. Tax
    if (data.tax) {
      sections.push({
        title: 'Property Tax',
        content: [{
          'Status': data.tax.status,
          'Tax Demand': `₹${data.tax.taxDemand.toLocaleString()}`,
          'Tax Paid': `₹${data.tax.taxPaid.toLocaleString()}`,
          'Outstanding': `₹${data.tax.taxDue.toLocaleString()}`,
          'FY': data.tax.financialYear,
          'Authority': data.tax.authority,
        }],
      });
    }

    // 8. Restrictions
    if (data.restrictions.length > 0) {
      sections.push({
        title: 'Environmental & Regulatory Restrictions',
        content: data.restrictions.map(r => ({
          'Type': r.type,
          'Authority': r.authority,
          'Description': r.description,
          'Active': r.isActive ? 'Yes' : 'No',
          'Notification': r.notificationNo || 'N/A',
        })),
      });
    }

    // 9. Conflicts
    if (truth.conflicts.length > 0) {
      sections.push({
        title: 'Detected Conflicts',
        content: truth.conflicts.map(c => ({
          'Rule': c.name,
          'Severity': c.severity,
          'Description': c.description,
          'Datasets': c.datasetsUsed.join(', '),
          'Recommended Action': c.recommendedAction,
        })),
      });
    }

    // 10. Change Detection
    if (data.satelliteChanges.length > 0) {
      sections.push({
        title: 'Satellite Change Detection',
        content: data.satelliteChanges.map(s => ({
          'Change': s.changeType,
          'Detected': s.detectedDate,
          'Confidence': `${s.confidence}%`,
          'Area': s.area ? `${s.area} sqm` : 'N/A',
          'Verification': s.verificationStatus,
        })),
      });
    }

    // 11. Evidence Summary
    const allEvidence = evidenceService.getAllEvidence(parcelId);
    if (allEvidence.length > 0) {
      sections.push({
        title: 'Evidence Records',
        content: allEvidence.map(e => ({
          'Conflict': e.rule.name,
          ...Object.fromEntries(Object.entries(e.evidence).map(([k, v]) => [k, String(v)])),
        })),
      });
    }

    // 12. Recommended Verification Actions
    const actions = truth.conflicts.map(c => c.recommendedAction).filter((v, i, a) => a.indexOf(v) === i);
    if (actions.length > 0) {
      sections.push({
        title: 'Recommended Verification Actions',
        content: actions.map((a, i) => ({ [`Action ${i + 1}`]: a })),
      });
    }

    return {
      title: `Parcel Intelligence Report — ${data.parcel.ulpin}`,
      generatedAt: new Date().toISOString(),
      parcelId: data.parcel.id,
      ulpin: data.parcel.ulpin,
      disclaimer: '⚠ All land records are synthetic demonstration data. This report is generated from a prototype system and does not represent real ownership, legal status, or government records. LandLens does not provide definitive legal advice.',
      sections,
      truthEngine: truth,
    };
  },
};
