export interface MongoBuildingDocument {
  _id?: string;
  buildingId: string;
  cesiumFeatureId: string;
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  buildingType: string; // 'commercial' | 'residential' | 'institutional' | 'mixed'
  floorCount: number;
  basementCount: number;
  buildingHeight: number; // meters
  buildingStatus: 'OCCUPIED' | 'UNDER_CONSTRUCTION' | 'VACANT' | 'MAINTENANCE';
  parcelId: string;
  ulpin: string;
  officialUlpin?: string;
  ulpinStatus: 'VERIFIED' | 'NOT_AVAILABLE' | 'DEMO';
  dataSource: 'PUBLIC_WEB' | 'BHUVAN_ISRO' | 'BBMP_EAISTHI' | 'CADASTRAL_SURVEY' | 'MANUAL' | 'FLOORPLAN_EXTRUSION_DEMO' | string;
  sourceUrls: string[];
  sourceCollectedAt: string;
  lastVerifiedAt: string;
  confidence: number; // 0.0 to 1.0
  verificationStatus: 'VERIFIED' | 'PUBLIC_SOURCE' | 'PARTIALLY_VERIFIED' | 'NEEDS_REVIEW' | 'NOT_INGESTED' | 'DISCOVERED' | 'INGESTED' | 'PROTOTYPE_GENERATED';
  createdAt: string;
  updatedAt: string;
}

export interface MongoFloorDocument {
  _id?: string;
  floorId: string;
  buildingId: string;
  cesiumFeatureId: string;
  floorNumber: number;
  floorName: string;
  floorType?: string;
  threeDUlpIn?: string;
  officialUlpin?: string;
  verticalExtension?: string;
  vpid?: string;
  zMin: number;
  zMax: number;
  floorHeight: number;
  floorArea?: number;
  area: number;
  propertyCount: number;
  source: 'DERIVED' | 'OFFICIAL_BLUEPRINT' | 'PUBLIC_RECORD' | 'SURVEY' | string;
  confidence: number;
  geometryAvailable?: boolean;
  has3DGeometry: boolean;
  status?: string;
}

export interface MongoBuildingSourceDocument {
  _id?: string;
  sourceId: string;
  buildingId: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  collectedAt: string;
  fieldsExtracted: string[];
  confidenceScore: number;
  verificationStatus: string;
}

export interface MongoParcelDocument {
  _id?: string;
  parcelId: string;
  demoParcelId?: string;
  ulpin: string | null;
  officialUlpin?: string;
  name?: string;
  surveyNumber?: string;
  area?: number;
  areaSqm?: number;
  landUse: string;
  buildingCount?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  dataSource?: string;
  confidence?: number;
  verificationStatus?: string;
  status?: string;
  buildings?: string[];
  coordinates?: [number, number][];
}

export interface MongoVerticalPropertyDocument {
  _id?: string;
  vpid: string;
  threeDUlpIn?: string;
  officialUlpin?: string;
  verticalExtension?: string;
  buildingId: string;
  floorId: string;
  floorNumber?: number;
  floorLabel?: string;
  parcelId?: string;
  unitNumber: string;
  propertyType: string;
  status: 'occupied' | 'vacant' | 'notice' | 'valid' | 'warning';
  zMin: number;
  zMax: number;
  height?: number;
  area?: number;
  areaSqm: number;
  volume?: number;
  volumeCum: number;
  ownerName: string;
  taxStatus: string;
  dataSource?: string;
  confidence: number;
}

export interface MongoValidationConflictDocument {
  _id?: string;
  id?: string;
  conflictId?: string;
  buildingId: string;
  parcelId?: string;
  vpid?: string;
  targetVpid?: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'critical' | 'warning' | 'info';
  description: string;
  locationZ?: { min: number; max: number };
  overlapMeters?: number;
  ruleBroken?: string;
  detectedAt?: string;
  resolved: boolean;
  status?: string;
}

export interface MongoDisasterFloorInfo {
  floorId: string;
  floorNumber: number;
  floorName: string;
  riskLevel: 'HIGH' | 'AMBER' | 'LOW';
  seniorCitizens: number;
  mobilityAssistance: number;
  medicalPriority: number;
  occupancyEst: number;
  priority: 'IMMEDIATE' | 'CAUTION' | 'NORMAL' | 'CLEAR';
  hazardType: string;
  evacuationRoute: string;
  isDemoData: boolean;
}

export interface MongoDisasterProfileDocument {
  _id?: string;
  profileId: string;
  buildingId: string;
  buildingName: string;
  status: string;
  lastUpdated: string;
  floors: MongoDisasterFloorInfo[];
}

export interface MongoPropertyPassportDocument {
  _id?: string;
  passportId: string;
  vpid: string;
  threeDUlpIn?: string;
  officialUlpin?: string;
  verticalExtension?: string;
  buildingId: string;
  buildingName?: string;
  floorId?: string;
  floorNumber?: number;
  floorName?: string;
  floorArea?: number;
  propertyType?: string;
  parcelId?: string;
  certificateStatus?: string;
  verificationStatus?: string;
  zMin?: number;
  zMax?: number;
  volume?: number;
  source?: string;
  authority?: string;
  qrIdentifier?: string;
  qrCodeUrl?: string;
  qrVerificationUrl?: string;
  verifiedAt?: string;
  issuedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MongoAuditEventDocument {
  _id?: string;
  id?: string;
  eventId?: string;
  action: string;
  user?: string;
  userRole?: string;
  actor?: string;
  timestamp: string;
  objectId?: string;
  metadata?: any;
  details?: any;
}

export interface FloorplanProcessingResult {
  status: string;
  fileName: string;
  confidenceScore: number;
  polygonVertices: { x: number; y: number }[];
  usableFloorAreaSqm: number;
  unitsDetected: number;
  message: string;
}

export interface FloorplanGenerate3DResponse {
  status: string;
  building: MongoBuildingDocument;
  floors: MongoFloorDocument[];
  verticalProperties: MongoVerticalPropertyDocument[];
  disasterProfile: MongoDisasterProfileDocument;
  samplePassport: MongoPropertyPassportDocument;
  message: string;
}

export interface PublicVerificationResponse {
  verified: boolean;
  certificateTitle: string;
  threeDUlpIn: string;
  officialUlpin: string;
  vpid: string;
  property: string;
  building: string;
  floorArea: string;
  elevationExtent: string;
  status: string;
  verification: string;
  source: string;
  authority: string;
  verificationDate: string;
  cryptographicSeal: string;
  disclaimer: string;
}

