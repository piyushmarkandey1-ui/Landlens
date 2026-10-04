// ============================================================
// LANDLENS - Synthetic Demo Data
// Raipur, Chhattisgarh — 100+ Parcels
// ⚠ All records are synthetic demonstration data.
//   They do not represent real ownership or legal status.
// ============================================================

import type {
  Parcel, Owner, RoRRecord, Registration, Mutation,
  ZoningRecord, BuildingPermission, Encumbrance, TaxRecord,
  Litigation, EnvironmentalRestriction, Valuation,
  SatelliteChange, ServiceRequest, WorkflowTask, ConflictAlert,
  AuditLog, DataSource, DataHealth
} from './types';

// ---- Helper -----------------------------------------------

function ulpin(n: number): string {
  return `CG-RJP-${String(Math.floor(n / 100)).padStart(4, '0')}-${String(n % 100).padStart(4, '0')}`;
}

// ---- Parcels ----------------------------------------------

export const PARCELS: Parcel[] = [
  {
    id: 'P001', ulpin: 'CG-RJP-0001-0001', khasraNo: '123/1', surveyNo: 'S-1023',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Tatibandh',
    area: 1012, areaAcres: 0.25, landUse: 'Residential', zoning: 'R1',
    lat: 21.2514, lng: 81.6296, address: 'Plot 12, Sector A, Tatibandh, Raipur',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'conflict', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P002', ulpin: 'CG-RJP-0001-0002', khasraNo: '124/2', surveyNo: 'S-1024',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Tatibandh',
    area: 2023, areaAcres: 0.50, landUse: 'Commercial', zoning: 'C1',
    lat: 21.2520, lng: 81.6305, address: 'Plot 14, Sector A, Tatibandh, Raipur',
    status: 'Disputed',
    dataHealth: { ownership: 'conflict', registration: 'attention', area: 'verified', zoning: 'attention', buildingPermission: 'unavailable', tax: 'attention', litigation: 'conflict', restrictions: 'verified' }
  },
  {
    id: 'P003', ulpin: 'CG-RJP-0001-0003', khasraNo: '125/3', surveyNo: 'S-1025',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Tatibandh',
    area: 4047, areaAcres: 1.0, landUse: 'Agricultural', zoning: 'A1',
    lat: 21.2530, lng: 81.6280, address: 'Khasra 125/3, Tatibandh Village',
    status: 'Under Review',
    dataHealth: { ownership: 'verified', registration: 'unavailable', area: 'attention', zoning: 'conflict', buildingPermission: 'unavailable', tax: 'verified', litigation: 'unavailable', restrictions: 'attention' }
  },
  {
    id: 'P004', ulpin: 'CG-RJP-0001-0004', khasraNo: '200/1', surveyNo: 'S-2001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Mowa',
    area: 1618, areaAcres: 0.40, landUse: 'Residential', zoning: 'R2',
    lat: 21.2580, lng: 81.6340, address: 'Plot 8, Mowa Colony, Raipur',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'attention', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P005', ulpin: 'CG-RJP-0001-0005', khasraNo: '201/2', surveyNo: 'S-2002',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Mowa',
    area: 809, areaAcres: 0.20, landUse: 'Commercial', zoning: 'C2',
    lat: 21.2585, lng: 81.6348, address: 'Shop Complex, Mowa Road, Raipur',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'attention', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P006', ulpin: 'CG-RJP-0002-0001', khasraNo: '301/1', surveyNo: 'S-3001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Amanaka',
    area: 9712, areaAcres: 2.40, landUse: 'Industrial', zoning: 'I1',
    lat: 21.2620, lng: 81.6400, address: 'Industrial Shed, Amanaka Industrial Area',
    status: 'Disputed',
    dataHealth: { ownership: 'attention', registration: 'conflict', area: 'conflict', zoning: 'verified', buildingPermission: 'attention', tax: 'conflict', litigation: 'conflict', restrictions: 'verified' }
  },
  {
    id: 'P007', ulpin: 'CG-RJP-0002-0002', khasraNo: '302/1', surveyNo: 'S-3002',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Amanaka',
    area: 3237, areaAcres: 0.80, landUse: 'Government', zoning: 'G',
    lat: 21.2628, lng: 81.6408, address: 'Govt. Land, Amanaka Sector',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'unavailable', area: 'verified', zoning: 'verified', buildingPermission: 'unavailable', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P008', ulpin: 'CG-RJP-0002-0003', khasraNo: '303/2', surveyNo: 'S-3003',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Amanaka',
    area: 6070, areaAcres: 1.50, landUse: 'Mixed Use', zoning: 'MX',
    lat: 21.2635, lng: 81.6415, address: 'Mixed Zone Plot, Amanaka',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'attention', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'attention' }
  },
  {
    id: 'P009', ulpin: 'CG-RJP-0003-0001', khasraNo: '401/1', surveyNo: 'S-4001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Devendra Nagar',
    area: 1214, areaAcres: 0.30, landUse: 'Residential', zoning: 'R1',
    lat: 21.2490, lng: 81.6350, address: '47, Devendra Nagar, Raipur',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P010', ulpin: 'CG-RJP-0003-0002', khasraNo: '402/1', surveyNo: 'S-4002',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Devendra Nagar',
    area: 2023, areaAcres: 0.50, landUse: 'Institutional', zoning: 'G',
    lat: 21.2498, lng: 81.6360, address: 'School Complex, Devendra Nagar',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'unavailable', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P011', ulpin: 'CG-RJP-0003-0003', khasraNo: '403/2', surveyNo: 'S-4003',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Devendra Nagar',
    area: 1618, areaAcres: 0.40, landUse: 'Residential', zoning: 'R2',
    lat: 21.2505, lng: 81.6368, address: '12, Lane 4, Devendra Nagar',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'attention', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P012', ulpin: 'CG-RJP-0004-0001', khasraNo: '501/1', surveyNo: 'S-5001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Pachpedi Naka',
    area: 4856, areaAcres: 1.20, landUse: 'Commercial', zoning: 'C1',
    lat: 21.2450, lng: 81.6420, address: 'Commercial Complex, Pachpedi Naka',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'attention', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P013', ulpin: 'CG-RJP-0004-0002', khasraNo: '502/1', surveyNo: 'S-5002',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Pachpedi Naka',
    area: 1214, areaAcres: 0.30, landUse: 'Residential', zoning: 'R1',
    lat: 21.2458, lng: 81.6428, address: 'Plot 22, Pachpedi Naka Colony',
    status: 'Restricted',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'conflict', buildingPermission: 'conflict', tax: 'verified', litigation: 'unavailable', restrictions: 'conflict' }
  },
  {
    id: 'P014', ulpin: 'CG-RJP-0005-0001', khasraNo: '601/1', surveyNo: 'S-6001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Arang', village: 'Arang',
    area: 8094, areaAcres: 2.0, landUse: 'Agricultural', zoning: 'A1',
    lat: 21.1980, lng: 81.7580, address: 'Agricultural Land, Arang Tehsil',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'unavailable', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P015', ulpin: 'CG-RJP-0005-0002', khasraNo: '602/2', surveyNo: 'S-6002',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Arang', village: 'Arang',
    area: 16188, areaAcres: 4.0, landUse: 'Agricultural', zoning: 'A1',
    lat: 21.1970, lng: 81.7590, address: 'Khasra 602/2, Arang Village',
    status: 'Under Review',
    dataHealth: { ownership: 'attention', registration: 'attention', area: 'verified', zoning: 'verified', buildingPermission: 'unavailable', tax: 'attention', litigation: 'attention', restrictions: 'verified' }
  },
  // Additional parcels
  {
    id: 'P016', ulpin: 'CG-RJP-0006-0001', khasraNo: '701/1', surveyNo: 'S-7001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Shankarnagar',
    area: 1416, areaAcres: 0.35, landUse: 'Residential', zoning: 'R1',
    lat: 21.2480, lng: 81.6260, address: '5, Shankar Nagar Colony',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P017', ulpin: 'CG-RJP-0006-0002', khasraNo: '702/1', surveyNo: 'S-7002',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Shankarnagar',
    area: 3237, areaAcres: 0.80, landUse: 'Commercial', zoning: 'C2',
    lat: 21.2488, lng: 81.6270, address: 'Commercial Plot, Shankar Nagar',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P018', ulpin: 'CG-RJP-0007-0001', khasraNo: '801/1', surveyNo: 'S-8001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Civil Lines',
    area: 2023, areaAcres: 0.50, landUse: 'Government', zoning: 'G',
    lat: 21.2540, lng: 81.6250, address: 'Govt. Office, Civil Lines, Raipur',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'unavailable', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P019', ulpin: 'CG-RJP-0007-0002', khasraNo: '802/1', surveyNo: 'S-8002',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Civil Lines',
    area: 6070, areaAcres: 1.50, landUse: 'Institutional', zoning: 'G',
    lat: 21.2548, lng: 81.6258, address: 'Hospital Complex, Civil Lines',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'unavailable', area: 'verified', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
  {
    id: 'P020', ulpin: 'CG-RJP-0008-0001', khasraNo: '901/3', surveyNo: 'S-9001',
    state: 'Chhattisgarh', district: 'Raipur', tehsil: 'Raipur', village: 'Pandri',
    area: 1820, areaAcres: 0.45, landUse: 'Residential', zoning: 'R2',
    lat: 21.2560, lng: 81.6380, address: 'Plot 78, Pandri Nagar',
    status: 'Active',
    dataHealth: { ownership: 'verified', registration: 'verified', area: 'attention', zoning: 'verified', buildingPermission: 'verified', tax: 'verified', litigation: 'unavailable', restrictions: 'verified' }
  },
];

