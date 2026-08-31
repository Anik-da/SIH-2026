import React, { useState } from 'react';
import {
  X,
  Map,
  BarChart3,
  Layers,
  Filter,
  CheckCircle2,
  PieChart as PieChartIcon,
  Clock,
  Building,
  TrendingUp,
  FileCheck2,
  Sliders,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ZoningDashboardModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeLayer, setActiveLayer] = useState<string>('Industrial Zones');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="flex h-[92vh] w-full max-w-7xl flex-col rounded-3xl border border-cyan-500/30 bg-slate-950 shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Civic Land Use & Zoning Intelligence</h2>
                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  Zoning Ordinance 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Search land plots, permits, infrastructure regulations & master plan compliance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-950">
          {/* Left Sidebar: Map Layers & Filters */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Map Layers
            </h3>

            <div className="space-y-1.5 text-xs">
              {['Residential Zones', 'Commercial Areas', 'Industrial Zones', 'Infrastructure', 'Green Spaces'].map((layer) => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.5 transition-all ${
                    activeLayer === layer
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span>{layer}</span>
                  <span className={`h-2 w-2 rounded-full ${activeLayer === layer ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-400" />
                Zoning Filters
              </h3>
              <div className="mt-2 space-y-2 text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-300">
                  <span className="text-[10px] text-slate-500 block">Zoning Status</span>
                  <span className="font-bold text-cyan-300">Approved & Restricted</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-300">
                  <span className="text-[10px] text-slate-500 block">Development Stage</span>
                  <span className="font-bold text-emerald-300">Active Construction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Map Visual Canvas */}
          <div className="lg:col-span-2 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300">Urban Spatial Grid — Downtown West Zone</span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                Satellite + 3D Mesh
              </span>
            </div>

            {/* Graphic Map View */}
            <div className="relative flex-1 rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-center my-auto">
                <div className="relative h-56 w-full flex items-center justify-center">
                  <div className="h-44 w-72 rotate-6 rounded-2xl border-2 border-cyan-400/80 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-300">CIVIC CENTER PARK</span>
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">Zoned: Green Reserve</span>
                    </div>
                    <div className="my-auto grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="rounded border border-slate-800 bg-slate-950 p-1 font-bold text-cyan-300">S Hope St</div>
                      <div className="rounded border border-slate-800 bg-slate-950 p-1 font-bold text-purple-300">W 3rd St</div>
                      <div className="rounded border border-slate-800 bg-slate-950 p-1 font-bold text-emerald-300">Grand Ave</div>
                    </div>
                    <div className="text-[9px] text-slate-400 text-center">Latitude: 34.0537° N · Longitude: 118.2526° W</div>
                  </div>
                </div>
              </div>

              {/* Bottom Impact Timeline */}
              <div className="relative z-10 grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                  <span className="block font-bold text-cyan-300">2022 — High</span>
                  <span className="text-slate-500 text-[9px]">Residential</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                  <span className="block font-bold text-purple-300">2023 — Med</span>
                  <span className="text-slate-500 text-[9px]">Industrial</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                  <span className="block font-bold text-emerald-300">2024 — Low</span>
                  <span className="text-slate-500 text-[9px]">Rezoning</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                  <span className="block font-bold text-amber-300">2025 — High</span>
                  <span className="text-slate-500 text-[9px]">Expansion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Analytics & Recent Permits */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-400" />
              Land Use Distribution
            </h3>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Residential</span>
                <span className="font-bold text-cyan-400">54%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Commercial</span>
                <span className="font-bold text-purple-400">27%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Industrial</span>
                <span className="font-bold text-emerald-400">12%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Others</span>
                <span className="font-bold text-amber-400">7%</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-cyan-400" />
                Recent Permits
              </h3>

              <div className="mt-2 space-y-2 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">New Commercial Complex</span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">Approved</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1">Permit #PERM-2026-8812</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">Residential Development</span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">Pending</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1">Permit #PERM-2026-9043</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
