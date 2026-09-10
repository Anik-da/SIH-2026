import { Edges, Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { PropertyData } from '@/types';
import { generateThreeDUlpin } from '@/utils/idUtils';

interface PropertyVolumeProps {
  property: PropertyData;
  isSelected: boolean;
  isDimmed: boolean;
  isIsolated: boolean;
  exploded?: boolean;
  floorIndex?: number;
  onSelect: (prop: PropertyData) => void;
}

export function PropertyVolume({
  property,
  isSelected,
  isDimmed,
  isIsolated,
  onSelect,
}: PropertyVolumeProps) {
  if (isIsolated && !isSelected) return null;

  const color = isSelected
    ? '#38bdf8'
    : property.propertyType === 'Residential'
    ? '#475569'
    : property.propertyType === 'Commercial'
    ? '#64748b'
    : '#334155';
  const emissive = isSelected ? '#0ea5e9' : '#000000';
  const emissiveIntensity = isSelected ? 0.5 : 0;

  return (
    <group position={[property.position[0], 0.02, property.position[2]]}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(property);
        }}
      >
        {/* Floor decal pad */}
        <boxGeometry args={[property.dimensions[0], 0.03, property.dimensions[2]]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.6 : 0.2}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
        />
        <Edges threshold={15} color={isSelected ? '#38bdf8' : '#0284c7'} />
      </mesh>
      {isSelected && (
        <Html position={[0, 1.2, 0]} center distanceFactor={10} occlude>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-cyan-400/50 bg-slate-900/90 px-3 py-1.5 text-center backdrop-blur-sm">
            <div className="text-[10px] font-semibold tracking-wider text-cyan-300">{property.vpid}</div>
            <div className="text-[9px] text-slate-400">3D ULPIN: {generateThreeDUlpin(property.floorId)}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