// Generate remaining 80+ parcels programmatically
const VILLAGES = ['Tatibandh', 'Mowa', 'Amanaka', 'Devendra Nagar', 'Pachpedi Naka', 'Shankarnagar', 'Civil Lines', 'Pandri', 'Fafadih', 'Gudhiyari', 'Khamardih', 'Tikrapara'];
const LAND_USES: Parcel['landUse'][] = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Government', 'Mixed Use'];
const ZONINGS: Parcel['zoning'][] = ['R1', 'R2', 'C1', 'C2', 'A1', 'I1', 'G', 'MX'];
const STATUSES: Parcel['status'][] = ['Active', 'Active', 'Active', 'Active', 'Disputed', 'Under Review', 'Restricted'];
const HEALTH_VALUES: DataHealth['ownership'][] = ['verified', 'verified', 'verified', 'attention', 'conflict', 'unavailable'];

for (let i = 21; i <= 120; i++) {
  const village = VILLAGES[i % VILLAGES.length];
  const landUse = LAND_USES[i % LAND_USES.length];
  const zoning = ZONINGS[i % ZONINGS.length];
  const status = STATUSES[i % STATUSES.length];
  const areaAcres = parseFloat((0.1 + (i % 50) * 0.1).toFixed(2));

  const h = (): DataHealth['ownership'] => HEALTH_VALUES[Math.floor((i * 7 + HEALTH_VALUES.indexOf(HEALTH_VALUES[i % HEALTH_VALUES.length])) % HEALTH_VALUES.length)];

  PARCELS.push({
    id: `P${String(i).padStart(3, '0')}`,
    ulpin: ulpin(i),
    khasraNo: `${1000 + i}/${i % 5 + 1}`,
    surveyNo: `S-${10000 + i}`,
    state: 'Chhattisgarh',
    district: 'Raipur',
    tehsil: i % 10 === 0 ? 'Arang' : 'Raipur',
    village,
    area: Math.round(areaAcres * 4047),
    areaAcres,
    landUse,
    zoning,
    lat: 21.22 + (i % 15) * 0.004 + Math.sin(i) * 0.002,
    lng: 81.62 + (i % 12) * 0.005 + Math.cos(i) * 0.002,
    address: `Plot ${i}, ${village}, Raipur`,
    status,
    dataHealth: {
      ownership: h(), registration: h(), area: h(), zoning: h(),
      buildingPermission: h(), tax: h(), litigation: i % 7 === 0 ? 'conflict' : 'unavailable',
      restrictions: h()
    }
  });
}

// ---- Owners -----------------------------------------------

export const OWNERS: Owner[] = [
  { id: 'O001', parcelId: 'P001', name: 'Ramesh Kumar Sharma', fatherName: 'Motiram Sharma', aadhaarLast4: '7821', ownershipType: 'Single', sharePercent: 100, acquisitionDate: '2018-03-15', acquisitionType: 'Purchase', isCurrentOwner: true },
  { id: 'O002', parcelId: 'P002', name: 'Sunita Agarwal', fatherName: 'Suresh Agarwal', aadhaarLast4: '4532', ownershipType: 'Single', sharePercent: 100, acquisitionDate: '2015-07-22', acquisitionType: 'Inheritance', isCurrentOwner: true },
  { id: 'O003', parcelId: 'P002', name: 'Vikram Agarwal', fatherName: 'Suresh Agarwal', aadhaarLast4: '6691', ownershipType: 'Joint', sharePercent: 50, acquisitionDate: '2019-11-10', acquisitionType: 'Inheritance', isCurrentOwner: false },
  { id: 'O004', parcelId: 'P003', name: 'Kamlesh Yadav', fatherName: 'Ramlal Yadav', aadhaarLast4: '2234', ownershipType: 'Single', sharePercent: 100, acquisitionDate: '2010-04-01', acquisitionType: 'Inheritance', isCurrentOwner: true },
  { id: 'O005', parcelId: 'P004', name: 'Preeti Verma', fatherName: 'Ashok Verma', aadhaarLast4: '8810', ownershipType: 'Joint', sharePercent: 50, acquisitionDate: '2020-09-05', acquisitionType: 'Purchase', isCurrentOwner: true },
  { id: 'O006', parcelId: 'P004', name: 'Deepak Verma', fatherName: 'Ashok Verma', aadhaarLast4: '3340', ownershipType: 'Joint', sharePercent: 50, acquisitionDate: '2020-09-05', acquisitionType: 'Purchase', isCurrentOwner: true },
  { id: 'O007', parcelId: 'P006', name: 'Amanaka Steel Pvt. Ltd.', fatherName: 'N/A', ownershipType: 'Company', sharePercent: 100, acquisitionDate: '2008-02-14', acquisitionType: 'Purchase', isCurrentOwner: true },
  { id: 'O008', parcelId: 'P006', name: 'Prakash Sahu', fatherName: 'Tularam Sahu', aadhaarLast4: '5567', ownershipType: 'Single', sharePercent: 100, acquisitionDate: '2022-01-30', acquisitionType: 'Purchase', isCurrentOwner: false },
  { id: 'O009', parcelId: 'P009', name: 'Dr. Anita Chandrakar', fatherName: 'R.K. Chandrakar', aadhaarLast4: '9921', ownershipType: 'Single', sharePercent: 100, acquisitionDate: '2021-06-18', acquisitionType: 'Purchase', isCurrentOwner: true },
  { id: 'O010', parcelId: 'P015', name: 'Mahesh Patel', fatherName: 'Ramnarayan Patel', aadhaarLast4: '1178', ownershipType: 'Joint', sharePercent: 50, acquisitionDate: '2005-12-01', acquisitionType: 'Inheritance', isCurrentOwner: true },
];

