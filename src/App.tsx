import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Cartesian3,
  Color,
  Math as CesiumMath,
  Entity,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
} from 'cesium';
import type { DataSource, PolylineGraphics } from 'cesium';
import CesiumGlobe from './components/CesiumGlobe';
import type { CesiumGlobeHandle } from './components/cesium.types';
import type { SensorMode } from './utils/godsEyeShaders';
import MapToolbar from './components/MapToolbar';
import LayerManager from './components/LayerManager';
import MapLegend from './components/MapLegend';
import CoordinateDisplay from './components/CoordinateDisplay';
import CameraControls from './components/CameraControls';
import SelectionManager from './components/SelectionManager';
import AppHeader from './components/AppHeader';

import { VerticalPropertyPanel } from './components/cadastral/VerticalPropertyPanel';
import { VerticalFloorSlider } from './components/cadastral/VerticalFloorSlider';
import { TopologyValidationModal } from './components/cadastral/TopologyValidationModal';
import { PropertyPassportModal } from './components/cadastral/PropertyPassportModal';
import { EmergencyPlanningModal } from './components/cadastral/EmergencyPlanningModal';
import { AuditLogDrawer } from './components/cadastral/AuditLogDrawer';
import { VolumetricAnalyticsModal } from './components/cadastral/VolumetricAnalyticsModal';
import { GeoSearchModal } from './components/cadastral/GeoSearchModal';
import { StitchControlDock } from './components/cadastral/StitchControlDock';
import { SmartCityHUD } from './components/cadastral/SmartCityHUD';
import { BlueprintConverterModal } from './components/cadastral/BlueprintConverterModal';
import { PropertyPresentationModal } from './components/cadastral/PropertyPresentationModal';
import { ZoningDashboardModal } from './components/cadastral/ZoningDashboardModal';
import { RealFinderHUD } from './components/cadastral/RealFinderHUD';
import { ThreeCityStatusHUD, type ThreeCityStatus } from './components/cadastral/ThreeCityStatusHUD';
import { RealFinderInspectModal } from './components/cadastral/RealFinderInspectModal';
import { RealFinderCardPopup } from './components/cadastral/RealFinderCardPopup';
import { BuildingStackExplorerModal } from './components/cadastral/BuildingStackExplorerModal';
import { StitchNavigationDrawer, PageId } from './components/navigation/StitchNavigationDrawer';
import { AuthModal } from './components/auth/AuthModal';

import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/landing/LoginPage';
import GeoJsonImporterModal from './components/cadastral/GeoJsonImporterModal';

import { buildingApiClient } from './services/api/buildingApiClient';
import { BuildingInformationPanel } from './components/cadastral/BuildingInformationPanel';
import { FloorPanel } from './components/cadastral/FloorPanel';
import type { MongoBuildingDocument, MongoFloorDocument } from './types/mongodbBuilding';
import CreateBuildingModal from './components/cadastral/CreateBuildingModal';
import { DocumentVerificationModal } from './components/cadastral/DocumentVerificationModal';
import { AdminManagementModal } from './components/cadastral/AdminManagementModal';
import { GovtDataSourcesModal } from './components/datasources/GovtDataSourcesModal';
import { PublicVerifyPage } from './components/cadastral/PublicVerifyPage';
import { FloorplanTo3DModal } from './components/cadastral/FloorplanTo3DModal';

import { DEFAULT_LAYERS, DEMO_AREA } from './types/gis';
import type { Coordinates, LayerConfig, SelectionInfo } from './types/gis';
import type { UserRole, ExplodeState, ValidationConflict, AuditLogEntry } from './types/cadastral';
import { demoBuilding, demoProperties, demoConflicts, demoAuditLogs } from './data/cadastralDemoData';
import { flyToBuilding, flyToFloor } from './utils/cesium3dHelpers';
import { auth, onAuthStateChanged, type User } from './firebase';

