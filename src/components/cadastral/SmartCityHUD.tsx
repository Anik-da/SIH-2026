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
    <div className="pointer-events-none absolute inset-x-0 bottom-16 z-20 px-4 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Banner Telemetry Bar */}
      <div className="pointer-events-auto absolute -top-[calc(100vh-145px)] left-4 right-4 flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-slate-950/90 px-4 py-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        {/* Left metrics */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black tracking-wider text-white">SMART CITY DIGITAL TWIN</span>
            <span className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="hidden items-center gap-4 lg:flex border-l border-slate-800 pl-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Occupancy: </span>
              <span className="font-bold text-cyan-400">88.4%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Safety: </span>
              <span className="font-bold text-emerald-400">99.2%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">ULPIN Parcels: </span>
              <span className="font-bold text-purple-400">14,587</span>
            </div>
          </div>
        </div>

        {/* Right Environment & Dashboard Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs">
            <CloudSun className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold text-white">25°C Clear</span>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-md hover:bg-cyan-500/25"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{collapsed ? 'Show Dashboard Analytics' : 'Hide Dashboard Analytics'}</span>
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Dashboard Panel */}
      {!collapsed && (
        <div className="pointer-events-auto mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-4">
          {/* Panel 1: Annual Cadastral Valuation */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/85 p-4 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Total 3D Valuation</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-1 text-2xl font-black text-white">₹ 8,125,184,000</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-900">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>Residential: ₹5.2B</span>
              <span>Commercial: ₹2.9B</span>
            </div>
          </div>

          {/* Panel 2: Live Sub-Surface Energy & Utility Meters */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/85 p-4 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Utility Grid Monitoring</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                <Zap className="mx-auto h-4 w-4 text-amber-400" />
                <span className="mt-1 block text-[10px] text-slate-400">Power</span>
                <span className="text-xs font-black text-amber-300">740 kW/h</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                <Droplets className="mx-auto h-4 w-4 text-cyan-400" />
                <span className="mt-1 block text-[10px] text-slate-400">Water</span>
                <span className="text-xs font-black text-cyan-300">128 m³/h</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                <Activity className="mx-auto h-4 w-4 text-purple-400" />
                <span className="mt-1 block text-[10px] text-slate-400">Fiber</span>
                <span className="text-xs font-black text-purple-300">10 Gbps</span>
              </div>
            </div>
          </div>

          {/* Panel 3: Land Use Zoning Distribution */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/85 p-4 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Land Use Distribution</span>
              <PieChartIcon className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-slate-300">Residential (54%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="text-slate-300">Commercial (27%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">Green Reserve (12%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300">Sub-surface Utility (7%)</span>
                </div>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-cyan-400/80 bg-slate-900 text-xs font-black text-white shadow-inner">
                100%
              </div>
            </div>
          </div>

          {/* Panel 4: Recent ULPIN Spatial Approvals */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/85 p-4 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Recent Spatial Approvals</span>
              <FileCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-900/80 p-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                  <div>
                    <p className="font-bold text-white text-[11px]">Commercial Complex B4-A</p>
                    <span className="text-[9px] text-slate-400">VPID: VP-001-B04-F08</span>
                  </div>
                </div>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">Approved</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-900/80 p-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <div>
                    <p className="font-bold text-white text-[11px]">Sub-surface Parking B1</p>
                    <span className="text-[9px] text-slate-400">VPID: VP-001-B01-UG1</span>
                  </div>
                </div>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
