import * as Cesium from 'cesium';
import type { Building, Floor } from '../types/cadastral';

export const EXPLODE_OFFSET = 4.5; // meters of gap per floor level in exploded view mode

export function footprintToCartesian(
  footprint: [number, number][],
  z: number
): Cesium.Cartesian3[] {
  return footprint.map(([lon, lat]) =>
    Cesium.Cartesian3.fromDegrees(lon, lat, z)
  );
}

export function footprintToPositions(
  footprint: [number, number][],
  zMin: number,
  zMax: number
): Cesium.Cartesian3[] {
  const bottom = footprintToCartesian(footprint, zMin);
  const top = footprintToCartesian(footprint, zMax);
  return [...bottom, ...top];
}

export function computeExplodedZ(floor: Floor, explodeFactor: number): { zMin: number; zMax: number } {
  // explodeFactor 0 = true 3D position, 1 = exploded view
  const extra = EXPLODE_OFFSET * explodeFactor;
  const shift = floor.floorNumber * extra;
  return {
    zMin: floor.zMin + shift,
    zMax: floor.zMax + shift,
  };
}

export function makeFloorLabel(
  viewer: Cesium.Viewer,
  building: Building,
  floor: Floor,
  explodeFactor: number,
  text: string
): Cesium.Entity {
  const elev = getGroundElevation(viewer, building.center.lon, building.center.lat);
  const { zMax } = computeExplodedZ(floor, explodeFactor);
  const labelZ = elev + zMax + 0.6;
  return viewer.entities.add({
    id: `label-floor-${floor.id}`,
    position: Cesium.Cartesian3.fromDegrees(building.center.lon, building.center.lat, labelZ),
    label: {
      text,
      font: 'bold 12px Inter, sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString('#0f172a'),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      showBackground: true,
      backgroundColor: new Cesium.Color(0.06, 0.09, 0.16, 0.88),
      backgroundPadding: new Cesium.Cartesian2(8, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

export function getGroundElevation(viewer?: Cesium.Viewer, lon = 77.50426, lat = 13.06746): number {
  if (viewer && !viewer.isDestroyed() && viewer.scene && viewer.scene.globe) {
    const carto = Cesium.Cartographic.fromDegrees(lon, lat);
    const height = viewer.scene.globe.getHeight(carto);
    if (typeof height === 'number' && height > 0) {
      return height;
    }
  }
  // Known ground elevation for Bengaluru / Sapthagiri campus region (~913.5m WGS84)
  if (Math.abs(lat - 13.067) < 0.2 && Math.abs(lon - 77.504) < 0.2) {
    return 913.5;
  }
  return 0.0;
}

export function flyToBuilding(viewer: Cesium.Viewer, building: Building, duration = 2) {
  const elev = getGroundElevation(viewer, building.center.lon, building.center.lat);
  const centerCartesian = Cesium.Cartesian3.fromDegrees(building.center.lon, building.center.lat, elev + 20);
  const boundingSphere = new Cesium.BoundingSphere(centerCartesian, 60);

  viewer.camera.flyToBoundingSphere(boundingSphere, {
    offset: new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(25),
      Cesium.Math.toRadians(-22),
      190 // 190m viewing range for cinematic street-level palace perspective
    ),
    duration,
  });
}

export function flyToFloor(
  viewer: Cesium.Viewer,
  building: Building,
  floor: Floor,
  explodeFactor: number,
  duration = 1.5
) {
  const elev = getGroundElevation(viewer, building.center.lon, building.center.lat);
  const { zMax } = computeExplodedZ(floor, explodeFactor);
  const centerCartesian = Cesium.Cartesian3.fromDegrees(building.center.lon, building.center.lat, elev + zMax);
  const boundingSphere = new Cesium.BoundingSphere(centerCartesian, 35);

  viewer.camera.flyToBoundingSphere(boundingSphere, {
    offset: new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(40),
      Cesium.Math.toRadians(-24),
      170 // 170m focused floor level inspection range
    ),
    duration,
  });
}


export function colorFromRgba(rgba: string): Cesium.Color {
  return Cesium.Color.fromCssColorString(rgba);
}