// ---- RoR Records ------------------------------------------

export const ROR_RECORDS: RoRRecord[] = [
  { id: 'R001', parcelId: 'P001', khasraNo: '123/1', area: 971, areaAcres: 0.24, ownerName: 'Ramesh Kumar Sharma', cultivatorName: 'Self', landType: 'Bari (Garden)', lastUpdated: '2024-01-15', khataNo: 'K-4521', khatabiNo: 'KB-789', village: 'Tatibandh', tehsil: 'Raipur', district: 'Raipur', source: 'Bhu-Abhilekh', isVerified: true },
  { id: 'R002', parcelId: 'P002', khasraNo: '124/2', area: 2023, areaAcres: 0.50, ownerName: 'Sunita Agarwal', cultivatorName: 'None', landType: 'Abadi (Settlement)', lastUpdated: '2023-11-20', khataNo: 'K-4522', khatabiNo: 'KB-790', village: 'Tatibandh', tehsil: 'Raipur', district: 'Raipur', source: 'Bhu-Abhilekh', isVerified: true },
  { id: 'R003', parcelId: 'P003', khasraNo: '125/3', area: 4450, areaAcres: 1.10, ownerName: 'Kamlesh Yadav', cultivatorName: 'Kamlesh Yadav', landType: 'Khet (Field)', irrigationSource: 'Borewell', lastUpdated: '2024-02-10', khataNo: 'K-4523', khatabiNo: 'KB-791', village: 'Tatibandh', tehsil: 'Raipur', district: 'Raipur', source: 'Bhu-Abhilekh', isVerified: false },
  { id: 'R004', parcelId: 'P006', khasraNo: '301/1', area: 9712, areaAcres: 2.40, ownerName: 'Amanaka Steel Pvt. Ltd.', landType: 'Industrial', lastUpdated: '2022-08-01', khataNo: 'K-6001', khatabiNo: 'KB-900', village: 'Amanaka', tehsil: 'Raipur', district: 'Raipur', source: 'DILRMP', isVerified: true },
  { id: 'R005', parcelId: 'P015', khasraNo: '602/2', area: 16188, areaAcres: 4.0, ownerName: 'Mahesh Patel & Others', cultivatorName: 'Mahesh Patel', landType: 'Khet (Field)', irrigationSource: 'Canal', lastUpdated: '2023-09-05', khataNo: 'K-8020', khatabiNo: 'KB-1100', village: 'Arang', tehsil: 'Arang', district: 'Raipur', source: 'Bhu-Abhilekh', isVerified: false },
];

// ---- Registrations ----------------------------------------

export const REGISTRATIONS: Registration[] = [
  { id: 'REG001', parcelId: 'P001', documentNo: 'SRO-RJP-2018-004521', registrationDate: '2018-03-15', saleValue: 3500000, stampDuty: 245000, area: 1012, areaAcres: 0.25, sellerName: 'Govind Prasad', buyerName: 'Ramesh Kumar Sharma', propertyType: 'Residential Plot', subRegistrarOffice: 'SRO Raipur Urban-I', status: 'Registered' },
  { id: 'REG002', parcelId: 'P002', documentNo: 'SRO-RJP-2019-008912', registrationDate: '2019-11-10', saleValue: 8200000, stampDuty: 574000, area: 1820, areaAcres: 0.45, sellerName: 'Sunita Agarwal', buyerName: 'Vikram Agarwal', propertyType: 'Commercial Plot', subRegistrarOffice: 'SRO Raipur Urban-I', status: 'Registered' },
  { id: 'REG003', parcelId: 'P004', documentNo: 'SRO-RJP-2020-016782', registrationDate: '2020-09-05', saleValue: 4800000, stampDuty: 336000, area: 1618, areaAcres: 0.40, sellerName: 'Ramkishore Singh', buyerName: 'Preeti & Deepak Verma', propertyType: 'Residential Plot', subRegistrarOffice: 'SRO Raipur Urban-II', status: 'Registered' },
  { id: 'REG004', parcelId: 'P006', documentNo: 'SRO-RJP-2022-003401', registrationDate: '2022-01-30', saleValue: 45000000, stampDuty: 3150000, area: 8500, areaAcres: 2.10, sellerName: 'Amanaka Steel Pvt. Ltd.', buyerName: 'Prakash Sahu', propertyType: 'Industrial Land', subRegistrarOffice: 'SRO Raipur Industrial', status: 'Registered' },
  { id: 'REG005', parcelId: 'P009', documentNo: 'SRO-RJP-2021-019023', registrationDate: '2021-06-18', saleValue: 5200000, stampDuty: 364000, area: 1214, areaAcres: 0.30, sellerName: 'Kishor Chandrakar', buyerName: 'Dr. Anita Chandrakar', propertyType: 'Residential Plot', subRegistrarOffice: 'SRO Raipur Urban-I', status: 'Registered' },
];

// ---- Mutations --------------------------------------------

export const MUTATIONS: Mutation[] = [
  { id: 'M001', parcelId: 'P001', mutationNo: 'MUT-RJP-2018-1001', mutationDate: '2018-04-20', type: 'Sale', previousOwner: 'Govind Prasad', newOwner: 'Ramesh Kumar Sharma', status: 'Approved', approvedBy: 'Tehsildar Raipur', remarks: 'Mutation completed after registration verification.' },
  { id: 'M002', parcelId: 'P002', mutationNo: 'MUT-RJP-2019-2002', mutationDate: '2019-12-15', type: 'Inheritance', previousOwner: 'Late Suresh Agarwal', newOwner: 'Sunita Agarwal', status: 'Approved', approvedBy: 'Tehsildar Raipur' },
  { id: 'M003', parcelId: 'P006', mutationNo: 'MUT-RJP-2022-0301', mutationDate: '2022-03-10', type: 'Sale', previousOwner: 'Amanaka Steel Pvt. Ltd.', newOwner: 'Prakash Sahu', status: 'Pending', remarks: 'Pending due to ownership dispute litigation.' },
  { id: 'M004', parcelId: 'P015', mutationNo: 'MUT-RJP-2023-0801', mutationDate: '2023-10-01', type: 'Partition', previousOwner: 'Ramnarayan Patel Estate', newOwner: 'Mahesh Patel & 3 Others', status: 'Pending', remarks: 'Partition deed under verification. Joint application received.' },
  { id: 'M005', parcelId: 'P004', mutationNo: 'MUT-RJP-2020-1602', mutationDate: '2020-10-01', type: 'Sale', previousOwner: 'Ramkishore Singh', newOwner: 'Preeti Verma & Deepak Verma', status: 'Approved', approvedBy: 'Tehsildar Raipur' },
];

