import React from 'react';
import { DataProvenance } from '../../services/data/IDataProvider';
import { ShieldCheck, Database, FileCode, AlertTriangle, Cpu } from 'lucide-react';

interface Props {
  provenance?: DataProvenance;
  compact?: boolean;
}

export const DataProvenanceBadge: React.FC<Props> = ({ provenance, compact = false }) => {
  if (!provenance) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>UNVERIFIED DATA SOURCE</span>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (provenance.sourceType) {
      case 'official_government':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
      case 'open_data':
        return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300';
      case 'derived':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
      case 'user_imported':
        return 'bg-blue-500/15 border-blue-500/40 text-blue-300';
      default:
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
    }
  };

  const getIcon = () => {
    switch (provenance.sourceType) {
      case 'official_government':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'open_data':
        return <Database className="w-3.5 h-3.5 text-cyan-400" />;
      case 'derived':
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      case 'user_imported':
        return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (provenance.sourceType) {
      case 'official_government':
        return 'REAL OFFICIAL DATA';
      case 'open_data':
        return 'REAL OPEN GIS DATA';
      case 'derived':
        return 'DERIVED DATA';
      case 'user_imported':
        return 'USER IMPORTED DATA';
      default:
        return 'UNVERIFIED DATA';
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider ${getStatusColor()}`}>
        {getIcon()}
        <span>{getTypeLabel()}</span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl border space-y-2 backdrop-blur-md ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs">
          {getIcon()}
          <span>{getTypeLabel()}</span>
        </div>
        <span className="text-[10px] font-mono opacity-80">
          Confidence: {Math.round(provenance.confidenceScore * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-700/40">
        <div>
          <span className="text-[9px] text-slate-400 block uppercase">Source</span>
          <span className="truncate block font-semibold">{provenance.sourceName}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block uppercase">Record ID</span>
          <span className="truncate block font-mono">{provenance.sourceRecordId}</span>
        </div>
      </div>
    </div>
  );
};
