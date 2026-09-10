import type { Building, VerticalProperty, Floor, PropertyType, PropertyStatus, ValidationConflict, AuditLogEntry } from '../types/cadastral';

const PARCEL_CENTER = { lon: 77.50426, lat: 13.06746 };

const LAT_M = 111320;
const LON_M = 111320 * Math.cos((PARCEL_CENTER.lat * Math.PI) / 180);

const ROT_RAD = (25 * Math.PI) / 180;
const cosR = Math.cos(ROT_RAD);
const sinR = Math.sin(ROT_RAD);

const rot = (dx: number, dy: number): [number, number] => [
  PARCEL_CENTER.lon + (dx * cosR - dy * sinR) / LON_M,
  PARCEL_CENTER.lat + (dx * sinR + dy * cosR) / LAT_M,
];

const HALF_W = 75; // 150m campus width
const HALF_H = 45; // 90m campus depth

export const footprint: [number, number][] = [
  rot(-HALF_W, -HALF_H),
  rot(HALF_W, -HALF_H),
  rot(HALF_W, HALF_H),
  rot(-HALF_W, HALF_H),
];

export const footprintArea = 150 * 90; // 13,500 m²


const floorDefs: Omit<Floor, 'id'>[] = [
  { label: 'Sub-Basement — Geotechnical Vaults & Structural Testing', shortLabel: 'B2', zMin: -6, zMax: -3, floorNumber: -2, isUnderground: true },
  { label: 'Basement Parking & High-Voltage Campus Substation', shortLabel: 'B1', zMin: -3, zMax: 0, floorNumber: -1, isUnderground: true },
  { label: 'Ground Floor — Ceremonial Grand Portico & Senate Plaza', shortLabel: 'GF', zMin: 0, zMax: 3.6, floorNumber: 0, isUnderground: false },
  { label: 'Floor 1 — Grand Chancellor Auditorium & Senate Chamber', shortLabel: 'F1', zMin: 3.6, zMax: 7.2, floorNumber: 1, isUnderground: false },
  { label: 'Floor 2 — School of Computer Science & Artificial Intelligence', shortLabel: 'F2', zMin: 7.2, zMax: 10.8, floorNumber: 2, isUnderground: false },
  { label: 'Floor 3 — Advanced Robotics, IoT & Autonomous Systems Labs', shortLabel: 'F3', zMin: 10.8, zMax: 14.4, floorNumber: 3, isUnderground: false },
  { label: 'Floor 4 — Central Academic Library & Digital Twin Research Wing', shortLabel: 'F4', zMin: 14.4, zMax: 18.0, floorNumber: 4, isUnderground: false },
  { label: 'Floor 5 — School of Electronics & VLSI Systems Design', shortLabel: 'F5', zMin: 18.0, zMax: 21.6, floorNumber: 5, isUnderground: false },
  { label: 'Floor 6 — Biotechnology & Biomedical Innovation Hub', shortLabel: 'F6', zMin: 21.6, zMax: 25.2, floorNumber: 6, isUnderground: false },
  { label: 'Floor 7 — Postgraduate Studies & Doctoral Scholars Suites', shortLabel: 'F7', zMin: 25.2, zMax: 28.8, floorNumber: 7, isUnderground: false },
  { label: 'Floor 8 — School of Management & Commerce Executive Wing', shortLabel: 'F8', zMin: 28.8, zMax: 32.4, floorNumber: 8, isUnderground: false },
  { label: 'Floor 9 — School of Law, Governance & Public Policy', shortLabel: 'F9', zMin: 32.4, zMax: 36.0, floorNumber: 9, isUnderground: false },
  { label: 'Floor 10 — Academic Council Chamber & Innovation Incubator', shortLabel: 'F10', zMin: 36.0, zMax: 39.6, floorNumber: 10, isUnderground: false },
  { label: 'Floor 11 — Chancellor & Vice-Chancellor Executive Secretariat', shortLabel: 'F11', zMin: 39.6, zMax: 43.2, floorNumber: 11, isUnderground: false },
  { label: 'Floor 12 — Rooftop Astronomical Observatory & Heritage Clock Pavilion', shortLabel: 'F12', zMin: 43.2, zMax: 48.0, floorNumber: 12, isUnderground: false },
];

