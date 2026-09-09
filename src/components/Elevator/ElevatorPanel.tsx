import { useState } from 'react';
import { X, ArrowUp } from 'lucide-react';
import { FLOOR_IDS, FLOOR_SHORT_NAMES, FLOOR_NAMES } from '@/data/constants';
import { building } from '@/data/buildingData';

interface ElevatorPanelProps {
  open: boolean;
  currentFloorId: string;
  onSelectFloor: (floorId: string) => void;
  onClose: () => void;
}

export function ElevatorPanel({ open, currentFloorId, onSelectFloor, onClose }: ElevatorPanelProps) {
  if (!open) return null;

  const reversedFloors = [...building.floors].reverse();

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-72 rounded-2xl border border-slate-700/50 bg-slate-900/95 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-wider text-cyan-400">ELEVATOR</div>
            <div className="text-lg font-bold text-white">SELECT FLOOR</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {reversedFloors.map((floor) => {
            const isActive = currentFloorId === floor.floorId;
            return (
              <button
                key={floor.floorId}
                onClick={() => onSelectFloor(floor.floorId)}
                disabled={isActive}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                    : 'border-slate-700/40 bg-slate-800/40 text-slate-300 hover:border-cyan-400/30 hover:bg-slate-800/70 hover:text-cyan-200'
                }`}
              >
                <span className="font-medium">{FLOOR_SHORT_NAMES[floor.floorId]}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500">Z:{floor.zMin.toFixed(1)}m</span>
                  {isActive ? (
                    <span className="text-[9px] font-semibold text-cyan-400">HERE</span>
                  ) : (
                    <ArrowUp className="h-3 w-3 text-slate-500" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
