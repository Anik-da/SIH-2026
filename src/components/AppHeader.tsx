import React, { useState, useRef, useEffect } from 'react';
import {
  Globe2,
  ShieldCheck,
  Flame,
  History,
  Layers,
  UserCheck,
  Layers3,
  User as UserIcon,
  BarChart3,
  Search,
  Home,
  Sparkles,
  ChevronDown,
  Database,
  MapPin,
  FileCheck,
  PlusCircle,
  Eye,
  Zap,
  Box,
  Building2,
  X,
} from 'lucide-react';
import type { UserRole, ExplodeState } from '../types/cadastral';
import type { User } from '../firebase';
import { useDataProvider } from '../services/data/DataProviderContext';

interface Props {
  userRole: UserRole;
  explodeState: ExplodeState;
  showUnderground: boolean;
  activeConflictCount: number;
  authUser: User | null;
  onRoleChange: (role: UserRole) => void;
  onToggleExplode: () => void;
  onToggleUnderground: () => void;
  onOpenValidation: () => void;
  onOpenEmergency: () => void;
  onOpenAudit: () => void;
  onOpenAnalytics: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onGoToLanding: () => void;
  onOpenPropertyPresentation: () => void;
  onOpenZoning: () => void;
  onOpenPagesDrawer: () => void;
  showRealFinderHud?: boolean;
  onToggleRealFinderHud?: () => void;
  onOpenGeoJsonImporter?: () => void;
  onOpenCreateBuilding?: () => void;
  onOpenGovtDataSources?: () => void;
  onOpenFloorplanTo3D?: () => void;
  onOpenBlueprint?: () => void;
  onOpenStackExplorer?: () => void;
  isRescueModeActive?: boolean;
  onToggleRescueMode?: () => void;
  onOpen3DBuilding?: () => void;
}

