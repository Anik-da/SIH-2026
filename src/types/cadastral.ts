export type PropertyStatus = 'valid' | 'warning' | 'conflict';
export type PropertyType = 'Residential' | 'Commercial' | 'Mixed Use' | 'Parking' | 'Utility';
export type UserRole = 'ADMIN' | 'SURVEY_OFFICER' | 'VERIFICATION_OFFICER' | 'VIEWER';

export type SourceBadgeType = 'OFFICIAL' | 'DERIVED' | 'USER_IMPORTED' | 'DEMO' | 'UNVERIFIED';

export interface DataProvenance {
  source: string;
  datasetName: string;
  sourceUrl?: string;
  ingestionDate: string;
  processingMethod: string;
  confidence: number;
  authority: string;
  license: string;
  verificationStatus: 'VERIFIED' | 'DERIVED_UNVERIFIED' | 'PENDING_AUDIT' | 'DEMO_ONLY';
  sourceBadge: SourceBadgeType;
}

export interface Parcel {
  id: string;
  parcelId?: string;
  ulpin: string;
  area: number; // m²
  geometry: [number, number][]; // Polygon coordinates [lon, lat]
  status: PropertyStatus;
  buildingCount: number;
  dataSource: string;
  confidence: number; // 0.0 to 1.0
  landUse: string;
  ownerName?: string;
  registrationDate?: string;
  district?: string;
  taluk?: string;
  village?: string;
  ward?: string;
  surveyNumber?: string;
  authority?: string;
  sourceDate?: string;
  sourceBadge?: SourceBadgeType;
  provenance?: DataProvenance;
}

export interface Floor {
  id: string;
  label: string;
  shortLabel: string;
  zMin: number;
  zMax: number;
  floorNumber: number;
  isUnderground: boolean;
}

export interface Building {
  id: string;
  buildingId?: string;
  name: string;
  parcelId: string;
  ulpin: string;
  footprint: [number, number][]; // [lon, lat] relative or absolute
  footprintArea: number; // m²
  center: { lon: number; lat: number };
  floors: Floor[];
  height?: number;
  floorCount?: number;
  buildingType?: string;
  roofHeight?: number; // meters e.g. 731.0
  groundElevation?: number; // meters e.g. 712.4
  heightSource?: string; // e.g. "DSM-derived (DSM: 731.0m, DTM: 712.4m)"
  status?: PropertyStatus;
  dataSource?: string;
  confidence?: number;
  sourceBadge?: SourceBadgeType;
  provenance?: DataProvenance;
}

export interface VerticalProperty {
  vpid: string;
  ulpin: string;
  parcelId: string;
  buildingId: string;
  floorId: string;
  floorNumber: number;
  floorLabel: string;
  propertyType: PropertyType;
  zMin: number;
  zMax: number;
  height: number;
  area: number;
  volume: number;
  confidence: number;
  status: PropertyStatus;
  isUnderground: boolean;
  ownerName?: string;
  registrationDate?: string;
  documentRef?: string;
  dataSource?: string;
  sourceBadge?: SourceBadgeType;
  provenance?: DataProvenance;
}

export type ExplodeState = 'collapsed' | 'exploded';

export interface ValidationConflict {
  id: string;
  type: 'VOLUME_OVERLAP' | 'FLOOR_GAP' | 'INVALID_Z_RANGE' | 'PARCEL_ENCROACHMENT' | 'RESTRICTED_ZONE' | 'UNDERGROUND_COLLISION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  vpid: string;
  targetVpid?: string;
  buildingId: string;
  description: string;
  locationZ: { min: number; max: number };
  overlapMeters?: number;
  resolved: boolean;
  status?: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
}

export interface UndergroundAsset {
  id: string;
  name: string;
  assetType: 'Basement' | 'Utility Tunnel' | 'Underground Property' | 'Substation';
  zMin: number; // e.g. -6
  zMax: number; // e.g. -3
  depth: number; // m
  parcelId: string;
  ulpin: string;
  status: PropertyStatus;
  geometry?: [number, number][];
  dataSource?: string;
  sourceBadge?: SourceBadgeType;
  provenance?: DataProvenance;
}

export interface DocumentVerificationField {
  fieldName: string;
  documentValue: string;
  databaseValue: string;
  status: 'MATCH' | 'WARNING' | 'MISMATCH';
}

export interface DocumentVerification {
  id: string;
  documentType: string;
  documentName: string;
  uploadedAt: string;
  extractedUlpin: string;
  extractedVpid: string;
  overallStatus: 'MATCH' | 'WARNING' | 'MISMATCH';
  fields: DocumentVerificationField[];
}

export interface PropertyPassport {
  vpid: string;
  ulpin: string;
  parcelId: string;
  buildingId: string;
  floorId: string;
  floorNumber: number;
  propertyType: PropertyType;
  area: number;
  zMin: number;
  zMax: number;
  volume: number;
  dataSource: string;
  confidence: number;
  validationStatus: PropertyStatus;
  verificationDate: string;
  verificationHash: string;
  ownerName?: string;
  sourceBadge?: SourceBadgeType;
  provenance?: DataProvenance;
}

export interface EmergencyBuildingInfo {
  buildingId: string;
  buildingName: string;
  ulpin: string;
  floorCount: number;
  hasBasement: boolean;
  undergroundAccess: string;
  estimatedOccupancy: number; // Demo estimate
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'STABLE' | 'INCIDENT_ACTIVE' | 'EVACUATING';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  action: string;
  targetId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

