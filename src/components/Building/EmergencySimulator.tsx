import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { AlertTriangle, Flame, ShieldCheck, ArrowRight, Volume2, VolumeX, Zap, Biohazard } from 'lucide-react';
import { BUILDING_DIMENSIONS, FLOOR_HEIGHT } from '@/data/constants';

export interface EmergencyState {
  isActive: boolean;
  floorId: string;
  type: 'FIRE' | 'ELECTRICAL' | 'GAS';
  floorName: string;
  description: string;
}

interface Emergency3DViewProps {
  emergency?: EmergencyState | null;
  currentFloorId: string;
}

export function Emergency3DView({ emergency, currentFloorId }: Emergency3DViewProps) {
  const sirenLight1Ref = useRef<THREE.PointLight>(null);
  const sirenLight2Ref = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flash = Math.sin(t * 14) > 0;
    
    if (sirenLight1Ref.current) {
      sirenLight1Ref.current.intensity = flash ? 6.0 : 0.8;
    }
    if (sirenLight2Ref.current) {
      sirenLight2Ref.current.intensity = !flash ? 6.0 : 0.8;
    }
    if (flameRef.current) {
      flameRef.current.scale.set(
        1 + Math.sin(t * 10) * 0.2,
        1 + Math.cos(t * 12) * 0.25,
        1 + Math.sin(t * 8) * 0.2
      );
    }
    if (smokeRef.current) {
      smokeRef.current.position.y = 1.6 + Math.sin(t * 3) * 0.3;
      smokeRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.15);
    }
  });

  if (!emergency || !emergency.isActive || emergency.floorId !== currentFloorId) return null;

  const { width, depth } = BUILDING_DIMENSIONS;

  return (
    <group position={[0, 0, 0]}>
      {/* Red/Amber Flashing Siren Strobe Lights */}
      <pointLight ref={sirenLight1Ref} position={[-width / 3, FLOOR_HEIGHT - 0.4, -depth / 3]} color="#ef4444" distance={18} />
      <pointLight ref={sirenLight2Ref} position={[width / 3, FLOOR_HEIGHT - 0.4, depth / 3]} color="#f97316" distance={18} />

      {/* Pulsing Red Hazard Bounding Edge around Floor */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[width + 0.1, FLOOR_HEIGHT + 0.1, depth + 0.1]} />
        <meshBasicMaterial visible={false} />
        <Edges scale={1} color="#ef4444" threshold={15} />
      </mesh>

      {/* 1. FIRE HAZARD VISUALS */}
      {emergency.type === 'FIRE' && (
        <group position={[2.5, 0.2, -1.5]}>
          <group ref={flameRef}>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshBasicMaterial color="#dc2626" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <coneGeometry args={[0.8, 1.4, 16]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0.3, 0.6, 0.2]}>
              <coneGeometry args={[0.5, 1.0, 12]} />
              <meshBasicMaterial color="#eab308" transparent opacity={0.9} />
            </mesh>
            <pointLight color="#f97316" intensity={4.5} distance={10} />
          </group>

          {/* Volumetric Smoke Cloud */}
          <group ref={smokeRef} position={[0, 1.8, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.9, 16, 16]} />
              <meshStandardMaterial color="#1e293b" transparent opacity={0.6} roughness={0.9} />
            </mesh>
            <mesh position={[0.4, 0.3, -0.3]}>
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshStandardMaterial color="#334155" transparent opacity={0.5} roughness={0.9} />
            </mesh>
          </group>

          <Html position={[0, 2.3, 0]} center occlude>
            <div className="flex items-center gap-1.5 rounded-full border-2 border-red-500 bg-red-950/90 px-3.5 py-1.5 text-xs font-black text-white backdrop-blur-md animate-bounce shadow-xl shadow-red-950/80">
              <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
              <span>🔥 ACTIVE FIRE HAZARD — OXYGEN ALARM</span>
            </div>
          </Html>
        </group>
      )}

      {/* 2. ELECTRICAL HAZARD VISUALS */}
      {emergency.type === 'ELECTRICAL' && (
        <group position={[-2.5, 0.8, -1.0]}>
          <mesh>
            <boxGeometry args={[1.2, 1.6, 0.6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <pointLight color="#06b6d4" intensity={5.0} distance={10} />
          <mesh position={[0, 0, 0.35]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <Html position={[0, 1.6, 0]} center occlude>
            <div className="flex items-center gap-1.5 rounded-full border-2 border-cyan-400 bg-cyan-950/90 px-3.5 py-1.5 text-xs font-black text-cyan-200 backdrop-blur-md animate-pulse shadow-xl shadow-cyan-950/80">
              <Zap className="h-4 w-4 text-cyan-400 animate-bounce" />
              <span>⚡ HIGH VOLTAGE ELECTRICAL ARC FAILURE</span>
            </div>
          </Html>
        </group>
      )}

      {/* 3. GAS LEAK HAZARD VISUALS */}
      {emergency.type === 'GAS' && (
        <group position={[0, 0.6, 1.5]}>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[1.4, 24, 24]} />
            <meshStandardMaterial color="#84cc16" transparent opacity={0.4} roughness={0.8} />
          </mesh>
          <pointLight color="#84cc16" intensity={3.5} distance={10} />
          <Html position={[0, 1.8, 0]} center occlude>
            <div className="flex items-center gap-1.5 rounded-full border-2 border-lime-400 bg-lime-950/90 px-3.5 py-1.5 text-xs font-black text-lime-200 backdrop-blur-md animate-bounce shadow-xl shadow-lime-950/80">
              <Biohazard className="h-4 w-4 text-lime-400 animate-pulse" />
              <span>☣ TOXIC GAS PIPELINE LEAK — WEAR MASKS</span>
            </div>
          </Html>
        </group>
      )}

      {/* Dynamic Neon Green Evacuation Route Arrows Leading to Rear Exit */}
      <group position={[0, 0.05, 0]}>
        {[-4.0, -2.5, -1.0, 0.5, 2.0, 3.5].map((z, idx) => (
          <group key={`evac-arrow-${idx}`} position={[0, 0, z]}>
            {/* Illuminated Floor Pad */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.2, 0.5]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.85} />
            </mesh>
            <pointLight color="#10b981" intensity={1.5} distance={3} position={[0, 0.2, 0]} />

            {/* Floating 3D Evacuation Text & Direction */}
            <Html position={[0, 0.15, 0]} center occlude>
              <div className="text-[11px] font-black text-emerald-200 tracking-widest flex items-center gap-1.5 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400/60 backdrop-blur-sm animate-pulse shadow-md">
                <span>ESCAPE ROUTE</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-300 animate-bounce" />
              </div>
            </Html>
          </group>
        ))}
      </group>

      {/* Overhead Illuminated Emergency Stairwell Exit Door Sign */}
      <group position={[0, FLOOR_HEIGHT - 0.5, -depth / 2 + 0.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 0.6, 0.15]} />
          <meshBasicMaterial color="#059669" />
        </mesh>
        <pointLight color="#10b981" intensity={3.0} distance={8} />
        <Html position={[0, 0, 0.1]} center occlude>
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-600 px-4 py-1.5 text-xs font-black text-white shadow-2xl animate-pulse flex items-center gap-1.5">
            <span>🚪 EMERGENCY STAIRWELL EXIT B</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px]">CLEAR</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

