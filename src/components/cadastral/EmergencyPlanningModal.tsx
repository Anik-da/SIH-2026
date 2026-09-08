import React, { useState } from 'react';
import type { Building } from '../../types/cadastral';
import { ShieldAlert, Navigation, Flame, MapPin, X, Users, Accessibility, HeartPulse, CheckCircle2, Eye } from 'lucide-react';

interface Props {
  building: Building;
  isOpen: boolean;
  isRescueModeActive?: boolean;
  onToggleRescueMode?: (active: boolean) => void;
  onClose: () => void;
}

export const EmergencyPlanningModal: React.FC<Props> = ({
  building,
  isOpen,
  isRescueModeActive = false,
  onToggleRescueMode,
  onClose,
}) => {
  const [selectedFloorTab, setSelectedFloorTab] = useState<string>('B-001-F3');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-3xl overflow-hidden rounded-3xl border border-red-500/40 bg-slate-900 shadow-2xl">
        {/* Red Emergency Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 bg-red-950/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
                  FIRST RESPONDER 3D TACTICAL RESCUE VIEW
                </span>
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-300 border border-red-500/40">
                  DEMO DATA (SYNTHETIC)
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Emergency 3D Spatial Planning &amp; Rescue Priorities</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Building & Global Rescue Mode Toggle */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target Structure:</span>
                <span className="text-sm font-bold text-white">{building.name}</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span>ULPIN: <strong className="font-mono text-cyan-300">{building.ulpin}</strong></span>
                <span>•</span>
                <span className="font-mono text-cyan-400">{building.center.lat.toFixed(4)}°N, {building.center.lon.toFixed(4)}°E</span>
              </div>
            </div>

            {onToggleRescueMode && (
              <button
                onClick={() => onToggleRescueMode(!isRescueModeActive)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                  isRescueModeActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                <Flame className="h-4 w-4" />
                {isRescueModeActive ? '🔴 RESCUE VIEW ACTIVE (3D GLOWING)' : 'ACTIVATE 3D RESCUE VIEW'}
              </button>
            )}
          </div>

          {/* High-Risk Floor 03 Demographic Card */}
          <div className="rounded-2xl border border-red-500/50 bg-red-950/30 p-4">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400 animate-bounce" />
                <h3 className="text-sm font-black text-white">RESCUE PRIORITY — FLOOR 03 (BLDG-BLR-001-F03)</h3>
              </div>
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase animate-pulse">
                PRIORITY: IMMEDIATE
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-slate-900/90 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Senior Citizens</div>
                  <div className="text-base font-black text-amber-400">2 Residents</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-slate-900/90 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                  <Accessibility className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Mobility Assistance</div>
                  <div className="text-base font-black text-blue-400">1 Resident (Wheelchair)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-slate-900/90 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20 text-red-300">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Medical Priority</div>
                  <div className="text-base font-black text-red-400">1 (Oxygen Support)</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-red-300 bg-red-900/20 rounded-xl p-2.5 border border-red-500/20">
              <span>Risk Level: <strong>HIGH (RED in 3D scene)</strong></span>
              <span>Recommended Extraction: <strong>East Exterior Stairwell #2</strong></span>
            </div>
          </div>

          {/* Vertical Tactical Inspection Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              All 3D Floors Evacuation &amp; Hazard Status
            </span>
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {building.floors.map((floor) => {
                const isHighRisk = floor.id === 'B-001-F3' || floor.id === 'BLDG-BLR-001-F03' || floor.floorNumber === 3;
                const isMedRisk = floor.floorNumber === 4;

                return (
                  <div
                    key={floor.id}
                    onClick={() => setSelectedFloorTab(floor.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs cursor-pointer transition-all ${
                      isHighRisk
                        ? 'border-red-500/70 bg-red-950/40 ring-1 ring-red-500'
                        : isMedRisk
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : floor.isUnderground
                        ? 'border-purple-500/30 bg-purple-950/20'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold w-8 ${isHighRisk ? 'text-red-400' : 'text-cyan-400'}`}>
                        {floor.shortLabel}
                      </span>
                      <span className="font-medium text-slate-200">{floor.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">
                        Z: {floor.zMin}m to {floor.zMax}m
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          isHighRisk
                            ? 'bg-red-500 text-white animate-pulse'
                            : isMedRisk
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isHighRisk ? 'HIGH RISK — IMMEDIATE' : isMedRisk ? 'MEDIUM RISK' : 'SAFE / CLEAR'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Access Points */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <span className="text-slate-400 flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-cyan-400" /> Primary Access Route
              </span>
              <p className="mt-1 font-semibold text-slate-200">Ground North Entry (Gate 1 - 6.5m clear)</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-purple-400" /> Sub-Surface Exit Route
              </span>
              <p className="mt-1 font-semibold text-slate-200">B1 Emergency Stairwell to South Courtyard</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 bg-slate-950">
          <p className="text-[11px] text-slate-500 italic">
            * Resident privacy protected under Cadastral Emergency Act 2026. Data strictly for authorized first responders.
          </p>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Close Tactical View
          </button>
        </div>
      </div>
    </div>
  );
};
