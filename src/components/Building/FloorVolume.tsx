import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { FloorData, PropertyData } from '@/types';
import { BUILDING_DIMENSIONS, FLOOR_HEIGHT } from '@/data/constants';
import { PropertyVolume } from './PropertyVolume';
import { FloorInterior } from './FloorInterior';
import { Emergency3DView, type EmergencyState } from './EmergencySimulator';

import type { InspectedObjectData } from './ObjectInspectionModal';

interface FloorVolumeProps {
  floor: FloorData;
  floorIndex: number;
  exploded: boolean;
  underground: boolean;
  selectedProperty: PropertyData | null;
  isolated: boolean;
  floorProperties: PropertyData[];
  onSelectProperty: (prop: PropertyData) => void;
  isCurrentFloor: boolean;
  onSelectObject?: (info: InspectedObjectData) => void;
  emergency?: EmergencyState | null;
}

export function FloorVolume({
  floor,
  floorIndex,
  exploded,
  underground,
  selectedProperty,
  isolated,
  floorProperties,
  onSelectProperty,
  isCurrentFloor,
  onSelectObject,
  emergency,
}: FloorVolumeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetY = useRef(floor.zMin);
  const currentY = useRef(floor.zMin);

  const isBasement = floor.floorType === 'basement';
  const isTerrace = floor.floorType === 'terrace';

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const lerp = 1 - Math.pow(0.001, delta);
    if (exploded) {
      targetY.current = floor.zMin + floorIndex * 2.5;
    } else {
      targetY.current = floor.zMin;
    }
    currentY.current += (targetY.current - currentY.current) * lerp;
    groupRef.current.position.y = currentY.current;
  });

  const { width, depth, wallThickness } = BUILDING_DIMENSIONS;

  // Bright, inviting architectural colors
  const wallColor = isBasement ? '#334155' : isTerrace ? '#475569' : '#f8fafc';
  const floorColor = isBasement
    ? '#1e293b'
    : isTerrace
    ? '#334155'
    : floor.floorType === 'ground'
    ? '#fef3c7'
    : floor.floorType === 'executive'
    ? '#78350f'
    : '#cbd5e1';

  const hasDimming = selectedProperty !== null && !isolated;

  const floorOpacity = underground && floor.floorId === 'G' ? 0.2 : 1;

  return (
    <group ref={groupRef}>
      {/* Interior Ambient Floor Light */}
      {!isTerrace && (
        <pointLight position={[0, FLOOR_HEIGHT - 0.4, 0]} intensity={1.4} distance={14} color="#fef08a" />
      )}

      {/* Floor slab */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.7} transparent opacity={floorOpacity} />
      </mesh>

      {/* Exterior walls */}
      <mesh position={[-width / 2 + wallThickness / 2, FLOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[wallThickness, FLOOR_HEIGHT - 0.15, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} transparent opacity={hasDimming ? 0.4 : 0.85} />
      </mesh>
      <mesh position={[width / 2 - wallThickness / 2, FLOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[wallThickness, FLOOR_HEIGHT - 0.15, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} transparent opacity={hasDimming ? 0.4 : 0.85} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, FLOOR_HEIGHT / 2, -depth / 2 + wallThickness / 2]}>
        <boxGeometry args={[width, FLOOR_HEIGHT - 0.15, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} transparent opacity={hasDimming ? 0.4 : 0.85} />
      </mesh>

      {/* Front wall */}
      {floor.floorType === 'ground' ? (
        <>
          <mesh position={[-width / 4 - 1, FLOOR_HEIGHT / 2, depth / 2 - wallThickness / 2]}>
            <boxGeometry args={[width / 2 - 2, FLOOR_HEIGHT - 0.15, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} transparent opacity={hasDimming ? 0.4 : 0.85} />
          </mesh>
          <mesh position={[width / 4 + 1, FLOOR_HEIGHT / 2, depth / 2 - wallThickness / 2]}>
            <boxGeometry args={[width / 2 - 2, FLOOR_HEIGHT - 0.15, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} transparent opacity={hasDimming ? 0.4 : 0.85} />
          </mesh>
          <mesh position={[0, FLOOR_HEIGHT - 0.5, depth / 2 - wallThickness / 2]}>
            <boxGeometry args={[2, 0.5, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} transparent opacity={hasDimming ? 0.4 : 0.85} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, FLOOR_HEIGHT / 2, depth / 2 - wallThickness / 2]}>
          <boxGeometry args={[width, FLOOR_HEIGHT - 0.15, wallThickness]} />
          <meshStandardMaterial color={wallColor} roughness={0.5} transparent opacity={hasDimming ? 0.4 : 0.85} />
        </mesh>
      )}

      {/* Architectural Glass Windows */}
      {!isBasement && !isTerrace && (
        <>
          <mesh position={[-width / 2 + wallThickness / 2, FLOOR_HEIGHT / 2, -depth / 4]}>
            <boxGeometry args={[wallThickness, 1.4, 2.2]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} transparent opacity={0.45} />
          </mesh>
          <mesh position={[-width / 2 + wallThickness / 2, FLOOR_HEIGHT / 2, depth / 4]}>
            <boxGeometry args={[wallThickness, 1.4, 2.2]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} transparent opacity={0.45} />
          </mesh>
          <mesh position={[width / 2 - wallThickness / 2, FLOOR_HEIGHT / 2, -depth / 4]}>
            <boxGeometry args={[wallThickness, 1.4, 2.2]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} transparent opacity={0.45} />
          </mesh>
          <mesh position={[width / 2 - wallThickness / 2, FLOOR_HEIGHT / 2, depth / 4]}>
            <boxGeometry args={[wallThickness, 1.4, 2.2]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} transparent opacity={0.45} />
          </mesh>
        </>
      )}

      {/* Interior Floor Simulation Details & Furniture */}
      <FloorInterior floor={floor} hasDimming={hasDimming} onSelectObject={onSelectObject} />

      {/* Emergency Disaster Visual Overlays (Sirens, Smoke, Evacuation Arrows) */}
      <Emergency3DView emergency={emergency} currentFloorId={floor.floorId} />

      {/* Floor outline highlight if current floor */}
      {isCurrentFloor && (
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[width + 0.1, 0.02, depth + 0.1]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.3} />
          <Edges threshold={15} color="#38bdf8" />
        </mesh>
      )}

      {/* Floor label in exploded view */}
      {exploded && (
        <Html position={[width / 2 + 1, FLOOR_HEIGHT / 2, 0]} center distanceFactor={12} occlude>
          <div className="pointer-events-none whitespace-nowrap rounded border border-cyan-400/40 bg-slate-900/85 px-2.5 py-1 text-center backdrop-blur-sm">
            <div className="text-xs font-bold tracking-wider text-cyan-300">{floor.shortName}</div>
            <div className="text-[9px] text-slate-400">Z: {floor.zMin.toFixed(1)}–{floor.zMax.toFixed(1)}m</div>
          </div>
        </Html>
      )}

      {/* Property volumes */}
      {floorProperties.map((prop) => (
        <PropertyVolume
          key={prop.vpid}
          property={prop}
          isSelected={selectedProperty?.vpid === prop.vpid}
          isDimmed={hasDimming && selectedProperty?.vpid !== prop.vpid}
          isIsolated={isolated}
          exploded={exploded}
          floorIndex={floorIndex}
          onSelect={onSelectProperty}
        />
      ))}
    </group>
  );
}


