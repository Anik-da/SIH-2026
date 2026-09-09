import React, { useState } from 'react';
import { Info, ChevronUp } from 'lucide-react';

interface LegendItem {
  label: string;
  color: string;
  shape: 'square' | 'diamond' | 'striped' | 'circle';
}

const LEGEND_ITEMS: LegendItem[] = [
  { label: 'Parcel', color: '#22d3ee', shape: 'square' },
  { label: 'Building', color: '#f59e0b', shape: 'square' },
  { label: 'Selected', color: '#38bdf8', shape: 'diamond' },
  { label: 'Validation Conflict', color: '#ef4444', shape: 'striped' },
  { label: 'Underground', color: '#a78bfa', shape: 'circle' },
];

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{ backgroundColor: '#090d16' }}
      className="pointer-events-auto rounded-xl border border-slate-700 bg-slate-950/95 backdrop-blur-md shadow-2xl transition-all duration-200"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-3 px-3 py-2 text-xs font-semibold tracking-wide text-slate-200 hover:text-cyan-300 transition-colors w-full cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Legend</span>
        </div>
        <ChevronUp
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-300' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="space-y-1.5 p-3 pt-1 border-t border-slate-800 w-52 animate-in fade-in duration-150">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <LegendSwatch item={item} />
              <span className="text-xs text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LegendSwatch({ item }: { item: LegendItem }) {
  const base = 'h-5 w-5 shrink-0';
  if (item.shape === 'diamond') {
    return (
      <span
        className={`${base} rotate-45 rounded-sm ring-2 ring-white/30`}
        style={{ backgroundColor: item.color }}
      />
    );
  }
  if (item.shape === 'circle') {
    return (
      <span
        className={`${base} rounded-full ring-1 ring-white/20`}
        style={{ backgroundColor: item.color }}
      />
    );
  }
  if (item.shape === 'striped') {
    return (
      <span
        className={`${base} rounded-sm ring-1 ring-white/20`}
        style={{
          background: `repeating-linear-gradient(45deg, ${item.color}, ${item.color} 3px, transparent 3px, transparent 6px)`,
          backgroundColor: 'rgba(239,68,68,0.2)',
        }}
      />
    );
  }
  return (
    <span
      className={`${base} rounded-sm ring-1 ring-white/20`}
      style={{ backgroundColor: item.color }}
    />
  );
}