const floors: Floor[] = floorDefs.map((f) => ({
  ...f,
  id: `SNPSU-${f.shortLabel}`,
}));

export const demoBuilding: Building = {
  id: 'BLDG-BLR-021',
  name: 'Sapthagiri NPS University — Main Academic Palace & Senate Complex',
  parcelId: 'PARCEL-KA-BLR-SNPSU-021',
  ulpin: 'ULPIN-IN-KA-2026-SNPSU01',
  footprint,
  footprintArea,
  center: PARCEL_CENTER,
  floors,
};

const propertyTypes: Record<number, PropertyType> = {
  [-2]: 'Utility',
  [-1]: 'Parking',
  0: 'Institutional' as PropertyType,
  1: 'Auditorium' as PropertyType,
  2: 'Research Lab' as PropertyType,
  3: 'Research Lab' as PropertyType,
  4: 'Academic' as PropertyType,
  5: 'Research Lab' as PropertyType,
  6: 'Research Lab' as PropertyType,
  7: 'Academic' as PropertyType,
  8: 'Commercial' as PropertyType,
  9: 'Academic' as PropertyType,
  10: 'Institutional' as PropertyType,
  11: 'Commercial' as PropertyType,
  12: 'Institutional' as PropertyType,
};

const statusByFloor: Record<number, PropertyStatus> = {
  [-2]: 'valid',
  [-1]: 'valid',
  0: 'valid',
  1: 'valid',
  2: 'valid',
  3: 'valid',
  4: 'valid',
  5: 'valid',
  6: 'valid',
  7: 'valid',
  8: 'valid',
  9: 'valid',
  10: 'valid',
  11: 'valid',
  12: 'valid',
};

const confidenceByFloor: Record<number, number> = {
  [-2]: 0.98,
  [-1]: 0.99,
  0: 0.99,
  1: 0.99,
  2: 0.99,
  3: 0.99,
  4: 0.99,
  5: 0.98,
  6: 0.98,
  7: 0.99,
  8: 0.99,
  9: 0.99,
  10: 0.99,
  11: 0.99,
  12: 0.99,
};

const ownersByFloor: Record<number, string> = {
  [-2]: 'Sapthagiri NPS University Trust (Infrastructure Wing)',
  [-1]: 'Sapthagiri NPS University Campus Management',
  0: 'Sapthagiri NPS University — Academic Senate',
  1: 'Sapthagiri NPS University — Chancellor Auditorium',
  2: 'School of Computer Science & AI (Dept Head)',
  3: 'Dept of Robotics & Autonomous Systems',
  4: 'Sapthagiri Central Academic Library Board',
  5: 'School of Electronics & VLSI Design',
  6: 'Dept of Biotechnology & Biomedical Sciences',
  7: 'School of Postgraduate & Doctoral Research',
  8: 'School of Management & Commerce',
  9: 'School of Law & Public Policy',
  10: 'Academic Council & Innovations Board',
  11: 'Office of the Chancellor & Vice-Chancellor',
  12: 'Sapthagiri University Heritage & Observatories Board',
};


function vpidFor(floor: Floor): string {
  return `VP-SNPSU-${floor.shortLabel}`;
}

export const demoProperties: VerticalProperty[] = demoBuilding.floors.map((floor: Floor) => {
  const height = floor.zMax - floor.zMin;
  const volume = footprintArea * height;
  return {
    vpid: vpidFor(floor),
    ulpin: demoBuilding.ulpin,
    parcelId: demoBuilding.parcelId,
    buildingId: demoBuilding.id,
    floorId: floor.id,
    floorNumber: floor.floorNumber,
    floorLabel: floor.label,
    propertyType: propertyTypes[floor.floorNumber] ?? 'Academic' as PropertyType,
    zMin: floor.zMin,
    zMax: floor.zMax,
    height,
    area: footprintArea,
    volume,
    confidence: confidenceByFloor[floor.floorNumber] ?? 0.99,
    status: statusByFloor[floor.floorNumber] ?? 'valid',
    isUnderground: floor.isUnderground,
    ownerName: ownersByFloor[floor.floorNumber] ?? 'Sapthagiri NPS University Trust',
    registrationDate: '2025-11-14',
    documentRef: `DOC-2026-SNPSU-${floor.shortLabel}`,
  };
});

