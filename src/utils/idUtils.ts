import { BASE_ULPIN, VERTICAL_EXTENSIONS } from '@/data/constants';
import type { PropertyData, PropertyContext } from '@/types';

export function getVerticalExtension(floorId: string): string {
  return VERTICAL_EXTENSIONS[floorId] ?? 'U000';
}

export function generateThreeDUlpin(floorId: string): string {
  return `${BASE_ULPIN}-${getVerticalExtension(floorId)}`;
}

export function generateVPID(buildingId: string, floorId: string, propertyId: string): string {
  return `VPID-${buildingId}-${floorId}-${propertyId}`;
}

export function buildPropertyContext(prop: PropertyData): PropertyContext {
  const floorNum = parseInt(prop.floorId.replace(/\D/g, ''), 10) || (prop.floorId === 'G' ? 0 : prop.floorId === 'B01' ? -1 : 7);
  return {
    buildingId: prop.buildingId,
    floorId: prop.floorId,
    propertyId: prop.propertyId,
    vpid: prop.vpid,
    ulpin: BASE_ULPIN,
    threeDUlpin: generateThreeDUlpin(prop.floorId),
    verticalExtension: getVerticalExtension(prop.floorId),
    floorNumber: floorNum,
    zMin: prop.zMin,
    zMax: prop.zMax,
  };
}

export function formatArea(area: number): string {
  return `${area.toLocaleString()} sq.ft`;
}

export function formatZ(value: number): string {
  return `${value.toFixed(1)} m`;
}
