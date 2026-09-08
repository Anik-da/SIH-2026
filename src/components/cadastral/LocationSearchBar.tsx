import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Crosshair, X, Loader2, Navigation, Building2 } from 'lucide-react';

interface LocationSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface Props {
  onSelectLocation: (lat: number, lon: number, height?: number, locationName?: string) => void;
  className?: string;
  direction?: 'up' | 'down';
}

const QUICK_PRESETS = [
  { name: '🗽 New York City (Photorealistic 3D Mesh)', lat: 40.7128, lon: -74.0060, height: 1000 },
  { name: '🏢 Bengaluru Central (M.G. Road)', lat: 12.9716, lon: 77.5946, height: 750 },
  { name: '🏛️ New Delhi (Connaught Place)', lat: 28.6304, lon: 77.2167, height: 750 },
  { name: '🏙️ Mumbai (Bandra-Kurla Complex)', lat: 19.0657, lon: 72.8679, height: 750 },
  { name: '💻 Hyderabad (HITEC City)', lat: 17.4504, lon: 78.3772, height: 750 },
  { name: '🌉 Kolkata (Park Street / CBD)', lat: 22.5535, lon: 88.3524, height: 750 },
  { name: '🏖️ Chennai (T. Nagar)', lat: 13.0418, lon: 80.2341, height: 750 },
];

export const LocationSearchBar: React.FC<Props> = ({
  onSelectLocation,
  className = '',
  direction = 'up',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time geocoding query with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Query OpenStreetMap Nominatim for accurate real locations
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&countrycodes=in&limit=6&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
          },
        });
        if (res.ok) {
          const data: LocationSearchResult[] = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handleSelect = (lat: number, lon: number, name: string, height = 650) => {
    setQuery(name.split(',')[0]);
    setIsOpen(false);
    setLocationStatus(`📍 Teleported to: ${name.split(',')[0]}`);
    setTimeout(() => setLocationStatus(null), 5000);
    onSelectLocation(lat, lon, height, name);
  };

  // High-accuracy live geolocation with reverse geocoding
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring high-precision GPS satellite fix...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const accuracyText = accuracy < 100 ? `±${Math.round(accuracy)}m (High Accuracy)` : `±${Math.round(accuracy)}m (Network/Wi-Fi)`;

        try {
          // Reverse geocode to get exact neighborhood name
          const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
          const res = await fetch(revUrl);
          if (res.ok) {
            const revData = await res.json();
            const placeName =
              revData.address?.suburb ||
              revData.address?.neighbourhood ||
              revData.address?.road ||
              revData.address?.city ||
              'Live Location';
            setQuery(placeName);
            setLocationStatus(`📍 Live GPS: ${placeName} (${accuracyText})`);
            onSelectLocation(latitude, longitude, 550, revData.display_name);
            setTimeout(() => setLocationStatus(null), 6000);
            return;
          }
        } catch {
          // Fallback to raw coords
        }

        setQuery(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
        setLocationStatus(`📍 Live GPS Coordinates (${accuracyText})`);
        onSelectLocation(latitude, longitude, 550, 'Live GPS Position');
        setTimeout(() => setLocationStatus(null), 6000);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err.message);
        setLocationStatus('⚠️ GPS fix timed out. Defaulted to Bengaluru Central.');
        onSelectLocation(12.9716, 77.5946, 800, 'Bengaluru Central');
        setTimeout(() => setLocationStatus(null), 6000);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div ref={containerRef} className={`relative pointer-events-auto ${className}`}>
      {/* Search Input Container */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 transition-all focus-within:border-cyan-400 focus-within:ring-cyan-500/30">
        <Search className="h-4 w-4 text-cyan-400 shrink-0" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any location, city, street, pin..."
          className="w-48 sm:w-64 md:w-80 bg-transparent text-xs font-semibold text-white placeholder-slate-400 outline-none"
        />

        {isLoading && <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin shrink-0" />}

        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Live GPS Fix Trigger Button */}
        <button
          onClick={handleDetectLiveLocation}
          disabled={isLocating}
          title="Detect my live GPS location with high accuracy"
          className="flex items-center gap-1 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition active:scale-95 disabled:opacity-50 shrink-0 ml-1"
        >
          <Crosshair className={`h-3 w-3 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS'}</span>
        </button>
      </div>

      {/* Floating Notification Status */}
      {locationStatus && (
        <div
          className={`absolute ${
            direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-1.5'
          } left-0 w-full rounded-xl border border-cyan-500/30 bg-slate-900/95 px-3 py-1.5 text-[11px] font-semibold text-cyan-300 shadow-xl backdrop-blur-md z-40 animate-in fade-in`}
        >
          {locationStatus}
        </div>
      )}

      {/* Dropdown Results & Quick Presets */}
      {isOpen && (
        <div
          className={`absolute ${
            direction === 'up' ? 'bottom-full mb-2.5' : 'top-full mt-2'
          } left-0 w-80 sm:w-96 rounded-2xl border border-slate-700/80 bg-slate-900/98 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 z-50 max-h-80 overflow-y-auto custom-scrollbar`}
        >
          {/* Real-time search matches */}
          {results.length > 0 && (
            <div className="space-y-1 mb-2">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Search Results ({results.length})
              </div>
              {results.map((r) => {
                const parts = r.display_name.split(',');
                const title = parts[0];
                const subtitle = parts.slice(1, 4).join(',').trim();
                return (
                  <button
                    key={r.place_id}
                    onClick={() => handleSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name)}
                    className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left hover:bg-cyan-500/15 transition-all group"
                  >
                    <MapPin className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{subtitle}</div>
                      <div className="text-[9px] font-mono text-cyan-300/80 mt-0.5">
                        {parseFloat(r.lat).toFixed(4)}° N, {parseFloat(r.lon).toFixed(4)}° E
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Hubs Preset */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
              <span>National Cadastral Hubs</span>
              <span className="text-[9px] text-cyan-400 lowercase">1-click teleport</span>
            </div>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleSelect(p.lat, p.lon, p.name, p.height)}
                  className="flex items-center justify-between rounded-xl p-2 text-left text-xs text-slate-200 hover:bg-slate-800/80 hover:text-cyan-300 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <Navigation className="h-3 w-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
