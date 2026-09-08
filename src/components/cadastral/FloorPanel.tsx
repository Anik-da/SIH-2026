import React, { useState } from 'react';
import {
  Layers,
  Eye,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Box,
  Building,
  ShieldCheck,
  FileText,
  AlertCircle,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import type { MongoBuildingDocument, MongoFloorDocument } from '../../types/mongodbBuilding';

interface FloorPanelProps {
  building: MongoBuildingDocument;
  floors: MongoFloorDocument[];
  selectedFloorId?: string | null;
  explodeState?: 'collapsed' | 'exploded';
  onSelectFloor3D?: (floor: MongoFloorDocument) => void;
  onExplodeToggle?: (isExploded: boolean) => void;
  onIsolateFloor?: (floorId: string | null) => void;
  onOpenVerticalProperty?: (floor: MongoFloorDocument) => void;
  onOpenValidation?: () => void;
  onOpenPassport?: () => void;
  onClose: () => void;
}

export const FloorPanel: React.FC<FloorPanelProps> = ({
  building,
  floors,
  selectedFloorId: externalSelectedFloorId,
  explodeState = 'collapsed',
  onSelectFloor3D,
  onExplodeToggle,
  onIsolateFloor,
  onOpenVerticalProperty,
  onOpenValidation,
  onOpenPassport,
  onClose,
}) => {
  const [internalSelectedFloorId, setInternalSelectedFloorId] = useState<string | null>(null);
  const activeFloorId = externalSelectedFloorId || internalSelectedFloorId;

  const isExploded = explodeState === 'exploded';
  const hasAny3DGeometry = floors.some((f) => f.has3DGeometry);

  const selectedFloor = floors.find((f) => f.floorId === activeFloorId) || floors[0];

  const totalFloors = floors.length > 0 ? floors.length : building.floorCount + building.basementCount;
  const basementCount = floors.filter((f) => f.floorNumber < 0).length || building.basementCount;
  const aboveGroundCount = totalFloors - basementCount;

  // Case A vs Case B geometry feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExplodeClick = () => {
    if (!hasAny3DGeometry) {
      setToastMessage('Floor metadata available — floor-level geometry unavailable in current 3D dataset.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    onExplodeToggle?.(!isExploded);
  };

  const handleIsolateClick = (floorId: string) => {
    if (!hasAny3DGeometry) {
      setToastMessage('Floor metadata available — floor-level geometry unavailable in current 3D dataset.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    onIsolateFloor?.(floorId);
  };

  return (
    <div className="fixed right-6 top-20 z-50 w-96 rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-5 backdrop-blur-2xl shadow-2xl text-slate-100 animate-in slide-in-from-right duration-300 max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white tracking-wide">BUILDING FLOORS</h3>
            <p className="text-xs text-cyan-400 font-mono truncate max-w-[200px]">{building.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition"
        >
          ✕
        </button>
      </div>

      {/* Building Floor Summary Bar */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3 text-center shrink-0">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL FLOORS</span>
          <span className="text-sm font-extrabold text-white font-mono">{totalFloors}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">ABOVE GROUND</span>
          <span className="text-sm font-extrabold text-cyan-400 font-mono">{aboveGroundCount}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">BASEMENTS</span>
          <span className="text-sm font-extrabold text-indigo-400 font-mono">{basementCount}</span>
        </div>
      </div>

      {/* Geometry Case Notice Banner */}
      {!hasAny3DGeometry ? (
        <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 leading-relaxed shrink-0 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-200 block mb-0.5">Floor Metadata Available</span>
            Floor-level geometry is unavailable in the current 3D tile dataset. Structural attributes are loaded from persistent MongoDB records.
          </div>
        </div>
      ) : (
        <div className="mb-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed shrink-0 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-200 block mb-0.5 font-mono">3D FLOOR MESH ACTIVE</span>
            Interactive 3D floor geometry available. Click <span className="font-semibold text-white">[EXPLODE FLOORS]</span> to separate 3D levels.
          </div>
        </div>
      )}

      {/* Toast Alert for Case B */}
      {toastMessage && (
        <div className="mb-3 p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-xs text-red-200 animate-in fade-in shrink-0 font-medium">
          ⚠️ {toastMessage}
        </div>
      )}

      {/* Interactive Floor List */}
      <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {floors.slice().reverse().map((floor) => {
          const isSelected = activeFloorId === floor.floorId;

          return (
            <div
              key={floor.floorId}
              onClick={() => {
                setInternalSelectedFloorId(floor.floorId);
                if (floor.has3DGeometry && onSelectFloor3D) {
                  onSelectFloor3D(floor);
                }
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-400 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold ${
                    floor.floorNumber < 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {floor.floorNumber < 0 ? `B${Math.abs(floor.floorNumber)}` : floor.floorNumber === 1 ? 'GF' : `F${floor.floorNumber}`}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-white block">{floor.floorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Z: {floor.zMin}m - {floor.zMax}m ({floor.floorHeight}m h)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {floor.has3DGeometry ? (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      3D MESH
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      META ONLY
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIsolateClick(floor.floorId);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                    title="Isolate Floor in 3D"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Floor Inspection Card */}
      {selectedFloor && (
        <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 shrink-0 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-xs text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              {selectedFloor.floorName} Inspection
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              VPID: VPID-KA-BLR-{building.buildingId.slice(-3)}-F{Math.abs(selectedFloor.floorNumber)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">FLOOR AREA</span>
              <span className="font-bold text-white">{selectedFloor.area} m²</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">ELEVATION</span>
              <span className="font-bold text-cyan-400">{selectedFloor.zMin}m to {selectedFloor.zMax}m</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenVerticalProperty?.(selectedFloor)}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 flex items-center justify-center gap-1 transition"
            >
              <Building className="w-3 h-3" /> [Vertical Property]
            </button>
            <button
              onClick={onOpenPassport}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 flex items-center justify-center gap-1 transition"
            >
              <FileText className="w-3 h-3" /> [Passport]
            </button>
          </div>
        </div>
      )}

      {/* Bottom Master Control Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={handleExplodeClick}
          className={`py-2 px-3 rounded-2xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition border ${
            isExploded
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-900/30'
          }`}
        >
          {isExploded ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" /> [RESET BUILDING]
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-cyan-200" /> [EXPLODE FLOORS]
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (activeFloorId) {
              handleIsolateClick(activeFloorId);
            } else if (floors.length > 0) {
              handleIsolateClick(floors[0].floorId);
            }
          }}
          className="py-2 px-3 rounded-2xl text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> [ISOLATE FLOOR]
        </button>
      </div>
    </div>
  );
};
