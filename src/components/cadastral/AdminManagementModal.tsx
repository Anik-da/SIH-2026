import React, { useState } from 'react';
import { X, Users, Shield, Radio, RefreshCw, CheckCircle2, AlertCircle, Database, Lock } from 'lucide-react';
import type { UserRole } from '../../types/cadastral';

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onTriggerSimulatedEvent: (eventName: string) => void;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onRoleChange,
  onTriggerSimulatedEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'datasets' | 'mongo_ingestion' | 'system' | 'simulation'>('roles');
  const [datasetStatuses, setDatasetStatuses] = useState<Record<string, string>>({
    'DS-ISRO-01': 'APPROVED',
    'DS-BBMP-02': 'APPROVED',
    'DS-DEM-03': 'VALIDATED',
    'DS-UPLOAD-04': 'PROCESSING',
  });
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = (eventKey: string) => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onTriggerSimulatedEvent(eventKey);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">System Administration & Role Access</h2>
              <p className="text-xs text-slate-400">
                Manage roles, inspect permissions, telemetry status & trigger real-time change stream events
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'roles'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Role &amp; Permissions
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'datasets'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Dataset Lifecycle Approval
          </button>
          <button
            onClick={() => setActiveTab('mongo_ingestion')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'mongo_ingestion'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> MongoDB Ingestion &amp; Discovery
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'system'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> System Telemetry
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'simulation'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" /> Live Event Stream Simulator
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {activeTab === 'roles' && (
            <div className="space-y-6">
              
              {/* Role Switcher */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Active User Role</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['ADMIN', 'SURVEY_OFFICER', 'VERIFICATION_OFFICER', 'VIEWER'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => onRoleChange(r)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        currentRole === r
                          ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span>{r}</span>
                        {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal">
                        {r === 'ADMIN' && 'Full system control & data management'}
                        {r === 'SURVEY_OFFICER' && 'Spatial survey & ULPIN generation'}
                        {r === 'VERIFICATION_OFFICER' && 'Deed cross-checks & passport sign-offs'}
                        {r === 'VIEWER' && 'Read-only public inspection view'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden text-xs">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 text-xs font-bold text-slate-300">
                  Role Permission Matrix
                </div>
                <div className="divide-y divide-slate-800/80">
                  {[
                    { action: 'View 3D Cadastre & Parcels', admin: true, survey: true, verify: true, viewer: true },
                    { action: 'Generate ULPIN & VPID Records', admin: true, survey: true, verify: false, viewer: false },
                    { action: 'Execute 3D Spatial Validation Rules', admin: true, survey: true, verify: true, viewer: false },
                    { action: 'Verify Legal Deeds & Issue Passports', admin: true, survey: false, verify: true, viewer: false },
                    { action: 'Modify System Architecture & Audit Logs', admin: true, survey: false, verify: false, viewer: false },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3 grid grid-cols-5 gap-2 items-center hover:bg-slate-800/20">
                      <span className="col-span-2 font-medium text-slate-300">{p.action}</span>
                      <span className={p.admin ? 'text-emerald-400 font-bold' : 'text-slate-600'}>{p.admin ? '✓' : '✗'}</span>
                      <span className={p.survey ? 'text-emerald-400 font-bold' : 'text-slate-600'}>{p.survey ? '✓' : '✗'}</span>
                      <span className={p.verify ? 'text-emerald-400 font-bold' : 'text-slate-600'}>{p.verify ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'datasets' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Government &amp; Survey Dataset Approvals</h3>
                    <p className="text-xs text-slate-400">Lifecycle states: IMPORTED &rarr; PROCESSING &rarr; VALIDATED &rarr; APPROVED / REJECTED</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN GATEWAY
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'DS-ISRO-01', name: 'Bhuvan 2D/3D Cadastral Vector Grid', source: 'Bhuvan / NRSC / ISRO', features: '42 Parcels' },
                    { id: 'DS-BBMP-02', name: 'BBMP e-Aasthi Vertical Property Records', source: 'Karnataka / BBMP', features: '38 Properties' },
                    { id: 'DS-DEM-03', name: 'Cartosat-3 DEM/DSM High-Res Elevation Surface', source: 'Bhuvan / NRSC', features: '15 Heights' },
                    { id: 'DS-UPLOAD-04', name: 'Custom Drone Survey (GeoJSON Vector)', source: 'Surveyor Upload', features: '12 Parcels' },
                  ].map((ds) => {
                    const st = datasetStatuses[ds.id] || 'PROCESSING';
                    return (
                      <div key={ds.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white text-xs">{ds.name}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span>{ds.source}</span>
                            <span>&bull;</span>
                            <span>{ds.features}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            st === 'VALIDATED' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            st === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {st}
                          </span>

                          <button
                            onClick={() => setDatasetStatuses((prev) => ({ ...prev, [ds.id]: 'APPROVED' }))}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold hover:bg-emerald-500/30 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setDatasetStatuses((prev) => ({ ...prev, [ds.id]: 'REJECTED' }))}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold hover:bg-rose-500/30 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mongo_ingestion' && (
            <div className="space-y-4">
              {/* Ingestion Overview */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">MongoDB Atlas Cadastral Data Store</h3>
                    <p className="text-xs text-slate-400">Database: <span className="font-mono text-cyan-400">cosmoplot</span> &bull; Collection: <span className="font-mono text-cyan-400">buildings</span> (20+ bengaluru Cesium 3D features persistent)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    CACHE-FIRST PERSISTENT
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4 text-center text-xs">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block">Total Buildings</span>
                    <span className="text-lg font-bold text-white">20</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block">Verified</span>
                    <span className="text-lg font-bold text-emerald-400">14</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block">Public Sources</span>
                    <span className="text-lg font-bold text-cyan-400">4</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block">Needs Review</span>
                    <span className="text-lg font-bold text-amber-400">2</span>
                  </div>
                </div>

                {/* Table of persistent mongo buildings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="px-4 py-2.5 bg-slate-950/80 font-bold text-slate-300 flex justify-between items-center border-b border-slate-800">
                    <span>Persistent Building Intelligence Records</span>
                    <span className="text-[11px] font-mono text-cyan-400">Collection: buildings</span>
                  </div>
                  <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto custom-scrollbar">
                    {[
                      { id: 'BLDG-BLR-001', name: 'B1-A Commercial Skyscraper', cesium: 'solid-bim-building-1', source: 'BBMP_EAISTHI', status: 'VERIFIED' },
                      { id: 'BLDG-BLR-002', name: 'UB City Tower A (Pinnacle)', cesium: 'city-building-b1', source: 'BHUVAN_ISRO', status: 'VERIFIED' },
                      { id: 'BLDG-BLR-003', name: 'World Trade Center BLR Annex', cesium: 'city-building-b2', source: 'CADASTRAL_SURVEY', status: 'PUBLIC_SOURCE' },
                      { id: 'BLDG-BLR-004', name: 'High Court Administrative Annex', cesium: 'city-building-b3', source: 'BBMP_EAISTHI', status: 'VERIFIED' },
                      { id: 'BLDG-BLR-005', name: 'Public Utility Building MG Road', cesium: 'city-building-b4', source: 'BHUVAN_ISRO', status: 'PUBLIC_SOURCE' },
                      { id: 'BLDG-BLR-006', name: 'Brigade Road Commercial Plaza', cesium: 'city-building-b5', source: 'PUBLIC_WEB', status: 'PARTIALLY_VERIFIED' },
                    ].map((row) => (
                      <div key={row.id} className="p-3 flex items-center justify-between hover:bg-slate-800/30">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-cyan-400 font-bold">{row.id}</span>
                            <span className="text-white font-semibold">{row.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Cesium Feature: {row.cesium} &bull; Src: {row.source}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {row.status}
                          </span>
                          <button className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 font-mono">
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">CesiumJS 3D Globe Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">ONLINE</span>
                </div>
                <p className="text-slate-400 text-[11px]">Rendering Esri World Satellite, World Terrain & OSM 3D Buildings.</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">MongoDB Spatial Provider</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">DEMO READY</span>
                </div>
                <p className="text-slate-400 text-[11px]">Serving 3D property volumes, parcels, ULPINs & audit entries.</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Firebase Authentication</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">ACTIVE</span>
                </div>
                <p className="text-slate-400 text-[11px]">Securing private role-based routes and user session states.</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Real-Time Simulation Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold text-[10px]">READY</span>
                </div>
                <p className="text-slate-400 text-[11px]">Simulating WebSockets / MongoDB Change Streams for SIH demo.</p>
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Simulate Real-Time System Updates</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Trigger live events to demonstrate automated WebSocket / Change Stream broadcast behavior to SIH evaluators.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSimulate('NEW_PROPERTY_REGISTERED')}
                    disabled={isSimulating}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl text-left transition-all"
                  >
                    <p className="text-xs font-bold text-purple-400">1. New Property Registered</p>
                    <p className="text-[10px] text-slate-500 mt-1">Injects a new VPID (VP-001-B01-F5) into active registry.</p>
                  </button>

                  <button
                    onClick={() => handleSimulate('TOPOLOGY_VALIDATED')}
                    disabled={isSimulating}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl text-left transition-all"
                  >
                    <p className="text-xs font-bold text-cyan-400">2. 3D Spatial Validation</p>
                    <p className="text-[10px] text-slate-500 mt-1">Triggers automated rule check across all 3D floor volumes.</p>
                  </button>

                  <button
                    onClick={() => handleSimulate('DOCUMENT_VERIFIED')}
                    disabled={isSimulating}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl text-left transition-all"
                  >
                    <p className="text-xs font-bold text-emerald-400">3. Document Verified</p>
                    <p className="text-[10px] text-slate-500 mt-1">Issues digital property passport for Ground Floor Commercial.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            COSMOPLOT 3D Admin Console — SIH 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
