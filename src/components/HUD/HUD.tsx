import { Building2, Layers, Eye, ArrowDownUp, RotateCcw, Crosshair, Globe, ArrowLeft } from 'lucide-react';
import { FLOOR_NAMES, FLOOR_SHORT_NAMES } from '@/data/constants';
import type { FloorData } from '@/types';

interface HUDProps {
  currentFloorId: string;
  currentFloor: FloorData | undefined;
  enteredBuilding: boolean;
  exploded: boolean;
  underground: boolean;
  onToggleExploded: () => void;
  onToggleUnderground: () => void;
  onReset: () => void;
  showCrosshair: boolean;
  onOpenGIS?: () => void;
  onBackToHome?: () => void;
  onMoveForward?: (val: boolean) => void;
  onMoveBackward?: (val: boolean) => void;
  onMoveLeft?: (val: boolean) => void;
  onMoveRight?: (val: boolean) => void;
  onInteractClick?: () => void;
}

export function HUD({
  currentFloorId,
  currentFloor,
  enteredBuilding,
  exploded,
  underground,
  onToggleExploded,
  onToggleUnderground,
  onReset,
  showCrosshair,
  onOpenGIS,
  onBackToHome,
  onMoveForward,
  onMoveBackward,
  onMoveLeft,
  onMoveRight,
  onInteractClick,
}: HUDProps) {
  return (
    <>
      {/* Top-left: Navigation Bar & Brand */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2.5">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white shadow-lg"
            title="Return to Home"
          >
            <ArrowLeft className="h-4 w-4 text-cyan-400" />
            <span>HOME</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 rounded-lg border border-slate-700/50 bg-slate-900/70 px-4 py-2 backdrop-blur-md">
          <Building2 className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-sm font-bold tracking-wide text-white">VOLU-CAD 3D</div>
            <div className="text-[10px] tracking-wider text-slate-400">
              {enteredBuilding ? 'PROPERTY EXPLORER' : 'EXTERIOR VIEW'}
            </div>
          </div>
        </div>

        {onOpenGIS && (
          <button
            onClick={onOpenGIS}
            className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 px-3.5 py-2 text-xs font-bold text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40 transition-all hover:scale-105 hover:border-cyan-400 hover:from-cyan-900/90 hover:to-blue-900/90 hover:text-cyan-100 hover:shadow-cyan-500/20 active:scale-95"
            title="Open GIS Globe"
          >
            <Globe className="h-4 w-4 text-cyan-300 animate-pulse" />
            <span>OPEN GIS GLOBE</span>
          </button>
        )}
      </div>

      {/* Top-right: Current floor info */}
      <div className="pointer-events-none absolute right-4 top-4 z-10">
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/70 px-4 py-2.5 text-right backdrop-blur-md">
          <div className="text-[10px] tracking-wider text-slate-400">CURRENT FLOOR</div>
          <div className="text-lg font-bold text-cyan-300">{FLOOR_SHORT_NAMES[currentFloorId] ?? currentFloorId}</div>
          {currentFloor && (
            <div className="mt-1 space-y-0.5 text-[10px] text-slate-400">
              <div>AREA: {currentFloor.floorArea.toLocaleString()} sq.ft</div>
              <div>HEIGHT: {currentFloor.floorHeight.toFixed(1)} m</div>
              <div>Z: {currentFloor.zMin.toFixed(1)} — {currentFloor.zMax.toFixed(1)} m</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Center: Keyboard hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-4 rounded-lg border border-slate-700/50 bg-slate-900/70 px-5 py-2 backdrop-blur-md">
          <span className="text-xs text-slate-300"><kbd className="font-mono text-cyan-300">WASD / Arrow Keys</kbd> Move</span>
          <span className="text-xs text-slate-300"><kbd className="font-mono text-cyan-300">Mouse Drag</kbd> Look 360°</span>
          <span className="text-xs text-slate-300"><kbd className="font-mono text-cyan-300">E</kbd> Interact</span>
          <span className="text-xs text-slate-300"><kbd className="font-mono text-cyan-300">Space</kbd> Jump</span>
        </div>
      </div>

      {/* Right side: Mode buttons */}
      <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2 space-y-2">
        <button
          onClick={onToggleExploded}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium backdrop-blur-md transition-all ${
            exploded
              ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
              : 'border-slate-700/50 bg-slate-900/70 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300'
          }`}
        >
          <ArrowDownUp className="h-4 w-4" />
          <span className="whitespace-nowrap">{exploded ? 'RESET STRUCTURE' : 'EXPLORE VERTICAL'}</span>
        </button>
        <button
          onClick={onToggleUnderground}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium backdrop-blur-md transition-all ${
            underground
              ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
              : 'border-slate-700/50 bg-slate-900/70 text-slate-300 hover:border-amber-400/40 hover:text-amber-300'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span className="whitespace-nowrap">{underground ? 'HIDE BASEMENT' : 'UNDERGROUND VIEW'}</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/70 px-3 py-2.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-all hover:border-slate-600 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="whitespace-nowrap">RESET VIEW</span>
        </button>
      </div>

      {/* Crosshair */}
      {showCrosshair && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="h-5 w-5 text-cyan-400/40" />
        </div>
      )}

      {/* Floor name display (center top) */}
      {enteredBuilding && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/70 px-4 py-1.5 backdrop-blur-md">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-slate-200">{FLOOR_NAMES[currentFloorId] ?? currentFloorId}</span>
          </div>
        </div>
      )}
    </>
  );
}
