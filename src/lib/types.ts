// ============================================================
// LANDLENS - Core Type Definitions
// ============================================================

export type UserRole =
  | 'citizen'
  | 'revenue_officer'
  | 'planning_officer'
  | 'registration_officer'
  | 'district_admin'
  | 'system_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  district?: string;
  avatar?: string;
}

// ---- Parcel -----------------------------------------------

export type LandUse =
  | 'Residential'
  | 'Commercial'
  | 'Agricultural'
  | 'Industrial'
  | 'Government'
  | 'Mixed Use'
  | 'Forest'
  | 'Water Body'
  | 'Open Space'
  | 'Institutional';

export type ZoningType =
  | 'R1' | 'R2' | 'C1' | 'C2' | 'I1' | 'A1'
  | 'G' | 'MX' | 'OS' | 'RD';

export interface Parcel {
  id: string;
  ulpin: string;
  khasraNo: string;
  surveyNo: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  ward?: string;
  area: number; // in square meters
  areaAcres: number;
  landUse: LandUse;
  zoning: ZoningType;
  lat: number;
  lng: number;
  geometry?: GeoJSON.Feature;
  address: string;
  status: 'Active' | 'Disputed' | 'Under Review' | 'Restricted';
  dataHealth: DataHealth;
}

export interface DataHealth {
  ownership: HealthStatus;
  registration: HealthStatus;
  area: HealthStatus;
  zoning: HealthStatus;
  buildingPermission: HealthStatus;
  tax: HealthStatus;
  litigation: HealthStatus;
  restrictions: HealthStatus;
}

export type HealthStatus = 'verified' | 'attention' | 'conflict' | 'unavailable';

// ---- Owner ------------------------------------------------

export interface Owner {
  id: string;
  parcelId: string;
  name: string;
  fatherName: string;
  aadhaarLast4?: string;
  ownershipType: 'Single' | 'Joint' | 'Government' | 'Trust' | 'Company';
  sharePercent: number;
  acquisitionDate: string;
  acquisitionType: 'Purchase' | 'Inheritance' | 'Gift' | 'Court Order' | 'Government Allotment';
  isCurrentOwner: boolean;
}

// ---- Record of Rights (RoR) ---------------------------------

export interface RoRRecord {
  id: string;
  parcelId: string;
  khasraNo: string;
  area: number;
  areaAcres: number;
  ownerName: string;
  cultivatorName?: string;
  landType: string;
  irrigationSource?: string;
  lastUpdated: string;
  khataNo: string;
  khatabiNo: string;
  village: string;
  tehsil: string;
  district: string;
  source: 'Bhu-Abhilekh' | 'DILRMP' | 'State Portal';
  isVerified: boolean;
}

// ---- Registration -----------------------------------------

export interface Registration {
  id: string;
  parcelId: string;
  documentNo: string;
  registrationDate: string;
  saleValue: number;
  stampDuty: number;
  area: number;
  areaAcres: number;
  sellerName: string;
  buyerName: string;
  propertyType: string;
  subRegistrarOffice: string;
  status: 'Registered' | 'Pending' | 'Cancelled';
}

// ---- Mutation ---------------------------------------------

export interface Mutation {
  id: string;
  parcelId: string;
  mutationNo: string;
  mutationDate: string;
  type: 'Sale' | 'Inheritance' | 'Gift' | 'Court Order' | 'Partition';
  previousOwner: string;
  newOwner: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  approvedBy?: string;
  remarks?: string;
}

// ---- Zoning / Master Plan ---------------------------------

export interface ZoningRecord {
  id: string;
  parcelId: string;
  currentZone: ZoningType;
  proposedZone?: ZoningType;
  masterPlanPhase: 'RDP 2031' | 'RDP 2041' | 'Draft';
  landUseDesignation: string;
  fsi: number;
  maxHeight: number;
  setbackFront: number;
  setbackSide: number;
  remarks?: string;
  roadReservation?: boolean;
  roadWidth?: number;
}

// ---- Building Permission ----------------------------------

export interface BuildingPermission {
  id: string;
  parcelId: string;
  applicationNo: string;
  applicantName: string;
  type: 'New Construction' | 'Addition' | 'Alteration' | 'Demolition';
  approvedArea?: number;
  floors?: number;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Expired' | 'Under Review';
  appliedDate: string;
  approvedDate?: string;
  validUpto?: string;
  authority: string;
}

// ---- Encumbrance / Mortgage --------------------------------

export interface Encumbrance {
  id: string;
  parcelId: string;
  type: 'Mortgage' | 'Lien' | 'Easement' | 'Attachment' | 'Court Order';
  creditorName: string;
  amount?: number;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Released' | 'Expired';
  registrationNo: string;
  bankName?: string;
}

// ---- Tax --------------------------------------------------

export interface TaxRecord {
  id: string;
  parcelId: string;
  propertyId: string;
  annualValue: number;
  taxDemand: number;
  taxPaid: number;
  taxDue: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  financialYear: string;
  status: 'Paid' | 'Partial' | 'Defaulter' | 'Exempted';
  authority: string;
}

// ---- Litigation -------------------------------------------

