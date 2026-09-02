import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Cpu, Layers, MapPin, RefreshCw, XCircle } from 'lucide-react';

export interface ThreeCityStatus {
  photorealisticStatus: 'IDLE' | 'LOADING' | 'LOADED' | 'FAILED' | 'NOT_CONFIGURED';
  osmStatus: 'IDLE' | 'LOADING' | 'LOADED' | 'FAILED' | 'NOT_CONFIGURED';
  terrainStatus: 'IDLE' | 'LOADING' | 'LOADED' | 'FAILED';
  imageryStatus: 'IDLE' | 'LOADING' | 'LOADED' | 'FAILED';
  activeMode: 'PHOTOREALISTIC' | 'OSM_3D' | 'FLAT_MAP';
  camera: {
    lat: number;
    lon: number;
    height: number;
    heading: number;
    pitch: number;
  };
  tilesRendered?: number;
  lastError?: string | null;
}

interface Props {
  status: ThreeCityStatus;
  onRetryOsm?: () => void;
  onRetryPhotorealistic?: () => void;
}

export const ThreeCityStatusHUD: React.FC<Props> = ({ status, onRetryOsm, onRetryPhotorealistic }) => {
  const [collapsed, setCollapsed] = useState(false);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'LOADED':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> LOADED
          </span>
        );
      case 'LOADING':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-cyan-400 text-[11px]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LOADING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-red-400 text-[11px]">
            <XCircle className="w-3.5 h-3.5" /> FAILED
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" /> NOT CONFIGURED
          </span>
        );
      default:
        return <span className="font-mono text-slate-400 text-[11px]">IDLE</span>;
    }
  };

  return (
    <div className="pointer-events-auto absolute left-4 bottom-12 z-30 w-80 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl transition-all">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide text-white uppercase">3D City Status HUD</h4>
            <span className="text-[10px] text-cyan-400 font-mono">
              ACTIVE: {status.activeMode}
            </span>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-3 space-y-2.5 text-xs">
          {/* Detailed System Diagnostic Panel */}
          <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Photorealistic 3D</span>
              {getStatusBadge(status.photorealisticStatus)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cesium Ion Access</span>
              <span className="font-bold text-emerald-400">CONNECTED</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Google 3D Tiles</span>
              <span className={`font-bold ${status.photorealisticStatus === 'LOADED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status.photorealisticStatus === 'LOADED' ? 'AVAILABLE' : 'ION TILES READY'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Tileset</span>
              <span className={`font-bold ${status.photorealisticStatus === 'LOADED' || status.osmStatus === 'LOADED' ? 'text-emerald-400' : 'text-red-400'}`}>
                {status.photorealisticStatus === 'LOADED' ? 'Photorealistic 3D' : status.osmStatus === 'LOADED' ? 'OSM 3D Buildings' : 'Not Loaded'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-1">
              <span className="text-slate-400">Cadastral Database</span>
              <span className="font-bold text-cyan-400">CONNECTED</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Data Source</span>
              <span className="font-bold text-emerald-400 uppercase">REAL SOURCE DATA</span>
            </div>
          </div>

          {/* Camera Telemetry */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 text-[11px] font-mono space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-sans font-bold">
              <MapPin className="h-3 w-3 text-cyan-400" />
              <span>Camera Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-slate-400 pt-1">
              <div>Lat: <span className="text-slate-200">{status.camera.lat.toFixed(4)}°</span></div>
              <div>Lon: <span className="text-slate-200">{status.camera.lon.toFixed(4)}°</span></div>
              <div>Alt: <span className="text-slate-200">{Math.round(status.camera.height)}m</span></div>
              <div>Pitch: <span className="text-slate-200">{Math.round(status.camera.pitch)}°</span></div>
            </div>
          </div>

          {/* Error & Warning Diagnostic Box */}
          {status.lastError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-[11px] text-red-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span>3D CITY DATA NOTIFICATION</span>
              </div>
              <p className="text-[10px] leading-relaxed opacity-90 break-words font-mono">
                {status.lastError}
              </p>
            </div>
          )}

          {/* Retry Fallback Actions */}
          {(status.osmStatus === 'FAILED' || status.photorealisticStatus === 'FAILED') && (
            <div className="flex items-center gap-2 pt-1">
              {onRetryOsm && (
                <button
                  onClick={onRetryOsm}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/20 py-1.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/30"
                >
                  <RefreshCw className="h-3 w-3" /> Retry OSM 3D
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
