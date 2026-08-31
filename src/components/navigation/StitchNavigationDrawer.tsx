import React from 'react';
import {
  X,
  Globe2,
  Home,
  Search,
  BarChart3,
  ShieldCheck,
  Flame,
  History,
  FileCode,
  Map,
  Layers,
  FileCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export type PageId =
  | 'landing'
  | 'login'
  | 'globe'
  | 'search'
  | 'analytics'
  | 'validation'
  | 'passport'
  | 'emergency'
  | 'audit'
  | 'blueprint'
  | 'presentation'
  | 'zoning'
  | 'utilities';

interface Props {
  isOpen: boolean;
  activePage: PageId;
  onClose: () => void;
  onSelectPage: (pageId: PageId) => void;
}

interface PageItem {
  id: PageId;
  title: string;
  category: 'Core Navigation' | 'Cadastral Tools' | 'Analytical Dashboards' | 'Sub-Surface & Emergency';
  description: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

const PAGES: PageItem[] = [
  {
    id: 'landing',
    title: 'Landing Page & Hero Portal',
    category: 'Core Navigation',
    description: 'SIH 2026 Platform Overview, Hero CTA, and Public Showcase',
    icon: Home,
    color: 'text-cyan-400',
  },
  {
    id: 'login',
    title: 'Officer Authentication Portal',
    category: 'Core Navigation',
    description: 'Secure Split-Screen Login for Cadastral Surveyors & Admins',
    icon: UserCheck,
    color: 'text-emerald-400',
  },
  {
    id: 'globe',
    title: '3D GIS Cadastral Globe',
    category: 'Core Navigation',
    description: 'Cesium Ion Photorealistic Terrain & 3D Building Volume Viewer',
    icon: Globe2,
    badge: 'Main View',
    color: 'text-blue-400',
  },
  {
    id: 'search',
    title: 'ULPIN & VPID Spatial Registry Lookup',
    category: 'Cadastral Tools',
    description: 'Search parcels by ULPIN code, state, district, or VPID identifier',
    icon: Search,
    color: 'text-purple-400',
  },
  {
    id: 'passport',
    title: 'Digital Property Passport',
    category: 'Cadastral Tools',
    description: 'ULPIN Title Deed Certification, QR Verification & Owner Specs',
    icon: FileCheck,
    badge: 'Verified',
    color: 'text-cyan-300',
  },
  {
    id: 'blueprint',
    title: '2D CAD → 3D BIM Converter Studio',
    category: 'Cadastral Tools',
    description: 'Import DWG/DXF architectural floor plans to extrude 3D VPIDs',
    icon: FileCode,
    badge: 'Auto-BIM',
    color: 'text-emerald-400',
  },
  {
    id: 'analytics',
    title: 'Volumetric Spatial Analytics',
    category: 'Analytical Dashboards',
    description: 'Floor occupancy metrics, height compliance & cubic volume graphs',
    icon: BarChart3,
    color: 'text-amber-400',
  },
  {
    id: 'presentation',
    title: 'Real Estate 3D Unit Presentation',
    category: 'Analytical Dashboards',
    description: '3D Villa architectural inspector, category donut charts & price metrics',
    icon: Home,
    badge: 'Market Studio',
    color: 'text-pink-400',
  },
  {
    id: 'zoning',
    title: 'Civic Land Use & Zoning Intelligence',
    category: 'Analytical Dashboards',
    description: 'Map layers, development trends, land distribution & permit feed',
    icon: Map,
    color: 'text-purple-400',
  },
  {
    id: 'validation',
    title: '3D Topology & Boundary Validation',
    category: 'Cadastral Tools',
    description: 'Audit volumetric overlaps, zero-gap boundaries & height limits',
    icon: ShieldCheck,
    badge: 'Audit Active',
    color: 'text-red-400',
  },
  {
    id: 'utilities',
    title: 'Sub-Surface Utility Explorer ($Z < 0$)',
    category: 'Sub-Surface & Emergency',
    description: 'Underground translucent terrain mode with multi-depth utility conduits',
    icon: Zap,
    color: 'text-cyan-400',
  },
  {
    id: 'emergency',
    title: 'Emergency 3D First-Responder View',
    category: 'Sub-Surface & Emergency',
    description: 'Hazard isolation, evacuation routes, fire exits & capacity alerts',
    icon: Flame,
    color: 'text-orange-400',
  },
  {
    id: 'audit',
    title: 'Immutable Cadastral Audit Log',
    category: 'Sub-Surface & Emergency',
    description: 'Blockchain timestamped transaction history & surveyor edits',
    icon: History,
    color: 'text-slate-400',
  },
];

export const StitchNavigationDrawer: React.FC<Props> = ({
  isOpen,
  activePage,
  onClose,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(PAGES.map((p) => p.category)));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="flex h-full w-full max-w-md flex-col border-l border-cyan-500/30 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Stitch Project Pages & Modules</h2>
              <p className="text-[11px] text-slate-400">Select any view to launch directly</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body - Categorized Page List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                {category}
              </span>

              <div className="space-y-1">
                {PAGES.filter((p) => p.category === category).map((page) => {
                  const Icon = page.icon;
                  const isActive = activePage === page.id;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        onSelectPage(page.id);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                        isActive
                          ? 'border-cyan-500/40 bg-cyan-500/10 text-white shadow-lg shadow-cyan-500/10'
                          : 'border-slate-800/80 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 ${page.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{page.title}</span>
                            {page.badge && (
                              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                                {page.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{page.description}</p>
                        </div>
                      </div>

                      <ChevronRight className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