export const demoParcels: any[] = [
  {
    id: 'PARCEL-KA-BLR-8942',
    ulpin: 'ULPIN-IN-MH-2026-89421',
    area: 1250,
    geometry: footprint,
    status: 'warning',
    buildingCount: 1,
    dataSource: 'Survey of India CORS GNSS',
    confidence: 0.98,
    landUse: 'Mixed Use Commercial / Residential',
    ownerName: 'VOLU Tower Management & Private Allottees',
    registrationDate: '2024-03-15',
  },
  {
    id: 'PARCEL-KA-BLR-8943',
    ulpin: 'ULPIN-IN-KA-2026-98121',
    area: 980,
    geometry: [
      [77.5955, 12.9717],
      [77.5961, 12.9717],
      [77.5961, 12.9721],
      [77.5955, 12.9721],
    ],
    status: 'valid',
    buildingCount: 1,
    dataSource: 'Drone High-Res Photogrammetry',
    confidence: 0.95,
    landUse: 'Commercial High-Rise',
    ownerName: 'Vittal Mallya Realty Trust',
    registrationDate: '2023-11-20',
  },
];

export const demoUndergroundAssets: any[] = [
  {
    id: 'UND-ASSET-01',
    name: 'VOLU Basement Level 2 Parking & Utility',
    assetType: 'Basement',
    zMin: -6,
    zMax: -3,
    depth: 6,
    parcelId: 'PARCEL-KA-BLR-8942',
    ulpin: 'ULPIN-IN-MH-2026-89421',
    status: 'valid',
  },
  {
    id: 'UND-ASSET-02',
    name: 'Municipal High-Voltage Utility Tunnel',
    assetType: 'Utility Tunnel',
    zMin: -6.5,
    zMax: -3.5,
    depth: 6.5,
    parcelId: 'PARCEL-KA-BLR-8942',
    ulpin: 'ULPIN-IN-MH-2026-89421',
    status: 'conflict',
  },
  {
    id: 'UND-ASSET-03',
    name: 'Sub-surface Fiber & Sewer Main',
    assetType: 'Substation',
    zMin: -9,
    zMax: -6.5,
    depth: 9,
    parcelId: 'PARCEL-KA-BLR-8942',
    ulpin: 'ULPIN-IN-MH-2026-89421',
    status: 'valid',
  },
];

export const demoDocuments: any[] = [
  {
    id: 'DOC-2026-001',
    documentType: 'Registered Sale Deed (Vertical Partition)',
    documentName: 'Deed_KA_BLR_2026_F4_Residential.pdf',
    uploadedAt: '2026-09-01 14:30',
    extractedUlpin: 'ULPIN-IN-MH-2026-89421',
    extractedVpid: 'VP-001-B01-F4',
    overallStatus: 'MISMATCH',
    fields: [
      { fieldName: 'ULPIN', documentValue: 'ULPIN-IN-MH-2026-89421', databaseValue: 'ULPIN-IN-MH-2026-89421', status: 'MATCH' },
      { fieldName: 'VPID', documentValue: 'VP-001-B01-F4', databaseValue: 'VP-001-B01-F4', status: 'MATCH' },
      { fieldName: 'Floor Level', documentValue: 'Floor 4 (Residential)', databaseValue: 'Floor 4 (Residential)', status: 'MATCH' },
      { fieldName: 'Elevational Extent (Z-Min to Z-Max)', documentValue: 'Z = 13.0m to 17.5m (4.5m height)', databaseValue: 'Z = 14.0m to 17.5m (3.5m height)', status: 'MISMATCH' },
      { fieldName: 'Footprint Area', documentValue: '720 m²', databaseValue: '720 m²', status: 'MATCH' },
      { fieldName: 'Volumetric Volume', documentValue: '3,240 m³', databaseValue: '2,520 m³', status: 'MISMATCH' },
    ],
  },
];

