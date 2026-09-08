import React from 'react';
import { Navigation2, RotateCcw, RotateCw } from 'lucide-react';
import { LocationSearchBar } from './cadastral/LocationSearchBar';

interface CameraControlsProps {
  onGoToDemo: () => void;
  onResetView: () => void;
  onSelectLocation?: (lat: number, lon: number, height: number, name?: string) => void;
  onToggle360Orbit?: () => void;
  isOrbiting360?: boolean;
}

export default function CameraControls({
  onGoToDemo,
  onResetView,
  onSelectLocation,
  onToggle360Orbit,
  isOrbiting360 = false,
}: CameraControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2 select-none">
      {/* Top action row */}
      <div className="flex items-center gap-2">
        <button
          onClick={onGoToDemo}
          className="group flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-cyan-200 backdrop-blur-md shadow-2xl transition-all hover:bg-cyan-500/20 hover:text-white active:scale-95"
        >
          <Navigation2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110 text-cyan-400" />
          <span>Focus Building</span>
        </button>

        {/* 360° Continuous Orbit Rotation Button */}
        <button
          onClick={onToggle360Orbit}
          className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-2xl transition-all active:scale-95 ${
            isOrbiting360
              ? 'border-cyan-400 bg-cyan-500/30 text-cyan-200 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'border-slate-700/60 bg-slate-900/90 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-500/15 hover:text-white'
          }`}
          title="Toggle continuous 360° Orbit rotation around the center target (Right-Drag or Middle-Drag to orbit manually)"
        >
          <RotateCw className={`h-3.5 w-3.5 text-cyan-400 ${isOrbiting360 ? 'animate-spin text-cyan-300' : 'transition-transform group-hover:rotate-90'}`} />
          <span>{isOrbiting360 ? 'Orbiting 360°' : '360° Orbit'}</span>
        </button>

        <button
          onClick={onResetView}
          className="group flex items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md shadow-xl transition-all hover:text-white active:scale-95"
          title="Reset camera to default view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Real-Time Location Search with GPS Navigator */}
      <LocationSearchBar
        onSelectLocation={(lat, lon, height, name) => onSelectLocation?.(lat, lon, height || 650, name)}
        direction="up"
      />
    </div>
  );
}
