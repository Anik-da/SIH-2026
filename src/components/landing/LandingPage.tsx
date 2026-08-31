import React from 'react';
import {
  Globe2,
  ShieldCheck,
  Layers,
  ArrowRight,
  UserCheck,
  Award,
  Lock,
  Sparkles,
  ChevronRight,
  Box,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import type { User } from '../../firebase';

interface Props {
  user: User | null;
  onLaunchApp: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<Props> = ({ user, onLaunchApp, onOpenLogin }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[150px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 py-4 backdrop-blur-xl md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Globe2 className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-white">VOLU-CAD 3D</span>
              <span className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">3D ULPIN &amp; Vertical Cadastral Mapping</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onLaunchApp}
            className="hidden items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 sm:flex"
          >
            <Globe2 className="h-4 w-4" /> 3D Globe Dashboard
          </button>

          {user ? (
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110"
            >
              <span>Go to Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/20"
            >
              <UserCheck className="h-4 w-4" />
              <span>Officer Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-20 text-center md:pt-24 md:pb-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-300 backdrop-blur-md mb-6">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span>Smart India Hackathon 2026 · Problem Statement SIH26011</span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
          Next-Gen <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">3D Vertical Cadastre</span> &amp; Volumetric Mapping
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 md:text-lg leading-relaxed">
          Transforming traditional 2D land parcels into high-fidelity 3D volumetric property identifiers (VPID), subterranean infrastructure mapping, and automated spatial topology validation.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 px-8 py-4 text-sm font-extrabold text-slate-950 shadow-2xl shadow-cyan-500/30 transition-all hover:brightness-110 active:scale-98 w-full sm:w-auto justify-center"
          >
            <Globe2 className="h-5 w-5" />
            Launch 3D GIS Globe Platform
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-7 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 w-full sm:w-auto justify-center"
          >
            <Lock className="h-4 w-4 text-cyan-400" />
            Survey Officer Login
          </button>
        </div>

        {/* Live Metrics Showcase */}
        <div className="mt-16 grid grid-cols-2 gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl md:grid-cols-4">
          <div className="p-2">
            <span className="text-2xl font-black text-cyan-400 md:text-3xl">100%</span>
            <p className="mt-1 text-xs text-slate-400">3D Volumetric Precision</p>
          </div>
          <div className="p-2">
            <span className="text-2xl font-black text-purple-400 md:text-3xl">Sub-Surface</span>
            <p className="mt-1 text-xs text-slate-400">Underground $Z &lt; 0$ Cadastre</p>
          </div>
          <div className="p-2">
            <span className="text-2xl font-black text-emerald-400 md:text-3xl">6 Rules</span>
            <p className="mt-1 text-xs text-slate-400">Automated Spatial Validation</p>
          </div>
          <div className="p-2">
            <span className="text-2xl font-black text-amber-400 md:text-3xl">ULPIN &amp; VPID</span>
            <p className="mt-1 text-xs text-slate-400">Digital Passport Credentials</p>
          </div>
        </div>
      </section>

      {/* Core Feature Grid */}
      <section className="relative z-10 border-t border-slate-800 bg-slate-950/70 py-20 px-6 backdrop-blur-md md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-extrabold text-white md:text-4xl">
              Platform Innovations &amp; Features
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
              Unified GIS geospatial mapping platform engineered for national land administration.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-cyan-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-5">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3D Floor Exploder Engine</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Separates multi-level building towers into individual 3D volumetric floor parcels along the vertical Z-axis with real-time VPID mapping.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-purple-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-5">
                <Box className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Sub-Surface Underground Mode</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Translucent terrain rendering exposes underground basements, sub-surface parking structures, utility pipelines, and transit tunnels.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-red-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3D Spatial Topology Validation</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Automated detector identifying 3D geometry volume overlaps, floor gaps, boundary encroachments, and restricted airspace violations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-emerald-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-5">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Digital Property Passport</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Generates printable volumetric certificates with owner verifications, spatial coordinates, 3D volume metrics ($m^3$), and QR codes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-orange-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-5">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Emergency Tactical View</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Provides first responders with instant 3D building floor inspection, priority hazard highlighting, and evacuation access routes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-cyan-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-5">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Immutable System Audit Log</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Role-based access logging for Survey Officers, Verification Officers, and Admins to ensure complete legal auditability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 px-6 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-slate-300">VOLU-CAD 3D</span>
            <span>· Smart India Hackathon 2026 (SIH26011)</span>
          </div>
          <p>© 2026 VOLU-CAD 3D System. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
