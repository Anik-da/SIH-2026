import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AlertTriangle, Flame, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

export interface EmergencyState {
  isActive: boolean;
  floorId: string;
  type: 'FIRE' | 'ELECTRICAL' | 'GAS';
  floorName: string;
  description: string;
}

interface Emergency3DViewProps {
  emergency: EmergencyState;
  currentFloorId: string;
}

export function Emergency3DView({ emergency, currentFloorId }: Emergency3DViewProps) {
  const sirenRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sirenRef.current) {
      sirenRef.current.intensity = Math.sin(t * 12) > 0 ? 4.0 : 0.5;
    }
    if (flameRef.current) {
      flameRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.15);
    }
  });

  if (!emergency.isActive || emergency.floorId !== currentFloorId) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Red Flashing Siren Light */}
      <pointLight ref={sirenRef} position={[0, 2.6, 0]} color="#ef4444" distance={15} />

      {/* Fire & Hazard Center (if Fire emergency) */}
      {emergency.type === 'FIRE' && (
        <group ref={flameRef} position={[2.5, 0.8, -1.5]}>
          <mesh>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial color="#dc2626" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.6, 1.2, 16]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
          </mesh>
          <pointLight color="#f97316" intensity={3.5} distance={8} />
          <Html position={[0, 1.6, 0]} center occlude>
            <div className="flex items-center gap-1.5 rounded-full border border-red-500 bg-red-950/90 px-3 py-1 text-xs font-extrabold text-red-200 backdrop-blur-md animate-bounce shadow-lg shadow-red-900/60">
              <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
              <span>ACTIVE FIRE HAZARD</span>
            </div>
          </Html>
        </group>
      )}

      {/* Neon Green Evacuation Escape Route Arrows on Floor */}
      <group position={[0, 0.04, 0]}>
        {[-3, -1.5, 0, 1.5].map((z, idx) => (
          <group key={`arrow-${idx}`} position={[0, 0, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.8, 0.4]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
            </mesh>
            <Html position={[0, 0.1, 0]} center occlude>
              <div className="text-xs font-black text-emerald-300 animate-pulse tracking-widest flex items-center gap-1">
                <span>EVACUATE</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </Html>
          </group>
        ))}
      </group>

      {/* Illuminated Emergency EXIT Sign Overhead at Stairwell Exit */}
      <group position={[0, 2.5, -4.2]}>
        <mesh>
          <boxGeometry args={[1.4, 0.5, 0.1]} />
          <meshBasicMaterial color="#059669" />
        </mesh>
        <pointLight color="#10b981" intensity={2.0} distance={6} />
        <Html position={[0, 0, 0.1]} center occlude>
          <div className="rounded border border-emerald-300 bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-lg animate-pulse">
            🚪 FIRE EXIT
          </div>
        </Html>
      </group>
    </group>
  );
}

interface EmergencyHUDProps {
  emergency: EmergencyState;
  onEvacuate: () => void;
  onDismiss: () => void;
  onTriggerRandom: () => void;
}

export function EmergencyHUDBanner({ emergency, onEvacuate, onDismiss, onTriggerRandom }: EmergencyHUDProps) {
  if (!emergency.isActive) {
    return (
      <div className="absolute top-20 right-4 z-20">
        <button
          onClick={onTriggerRandom}
          className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/80 to-amber-950/80 px-3.5 py-2 text-xs font-bold text-red-200 backdrop-blur-md shadow-lg transition-all hover:scale-105 hover:border-red-400 active:scale-95"
          title="Simulate Random Emergency Hazard"
        >
          <Flame className="h-4 w-4 text-red-400 animate-pulse" />
          <span>🚨 SIMULATE EMERGENCY ALARM</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-16 left-1/2 z-30 -translate-x-1/2 w-full max-w-xl p-4 animate-in slide-in-from-top duration-300">
      <div className="rounded-2xl border-2 border-red-500 bg-slate-950/90 p-4 text-white shadow-2xl shadow-red-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/30 text-red-400 border border-red-500 animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">EMERGENCY ACTIVE</span>
                <span className="text-xs font-bold text-red-300">{emergency.floorName}</span>
              </div>
              <h4 className="text-sm font-black text-white mt-0.5">{emergency.description}</h4>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-red-900/60 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Follow Neon Green Floor Arrows to Emergency Exit</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEvacuate}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-950/60"
            >
              <span>FOLLOW ESCAPE ROUTE</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onDismiss}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
