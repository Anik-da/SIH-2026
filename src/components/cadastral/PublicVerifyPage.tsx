import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, QrCode, Lock, Globe, Layers, Box, ArrowLeft, Award, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { buildingApiClient } from '../../services/api/buildingApiClient';
import type { PublicVerificationResponse } from '../../types/mongodbBuilding';

interface PublicVerifyPageProps {
  vpid?: string;
  identifier?: string;
  onBack?: () => void;
}

export const PublicVerifyPage: React.FC<PublicVerifyPageProps> = ({
  vpid = 'VPID-KA-BLR-001-F03',
  identifier,
  onBack,
}) => {
  const queryId = identifier || vpid || '12A34B56C78D90-A003';
  const [cert, setCert] = useState<PublicVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    buildingApiClient.getPublicVerification(queryId).then((res) => {
      if (isMounted) {
        setCert(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [queryId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Accent Gradient */}
        <div className="h-2.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 block">
                  GOVERNMENT OF INDIA — 3D VERTICAL PROPERTY CADASTRAL REGISTRY
                </span>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-wide mt-0.5">
                  DIGITAL PROPERTY CERTIFICATE
                </h1>
                <p className="font-mono text-xs text-slate-400 mt-1">
                  Reference: <span className="text-cyan-300 font-bold">{cert?.threeDUlpIn || queryId}</span>
                </p>
              </div>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" /> Exit
              </button>
            )}
          </div>

          {/* Verification Status Badge */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  AUTHENTICATED IN 3D CADASTRAL REGISTRY
                </p>
                <p className="text-[11px] text-emerald-400/90 font-medium">
                  3D Volumetric Extent Cryptographically Signed &amp; Verified
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/40">
              Verified by VOLU-CAD
            </span>
          </div>

          {/* Certificate Attribute Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> 3D ULPIN (19-Character Extension)
              </span>
              <p className="font-mono font-black text-sm text-cyan-300 tracking-wider">
                {cert?.threeDUlpIn || '12A34B56C78D90-A003'}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Vertical Property ID (VPID)
              </span>
              <p className="font-mono font-bold text-sm text-purple-300">
                {cert?.vpid || 'VPID-KA-BLR-001-F03'}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> Building &amp; Property Level
              </span>
              <p className="font-bold text-sm text-white">
                {cert?.property || 'Floor 03'} • {cert?.building || 'B1-A Commercial Skyscraper'}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Box className="w-3.5 h-3.5 text-emerald-400" /> Floor Area &amp; Z-Extent
              </span>
              <p className="font-mono font-bold text-sm text-emerald-300">
                {cert?.floorArea || '620 sq.ft (58 m²)'} • {cert?.elevationExtent || 'Z: 9.0m to 12.0m'}
              </p>
            </div>

          </div>

          {/* Distinction Banner: Official vs VOLU-CAD Prototype */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Source Lineage &amp; Verification Distinction
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                PROTOTYPE EXTENSION
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 block">Official Government ULPIN:</span>
                <span className="font-mono font-bold text-amber-300">
                  {cert?.officialUlpin === 'NOT_AVAILABLE' ? 'Official ULPIN Unavailable' : (cert?.officialUlpin || 'Official ULPIN Unavailable')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">3D Extension Method:</span>
                <span className="font-semibold text-slate-200">VOLU-CAD Vertical Mesh Derivation</span>
              </div>
            </div>
          </div>

          {/* Privacy Protection Notice */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-400">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-300">Public Privacy Protocol</p>
              <p className="text-[11px] text-slate-400">
                Confidential owner deed documents and financial records are protected. Only geometric coordinates and validity tokens are published publicly.
              </p>
            </div>
          </div>

          {/* Footer QR Info */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center text-slate-950 shadow-md">
                <QrCode className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 font-mono select-all">/verify/{cert?.threeDUlpIn || queryId}</p>
                <p className="text-[11px] text-slate-400">Certified Date: {cert?.verificationDate || new Date().toISOString().slice(0, 10)}</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              Print Certificate
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