// ---- Zoning Records ---------------------------------------

export const ZONING_RECORDS: ZoningRecord[] = [
  { id: 'Z001', parcelId: 'P001', currentZone: 'R1', masterPlanPhase: 'RDP 2031', landUseDesignation: 'Low Density Residential', fsi: 1.5, maxHeight: 10, setbackFront: 3, setbackSide: 1.5 },
  { id: 'Z002', parcelId: 'P002', currentZone: 'C1', proposedZone: 'MX', masterPlanPhase: 'RDP 2031', landUseDesignation: 'Retail Commercial', fsi: 2.5, maxHeight: 15, setbackFront: 4, setbackSide: 2, remarks: 'Proposed rezoning to Mixed Use in RDP 2041 draft.' },
  { id: 'Z003', parcelId: 'P003', currentZone: 'A1', proposedZone: 'RD', masterPlanPhase: 'RDP 2031', landUseDesignation: 'Agricultural — Under Road Reservation', fsi: 0, maxHeight: 0, setbackFront: 0, setbackSide: 0, roadReservation: true, roadWidth: 30, remarks: 'Proposed road corridor in RDP 2041. Construction prohibited.' },
  { id: 'Z004', parcelId: 'P006', currentZone: 'I1', masterPlanPhase: 'RDP 2031', landUseDesignation: 'General Industrial', fsi: 1.0, maxHeight: 12, setbackFront: 6, setbackSide: 3 },
  { id: 'Z005', parcelId: 'P013', currentZone: 'R1', proposedZone: 'RD', masterPlanPhase: 'RDP 2041', landUseDesignation: 'Under Road Reservation — Ring Road', fsi: 0, maxHeight: 0, setbackFront: 0, setbackSide: 0, roadReservation: true, roadWidth: 45, remarks: 'Ring Road acquisition notified. No development permitted.' },
];

// ---- Building Permissions ---------------------------------

export const BUILDING_PERMISSIONS: BuildingPermission[] = [
  { id: 'BP001', parcelId: 'P001', applicationNo: 'RMC/BP/2019/001245', applicantName: 'Ramesh Kumar Sharma', type: 'New Construction', approvedArea: 120, floors: 2, status: 'Approved', appliedDate: '2019-01-10', approvedDate: '2019-03-15', validUpto: '2024-03-14', authority: 'Raipur Municipal Corporation' },
  { id: 'BP002', parcelId: 'P004', applicationNo: 'RMC/BP/2021/004521', applicantName: 'Deepak Verma', type: 'New Construction', approvedArea: 200, floors: 3, status: 'Pending', appliedDate: '2021-11-20', authority: 'Raipur Municipal Corporation' },
  { id: 'BP003', parcelId: 'P006', applicationNo: 'CGIDCO/BP/2020/000892', applicantName: 'Amanaka Steel Pvt. Ltd.', type: 'Addition', approvedArea: 800, floors: 1, status: 'Approved', appliedDate: '2020-04-01', approvedDate: '2020-07-15', validUpto: '2023-07-14', authority: 'CGIDCO', },
  { id: 'BP004', parcelId: 'P012', applicationNo: 'RMC/BP/2022/008901', applicantName: 'Pacific Developers Pvt. Ltd.', type: 'New Construction', approvedArea: 2400, floors: 5, status: 'Approved', appliedDate: '2022-02-15', approvedDate: '2022-09-10', validUpto: '2025-09-09', authority: 'Raipur Municipal Corporation' },
  { id: 'BP005', parcelId: 'P013', applicationNo: 'RMC/BP/2023/011023', applicantName: 'Shiv Constructions', type: 'New Construction', status: 'Rejected', appliedDate: '2023-05-20', authority: 'Raipur Municipal Corporation' },
];

// ---- Encumbrances -----------------------------------------

export const ENCUMBRANCES: Encumbrance[] = [
  { id: 'E001', parcelId: 'P004', type: 'Mortgage', creditorName: 'State Bank of India', amount: 2500000, startDate: '2020-09-10', endDate: '2030-09-09', status: 'Active', registrationNo: 'SBI-HOME-2020-4521', bankName: 'State Bank of India' },
  { id: 'E002', parcelId: 'P006', type: 'Attachment', creditorName: 'District Court Raipur', startDate: '2022-06-01', status: 'Active', registrationNo: 'DC-RJP-ATTACH-2022-014' },
  { id: 'E003', parcelId: 'P012', type: 'Mortgage', creditorName: 'HDFC Bank Ltd.', amount: 15000000, startDate: '2022-09-15', endDate: '2042-09-14', status: 'Active', registrationNo: 'HDFC-COMM-2022-8901', bankName: 'HDFC Bank Ltd.' },
  { id: 'E004', parcelId: 'P015', type: 'Lien', creditorName: 'Chhattisgarh State Agriculture Board', startDate: '2021-03-01', status: 'Active', registrationNo: 'CSAB-LIEN-2021-3301' },
  { id: 'E005', parcelId: 'P001', type: 'Easement', creditorName: 'CSEB (Electricity Board)', startDate: '2015-01-01', status: 'Active', registrationNo: 'CSEB-EASE-2015-0021' },
];

// ---- Tax Records ------------------------------------------

export const TAX_RECORDS: TaxRecord[] = [
  { id: 'T001', parcelId: 'P001', propertyId: 'RMC-2019-045210', annualValue: 120000, taxDemand: 12000, taxPaid: 12000, taxDue: 0, lastPaymentDate: '2024-03-31', lastPaymentAmount: 12000, financialYear: '2023-24', status: 'Paid', authority: 'Raipur Municipal Corporation' },
  { id: 'T002', parcelId: 'P002', propertyId: 'RMC-2015-089120', annualValue: 280000, taxDemand: 28000, taxPaid: 14000, taxDue: 14000, lastPaymentDate: '2023-10-15', lastPaymentAmount: 14000, financialYear: '2023-24', status: 'Partial', authority: 'Raipur Municipal Corporation' },
  { id: 'T003', parcelId: 'P006', propertyId: 'CGIDCO-2008-000892', annualValue: 850000, taxDemand: 127500, taxPaid: 0, taxDue: 127500, financialYear: '2023-24', status: 'Defaulter', authority: 'CGIDCO / Raipur Municipal Corporation' },
  { id: 'T004', parcelId: 'P009', propertyId: 'RMC-2021-190230', annualValue: 180000, taxDemand: 18000, taxPaid: 18000, taxDue: 0, lastPaymentDate: '2024-02-28', lastPaymentAmount: 18000, financialYear: '2023-24', status: 'Paid', authority: 'Raipur Municipal Corporation' },
  { id: 'T005', parcelId: 'P012', propertyId: 'RMC-2022-089010', annualValue: 420000, taxDemand: 63000, taxPaid: 63000, taxDue: 0, lastPaymentDate: '2024-01-20', lastPaymentAmount: 63000, financialYear: '2023-24', status: 'Paid', authority: 'Raipur Municipal Corporation' },
];

// ---- Litigation -------------------------------------------

