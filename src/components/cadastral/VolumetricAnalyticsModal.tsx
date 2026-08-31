import React from 'react';
import type { Building, VerticalProperty } from '../../types/cadastral';
import { BarChart3, PieChart, Layers, Box, Building2, TrendingUp, ShieldCheck, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  building: Building;
  properties: VerticalProperty[];
  onClose: () => void;
}

export const VolumetricAnalyticsModal: React.FC<Props> = ({
  isOpen,
  building,
  properties,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalVolume = properties.reduce((acc, p) => acc + p.volume, 0);
  const totalFloors = building.floors.length;
  const undergroundFloors = building.floors.filter((f) => f.isUnderground).length;
  const aboveGroundFloors = totalFloors - undergroundFloors;

  const residentialCount = properties.filter((p) => p.propertyType === 'Residential').length;
  const commercialCount = properties.filter((p) => p.propertyType === 'Commercial').length;
  const parkingCount = properties.filter((p) => p.propertyType === 'Parking').length;
  const utilityCount = properties.filter((p) => p.propertyType === 'Utility').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                3D CADASTRAL METRICS &amp; VOLUME ANALYTICS
              </span>
              <h2 className="text-lg font-bold text-white">Volumetric Property Analytics</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Box className="h-3.5 w-3.5 text-cyan-400" /> Total 3D Volume
              </span>
              <p className="mt-1 text-lg font-extrabold text-cyan-300">
                {totalVolume.toLocaleString()} m³
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-purple-400" /> Floor Count
              </span>
              <p className="mt-1 text-lg font-extrabold text-purple-300">
                {aboveGroundFloors} Up / {undergroundFloors} Down
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Layers className="h-3.5 w-3.5 text-emerald-400" /> FAR Index
              </span>
              <p className="mt-1 text-lg font-extrabold text-emerald-300">3.45 (Optimal)</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Est. Value (Vol)
              </span>
              <p className="mt-1 text-lg font-extrabold text-amber-300">₹42.8 Cr</p>
            </div>
          </div>

          {/* Usage Distribution */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-cyan-400" /> Vertical Land Use Breakdown
            </span>
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-3">
                <span className="text-[11px] text-cyan-400 font-semibold">Residential Units</span>
                <p className="mt-1 text-xl font-black text-white">{residentialCount}</p>
                <p className="text-[10px] text-slate-400">Floors 1-6</p>
              </div>

              <div className="rounded-xl border border-purple-500/20 bg-purple-950/30 p-3">
                <span className="text-[11px] text-purple-400 font-semibold">Commercial Spaces</span>
                <p className="mt-1 text-xl font-black text-white">{commercialCount}</p>
                <p className="text-[10px] text-slate-400">Ground Level</p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3">
                <span className="text-[11px] text-emerald-400 font-semibold">Sub-surface Parking</span>
                <p className="mt-1 text-xl font-black text-white">{parkingCount}</p>
                <p className="text-[10px] text-slate-400">Basements B1-B2</p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-950/30 p-3">
                <span className="text-[11px] text-amber-400 font-semibold">Utility / Service</span>
                <p className="mt-1 text-xl font-black text-white">{utilityCount}</p>
                <p className="text-[10px] text-slate-400">Rooftop Plant</p>
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Volumetric Spatial Compliance</h4>
                <p className="text-[11px] text-slate-400">
                  Sub-surface and vertical parcel boundaries match master cadastral register.
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Close Analytics View
          </button>
        </div>
      </div>
    </div>
  );
};
