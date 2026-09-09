import type { BuildingData, FloorData, PropertyData } from '@/types';
import {
  BASE_ULPIN,
  BUILDING_ID,
  FLOOR_HEIGHT,
  FLOOR_IDS,
  FLOOR_NAMES,
  FLOOR_SHORT_NAMES,
  FLOOR_NUMBER_MAP,
  VERTICAL_EXTENSIONS,
  BUILDING_DIMENSIONS,
} from './constants';

function buildFloors(): FloorData[] {
  return FLOOR_IDS.map((id) => {
    const num = FLOOR_NUMBER_MAP[id];
    const zMin = num * FLOOR_HEIGHT;
    const zMax = zMin + FLOOR_HEIGHT;
    const type = id === 'B01' ? 'basement' : id === 'G' ? 'ground' : id === 'T' ? 'terrace' : 'residential';
    return {
      floorId: id,
      buildingId: BUILDING_ID,
      floorNumber: num,
      floorName: FLOOR_NAMES[id],
      shortName: FLOOR_SHORT_NAMES[id],
      floorType: type,
      floorArea: 1920,
      zMin,
      zMax,
      floorHeight: FLOOR_HEIGHT,
      verticalExtension: VERTICAL_EXTENSIONS[id],
    } as FloorData;
  });
}

function buildProperties(): PropertyData[] {
  const props: PropertyData[] = [];
  const { width, depth } = BUILDING_DIMENSIONS;
  const corridorWidth = 3;
  const unitWidth = (width - corridorWidth) / 2;
  const unitDepth = depth / 2;

  const floorProps: Record<string, { type: PropertyData['propertyType']; area: number; label: string }[]> = {
    B01: [{ type: 'Parking', area: 800, label: 'Parking Unit' }],
    G: [{ type: 'Commercial', area: 1500, label: 'Commercial Unit' }],
    F01: [{ type: 'Residential', area: 1150, label: 'Residential Unit' }],
    F02: [{ type: 'Residential', area: 1200, label: 'Residential Unit' }],
    F03: [{ type: 'Residential', area: 1250, label: 'Residential Unit' }],
    F04: [{ type: 'Residential', area: 1250, label: 'Residential Unit' }],
    F05: [{ type: 'Residential', area: 1300, label: 'Residential Unit' }],
    F06: [{ type: 'Residential', area: 1300, label: 'Residential Unit' }],
    T: [{ type: 'Utility', area: 600, label: 'Terrace Utility' }],
  };

  for (const floorId of FLOOR_IDS) {
    const floorNum = FLOOR_NUMBER_MAP[floorId];
    const zMin = floorNum * FLOOR_HEIGHT;
    const zMax = zMin + FLOOR_HEIGHT;
    const configs = floorProps[floorId];
    const propId = 'P01';
    const vpid = `VPID-${BUILDING_ID}-${floorId}-${propId}`;
    const vol = unitWidth * unitDepth * FLOOR_HEIGHT;
    const xLeft = -(width / 2) + unitWidth / 2;
    const xRight = width / 2 - unitWidth / 2;
    const cfg = configs[0];
    props.push({
      propertyId: propId,
      vpid,
      buildingId: BUILDING_ID,
      floorId,
      area: cfg.area,
      zMin,
      zMax,
      volume: vol,
      propertyType: cfg.type,
      status: 'Verified Demo',
      position: [xLeft, (zMin + zMax) / 2, -depth / 2 + unitDepth / 2],
      dimensions: [unitWidth - 0.3, FLOOR_HEIGHT - 0.1, unitDepth - 0.3],
      label: cfg.label,
    });
    if (floorId !== 'T' && floorId !== 'B01') {
      props.push({
        propertyId: 'P02',
        vpid: `VPID-${BUILDING_ID}-${floorId}-P02`,
        buildingId: BUILDING_ID,
        floorId,
        area: cfg.area,
        zMin,
        zMax,
        volume: vol,
        propertyType: cfg.type,
        status: 'Verified Demo',
        position: [xRight, (zMin + zMax) / 2, -depth / 2 + unitDepth / 2],
        dimensions: [unitWidth - 0.3, FLOOR_HEIGHT - 0.1, unitDepth - 0.3],
        label: cfg.label,
      });
    }
  }

  return props;
}

export const building: BuildingData = {
  buildingId: BUILDING_ID,
  name: 'VOLU-CAD Demonstration Building',
  floorCount: 7,
  basementCount: 1,
  buildingHeight: FLOOR_HEIGHT * 8,
  floors: buildFloors(),
};

export const properties: PropertyData[] = buildProperties();

export const demoProperty = properties.find((p) => p.floorId === 'F03' && p.propertyId === 'P01')!;

export { BASE_ULPIN };
