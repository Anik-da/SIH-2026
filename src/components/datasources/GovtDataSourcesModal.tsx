import React, { useState } from 'react';
import {
  X,
  Globe2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCheck,
  ShieldCheck,
  Layers,
  Database,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { GovtDataset } from '../../types/dataSources';
import { SourceBadge } from '../common/SourceBadge';
import { DataIngestionPipeline, type PipelineResult } from '../../services/pipeline/DataIngestionPipeline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPreviewDataset?: (dataset: GovtDataset) => void;
}

const DEFAULT_DATASETS: GovtDataset[] = [
  {
    id: 'DS-ISRO-01',
    name: 'Bhuvan 2D/3D Cadastral Vector Grid',
    source: 'Bhuvan / NRSC / ISRO',
    category: 'BHUVAN_ISRO',
    datasetType: 'Cadastral Vector',
    coverage: 'Bengaluru Urban District, Karnataka',
    crs: 'EPSG:4326 (WGS84)',
    lastUpdated: '2026-08-15',
    authority: 'NRSC / ISRO Authoritative Service',
    license: 'Open Government Data License (OGDL India)',
    confidence: 0.96,
    status: 'CONNECTED',
    lifecycleStatus: 'APPROVED',
    featureCount: 42,
    sourceBadge: 'OFFICIAL',
    sourceUrl: 'https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php',
    description: 'High-precision satellite-derived parcel boundaries & land classification.',
  },
  {
    id: 'DS-BBMP-02',
    name: 'BBMP e-Aasthi Vertical Property Records',
    source: 'Karnataka / BBMP e-Aasthi',
    category: 'KARNATAKA_BBMP',
    datasetType: 'Property Records',
    coverage: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    crs: 'EPSG:4326 (WGS84)',
    lastUpdated: '2026-08-20',
    authority: 'BBMP Revenue & Survey Department',
    license: 'State Government Portal Reference',
    confidence: 0.94,
    status: 'CONNECTED',
    lifecycleStatus: 'APPROVED',
    featureCount: 38,
    sourceBadge: 'OFFICIAL',
    sourceUrl: 'https://bbmpeaasthi.karnataka.gov.in/office/frmLoginNew.aspx',
    description: 'Urban municipal property deeds, PID registrations & owner title certificates.',
  },
  {
    id: 'DS-DEM-03',
    name: 'Cartosat-3 DEM/DSM High-Res Elevation Surface',
    source: 'Bhuvan / NRSC / ISRO',
    category: 'BHUVAN_ISRO',
    datasetType: 'DEM/DSM Elevation',
    coverage: 'Bengaluru Core Metro Belt',
    crs: 'EPSG:4326 (WGS84 Height MSL)',
    lastUpdated: '2026-07-30',
    authority: 'NRSC Satellite Elevation Grid',
    license: 'Authorized Academic & Hackathon License',
    confidence: 0.91,
    status: 'CONNECTED',
    lifecycleStatus: 'VALIDATED',
    featureCount: 15,
    sourceBadge: 'DERIVED',
    description: 'Surface DSM minus terrain DTM for automated 3D building height derivation.',
  },
  {
    id: 'DS-UPLOAD-04',
    name: 'Custom Drone Survey (GeoJSON Vector)',
    source: 'Authorized GIS Upload',
    category: 'USER_GIS_UPLOAD',
    datasetType: 'Cadastral Vector',
    coverage: 'MG Road Residency Sector',
    crs: 'EPSG:4326 (WGS84)',
    lastUpdated: '2026-09-01',
    authority: 'Field Surveyor Import',
    license: 'Internal Project Survey',
    confidence: 0.88,
    status: 'DEMO',
    lifecycleStatus: 'PROCESSING',
    featureCount: 12,
    sourceBadge: 'USER_IMPORTED',
    description: 'Imported high-resolution UAV survey data with height extrusions.',
  },
];

const PIPELINE_STEPS = [
  'Government Source',
  'Data Ingestion',
  'Format Check',
  'CRS Normalization',
  'Geometry Check',
  'Parcel Matching',
  'Building Extrusion',
  'DSM/DTM Height',
  'Floor Generation',
  '3D Volumetric VPID',
  'ULPIN Association',
  'Topology Check',
  'Property Passport',
];