export default function AppHeader({
  userRole,
  explodeState,
  showUnderground,
  activeConflictCount,
  authUser,
  onRoleChange,
  onToggleExplode,
  onToggleUnderground,
  onOpenValidation,
  onOpenEmergency,
  onOpenAudit,
  onOpenAnalytics,
  onOpenSearch,
  onOpenAuth,
  onGoToLanding,
  onOpenPropertyPresentation,
  onOpenZoning,
  onOpenPagesDrawer,
  showRealFinderHud,
  onToggleRealFinderHud,
  onOpenGeoJsonImporter,
  onOpenCreateBuilding,
  onOpenGovtDataSources,
  onOpenFloorplanTo3D,
  onOpenBlueprint,
  onOpenStackExplorer,
  isRescueModeActive = false,
  onToggleRescueMode,
  onOpen3DBuilding,
}: Props) {
  const { isDemoMode, toggleDemoMode } = useDataProvider();
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative z-50 pointer-events-auto flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-900/95 px-3 md:px-4 shadow-xl backdrop-blur-xl select-none">
      {/* 1. Left Section: Brand Logo, Title & Engine Status */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 mr-1">
        <button
          onClick={onGoToLanding}
          title="Go to Landing Page"
          className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 ring-1 ring-white/20 transition-transform hover:scale-105 shrink-0"
        >
          <Globe2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
        </button>

        <div className="leading-tight shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            <h1 className="text-xs md:text-sm font-black tracking-wide text-white">COSMOPLOT 3D</h1>
            <div
              title="Operational State: Strict Real Spatial Data Engine Active (OSM Overpass GIS + MongoDB Atlas)"
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/20 select-none shrink-0"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>REAL DATA ONLY</span>
            </div>
          </div>
          <p className="text-[9px] md:text-[10px] text-slate-400 font-medium hidden 2xl:block">
            3D ULPIN &amp; Vertical Cadastre
          </p>
        </div>
      </div>

      {/* 2. Center Section: Primary Action Navigation & Tools Dropdown */}
      <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
        {/* Floorplan → 3D Studio (Prominent Hero Action for SIH MVP) */}
        {onOpenFloorplanTo3D && (
          <button
            onClick={onOpenFloorplanTo3D}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 px-2.5 md:px-3 py-1.5 text-xs font-black text-emerald-200 shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600/50 hover:to-teal-600/50 active:scale-95 ring-1 ring-emerald-400/40 shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
            <span>Floorplan → 3D</span>
            <span className="rounded bg-emerald-400/20 px-1 py-0.2 text-[8px] font-black text-emerald-300 uppercase">
              SIH MVP
            </span>
          </button>
        )}

        {/* 3D Validation */}
        <button
          onClick={onOpenValidation}
          className="relative flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-300 transition-all hover:bg-red-500/20 active:scale-95 shrink-0"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
          <span>Validation</span>
          {activeConflictCount > 0 && (
            <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
              {activeConflictCount}
            </span>
          )}
        </button>

        {/* Disaster Rescue View Toggle */}
        <button
          onClick={onOpenEmergency}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 shrink-0 ${
            isRescueModeActive
              ? 'border-red-500 bg-red-600 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400 animate-pulse'
              : 'border-orange-500/40 bg-orange-500/15 text-orange-300 hover:bg-orange-500/25'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          <span>{isRescueModeActive ? '🔴 Active' : 'Rescue View'}</span>
        </button>

        {/* Govt Data Sources (ISRO / BBMP) */}
        {onOpenGovtDataSources && (
          <button
            onClick={onOpenGovtDataSources}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/20 active:scale-95 shrink-0"
          >
            <Database className="h-3.5 w-3.5 text-amber-400" />
            <span>Govt Sources</span>
          </button>
        )}

        {/* 3D Property Building Explorer */}
        {onOpen3DBuilding && (
          <button
            onClick={onOpen3DBuilding}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 px-2.5 py-1.5 text-xs font-bold text-cyan-300 transition-all hover:scale-105 hover:border-cyan-400 hover:from-cyan-900/90 hover:to-blue-900/90 hover:text-cyan-100 shadow-md shadow-cyan-950/40 active:scale-95 shrink-0"
            title="Switch to 3D Building Experience"
          >
            <Building2 className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>3D Building</span>
          </button>
        )}

        {/* "More Tools & Cadastral Views" Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsToolsDropdownOpen((prev) => !prev);
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 md:px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              isToolsDropdownOpen
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                : 'border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span>Tools &amp; Views</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180 text-cyan-300' : ''}`} />
          </button>

          {isToolsDropdownOpen && (
            <div
              style={{ backgroundColor: '#090d16', zIndex: 99999 }}
              className="absolute top-full left-0 mt-2 w-80 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-2.5 shadow-2xl ring-1 ring-cyan-500/30 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Dropdown Header with Close button */}
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 pb-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">Tools & Cadastral Views</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsToolsDropdownOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Menu"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {onOpen3DBuilding && (
                <button
                  onClick={() => { onOpen3DBuilding(); setIsToolsDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-cyan-300">3D Building Explorer</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300">First-person 3D vertical property exploration</div>
                  </div>
                </button>
              )}

              {onOpenBlueprint && (
                <button
                  onClick={() => { onOpenBlueprint(); setIsToolsDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 transition-colors">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-cyan-300">2D CAD Blueprint Converter</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Vector blueprint CAD extrusion</div>
                  </div>
                </button>
              )}

              {onOpenStackExplorer && (
                <button
                  onClick={() => { onOpenStackExplorer(); setIsToolsDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 transition-all group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 transition-colors">
                    <Box className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-purple-300">3D Stack &amp; Unit Matrix</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Unit breakdown &amp; stack explorer</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => { onOpenSearch(); setIsToolsDropdownOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 transition-colors">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-cyan-300">Search ULPIN / VPID</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Registry spatial lookup</div>
                </div>
              </button>

              <button
                onClick={() => { onOpenAnalytics(); setIsToolsDropdownOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 transition-colors">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-cyan-300">Volumetric Analytics</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Floor occupancy &amp; height limits</div>
                </div>
              </button>

              <button
                onClick={() => { onOpenZoning(); setIsToolsDropdownOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 transition-all group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 transition-colors">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-purple-300">Land Use &amp; Zoning</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Civic zoning intelligence</div>
                </div>
              </button>

              <button
                onClick={() => { onOpenPropertyPresentation(); setIsToolsDropdownOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-emerald-300">Real Estate 3D Presentation</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Unit architectural showcase</div>
                </div>
              </button>

              {onOpenGeoJsonImporter && (
                <button
                  onClick={() => { onOpenGeoJsonImporter(); setIsToolsDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition-all group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25 transition-colors">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-blue-300">Import 3D GIS Database</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300">National GeoJSON layer ingestion</div>
                  </div>
                </button>
              )}

              {onOpenCreateBuilding && (
                <button
                  onClick={() => { onOpenCreateBuilding(); setIsToolsDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-emerald-300">+ Create 3D Building</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Custom volume positioning</div>
                  </div>
                </button>
              )}

              {onToggleRealFinderHud && (
                <button
                  onClick={() => { onToggleRealFinderHud(); setIsToolsDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 transition-colors">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-cyan-300">RealFinder HUD Overlay</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Toggle live overlay</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => { onOpenAudit(); setIsToolsDropdownOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all border-t border-slate-800/80 pt-2 group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-slate-700 transition-colors">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 group-hover:text-white">Audit Trail &amp; Events</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-slate-300">Officer action transaction history</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* All Modules Drawer Launcher */}
        <button
          onClick={onOpenPagesDrawer}
          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2.5 md:px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-md shadow-cyan-500/20 transition-all hover:bg-cyan-500/25 active:scale-95 shrink-0"
        >
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span>Modules</span>
        </button>
      </div>

      {/* 3. Right Section: Quick 3D Toggles, Role Switcher & Officer Profile */}
      <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
        {/* Quick Explode 3D Toggle */}
        <button
          onClick={onToggleExplode}
          title={explodeState === 'exploded' ? 'Collapse 3D Floor Volumes' : 'Explode 3D Floor Volumes'}
          className={`flex h-8 items-center gap-1 rounded-xl px-2 text-xs font-bold transition-all shrink-0 ${
            explodeState === 'exploded'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers3 className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{explodeState === 'exploded' ? 'Collapse' : 'Explode'}</span>
        </button>

        {/* Quick Underground Mode Toggle */}
        <button
          onClick={onToggleUnderground}
          title={showUnderground ? 'Disable Subsurface Mode' : 'Enable Subsurface ($Z < 0$) Mode'}
          className={`flex h-8 items-center gap-1 rounded-xl px-2 text-xs font-bold transition-all shrink-0 ${
            showUnderground
              ? 'border border-purple-400 bg-purple-500/20 text-purple-300'
              : 'border border-slate-700 bg-slate-800/80 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-purple-400" />
          <span className="hidden lg:inline">Sub-Surface</span>
        </button>

        {/* Role Selector */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/90 px-2 py-1 text-xs shrink-0">
          <UserCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span className="text-[10px] text-slate-400 hidden xl:inline">ROLE:</span>
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent font-bold text-cyan-300 focus:outline-none cursor-pointer text-xs"
          >
            <option value="ADMIN" className="bg-slate-900 text-white">ADMIN</option>
            <option value="SURVEY_OFFICER" className="bg-slate-900 text-white">SURVEYOR</option>
            <option value="VERIFICATION_OFFICER" className="bg-slate-900 text-white">VERIFIER</option>
            <option value="VIEWER" className="bg-slate-900 text-white">PUBLIC</option>
          </select>
        </div>

        {/* Officer Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 active:scale-95 shrink-0"
        >
          {authUser?.photoURL ? (
            <img src={authUser.photoURL} alt="Avatar" className="h-5 w-5 rounded-full border border-cyan-400" />
          ) : (
            <UserIcon className="h-3.5 w-3.5 text-cyan-400" />
          )}
          <span className="max-w-[70px] truncate hidden md:inline">
            {authUser ? authUser.displayName || authUser.email?.split('@')[0] : 'Admin'}
          </span>
        </button>
      </div>
    </header>
  );
}