function App() {
  const globeRef = useRef<CesiumGlobeHandle>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const measureHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const measureEntityRef = useRef<Entity | null>(null);
  const measurePointsRef = useRef<Cartesian3[]>([]);

  // Navigation View State ('landing' | 'login' | 'app')
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'app'>('landing');

  // Base GIS State
  const [activeSensorMode, setActiveSensorMode] = useState<SensorMode>('NORMAL');

  const handleSelectSensorMode = (mode: SensorMode) => {
    setActiveSensorMode(mode);
    globeRef.current?.setSensorMode(mode);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === '1') handleSelectSensorMode('NORMAL');
      else if (e.key === '2') handleSelectSensorMode('NVG');
      else if (e.key === '3') handleSelectSensorMode('FLIR');
      else if (e.key === '4') handleSelectSensorMode('CRT');
      else if (e.key === '5') handleSelectSensorMode('NOIR');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureInfo, setMeasureInfo] = useState<string | null>(null);
  const [isOrbiting360, setIsOrbiting360] = useState(false);

  // Cadastral 3D State
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>('B-001-F3');
  const [explodeState, setExplodeState] = useState<ExplodeState>('collapsed');
  const [showUnderground, setShowUnderground] = useState(true);
  const [showUtilities, setShowUtilities] = useState(true);

  // Modals & Drawers State
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isPropertyPresentationOpen, setIsPropertyPresentationOpen] = useState(false);
  const [isZoningOpen, setIsZoningOpen] = useState(false);
  const [isPagesDrawerOpen, setIsPagesDrawerOpen] = useState(false);
  const [showRealFinderHud, setShowRealFinderHud] = useState(false);
  const [isRealFinderCardOpen, setIsRealFinderCardOpen] = useState(true);
  const [isRealFinderInspectOpen, setIsRealFinderInspectOpen] = useState(false);
  const [isGeoJsonImporterOpen, setIsGeoJsonImporterOpen] = useState(false);
  const [importedGeoJson, setImportedGeoJson] = useState<any>(null);
  const [isCreateBuildingOpen, setIsCreateBuildingOpen] = useState(false);
  const [userCreatedBuildings, setUserCreatedBuildings] = useState<any[]>([]);
  const [selectedBuildingFeature, setSelectedBuildingFeature] = useState<{
    name: string;
    ulpin: string;
    lat: number;
    lon: number;
    height: number;
    floors: number;
    valuation: string;
    address?: string;
    cesiumFeatureId?: string;
  } | null>(null);

  const [persistentBuilding, setPersistentBuilding] = useState<MongoBuildingDocument | null>(null);
  const [persistentFloors, setPersistentFloors] = useState<MongoFloorDocument[]>([]);
  const [isBuildingPanelOpen, setIsBuildingPanelOpen] = useState(false);
  const [isFloorPanelOpen, setIsFloorPanelOpen] = useState(false);
  const [isStackExplorerOpen, setIsStackExplorerOpen] = useState(false);

  const [isDocumentVerificationOpen, setIsDocumentVerificationOpen] = useState(false);
  const [isAdminManagementOpen, setIsAdminManagementOpen] = useState(false);
  const [isGovtDataSourcesOpen, setIsGovtDataSourcesOpen] = useState(false);
  const [isFloorplanTo3DOpen, setIsFloorplanTo3DOpen] = useState(false);
  const [isRescueModeActive, setIsRescueModeActive] = useState(false);
  const [isPublicVerifyView, setIsPublicVerifyView] = useState(false);
  const [publicVerifyId, setPublicVerifyId] = useState<string | null>(null);

  const [authUser, setAuthUser] = useState<User | null>(null);

  // Pre-load default sample building & floor data and check initial URL route
  useEffect(() => {
    // Check if user directly loaded a /verify URL (e.g. from QR scan)
    if (typeof window !== 'undefined' && window.location.pathname.includes('/verify')) {
      const parts = window.location.pathname.split('/verify/');
      const id = parts[1] || '';
      if (id) {
        setPublicVerifyId(decodeURIComponent(id.split('/')[0].split('?')[0]));
      }
      setIsPublicVerifyView(true);
    }

    async function initSampleData() {
      try {
        const bldg = await buildingApiClient.getBuildingById('BLDG-BLR-001');
        if (bldg) {
          setPersistentBuilding(bldg);
          const flrs = await buildingApiClient.getFloors(bldg.buildingId);
          setPersistentFloors(flrs);
        }
      } catch (err) {
        console.warn('Initial seed load info:', err);
      }
    }
    initSampleData();
  }, []);

  const [threeCityStatus, setThreeCityStatus] = useState<ThreeCityStatus>({
    photorealisticStatus: 'IDLE',
    osmStatus: 'IDLE',
    terrainStatus: 'IDLE',
    imageryStatus: 'IDLE',
    activeMode: 'FLAT_MAP',
    camera: {
      lat: 12.9716,
      lon: 77.5946,
      height: 1200,
      heading: 45,
      pitch: -40,
    },
    tilesRendered: 0,
    lastError: null,
  });

  const handleSelectPage = (pageId: PageId) => {
    switch (pageId) {
      case 'landing':
        setViewMode('landing');
        break;
      case 'login':
        setViewMode('login');
        break;
      case 'globe':
        setViewMode('app');
        break;
      case 'data_sources':
        setViewMode('app');
        setIsGovtDataSourcesOpen(true);
        break;
      case 'search':
        setViewMode('app');
        setIsSearchOpen(true);
        break;
      case 'analytics':
        setViewMode('app');
        setIsAnalyticsOpen(true);
        break;
      case 'validation':
        setViewMode('app');
        setIsValidationOpen(true);
        break;
      case 'passport':
        setViewMode('app');
        setIsPassportOpen(true);
        break;
      case 'doc_verify':
        setViewMode('app');
        setIsDocumentVerificationOpen(true);
        break;
      case 'public_verify':
        setIsPublicVerifyView(true);
        break;
      case 'admin_console':
        setViewMode('app');
        setIsAdminManagementOpen(true);
        break;
      case 'emergency':
        setViewMode('app');
        setIsEmergencyOpen(true);
        break;
      case 'audit':
        setViewMode('app');
        setIsAuditOpen(true);
        break;
      case 'blueprint':
        setViewMode('app');
        setIsBlueprintOpen(true);
        break;
      case 'floorplan_3d':
        setViewMode('app');
        setIsFloorplanTo3DOpen(true);
        break;
      case 'presentation':
        setViewMode('app');
        setIsPropertyPresentationOpen(true);
        break;
      case 'zoning':
        setViewMode('app');
        setIsZoningOpen(true);
        break;
      case 'utilities':
        setViewMode('app');
        setShowUnderground(true);
        setShowUtilities(true);
        break;
    }
  };

  const [conflicts, setConflicts] = useState<ValidationConflict[]>(demoConflicts);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(demoAuditLogs);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [isPropertyPanelDismissed, setIsPropertyPanelDismissed] = useState(false);

  const selectedProperty = useMemo(() => {
    // If user explicitly dismissed the panel or no floor is selected, close the panel
    if (isPropertyPanelDismissed || !selectedFloorId) return null;

    // 1. Try finding in demoProperties
    const foundDemo = demoProperties.find((p) => p.floorId === selectedFloorId);
    if (foundDemo) return foundDemo;

    // 2. If persistentBuilding is active, synthesize from persistentBuilding and matching persistentFloors
    if (persistentBuilding) {
      const flr = persistentFloors.find((f) => f.floorId === selectedFloorId);
      if (!flr) return null;
      const floorNum = flr.floorNumber || 3;
      return {
        vpid: `VPID-${persistentBuilding.buildingId}-F${String(Math.abs(floorNum)).padStart(2, '0')}`,
        ulpin: persistentBuilding.ulpin || 'ULPIN-IN-KA-2026-SNPSU01',
        buildingId: persistentBuilding.buildingId,
        parcelId: persistentBuilding.parcelId || 'PARCEL-KA-BLR-2026-021',
        floorId: flr.floorId,
        floorNumber: floorNum,
        floorLabel: flr.floorName || `Floor 0${floorNum} (Verified Unit)`,
        zMin: flr.zMin ?? (floorNum * 3.5),
        zMax: flr.zMax ?? ((floorNum + 1) * 3.5),
        area: flr.area || 620,
        volume: flr.volume || 1860,
        status: 'valid' as const,
        ownerName: 'Sapthagiri NPS University Trust',
        propertyType: 'Academic',
        unitNumber: `Unit ${Math.abs(floorNum)}01`,
      };
    }

    return null;
  }, [selectedFloorId, isPropertyPanelDismissed, persistentBuilding, persistentFloors]);

  const handleReady = useCallback((viewer: Viewer) => {
    viewerRef.current = viewer;
  }, []);

  const handleCoordinates = useCallback((coords: Coordinates) => {
    setCoordinates(coords);
  }, []);

  const handleSelectFloor = useCallback((floorId: string) => {
    setIsPropertyPanelDismissed(false);
    setSelectedFloorId(floorId);
    const viewer = viewerRef.current;
    const floor = demoBuilding.floors.find((f) => f.id === floorId);
    if (viewer && floor) {
      flyToFloor(viewer, demoBuilding, floor, explodeState === 'exploded' ? 1 : 0);
    }
  }, [explodeState]);


  const handleSelectEntity = useCallback((entity: Entity | null) => {
    if (!entity) {
      setSelection(null);
      return;
    }
    const props = entity.properties;
    const kind = props?.get('type')?.getValue() ?? 'parcel';
    const ulpin = props?.get('ulpin')?.getValue() ?? entity.name ?? demoBuilding.ulpin;
    const data: Record<string, unknown> = {};
    if (props) {
      props.propertyNames.forEach((name: string) => {
        if (name !== 'type' && name !== 'ulpin') {
          data[name] = props.get(name)?.getValue();
        }
      });
    }
    data['ulpin'] = ulpin;
    setSelection({
      kind: kind as SelectionInfo['kind'],
      id: ulpin,
      label: ulpin,
      data,
    });

    const viewer = viewerRef.current;
    if (viewer) {
      flyToBuilding(viewer, demoBuilding);
    }
  }, []);

  const handleHome = useCallback(() => globeRef.current?.goHome(), []);
  const handleZoomIn = useCallback(() => globeRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => globeRef.current?.zoomOut(), []);
  const handleResetNorth = useCallback(() => globeRef.current?.resetNorth(), []);
  const handleFullscreen = useCallback(() => globeRef.current?.toggleFullscreen(), []);
  const handleToggle360Orbit = useCallback(() => {
    const isNowOrbiting = globeRef.current?.toggleAutoRotate360() ?? false;
    setIsOrbiting360(isNowOrbiting);
  }, []);

  const handleToggle2D3D = useCallback(() => {
    const newMode = !is3D;
    setIs3D(newMode);
    globeRef.current?.setMode3D(newMode);
  }, [is3D]);

  const handleGoToDemo = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      flyToBuilding(viewer, demoBuilding);
    } else {
      globeRef.current?.flyToDemoArea();
    }
  }, []);

  const handleResetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.scene.morphTo3D(1.0);
    setIs3D(true);
    globeRef.current?.goHome();
    setSelectedFloorId(null);
    setExplodeState('collapsed');
  }, []);

  const handleToggleLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const updated = prev.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      );

      const viewer = viewerRef.current;
      if (!viewer) return updated;

      const layer = updated.find((l) => l.id === id);
      if (!layer) return updated;

      if (id === 'terrain') {
        viewer.scene.globe.show = layer.visible;
      }

      if (id === 'imagery') {
        const layerCount = viewer.imageryLayers.length;
        for (let i = 0; i < layerCount; i++) {
          viewer.imageryLayers.get(i).show = layer.visible;
        }
      }

      if (id === 'parcels') {
        for (let i = 0; i < viewer.dataSources.length; i++) {
          const ds: DataSource = viewer.dataSources.get(i);
          if (ds.name === 'Demo Parcels') {
            ds.show = layer.visible;
          }
        }
      }

      if (id === 'underground') {
        setShowUnderground(layer.visible);
      }

      return updated;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.selectedEntity = undefined;
    }
    setSelection(null);
    setSelectedFloorId(null);
  }, []);

  const handleToggleMeasure = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const turningOff = isMeasuring;
    setIsMeasuring(!isMeasuring);
    setMeasureInfo(null);

    if (turningOff) {
      if (measureHandlerRef.current) {
        measureHandlerRef.current.destroy();
        measureHandlerRef.current = null;
      }
      if (measureEntityRef.current) {
        viewer.entities.remove(measureEntityRef.current);
        measureEntityRef.current = null;
      }
      measurePointsRef.current = [];
      return;
    }

    measurePointsRef.current = [];
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    measureHandlerRef.current = handler;

    handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = viewer.scene.pickPosition(click.position);
      if (!cartesian) return;

      measurePointsRef.current.push(cartesian.clone());

      if (measurePointsRef.current.length >= 2) {
        const points = measurePointsRef.current;
        if (measureEntityRef.current) {
          viewer.entities.remove(measureEntityRef.current);
        }

        const distance = calculateDistance(points, viewer);

        measureEntityRef.current = viewer.entities.add({
          name: 'Measure',
          polyline: {
            positions: points,
            width: 2,
            material: Color.fromCssColorString('#22d3ee'),
            clampToGround: false,
          } as unknown as PolylineGraphics,
        });

        setMeasureInfo(`${distance.toFixed(2)} m`);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(() => {
      if (measureEntityRef.current) {
        viewer.entities.remove(measureEntityRef.current);
        measureEntityRef.current = null;
      }
      measurePointsRef.current = [];
      setMeasureInfo(null);
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }, [isMeasuring]);

  const handleResolveConflict = useCallback((id: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: true } : c))
    );
    setAuditLogs((prev) => [
      {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userRole,
        action: 'CONFLICT_RESOLVED',
        targetId: id,
        details: `Conflict ${id} resolved by ${userRole} (${authUser?.email || 'Anonymous'}).`,
      },
      ...prev,
    ]);
  }, [userRole, authUser]);

  const activeConflictCount = conflicts.filter((c) => !c.resolved).length;

  // Render Public Property Passport Verification Page
  if (isPublicVerifyView) {
    return (
      <PublicVerifyPage
        identifier={publicVerifyId || undefined}
        onBack={() => {
          setIsPublicVerifyView(false);
          setPublicVerifyId(null);
        }}
      />
    );
  }

  // Render Landing Page View
  if (viewMode === 'landing') {
    return (
      <LandingPage
        user={authUser}
        onLaunchApp={() => setViewMode('app')}
        onOpenLogin={() => setViewMode('login')}
      />
    );
  }

  // Render Full Login View
  if (viewMode === 'login') {
    return (
      <LoginPage
        user={authUser}
        onBackToLanding={() => setViewMode('landing')}
        onLaunchApp={() => setViewMode('app')}
      />
    );
  }

  // Render Main 3D Cadastral GIS Platform ('app')
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Integrated App Header */}
      <AppHeader
        userRole={userRole}
        explodeState={explodeState}
        showUnderground={showUnderground}
        activeConflictCount={activeConflictCount}
        authUser={authUser}
        onRoleChange={setUserRole}
        onToggleExplode={() => setExplodeState((prev) => (prev === 'exploded' ? 'collapsed' : 'exploded'))}
        onToggleUnderground={() => setShowUnderground((prev) => !prev)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onGoToLanding={() => setViewMode('landing')}
        onOpenPropertyPresentation={() => setIsPropertyPresentationOpen(true)}
        onOpenZoning={() => setIsZoningOpen(true)}
        onOpenPagesDrawer={() => setIsPagesDrawerOpen(true)}
        showRealFinderHud={showRealFinderHud}
        onToggleRealFinderHud={() => setShowRealFinderHud((prev) => !prev)}
        onOpenGeoJsonImporter={() => setIsGeoJsonImporterOpen(true)}
        onOpenCreateBuilding={() => setIsCreateBuildingOpen(true)}
        onOpenGovtDataSources={() => setIsGovtDataSourcesOpen(true)}
        onOpenFloorplanTo3D={() => setIsFloorplanTo3DOpen(true)}
        onOpenBlueprint={() => setIsBlueprintOpen(true)}
        onOpenStackExplorer={() => setIsStackExplorerOpen(true)}
        isRescueModeActive={isRescueModeActive}
        onToggleRescueMode={() => setIsRescueModeActive((prev) => !prev)}
      />

      {/* Main 3D GIS & Cadastral Area */}
      <div className="relative flex-1 overflow-hidden">
        <CesiumGlobe
          ref={globeRef}
          building={demoBuilding}
          properties={demoProperties}
          selectedFloorId={selectedFloorId}
          explodeState={explodeState}
          showUnderground={showUnderground}
          showUtilities={showUtilities}
          customGeoJson={importedGeoJson}
          userCreatedBuildings={userCreatedBuildings}
          isRescueModeActive={isRescueModeActive}
          onCoordinatesChange={handleCoordinates}
          onSelect={handleSelectEntity}
          onSelectFloor={handleSelectFloor}
          onStatusUpdate={setThreeCityStatus}
          onSelectBuildingFeature={async (bData) => {
            setSelectedBuildingFeature(bData);
            setIsRealFinderCardOpen(false); // Do not open duplicate center card; open right inspector only

            // Cache-First MongoDB Building Intelligence Lookup with spatial proximity
            const cFeatureId = bData.cesiumFeatureId || 'solid-bim-building-1';
            const mongoDoc = await buildingApiClient.getBuildingByCesiumId(cFeatureId, bData.lat, bData.lon);
            setPersistentBuilding(mongoDoc);
            if (mongoDoc) {
              setSelectedBuildingFeature({
                ...bData,
                name: mongoDoc.name,
                ulpin: mongoDoc.ulpin,
                height: mongoDoc.buildingHeight,
                floors: mongoDoc.floorCount,
                address: mongoDoc.address,
              });
              const floors = await buildingApiClient.getFloors(mongoDoc.buildingId);
              setPersistentFloors(floors);
            } else {
              setPersistentFloors([]);
            }
            setIsBuildingPanelOpen(true);
          }}
          onReady={handleReady}
          activeSensorMode={activeSensorMode}
        />

        {/* Persistent Building Intelligence Panel (MongoDB Integrated) */}
        {isBuildingPanelOpen && (
          <BuildingInformationPanel
            building={persistentBuilding}
            cesiumFeatureId={selectedBuildingFeature?.cesiumFeatureId || 'solid-bim-building-1'}
            isIngested={Boolean(persistentBuilding)}
            onViewFloors={() => setIsFloorPanelOpen(true)}
            onViewSources={() => setIsGovtDataSourcesOpen(true)}
            onViewVerticalProperties={() => setIsPagesDrawerOpen(true)}
            onOpenPassport={() => setIsPassportOpen(true)}
            onRunValidation={() => setIsValidationOpen(true)}
            onDiscoverBuilding={async (bId, cId) => {
              const ingested = await buildingApiClient.discoverBuilding(
                bId,
                cId,
                selectedBuildingFeature?.lat,
                selectedBuildingFeature?.lon
              );
              setPersistentBuilding(ingested);
              const floors = await buildingApiClient.getFloors(ingested.buildingId);
              setPersistentFloors(floors);
            }}
            onClose={() => setIsBuildingPanelOpen(false)}
          />
        )}

        {/* Floor Breakdown & 3D Geometry Panel */}
        {isFloorPanelOpen && persistentBuilding && (
          <FloorPanel
            building={persistentBuilding}
            floors={persistentFloors}
            selectedFloorId={selectedFloorId}
            explodeState={explodeState}
            onSelectFloor3D={(flr) => {
              if (flr.has3DGeometry) {
                handleSelectFloor(flr.floorId);
              }
            }}
            onExplodeToggle={(isExploded) => setExplodeState(isExploded ? 'exploded' : 'collapsed')}
            onIsolateFloor={(flrId) => {
              if (flrId) handleSelectFloor(flrId);
            }}
            onOpenVerticalProperty={() => setIsPagesDrawerOpen(true)}
            onOpenValidation={() => setIsValidationOpen(true)}
            onOpenPassport={() => setIsPassportOpen(true)}
            onClose={() => setIsFloorPanelOpen(false)}
          />
        )}

        {showRealFinderHud ? (
          /* RealFinder & 51WORLD Live 3D Overlay HUD (Mutually Exclusive for ZERO overlap) */
          <RealFinderHUD
            onSelectFloor={handleSelectFloor}
            onClose={() => setShowRealFinderHud(false)}
          />
        ) : (
          /* Standard 3D CAD & GIS Platform Toolbars */
          <>
            {/* Smart City Digital Twin Telemetry & Analytics HUD (Clean, Centered Pill) */}
            <SmartCityHUD
              onOpenAnalytics={() => setIsAnalyticsOpen(true)}
              onOpenValidation={() => setIsValidationOpen(true)}
            />

            {/* Left side: Toolbar */}
            <div className="absolute left-4 top-4 z-10">
              <MapToolbar
                onHome={handleHome}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetNorth={handleResetNorth}
                onToggleFullscreen={handleFullscreen}
                is3D={is3D}
                onToggle2D3D={handleToggle2D3D}
                isMeasuring={isMeasuring}
                onToggleMeasure={handleToggleMeasure}
                onRotateLeft={() => globeRef.current?.rotateLeft()}
                onRotateRight={() => globeRef.current?.rotateRight()}
                onTiltView={() => globeRef.current?.tiltView()}
                onToggle360Orbit={handleToggle360Orbit}
                isOrbiting360={isOrbiting360}
                activeSensorMode={activeSensorMode}
                onSelectSensorMode={handleSelectSensorMode}
              />
            </div>

            {/* Left side: Vertical Floor Selector (Dynamically Bounded to MongoDB Floor Count) */}
            <VerticalFloorSlider
              floors={persistentFloors.length > 0 ? persistentFloors.map((f) => ({
                id: f.floorId,
                label: f.floorName,
                shortLabel: f.floorNumber < 0 ? `B${Math.abs(f.floorNumber)}` : f.floorNumber === 1 ? 'G' : `F${f.floorNumber}`,
                zMin: f.zMin,
                zMax: f.zMax,
                floorNumber: f.floorNumber,
                isUnderground: f.floorNumber < 0,
              })) : demoBuilding.floors}
              selectedFloorId={selectedFloorId}
              showUnderground={showUnderground}
              onSelect={handleSelectFloor}
            />

            {/* Right side: Layer Manager + Selection (Hidden when building/floor inspector is open) */}
            {!isBuildingPanelOpen && !isFloorPanelOpen && (
              <div className="absolute right-4 top-4 z-10 flex flex-col gap-3">
                <LayerManager layers={layers} onToggle={handleToggleLayer} />
                <SelectionManager selection={selection} onClear={handleClearSelection} />
              </div>
            )}

            {/* Right side: Vertical Property Details Panel */}
            <VerticalPropertyPanel
              property={selectedProperty}
              onClose={() => {
                setSelectedFloorId(null);
                setIsPropertyPanelDismissed(true);
              }}
              onRunValidation={() => setIsValidationOpen(true)}
              onOpenPassport={() => setIsPassportOpen(true)}
            />


            {/* Bottom-left: Legend */}
            <div className="absolute bottom-4 left-4 z-10">
              <MapLegend />
            </div>
          </>
        )}

        {/* Bottom-center: Camera Controls + Coordinates */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
          <CameraControls
            onGoToDemo={handleGoToDemo}
            onResetView={handleResetView}
            onSelectLocation={(lat, lon, height, name) => globeRef.current?.flyToLocation(lat, lon, height, name)}
            onToggle360Orbit={handleToggle360Orbit}
            isOrbiting360={isOrbiting360}
          />
          <CoordinateDisplay coordinates={coordinates} />
          {isMeasuring && (
            <div className="pointer-events-auto rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-200 backdrop-blur-md">
              {measureInfo ? `Distance: ${measureInfo}` : 'Click two points to measure · Right-click to reset'}
            </div>
          )}
        </div>

        {/* Bottom-right: System Info */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 max-w-xs text-right">
          <p className="text-[10px] text-slate-500">
            VOLU-CAD 3D Vertical Cadastre System.
            <br />
            Active Zone: {DEMO_AREA.name}
          </p>
        </div>
      </div>

      {/* Modals & Drawers */}
      <BlueprintConverterModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />

      <PropertyPresentationModal
        isOpen={isPropertyPresentationOpen}
        onClose={() => setIsPropertyPresentationOpen(false)}
      />

      <ZoningDashboardModal
        isOpen={isZoningOpen}
        onClose={() => setIsZoningOpen(false)}
      />

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        user={authUser}
        onClose={() => setIsAuthOpen(false)}
      />

      <GeoSearchModal
        isOpen={isSearchOpen}
        properties={demoProperties}
        onSelectProperty={handleSelectFloor}
        onSelectLocation={(lat, lon, height) => globeRef.current?.flyToLocation(lat, lon, height)}
        onClose={() => setIsSearchOpen(false)}
      />

      <VolumetricAnalyticsModal
        isOpen={isAnalyticsOpen}
        building={demoBuilding}
        properties={demoProperties}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <TopologyValidationModal
        isOpen={isValidationOpen}
        conflicts={conflicts}
        onClose={() => setIsValidationOpen(false)}
        onResolveConflict={handleResolveConflict}
      />

      <PropertyPassportModal
        property={selectedProperty}
        building={persistentBuilding}
        floors={persistentFloors}
        selectedFloorId={selectedFloorId}
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        onOpenPublicVerification={(identifier) => {
          setPublicVerifyId(identifier);
          setIsPassportOpen(false);
          setIsPublicVerifyView(true);
        }}
      />

      <EmergencyPlanningModal
        building={demoBuilding}
        isOpen={isEmergencyOpen}
        isRescueModeActive={isRescueModeActive}
        onToggleRescueMode={(active) => setIsRescueModeActive(active)}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <FloorplanTo3DModal
        isOpen={isFloorplanTo3DOpen}
        onClose={() => setIsFloorplanTo3DOpen(false)}
        onBuildingGenerated={(data) => {
          setPersistentBuilding(data.building);
          setPersistentFloors(data.floors);
          setUserCreatedBuildings((prev) => [
            ...prev,
            {
              id: data.building.buildingId,
              name: data.building.name,
              lat: data.building.latitude || 12.9716,
              lon: data.building.longitude || 77.5946,
              floors: data.floors.length,
              height: data.building.buildingHeight || 24,
              width: 35,
              depth: 35,
              ulpin: data.building.ulpin,
            },
          ]);
          if (data.selectedFloorId) {
            handleSelectFloor(data.selectedFloorId);
          }
          globeRef.current?.flyToLocation(data.building.latitude || 12.9716, data.building.longitude || 77.5946, 250);
        }}
        onOpenPublicVerification={(identifier) => {
          setPublicVerifyId(identifier);
          setIsFloorplanTo3DOpen(false);
          setIsPublicVerifyView(true);
        }}
        onToggleRescueMode={(active) => setIsRescueModeActive(active)}
      />

      <AuditLogDrawer
        isOpen={isAuditOpen}
        logs={auditLogs}
        currentRole={userRole}
        onClose={() => setIsAuditOpen(false)}
      />

      <StitchNavigationDrawer
        isOpen={isPagesDrawerOpen}
        activePage="globe"
        onClose={() => setIsPagesDrawerOpen(false)}
        onSelectPage={handleSelectPage}
      />

      {/* Floating 3D Building Click Popup Card (Image 2) */}
      <RealFinderCardPopup
        isOpen={isRealFinderCardOpen}
        onClose={() => setIsRealFinderCardOpen(false)}
        onExplore={() => {
          setIsRealFinderCardOpen(false);
          setIsRealFinderInspectOpen(true);
        }}
        buildingName={selectedBuildingFeature?.name || 'B1-A Commercial Skyscraper'}
        ulpin={selectedBuildingFeature?.ulpin || 'ULPIN-IN-MH-2026-89421'}
        valuation={selectedBuildingFeature?.valuation || '₹1,28,35,000'}
        lat={selectedBuildingFeature?.lat || 12.9716}
        lon={selectedBuildingFeature?.lon || 77.5946}
        address={selectedBuildingFeature?.address}
      />

      {/* 3D Stacking & Unit Level Occupancy Matrix Modal (Matching Image) */}
      {isStackExplorerOpen && (
        <BuildingStackExplorerModal
          building={persistentBuilding}
          floors={persistentFloors}
          onClose={() => setIsStackExplorerOpen(false)}
        />
      )}

      {/* RealFinder Unit Occupancy & CAD Blueprint Inspector Modal (Image 1) */}
      <RealFinderInspectModal
        isOpen={isRealFinderInspectOpen}
        onClose={() => setIsRealFinderInspectOpen(false)}
        buildingName={selectedBuildingFeature?.name || 'B1-A Commercial Skyscraper'}
        address={selectedBuildingFeature?.address}
      />

      {/* India National 3D GIS & GeoJSON Database Importer Modal */}
      <GeoJsonImporterModal
        isOpen={isGeoJsonImporterOpen}
        onClose={() => setIsGeoJsonImporterOpen(false)}
        onImportGeoJson={(gData) => setImportedGeoJson(gData)}
      />

      {/* Create 3D Building Structure At My Location Modal */}
      <CreateBuildingModal
        isOpen={isCreateBuildingOpen}
        onClose={() => setIsCreateBuildingOpen(false)}
        onCreateBuilding={(newB: any) => {
          setUserCreatedBuildings((prev) => [...prev, { ...newB, id: `b-${Date.now()}` }]);
        }}
      />

      {/* Government Geospatial Data Ingestion Layer Modal */}
      <GovtDataSourcesModal
        isOpen={isGovtDataSourcesOpen}
        onClose={() => setIsGovtDataSourcesOpen(false)}
        onPreviewDataset={(ds) => {
          setIsGovtDataSourcesOpen(false);
          // Fly camera to preview dataset region in Cesium viewer
          globeRef.current?.flyToLocation(12.9716, 77.5946, 1400);
        }}
      />

      {/* Document Verification OCR Deed Cross-Check Modal */}
      <DocumentVerificationModal
        isOpen={isDocumentVerificationOpen}
        onClose={() => setIsDocumentVerificationOpen(false)}
      />

      {/* Role Management & Real-Time Event Simulator Modal */}
      <AdminManagementModal
        isOpen={isAdminManagementOpen}
        onClose={() => setIsAdminManagementOpen(false)}
        currentRole={userRole}
        onRoleChange={(r) => setUserRole(r)}
        onTriggerSimulatedEvent={(evtName) => {
          setAuditLogs((prev) => [
            {
              id: `LOG-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              userRole: userRole,
              action: evtName,
              targetId: 'VOLU-CAD-3D',
              details: `Simulated live change stream broadcast: ${evtName}`,
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}

function calculateDistance(points: Cartesian3[], viewer: Viewer): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const c1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(points[i - 1]);
    const c2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(points[i]);
    if (c1 && c2) {
      const dLat = CesiumMath.toRadians(c2.latitude - c1.latitude);
      const dLon = CesiumMath.toRadians(c2.longitude - c1.longitude);
      const lat1 = CesiumMath.toRadians(c1.latitude);
      const lat2 = CesiumMath.toRadians(c2.latitude);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += 6371000 * c;
    }
  }
  return total;
}

export default App;
