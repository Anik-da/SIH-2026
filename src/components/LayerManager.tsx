import { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { LayerConfig } from '../types/gis';

interface LayerManagerProps {
  layers: LayerConfig[];
  onToggle: (id: string) => void;
  className?: string;
}

export default function LayerManager({ layers, onToggle, className = '' }: LayerManagerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeCount = layers.filter((l) => l.visible).length;

  return (
    <div className={`pointer-events-auto w-64 rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ring-1 ring-white/10 select-none ${className}`}>
      {/* Interactive Header: Clicking collapses/expands the Layer Manager */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-slate-800/60 rounded-t-2xl cursor-pointer"
        title={isCollapsed ? 'Click to expand Layer Manager' : 'Click to collapse Layer Manager'}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold tracking-wide text-slate-100">Layer Manager</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
            {activeCount}/{layers.length}
          </span>
          {isCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <>
          <div className="max-h-72 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="group flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-slate-800/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                    style={{ backgroundColor: layer.color }}
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${layer.visible ? 'text-slate-200' : 'text-slate-500'}`}>
                      {layer.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{layer.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(layer.id);
                  }}
                  title={layer.visible ? `Hide ${layer.label}` : `Show ${layer.label}`}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer ${
                    layer.visible
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Spatial Cadastre Layers</span>
            <span className="font-mono text-cyan-400 font-semibold">{activeCount} Visible</span>
          </div>
        </>
      )}
    </div>
  );
}
