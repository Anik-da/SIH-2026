import type { SourceBadgeType } from './cadastral';

export type DatasetSourceCategory = 'BHUVAN_ISRO' | 'KARNATAKA_BBMP' | 'USER_GIS_UPLOAD';

export type DatasetStatus = 'CONNECTED' | 'DEMO' | 'UNAVAILABLE';

export type IngestionLifecycleStatus = 'IMPORTED' | 'PROCESSING' | 'VALIDATED' | 'APPROVED' | 'REJECTED';

export type IngestionStep =
  | 'SOURCE_SELECTION'
  | 'DATA_INGESTION'
  | 'FORMAT_VALIDATION'
  | 'CRS_NORMALIZATION'
  | 'GEOMETRY_VALIDATION'
  | 'PARCEL_MATCHING'
  | 'BUILDING_MATCHING'
  | 'DSM_DTM_PROCESSING'
  | 'FLOOR_GENERATION'
  | 'VOLUMETRIC_GENERATION'
  | 'ULPIN_ASSOCIATION'
  | 'VPID_GENERATION'
  | 'TOPOLOGY_VALIDATION'
  | 'PASSPORT_ISSUANCE';

export interface GovtDataset {
  id: string;
  name: string;
  source: string; // e.g. "Bhuvan / NRSC / ISRO"
  category: DatasetSourceCategory;
  datasetType: 'Satellite Imagery' | 'Cadastral Vector' | 'DEM/DSM Elevation' | 'Administrative' | 'Property Records';
  coverage: string; // e.g. "Bengaluru Urban, Karnataka"
  crs: string; // e.g. "EPSG:4326 (WGS84)"
  lastUpdated: string;
  authority: string;
  license: string;
  confidence: number; // 0.0 - 1.0
  status: DatasetStatus;
  lifecycleStatus: IngestionLifecycleStatus;
  featureCount: number;
  sourceBadge: SourceBadgeType;
  sourceUrl?: string;
  description: string;
}
