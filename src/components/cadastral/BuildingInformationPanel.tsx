import React, { useState } from 'react';
import {
  Building2,
  Layers,
  FileCheck,
  ShieldCheck,
  Globe,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronRight,
  Database,
  Sliders,
} from 'lucide-react';
import type { MongoBuildingDocument, MongoFloorDocument, MongoBuildingSourceDocument } from '../../types/mongodbBuilding';

interface BuildingInformationPanelProps {
  building: MongoBuildingDocument | null;
  cesiumFeatureId?: string;
  isIngested: boolean;
  onViewFloors: () => void;
  onViewSources: () => void;
  onViewVerticalProperties: () => void;
  onOpenPassport: () => void;
  onRunValidation: () => void;
  onDiscoverBuilding: (buildingId: string, cesiumFeatureId?: string) => Promise<void>;
  onClose: () => void;
}

export const BuildingInformationPanel: React.FC<BuildingInformationPanelProps> = ({
  building,
  cesiumFeatureId,
  isIngested,
  onViewFloors,
  onViewSources,
  onViewVerticalProperties,
  onOpenPassport,
  onRunValidation,
  onDiscoverBuilding,
  onClose,
}) => {
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscover = async () => {
    setIsDiscovering(true);
    try {
      await onDiscoverBuilding(building ? building.buildingId : `BLDG-BLR-DISC-${Date.now().toString().slice(-4)}`, cesiumFeatureId);
    } finally {
      setIsDiscovering(false);
    }
  };

  if (!isIngested || !building) {
    return (
      <div className="fixed right-6 top-24 z-50 w-96 rounded-2xl border border-amber-500/30 bg-slate-900/95 p-6 backdrop-blur-xl shadow-2xl text-slate-100 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Un-Ingested Feature</h3>
              <p className="text-xs text-amber-400 font-mono">ID: {cesiumFeatureId || 'Cesium-3D-Feature'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" /> Persistent Cache Status: NOT_INGESTED
            </p>
            This 3D building geometry exists in Cesium 3D Tiles, but its structural metadata has not been ingested into the MongoDB <span className="text-cyan-400 font-mono">cosmoplot</span> database yet.
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Cesium Feature:</span>
              <span className="font-mono text-cyan-300 font-medium">{cesiumFeatureId || 'CESIUM-BLDG-UNMAPPED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">3D Visualization:</span>
              <span className="text-emerald-400 font-semibold">Active Opaque Solid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MongoDB Record:</span>
              <span className="text-amber-400 font-semibold">Pending Admin Discovery</span>
            </div>
          </div>

          <button
            onClick={handleDiscover}
            disabled={isDiscovering}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {isDiscovering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Ingesting Public Metadata...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>[Discover Building Information]</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const confidencePct = Math.round((building.confidence || 0.9) * 100);

  return (
    <div className="fixed right-6 top-20 z-50 w-96 rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-5 backdrop-blur-xl shadow-2xl text-slate-100 animate-in slide-in-from-right duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {building.buildingType}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {building.verificationStatus}
            </span>
          </div>
          <h3 className="font-bold text-lg text-white leading-tight">{building.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
            <Database className="w-3 h-3 text-cyan-400" /> ID: {building.buildingId}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          ✕
        </button>
      </div>

      {/* Address */}
      <div className="mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <p className="text-xs text-slate-300 font-medium leading-snug">{building.address}</p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Lat: {building.latitude.toFixed(4)}°</span>
          <span>Lon: {building.longitude.toFixed(4)}°</span>
          <span className="text-cyan-400 font-mono">{building.parcelId}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Floors</span>
          <span className="text-lg font-extrabold text-cyan-400">{building.floorCount}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Basements</span>
          <span className="text-lg font-extrabold text-blue-400">{building.basementCount}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Height</span>
          <span className="text-lg font-extrabold text-emerald-400">{building.buildingHeight}m</span>
        </div>
      </div>

      {/* Provenance & Confidence */}
      <div className="mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Ingestion Source:
          </span>
          <span className="font-semibold text-slate-200">{building.dataSource}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Data Confidence Score:</span>
            <span className="font-bold text-cyan-400">{confidencePct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        {building.sourceUrls && building.sourceUrls.length > 0 && (
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified Source URL:</span>
            <a
              href={building.sourceUrls[0]}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              Link <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onViewFloors}
          className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> [View Floors Metadata]
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onViewVerticalProperties}
          className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> [View Vertical Properties]
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenPassport}
            className="py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> [Passport]
          </button>
          <button
            onClick={onRunValidation}
            className="py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1.5 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> [Validation]
          </button>
        </div>
      </div>
    </div>
  );
};