export const LITIGATIONS: Litigation[] = [
  { id: 'L001', parcelId: 'P002', caseNo: 'CS-2021-RJP-4521', court: 'Civil Court Raipur', caseType: 'Title Dispute', plaintiff: 'Sunita Agarwal', defendant: 'Vikram Agarwal', filedDate: '2021-03-10', status: 'Active', nextHearingDate: '2024-04-15', summary: 'Dispute over ownership share following inheritance. Plaintiff claims sole ownership; defendant claims 50% share by partition.' },
  { id: 'L002', parcelId: 'P006', caseNo: 'CS-2022-RJP-1014', court: 'District Court Raipur', caseType: 'Sale Deed Challenge', plaintiff: 'Amanaka Steel Pvt. Ltd.', defendant: 'Prakash Sahu', filedDate: '2022-06-01', status: 'Active', nextHearingDate: '2024-05-02', summary: 'Company contests validity of 2022 sale deed, alleging forged signatures and unauthorized representation.' },
  { id: 'L003', parcelId: 'P015', caseNo: 'CS-2023-RJP-0890', court: 'Civil Court Arang', caseType: 'Partition Dispute', plaintiff: 'Mahesh Patel', defendant: 'Suresh Patel & Others', filedDate: '2023-07-20', status: 'Active', nextHearingDate: '2024-04-28', summary: 'Dispute over partition of agricultural land among heirs of Ramnarayan Patel.' },
];

// ---- Environmental Restrictions ---------------------------

export const ENVIRONMENTAL_RESTRICTIONS: EnvironmentalRestriction[] = [
  { id: 'ER001', parcelId: 'P003', type: 'Flood Zone', authority: 'State Disaster Management Authority', description: 'Parcel falls within 100-year flood zone of Kharun River. Construction restricted per SDMA guidelines.', isActive: true, notificationNo: 'SDMA/CG/2019/045' },
  { id: 'ER002', parcelId: 'P013', type: 'No Development Zone', authority: 'Raipur Development Authority', description: 'Parcel falls within proposed Ring Road corridor. Notified under CG Land Acquisition Act.', isActive: true, notificationNo: 'RDA/RING-ROAD/2023/012' },
  { id: 'ER003', parcelId: 'P008', type: 'Airport Zone', authority: 'DGCA / AAI', description: 'Parcel within Airport funnel zone. Height restriction applies per DGCA notification. Max height 6m.', isActive: true, notificationNo: 'DGCA/NAG/2018/078' },
];

// ---- Valuations -------------------------------------------

export const VALUATIONS: Valuation[] = [
  { id: 'V001', parcelId: 'P001', circleRate: 12000, marketValue: 14000, guidanceValue: 12000, valuationDate: '2024-01-01', valuationAuthority: 'Sub-Registrar Raipur', totalValue: 14168000 },
  { id: 'V002', parcelId: 'P002', circleRate: 18000, marketValue: 22000, guidanceValue: 18000, valuationDate: '2024-01-01', valuationAuthority: 'Sub-Registrar Raipur', totalValue: 44506000 },
  { id: 'V003', parcelId: 'P006', circleRate: 8000, marketValue: 10000, guidanceValue: 8000, valuationDate: '2024-01-01', valuationAuthority: 'Sub-Registrar Raipur', totalValue: 97120000 },
  { id: 'V004', parcelId: 'P009', circleRate: 15000, marketValue: 17000, guidanceValue: 15000, valuationDate: '2024-01-01', valuationAuthority: 'Sub-Registrar Raipur', totalValue: 20638000 },
  { id: 'V005', parcelId: 'P012', circleRate: 25000, marketValue: 32000, guidanceValue: 25000, valuationDate: '2024-01-01', valuationAuthority: 'Sub-Registrar Raipur', totalValue: 155392000 },
];

// ---- Satellite Changes ------------------------------------

export const SATELLITE_CHANGES: SatelliteChange[] = [
  { id: 'SC001', parcelId: 'P003', detectedDate: '2024-01-15', changeType: 'Construction Started', confidence: 87, area: 180, requiresVerification: true, verificationStatus: 'Pending' },
  { id: 'SC002', parcelId: 'P006', detectedDate: '2023-11-20', changeType: 'Structure Added', confidence: 92, area: 450, requiresVerification: true, verificationStatus: 'Pending' },
  { id: 'SC003', parcelId: 'P013', detectedDate: '2024-02-08', changeType: 'Vegetation Cleared', confidence: 78, area: 600, requiresVerification: true, verificationStatus: 'Pending' },
  { id: 'SC004', parcelId: 'P015', detectedDate: '2023-12-01', changeType: 'Boundary Shift', confidence: 65, area: 0, requiresVerification: true, verificationStatus: 'Pending' },
  { id: 'SC005', parcelId: 'P008', detectedDate: '2024-02-20', changeType: 'Building Demolished', confidence: 95, area: 120, requiresVerification: true, verificationStatus: 'Verified' },
];

// ---- Conflict Alerts (Land Truth Engine Output) -----------