export const demoPropertyPassports: any[] = [
  {
    vpid: 'VP-001-B01-F4',
    ulpin: 'ULPIN-IN-MH-2026-89421',
    parcelId: 'PARCEL-KA-BLR-8942',
    buildingId: 'B-001',
    floorId: 'B-001-F4',
    floorNumber: 4,
    propertyType: 'Residential',
    area: 720,
    zMin: 14,
    zMax: 17.5,
    volume: 2520,
    dataSource: 'Survey of India 3D Cadastral Registry',
    confidence: 0.96,
    validationStatus: 'conflict',
    verificationDate: '2026-09-04',
    verificationHash: '0x8f7c92a1b4e36d901f4a9b',
    ownerName: 'Rajesh & Sunita Sharma',
  },
  {
    vpid: 'VP-001-B01-GF',
    ulpin: 'ULPIN-IN-MH-2026-89421',
    parcelId: 'PARCEL-KA-BLR-8942',
    buildingId: 'B-001',
    floorId: 'B-001-GF',
    floorNumber: 0,
    propertyType: 'Commercial',
    area: 720,
    zMin: 0,
    zMax: 3.5,
    volume: 2520,
    dataSource: 'State High-Precision Survey',
    confidence: 0.99,
    validationStatus: 'valid',
    verificationDate: '2026-09-02',
    verificationHash: '0x1a2b3c4d5e6f7a8b9c0d1e',
    ownerName: 'NEXUS Retail Ventures Ltd.',
  },
];

export const demoEmergencyBuildings: any[] = [
  {
    buildingId: 'B-001',
    buildingName: 'VOLU Tower A1 (Commercial & Residential)',
    ulpin: 'ULPIN-IN-MH-2026-89421',
    floorCount: 8,
    hasBasement: true,
    undergroundAccess: 'South Utility Ramp & East Basement Stairs',
    estimatedOccupancy: 420,
    priority: 'HIGH',
    status: 'STABLE',
  },
];

export const demoConflicts: ValidationConflict[] = [
  {
    id: 'CONF-DEMO-1M',
    type: 'VOLUME_OVERLAP',
    severity: 'HIGH',
    vpid: 'VP-001-B01-F2',
    targetVpid: 'VP-001-B01-F3',
    buildingId: 'B-001',
    description: 'Deterministic 3D Spatial Conflict: Floor 2 volume (Z=6.0m to 10.0m) overlaps with Floor 3 volume (Z=9.0m to 13.0m) by exactly 1.0 meter!',
    locationZ: { min: 9.0, max: 10.0 },
    overlapMeters: 1.0,
    resolved: false,
    status: 'OPEN',
  },
  {
    id: 'CONF-PARCEL-OUTSIDE',
    type: 'PARCEL_ENCROACHMENT',
    severity: 'HIGH',
    vpid: 'VP-001-B01-GF',
    buildingId: 'B-001',
    description: 'Geometric Validation Failure: Building footprint boundary extends 0.85 meters beyond Parcel PARCEL-KA-BLR-8942 property boundary onto public roadway corridor.',
    locationZ: { min: 0, max: 3.5 },
    overlapMeters: 0.85,
    resolved: false,
    status: 'OPEN',
  },
  {
    id: 'CONF-002',
    type: 'FLOOR_GAP',
    severity: 'MEDIUM',
    vpid: 'VP-001-B01-F2',
    buildingId: 'B-001',
    description: 'Unmapped spatial Z-gap (0.4m) identified between Floor 2 ceiling and Floor 3 floor slab.',
    locationZ: { min: 7, max: 10.5 },
    overlapMeters: 0.4,
    resolved: false,
    status: 'OPEN',
  },
  {
    id: 'CONF-003',
    type: 'UNDERGROUND_COLLISION',
    severity: 'HIGH',
    vpid: 'VP-001-B01-B2',
    buildingId: 'B-001',
    description: 'Sub-surface Z-Min (-6.0m) encroaches upon municipal high-voltage power conduit zone.',
    locationZ: { min: -6.0, max: -3.0 },
    overlapMeters: 0.5,
    resolved: false,
    status: 'OPEN',
  },
];

