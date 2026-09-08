import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Layers,
  Sparkles,
  CheckCircle2,
  Box,
  Flame,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Sliders,
  FileCode,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Users,
  HeartPulse,
  Accessibility,
  Check,
  Building
} from 'lucide-react';
import { buildingApiClient } from '../../services/api/buildingApiClient';
import type {
  MongoBuildingDocument,
  MongoFloorDocument,
  MongoDisasterProfileDocument,
  MongoPropertyPassportDocument,
  FloorplanProcessingResult
} from '../../types/mongodbBuilding';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBuildingGenerated?: (data: {
    building: MongoBuildingDocument;
    floors: MongoFloorDocument[];
    disasterProfile: MongoDisasterProfileDocument;
    selectedFloorId: string;
  }) => void;
  onOpenPublicVerification?: (identifier: string) => void;
  onToggleRescueMode?: (active: boolean) => void;
}

export const FloorplanTo3DModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onBuildingGenerated,
  onOpenPublicVerification,
  onToggleRescueMode,
}) => {
  // Step 1: Upload & Detection, Step 2: Configure & Generate, Step 3: Interactive 3D Floor Studio
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<FloorplanProcessingResult | null>(null);

  // Polygon Vertices (Normalized 0..1) with manual correction support
  const [vertices, setVertices] = useState<{ x: number; y: number }[]>([
    { x: 0.15, y: 0.15 },
    { x: 0.85, y: 0.15 },
    { x: 0.85, y: 0.55 },
    { x: 0.70, y: 0.55 },
    { x: 0.70, y: 0.85 },
    { x: 0.15, y: 0.85 },
  ]);
  const [isOutlineApproved, setIsOutlineApproved] = useState(false);

  // Floor Configuration Parameters
  const [buildingName, setBuildingName] = useState('Greenfield Commercial Tower 3D');
  const [aboveGroundFloors, setAboveGroundFloors] = useState(6);
  const [basementFloors, setBasementFloors] = useState(1);
  const [floorHeight, setFloorHeight] = useState(3.0);

  // Generated Model State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBuilding, setGeneratedBuilding] = useState<MongoBuildingDocument | null>(null);
  const [generatedFloors, setGeneratedFloors] = useState<MongoFloorDocument[]>([]);
  const [disasterProfile, setDisasterProfile] = useState<MongoDisasterProfileDocument | null>(null);
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number>(3); // Default Floor 03

  // 3D ULPIN State
  const [generatedUlpin, setGeneratedUlpin] = useState<string | null>(null);
  const [isUlpinGenerating, setIsUlpinGenerating] = useState(false);

  // Disaster Rescue View Mode
  const [isRescueModeActive, setIsRescueModeActive] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [isIsolated, setIsIsolated] = useState(false);

  // Passport & QR State
  const [passportData, setPassportData] = useState<MongoPropertyPassportDocument | null>(null);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset to initial sample preview on modal open
  useEffect(() => {
    if (isOpen && !previewUrl) {
      // Provide clean architectural blueprint visual fallback
      setPreviewUrl('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80');
      handleProcessOutline('architectural_floorplan_sample.png');
    }
  }, [isOpen]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
      const url = URL.createObjectURL(uploaded);
      setPreviewUrl(url);
      setIsOutlineApproved(false);
      handleProcessOutline(uploaded.name);
    }
  };

  // Process Outline Pipeline
  const handleProcessOutline = async (fileName: string) => {
    setIsProcessing(true);
    try {
      const result = await buildingApiClient.processFloorplan(fileName);
      setProcessingResult(result);
      if (result.polygonVertices && result.polygonVertices.length > 0) {
        setVertices(result.polygonVertices);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Draw 2D schematic preview with detected contour polygon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (vertices.length >= 3) {
      // Filled Polygon Outline
      ctx.beginPath();
      ctx.moveTo(vertices[0].x * w, vertices[0].y * h);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x * w, vertices[i].y * h);
      }
      ctx.closePath();

      ctx.fillStyle = isOutlineApproved ? 'rgba(16, 185, 129, 0.18)' : 'rgba(6, 182, 212, 0.15)';
      ctx.fill();

      ctx.strokeStyle = isOutlineApproved ? '#10b981' : '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Vertex Handles
      vertices.forEach((v, idx) => {
        ctx.beginPath();
        ctx.arc(v.x * w, v.y * h, 5, 0, Math.PI * 2);
        ctx.fillStyle = isOutlineApproved ? '#10b981' : '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }
  }, [vertices, isOutlineApproved]);

  // Execute 3D Building Generation
  const handleGenerate3DBuilding = async () => {
    setIsGenerating(true);
    try {
      const response = await buildingApiClient.generate3DFromFloorplan({
        buildingName,
        aboveGroundFloors,
        basementFloors,
        floorHeight,
        lat: buildingName.includes('Sapthagiri') ? 13.0645 : 12.9716,
        lon: buildingName.includes('Sapthagiri') ? 77.5029 : 77.5946,
        polygonVertices: vertices,
      });

      setGeneratedBuilding(response.building);
      setGeneratedFloors(response.floors);
      setDisasterProfile(response.disasterProfile);
      setPassportData(response.samplePassport);

      // Default select Floor 03
      const targetFloor = response.floors.find((f) => f.floorNumber === 3) || response.floors[0];
      setSelectedFloorNumber(targetFloor.floorNumber);

      // Compute initial deterministic 3D ULPIN
      const ulpinRes = await buildingApiClient.generate3DUlpin(response.building.ulpin, 3);
      setGeneratedUlpin(ulpinRes.threeDUlpIn);

      // Notify parent App component
      onBuildingGenerated?.({
        building: response.building,
        floors: response.floors,
        disasterProfile: response.disasterProfile,
        selectedFloorId: targetFloor.floorId,
      });

      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Floor Selection
  const handleSelectFloor = async (floorNum: number) => {
    setSelectedFloorNumber(floorNum);
    if (generatedBuilding) {
      setIsUlpinGenerating(true);
      try {
        const res = await buildingApiClient.generate3DUlpin(generatedBuilding.ulpin, floorNum);
        setGeneratedUlpin(res.threeDUlpIn);
      } finally {
        setIsUlpinGenerating(false);
      }
    }
  };

  // Handle Disaster Rescue View Toggle
  const handleToggleRescue = () => {
    const nextState = !isRescueModeActive;
    setIsRescueModeActive(nextState);
    onToggleRescueMode?.(nextState);
  };

  if (!isOpen) return null;

  const currentFloor = generatedFloors.find((f) => f.floorNumber === selectedFloorNumber);
  const currentDisasterFloor = disasterProfile?.floors.find((f) => f.floorNumber === selectedFloorNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-3xl border border-cyan-500/30 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <FileCode className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">FLOORPLAN → 3D VOLUMETRIC EXTENSION STUDIO</h2>
                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  SIH26011 MVP Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workflow B: 2D Blueprint Ingestion • Boundary Detection • Extruded 3D Stack • 19-Char 3D ULPIN • Disaster Rescue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Navigation Tabs */}
            <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
              <button
                onClick={() => setStep(1)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  step === 1 ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Ingest &amp; Detect
              </button>
              <button
                onClick={() => setStep(2)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  step === 2 ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Floor Stacking
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={generatedFloors.length === 0}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all disabled:opacity-40 ${
                  step === 3 ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Interactive 3D Studio
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-950/60">
          
          {/* STEP 1: Upload Floorplan & Outline Detection */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              
              {/* Left: Upload & Image Preview */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" /> Upload 2D Floorplan
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, JPEG supported</span>
                </div>

                <div className="relative flex-1 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/80 p-3 flex flex-col items-center justify-center overflow-hidden group">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Floorplan Preview"
                      className="max-h-52 object-contain rounded-xl shadow-lg border border-slate-800"
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <FileCode className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">Click or drag &amp; drop clean architectural floorplan</p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer border border-cyan-500/30 transition shadow-md">
                      <Upload className="w-3.5 h-3.5" /> [Upload Image / Floorplan]
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Quick Presets for Judges / Testers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Or select pre-loaded CAD floorplan:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setBuildingName('Sapthagiri NPS University (Grand Academic Palace)');
                        setPreviewUrl('/assets/sapthagiri/sapthagiri_perspective.png');
                        setAboveGroundFloors(10);
                        setBasementFloors(2);
                        setFloorHeight(3.6);
                        setVertices([
                          { x: 0.05, y: 0.15 },
                          { x: 0.32, y: 0.15 },
                          { x: 0.36, y: 0.28 },
                          { x: 0.64, y: 0.28 },
                          { x: 0.68, y: 0.15 },
                          { x: 0.95, y: 0.15 },
                          { x: 0.95, y: 0.85 },
                          { x: 0.68, y: 0.85 },
                          { x: 0.64, y: 0.72 },
                          { x: 0.36, y: 0.72 },
                          { x: 0.32, y: 0.85 },
                          { x: 0.05, y: 0.85 },
                        ]);
                        setIsOutlineApproved(true);
                      }}
                      className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/50 hover:border-cyan-400 text-[11px] text-cyan-200 font-extrabold transition text-center col-span-3 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 hover:bg-cyan-900/40"
                    >
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      🏛️ Sapthagiri NPS University (10-Floor Neoclassical Palace)
                    </button>
                    <button
                      onClick={() => {
                        setBuildingName('Residential 3BHK Tower Wing');
                        setPreviewUrl('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80');
                        setVertices([
                          { x: 0.15, y: 0.15 },
                          { x: 0.85, y: 0.15 },
                          { x: 0.85, y: 0.55 },
                          { x: 0.70, y: 0.55 },
                          { x: 0.70, y: 0.85 },
                          { x: 0.15, y: 0.85 },
                        ]);
                        setIsOutlineApproved(true);
                      }}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-slate-300 font-bold transition text-center"
                    >
                      🏢 Residential 3BHK
                    </button>
                    <button
                      onClick={() => {
                        setBuildingName('Commercial Office Tower Block');
                        setPreviewUrl('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80');
                        setVertices([
                          { x: 0.10, y: 0.10 },
                          { x: 0.90, y: 0.10 },
                          { x: 0.90, y: 0.90 },
                          { x: 0.50, y: 0.90 },
                          { x: 0.50, y: 0.60 },
                          { x: 0.10, y: 0.60 },
                        ]);
                        setIsOutlineApproved(true);
                      }}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-slate-300 font-bold transition text-center"
                    >
                      🏬 Commercial Office
                    </button>
                    <button
                      onClick={() => {
                        setBuildingName('Penthouse Duplex Heights');
                        setPreviewUrl('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80');
                        setVertices([
                          { x: 0.20, y: 0.15 },
                          { x: 0.80, y: 0.15 },
                          { x: 0.85, y: 0.45 },
                          { x: 0.75, y: 0.85 },
                          { x: 0.25, y: 0.85 },
                          { x: 0.15, y: 0.45 },
                        ]);
                        setIsOutlineApproved(true);
                      }}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-slate-300 font-bold transition text-center"
                    >
                      🏛️ Penthouse Duplex
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Target: <span className="font-mono text-cyan-300">{buildingName}</span></span>
                  <button
                    onClick={() => handleProcessOutline(file?.name || 'architectural_sample.png')}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    [Process Floorplan]
                  </button>
                </div>
              </div>

              {/* Right: Detected Outline Canvas & Manual Correction Fallback */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Detected Building Outline
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Confidence: {processingResult ? Math.round(processingResult.confidenceScore * 100) : 94}%
                  </span>
                </div>

                {/* Interactive Outline Canvas */}
                <div className="relative flex-1 rounded-2xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={420}
                    height={280}
                    className="rounded-xl border border-slate-800/80 bg-slate-950 w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1 text-[10px] text-slate-400 font-mono">
                    Vertices: {vertices.length} • Boundary Enclosed • Normalized
                  </div>
                </div>

                {/* Status & Approval Footer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Detected successfully
                    </span>
                    <button
                      onClick={() => setIsOutlineApproved(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isOutlineApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> {isOutlineApproved ? 'Outline Approved' : '[Approve Outline]'}
                    </button>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition"
                  >
                    Proceed to Floor Generation <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Configure Stacking & Generate 3D Building */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-between py-4">
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-white">Configure 3D Volumetric Extrusion</h3>
                  <p className="text-xs text-slate-400">
                    Define vertical floor levels, basement depth, and floor-to-ceiling elevation height
                  </p>
                </div>

                <div className="space-y-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Building Identification Name</label>
                    <input
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Above-Ground Floors</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={aboveGroundFloors}
                        onChange={(e) => setAboveGroundFloors(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-bold text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Basements ($Z &lt; 0$)</label>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={basementFloors}
                        onChange={(e) => setBasementFloors(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-bold text-purple-300 font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Floor Height (m)</label>
                      <input
                        type="number"
                        step={0.5}
                        min={2.5}
                        max={6}
                        value={floorHeight}
                        onChange={(e) => setFloorHeight(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-bold text-emerald-300 font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculated Spec Card */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">TOTAL FLOORS</span>
                      <span className="font-extrabold text-white">{aboveGroundFloors + basementFloors} Levels</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">TOTAL HEIGHT</span>
                      <span className="font-extrabold text-cyan-400">{(aboveGroundFloors + basementFloors) * floorHeight} m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Z-EXTENT</span>
                      <span className="font-extrabold text-purple-400">-{basementFloors * floorHeight}m → +{aboveGroundFloors * floorHeight}m</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate3DBuilding}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Box className="w-4 h-4" />}
                  [Generate Simple 3D Building &amp; Vertical Floor Stack]
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Interactive 3D Floor Studio & Demonstration Journey */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
              
              {/* Left Column: Stackable Floor Hierarchy List */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" /> Vertical Floor Stack
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">{generatedFloors.length} Floors</span>
                </div>

                {/* Floor Buttons List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {generatedFloors.slice().reverse().map((floor) => {
                    const isSelected = floor.floorNumber === selectedFloorNumber;
                    const isHighRisk = isRescueModeActive && floor.floorNumber === 3;
                    const isAmberRisk = isRescueModeActive && floor.floorNumber === 4;

                    return (
                      <div
                        key={floor.floorId}
                        onClick={() => handleSelectFloor(floor.floorNumber)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isHighRisk
                            ? 'bg-red-950/80 border-red-500 shadow-lg shadow-red-950/50 text-white'
                            : isAmberRisk
                            ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                            : isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-md text-white'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black ${
                              isHighRisk
                                ? 'bg-red-500 text-white'
                                : floor.floorNumber < 0
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {floor.floorNumber < 0 ? `B${Math.abs(floor.floorNumber)}` : floor.floorNumber === 1 ? 'GF' : `F${floor.floorNumber < 10 ? '0' + floor.floorNumber : floor.floorNumber}`}
                          </span>
                          <div>
                            <span className="font-bold block">{floor.floorName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Z: {floor.zMin}m ~ {floor.zMax}m
                            </span>
                          </div>
                        </div>

                        {isHighRisk ? (
                          <span className="px-2 py-0.5 text-[9px] font-black rounded bg-red-600 text-white animate-pulse">
                            HIGH RISK
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {floor.floorArea || 620} m²
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Floor Actions Dock */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setIsExploded(!isExploded)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition border ${
                      isExploded
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isExploded ? <RotateCcw className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    {isExploded ? '[RESET BUILDING]' : '[EXPLODE FLOORS]'}
                  </button>

                  <button
                    onClick={() => setIsIsolated(!isIsolated)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition border ${
                      isIsolated
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    {isIsolated ? '[SHOW ALL]' : '[ISOLATE FLOOR]'}
                  </button>
                </div>
              </div>

              {/* Middle Column: Selected Floor 3D ULPIN & Vertical Property */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-cyan-400" /> Selected Level Intelligence
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    MongoDB Verified
                  </span>
                </div>

                {/* Selected Floor Specs */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Target Floor:</span>
                    <span className="font-extrabold text-white">{currentFloor?.floorName || 'Floor 03'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Floor Area:</span>
                    <span className="font-bold text-cyan-300">{currentFloor?.floorArea || 620} m² (6,673 sq.ft)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Vertical Envelope:</span>
                    <span className="font-mono text-purple-300">Z: {currentFloor?.zMin}m to {currentFloor?.zMax}m ({floorHeight}m height)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">VPID Identifier:</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{currentFloor?.vpid || `VPID-KA-BLR-001-F03`}</span>
                  </div>
                </div>

                {/* 19-Character 3D ULPIN Generator Section */}
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 3D ULPIN Vertical Extension
                    </span>
                    <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                      19-Char Standard
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-400 block mb-1">PROTOTYPE 3D ULPIN CODE</span>
                    <span className="font-mono text-base font-black text-white tracking-widest block select-all">
                      {generatedUlpin || '12A34B56C78D90-A003'}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      14-char base (12A34B56C78D90) + hyphen + 4-char vertical ({selectedFloorNumber < 0 ? `B00${Math.abs(selectedFloorNumber)}` : `A00${selectedFloorNumber}`})
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectFloor(selectedFloorNumber)}
                    disabled={isUlpinGenerating}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition"
                  >
                    {isUlpinGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    [GENERATE 3D ULPIN]
                  </button>
                </div>

                {/* Disaster Tactical Toggle */}
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-400" /> Emergency First-Responder Mode
                    </span>
                    <span className="text-[9px] font-bold bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                      Live Tactical
                    </span>
                  </div>

                  <button
                    onClick={handleToggleRescue}
                    className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition border ${
                      isRescueModeActive
                        ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-lg shadow-red-900/40'
                        : 'bg-slate-800 hover:bg-red-950/40 text-red-300 border-red-500/30'
                    }`}
                  >
                    <Flame className="w-4 h-4 animate-pulse" />
                    {isRescueModeActive ? '[EXIT DISASTER RESCUE VIEW]' : '[DISASTER RESCUE VIEW]'}
                  </button>
                </div>
              </div>

              {/* Right Column: Disaster Rescue Priority OR Property Passport */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 overflow-y-auto custom-scrollbar">
                
                {isRescueModeActive ? (
                  /* Live Tactical Disaster Rescue Priority Card */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-red-500/30 pb-2">
                      <span className="text-xs font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> RESCUE PRIORITY — {currentFloor?.floorName || 'Floor 03'}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-300 rounded border border-red-500/40">
                        IMMEDIATE PRIORITY
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Risk Assessment:</span>
                        <span className="font-extrabold text-red-400 text-sm">HIGH RISK (CRITICAL)</span>
                      </div>

                      {/* Resident Demographics (DEMO DATA) */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-red-500/30">
                          <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-400 block">Senior Citizens</span>
                          <span className="font-extrabold text-white text-base">2</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-red-500/30">
                          <Accessibility className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-400 block">Mobility Assist</span>
                          <span className="font-extrabold text-white text-base">1</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-red-500/30">
                          <HeartPulse className="w-4 h-4 text-red-400 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-400 block">Medical Priority</span>
                          <span className="font-extrabold text-white text-base">1</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <span className="font-bold text-slate-400 block">Evacuation Corridor:</span>
                        <span className="text-cyan-300">Primary Rescue Drone Port &amp; Fire Escape Stairwell 2</span>
                      </div>

                      <div className="text-[10px] text-amber-400/90 font-mono text-center">
                        ⚠️ DEMO DATA — Synthetic first-responder simulation
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Digital Property Passport & QR Public Verification Card */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-cyan-400" /> Digital Property Passport
                      </span>
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                        QR Ready
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                      <div className="inline-block p-3 rounded-2xl bg-white text-slate-950 shadow-xl">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                            typeof window !== 'undefined'
                              ? `${window.location.origin}/verify/${generatedUlpin || 'BLDGBL00R2UIJ8-A003'}`
                              : `https://propertymap-system.web.app/verify/${generatedUlpin || 'BLDGBL00R2UIJ8-A003'}`
                          )}`}
                          alt="Verification QR"
                          className="w-32 h-32"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-white block">{currentFloor?.floorName || 'Floor 03'} Passport</span>
                        <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                          /verify/{generatedUlpin || '12A34B56C78D90-A003'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenPublicVerification?.(generatedUlpin || '12A34B56C78D90-A003')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                    >
                      <ExternalLink className="w-4 h-4" /> [Open Public Verification Certificate]
                    </button>
                  </div>
                )}

                {/* Direct Close & Return to Cesium */}
                <div className="mt-auto pt-4 border-t border-slate-800">
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    Return to 3D Globe Viewer
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
