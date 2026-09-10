import { X, Globe, FileText, Eye, EyeOff, RotateCcw, KeyRound, Fingerprint } from 'lucide-react';
import type { PropertyData, PropertyContext } from '@/types';
import { BASE_ULPIN } from '@/data/constants';
import { generateThreeDUlpin, formatArea, formatZ } from '@/utils/idUtils';

interface PropertyPanelProps {
  property: PropertyData;
  context: PropertyContext | null;
  onClose: () => void;
  onOpenGIS: () => void;
  onOpenPassport: () => void;
  onIsolate: () => void;
  onShowAll: () => void;
  isIsolated: boolean;
}

export function PropertyPanel({
  property,
  context,
  onClose,
  onOpenGIS,
  onOpenPassport,
  onIsolate,
  onShowAll,
  isIsolated,
}: PropertyPanelProps) {
  const threeDUlpin = context?.threeDUlpin ?? generateThreeDUlpin(property.floorId);

  return (
    <div className="absolute right-4 top-20 z-20 w-80 max-h-[calc(100vh-180px)] overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div>
          <div className="text-[10px] tracking-wider text-cyan-400">PROPERTY IDENTIFIED</div>
          <div className="text-sm font-bold text-white">{property.label}</div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* PROPERTY IDENTITY */}
        <section>
          <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500">PROPERTY IDENTITY</h3>
          <div className="space-y-2">
            <DataRow icon={<KeyRound className="h-3 w-3" />} label="VPID" value={property.vpid} mono />
            <DataRow label="Official ULPIN" value={BASE_ULPIN} mono />
            <DataRow label="3D ULPIN" value={threeDUlpin} mono highlight />
          </div>
          <p className="mt-1.5 text-[9px] leading-relaxed text-slate-500">
            COSMOPLOT 3D prototype 3D ULPIN / vertical extension — not the official Government of India ULPIN format.
          </p>
        </section>

        <div className="h-px bg-slate-700/40" />

        {/* VERTICAL POSITION */}
        <section>
          <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500">VERTICAL POSITION</h3>
          <div className="grid grid-cols-2 gap-2">
            <DataCell label="Floor" value={property.floorId} />
            <DataCell label="Height" value={formatZ(property.zMax - property.zMin)} />
            <DataCell label="Z-Min" value={formatZ(property.zMin)} />
            <DataCell label="Z-Max" value={formatZ(property.zMax)} />
          </div>
        </section>

        <div className="h-px bg-slate-700/40" />

        {/* PROPERTY DATA */}
        <section>
          <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500">PROPERTY DATA</h3>
          <div className="grid grid-cols-2 gap-2">
            <DataCell label="Type" value={property.propertyType} />
            <DataCell label="Area" value={formatArea(property.area)} />
            <DataCell label="Volume" value={`${property.volume.toFixed(0)} m³`} />
            <DataCell label="Status" value={property.status} />
          </div>
        </section>

        <div className="h-px bg-slate-700/40" />

        {/* Verification */}
        <section>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">DEMO VERIFIED</span>
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <button
              onClick={onIsolate}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white"
            >
              {isIsolated ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {isIsolated ? 'SHOW ALL' : 'ISOLATE'}
            </button>
            <button
              onClick={onShowAll}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              RESET
            </button>
          </div>
          <button
            onClick={onOpenPassport}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white"
          >
            <FileText className="h-4 w-4" />
            VIEW PROPERTY PASSPORT
          </button>
          <button
            onClick={onOpenGIS}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-3 text-sm font-semibold text-cyan-300 transition-all hover:scale-[1.02] hover:border-cyan-400/70 hover:bg-cyan-500/25 hover:text-cyan-200 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <Globe className="h-5 w-5" />
            OPEN IN GIS GLOBE
          </button>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value, mono, highlight, icon }: { label: string; value: string; mono?: boolean; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-slate-400">{icon}{label}</span>
      <span className={`text-right text-xs ${mono ? 'font-mono' : ''} ${highlight ? 'font-semibold text-cyan-300' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-700/40 bg-slate-800/30 px-2.5 py-1.5">
      <div className="text-[9px] tracking-wider text-slate-500">{label}</div>
      <div className="text-xs font-medium text-slate-200">{value}</div>
    </div>
  );
}
