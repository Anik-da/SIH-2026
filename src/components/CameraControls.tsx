import React, { useState } from 'react';
import { Navigation2, RotateCcw, Globe, Crosshair, MapPin } from 'lucide-react';
import { DEMO_LOCATIONS } from '../types/gis';

interface CameraControlsProps {
  onGoToDemo: () => void;
  onResetView: () => void;
  onSelectLocation?: (lat: number, lon: number, height: number) => void;
}

export default function CameraControls({ onGoToDemo, onResetView, onSelectLocation }: CameraControlsProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocId, setSelectedLocId] = useState('bengaluru');

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setSelectedLocId('live_gps');
        onSelectLocation?.(latitude, longitude, 500);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed or permission denied:', err);
        // Default to Indian cadastral hub if permission denied
        onSelectLocation?.(12.9716, 77.5946, 800);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2 select-none">
      <div className="flex items-center gap-2">
        {/* Live GPS Locate Me Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="group flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/80 px-3.5 py-2 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-xl transition-all hover:bg-emerald-900/90 active:scale-95 disabled:opacity-50 ring-1 ring-emerald-400/30"
          title="Fly 3D camera to your real live GPS coordinates"
        >
          <Crosshair className={`h-3.5 w-3.5 text-emerald-400 ${isLocating ? 'animate-spin' : 'group-hover:scale-110'}`} />
          <span>{isLocating ? 'Locating GPS...' : '📍 Live Location'}</span>
        </button>

        <button
          onClick={onGoToDemo}
          className="group flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-cyan-200 backdrop-blur-md shadow-2xl transition-all hover:bg-cyan-500/20 hover:text-white active:scale-95"
        >
          <Navigation2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110 text-cyan-400" />
          <span>Focus Building</span>
        </button>

        <button
          onClick={onResetView}
          className="group flex items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-900/90 px-2.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-md shadow-xl transition-all hover:text-white active:scale-95"
          title="Reset camera to default view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Cadastral Region Switcher */}
      <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/90 px-2 py-1 shadow-2xl backdrop-blur-xl">
        <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <select
          value={selectedLocId}
          onChange={(e) => {
            const locId = e.target.value;
            setSelectedLocId(locId);
            if (locId === 'live_gps') {
              handleLocateMe();
              return;
            }
            const loc = DEMO_LOCATIONS.find((l) => l.id === locId);
            if (loc) {
              onSelectLocation?.(loc.latitude, loc.longitude, loc.height);
            }
          }}
          className="bg-transparent text-[11px] font-bold text-cyan-300 outline-none cursor-pointer pr-1"
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
