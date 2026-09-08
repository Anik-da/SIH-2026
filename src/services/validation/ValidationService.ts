import type { VerticalProperty, Floor, ValidationConflict, UndergroundAsset, Parcel, Building } from '../../types/cadastral';

export interface OverlapResult {
  hasOverlap: boolean;
  overlapMeters: number;
  minZ: number;
  maxZ: number;
}

/**
 * Real Prototype 3D Geometry Validation Engine for 3D Cadastre & Vertical Properties
 */
export class ValidationService {
  /**
   * Calculates exact vertical volume overlap in meters between two 3D vertical properties
   */
  static checkZOverlap(propA: VerticalProperty, propB: VerticalProperty): OverlapResult {
    const minZ = Math.max(propA.zMin, propB.zMin);
    const maxZ = Math.min(propA.zMax, propB.zMax);

    if (maxZ > minZ && propA.buildingId === propB.buildingId) {
      const overlapMeters = parseFloat((maxZ - minZ).toFixed(2));
      return {
        hasOverlap: true,
        overlapMeters,
        minZ,
        maxZ,
      };
    }

    return {
      hasOverlap: false,
      overlapMeters: 0,
      minZ: 0,
      maxZ: 0,
    };
  }

  /**
   * Detects unmapped vertical volume gaps between consecutive building floor levels
   */
  static checkFloorGap(floors: Floor[]): { hasGap: boolean; gapMeters: number; betweenFloorA?: string; betweenFloorB?: string } {
    if (floors.length < 2) return { hasGap: false, gapMeters: 0 };

    const sorted = [...floors].sort((a, b) => a.zMin - b.zMin);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const gap = next.zMin - current.zMax;
      if (gap > 0.1) {
        return {
          hasGap: true,
          gapMeters: parseFloat(gap.toFixed(2)),
          betweenFloorA: current.label,
          betweenFloorB: next.label,
        };
      }
    }

    return { hasGap: false, gapMeters: 0 };
  }

  /**
   * Detects duplicate 3D volumetric space allocations within the same building
   */
  static checkDuplicateVolume(properties: VerticalProperty[]): { hasDuplicate: boolean; duplicateVpids: string[] } {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];

    for (const prop of properties) {
      const key = `${prop.buildingId}_${prop.zMin}_${prop.zMax}_${prop.area}`;
      if (seen.has(key)) {
        duplicates.push(prop.vpid, seen.get(key)!);
      } else {
        seen.set(key, prop.vpid);
      }
    }

    return {
      hasDuplicate: duplicates.length > 0,
      duplicateVpids: Array.from(new Set(duplicates)),
    };
  }

  /**
   * Checks if a 3D subsurface asset collides with a basement vertical property
   */
  static checkUndergroundCollision(asset: UndergroundAsset, prop: VerticalProperty): OverlapResult {
    if (!prop.isUnderground) return { hasOverlap: false, overlapMeters: 0, minZ: 0, maxZ: 0 };

    const minZ = Math.max(asset.zMin, prop.zMin);
    const maxZ = Math.min(asset.zMax, prop.zMax);

    if (maxZ > minZ) {
      const overlapMeters = parseFloat((maxZ - minZ).toFixed(2));
      return {
        hasOverlap: true,
        overlapMeters,
        minZ,
        maxZ,
      };
    }

    return { hasOverlap: false, overlapMeters: 0, minZ: 0, maxZ: 0 };
  }

  /**
   * Executes full spatial validation suite across all parcels, buildings, vertical properties, and underground assets
   */
  static runFullValidation(
    parcels: Parcel[],
    buildings: Building[],
    properties: VerticalProperty[],
    undergroundAssets: UndergroundAsset[] = []
  ): ValidationConflict[] {
    const conflicts: ValidationConflict[] = [];

    // 1. Check all vertical property pairs for volume overlaps (3D vertical intersection)
    for (let i = 0; i < properties.length; i++) {
      for (let j = i + 1; j < properties.length; j++) {
        const propA = properties[i];
        const propB = properties[j];

        const overlap = this.checkZOverlap(propA, propB);
        if (overlap.hasOverlap) {
          conflicts.push({
            id: `CONF-VOL-${propA.vpid}-${propB.vpid}`,
            type: 'VOLUME_OVERLAP',
            severity: 'HIGH',
            vpid: propA.vpid,
            targetVpid: propB.vpid,
            buildingId: propA.buildingId,
            description: `3D Volume Overlap Detected: ${propA.floorLabel} (Z=${propA.zMin}-${propA.zMax}m) overlaps with ${propB.floorLabel} (Z=${propB.zMin}-${propB.zMax}m) by exactly ${overlap.overlapMeters}m!`,
            locationZ: { min: overlap.minZ, max: overlap.maxZ },
            overlapMeters: overlap.overlapMeters,
            resolved: false,
            status: 'OPEN',
          });
        }
      }
    }

    // 2. Check buildings for vertical floor gaps
    for (const bldg of buildings) {
      if (bldg.floors && bldg.floors.length >= 2) {
        const gapCheck = this.checkFloorGap(bldg.floors);
        if (gapCheck.hasGap) {
          conflicts.push({
            id: `CONF-GAP-${bldg.id}`,
            type: 'FLOOR_GAP',
            severity: 'MEDIUM',
            vpid: `BUILDING-${bldg.id}`,
            buildingId: bldg.id,
            description: `Unmapped Vertical Volume Gap: ${gapCheck.gapMeters}m unmapped space between ${gapCheck.betweenFloorA} and ${gapCheck.betweenFloorB}.`,
            locationZ: { min: 0, max: bldg.floors.length * 3.5 },
            overlapMeters: gapCheck.gapMeters,
            resolved: false,
            status: 'OPEN',
          });
        }
      }
    }

    // 3. Check underground collisions between basement vertical properties and utility assets
    for (const prop of properties) {
      if (prop.isUnderground) {
        for (const asset of undergroundAssets) {
          const uOverlap = this.checkUndergroundCollision(asset, prop);
          if (uOverlap.hasOverlap) {
            conflicts.push({
              id: `CONF-UND-${prop.vpid}-${asset.id}`,
              type: 'UNDERGROUND_COLLISION',
              severity: 'HIGH',
              vpid: prop.vpid,
              buildingId: prop.buildingId,
              description: `Underground Sub-surface Collision: Basement volume (${prop.vpid}, Z=${prop.zMin}m) collides with ${asset.name} (${asset.assetType}, Z=${asset.zMin}m to ${asset.zMax}m) by ${uOverlap.overlapMeters}m.`,
              locationZ: { min: uOverlap.minZ, max: uOverlap.maxZ },
              overlapMeters: uOverlap.overlapMeters,
              resolved: false,
              status: 'OPEN',
            });
          }
        }
      }
    }

    return conflicts;
  }
}
