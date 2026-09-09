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

  const leftColumnButtons: ToolButton[] = [
    { icon: Home, label: 'Home View', onClick: onHome },
    { icon: ZoomIn, label: 'Zoom In (+)', onClick: onZoomIn },
    { icon: ZoomOut, label: 'Zoom Out (-)', onClick: onZoomOut },
    { icon: Compass, label: 'Reset North (0°)', onClick: onResetNorth },
    { icon: Ruler, label: 'Measure Distance', onClick: onToggleMeasure, active: isMeasuring },
    { icon: is3D ? Box : Map, label: is3D ? 'Switch to 2D Mode' : 'Switch to 3D Mode', onClick: onToggle2D3D, active: is3D },
  ];

  const rightColumnButtons: ToolButton[] = [
    { icon: RotateCw, label: isOrbiting360 ? 'Stop 360° Orbit' : 'Start 360° Orbit', onClick: onToggle360Orbit || (() => {}), active: isOrbiting360 },
    { icon: RotateCcw, label: 'Orbit 45° Left', onClick: onRotateLeft || (() => {}) },
    { icon: RotateCw, label: 'Orbit 45° Right', onClick: onRotateRight || (() => {}) },
    { icon: Eye, label: 'Tilt Camera Angle', onClick: onTiltView || (() => {}) },
    { icon: Maximize2, label: 'Toggle Fullscreen', onClick: onToggleFullscreen },
  ];

  const sensorModes: { mode: SensorMode; label: string; icon: typeof Sun; color: string; key: string }[] = [
    { mode: 'NORMAL', label: 'Normal GIS', icon: Sun, color: 'text-amber-400', key: 'F7' },
    { mode: 'NVG', label: 'NVG Night Vision', icon: Moon, color: 'text-emerald-400', key: 'F6' },
    { mode: 'FLIR', label: 'FLIR Thermal', icon: Flame, color: 'text-rose-400', key: 'F5' },
    { mode: 'CRT', label: 'CRT Tactical', icon: Monitor, color: 'text-cyan-400', key: 'F4' },
    { mode: 'NOIR', label: 'NOIR Intelligence', icon: Activity, color: 'text-indigo-400', key: 'F3' },
  ];

  return (
    <div className="pointer-events-auto flex flex-col gap-1.5 rounded-2xl border border-slate-700/70 bg-slate-900/95 p-1.5 backdrop-blur-xl shadow-2xl relative w-[76px] select-none">
      {/* 2-Column Grid Layout (Ultra-Compact) */}
      <div className="grid grid-cols-2 gap-1">
        {leftColumnButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            title={btn.label}
            className={`group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              btn.active
                ? 'bg-cyan-500/25 text-cyan-300 ring-1 ring-cyan-400/60 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-300'
            }`}
          >
            <btn.icon className="h-4 w-4" />
            <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-100 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 z-50 border border-slate-700">
              {btn.label}
            </span>
          </button>
        ))}

        {rightColumnButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            title={btn.label}
            className={`group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              btn.active
                ? 'bg-cyan-500/25 text-cyan-300 ring-1 ring-cyan-400/60 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-300'
            }`}
          >
            <btn.icon className="h-4 w-4" />
            <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-100 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 z-50 border border-slate-700">
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      {/* Full-width God's Eye View Optics Sensor Mode Selector */}
      <div className="relative border-t border-slate-800 pt-1">
        <button
          onClick={() => setShowOpticsMenu((prev) => !prev)}
          title={`God's Eye Optics Sensor: ${activeSensorMode}`}
          className={`group flex h-8 w-full items-center justify-center gap-1 rounded-lg transition-all duration-200 ${
            activeSensorMode !== 'NORMAL' || showOpticsMenu
              ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-tight text-amber-300">
            {activeSensorMode}
          </span>
        </button>

        {showOpticsMenu && (
          <>
            {/* Backdrop click listener */}
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setShowOpticsMenu(false)}
            />
            {/* 100% Opaque Solid Dark Card Positioned Clear of Left Toolbar */}
            <div className="absolute left-full ml-3 bottom-0 z-[9999] w-64 rounded-xl border-2 border-amber-500/60 bg-slate-950 p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.95)] ring-2 ring-amber-500/40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400 border-b border-slate-800 mb-2 flex items-center justify-between bg-slate-900/90 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-spin-slow" /> GOD'S EYE OPTICS
                </span>
                <span className="rounded bg-amber-500/30 px-2 py-0.5 text-[10px] text-amber-200 font-mono font-bold border border-amber-500/40">
                  {activeSensorMode}
                </span>
              </div>
              <div className="space-y-1.5">
                {sensorModes.map((s) => (
                  <button
                    key={s.mode}
                    onClick={() => {
                      if (onSelectSensorMode) onSelectSensorMode(s.mode);
                      setShowOpticsMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                      activeSensorMode === s.mode
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'text-slate-100 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                      <span className="tracking-wide text-slate-100">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {s.key}
                      </span>
                      {activeSensorMode === s.mode && (
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
