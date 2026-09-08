import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, XCircle, Upload, ShieldCheck, Database, Layers } from 'lucide-react';
import { demoDocuments } from '../../data/cadastralDemoData';
import type { DocumentVerification } from '../../types/cadastral';

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVpid?: (vpid: string) => void;
}

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  isOpen,
  onClose,
  onSelectVpid,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentVerification>(demoDocuments[0]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">Document Verification & Deed Cross-Check</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PROTOTYPE OCR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated legal deed parser comparing extracted OCR text against 3D Spatial Cadastre & Database registry
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-6 text-center bg-slate-950/40 transition-all relative">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleSimulatedUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-slate-800 text-blue-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                {isUploading ? 'Extracting Legal Deed Telemetry...' : 'Drop Registered Sale Deed, Parcel Extract, or Title Certificate (PDF/Image)'}
              </p>
              <p className="text-xs text-slate-500">
                Mock Extraction automatically compares ULPIN, VPID, Z-Elevations & Floor Volumes
              </p>
            </div>
          </div>

          {/* Document Select & Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Document Reference</p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{selectedDoc.documentName}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Linked VPID</p>
              <button
                onClick={() => onSelectVpid?.(selectedDoc.extractedVpid)}
                className="text-sm font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                {selectedDoc.extractedVpid}
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Verification Status</p>
              <div className="flex items-center gap-2">
                {selectedDoc.overallStatus === 'MATCH' && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED MATCH
                  </span>
                )}
                {selectedDoc.overallStatus === 'WARNING' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> DISCREPANCY WARNING
                  </span>
                )}
                {selectedDoc.overallStatus === 'MISMATCH' && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> MISMATCH DETECTED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Field Comparison Table */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Field-by-Field Verification Matrix
              </span>
              <span className="text-[11px] text-slate-500">Document Extracted vs 3D Cadastral Database</span>
            </div>
            
            <div className="divide-y divide-slate-800/80">
              {selectedDoc.fields.map((field, idx) => (
                <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center hover:bg-slate-800/30 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{field.fieldName}</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Deed Text</p>
                    <p className="text-xs font-mono text-slate-200 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {field.documentValue}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Database & 3D Model</p>
                    <p className="text-xs font-mono text-slate-200 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {field.databaseValue}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    {field.status === 'MATCH' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Match
                      </span>
                    )}
                    {field.status === 'WARNING' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Review
                      </span>
                    )}
                    {field.status === 'MISMATCH' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Mismatch
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Official Prototype Dataset — Survey of India 3D Cadastral Protocol
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert('Document Verification Logged to Audit Trail & System Registry!');
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            >
              Confirm Verification Record
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
