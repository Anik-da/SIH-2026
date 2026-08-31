import React, { useState } from 'react';
import {
  X,
  FileCode,
  Layers,
  Upload,
  CheckCircle2,
  Box,
  Eye,
  Sliders,
  Maximize2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BlueprintConverterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'unit_breakdown'>('blueprint');
  const [conversionProgress, setConversionProgress] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState('UNIT 201 (B5)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-3xl border border-cyan-500/30 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">2D CAD Blueprint → 3D Volumetric Converter</h2>
                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  Auto-BIM Extruder
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Import DWG / DXF Architectural Drawings to generate 3D VPID Cadastral Volumes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  activeTab === 'blueprint' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                2D/3D Split View
              </button>
              <button
                onClick={() => setActiveTab('unit_breakdown')}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  activeTab === 'unit_breakdown' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unit Matrix
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/60">
          {/* Left / Main 2D & 3D Interactive Canvas */}
          <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Source CAD Document: <span className="text-cyan-400">FLOOR_PLAN_2F_TOWER_B5.DWG</span></span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" /> Vector Topology Parsed (100%)
              </span>
            </div>

            {/* Visual CAD Vector Schematic Canvas Mockup */}
            <div className="relative flex-1 rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-2 gap-4 w-full h-full">
                {/* 2D Blueprint Schematic */}
                <div className="relative rounded-lg border border-cyan-500/30 bg-slate-900/60 p-4 flex flex-col justify-between">
                  <div className="absolute top-2 left-2 rounded bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                    2D VECTOR CAD BLUEPRINT
                  </div>
                  {/* Schematic Drawing Lines */}
                  <div className="my-auto flex items-center justify-center">
                    <svg className="w-full h-48 stroke-cyan-400 fill-none stroke-[1.5]" viewBox="0 0 200 150">
                      <rect x="20" y="20" width="160" height="110" rx="4" className="stroke-cyan-400 stroke-2" />
                      <line x1="20" y1="60" x2="180" y2="60" className="stroke-cyan-500/60" />
                      <line x1="90" y1="20" x2="90" y2="130" className="stroke-cyan-500/60" />
                      <rect x="30" y="30" width="45" height="25" className="stroke-emerald-400 fill-emerald-500/10" />
                      <text x="35" y="46" className="fill-emerald-300 text-[8px] font-mono">UNIT 201</text>
                      <rect x="100" y="30" width="65" height="25" className="stroke-purple-400 fill-purple-500/10" />
                      <text x="105" y="46" className="fill-purple-300 text-[8px] font-mono">UNIT 202</text>
                      <rect x="30" y="70" width="135" height="45" className="stroke-amber-400 fill-amber-500/10" />
                      <text x="35" y="95" className="fill-amber-300 text-[8px] font-mono">COMMON LOBBY & UTILITY</text>
                    </svg>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">Scale: 1:50 · Units: mm · Precision: 0.001m</div>
                </div>

                {/* Extruded 3D Volumetric Parcel */}
                <div className="relative rounded-lg border border-purple-500/30 bg-slate-900/60 p-4 flex flex-col justify-between">
                  <div className="absolute top-2 left-2 rounded bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                    3D EXTRUDED CADASTRA VOLUME
                  </div>
                  <div className="my-auto flex items-center justify-center">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                      <div className="h-32 w-32 rotate-12 -skew-x-12 rounded-xl border-2 border-cyan-400 bg-cyan-500/20 shadow-2xl transition-transform hover:scale-105 flex flex-col justify-center items-center">
                        <Box className="h-10 w-10 text-cyan-300 animate-pulse" />
                        <span className="text-[10px] font-black text-white mt-2">VPID: VP-001-B05-F02</span>
                        <span className="text-[9px] text-cyan-300 font-mono">Volume: 1,450 m³</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">3D Cadastral Enclosure Validated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Inspection & Attribute Control Panel */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              Selected Volumetric Unit Details
            </h3>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Unit Selection</span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-xs font-bold text-cyan-300 focus:outline-none"
              >
                <option value="UNIT 201 (B5)">UNIT 201 — Leased Occupied (Residential)</option>
                <option value="UNIT 202 (B5)">UNIT 202 — Available Vacant (Commercial)</option>
                <option value="UNIT 203 (B5)">UNIT 203 — Sub-surface Parking Slot</option>
              </select>
            </div>

            {/* Spec breakdown */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Unit Type:</span>
                <span className="font-bold text-white">2 Bed / 2 Bath Luxury Suite</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Footprint Area:</span>
                <span className="font-bold text-cyan-400">148.5 m² (1,598 sq ft)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Volumetric Envelope:</span>
                <span className="font-bold text-purple-400">445.5 m³ (Z_min=6m, Z_max=9m)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Market Value Index:</span>
                <span className="font-bold text-emerald-400">₹ 12,850,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Status:</span>
                <span className="font-bold text-emerald-400">Verified by NIC Cadastre</span>
              </div>
            </div>

            {/* CAD Layer Toggles */}
            <div className="mt-auto space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">CAD Layer Visibility Controls</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300 font-semibold">
                  <Eye className="h-3.5 w-3.5" /> Outer Walls
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 font-semibold">
                  <Eye className="h-3.5 w-3.5" /> Dimensions
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 p-2 text-purple-300 font-semibold">
                  <Eye className="h-3.5 w-3.5" /> 3D Extrude
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300 font-semibold">
                  <Eye className="h-3.5 w-3.5" /> Utilities
                </button>
              </div>

              <button
                onClick={onClose}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110"
              >
                <CheckCircle2 className="h-4 w-4" /> Apply Extruded 3D Model to Globe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