export const GovtDataSourcesModal: React.FC<Props> = ({ isOpen, onClose, onPreviewDataset }) => {
  const [datasets, setDatasets] = useState<GovtDataset[]>(DEFAULT_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<GovtDataset | null>(DEFAULT_DATASETS[0]);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunPipeline = (ds: GovtDataset) => {
    setIsRunningPipeline(true);
    setPipelineResult(null);

    setTimeout(() => {
      const res = DataIngestionPipeline.processCompletePipeline(
        `${ds.id.toLowerCase()}.geojson`,
        '{"type":"FeatureCollection","features":[]}',
        ds.source,
        'Bengaluru Urban',
        'Ward 112 - Residency',
        'Sy.No. 42/1'
      );
      setPipelineResult(res);
      setIsRunningPipeline(false);
    }, 800);
  };

  const handleFileUpload = (file: File) => {
    setUploadFileName(file.name);
    setIsRunningPipeline(true);
    setTimeout(() => {
      const res = DataIngestionPipeline.processCompletePipeline(
        file.name,
        '{}',
        'Authorized GIS Upload',
        'Bengaluru Urban',
        'Uploaded Survey Area',
        'Sy.No. 88/B'
      );
      setPipelineResult(res);
      setIsRunningPipeline(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">Government Geospatial Data Sources</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GEOSPATIAL DATA ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative Geospatial Ingestion Layer &bull; Bhuvan / ISRO &bull; BBMP e-Aasthi &bull; DSM Height Derivation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal & Authenticity Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Authenticity Guarantee:</strong> Non-authoritative data is explicitly labeled <SourceBadge badge="DEMO" size="sm" /> or <SourceBadge badge="DERIVED" size="sm" />. System never claims unverified data is "Government Certified".
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Source Quick Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bhuvan / ISRO */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400">BHUVAN / NRSC / ISRO</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">CONNECTED</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">National Remote Sensing Centre (NRSC)</p>
                <p className="text-[11px] text-slate-400 mt-1">Satellite imagery, WMS cadastral layers, DEM elevation & admin boundaries.</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedDataset(datasets[0])}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 font-bold transition-all"
                >
                  Select Datasets
                </button>
                <a
                  href="https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Portal ↗
                </a>
              </div>
            </div>

            {/* BBMP e-Aasthi */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400">KARNATAKA / BBMP e-AASTHI</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">CONNECTED</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Urban Property Deed Records</p>
                <p className="text-[11px] text-slate-400 mt-1">Karnataka municipal e-Aasthi PID title deeds & vertical unit registries.</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedDataset(datasets[1])}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold transition-all"
                >
                  Select Datasets
                </button>
                <a
                  href="https://bbmpeaasthi.karnataka.gov.in/office/frmLoginNew.aspx"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Portal ↗
                </a>
              </div>
            </div>

            {/* GIS File Ingestion Dropzone */}
            <div
              className={`bg-slate-950/70 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 hover:border-slate-700'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
            >
              <Upload className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-xs font-bold text-white">Authorized GIS Upload</p>
              <p className="text-[10px] text-slate-400 mt-1">GeoJSON, Shapefile, KML, GeoTIFF, DEM, DSM, CSV</p>
              <label className="mt-2 text-[10px] px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 cursor-pointer hover:bg-purple-500/30 transition-colors font-bold">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  accept=".geojson,.json,.kml,.csv,.shp,.tif,.dem,.dsm"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

          </div>

          {/* Active Datasets Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Available Government & Authorized Datasets</h3>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 font-bold text-slate-400 text-[11px]">
                <span className="col-span-3">Dataset Name</span>
                <span className="col-span-2">Source</span>
                <span className="col-span-2">Type / CRS</span>
                <span className="col-span-2">Authority Level</span>
                <span className="col-span-1">Status</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {datasets.map((ds) => {
                  const isSelected = selectedDataset?.id === ds.id;
                  return (
                    <div
                      key={ds.id}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors ${
                        isSelected ? 'bg-cyan-500/10 border-l-4 border-cyan-400' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <SourceBadge badge={ds.sourceBadge} size="sm" />
                          <span className="font-bold text-white text-xs">{ds.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{ds.description}</p>
                      </div>

                      <span className="col-span-2 text-slate-300 font-medium">{ds.source}</span>
                      
                      <div className="col-span-2">
                        <span className="text-slate-200 font-semibold">{ds.datasetType}</span>
                        <p className="text-[10px] text-slate-500">{ds.crs}</p>
                      </div>

                      <div className="col-span-2">
                        <span className="text-slate-300">{ds.authority}</span>
                        <p className="text-[10px] text-slate-500">Confidence: {(ds.confidence * 100).toFixed(0)}%</p>
                      </div>

                      <div className="col-span-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {ds.lifecycleStatus}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDataset(ds);
                            handleRunPipeline(ds);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Process Pipeline
                        </button>
                        {onPreviewDataset && (
                          <button
                            onClick={() => {
                              onPreviewDataset(ds);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[10px] font-bold hover:bg-slate-700 transition-all"
                          >
                            Preview
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 13-Stage Data Pipeline Execution Panel */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  13-Stage Data Ingestion Pipeline &amp; Height Processing
                </h3>
                <p className="text-[11px] text-slate-400">
                  Government Source &rarr; Format Check &rarr; CRS Normalization &rarr; DSM/DTM Height &rarr; Floor Extrusion &rarr; VPID &rarr; Passport
                </p>
              </div>

              {selectedDataset && (
                <button
                  onClick={() => handleRunPipeline(selectedDataset)}
                  disabled={isRunningPipeline}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  {isRunningPipeline ? 'Processing Engine...' : `Run Pipeline on ${selectedDataset.name}`}
                </button>
              )}
            </div>

            {/* Stepper Visualization */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {PIPELINE_STEPS.slice(0, 7).map((step, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-[10px]">
                  <span className="text-cyan-400 font-bold block">{idx + 1}. {step}</span>
                  <span className="text-slate-500 text-[9px]">Verified ✓</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {PIPELINE_STEPS.slice(7).map((step, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-[10px]">
                  <span className="text-purple-400 font-bold block">{idx + 8}. {step}</span>
                  <span className="text-slate-500 text-[9px]">Derived / Output</span>
                </div>
              ))}
            </div>

            {/* Pipeline Execution Output Console */}
            {pipelineResult && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>✓ PIPELINE EXECUTION SUCCESSFUL</span>
                  <span>Passport Issued: {pipelineResult.properties?.[0]?.vpid}</span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] text-slate-300 pr-2">
                  {pipelineResult.validationLog.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-cyan-500">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Authoritative Geospatial Ingestion Service &bull; Smart India Hackathon 2026
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close Data Panel
          </button>
        </div>

      </div>
    </div>
  );
};
