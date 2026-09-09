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
  onToggle360Orbit?: () => void;
  isOrbiting360?: boolean;
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
  onToggle360Orbit,
  isOrbiting360 = false,
  activeSensorMode = 'NORMAL',
  onSelectSensorMode,
}: MapToolbarProps) {
  const [showOpticsMenu, setShowOpticsMenu] = useState(false);

  const buttons: ToolButton[] = [
    { icon: Home, label: 'Home', onClick: onHome },
    { icon: ZoomIn, label: 'Zoom In', onClick: onZoomIn },
    { icon: ZoomOut, label: 'Zoom Out', onClick: onZoomOut },
    { icon: RotateCw, label: isOrbiting360 ? 'Stop 360° Orbit' : 'Auto 360° Orbit', onClick: onToggle360Orbit || (() => {}), active: isOrbiting360 },
    { icon: RotateCcw, label: 'Orbit 45° Left', onClick: onRotateLeft || (() => {}) },
    { icon: RotateCw, label: 'Orbit 45° Right', onClick: onRotateRight || (() => {}) },
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
    <div className="pointer-events-auto flex flex-col gap-1 rounded-xl border border-slate-700/60 bg-slate-900/90 p-1.5 backdrop-blur-md shadow-2xl relative">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          title={btn.label}
          className={`group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
            btn.active
              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/50'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-300'
          }`}
        >
          <btn.icon className="h-4 w-4" />
          <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-50">
            {btn.label}
          </span>
        </button>
      ))}

      {/* God's Eye View Optics Sensor Mode Selector */}
      <div className="relative border-t border-slate-700/60 pt-1">
        <button
          onClick={() => setShowOpticsMenu((prev) => !prev)}
          title={`God's Eye Optics Sensor: ${activeSensorMode}`}
          className={`group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
            activeSensorMode !== 'NORMAL' || showOpticsMenu
              ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-amber-300'
          }`}
        >
          <Sparkles className="h-4 w-4 animate-pulse text-amber-400" />
          <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-50">
            God's Eye Optics: {activeSensorMode} (Click to change)
          </span>
        </button>

        {showOpticsMenu && (
          <>
            {/* Backdrop click listener to close menu */}
            <div
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => setShowOpticsMenu(false)}
            />
            <div className="absolute left-11 bottom-0 z-50 w-56 rounded-xl border border-amber-500/40 bg-slate-900/98 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 border-b border-slate-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> God's Eye Optics Sensor
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-300 font-mono">
                  {activeSensorMode}
                </span>
              </div>
              <div className="space-y-1">
                {sensorModes.map((s) => (
                  <button
                    key={s.mode}
                    onClick={() => {
                      if (onSelectSensorMode) onSelectSensorMode(s.mode);
                      setShowOpticsMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                      activeSensorMode === s.mode
                        ? 'bg-amber-500/25 text-amber-300 font-bold ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                      <span>{s.label}</span>
                    </div>
                    {activeSensorMode === s.mode && (
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2D / 3D toggle — separate pill */}
      <div className="border-t border-slate-700/60 pt-1">
        <button
          onClick={onToggle2D3D}
          title={is3D ? 'Switch to 2D' : 'Switch to 3D'}
          className="group relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-all duration-200 hover:bg-slate-700/50 hover:text-cyan-300"
        >
          {is3D ? <Box className="h-4 w-4" /> : <Map className="h-4 w-4" />}
          <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-50">
            {is3D ? '3D Mode' : '2D Mode'}
          </span>
        </button>
      </div>
    </div>
  );
}