export const CONFLICT_ALERTS: ConflictAlert[] = [
  {
    id: 'CA001', parcelId: 'P001', alertType: 'area_mismatch', severity: 'high',
    title: 'Area Mismatch: RoR vs Registration',
    description: 'The Record of Rights shows 0.24 acres while the latest registration deed records 0.25 acres. This 4% discrepancy requires field verification.',
    datasetsCompared: ['Bhu-Abhilekh RoR', 'Registration Deed SRO-RJP-2018-004521'],
    values: { 'RoR Area': '0.24 acres (971 sqm)', 'Registration Area': '0.25 acres (1012 sqm)' },
    difference: '41 sqm (4.2%)',
    detectedDate: '2024-02-01',
    status: 'Open',
    recommendedAction: 'Initiate field measurement by Survey Patwari. Compare with original khasra map.'
  },
  {
    id: 'CA002', parcelId: 'P002', alertType: 'ownership_conflict', severity: 'critical',
    title: 'Ownership Conflict: RoR vs Registration',
    description: 'The RoR lists Sunita Agarwal as sole owner. The 2019 registration records Vikram Agarwal as acquiring 50% share. Active litigation exists on this parcel.',
    datasetsCompared: ['Bhu-Abhilekh RoR', 'Registration Deed SRO-RJP-2019-008912', 'District Court Record CS-2021-RJP-4521'],
    values: { 'RoR Owner': 'Sunita Agarwal (100%)', 'Registration': 'Vikram Agarwal (50% share)', 'Court Status': 'Active Litigation' },
    difference: 'Ownership share disputed',
    detectedDate: '2024-01-20',
    status: 'Under Review',
    recommendedAction: 'Freeze mutation until court order. Flag parcel as disputed in all systems.'
  },
  {
    id: 'CA003', parcelId: 'P003', alertType: 'planning_conflict', severity: 'high',
    title: 'Planning Conflict: Agricultural Use vs Proposed Road Corridor',
    description: 'Parcel is classified Agricultural (A1) in current RoR and zoning. The RDP 2041 master plan designates this location as a 30m road corridor. Satellite data also shows construction activity initiated in January 2024.',
    datasetsCompared: ['Bhu-Abhilekh RoR', 'RDA Master Plan 2041', 'Satellite Change Detection'],
    values: { 'Current Use': 'Agricultural (A1)', 'Master Plan': '30m Road Corridor (Road Reservation)', 'Satellite': 'Construction Detected (87% confidence)' },
    detectedDate: '2024-02-01',
    status: 'Open',
    recommendedAction: 'Halt unauthorized construction. Issue notice under CG Land Revenue Code. Alert Planning Department.'
  },
  {
    id: 'CA004', parcelId: 'P006', alertType: 'ownership_conflict', severity: 'critical',
    title: 'Multiple Ownership Claims with Active Attachment',
    description: 'RoR shows Amanaka Steel as owner. 2022 registration transferred to Prakash Sahu. Mutation is pending. Court has attached the property. Sale deed validity is under challenge.',
    datasetsCompared: ['DILRMP RoR', 'Registration SRO-RJP-2022-003401', 'Mutation Record', 'District Court Attachment Order'],
    values: { 'RoR Owner': 'Amanaka Steel Pvt. Ltd.', 'Registration Buyer': 'Prakash Sahu', 'Mutation Status': 'Pending', 'Encumbrance': 'Court Attachment Active' },
    detectedDate: '2022-06-15',
    status: 'Under Review',
    recommendedAction: 'Do not process mutation until court order. Coordinate with District Court Registry.'
  },
  {
    id: 'CA005', parcelId: 'P006', alertType: 'area_mismatch', severity: 'high',
    title: 'Area Mismatch: RoR vs Registration Deed',
    description: 'RoR records 2.40 acres while 2022 registration shows 2.10 acres. 0.30 acre discrepancy may indicate encroachment or illegal sub-division.',
    datasetsCompared: ['DILRMP RoR', 'Registration SRO-RJP-2022-003401'],
    values: { 'RoR Area': '2.40 acres (9712 sqm)', 'Registration Area': '2.10 acres (8500 sqm)' },
    difference: '1212 sqm (12.5%)',
    detectedDate: '2022-02-01',
    status: 'Open',
    recommendedAction: 'Order joint survey by Revenue Inspector and RERA technical team.'
  },
  {
    id: 'CA006', parcelId: 'P006', alertType: 'tax_default', severity: 'high',
    title: 'Property Tax Default — ₹1,27,500 Outstanding',
    description: 'No property tax payment recorded for FY 2023-24. Outstanding demand ₹1,27,500. Multiple ownership disputes may be contributing to non-payment.',
    datasetsCompared: ['Raipur Municipal Corporation Tax System'],
    values: { 'Tax Demand': '₹1,27,500', 'Tax Paid': '₹0', 'Outstanding': '₹1,27,500', 'Financial Year': '2023-24' },
    detectedDate: '2024-03-31',
    status: 'Open',
    recommendedAction: 'Initiate tax recovery proceedings. Coordinate with Revenue Officer for attachment if unpaid by due date.'
  },
  {
    id: 'CA007', parcelId: 'P013', alertType: 'restriction_overlap', severity: 'critical',
    title: 'Construction Attempted in Ring Road Reservation Zone',
    description: 'Building permission application rejected in 2023 due to Ring Road corridor overlap. Satellite data shows vegetation clearance in Feb 2024, suggesting unauthorized activity.',
    datasetsCompared: ['RDA Ring Road Notification RDA/RING-ROAD/2023/012', 'Building Permission Record', 'Satellite Change Detection'],
    values: { 'Restriction': 'Ring Road — No Development Zone', 'BP Status': 'Rejected', 'Satellite': 'Vegetation Cleared (78% confidence)', 'Road Width': '45m corridor' },
    detectedDate: '2024-02-10',
    status: 'Open',
    recommendedAction: 'Issue stop-work notice. Initiate acquisition proceedings if encroachment confirmed. Forward to Planning Enforcement Cell.'
  },
  {
    id: 'CA008', parcelId: 'P015', alertType: 'boundary_discrepancy', severity: 'medium',
    title: 'Possible Boundary Shift Detected',
    description: 'Satellite imagery comparison shows possible boundary shift on eastern edge. Current RoR boundary and GPS coordinates do not match cadastral map alignment.',
    datasetsCompared: ['Bhu-Abhilekh RoR', 'Cadastral Map', 'Satellite Change Detection'],
    values: { 'Satellite Confidence': '65%', 'Detected': 'December 2023', 'Area Affected': 'Eastern boundary' },
    detectedDate: '2024-01-15',
    status: 'Open',
    recommendedAction: 'Order cadastral re-survey. Compare with original settlement records.'
  },
  {
    id: 'CA009', parcelId: 'P008', alertType: 'restriction_overlap', severity: 'medium',
    title: 'Building Demolished in Airport Height Restriction Zone',
    description: 'Previous structure demolished (confirmed by satellite). Any new construction must comply with DGCA height restrictions (max 6m). Ensure re-building application includes DGCA NOC.',
    datasetsCompared: ['DGCA Airport Zone Notification', 'Satellite Change Detection', 'Building Permission Records'],
    values: { 'Restriction Type': 'Airport Funnel Zone', 'Max Height Allowed': '6 meters', 'Satellite': 'Demolition Confirmed' },
    detectedDate: '2024-02-25',
    status: 'Open',
    recommendedAction: 'Any new building application must be pre-cleared by DGCA. Alert RMC building permit section.'
  },
  {
    id: 'CA010', parcelId: 'P002', alertType: 'area_mismatch', severity: 'medium',
    title: 'Tax Assessment Area vs Registration Area Mismatch',
    description: 'Municipal property tax is assessed on 0.50 acres; latest registration shows 0.45 acres transacted. Possible tax over-assessment or partial transfer.',
    datasetsCompared: ['RMC Tax Records', 'Registration Deed SRO-RJP-2019-008912'],
    values: { 'Tax Assessment Area': '0.50 acres', 'Registration Area': '0.45 acres' },
    difference: '0.05 acres',
    detectedDate: '2024-01-25',
    status: 'Open',
    recommendedAction: 'Verify with SRO office. Adjust tax assessment if partial transfer confirmed.'
  },
];

// ---- Service Requests ------------------------------------

export const SERVICE_REQUESTS: ServiceRequest[] = [
  { id: 'SR001', parcelId: 'P001', citizenName: 'Ramesh Kumar Sharma', citizenPhone: '9876543210', type: 'RoR Copy', status: 'Completed', submittedDate: '2024-02-10', expectedDate: '2024-02-17', assignedOfficer: 'Patwari Ramprasad', department: 'Revenue', trackingId: 'TRK-2024-001001', documents: ['Aadhaar', 'Application Form'], remarks: 'Issued on 2024-02-15' },
  { id: 'SR002', parcelId: 'P004', citizenName: 'Deepak Verma', citizenPhone: '8765432109', type: 'Building Plan', status: 'In Progress', submittedDate: '2024-01-25', expectedDate: '2024-03-25', assignedOfficer: 'AE Sunil Kumar', department: 'Municipal Corporation', trackingId: 'TRK-2024-002002', documents: ['Site Plan', 'NOC', 'Structural Drawing', 'Title Documents'] },
  { id: 'SR003', parcelId: 'P009', citizenName: 'Dr. Anita Chandrakar', citizenPhone: '7654321098', type: 'Encumbrance Certificate', status: 'Completed', submittedDate: '2024-02-01', expectedDate: '2024-02-08', assignedOfficer: 'SR Clerk Meena', department: 'Registration', trackingId: 'TRK-2024-003003', documents: ['Application', 'Fees Receipt'] },
  { id: 'SR004', parcelId: 'P006', citizenName: 'Prakash Sahu', citizenPhone: '6543210987', type: 'Mutation', status: 'Pending Documents', submittedDate: '2024-01-10', expectedDate: '2024-03-10', department: 'Revenue', trackingId: 'TRK-2024-004004', documents: ['Registration Deed', 'Application'], remarks: 'Pending court order. Application on hold.' },
  { id: 'SR005', parcelId: 'P015', citizenName: 'Mahesh Patel', citizenPhone: '5432109876', type: 'Land Use Certificate', status: 'Submitted', submittedDate: '2024-03-01', expectedDate: '2024-03-22', department: 'Revenue / Planning', trackingId: 'TRK-2024-005005', documents: ['Application', 'RoR Copy', 'NOC from Gram Panchayat'] },
];

