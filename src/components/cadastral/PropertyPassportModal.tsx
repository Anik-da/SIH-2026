import React from 'react';
import type { VerticalProperty } from '../../types/cadastral';
import { Shield, QrCode, CheckCircle2, Building, Layers, Box, Calendar, Award, X, Printer, ExternalLink } from 'lucide-react';
import { computeDeterministic3DUlpin } from '../../../server/seedData.js';

interface Props {
  property: VerticalProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPublicVerification?: (identifier: string) => void;
}

export const PropertyPassportModal: React.FC<Props> = ({
  property,
  isOpen,
  onClose,
  onOpenPublicVerification,
}) => {
  if (!isOpen || !property) return null;

  const floorNumber = property.floorNumber || 3;
  const threeDUlpIn = computeDeterministic3DUlpin(property.ulpin || property.buildingId, floorNumber);
  const verticalSuffix = floorNumber < 0 ? `B${String(Math.abs(floorNumber)).padStart(3, '0')}` : `A${String(floorNumber).padStart(3, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Top Gold / Cyan Accent Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  GOVERNMENT OF INDIA — 3D CADASTRAL PASSPORT
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Digital Property Passport
                </h2>
                <p className="font-mono text-xs text-slate-400">VPID: {property.vpid}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Passport Body Grid */}
          <div className="mt-5 space-y-4">
            {/* 19-Character 3D ULPIN Banner */}
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                    VOLU-CAD 3D ULPIN / Vertical Extension — Prototype
                  </span>
                  <p className="font-mono text-base font-black text-white tracking-widest mt-0.5">
                    {threeDUlpIn}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Vertical Suffix</span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40">
                    {verticalSuffix}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner & Registry Row */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Registered Owner</span>
                  <p className="text-sm font-bold text-white">
                    {property.ownerName || 'State Cadastral Registry (Demo Record)'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Registration Status</span>
                  <p className="flex items-center gap-1 font-semibold text-emerald-400 text-xs">
                    <CheckCircle2 className="h-4 w-4" /> VERIFIED &amp; VALIDATED
                  </p>
                </div>
              </div>
            </div>

            {/* Identifiers Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-cyan-400" /> Base ULPIN
                </span>
                <p className="mt-1 font-mono font-bold text-slate-200">{property.ulpin}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-purple-400" /> Building / Parcel
                </span>
                <p className="mt-1 font-mono font-bold text-slate-200">
                  {property.buildingId} / {property.parcelId}
                </p>
              </div>
            </div>

            {/* Volumetric Metrics */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3D Volumetric Spatial Metrics
              </span>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-900 p-2.5">
                  <span className="text-[10px] text-slate-400">Vertical Level</span>
                  <p className="text-sm font-bold text-cyan-400">{property.floorLabel || `Floor 0${floorNumber}`}</p>
                </div>
                <div className="rounded-xl bg-slate-900 p-2.5">
                  <span className="text-[10px] text-slate-400">Z-Range</span>
                  <p className="text-sm font-bold text-purple-400 font-mono">
                    {property.zMin}m ~ {property.zMax}m
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900 p-2.5">
                  <span className="text-[10px] text-slate-400">Total Volume</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">{property.volume || 1860} m³</p>
                </div>
              </div>
            </div>

            {/* QR Verification Block */}
            <div className="flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                  <Award className="h-4 w-4" /> Public Verification QR Passport
                </span>
                <p className="text-[11px] text-slate-400">
                  Scan QR code to open Digital Property Certificate at <span className="font-mono text-cyan-300">/verify/{threeDUlpIn}</span>
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1 text-slate-950 shadow-md shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/verify/${threeDUlpIn}`
                      : `https://propertymap-system.web.app/verify/${threeDUlpIn}`
                  )}`}
                  alt="QR Code"
                  className="w-14 h-14"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => {
                onClose();
                onOpenPublicVerification?.(threeDUlpIn);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:brightness-110"
            >
              <ExternalLink className="h-4 w-4" /> [Open Public Certificate]
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                <Printer className="h-4 w-4" /> Print Passport
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

