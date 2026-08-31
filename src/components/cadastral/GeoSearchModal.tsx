import React, { useState } from 'react';
import type { VerticalProperty } from '../../types/cadastral';
import { Search, Building, MapPin, Box, ArrowRight, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  properties: VerticalProperty[];
  onSelectProperty: (floorId: string) => void;
  onClose: () => void;
}

export const GeoSearchModal: React.FC<Props> = ({
  isOpen,
  properties,
  onSelectProperty,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = properties.filter((p) =>
    p.vpid.toLowerCase().includes(query.toLowerCase()) ||
    p.ulpin.toLowerCase().includes(query.toLowerCase()) ||
    p.floorLabel.toLowerCase().includes(query.toLowerCase()) ||
    (p.ownerName && p.ownerName.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center gap-3">
          <Search className="h-5 w-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ULPIN, VPID, Owner Name, or Floor..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching 3D Cadastral records found for "{query}"
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.vpid}
                onClick={() => {
                  onSelectProperty(item.floorId);
                  onClose();
                }}
                className="w-full flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3 text-left transition-all hover:border-cyan-500/40 hover:bg-slate-800/60 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{item.floorLabel}</span>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400">
                      {item.vpid}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-slate-500" /> {item.ulpin}
                    </span>
                    <span className="flex items-center gap-1">
                      <Box className="h-3 w-3 text-slate-500" /> {item.volume} m³
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Fly To</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
