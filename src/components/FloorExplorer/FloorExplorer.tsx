import { Layers, ChevronRight } from 'lucide-react';
import { FLOOR_IDS, FLOOR_SHORT_NAMES, FLOOR_NAMES } from '@/data/constants';
import { building } from '@/data/buildingData';

interface FloorExplorerProps {
  currentFloorId: string;
  onSelectFloor: (floorId: string) => void;
}

export function FloorExplorer({ currentFloorId, onSelectFloor }: FloorExplorerProps) {
  const reversedFloors = [...building.floors].reverse();

  return (
    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-slate-700/50 px-3 py-2">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] font-semibold tracking-wider text-slate-400">FLOORS</span>
        </div>
        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {reversedFloors.map((floor) => {
            const isActive = currentFloorId === floor.floorId;
            return (
              <button
                key={floor.floorId}
                onClick={() => onSelectFloor(floor.floorId)}
                className={`group flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  <span className="font-medium">{FLOOR_SHORT_NAMES[floor.floorId]}</span>
                </span>
                <span className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100">
                  Z:{floor.zMin.toFixed(1)}m
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
