import React from 'react';
import {
  Layers,
  Box,
  Compass,
  Zap,
  Activity,
  Maximize2,
  Sliders,
  Sparkles,
  Radio,
  Eye,
} from 'lucide-react';
import type { ExplodeState } from '../../types/cadastral';

interface Props {
  explodeState: ExplodeState;
  showUnderground: boolean;
  showUtilities: boolean;
  onToggleExplode: () => void;
  onToggleUnderground: () => void;
  onToggleUtilities: () => void;
  onOpenAnalytics: () => void;
  onOpenBlueprint: () => void;
}

export const StitchControlDock: React.FC<Props> = ({
  explodeState,
  showUnderground,
  showUtilities,
  onToggleExplode,
  onToggleUnderground,
  onToggleUtilities,
  onOpenAnalytics,
  onOpenBlueprint,
}) => {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
      {/* 2D CAD Blueprint Converter Button */}
      <button
        onClick={onOpenBlueprint}
        className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/20 active:scale-95"
      >
        <Sparkles className="h-4 w-4 text-cyan-400" />
        <span>2D CAD → 3D BIM Converter</span>
      </button>
      {/* 3D Explode Button */}
      <button
        onClick={onToggleExplode}
        className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all active:scale-95 ${
          explodeState === 'exploded'
            ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30'
            : 'border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-cyan-500/40 hover:text-white'
        }`}
      >
        <Sliders className="h-4 w-4" />
        <span>{explodeState === 'exploded' ? '3D Exploded View' : 'Explode 3D Floors'}</span>
        {explodeState === 'exploded' && (
          <span className="flex h-2 w-2 rounded-full bg-slate-950 animate-ping" />
        )}
      </button>

      {/* Sub-Surface Underground Button */}
      <button
        onClick={onToggleUnderground}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
          showUnderground
            ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-md shadow-purple-500/20'
            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
        }`}
      >
        <Layers className="h-4 w-4 text-purple-400" />
        <span>Sub-Surface ($Z &lt; 0$)</span>
      </button>

      {/* Underground Utilities Network Toggle */}
      <button
        onClick={onToggleUtilities}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
          showUtilities
            ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20'
            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
        }`}
      >
        <Zap className="h-4 w-4 text-amber-400" />
        <span>Utility Pipelines</span>
      </button>

      {/* Live Telemetry Analytics */}
      <button
        onClick={onOpenAnalytics}
        className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/20 active:scale-95"
      >
        <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
        <span>Volumetric HUD</span>
      </button>
    </div>
  );
};
