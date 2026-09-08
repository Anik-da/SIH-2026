import React from 'react';
import { Navigation2, RotateCcw } from 'lucide-react';
import { LocationSearchBar } from './cadastral/LocationSearchBar';

interface CameraControlsProps {
  onGoToDemo: () => void;
  onResetView: () => void;
  onSelectLocation?: (lat: number, lon: number, height: number, name?: string) => void;
}

export default function CameraControls({ onGoToDemo, onResetView, onSelectLocation }: CameraControlsProps) {
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
