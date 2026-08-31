import { Navigation2, RotateCcw, Globe } from 'lucide-react';
import { DEMO_LOCATIONS } from '../types/gis';

interface CameraControlsProps {
  onGoToDemo: () => void;
  onResetView: () => void;
  onSelectLocation?: (lat: number, lon: number, height: number) => void;
}

export default function CameraControls({ onGoToDemo, onResetView, onSelectLocation }: CameraControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onGoToDemo}
          className="group flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-cyan-200 backdrop-blur-md shadow-2xl transition-all hover:bg-cyan-500/20 hover:text-white"
        >
          <Navigation2 className="h-4 w-4 transition-transform group-hover:scale-110" />
          Focus 3D Building
        </button>

        <button
          onClick={onResetView}
          className="group flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 backdrop-blur-md shadow-xl transition-all hover:text-white"
          title="Reset camera to default view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* 3D City Location Presets (Shanghai Photorealistic 3D Mesh) */}
      <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-xl">
        <Globe className="h-3.5 w-3.5 text-cyan-400 ml-1.5" />
        <select
          onChange={(e) => {
            const loc = DEMO_LOCATIONS.find((l) => l.id === e.target.value);
            if (loc) {
              onSelectLocation?.(loc.latitude, loc.longitude, loc.height);
            }
          }}
          className="bg-transparent text-xs font-bold text-cyan-300 outline-none cursor-pointer pr-1"
          defaultValue="shanghai"
        >
          {DEMO_LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
              {loc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