export interface Litigation {
  id: string;
  parcelId: string;
  caseNo: string;
  court: string;
  caseType: string;
  plaintiff: string;
  defendant: string;
  filedDate: string;
  status: 'Active' | 'Disposed' | 'Stayed';
  nextHearingDate?: string;
  summary: string;
}

// ---- Environmental Restriction ----------------------------

export interface EnvironmentalRestriction {
  id: string;
  parcelId: string;
  type: 'Forest Buffer' | 'Flood Zone' | 'Wetland' | 'Heritage' | 'Airport Zone' | 'No Development Zone';
  authority: string;
  description: string;
  isActive: boolean;
  notificationNo?: string;
}

// ---- Valuation --------------------------------------------

export interface Valuation {
  id: string;
  parcelId: string;
  circleRate: number; // per sqm
  marketValue: number;
  guidanceValue: number;
  valuationDate: string;
  valuationAuthority: string;
  totalValue: number;
}

// ---- Utility ----------------------------------------------

export interface Utility {
  id: string;
  parcelId: string;
  type: 'Water Connection' | 'Electricity' | 'Gas' | 'Drainage' | 'Telecom';
  connectionNo?: string;
  provider: string;
  status: 'Active' | 'Disconnected' | 'Pending' | 'Not Connected';
}

// ---- Satellite Change ------------------------------------

export interface SatelliteChange {
  id: string;
  parcelId: string;
  detectedDate: string;
  changeType: 'Construction Started' | 'Structure Added' | 'Vegetation Cleared' | 'Boundary Shift' | 'Building Demolished';
  confidence: number; // 0-100
  beforeImageUrl?: string;
  afterImageUrl?: string;
  area?: number;
  requiresVerification: boolean;
  verificationStatus: 'Pending' | 'Verified' | 'Dismissed';
}

// ---- Service Request -------------------------------------

export interface ServiceRequest {
  id: string;
  parcelId: string;
  citizenName: string;
  citizenPhone: string;
  type: 'Mutation' | 'RoR Copy' | 'Encumbrance Certificate' | 'Land Use Certificate' | 'NOC' | 'Building Plan' | 'Valuation Certificate';
  status: 'Submitted' | 'In Progress' | 'Pending Documents' | 'Approved' | 'Rejected' | 'Completed';
  submittedDate: string;
  expectedDate: string;
  assignedOfficer?: string;
  department: string;
  trackingId: string;
  documents: string[];
  remarks?: string;
}

// ---- Workflow ---------------------------------------------

export interface WorkflowTask {
  id: string;
  parcelId: string;
  title: string;
  type: 'Conflict Resolution' | 'Field Verification' | 'Document Review' | 'Mutation Approval' | 'Building Inspection' | 'Tax Assessment';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Pending Review' | 'Resolved' | 'Escalated';
  assignedTo: string;
  assignedDept: string;
  createdDate: string;
  dueDate: string;
  slaHours: number;
  hoursElapsed: number;
  description: string;
  conflictAlertId?: string;
  evidence: string[];
  comments: WorkflowComment[];
}

export interface WorkflowComment {
  id: string;
  author: string;
  role: string;
  comment: string;
  timestamp: string;
  attachments?: string[];
}

// ---- Alert / Conflict ------------------------------------

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertType =
  | 'area_mismatch'
  | 'ownership_conflict'
  | 'planning_conflict'
  | 'encumbrance_active'
  | 'litigation_active'
  | 'satellite_change'
  | 'tax_default'
  | 'restriction_overlap'
  | 'boundary_discrepancy'
  | 'permission_expired';

export interface ConflictAlert {
  id: string;
  parcelId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  datasetsCompared: string[];
  values: Record<string, string | number>;
  difference?: string;
  detectedDate: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Dismissed';
  recommendedAction: string;
  workflowTaskId?: string;
}

// ---- Audit Log -------------------------------------------

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'Parcel' | 'Owner' | 'RoR' | 'Registration' | 'Workflow' | 'User' | 'Dataset' | 'Alert';
  entityId: string;
  parcelId?: string;
  details: string;
  ipAddress: string;
  department?: string;
}

// ---- Data Source -----------------------------------------

export interface DataSource {
  id: string;
  name: string;
  shortName: string;
  department: string;
  ministry: string;
  dataset: string;
  description: string;
  lastSynced: string;
  recordCount: number;
  status: 'Live' | 'Simulated' | 'Degraded' | 'Offline';
  apiStatus: 'Connected' | 'Demo Connector' | 'Planned';
  schemaVersion: string;
  dataFreshnessDays: number;
  coverageArea: string;
  endpoint?: string;
}

// ---- AI Response -----------------------------------------

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  suggestedActions?: AIAction[];
  parcelId?: string;
}

export interface AIAction {
  label: string;
  action: string;
  params?: Record<string, string>;
}

// ---- Analytics -------------------------------------------

export interface DistrictAnalytics {
  totalParcels: number;
  verifiedParcels: number;
  conflictParcels: number;
  pendingMutations: number;
  pendingServices: number;
  disputedParcels: number;
  potentialChanges: number;
  buildingApprovals: number;
  taxDefaulters: number;
  dataQualityScore: number;
}
