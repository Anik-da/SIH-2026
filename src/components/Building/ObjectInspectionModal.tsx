import { X, Cpu, Server, Shield, Sparkles, AlertTriangle } from 'lucide-react';

export interface InspectedObjectData {
  title: string;
  category: string;
  floorLabel: string;
  status: string;
  details: string[];
  description: string;
}

interface ObjectInspectionModalProps {
  objectData: InspectedObjectData | null;
  onClose: () => void;
}

export function ObjectInspectionModal({ objectData, onClose }: ObjectInspectionModalProps) {
  if (!objectData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-6 text-white shadow-2xl shadow-cyan-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide text-cyan-200">{objectData.title}</h3>
              <p className="text-xs text-slate-400">{objectData.category} • {objectData.floorLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status & Telemetry</div>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{objectData.status}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</div>
            <p className="text-xs leading-relaxed text-slate-300">{objectData.description}</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Specifications & Attributes</div>
            <div className="grid grid-cols-2 gap-2">
              {objectData.details.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-cyan-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-95 shadow-lg shadow-cyan-900/40"
          >
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
}
