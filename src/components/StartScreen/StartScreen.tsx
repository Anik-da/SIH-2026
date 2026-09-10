import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Building2, Play, Info, X, Globe, ArrowLeft } from 'lucide-react';
import { building } from '@/data/buildingData';
import { BUILDING_DIMENSIONS, FLOOR_HEIGHT } from '@/data/constants';

function PreviewBuilding() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const { width, depth } = BUILDING_DIMENSIONS;

  return (
    <group ref={groupRef}>
      {building.floors.map((floor) => {
        const zMin = floor.zMin;
        const isBasement = floor.floorType === 'basement';
        const isTerrace = floor.floorType === 'terrace';
        const wallColor = isBasement ? '#1e293b' : isTerrace ? '#334155' : '#475569';
        return (
          <group key={floor.floorId} position={[0, zMin, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[width, 0.15, depth]} />
              <meshStandardMaterial color={isBasement ? '#1e293b' : '#64748b'} roughness={0.8} />
            </mesh>
            {!isTerrace && (
              <mesh position={[-width / 2 + 0.1, FLOOR_HEIGHT / 2, 0]}>
                <boxGeometry args={[0.2, FLOOR_HEIGHT - 0.15, depth]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
              </mesh>
            )}
            {!isTerrace && (
              <mesh position={[width / 2 - 0.1, FLOOR_HEIGHT / 2, 0]}>
                <boxGeometry args={[0.2, FLOOR_HEIGHT - 0.15, depth]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
              </mesh>
            )}
            {!isTerrace && (
              <mesh position={[0, FLOOR_HEIGHT / 2, -depth / 2 + 0.1]}>
                <boxGeometry args={[width, FLOOR_HEIGHT - 0.15, 0.2]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
              </mesh>
            )}
            {!isTerrace && !isBasement && (
              <>
                <mesh position={[-width / 2 + 0.1, FLOOR_HEIGHT / 2, -depth / 4]}>
                  <boxGeometry args={[0.2, 1.2, 2]} />
                  <meshStandardMaterial color="#0c4a6e" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
                </mesh>
                <mesh position={[-width / 2 + 0.1, FLOOR_HEIGHT / 2, depth / 4]}>
                  <boxGeometry args={[0.2, 1.2, 2]} />
                  <meshStandardMaterial color="#0c4a6e" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
                </mesh>
                <mesh position={[width / 2 - 0.1, FLOOR_HEIGHT / 2, -depth / 4]}>
                  <boxGeometry args={[0.2, 1.2, 2]} />
                  <meshStandardMaterial color="#0c4a6e" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
                </mesh>
                <mesh position={[width / 2 - 0.1, FLOOR_HEIGHT / 2, depth / 4]}>
                  <boxGeometry args={[0.2, 1.2, 2]} />
                  <meshStandardMaterial color="#0c4a6e" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

interface StartScreenProps {
  onEnter: () => void;
  onOpenGIS?: () => void;
  onBackToHome?: () => void;
}

export function StartScreen({ onEnter, onOpenGIS, onBackToHome }: StartScreenProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [fading, setFading] = useState(false);

  const handleEnter = () => {
    setFading(true);
    setTimeout(onEnter, 800);
  };

  return (
    <div className={`relative h-screen w-screen overflow-hidden bg-slate-950 transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      {/* Top bar with Back and GIS globe buttons */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-3">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 text-cyan-400" />
            <span>HOME</span>
          </button>
        )}
        {onOpenGIS && (
          <button
            onClick={onOpenGIS}
            className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 px-3.5 py-2 text-xs font-bold text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40 transition-all hover:scale-105 hover:border-cyan-400 hover:from-cyan-900/90 hover:to-blue-900/90 hover:text-cyan-100 hover:shadow-cyan-500/20"
          >
            <Globe className="h-4 w-4 text-cyan-300 animate-pulse" />
            <span>OPEN GIS GLOBE</span>
          </button>
        )}
      </div>

      {/* 3D background */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [22, 14, 22], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 30, 70]} />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <PreviewBuilding />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.5}
          />
          <Environment preset="night" />
        </Canvas>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          COSMOPLOT <span className="text-cyan-400">3D</span>
        </h1>
        <p className="mt-3 text-lg font-medium tracking-wider text-slate-300 sm:text-xl">
          Vertical Property Explorer
        </p>
        <p className="mt-2 max-w-md text-center text-sm text-slate-400">
          Explore land, buildings and vertical property in 3D
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={handleEnter}
            className="group flex items-center gap-3 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-8 py-4 text-base font-semibold text-cyan-300 backdrop-blur-sm transition-all hover:scale-105 hover:border-cyan-400/70 hover:bg-cyan-500/20 hover:text-cyan-200 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <Play className="h-5 w-5 fill-current" />
            ENTER PROPERTY
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
          >
            <Info className="h-4 w-4" />
            HOW TO EXPLORE
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 z-10 text-center text-xs text-slate-500">
        3D ULPIN Generation &amp; Vertical Property Mapping System — Prototype Demonstration
      </div>

      {/* Help modal */}
      {showHelp && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
          <div className="mx-4 max-w-lg rounded-xl border border-slate-700/50 bg-slate-900/95 p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">How to Explore</h2>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3"><kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-cyan-300">W A S D</kbd> Move around the building</div>
              <div className="flex items-center gap-3"><kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-cyan-300">Mouse</kbd> Look around</div>
              <div className="flex items-center gap-3"><kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-cyan-300">Shift</kbd> Run</div>
              <div className="flex items-center gap-3"><kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-cyan-300">Space</kbd> Jump</div>
              <div className="flex items-center gap-3"><kbd className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-cyan-300">E</kbd> Interact with doors, elevator, and properties</div>
              <div className="my-4 h-px bg-slate-700" />
              <p className="text-xs text-slate-400">Click the 3D viewport to lock your mouse. Press ESC to release it. Walk up to the building entrance and press E to enter. Find the elevator to navigate between floors. Approach property units and press E to inspect them.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
