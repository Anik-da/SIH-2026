import { useEffect, useState } from 'react';
import { Globe, CheckCircle2, Loader2, Fingerprint } from 'lucide-react';
import type { PropertyContext } from '@/types';

interface GISTransitionProps {
  active: boolean;
  context: PropertyContext | null;
  onComplete: () => void;
}

export function GISTransition({ active, context, onComplete }: GISTransitionProps) {
  const [phase, setPhase] = useState<'locating' | 'identified' | 'fading'>('locating');

  useEffect(() => {
    if (!active) {
      setPhase('locating');
      return;
    }
    setPhase('locating');
    const t1 = setTimeout(() => setPhase('identified'), 2000);
    const t2 = setTimeout(() => setPhase('fading'), 4000);
    const t3 = setTimeout(() => onComplete(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-1000 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Scanning effect */}
      {phase === 'locating' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 right-0 h-0.5 bg-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.5)]" style={{ animation: 'scan 1.5s ease-in-out infinite' }} />
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      <div className="relative z-10 text-center">
        {phase === 'locating' && (
          <>
            <Globe className="mx-auto h-16 w-16 text-cyan-400/60" style={{ animation: 'spin 2s linear infinite' }} />
            <div className="mt-6 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-lg font-semibold tracking-wider text-slate-200">LOCATING PROPERTY...</span>
            </div>
          </>
        )}

        {phase === 'identified' && context && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
            <h2 className="mt-4 text-2xl font-bold text-white">PROPERTY IDENTIFIED</h2>
            <div className="mt-6 space-y-3 rounded-xl border border-slate-700/50 bg-slate-900/80 px-8 py-6 text-left backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-700/40 pb-2">
                <Fingerprint className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-mono text-cyan-300">{context.vpid}</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">3D ULPIN</span>
                  <span className="font-mono text-cyan-300">{context.threeDUlpin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Floor</span>
                  <span className="text-slate-200">{context.floorId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Z Range</span>
                  <span className="text-slate-200">{context.zMin.toFixed(1)}m — {context.zMax.toFixed(1)}m</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Transitioning to GIS Globe...</p>
          </div>
        )}

        {phase === 'fading' && (
          <div className="text-lg text-slate-600">Opening GIS Globe...</div>
        )}
      </div>
    </div>
  );
}
