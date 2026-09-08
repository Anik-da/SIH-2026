import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Building2,
  Layers,
  Layout,
  Filter,
  CheckCircle2,
  DollarSign,
  Maximize2,
  Bed,
  Bath,
  Home,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  Grid
} from 'lucide-react';
import type { MongoBuildingDocument, MongoFloorDocument } from '../../types/mongodbBuilding';

interface UnitData {
  unitId: string;
  floorNumber: number;
  unitNumber: string;
  floorPlan: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  marketRent: number;
  rentPerSqFt: number;
  status: 'occupied' | 'vacant_leased' | 'vacant_available' | 'notice' | 'other';
  tenantName?: string;
  leaseEnd?: string;
}

interface BuildingStackExplorerModalProps {
  building?: MongoBuildingDocument | null;
  floors?: MongoFloorDocument[];
  onClose: () => void;
}

export const BuildingStackExplorerModal: React.FC<BuildingStackExplorerModalProps> = ({
  building,
  floors = [],
  onClose,
}) => {
  const buildingName = building?.name || 'VOLU Tower A1 High-Rise';
  const totalFloorCount = building?.floorCount || 12;

  // Filter States
  const [filterRent, setFilterRent] = useState('ALL');
  const [filterAmenities, setFilterAmenities] = useState('ALL');
  const [filterFloorPlan, setFilterFloorPlan] = useState('ALL');
  const [filterOccupancy, setFilterOccupancy] = useState('ALL');
  const [filterLeaseStatus, setFilterLeaseStatus] = useState('ALL');

  // Selected Unit State
  const [selectedUnit, setSelectedUnit] = useState<UnitData>({
    unitId: 'UNIT-201',
    floorNumber: 2,
    unitNumber: 'UNIT 201',
    floorPlan: 'B5 Luxury Suite',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1150,
    marketRent: 2545,
    rentPerSqFt: 2.21,
    status: 'occupied',
    tenantName: 'Rajesh & Sunita Sharma',
    leaseEnd: '2027-03-31',
  });

  // Generate matrix of 3D Stacking units across 10 floors x 5 columns
  const stackingMatrix: UnitData[][] = [];
  const statusDistribution = { occupied: 0, vacant_leased: 0, vacant_available: 0, notice: 0, other: 0 };
  let totalUnitsCount = 0;

  const floorPlansList = ['A1 (1 Bed)', 'B5 (2 Bed)', 'C2 (3 Bed Penthouse)', 'Studio Flex'];
  const statuses: ('occupied' | 'vacant_leased' | 'vacant_available' | 'notice' | 'other')[] = [
    'occupied', 'occupied', 'occupied', 'occupied', 'occupied', 'occupied', 'occupied',
    'vacant_leased', 'notice', 'vacant_available', 'other'
  ];

  for (let f = totalFloorCount; f >= 1; f--) {
    const floorUnits: UnitData[] = [];
    for (let col = 1; col <= 6; col++) {
      const uNum = `${f}${col < 10 ? '0' + col : col}`;
      const statusIdx = (f * 7 + col * 3) % statuses.length;
      const st = statuses[statusIdx];
      statusDistribution[st]++;
      totalUnitsCount++;

      const plan = floorPlansList[(f + col) % floorPlansList.length];
      const beds = plan.includes('1 Bed') ? 1 : plan.includes('2 Bed') ? 2 : plan.includes('3 Bed') ? 3 : 1;
      const baths = beds === 3 ? 3 : beds === 2 ? 2 : 1;
      const area = 650 + (beds * 300) + (col * 45);
      const rent = Math.round(area * (2.1 + (f * 0.05)));

      floorUnits.push({
        unitId: `UNIT-${uNum}`,
        floorNumber: f,
        unitNumber: `UNIT ${uNum}`,
        floorPlan: plan,
        bedrooms: beds,
        bathrooms: baths,
        areaSqFt: area,
        marketRent: rent,
        rentPerSqFt: parseFloat((rent / area).toFixed(2)),
        status: st,
        tenantName: st === 'occupied' ? `Resident ${uNum}` : undefined,
        leaseEnd: '2027-04-15',
      });
    }
    stackingMatrix.push(floorUnits);
  }

  // Calculate percentage statistics
  const pctOccupied = ((statusDistribution.occupied / totalUnitsCount) * 100).toFixed(1);
  const pctVacantLeased = ((statusDistribution.vacant_leased / totalUnitsCount) * 100).toFixed(1);
  const pctVacantAvailable = ((statusDistribution.vacant_available / totalUnitsCount) * 100).toFixed(1);
  const pctNotice = ((statusDistribution.notice / totalUnitsCount) * 100).toFixed(1);
  const pctOther = ((statusDistribution.other / totalUnitsCount) * 100).toFixed(1);

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'occupied':
        return 'bg-emerald-500 border-emerald-400 text-emerald-950';
      case 'vacant_leased':
        return 'bg-sky-500 border-sky-400 text-sky-950';
      case 'vacant_available':
        return 'bg-rose-500 border-rose-400 text-rose-950';
      case 'notice':
        return 'bg-amber-500 border-amber-400 text-amber-950';
      default:
        return 'bg-slate-400 border-slate-300 text-slate-950';
    }
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'occupied':
        return 'Leased Occupied';
      case 'vacant_leased':
        return 'Leased Vacant';
      case 'vacant_available':
        return 'Available Vacant';
      case 'notice':
        return 'Occupied on Notice';
      default:
        return 'Other / Model';
    }
  };

  const handleResetFilters = () => {
    setFilterRent('ALL');
    setFilterAmenities('ALL');
    setFilterFloorPlan('ALL');
    setFilterOccupancy('ALL');
    setFilterLeaseStatus('ALL');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="flex h-[92vh] w-[96vw] max-w-7xl flex-col rounded-3xl border border-slate-700/80 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* TOP FILTER BAR (Matching Image Top Header) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">MARKET RENT</span>
              <select
                value={filterRent}
                onChange={(e) => setFilterRent(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ALL">ALL RENTS</option>
                <option value="LOW">&lt; $2,000</option>
                <option value="MID">$2,000 - $3,000</option>
                <option value="HIGH">&gt; $3,000</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">AMENITIES</span>
              <select
                value={filterAmenities}
                onChange={(e) => setFilterAmenities(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ALL">ALL AMENITIES</option>
                <option value="BALCONY">Balcony</option>
                <option value="CORNER">Corner View</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">FLOOR PLANS</span>
              <select
                value={filterFloorPlan}
                onChange={(e) => setFilterFloorPlan(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ALL">ALL PLANS</option>
                <option value="A1">1 Bed (A1)</option>
                <option value="B5">2 Bed (B5)</option>
                <option value="C2">3 Bed (C2)</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">OCCUPANCY</span>
              <select
                value={filterOccupancy}
                onChange={(e) => setFilterOccupancy(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ALL">ALL OCCUPANCY</option>
                <option value="OCCUPIED">Occupied (92.2%)</option>
                <option value="VACANT">Vacant (3.1%)</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">LEASE STATUS</span>
              <select
                value={filterLeaseStatus}
                onChange={(e) => setFilterLeaseStatus(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="ACTIVE">Active Lease</option>
                <option value="NOTICE">On Notice</option>
                <option value="AVAILABLE">Available Now</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="mt-3.5 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-3 w-3" /> RESET
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-extrabold text-cyan-400 font-mono hidden md:inline">
              {buildingName}
            </span>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: LEFT 3D / RIGHT STACKING DIAGRAM */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT PANEL: 3D ISOMETRIC BUILDING VISUALIZER */}
          <div className="relative flex-1 bg-slate-900/60 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
            {/* Title Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">3D Stacking & Unit Lease Matrix</h3>
                  <p className="text-xs text-slate-400 font-mono">Real-Time Cadastral Occupancy Layer</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono border border-emerald-500/40">
                ● LIVE SYNC
              </span>
            </div>

            {/* 3D Isometric Building Cutaway Simulation */}
            <div className="relative my-auto flex-1 min-h-[340px] rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                PERSPECTIVE: HIGH-RISE TOWER 3D CUTAWAY
              </div>

              {/* Stacked 3D Floors Render */}
              <div className="w-full max-w-lg space-y-1.5 my-auto">
                {stackingMatrix.map((rowFloors, rowIdx) => {
                  const floorNum = totalFloorCount - rowIdx;

                  return (
                    <div key={rowIdx} className="flex items-center gap-2">
                      <span className="w-10 text-[10px] font-mono font-bold text-slate-400 text-right">
                        F{floorNum < 10 ? '0' + floorNum : floorNum}
                      </span>
                      <div className="grid flex-1 grid-cols-6 gap-1.5">
                        {rowFloors.map((unit) => {
                          const isSelected = selectedUnit?.unitId === unit.unitId;

                          return (
                            <button
                              key={unit.unitId}
                              onClick={() => setSelectedUnit(unit)}
                              className={`h-8 rounded-md border text-[10px] font-bold font-mono transition-all transform hover:scale-105 shadow-md flex items-center justify-center ${getStatusColor(
                                unit.status
                              )} ${isSelected ? 'ring-4 ring-cyan-300 shadow-cyan-500/50 z-10' : 'opacity-90 hover:opacity-100'}`}
                              title={`${unit.unitNumber} - ${unit.floorPlan} (${getStatusLabel(unit.status)})`}
                            >
                              {unit.unitNumber.replace('UNIT ', '')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: STACKING DIAGRAM & UNIT INSPECTOR CARD */}
          <div className="w-full lg:w-[450px] bg-slate-950 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
            
            {/* View Mode Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
                <button className="px-3 py-1.5 rounded-lg bg-cyan-600 font-bold text-white shadow">
                  Stacking Diagram
                </button>
                <button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition">
                  Floor Plans
                </button>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-mono font-bold text-slate-300 border border-slate-800">
                HIGH-RISE
              </span>
            </div>

            {/* SELECTED UNIT CARD INSPECTOR (Matching Image Floating Popup) */}
            {selectedUnit && (
              <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4 shadow-2xl space-y-3">
                <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-lg font-black text-white font-mono">{selectedUnit.unitNumber}</h4>
                    <span className="text-xs font-bold text-cyan-400 font-mono">{selectedUnit.floorPlan}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${getStatusColor(selectedUnit.status)}`}>
                    ● {getStatusLabel(selectedUnit.status)}
                  </span>
                </div>

                {/* Beds / Baths & Rent Details */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">LAYOUT</span>
                    <span className="font-bold text-white">{selectedUnit.bedrooms} Bed / {selectedUnit.bathrooms} Bath</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{selectedUnit.areaSqFt} Sq. Ft.</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">MARKET RENT</span>
                    <span className="font-extrabold text-emerald-400">${selectedUnit.marketRent.toLocaleString()} / mo</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">${selectedUnit.rentPerSqFt} / Sq. Ft.</span>
                  </div>
                </div>

                {/* 2D Blueprint Floor Plan SVG Diagram */}
                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono flex items-center justify-between">
                    <span>2D Floor Plan Blueprint (Unit {selectedUnit.unitNumber})</span>
                    <span className="text-cyan-400">Scale 1:50</span>
                  </span>

                  <svg viewBox="0 0 300 180" className="w-full h-36 rounded-lg bg-slate-900 border border-slate-800 stroke-cyan-400 fill-none stroke-2">
                    {/* Outer Wall Boundary */}
                    <rect x="10" y="10" width="280" height="160" rx="4" className="stroke-cyan-300 fill-cyan-950/20" strokeWidth="3" />
                    
                    {/* Living Room */}
                    <rect x="10" y="10" width="160" height="100" />
                    <text x="75" y="60" className="fill-cyan-300 text-[10px] font-sans font-bold stroke-0">LIVING ROOM</text>
                    
                    {/* Master Bedroom */}
                    <rect x="170" y="10" width="120" height="90" />
                    <text x="195" y="55" className="fill-purple-300 text-[10px] font-sans font-bold stroke-0">MASTER BED</text>
                    
                    {/* Kitchen */}
                    <rect x="10" y="110" width="110" height="60" />
                    <text x="35" y="145" className="fill-emerald-300 text-[10px] font-sans font-bold stroke-0">KITCHEN</text>
                    
                    {/* Bathroom */}
                    <rect x="120" y="110" width="80" height="60" />
                    <text x="135" y="145" className="fill-amber-300 text-[10px] font-sans font-bold stroke-0">BATH</text>
                    
                    {/* Balcony */}
                    <rect x="200" y="100" width="90" height="70" strokeDasharray="4 2" />
                    <text x="220" y="140" className="fill-sky-300 text-[10px] font-sans font-bold stroke-0">BALCONY</text>
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                  <span>Lease Expiry: <strong className="text-white">{selectedUnit.leaseEnd}</strong></span>
                  <span className="text-cyan-400 font-bold">VPID-3D-SYNC</span>
                </div>
              </div>
            )}

            {/* Quick Metrics Summary Box */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Units:</span>
                <span className="font-bold text-white">{totalUnitsCount} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupancy Rate:</span>
                <span className="font-bold text-emerald-400">{pctOccupied}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Vacant:</span>
                <span className="font-bold text-rose-400">{pctVacantAvailable}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM PERCENTAGE STATS LEGEND BAR (Exact Match to Image 1 Bottom Bar) */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">%</span>
            <span className="font-bold text-slate-300">BUILDING OCCUPANCY BREAKDOWN:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              {pctVacantLeased}% Leased Vacant
            </span>

            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {pctOccupied}% Leased Occupied
            </span>

            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              {pctVacantAvailable}% Available Vacant
            </span>

            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              {pctNotice}% Occupied on Notice
            </span>

            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              {pctOther}% Other
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
