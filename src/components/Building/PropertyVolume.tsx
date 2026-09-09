import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { PropertyData } from '@/types';
import { generateThreeDUlpin } from '@/utils/idUtils';

interface PropertyVolumeProps {
  property: PropertyData;
  isSelected: boolean;
  isDimmed: boolean;
  isIsolated: boolean;
  exploded: boolean;
  floorIndex: number;
  onSelect: (prop: PropertyData) => void;
}

export function PropertyVolume({
  property,
  isSelected,
  isDimmed,
  isIsolated,
  exploded,
  floorIndex,
  onSelect,
}: PropertyVolumeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetY = useRef(property.position[1]);
  const currentY = useRef(property.position[1]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const lerp = 1 - Math.pow(0.001, delta);
    if (exploded) {
      targetY.current = property.position[1] + floorIndex * 2.5;
    } else {
      targetY.current = property.position[1];
    }
    currentY.current += (targetY.current - currentY.current) * lerp;
    meshRef.current.position.y = currentY.current;
  });

  if (isIsolated && !isSelected) return null;

  const opacity = isDimmed ? 0.15 : isSelected ? 0.35 : 0.25;
  const color = isSelected ? '#38bdf8' : property.propertyType === 'Residential' ? '#475569' : property.propertyType === 'Commercial' ? '#64748b' : '#334155';
  const emissive = isSelected ? '#0ea5e9' : '#000000';
  const emissiveIntensity = isSelected ? 0.5 : 0;

  return (
    <group position={[property.position[0], 0, property.position[2]]}>
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(property);
        }}
      >
        <boxGeometry args={property.dimensions} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.2}
        />
        {isSelected && (
          <Edges threshold={15} color="#38bdf8" scale={1.02} />
        )}
      </mesh>
      {isSelected && (
        <Html position={[0, property.dimensions[1] / 2 + 0.5, 0]} center distanceFactor={10} occlude>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-cyan-400/50 bg-slate-900/90 px-3 py-1.5 text-center backdrop-blur-sm">
            <div className="text-[10px] font-semibold tracking-wider text-cyan-300">{property.vpid}</div>
            <div className="text-[9px] text-slate-400">3D ULPIN: {generateThreeDUlpin(property.floorId)}</div>
          </div>
        </Html>
      )}
    </group>
  );
}
