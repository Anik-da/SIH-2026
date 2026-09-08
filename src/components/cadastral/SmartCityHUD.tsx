import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Droplets,
  CloudSun,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Building2,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
  Layers,
  MapPin,
} from 'lucide-react';

interface Props {
  onOpenAnalytics: () => void;
  onOpenValidation: () => void;
}

export const SmartCityHUD: React.FC<Props> = ({ onOpenAnalytics, onOpenValidation }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {/* Centered Top Telemetry Pill - Zero collision with Left Floor Slider or Right Panels */}
      <div className="pointer-events-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-slate-950/90 px-3.5 py-1.5 shadow-xl backdrop-blur-xl ring-1 ring-white/10 whitespace-nowrap">
        {/* Live Indicator & Title */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-black tracking-wider text-white">SMART CITY DIGITAL TWIN</span>
          <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
            LIVE
          </span>
        </div>

        {/* Live Metrics */}
        <div className="hidden lg:flex items-center gap-3 border-l border-slate-800 pl-3 text-xs">
          <div>
            <span className="text-[9px] text-slate-400 uppercase">Occupancy: </span>
            <span className="font-bold text-cyan-400 text-[11px]">88.4%</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase">Safety: </span>
            <span className="font-bold text-emerald-400 text-[11px]">99.2%</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase">ULPINs: </span>
            <span className="font-bold text-purple-400 text-[11px]">14,587</span>
          </div>
        </div>

        {/* Weather & Dashboard Toggle */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300">
            <CloudSun className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold">25°C</span>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-bold text-cyan-300 shadow-sm hover:bg-cyan-500/25 transition-all"
          >
            <TrendingUp className="h-3 w-3" />
            <span>{collapsed ? 'Dashboard' : 'Close'}</span>
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Bottom Telemetry Dashboard (Only when toggled) */}
      {!collapsed && (
        <div className="pointer-events-auto absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
            {/* Panel 1: Annual Cadastral Valuation */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">3D Valuation</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="mt-1 text-lg font-black text-white">₹ 8,125,184,000</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
              </div>
              <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                <span>Res: ₹5.2B</span>
                <span>Com: ₹2.9B</span>
              </div>
            </div>

            {/* Panel 2: Live Sub-Surface Energy & Utility Meters */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Utility Grids</span>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-1.5">
                  <span className="block text-[9px] text-slate-400">Power</span>
                  <span className="text-[11px] font-black text-amber-300">740 kW</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-1.5">
                  <span className="block text-[9px] text-slate-400">Water</span>
                  <span className="text-[11px] font-black text-cyan-300">128 m³</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-1.5">
                  <span className="block text-[9px] text-slate-400">Fiber</span>
                  <span className="text-[11px] font-black text-purple-300">10G</span>
                </div>
              </div>
            </div>

            {/* Panel 3: Land Use Zoning Distribution */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Zoning Split</span>
                <PieChartIcon className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span className="text-slate-300">Residential (54%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    <span className="text-slate-300">Commercial (27%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300">Green (12%)</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400/80 bg-slate-950 text-[10px] font-black text-white">
                  100%
                </div>
              </div>
            </div>

            {/* Panel 4: Quick Actions & Approvals */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cadastral Status</span>
                <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="space-y-1.5 my-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 truncate">Commercial B4-A</span>
                  <span className="rounded bg-emerald-500/20 px-1 py-0.2 font-bold text-emerald-300">Active</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 truncate">Basement B1 Duct</span>
                  <span className="rounded bg-cyan-500/20 px-1 py-0.2 font-bold text-cyan-300">Verified</span>
                </div>
              </div>
              <button
                onClick={onOpenAnalytics}
                className="w-full py-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 rounded-lg transition"
              >
                View Full 3D Analytics →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
