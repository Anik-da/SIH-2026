import React from 'react';
import { Building2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { getFormattedAddress } from '../../utils/addressLookup';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExplore: () => void;
  buildingName?: string;
  ulpin?: string;
  valuation?: string;
  lat?: number;
  lon?: number;
  address?: string;
}

export const RealFinderCardPopup: React.FC<Props> = ({
  isOpen,
  onClose,
  onExplore,
  buildingName = 'B1-A Commercial Skyscraper',
  ulpin = 'ULPIN-IN-MH-2026-89421',
  valuation = '₹1,28,35,000',
  lat = 12.9716,
  lon = 77.5946,
  address,
}) => {
  if (!isOpen) return null;

  const displayAddress = getFormattedAddress(lat, lon, address);

  return (
    <div className="pointer-events-auto absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 w-84">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/40">
          <Building2 className="h-3 w-3" /> 3D Digital Twin
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold">
          ✕
        </button>
      </div>

      <h3 className="text-sm font-bold text-slate-100">{buildingName}</h3>

      {/* Human-Readable Address Display */}
      <div className="mt-1 flex items-start gap-1.5 text-xs text-cyan-300 bg-cyan-950/40 p-2 rounded-xl border border-cyan-500/20">
        <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-semibold text-slate-200 text-[11px]">{displayAddress}</span>
          <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
            {lat.toFixed(4)}° N, {lon.toFixed(4)}° E &bull; {ulpin === 'Not available from source' ? 'Unmapped Cadastral Footprint' : ulpin}
          </span>
        </div>
      </div>

      {ulpin === 'Not available from source' ? (
        <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300 font-sans">
          <p className="font-semibold leading-snug">
            {lat >= 40.40 && lat <= 41.05 && lon >= -74.35 && lon <= -73.60
              ? '🗽 Photorealistic 3D building detected.'
              : '🏛️ 3D Building structure detected.'}
          </p>
          <p className="text-[10px] text-amber-400/90 mt-0.5">
            No verified cadastral/property record is linked to this building.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2.5">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Valuation / Rent</span>
            <p className="text-sm font-extrabold text-cyan-300">{valuation}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Occupancy</span>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> 92.2% Leased
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onExplore}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/30 transition-all hover:bg-cyan-400"
      >
        Explore Unit Breakdown <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
