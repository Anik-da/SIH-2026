import React, { useState } from 'react';
import { PlusCircle, MapPin, Building2, Layers, Sparkles, X, CheckCircle2, Navigation } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateBuilding?: (buildingData: {
    name: string;
    lat: number;
    lon: number;
    floors: number;
    height: number;
    width: number;
    depth: number;
    ulpin: string;
  }) => void;
}

export default function CreateBuildingModal({ isOpen, onClose, onCreateBuilding }: Props) {
  const [name, setName] = useState('My Custom Residential Building');
  const [lat, setLat] = useState('12.9716');
  const [lon, setLon] = useState('77.5946');
  const [floors, setFloors] = useState(6);
  const [height, setHeight] = useState(21);
  const [width, setWidth] = useState(25);
  const [depth, setDepth] = useState(20);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(5));
          setLon(pos.coords.longitude.toFixed(5));
          setStatusMsg('Detected your exact GPS location!');
        },
        () => {
          setStatusMsg('Could not fetch auto-location. Using current view center.');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setStatusMsg('Please enter valid coordinates.');
      return;
    }

    const newUlpin = `ULPIN-IN-LOCAL-${Math.floor(100000 + Math.random() * 900000)}`;

    onCreateBuilding?.({
      name,
      lat: latNum,
      lon: lonNum,
      floors,
      height,
      width,
      depth,
      ulpin: newUlpin,
    });

    setStatusMsg(`Successfully created 3D building "${name}"!`);
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Create 3D Building Structure At My Location
              </h2>
              <p className="text-xs text-slate-400">
                Extrude a 3D building on the globe for unmapped areas in India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-300">
          {/* Building Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Building Structure Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Location Coordinates */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Coordinates (Latitude / Longitude)
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" /> Auto-Detect My Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Latitude (°N)</span>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Longitude (°E)</span>
                <input
                  type="number"
                  step="any"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Building Dimensions */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Floors</label>
              <input
                type="number"
                min="1"
                max="100"
                value={floors}
                onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Height (m)</label>
              <input
                type="number"
                min="3"
                max="400"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Width x Depth (m)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 10)}
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-center"
                />
                <span className="text-slate-500">x</span>
                <input
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(parseInt(e.target.value) || 10)}
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-center"
                />
              </div>
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {statusMsg}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate 3D Building Here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
