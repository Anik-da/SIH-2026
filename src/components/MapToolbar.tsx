import { useState } from 'react';
import { Home, ZoomIn, ZoomOut, Maximize2, Compass, Ruler, Box, Map, RotateCcw, RotateCw, Eye, Sparkles, Activity, Moon, Flame, Monitor, Sun } from 'lucide-react';
import type { SensorMode } from '../utils/godsEyeShaders';

interface MapToolbarProps {
  onHome: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth: () => void;
  onToggleFullscreen: () => void;
  is3D: boolean;
  onToggle2D3D: () => void;
  isMeasuring: boolean;
  onToggleMeasure: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onTiltView?: () => void;
  activeSensorMode?: SensorMode;
  onSelectSensorMode?: (mode: SensorMode) => void;
}

interface ToolButton {
  icon: typeof Home;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export default function MapToolbar({
  onHome,
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onToggleFullscreen,
  is3D,
  onToggle2D3D,
  isMeasuring,
  onToggleMeasure,
  onRotateLeft,
  onRotateRight,
  onTiltView,
  activeSensorMode = 'NORMAL',
  onSelectSensorMode,
}: MapToolbarProps) {
  const [showOpticsMenu, setShowOpticsMenu] = useState(false);

  const buttons: ToolButton[] = [
    { icon: Home, label: 'Home', onClick: onHome },
    { icon: ZoomIn, label: 'Zoom In', onClick: onZoomIn },
    { icon: ZoomOut, label: 'Zoom Out', onClick: onZoomOut },
    { icon: RotateCcw, label: 'Rotate 45° Left', onClick: onRotateLeft || (() => {}) },
    { icon: RotateCw, label: 'Rotate 45° Right', onClick: onRotateRight || (() => {}) },
    { icon: Eye, label: 'Change 3D Pitch / Tilt', onClick: onTiltView || (() => {}) },
    { icon: Compass, label: 'Reset North', onClick: onResetNorth },
    { icon: Ruler, label: 'Measure', onClick: onToggleMeasure, active: isMeasuring },
    { icon: Maximize2, label: 'Fullscreen', onClick: onToggleFullscreen },
  ];

  const sensorModes: { mode: SensorMode; label: string; icon: typeof Sun; color: string }[] = [
    { mode: 'NORMAL', label: 'Normal GIS', icon: Sun, color: 'text-slate-300' },
    { mode: 'NVG', label: 'NVG Night Vision', icon: Moon, color: 'text-emerald-400' },
    { mode: 'FLIR', label: 'FLIR Thermal', icon: Flame, color: 'text-amber-400' },
    { mode: 'CRT', label: 'CRT Tactical', icon: Monitor, color: 'text-cyan-400' },
    { mode: 'NOIR', label: 'NOIR Intelligence', icon: Activity, color: 'text-indigo-400' },
  ];

  return (
    <div className="pointer-events-auto flex flex-col gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/80 p-2 backdrop-blur-md shadow-2xl relative">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          title={btn.label}
          className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
            btn.active
              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/50'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-300'
          }`}
        >
          <btn.icon className="h-5 w-5" />
          <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {btn.label}
          </span>
        </button>
      ))}

      {/* God's Eye View Optics Sensor Mode Selector */}
      <div className="relative border-t border-slate-700/60 pt-1.5">
        <button
          onClick={() => setShowOpticsMenu((prev) => !prev)}
          title={`God's Eye Optics Sensor: ${activeSensorMode}`}
          className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
            activeSensorMode !== 'NORMAL'
              ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-amber-300'
          }`}
        >
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            Optics Sensor: {activeSensorMode}
          </span>
        </button>

        {showOpticsMenu && (
          <div className="absolute left-14 bottom-0 z-50 w-52 rounded-xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" /> God's Eye Optics
            </div>
            {sensorModes.map((s) => (
              <button
                key={s.mode}
                onClick={() => {
                  if (onSelectSensorMode) onSelectSensorMode(s.mode);
                  setShowOpticsMenu(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                  activeSensorMode === s.mode
                    ? 'bg-amber-500/20 text-amber-300 font-semibold ring-1 ring-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2D / 3D toggle — separate pill */}
      <div className="border-t border-slate-700/60 pt-1.5">
        <button
          onClick={onToggle2D3D}
          title={is3D ? 'Switch to 2D' : 'Switch to 3D'}
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-all duration-200 hover:bg-slate-700/50 hover:text-cyan-300"
        >
          {is3D ? <Box className="h-5 w-5" /> : <Map className="h-5 w-5" />}
          <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {is3D ? '3D Mode' : '2D Mode'}
          </span>
        </button>
      </div>
    </div>
  );
}
