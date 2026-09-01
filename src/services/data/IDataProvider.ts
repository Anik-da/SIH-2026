export interface DataProvenance {
  sourceName: string;
  sourceType: 'official_government' | 'open_data' | 'derived' | 'user_imported' | 'unverified';
  sourceRecordId: string;
  sourceDate?: string;
  confidenceScore: number; // 0.0 to 1.0
  verificationStatus: 'verified_official' | 'derived' | 'unverified' | 'imported';
}

export interface ParcelRecord {
  id: string;
  ulpin: string | null; // NULL if unavailable from official source! Never fake
  surveyNumber: string | null;
  parcelId: string;
  pid: string | null;
  areaSqm: number;
  landUse: string;
  district: string;
  taluk: string;
  village: string;
  coordinates: [number, number][];
  provenance: DataProvenance;
}

export interface BuildingRecord {
  id: string;
  parcelId?: string;
  name: string | null;
  buildingType: string;
  heightM: number;
  floorsCount: number;
  builtUpAreaSqm: number;
  coordinates: [number, number][];
  provenance: DataProvenance;
}

export interface VerticalUnitRecord {
  id: string;
  floorId: string;
  vpid: string; // System-generated VPID (clearly labeled)
  unitNumber: string;
  propertyType: string;
  status: 'occupied' | 'vacant' | 'disputed';
  zMin: number;
  zMax: number;
  areaSqm: number;
  volumeCum: number;
  ownerName?: string | null;
  taxStatus?: string | null;
  provenance: DataProvenance;
}

export interface ValidationConflictRecord {
  id: string;
  conflictType: string;
  severity: 'critical' | 'warning' | 'info';
  entityAId: string;
  entityBId?: string;
  description: string;
  detectedAt: string;
  resolved: boolean;
  provenance: DataProvenance;
}

export interface RealGISAnalytics {
  totalParcels: number;
  totalBuildings: number;
  totalVerticalUnits: number;
  totalAreaSqm: number;
  landUseBreakdown: { category: string; percentage: number }[];
  avgBuildingHeightM: number;
  avgFloors: number;
  verifiedCount: number;
  pendingCount: number;
  activeConflictCount: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'parcel' | 'building' | 'vpid' | 'ulpin';
  lat: number;
  lon: number;
  ulpin?: string | null;
  provenance: DataProvenance;
}

export interface IDataProvider {
  getParcels(bbox: [number, number, number, number]): Promise<ParcelRecord[]>;
  getBuildings(bbox: [number, number, number, number]): Promise<BuildingRecord[]>;
  getBuildingById(id: string): Promise<BuildingRecord | null>;
  getVerticalUnits(buildingId: string): Promise<VerticalUnitRecord[]>;
  getZoning(bbox: [number, number, number, number]): Promise<any[]>;
  getValidationConflicts(bbox: [number, number, number, number]): Promise<ValidationConflictRecord[]>;
  getAnalytics(bbox: [number, number, number, number]): Promise<RealGISAnalytics>;
  searchProperties(query: string): Promise<SearchResultItem[]>;
}
