import React, { useState } from 'react';
import {
  Home,
  Bed,
  Bath,
  Maximize,
  PieChart,
  Shield,
  School,
  Hospital,
  Utensils,
  Briefcase,
  Hotel,
  ShoppingCart,
  TrendingUp,
  CloudSun,
  Layers,
  ChevronRight,
  Activity,
  Zap,
  Droplets,
  DollarSign,
  Building2,
  Sliders,
  Sparkles,
  Compass,
} from 'lucide-react';

interface Props {
  onSelectFloor?: (floorId: string) => void;
  onClose?: () => void;
}

export const RealFinderHUD: React.FC<Props> = ({ onSelectFloor, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'realfinder' | '51world'>('realfinder');
  const [selectedLegend, setSelectedLegend] = useState<string[]>(['Police Stations', 'School', 'Hospital', 'Office']);

  const toggleLegend = (item: string) => {
    setSelectedLegend((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  if (!isVisible) {
    return (
      <div className="pointer-events-none absolute top-4 left-64 z-20 font-sans">
        <button
          onClick={() => setIsVisible(true)}
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-950/90 px-3.5 py-1.5 text-xs font-bold text-cyan-300 shadow-xl backdrop-blur-xl hover:bg-cyan-500/20"
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          Show RealFinder HUD Overlays
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top 51WORLD Header Toolbar */}
      <div className="pointer-events-auto absolute top-3 left-16 right-16 flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-slate-950/90 px-4 py-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        {/* Left Logo & Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 font-black text-white shadow-lg">
            51
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black tracking-wide text-white uppercase">RealFinder 3D & Smart City Twin</h2>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/40">
                LIVE CANVAS
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher: RealFinder 3D vs 51WORLD City Engine */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
          <button
            onClick={() => setActiveTab('realfinder')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              activeTab === 'realfinder'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RealFinder Presentation
          </button>
          <button
            onClick={() => setActiveTab('51world')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              activeTab === '51world'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            51WORLD City Twin
          </button>
        </div>

        {/* Right Controls & Hide Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs">
            <CloudSun className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold text-white">26°C Sunny</span>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-white"
          >
            Hide HUD
          </button>
        </div>
      </div>

      {/* REALFINDER LAYOUT (Matching Image 2) */}
      {activeTab === 'realfinder' && (
        <>
          {/* Left Column Overlays */}
          <div className="pointer-events-auto absolute top-16 left-20 w-80 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
            {/* 3D Property Presentation Inspector Card */}
            <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Single Family Residence</span>
                  <h3 className="text-xl font-black text-white">$1,283,500 <span className="text-xs text-emerald-400 font-semibold">(Price Cut -$1,500)</span></h3>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/40">
                  Open For Investment
                </span>
              </div>

              {/* 3D House Preview Frame */}
              <div className="relative mt-3 flex h-40 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 p-3 overflow-hidden">
                <div className="absolute top-2 left-2 rounded bg-slate-950/80 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                  Interactive 3D Villa Model
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-32 rounded-lg border-2 border-cyan-400/80 bg-gradient-to-br from-cyan-950 to-slate-900 p-2 shadow-xl flex items-center justify-center">
                    <Home className="h-10 w-10 text-cyan-300 animate-bounce" />
                  </div>
                  <span className="mt-1 text-[10px] text-slate-300 font-medium">24412 Star Valley Dr, Saint Clair Shores, MI 48080</span>
                </div>
              </div>

              {/* Beds / Baths / Sq Ft */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2">
                  <Bed className="mx-auto h-3.5 w-3.5 text-cyan-400" />
                  <span className="mt-0.5 block text-[9px] text-slate-400">Bedrooms</span>
                  <span className="font-bold text-white">6 Beds</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2">
                  <Bath className="mx-auto h-3.5 w-3.5 text-purple-400" />
                  <span className="mt-0.5 block text-[9px] text-slate-400">Bathrooms</span>
                  <span className="font-bold text-white">5 Baths</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2">
                  <Maximize className="mx-auto h-3.5 w-3.5 text-emerald-400" />
                  <span className="mt-0.5 block text-[9px] text-slate-400">Total Area</span>
                  <span className="font-bold text-white">5,980 Sq Ft</span>
                </div>
              </div>

              {/* Upgrade Tags */}
              <div className="mt-3">
                <span className="text-[9px] font-bold uppercase text-slate-400">Upgrades & Spec Tags</span>
                <div className="mt-1 flex flex-wrap gap-1 text-[9px]">
                  {['NEW TOILET', 'NEW TILE', 'NEW LIGHT FIXTURES', 'NEW LED LIGHTS', 'NEW VANITY'].map((tag) => (
                    <span key={tag} className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-bold text-cyan-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Distribution by Category Market Wheel Card */}
            <div className="rounded-2xl border border-purple-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <PieChart className="h-4 w-4 text-purple-400" />
                  Distribution by Category
                </h4>
                <span className="text-[10px] text-purple-300 font-bold">3,297 Total Market</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                  <span className="text-[9px] text-slate-400">Multi-family</span>
                  <p className="text-sm font-black text-cyan-400">1,582</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                  <span className="text-[9px] text-slate-400">Single-family</span>
                  <p className="text-sm font-black text-purple-400">1,253</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                  <span className="text-[9px] text-slate-400">Apartments</span>
                  <p className="text-sm font-black text-emerald-400">672</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                  <span className="text-[9px] text-slate-400">Penthouse</span>
                  <p className="text-sm font-black text-amber-400">978</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Overlays */}
          <div className="pointer-events-auto absolute top-16 right-20 w-72 space-y-3">
            {/* POI Legend Filter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-cyan-400" />
                Map Layer POI Legend
              </h4>
              <div className="space-y-1 text-xs">
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
                      className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 transition-all ${
                        active
                          ? 'border-cyan-500/40 bg-cyan-500/10 text-white font-semibold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                        <span className="text-[11px]">{item.name}</span>
                      </div>
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Regional Market Summary Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Regional Real Estate Index</span>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-white">$1,020,425</p>
                  <span className="text-[10px] text-emerald-400 font-bold">Avg. price ↑ +26%</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-purple-300">4,854</p>
                  <span className="text-[10px] text-purple-400 font-bold">Properties ↑ +74%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 51WORLD CITY DIGITAL TWIN LAYOUT (Matching Image 1) */}
      {activeTab === '51world' && (
        <>
          {/* Left Column: City Navigation Tree & Mini-Map */}
          <div className="pointer-events-auto absolute top-20 left-4 w-80 space-y-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-cyan-400" />
                  City Navigation Menu
                </span>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                  SHANGHAI / CBD
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs font-bold">
                {[
                  'City Overview',
                  'Smart Investment',
                  'Industrial E-Commerce',
                  'Smart Campus',
                  'City Brain Engine',
                  'Data Fusion & Telemetry',
                ].map((item, idx) => (
                  <div
                    key={item}
                    className={`flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all ${
                      idx === 0
                        ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{item}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Industrial Output & GDP Telemetry Gauges */}
          <div className="pointer-events-auto absolute top-20 right-4 w-80 space-y-4">
            <div className="rounded-2xl border border-purple-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-purple-400" />
                Industrial Output Telemetry
              </h4>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                  <span className="text-[9px] text-slate-400 block">Industrial Output</span>
                  <p className="text-base font-black text-cyan-400 mt-1">10.07 <span className="text-[10px] font-semibold text-slate-400">Billion</span></p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                  <span className="text-[9px] text-slate-400 block">High-Tech Assets</span>
                  <p className="text-base font-black text-emerald-400 mt-1">4.45 <span className="text-[10px] font-semibold text-slate-400">Billion</span></p>
                </div>
              </div>

              {/* Radial Gauges */}
              <div className="mt-4 border-t border-slate-800 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Fixed Asset Investment: +216.1%</span>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2">
                    <span className="text-base font-black text-cyan-300">98%</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">Industrial</span>
                  </div>
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2">
                    <span className="text-base font-black text-purple-300">96%</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">Commercial</span>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2">
                    <span className="text-base font-black text-emerald-300">97%</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">Infra</span>
                  </div>
                </div>
              </div>

              {/* GDP Trend Sparkline */}
              <div className="mt-4 border-t border-slate-800 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Quarterly GDP Growth Trend</span>
                <div className="mt-2 h-16 w-full rounded-xl border border-slate-800 bg-slate-900/80 p-2 flex items-end justify-between gap-1">
                  {[20, 35, 42, 68].map((h, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div style={{ height: `${h}%` }} className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-purple-500" />
                      <span className="text-[8px] text-slate-500 mt-1">Q{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