// ---- Workflow Tasks ----------------------------------------

export const WORKFLOW_TASKS: WorkflowTask[] = [
  {
    id: 'W001', parcelId: 'P001', title: 'Verify Area Discrepancy — Tatibandh P001',
    type: 'Field Verification', priority: 'High', status: 'In Progress',
    assignedTo: 'Patwari Ramprasad', assignedDept: 'Revenue',
    createdDate: '2024-02-01', dueDate: '2024-02-15', slaHours: 336, hoursElapsed: 168,
    description: 'Field measurement required. RoR shows 0.24 acres, registration shows 0.25 acres.',
    conflictAlertId: 'CA001',
    evidence: ['RoR Record R001', 'Registration REG001', 'Satellite Image'],
    comments: [
      { id: 'C001', author: 'Revenue Inspector', role: 'Revenue Officer', comment: 'Physical measurement scheduled for 2024-02-12. Drones requested.', timestamp: '2024-02-05T10:30:00Z' }
    ]
  },
  {
    id: 'W002', parcelId: 'P002', title: 'Ownership Dispute — Freeze Mutation P002',
    type: 'Document Review', priority: 'Critical', status: 'Pending Review',
    assignedTo: 'Tehsildar Raipur', assignedDept: 'Revenue',
    createdDate: '2024-01-20', dueDate: '2024-02-05', slaHours: 360, hoursElapsed: 500,
    description: 'Mutation frozen pending court order. Review ownership evidence documents.',
    conflictAlertId: 'CA002',
    evidence: ['RoR Record R002', 'Litigation L001', 'Registration REG002'],
    comments: [
      { id: 'C002', author: 'Tehsildar Raipur', role: 'Revenue Officer', comment: 'Mutation frozen. Court stay order received. Awaiting final judgment.', timestamp: '2024-01-25T14:15:00Z' },
      { id: 'C003', author: 'Legal Section', role: 'Revenue Officer', comment: 'Next hearing 2024-04-15. Case summary filed.', timestamp: '2024-02-01T09:00:00Z' }
    ]
  },
  {
    id: 'W003', parcelId: 'P003', title: 'Unauthorized Construction — Road Reservation Zone P003',
    type: 'Field Verification', priority: 'Critical', status: 'Open',
    assignedTo: 'Revenue Inspector Ajay', assignedDept: 'Revenue',
    createdDate: '2024-02-02', dueDate: '2024-02-09', slaHours: 168, hoursElapsed: 240,
    description: 'Satellite detects construction on parcel designated for road corridor. Immediate verification needed.',
    conflictAlertId: 'CA003',
    evidence: ['Satellite SC001', 'RoR Record R003', 'Master Plan Z003'],
    comments: []
  },
  {
    id: 'W004', parcelId: 'P006', title: 'Complex Dispute Resolution — Amanaka Industrial P006',
    type: 'Conflict Resolution', priority: 'Critical', status: 'In Progress',
    assignedTo: 'District Collector Raipur', assignedDept: 'District Administration',
    createdDate: '2022-06-15', dueDate: '2024-06-15', slaHours: 17520, hoursElapsed: 14400,
    description: 'Complex multi-party dispute involving ownership, area discrepancy, court attachment, and tax default.',
    conflictAlertId: 'CA004',
    evidence: ['RoR R004', 'Litigation L002', 'Encumbrance E002', 'Tax T003'],
    comments: [
      { id: 'C004', author: 'Collector Office', role: 'District Admin', comment: 'Inter-departmental coordination meeting scheduled. Revenue, Registration, Municipal, Court.', timestamp: '2023-06-01T11:00:00Z' }
    ]
  },
];

// ---- Audit Logs -------------------------------------------

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'AL001', timestamp: '2024-03-01T09:15:00Z', userId: 'U004', userName: 'Revenue Insp. Suresh', userRole: 'revenue_officer', action: 'Viewed Parcel', entityType: 'Parcel', entityId: 'P001', parcelId: 'P001', details: 'Accessed Parcel 360 for conflict review.', ipAddress: '10.1.4.22', department: 'Revenue' },
  { id: 'AL002', timestamp: '2024-03-01T09:20:00Z', userId: 'U004', userName: 'Revenue Insp. Suresh', userRole: 'revenue_officer', action: 'Created Workflow Task', entityType: 'Workflow', entityId: 'W001', parcelId: 'P001', details: 'Created field verification task for area discrepancy.', ipAddress: '10.1.4.22', department: 'Revenue' },
  { id: 'AL003', timestamp: '2024-03-01T10:00:00Z', userId: 'U002', userName: 'Planning Off. Rani', userRole: 'planning_officer', action: 'Updated Workflow Status', entityType: 'Workflow', entityId: 'W003', parcelId: 'P003', details: 'Changed status from Open to In Progress. Field team dispatched.', ipAddress: '10.1.3.15', department: 'Planning' },
  { id: 'AL004', timestamp: '2024-03-01T11:30:00Z', userId: 'U006', userName: 'Citizen: Ramesh Sharma', userRole: 'citizen', action: 'Submitted Service Request', entityType: 'Parcel', entityId: 'P001', parcelId: 'P001', details: 'Submitted RoR Copy request. Tracking ID: TRK-2024-001001.', ipAddress: '202.88.45.12' },
  { id: 'AL005', timestamp: '2024-03-01T14:00:00Z', userId: 'U001', userName: 'Admin: Priya Gupta', userRole: 'system_admin', action: 'Updated Dataset Metadata', entityType: 'Dataset', entityId: 'DS003', details: 'Updated last-sync timestamp for DORIS Registration dataset.', ipAddress: '10.1.1.1', department: 'IT' },
  { id: 'AL006', timestamp: '2024-03-02T09:00:00Z', userId: 'U005', userName: 'Dist. Admin: R.K. Sharma', userRole: 'district_admin', action: 'Escalated Workflow', entityType: 'Workflow', entityId: 'W004', parcelId: 'P006', details: 'Escalated Amanaka dispute to Collector level.', ipAddress: '10.1.5.30', department: 'District Administration' },
  { id: 'AL007', timestamp: '2024-03-02T10:15:00Z', userId: 'U003', userName: 'Reg. Off. Meena', userRole: 'registration_officer', action: 'Verified Registration', entityType: 'Registration', entityId: 'REG001', parcelId: 'P001', details: 'Cross-verified registration deed with RoR. Area discrepancy flagged.', ipAddress: '10.1.2.8', department: 'Registration' },
  { id: 'AL008', timestamp: '2024-03-02T15:45:00Z', userId: 'U004', userName: 'Revenue Insp. Suresh', userRole: 'revenue_officer', action: 'Viewed RoR', entityType: 'RoR', entityId: 'R004', parcelId: 'P006', details: 'Accessed RoR for Amanaka Industrial parcel for dispute review.', ipAddress: '10.1.4.22', department: 'Revenue' },
];

