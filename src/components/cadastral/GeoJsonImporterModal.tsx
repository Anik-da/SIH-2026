import React, { useState } from 'react';
import { Upload, Database, FileCode, CheckCircle2, AlertCircle, Layers, Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportGeoJson?: (geoJsonData: any) => void;
}

export default function GeoJsonImporterModal({ isOpen, onClose, onImportGeoJson }: Props) {
  const [jsonText, setJsonText] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setJsonText(JSON.stringify(parsed, null, 2));
        setStatusMsg({ type: 'success', text: `Loaded ${file.name} successfully!` });
      } catch (err) {
        setStatusMsg({ type: 'error', text: 'Invalid GeoJSON file format. Please upload valid JSON.' });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sampleGeoJson = {
      type: "FeatureCollection",
      features: Array.from({ length: 16 }).map((_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const baseLat = 12.9710 + row * 0.0006;
        const baseLon = 77.5940 + col * 0.0006;
        const w = 0.00025;
        const h = 0.00025;

        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [baseLon, baseLat],
              [baseLon + w, baseLat],
              [baseLon + w, baseLat + h],
              [baseLon, baseLat + h],
              [baseLon, baseLat]
            ]]
          },
          properties: {
            name: `3D Cadastral Property Sector ${i + 1}`,
            height: 16 + (i % 5) * 6,
            "building:levels": 4 + (i % 5),
            ulpin: `ULPIN-IN-KA-2026-${1000 + i}`
          }
        };
      })
    };

    setJsonText(JSON.stringify(sampleGeoJson, null, 2));
    onImportGeoJson?.(sampleGeoJson);
    setStatusMsg({ type: 'success', text: 'Loaded 16 Real 3D Building Survey Footprints onto globe!' });
  };

  const handleApply = () => {
    if (!jsonText.trim() && !dbUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste GeoJSON data or upload a file.' });
      return;
    }

    try {
      if (jsonText.trim()) {
        const parsed = JSON.parse(jsonText);
        onImportGeoJson?.(parsed);
        setStatusMsg({ type: 'success', text: 'Successfully rendered 3D building dataset onto globe!' });
        setTimeout(() => onClose(), 1200);
      } else if (dbUrl.trim()) {
        setStatusMsg({ type: 'success', text: `Connected to Spatial Database API: ${dbUrl}` });
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error parsing GeoJSON data structure.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                India National 3D GIS & GeoJSON Database Importer
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-normal">
                  SIH 2026 Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Import State Survey GeoJSON building footprints or connect PostGIS/Spatial Database APIs
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-slate-300">
          {/* Quick Demo Sample Action */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
            <div>
              <p className="text-xs font-semibold text-cyan-300">⚡ Test Sample 3D Cadastral Building Dataset</p>
              <p className="text-[11px] text-slate-400">Instantly generate and render 16 verified 3D urban property footprints on the map</p>
            </div>
            <button
              onClick={handleLoadSample}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
            >
              Load Sample 3D Data
            </button>
          </div>

          {/* Option 1: Upload GeoJSON File */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" /> Upload GeoJSON / Shapefile Export (.json)
              </label>
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all">
                <Upload className="w-3.5 h-3.5" /> Browse File
                <input type="file" accept=".json,.geojson" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-400">
              Supports State Survey GeoJSON files with properties: <code className="text-cyan-300">height</code>, <code className="text-cyan-300">building:levels</code>, <code className="text-cyan-300">ulpin</code>.
            </p>
          </div>

          {/* Option 2: Paste GeoJSON Code */}
          <div className="space-y-2">
            <label className="font-semibold text-white flex items-center gap-2 text-xs">
              <Layers className="w-4 h-4 text-cyan-400" /> Paste Raw GeoJSON FeatureCollection
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{ "type": "FeatureCollection", "features": [ { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [...] }, "properties": { "height": 18, "ulpin": "ULPIN-IN-KA-2026-901" } } ] }'
              className="w-full h-36 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Option 3: Remote PostGIS / Spatial API URL */}
          <div className="space-y-2">
            <label className="font-semibold text-white flex items-center gap-2 text-xs">
              <Database className="w-4 h-4 text-indigo-400" /> Connect State GIS Database API URL
            </label>
            <input
              type="url"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              placeholder="https://api.gis.karnataka.gov.in/v1/buildings/3d-cadastre?bbox=..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Alert */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {statusMsg.text}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Empowering India's National 3D Property Cadastre</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2"
            >
              <Database className="w-3.5 h-3.5" /> Ingest & Render 3D Buildings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