export const demoAuditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-1092',
    timestamp: '2026-08-31 18:42:10',
    userRole: 'ADMIN',
    action: 'SYSTEM_INITIALIZATION',
    targetId: 'SYSTEM',
    details: 'COSMOPLOT 3D Cadastral Spatial Engine initialized with Cesium globe.',
  },
  {
    id: 'LOG-1093',
    timestamp: '2026-08-31 19:15:33',
    userRole: 'SURVEY_OFFICER',
    action: 'VPID_GENERATION',
    targetId: 'VP-001-B01-F4',
    details: 'Generated prototype 3D Vertical Property ID for Floor 4.',
  },
  {
    id: 'LOG-1094',
    timestamp: '2026-08-31 20:02:44',
    userRole: 'VERIFICATION_OFFICER',
    action: '3D_TOPOLOGY_VALIDATION',
    targetId: 'PARCEL-KA-BLR-8942',
    details: 'Ran 3D spatial topology rules: 1.0m Overlap conflict detected, 1 Underground collision identified.',
  },
  {
    id: 'LOG-1095',
    timestamp: '2026-08-31 21:30:00',
    userRole: 'VIEWER',
    action: 'PASSPORT_QUERY',
    targetId: 'VP-001-B01-GF',
    details: 'Public Digital Property Passport queried for Ground Floor Commercial.',
  },
];

export interface CityBuildingData {
  id: string;
  name: string;
  ulpin: string;
  center: { lat: number; lon: number };
  width: number;
  depth: number;
  height: number;
  floors: number;
  valuation: string;
  ownerName: string;
  propertyType: string;
}

