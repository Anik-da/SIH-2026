import React, { useState } from 'react';
import type { VerticalProperty } from '../../types/cadastral';
import { Search, Building, MapPin, Box, ArrowRight, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  properties: VerticalProperty[];
  onSelectProperty: (floorId: string) => void;
  onSelectLocation?: (lat: number, lon: number, height?: number) => void;
  onClose: () => void;
}

const GLOBAL_LOCATIONS = [
  { name: 'Bengaluru, Karnataka, India', type: 'Indian Cadastral City', lat: 12.9716, lon: 77.5946, height: 1200 },
  { name: 'Mumbai, Maharashtra, India', type: 'Indian Cadastral City', lat: 19.0760, lon: 72.8777, height: 1200 },
  { name: 'New Delhi, India', type: 'Indian Capital City', lat: 28.6139, lon: 77.2090, height: 1200 },
  { name: 'Hyderabad, Telangana, India', type: 'Indian Cadastral City', lat: 17.3850, lon: 78.4867, height: 1200 },
  { name: 'Chennai, Tamil Nadu, India', type: 'Indian Cadastral City', lat: 13.0827, lon: 80.2707, height: 1200 },
  { name: 'Kolkata, West Bengal, India', type: 'Indian Cadastral City', lat: 22.5726, lon: 88.3639, height: 1200 },
  { name: 'Pune, Maharashtra, India', type: 'Indian Cadastral City', lat: 18.5204, lon: 73.8567, height: 1200 },
  { name: 'Ahmedabad, Gujarat, India', type: 'Indian Cadastral City', lat: 23.0225, lon: 72.5714, height: 1200 },
  { name: 'Shanghai, China (Photorealistic 3D Mesh)', type: 'Global 3D Digital Twin', lat: 31.2397, lon: 121.4998, height: 1100 },
  { name: 'New York City, USA (3D Skyscraper Mesh)', type: 'Global 3D Digital Twin', lat: 40.7128, lon: -74.0060, height: 1200 },
  { name: 'London, UK (3D Urban Twin)', type: 'Global 3D Digital Twin', lat: 51.5074, lon: -0.1278, height: 1200 },
  { name: 'Tokyo, Japan (3D Skyscraper District)', type: 'Global 3D Digital Twin', lat: 35.6762, lon: 139.6503, height: 1200 },
  { name: 'Dubai, UAE (Burj Khalifa 3D Zone)', type: 'Global 3D Digital Twin', lat: 25.2048, lon: 55.2708, height: 1200 },
];

export const GeoSearchModal: React.FC<Props> = ({
  isOpen,
  properties,
  onSelectProperty,
  onSelectLocation,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredProperties = properties.filter((p) =>
    p.vpid.toLowerCase().includes(query.toLowerCase()) ||
    p.ulpin.toLowerCase().includes(query.toLowerCase()) ||
    p.floorLabel.toLowerCase().includes(query.toLowerCase()) ||
    (p.ownerName && p.ownerName.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredLocations = GLOBAL_LOCATIONS.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.type.toLowerCase().includes(query.toLowerCase())
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
            placeholder="Search any Indian city, global 3D twin, ULPIN, or VPID..."
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
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-2">
          {filteredLocations.length > 0 && (
            <div className="mb-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Global &amp; Indian 3D Cities
              </span>
              {filteredLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    onSelectLocation?.(loc.lat, loc.lon, loc.height);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3 text-left transition-all hover:border-cyan-500/40 hover:bg-slate-800/60 group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs">{loc.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{loc.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Fly 3D</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredProperties.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Vertical Property Parcels (VPID)
              </span>
              {filteredProperties.map((item) => (
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
                    <span>Inspect</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredLocations.length === 0 && filteredProperties.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching 3D cities or cadastral records found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