interface EmergencyHUDProps {
  emergency?: EmergencyState | null;
  currentFloorId?: string;
  onEvacuate: () => void;
  onDismiss: () => void;
  onTriggerRandom: () => void;
}

export function EmergencyHUDBanner({ emergency, currentFloorId, onEvacuate, onDismiss, onTriggerRandom }: EmergencyHUDProps) {
  const [alarmMuted, setAlarmMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Siren audio is active ONLY when player is on the specific floor where the emergency occurs
  const isOnEmergencyFloor = Boolean(
    emergency &&
    emergency.isActive &&
    (!currentFloorId || emergency.floorId === currentFloorId)
  );

  // Synthesize Web Audio Alarm Siren when player is on the emergency floor
  useEffect(() => {
    if (!emergency || !emergency.isActive || alarmMuted || !isOnEmergencyFloor) {
      if (sirenOscRef.current) {
        try { sirenOscRef.current.stop(); } catch { /* ignore */ }
        sirenOscRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      // Dual-frequency siren sweep (800Hz - 1200Hz repeat)
      const now = ctx.currentTime;
      for (let i = 0; i < 60; i++) {
        osc.frequency.exponentialRampToValueAtTime(1200, now + i * 0.8 + 0.4);
        osc.frequency.exponentialRampToValueAtTime(700, now + i * 0.8 + 0.8);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      sirenOscRef.current = osc;
      gainNodeRef.current = gain;
    } catch {
      // Audio context policy fallback
    }

    return () => {
      if (sirenOscRef.current) {
        try { sirenOscRef.current.stop(); } catch { /* ignore */ }
        sirenOscRef.current = null;
      }
    };
  }, [emergency, currentFloorId, alarmMuted, isOnEmergencyFloor]);

  if (!emergency || !emergency.isActive) {
    return (
      <div className="absolute top-20 right-4 z-20">
        <button
          onClick={onTriggerRandom}
          className="flex items-center gap-2 rounded-xl border border-red-500/60 bg-gradient-to-r from-red-950/90 via-red-900/80 to-amber-950/90 px-4 py-2.5 text-xs font-black text-red-200 backdrop-blur-md shadow-xl transition-all hover:scale-105 hover:border-red-400 active:scale-95 ring-1 ring-red-500/40"
          title="Simulate Random Emergency Hazard"
        >
          <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
          <span>🚨 TRIGGER EMERGENCY HAZARD</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-16 left-1/2 z-30 -translate-x-1/2 w-full max-w-2xl p-4 animate-in slide-in-from-top duration-300">
      <div className="rounded-2xl border-2 border-red-500 bg-slate-950/95 p-4 text-white shadow-2xl shadow-red-950/90 backdrop-blur-xl ring-2 ring-red-500/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600/30 text-red-400 border-2 border-red-500 animate-pulse shadow-lg shadow-red-950">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white animate-pulse">
                  CRITICAL DISASTER EMERGENCY
                </span>
                <span className="text-xs font-extrabold text-red-300">{emergency.floorName}</span>
              </div>
              <h4 className="text-sm font-black text-white mt-1 leading-snug">{emergency.description}</h4>
            </div>
          </div>

          <button
            onClick={() => setAlarmMuted(!alarmMuted)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
              alarmMuted
                ? 'border-slate-700 bg-slate-800 text-slate-400'
                : 'border-red-500/60 bg-red-950/80 text-red-300 animate-pulse'
            }`}
            title={alarmMuted ? 'Unmute Siren Alarm' : 'Mute Siren Alarm'}
          >
            {alarmMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-red-400" />}
            <span>{alarmMuted ? 'Muted' : 'Siren ON'}</span>
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-red-900/60 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Follow Neon Green Floor Arrows &rarr; Exit B</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEvacuate}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-black text-slate-950 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-emerald-950/80"
            >
              <span>FOLLOW ESCAPE ROUTE</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onDismiss}
              className="rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
