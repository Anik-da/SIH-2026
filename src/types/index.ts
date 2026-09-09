import type { Vector3Tuple } from 'three';

export type FloorType = 'basement' | 'ground' | 'residential' | 'terrace';
export type PropertyType = 'Residential' | 'Commercial' | 'Parking' | 'Utility';
export type PropertyStatus = 'Verified Demo' | 'Demo' | 'Pending';

export interface BuildingData {
  buildingId: string;
  name: string;
  floorCount: number;
  basementCount: number;
  buildingHeight: number;
  floors: FloorData[];
}

export interface FloorData {
  floorId: string;
  buildingId: string;
  floorNumber: number;
  floorName: string;
  shortName: string;
  floorType: FloorType;
  floorArea: number;
  zMin: number;
  zMax: number;
  floorHeight: number;
  verticalExtension: string;
}

export interface PropertyData {
  propertyId: string;
  vpid: string;
  buildingId: string;
  floorId: string;
  area: number;
  zMin: number;
  zMax: number;
  volume: number;
  propertyType: PropertyType;
  status: PropertyStatus;
  position: Vector3Tuple;
  dimensions: Vector3Tuple;
  label: string;
}

export interface PropertyContext {
  buildingId: string;
  floorId: string;
  propertyId: string;
  vpid: string;
  ulpin: string;
  threeDUlpin: string;
  verticalExtension: string;
  floorNumber: number;
  zMin: number;
  zMax: number;
}

export interface BuildingGameDemoProps {
  onOpenGISGlobe?: (context?: PropertyContext) => void;
  onOpenPropertyPassport?: (context?: PropertyContext) => void;
  onBackToHome?: () => void;
}

export type GamePhase = 'start' | 'entering' | 'playing' | 'gis-transition';