// ---- Data Sources -----------------------------------------

export const DATA_SOURCES: DataSource[] = [
  { id: 'DS001', name: 'Bhu-Abhilekh', shortName: 'BHU', department: 'Board of Revenue, Chhattisgarh', ministry: 'Revenue & Disaster Management', dataset: 'Record of Rights (RoR / B1 Extract)', description: 'State land records portal — digitized khasra, khatauni, B1 records.', lastSynced: '2024-03-01T06:00:00Z', recordCount: 8900000, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '3.2', dataFreshnessDays: 1, coverageArea: 'All Districts, Chhattisgarh' },
  { id: 'DS002', name: 'Bhu-Naksha', shortName: 'BNAKSHA', department: 'Department of Land Resources (DoLR)', ministry: 'Rural Development', dataset: 'Cadastral Parcel Boundaries (GIS)', description: 'Digital cadastral maps — parcel boundaries, survey numbers.', lastSynced: '2024-02-15T08:00:00Z', recordCount: 12500000, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '2.1', dataFreshnessDays: 30, coverageArea: 'All Districts, Chhattisgarh' },
  { id: 'DS003', name: 'DORIS', shortName: 'DORIS', department: 'Registration Department, CG', ministry: 'Revenue & Disaster Management', dataset: 'Property Registrations & Deeds', description: 'Document Registration Information System — sale deeds, mortgages, gift deeds.', lastSynced: '2024-03-01T00:00:00Z', recordCount: 4200000, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '4.0', dataFreshnessDays: 1, coverageArea: 'All Sub-Registrar Offices, Chhattisgarh' },
  { id: 'DS004', name: 'RDA Master Plan', shortName: 'RDA', department: 'Raipur Development Authority', ministry: 'Urban Administration & Development', dataset: 'Raipur Development Plan 2031/2041', description: 'Urban master plan zoning, land use designations, road reservations.', lastSynced: '2024-01-01T00:00:00Z', recordCount: 125000, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '1.5', dataFreshnessDays: 90, coverageArea: 'Raipur Urban Area' },
  { id: 'DS005', name: 'RMC Property Tax', shortName: 'RMC-TAX', department: 'Raipur Municipal Corporation', ministry: 'Urban Administration & Development', dataset: 'Property Tax Assessment & Payment Records', description: 'Municipal property tax demand, payment, and defaulter data.', lastSynced: '2024-03-01T00:00:00Z', recordCount: 320000, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '2.3', dataFreshnessDays: 1, coverageArea: 'Raipur Municipal Area' },
  { id: 'DS006', name: 'CERSAI', shortName: 'CERSAI', department: 'CERSAI (Central Registry)', ministry: 'Finance', dataset: 'Mortgage / Encumbrance Records', description: 'Central repository of security interests — mortgages, charges, liens.', lastSynced: '2024-02-28T00:00:00Z', recordCount: 85000000, status: 'Simulated', apiStatus: 'Planned', schemaVersion: '3.0', dataFreshnessDays: 7, coverageArea: 'National' },
  { id: 'DS007', name: 'ISRO Bhuvan Satellite', shortName: 'BHUVAN', department: 'ISRO / National Remote Sensing Centre', ministry: 'Space', dataset: 'Satellite Imagery & Change Detection', description: 'Bi-annual land use change detection using Resourcesat-2A imagery.', lastSynced: '2024-02-20T00:00:00Z', recordCount: 0, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '1.0', dataFreshnessDays: 180, coverageArea: 'National' },
  { id: 'DS008', name: 'DGCA Airport Zones', shortName: 'DGCA', department: 'DGCA / Airports Authority of India', ministry: 'Civil Aviation', dataset: 'Airport Obstacle Limitation Surfaces', description: 'Height restriction zones and no-build areas around airports.', lastSynced: '2023-04-01T00:00:00Z', recordCount: 850, status: 'Simulated', apiStatus: 'Planned', schemaVersion: '1.0', dataFreshnessDays: 365, coverageArea: 'National' },
  { id: 'DS009', name: 'District Court Registry', shortName: 'COURT', department: 'District Court Raipur', ministry: 'Law & Justice', dataset: 'Litigation & Property Dispute Records', description: 'Court cases involving land title disputes, attachment orders, injunctions.', lastSynced: '2024-02-29T00:00:00Z', recordCount: 28000, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '1.2', dataFreshnessDays: 7, coverageArea: 'Raipur District' },
  { id: 'DS010', name: 'ULPIN Registry', shortName: 'ULPIN', department: 'DoLR / NIC', ministry: 'Rural Development', dataset: 'Unique Land Parcel Identification Numbers', description: 'National ULPIN registry mapping unique 14-digit parcel identifiers.', lastSynced: '2024-01-15T00:00:00Z', recordCount: 630000000, status: 'Simulated', apiStatus: 'Demo Connector', schemaVersion: '2.0', dataFreshnessDays: 30, coverageArea: 'National' },
];

// ---- District Analytics -----------------------------------

export const DISTRICT_ANALYTICS = {
  totalParcels: 8900000,
  verifiedParcels: 6230000,
  conflictParcels: 124000,
  pendingMutations: 42300,
  pendingServices: 18900,
  disputedParcels: 8700,
  potentialChanges: 3200,
  buildingApprovals: 5600,
  taxDefaulters: 28000,
  dataQualityScore: 74,
};

export const MONTHLY_MUTATIONS = [
  { month: 'Apr', count: 3200 }, { month: 'May', count: 2900 }, { month: 'Jun', count: 3400 },
  { month: 'Jul', count: 2800 }, { month: 'Aug', count: 3100 }, { month: 'Sep', count: 3600 },
  { month: 'Oct', count: 4200 }, { month: 'Nov', count: 3800 }, { month: 'Dec', count: 3200 },
  { month: 'Jan', count: 3900 }, { month: 'Feb', count: 4100 }, { month: 'Mar', count: 4400 },
];

export const CONFLICTS_BY_TYPE = [
  { type: 'Area Mismatch', count: 38200 },
  { type: 'Ownership Conflict', count: 29100 },
  { type: 'Planning Conflict', count: 21400 },
  { type: 'Tax Anomaly', count: 18700 },
  { type: 'Restriction Overlap', count: 9800 },
  { type: 'Boundary Discrepancy', count: 6800 },
];

export const LAND_USE_DISTRIBUTION = [
  { use: 'Residential', area: 38, color: '#3B82F6' },
  { use: 'Agricultural', area: 28, color: '#10B981' },
  { use: 'Commercial', area: 14, color: '#F59E0B' },
  { use: 'Industrial', area: 8, color: '#6366F1' },
  { use: 'Government', area: 7, color: '#8B5CF6' },
  { use: 'Mixed/Other', area: 5, color: '#EC4899' },
];

export const WORKFLOW_STATUS_DATA = [
  { status: 'Open', count: 4820, color: '#EF4444' },
  { status: 'In Progress', count: 6140, color: '#F59E0B' },
  { status: 'Pending Review', count: 2890, color: '#6366F1' },
  { status: 'Resolved', count: 18200, color: '#10B981' },
];
