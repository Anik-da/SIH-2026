import React, { useState } from 'react';
import { X, CheckCircle, Home, Layers, DollarSign, ExternalLink, Filter, ShieldCheck, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  buildingName?: string;
}

interface Unit {
  id: string;
  number: string;
  floor: string;
  type: string;
  sqft: number;
  rent: number;
  status: 'Occupied' | 'Vacant' | 'Notice';
  color: string;
}

const DEMO_UNITS: Unit[] = [
  { id: 'u501', number: 'UNIT 501', floor: 'Floor 5', type: '3 Bed / 2 Bath Penthouse', sqft: 1850, rent: 85000, status: 'Occupied', color: 'bg-emerald-500' },
  { id: 'u502', number: 'UNIT 502', floor: 'Floor 5', type: '2 Bed / 2 Bath Suite', sqft: 1350, rent: 62000, status: 'Vacant', color: 'bg-cyan-500' },
  { id: 'u401', number: 'UNIT 401', floor: 'Floor 4', type: '2 Bed / 2 Bath Deluxe', sqft: 1280, rent: 58000, status: 'Occupied', color: 'bg-emerald-500' },
  { id: 'u402', number: 'UNIT 402', floor: 'Floor 4', type: '3 Bed / 3 Bath Premium', sqft: 1600, rent: 74000, status: 'Notice', color: 'bg-amber-500' },
  { id: 'u301', number: 'UNIT 301', floor: 'Floor 3', type: '2 Bed / 2 Bath Tech Hub', sqft: 1250, rent: 55000, status: 'Occupied', color: 'bg-emerald-500' },
  { id: 'u302', number: 'UNIT 302', floor: 'Floor 3', type: '1 Bed / 1 Bath Studio', sqft: 820, rent: 38000, status: 'Vacant', color: 'bg-cyan-500' },
  { id: 'u201', number: 'UNIT 201', floor: 'Floor 2', type: '2 Bed / 2 Bath Executive', sqft: 1250, rent: 54000, status: 'Occupied', color: 'bg-emerald-500' },
  { id: 'u202', number: 'UNIT 202', floor: 'Floor 2', type: '3 Bed / 2 Bath Commercial', sqft: 1550, rent: 71000, status: 'Occupied', color: 'bg-emerald-500' },
  { id: 'u101', number: 'UNIT 101', floor: 'Floor 1', type: 'Retail / Showroom Unit', sqft: 2100, rent: 110000, status: 'Occupied', color: 'bg-emerald-500' },
  { id: 'u102', number: 'UNIT 102', floor: 'Floor 1', type: 'Lobby Cafe & Office Space', sqft: 1400, rent: 68000, status: 'Notice', color: 'bg-amber-500' },
];

export const RealFinderInspectModal: React.FC<Props> = ({ isOpen, onClose, buildingName = 'B1-A Commercial Skyscraper' }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit>(DEMO_UNITS[6]); // Unit 201 default
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Occupied' | 'Vacant' | 'Notice'>('ALL');

  if (!isOpen) return null;

  const filteredUnits = DEMO_UNITS.filter((u) => activeFilter === 'ALL' || u.status === activeFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-lg">
      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl">
        {/* Top Header Filter Bar (Matching Image 1) */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">{buildingName}</h2>
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="h-3 w-3 text-cyan-400" />
                ULPIN: ULPIN-IN-MH-2026-89421 · 24412 Star Valley Dr
              </p>
            </div>
          </div>

          {/* Top Filter Chips */}
          <div className="flex items-center gap-2">
            {(['ALL', 'Occupied', 'Vacant', 'Notice'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {filter === 'ALL' ? 'All Units' : filter}
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-4 rounded-xl border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area: Split View (Image 1 & Image 2) */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {/* Left Column: 3D Unit Occupancy Grid (7 cols) */}
          <div className="relative flex flex-col justify-between border-r border-slate-800 bg-slate-950/60 p-6 lg:col-span-7">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Interactive 3D Unit Stacking & Occupancy
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> 92.2% Leased Occupied
                </span>
              </div>

              {/* 3D Unit Grid Blocks (Matching Image 1 Multi-Color Stack) */}
              <div className="grid grid-cols-2 gap-3">
                {filteredUnits.map((unit) => {
                  const isSelected = selectedUnit.id === unit.id;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{unit.number}</span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            unit.status === 'Occupied'
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                              : unit.status === 'Vacant'
                              ? 'bg-cyan-400 shadow-sm shadow-cyan-400'
                              : 'bg-amber-400 shadow-sm shadow-amber-400'
                          }`}
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-slate-300">{unit.type}</p>
                        <p className="mt-1 text-xs font-bold text-cyan-300">
                          ₹{unit.rent.toLocaleString()}/mo · {unit.sqft} sq.ft
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Legend Bar (Matching Image 1) */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">92.2% Leased Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-500" />
                <span className="text-slate-300">3.1% Leased Vacant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-slate-300">4.7% Occupied on Notice</span>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Unit Detail + 2D CAD Floor Plan Blueprint (5 cols) */}
          <div className="flex flex-col justify-between bg-slate-900 p-6 lg:col-span-5 overflow-y-auto">
            <div>
              <div className="mb-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-100">{selectedUnit.number}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      selectedUnit.status === 'Occupied'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : selectedUnit.status === 'Vacant'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {selectedUnit.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{selectedUnit.type} · {selectedUnit.floor}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
                  <div>
                    <span className="text-[11px] text-slate-400">Monthly Rent</span>
                    <p className="text-base font-bold text-cyan-300">₹{selectedUnit.rent.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Rate / Sq.Ft</span>
                    <p className="text-base font-bold text-slate-200">
                      ₹{Math.round(selectedUnit.rent / selectedUnit.sqft)}/sq.ft
                    </p>
                  </div>
                </div>
              </div>

              {/* CAD Blueprint / Vector Floor Plan View (Matching Image 1 Right Side) */}
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2D Architectural CAD Blueprint
                  </span>
                  <span className="text-[10px] text-cyan-400">DWG / DXF Verified</span>
                </div>
                <div className="relative flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-cyan-500/40 bg-slate-900/90 p-4">
                  {/* Vector SVG Blueprint Diagram */}
                  <svg className="h-full w-full stroke-cyan-400/80 fill-cyan-500/10" viewBox="0 0 200 120">
                    <rect x="10" y="10" width="180" height="100" strokeWidth="2" />
                    <rect x="25" y="20" width="70" height="40" strokeWidth="1" strokeDasharray="3 3" />
                    <rect x="105" y="20" width="75" height="45" strokeWidth="1" />
                    <rect x="25" y="65" width="70" height="35" strokeWidth="1" />
                    <rect x="105" y="70" width="75" height="30" strokeWidth="1" />
                    <circle cx="60" cy="40" r="4" fill="none" strokeWidth="1" />
                    <text x="35" y="42" fill="#38bdf8" fontSize="8" stroke="none">Master Bed</text>
                    <text x="118" y="45" fill="#38bdf8" fontSize="8" stroke="none">Living Room</text>
                    <text x="38" y="85" fill="#38bdf8" fontSize="8" stroke="none">Kitchen</text>
                    <text x="122" y="88" fill="#38bdf8" fontSize="8" stroke="none">Balcony</text>
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:bg-cyan-400"
            >
              Close Unit Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
