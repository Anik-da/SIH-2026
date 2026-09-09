import { useMemo } from 'react';
import * as THREE from 'three';
import type { FloorData, PropertyData } from '@/types';
import { FloorVolume } from './FloorVolume';
import { BUILDING_DIMENSIONS } from '@/data/constants';

interface BuildingProps {
  floors: FloorData[];
  properties: PropertyData[];
  exploded: boolean;
  underground: boolean;
  selectedProperty: PropertyData | null;
  isolated: boolean;
  currentFloorId: string;
  onSelectProperty: (prop: PropertyData) => void;
}

export function Building({
  floors,
  properties,
  exploded,
  underground,
  selectedProperty,
  isolated,
  currentFloorId,
  onSelectProperty,
}: BuildingProps) {
  const { width, depth } = BUILDING_DIMENSIONS;

  const propertiesByFloor = useMemo(() => {
    const map: Record<string, PropertyData[]> = {};
    for (const prop of properties) {
      if (!map[prop.floorId]) map[prop.floorId] = [];
      map[prop.floorId].push(prop);
    }
    return map;
  }, [properties]);

  const baseGeo = useMemo(() => new THREE.BoxGeometry(width, 0.01, depth), [width, depth]);
  const baseEdges = useMemo(() => new THREE.EdgesGeometry(baseGeo), [baseGeo]);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.9}
          transparent
          opacity={underground ? 0.3 : 0.8}
        />
      </mesh>

      {/* Grid helper for ground */}
      {!underground && (
        <gridHelper args={[60, 30, '#334155', '#1e293b']} position={[0, -0.08, 0]} />
      )}

      {/* Building floors */}
      {floors.map((floor, index) => (
        <FloorVolume
          key={floor.floorId}
          floor={floor}
          floorIndex={index}
          exploded={exploded}
          underground={underground}
          selectedProperty={selectedProperty}
          isolated={isolated}
          floorProperties={propertiesByFloor[floor.floorId] ?? []}
          onSelectProperty={onSelectProperty}
          isCurrentFloor={currentFloorId === floor.floorId}
        />
      ))}

      {/* Building base outline */}
      <lineSegments geometry={baseEdges}>
        <lineBasicMaterial color="#0ea5e9" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}
