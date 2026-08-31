import React, { useState } from 'react';
import {
  X,
  Building,
  Home,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Tag,
  CheckCircle2,
  PieChart,
  Shield,
  School,
  Hospital,
  Utensils,
  Briefcase,
  Hotel,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyPresentationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedLegend, setSelectedLegend] = useState<string[]>(['Police Stations', 'School', 'Hospital', 'Office']);

  if (!isOpen) return null;

  const toggleLegend = (item: string) => {
    setSelectedLegend((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="flex h-[92vh] w-full max-w-7xl flex-col rounded-3xl border border-cyan-500/30 bg-slate-950 shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Residence Valley 3 — 8th Stage</h2>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Open For Investment
                </span>
              </div>
              <p className="text-[11px] text-slate-400">ZIP 24412 · Real Estate & Spatial Market Intelligence Presentation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-300">
              <span>Avg Market Price:</span>
              <span className="text-emerald-400">$1,020,425</span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Grid Body */}
        <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950">
          {/* Left Column: 3D Property Presentation Card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Single Family Residence</span>
                <p className="text-2xl font-black text-white">$1,283,500 <span className="text-xs font-semibold text-emerald-400">(Price Cut -$1,500)</span></p>
              </div>
              <span className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                ULPIN Verified
              </span>
            </div>

            {/* Simulated 3D Building Architectural Model Canvas */}
            <div className="relative flex h-52 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-hidden">
              <div className="absolute top-2 left-2 rounded bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-slate-400">
                Interactive 3D Architectural Model
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-28 w-44 rounded-xl border-2 border-cyan-400/80 bg-gradient-to-tr from-cyan-900/40 to-slate-900 p-3 shadow-2xl flex items-center justify-center">
                  <Home className="h-16 w-16 text-cyan-300 animate-pulse" />
                </div>
                <span className="mt-2 text-[10px] text-slate-400">24412 Star Valley Dr, Saint Clair Shores, MI 48080</span>
              </div>
            </div>

            {/* Spec Icons */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2">
                <Bed className="mx-auto h-4 w-4 text-cyan-400" />
                <span className="mt-1 block text-slate-400 text-[10px]">Bedrooms</span>
                <span className="font-bold text-white">6 Beds</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2">
                <Bath className="mx-auto h-4 w-4 text-purple-400" />
                <span className="mt-1 block text-slate-400 text-[10px]">Bathrooms</span>
                <span className="font-bold text-white">5 Baths</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2">
                <Maximize className="mx-auto h-4 w-4 text-emerald-400" />
                <span className="mt-1 block text-slate-400 text-[10px]">Total Area</span>
                <span className="font-bold text-white">5,980 Sq Ft</span>
              </div>
            </div>

            {/* Feature tags */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Upgrades & Specs</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                {['NEW TOILET', 'NEW TILE', 'NEW LIGHT FIXTURES', 'NEW LED LIGHTS', 'NEW VANITY'].map((tag) => (
                  <span key={tag} className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 font-bold text-cyan-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Distribution by Category Market Donuts */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-400" />
              Distribution by Category
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 text-[10px]">Multi-family</span>
                <p className="text-lg font-black text-cyan-400">1,582</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 text-[10px]">Single-family</span>
                <p className="text-lg font-black text-purple-400">1,253</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 text-[10px]">Apartments</span>
                <p className="text-lg font-black text-emerald-400">672</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 text-[10px]">Penthouse Suites</span>
                <p className="text-lg font-black text-amber-400">978</p>
              </div>
            </div>

            <div className="mt-auto rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Regional Market</span>
              <p className="text-3xl font-black text-cyan-300 mt-1">3,297 <span className="text-xs font-semibold text-slate-400">Properties</span></p>
            </div>
          </div>

          {/* Right Column: Interactive GIS Map Category Legend */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              Spatial POI Layer Filter
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Police Stations', icon: Shield, color: 'text-cyan-400' },
                { name: 'School', icon: School, color: 'text-purple-400' },
                { name: 'Hospital', icon: Hospital, color: 'text-red-400' },
                { name: 'Restaurant', icon: Utensils, color: 'text-amber-400' },
                { name: 'Office', icon: Briefcase, color: 'text-blue-400' },
                { name: 'Hotels', icon: Hotel, color: 'text-emerald-400' },
                { name: 'Store', icon: ShoppingCart, color: 'text-pink-400' },
              ].map((item) => {
                const Icon = item.icon;
                const active = selectedLegend.includes(item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleLegend(item.name)}
                    className={`flex w-full items-center justify-between rounded-xl border p-2.5 transition-all ${
                      active
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <CheckCircle2 className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-slate-700'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