export const SURROUNDING_CITY_BUILDINGS: CityBuildingData[] = [
  // Institutional Campus Twin
  { id: 'sapthagiri-nps-univ-b1', name: 'Sapthagiri NPS University (Main Academic Palace & Senate)', ulpin: 'ULPIN-IN-KA-2026-98124', center: { lat: 13.0645, lon: 77.5029 }, width: 110, depth: 45, height: 45, floors: 10, valuation: '₹185,00,00,000', ownerName: 'Sri Srinivasa Educational Trust / NPS', propertyType: 'Institutional' },

  // Commercial & Major High-Rise Towers
  { id: 'B-002', name: 'UB City Commercial Tower B', ulpin: 'ULPIN-IN-KA-2026-98121', center: { lat: 12.9719, lon: 77.5958 }, width: 28, depth: 22, height: 42, floors: 12, valuation: '₹14,50,00,000', ownerName: 'Vittal Mallya Realty Trust', propertyType: 'Commercial' },
  { id: 'B-003', name: 'Prestige Meridian Tower A', ulpin: 'ULPIN-IN-KA-2026-98122', center: { lat: 12.9725, lon: 77.5938 }, width: 24, depth: 26, height: 36, floors: 10, valuation: '₹9,80,00,000', ownerName: 'Prestige Estates Projects Ltd.', propertyType: 'Office' },
  { id: 'B-004', name: 'Concorde Innovation Block 3', ulpin: 'ULPIN-IN-KA-2026-98123', center: { lat: 12.9710, lon: 77.5935 }, width: 30, depth: 20, height: 30, floors: 8, valuation: '₹7,20,00,000', ownerName: 'Concorde Group Infra', propertyType: 'Mixed Use' },
  { id: 'B-005', name: 'Garuda Retail & Corporate Center', ulpin: 'ULPIN-IN-KA-2026-98124', center: { lat: 12.9705, lon: 77.5952 }, width: 26, depth: 24, height: 28, floors: 7, valuation: '₹6,50,00,000', ownerName: 'Garuda Commercial Holdings', propertyType: 'Commercial' },
  { id: 'B-006', name: 'Vittal Mallya Executive Hub', ulpin: 'ULPIN-IN-KA-2026-98125', center: { lat: 12.9730, lon: 77.5950 }, width: 22, depth: 28, height: 38, floors: 11, valuation: '₹11,20,00,000', ownerName: 'UB Global Investments', propertyType: 'Office' },
  { id: 'B-007', name: 'Residency Plaza East Wing', ulpin: 'ULPIN-IN-KA-2026-98126', center: { lat: 12.9722, lon: 77.5965 }, width: 32, depth: 18, height: 32, floors: 9, valuation: '₹8,40,00,000', ownerName: 'State Land Revenue Board', propertyType: 'Mixed Use' },
  { id: 'B-008', name: 'Kanteerava Executive Suites', ulpin: 'ULPIN-IN-KA-2026-98127', center: { lat: 12.9702, lon: 77.5960 }, width: 25, depth: 25, height: 26, floors: 7, valuation: '₹5,90,00,000', ownerName: 'Karnataka Housing Board', propertyType: 'Residential' },

  // Residential Neighborhood Blocks & Urban Parcel Buildings (Sector South & East)
  { id: 'B-010', name: 'Residency Block A1', ulpin: 'ULPIN-IN-KA-2026-98130', center: { lat: 12.9712, lon: 77.5950 }, width: 16, depth: 14, height: 16, floors: 4, valuation: '₹2,40,00,000', ownerName: 'Ramesh Naidu', propertyType: 'Residential' },
  { id: 'B-011', name: 'Residency Block A2', ulpin: 'ULPIN-IN-KA-2026-98131', center: { lat: 12.9712, lon: 77.5953 }, width: 18, depth: 15, height: 18, floors: 5, valuation: '₹2,80,00,000', ownerName: 'Kavita Gowda', propertyType: 'Residential' },
  { id: 'B-012', name: 'Residency Block A3', ulpin: 'ULPIN-IN-KA-2026-98132', center: { lat: 12.9712, lon: 77.5956 }, width: 15, depth: 16, height: 15, floors: 4, valuation: '₹2,30,00,000', ownerName: 'Suresh Kumar', propertyType: 'Residential' },
  { id: 'B-013', name: 'Residency Block A4', ulpin: 'ULPIN-IN-KA-2026-98133', center: { lat: 12.9712, lon: 77.5959 }, width: 17, depth: 14, height: 17, floors: 4, valuation: '₹2,60,00,000', ownerName: 'Meena Rao', propertyType: 'Residential' },

  { id: 'B-014', name: 'Metro View Apartments B1', ulpin: 'ULPIN-IN-KA-2026-98134', center: { lat: 12.9708, lon: 77.5948 }, width: 20, depth: 16, height: 22, floors: 6, valuation: '₹3,90,00,000', ownerName: 'Metro Urban Co-op Society', propertyType: 'Residential' },
  { id: 'B-015', name: 'Metro View Apartments B2', ulpin: 'ULPIN-IN-KA-2026-98135', center: { lat: 12.9708, lon: 77.5952 }, width: 19, depth: 18, height: 24, floors: 6, valuation: '₹4,10,00,000', ownerName: 'Prakash Hegde', propertyType: 'Residential' },
  { id: 'B-016', name: 'Metro View Apartments B3', ulpin: 'ULPIN-IN-KA-2026-98136', center: { lat: 12.9708, lon: 77.5956 }, width: 22, depth: 16, height: 20, floors: 5, valuation: '₹3,60,00,000', ownerName: 'Sunil Varma', propertyType: 'Residential' },

  { id: 'B-017', name: 'Richmond Heights Block C1', ulpin: 'ULPIN-IN-KA-2026-98137', center: { lat: 12.9704, lon: 77.5946 }, width: 18, depth: 14, height: 18, floors: 5, valuation: '₹2,90,00,000', ownerName: 'Deepak & Smita Patel', propertyType: 'Residential' },
  { id: 'B-018', name: 'Richmond Heights Block C2', ulpin: 'ULPIN-IN-KA-2026-98138', center: { lat: 12.9704, lon: 77.5950 }, width: 21, depth: 15, height: 21, floors: 5, valuation: '₹3,40,00,000', ownerName: 'Vikram Sethi', propertyType: 'Residential' },
  { id: 'B-019', name: 'Richmond Heights Block C3', ulpin: 'ULPIN-IN-KA-2026-98139', center: { lat: 12.9704, lon: 77.5954 }, width: 17, depth: 17, height: 19, floors: 5, valuation: '₹3,10,00,000', ownerName: 'Anita Menon', propertyType: 'Residential' },
  { id: 'B-020', name: 'Richmond Heights Block C4', ulpin: 'ULPIN-IN-KA-2026-98140', center: { lat: 12.9704, lon: 77.5958 }, width: 19, depth: 16, height: 22, floors: 6, valuation: '₹3,70,00,000', ownerName: 'Rajiv Malhotra', propertyType: 'Residential' },

  { id: 'B-021', name: 'Stadium Terrace Block D1', ulpin: 'ULPIN-IN-KA-2026-98141', center: { lat: 12.9715, lon: 77.5938 }, width: 16, depth: 16, height: 15, floors: 4, valuation: '₹2,50,00,000', ownerName: 'Girish Chandra', propertyType: 'Residential' },
  { id: 'B-022', name: 'Stadium Terrace Block D2', ulpin: 'ULPIN-IN-KA-2026-98142', center: { lat: 12.9715, lon: 77.5942 }, width: 18, depth: 15, height: 18, floors: 5, valuation: '₹2,95,00,000', ownerName: 'Karnataka Sports Housing', propertyType: 'Residential' },
  { id: 'B-023', name: 'Stadium Terrace Block D3', ulpin: 'ULPIN-IN-KA-2026-98143', center: { lat: 12.9718, lon: 77.5942 }, width: 20, depth: 16, height: 21, floors: 5, valuation: '₹3,20,00,000', ownerName: 'Nitin Reddy', propertyType: 'Residential' },

  { id: 'B-024', name: 'MG Road Plaza West', ulpin: 'ULPIN-IN-KA-2026-98144', center: { lat: 12.9728, lon: 77.5942 }, width: 25, depth: 20, height: 28, floors: 7, valuation: '₹6,80,00,000', ownerName: 'MG Realty Ventures', propertyType: 'Commercial' },
  { id: 'B-025', name: 'MG Road Plaza East', ulpin: 'ULPIN-IN-KA-2026-98145', center: { lat: 12.9728, lon: 77.5946 }, width: 24, depth: 22, height: 32, floors: 8, valuation: '₹7,90,00,000', ownerName: 'Apex Capital Holdings', propertyType: 'Commercial' },
  { id: 'B-026', name: 'Trinity Corporate Hub', ulpin: 'ULPIN-IN-KA-2026-98146', center: { lat: 12.9728, lon: 77.5954 }, width: 28, depth: 25, height: 35, floors: 9, valuation: '₹8,90,00,000', ownerName: 'Trinity Infra Trust', propertyType: 'Office' },

  { id: 'B-027', name: 'Lavelle Villa 101', ulpin: 'ULPIN-IN-KA-2026-98147', center: { lat: 12.9700, lon: 77.5942 }, width: 15, depth: 15, height: 12, floors: 3, valuation: '₹2,10,00,000', ownerName: 'Dr. A. K. Sundaram', propertyType: 'Residential' },
  { id: 'B-028', name: 'Lavelle Villa 102', ulpin: 'ULPIN-IN-KA-2026-98148', center: { lat: 12.9700, lon: 77.5946 }, width: 16, depth: 14, height: 14, floors: 3, valuation: '₹2,25,00,000', ownerName: 'Shalini Nair', propertyType: 'Residential' },
  { id: 'B-029', name: 'Lavelle Villa 103', ulpin: 'ULPIN-IN-KA-2026-98149', center: { lat: 12.9700, lon: 77.5950 }, width: 17, depth: 15, height: 15, floors: 4, valuation: '₹2,45,00,000', ownerName: 'Mahesh Kulkarni', propertyType: 'Residential' },
  { id: 'B-030', name: 'Lavelle Villa 104', ulpin: 'ULPIN-IN-KA-2026-98150', center: { lat: 12.9700, lon: 77.5954 }, width: 18, depth: 16, height: 16, floors: 4, valuation: '₹2,65,00,000', ownerName: 'Pooja Agarwal', propertyType: 'Residential' },
  { id: 'B-031', name: 'Lavelle Villa 105', ulpin: 'ULPIN-IN-KA-2026-98151', center: { lat: 12.9700, lon: 77.5958 }, width: 16, depth: 17, height: 15, floors: 4, valuation: '₹2,55,00,000', ownerName: 'Sanjay Joshi', propertyType: 'Residential' },
];
