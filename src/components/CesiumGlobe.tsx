import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Cartesian3,
  Cartographic,
  Color,
  EllipsoidTerrainProvider,
  Entity,
  GeoJsonDataSource,
  HeightReference,
  HorizontalOrigin,
  Ion,
  LabelGraphics,
  LabelStyle,
  Math as CesiumMath,
  PolygonHierarchy,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  VerticalOrigin,
  Terrain,
  createWorldTerrainAsync,
  createWorldImageryAsync,
  createOsmBuildingsAsync,
  createGooglePhotorealistic3DTileset,
  Cesium3DTileset,
  Cesium3DTileStyle,
  IonWorldImageryStyle,
  ShadowMode,
  Cesium3DTileFeature,
  ArcGisMapServerImageryProvider,
  NearFarScalar,
  UrlTemplateImageryProvider,
  Cartesian2,
  DistanceDisplayCondition,
  CameraEventType,
  KeyboardEventModifier,
} from 'cesium';
import type { CesiumGlobeHandle } from './cesium.types';
import type { ThreeCityStatus } from './cadastral/ThreeCityStatusHUD';
import { DEMO_AREA } from '../types/gis';
import type { Building, VerticalProperty, ExplodeState, Floor } from '../types/cadastral';
import {
  footprintToCartesian,
  computeExplodedZ,
  makeFloorLabel,
  colorFromRgba,
  flyToBuilding,
} from '../utils/cesium3dHelpers';
import { STATUS_COLORS, SELECTED_COLOR, UNDERGROUND_COLOR, PARCEL_COLOR } from '../data/colors';
import { SURROUNDING_CITY_BUILDINGS, footprint } from '../data/cadastralDemoData';

import { applySensorMode, type SensorMode } from '../utils/godsEyeShaders';
import { getFormattedAddress } from '../utils/addressLookup';
import { renderSapthagiriCampusModel, SAPTHAGIRI_COORDS } from '../utils/sapthagiriCampusModel';

export const CESIUM_ION_TOKEN =
  (import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN as string | undefined) ||
  (import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjdyUG1VUjdPQXZjbmtHQlYiLCJqdGkiOiJlZjMyYTZmMi00OWZkLTQyNTctYmIzOC05NDRiNzQ5YjJjY2QiLCJpZCI6NDcyNjEyLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODc3MzcxMTl9.uPJ4DnQzuEVLyPy4QjuiBHWb5AwMAvC8d8q9cK9QM7I';
const HAS_TOKEN = Boolean(CESIUM_ION_TOKEN);

// Configure global Cesium Ion Access Token
Ion.defaultAccessToken = CESIUM_ION_TOKEN;

function loadViewport3DBuildings(viewer: Viewer) {
  if (viewer.isDestroyed()) return;

  // Clean up any legacy synthetic fallback entities
  const oldFallbackEntities = viewer.entities.values.filter(
    (el) => typeof el.id === 'string' && el.id.startsWith('cadastral-residential-3d-')
  );
  oldFallbackEntities.forEach((el) => viewer.entities.remove(el));

  let west: number, south: number, east: number, north: number;

  const rect = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid);
  if (rect) {
    west = CesiumMath.toDegrees(rect.west);
    south = CesiumMath.toDegrees(rect.south);
    east = CesiumMath.toDegrees(rect.east);
    north = CesiumMath.toDegrees(rect.north);
  } else {
    const centerCartesian = viewer.camera.pickEllipsoid(
      new Cartesian3(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2, 0),
      viewer.scene.globe.ellipsoid
    );
    let cLat = 12.9716;
    let cLon = 77.5946;
    if (centerCartesian) {
      const carto = Cartographic.fromCartesian(centerCartesian);
      cLat = CesiumMath.toDegrees(carto.latitude);
      cLon = CesiumMath.toDegrees(carto.longitude);
    } else {
      const carto = viewer.camera.positionCartographic;
      if (carto) {
        cLat = CesiumMath.toDegrees(carto.latitude);
        cLon = CesiumMath.toDegrees(carto.longitude);
      }
    }
    west = cLon - 0.045;
    east = cLon + 0.045;
    south = cLat - 0.045;
    north = cLat + 0.045;
  }

  const s = Math.min(south, north);
  const n = Math.max(south, north);
  const w = Math.min(west, east);
  const e = Math.max(west, east);

    const latSpan = Math.min(n - s, 0.04);
    const lonSpan = Math.min(e - w, 0.04);
    const cLat = (s + n) / 2;
    const cLon = (w + e) / 2;
    const minLat = (cLat - latSpan / 2).toFixed(4);
    const maxLat = (cLat + latSpan / 2).toFixed(4);
    const minLon = (cLon - lonSpan / 2).toFixed(4);
    const maxLon = (cLon + lonSpan / 2).toFixed(4);

    const query = `[out:json][timeout:25];(way["building"](${minLat},${minLon},${maxLat},${maxLon});relation["building"](${minLat},${minLon},${maxLat},${maxLon}););out body;>;out skel qt;`;
    const urlPrimary = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const urlMirror = `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`;

    const processOverpassData = (data: any) => {
      if (viewer.isDestroyed()) return;

      if (data && data.elements) {
        const oldOsmEntities = viewer.entities.values.filter(
          (el) => typeof el.id === 'string' && el.id.startsWith('real-osm-building-')
        );
        oldOsmEntities.forEach((el) => viewer.entities.remove(el));

        const nodesMap = new Map<number, [number, number]>();
        data.elements.forEach((el: any) => {
          if (el.type === 'node') nodesMap.set(el.id, [el.lon, el.lat]);
        });

        data.elements.forEach((el: any) => {
          if ((el.type === 'way' || el.type === 'relation') && el.nodes && el.nodes.length >= 3) {
            const coordsFlat: number[] = [];
            el.nodes.forEach((nodeId: number) => {
              const coord = nodesMap.get(nodeId);
              if (coord) {
                coordsFlat.push(coord[0], coord[1]);
              }
            });

            if (coordsFlat.length >= 6) {
              // Do not overwrite our detailed handcrafted Sapthagiri Neoclassical 3D Campus
              const firstLon = coordsFlat[0];
              const firstLat = coordsFlat[1];
              const distToSapthagiri = Math.hypot(firstLon - SAPTHAGIRI_COORDS.lon, firstLat - SAPTHAGIRI_COORDS.lat);
              if (distToSapthagiri < 0.0015) {
                return; // Keep handcrafted Sapthagiri palace clean and unobstructed
              }

              const tagHeight = el.tags?.height
                ? parseFloat(el.tags.height)
                : el.tags?.['building:levels']
                ? parseFloat(el.tags['building:levels']) * 3.5
                : Math.max(10, (el.id % 25) + 8);

              const colorHue = el.id % 5;
              const matColor =
                colorHue === 0
                  ? Color.fromCssColorString('#f8fafc')
                  : colorHue === 1
                  ? Color.fromCssColorString('#38bdf8')
                  : colorHue === 2
                  ? Color.fromCssColorString('#cbd5e1')
                  : colorHue === 3
                  ? Color.fromCssColorString('#0284c7')
                  : Color.fromCssColorString('#f1f5f9');

              try {
                viewer.entities.add({
                  id: `real-osm-building-${el.id}`,
                  polygon: {
                    hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(coordsFlat)),
                    height: 0,
                    extrudedHeight: tagHeight,
                    material: matColor,
                    outline: true,
                    outlineColor: Color.fromCssColorString('#0284c7'),
                    outlineWidth: 1.5,
                    shadows: ShadowMode.ENABLED,
                  },
                });
              } catch (_) {}
            }
          }
        });
      }
    };

  fetch(urlPrimary)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) processOverpassData(data);
      else {
        fetch(urlMirror)
          .then((res) => (res.ok ? res.json() : null))
          .then((mirrorData) => mirrorData && processOverpassData(mirrorData))
          .catch(() => {});
      }
    })
    .catch(() => {});
}

export const isLocationInNewYork = (lat: number, lon: number): boolean => {
  return lat >= 40.40 && lat <= 41.05 && lon >= -74.35 && lon <= -73.60;
};

export interface PickedBuildingData {
  name: string;
  ulpin: string;
  lat: number;
  lon: number;
  height: number;
  floors: number;
  valuation: string;
  address?: string;
  description?: string;
  cesiumFeatureId?: string;
}

interface CesiumGlobeProps {
  building?: Building;
  properties?: VerticalProperty[];
  selectedFloorId?: string | null;
  selectedConflictId?: string | null;
  explodeState?: ExplodeState;
  showUnderground?: boolean;
  showUtilities?: boolean;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number; elevation: number }) => void;
  onSelect?: (entity: Entity | null) => void;
  onSelectFloor?: (floorId: string) => void;
  customGeoJson?: any;
  visMode?: 'photorealistic' | 'cadastral' | 'vertical_cadastre' | 'analytics';
  userCreatedBuildings?: {
    id: string;
    name: string;
    lat: number;
    lon: number;
    floors: number;
    height: number;
    width: number;
    depth: number;
    ulpin: string;
  }[];
  onSelectBuildingFeature?: (data: PickedBuildingData) => void;
  onReady?: (viewer: Viewer) => void;
  onStatusUpdate?: (status: ThreeCityStatus) => void;
  activeSensorMode?: SensorMode;
  isRescueModeActive?: boolean;
}

const CesiumGlobe = forwardRef<CesiumGlobeHandle, CesiumGlobeProps>(
  (
    {
      building,
      properties = [],
      selectedFloorId,
      explodeState = 'collapsed',
      showUnderground = true,
      showUtilities = true,
      onCoordinatesChange,
      onSelect,
      onSelectFloor,
      customGeoJson,
      visMode = 'vertical_cadastre',
      userCreatedBuildings,
      onSelectBuildingFeature,
      onReady,
      onStatusUpdate,
      activeSensorMode = 'NORMAL',
      isRescueModeActive = false,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const [demoMode, setDemoMode] = useState(!HAS_TOKEN);
    const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

    const isAutoOrbitingRef = useRef(false);
    const removeOrbitListenerRef = useRef<(() => void) | null>(null);

    const getCameraFocalPoint = (): Cartesian3 | null => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return null;
      try {
        const canvas = viewer.scene.canvas;
        const centerRay = viewer.camera.getPickRay(
          new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)
        );
        if (!centerRay) return null;
        let pick = viewer.scene.globe.pick(centerRay, viewer.scene);
        if (!pick) {
          pick = viewer.camera.pickEllipsoid(
            new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
            viewer.scene.globe.ellipsoid
          );
        }
        return pick || null;
      } catch (_) {
        return null;
      }
    };

    const stopAutoRotate360 = () => {
      isAutoOrbitingRef.current = false;
      if (removeOrbitListenerRef.current) {
        removeOrbitListenerRef.current();
        removeOrbitListenerRef.current = null;
      }
    };

    const startAutoRotate360 = () => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed() || isAutoOrbitingRef.current) return;
      isAutoOrbitingRef.current = true;
      let lastTime = performance.now();

      const orbitTick = () => {
        if (!isAutoOrbitingRef.current || !viewer || viewer.isDestroyed()) return;
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const focal = getCameraFocalPoint();
        const speed = CesiumMath.toRadians(20); // 20 deg/sec = 18 sec for full 360-degree orbit
        if (focal) {
          viewer.camera.rotate(focal, speed * dt);
        } else {
          viewer.camera.rotateRight(speed * dt);
        }
      };

      const removeListener = viewer.scene.preRender.addEventListener(orbitTick);
      removeOrbitListenerRef.current = () => {
        removeListener();
        isAutoOrbitingRef.current = false;
      };
    };

    const toggleAutoRotate360 = (): boolean => {
      if (isAutoOrbitingRef.current) {
        stopAutoRotate360();
        return false;
      } else {
        startAutoRotate360();
        return true;
      }
    };

    useImperativeHandle(ref, (): CesiumGlobeHandle => ({
      getViewer: () => viewerRef.current,
      flyToDemoArea: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            DEMO_AREA.longitude,
            DEMO_AREA.latitude,
            DEMO_AREA.height
          ),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-45),
            roll: 0,
          },
          duration: 2.5,
        });
      },
      zoomIn: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.3);
      },
      zoomOut: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.5);
      },
      resetNorth: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.flyTo({
          destination: viewer.camera.positionWC,
          orientation: {
            heading: 0,
            pitch: viewer.camera.pitch,
            roll: 0,
          },
          duration: 1.0,
        });
      },
      goHome: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(78.9629, 20.5937, 15_000_000),
          orientation: {
            heading: 0,
            pitch: CesiumMath.toRadians(-90),
            roll: 0,
          },
          duration: 2.0,
        });
      },
      setMode3D: (is3D: boolean) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        if (is3D) {
          viewer.scene.morphTo3D(1.0);
        } else {
          viewer.scene.morphTo2D(1.0);
        }
      },
      toggleFullscreen: () => {
        const container = containerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
          container.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },
      rotateLeft: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const focal = getCameraFocalPoint();
        if (focal) {
          viewer.camera.rotate(focal, CesiumMath.toRadians(-45));
        } else {
          viewer.camera.rotateLeft(CesiumMath.toRadians(45));
        }
      },
      rotateRight: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const focal = getCameraFocalPoint();
        if (focal) {
          viewer.camera.rotate(focal, CesiumMath.toRadians(45));
        } else {
          viewer.camera.rotateRight(CesiumMath.toRadians(45));
        }
      },
      startAutoRotate360,
      stopAutoRotate360,
      toggleAutoRotate360,
      isAutoRotate360: () => isAutoOrbitingRef.current,
      tiltView: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        // Toggle tilt between -25deg, -45deg, and -70deg pitch
        const currentPitch = CesiumMath.toDegrees(viewer.camera.pitch);
        let nextPitch = -45;
        if (currentPitch < -60) nextPitch = -25;
        else if (currentPitch < -35) nextPitch = -70;

        viewer.camera.setView({
          orientation: {
            heading: viewer.camera.heading,
            pitch: CesiumMath.toRadians(nextPitch),
            roll: 0,
          },
        });
      },
      flyToLocation: (lat: number, lon: number, height = 750, labelText?: string) => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        // Remove previous search pin if any
        const existingPin = viewer.entities.getById('searched-location-pin');
        if (existingPin) viewer.entities.remove(existingPin);

        // Add visual target pin on the ground
        viewer.entities.add({
          id: 'searched-location-pin',
          position: Cartesian3.fromDegrees(lon, lat, 15),
          point: {
            pixelSize: 12,
            color: Color.fromCssColorString('#06b6d4'),
            outlineColor: Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: labelText ? `📍 ${labelText.split(',')[0]}` : '📍 Searched Location',
            font: 'bold 12px Inter, system-ui, sans-serif',
            fillColor: Color.WHITE,
            showBackground: true,
            backgroundColor: Color.fromCssColorString('#0f172a').withAlpha(0.85),
            pixelOffset: new Cartesian2(0, -25),
          },
        });

        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(lon, lat, height),
          orientation: {
            heading: CesiumMath.toRadians(35),
            pitch: CesiumMath.toRadians(-35),
            roll: 0,
          },
          duration: 2.0,
        });
      },
      setSensorMode: (mode: SensorMode) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        applySensorMode(viewer, mode);
      },
      flyToConflictVolume: (minZ: number, maxZ: number) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const bldg = building || { footprint, center: { lat: 12.9716, lon: 77.5946 } };

        const oldBoxes = viewer.entities.values.filter(
          (e) => typeof e.id === 'string' && e.id.includes('conflict-3d-volume-box')
        );
        oldBoxes.forEach((e) => viewer.entities.remove(e));

        const positions = [
          ...footprintToCartesian(bldg.footprint, minZ),
          ...footprintToCartesian(bldg.footprint, maxZ),
        ];

        viewer.entities.add({
          id: 'conflict-3d-volume-box',
          polygon: {
            hierarchy: new PolygonHierarchy(positions),
            material: Color.fromCssColorString('#ef4444').withAlpha(0.65),
            outline: true,
            outlineColor: Color.fromCssColorString('#dc2626'),
            outlineWidth: 3,
            perPositionHeight: true,
          },
        });

        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(bldg.center.lon, bldg.center.lat, 120),
          orientation: {
            heading: CesiumMath.toRadians(45),
            pitch: CesiumMath.toRadians(-25),
            roll: 0,
          },
          duration: 2.0,
        });
      },
    }));

    // Viewer Initialization
    useEffect(() => {
      if (!containerRef.current || viewerRef.current) return;

      let viewer: Viewer;

      const currentStatus: ThreeCityStatus = {
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
      };

      const updateStatus = (partial: Partial<ThreeCityStatus>) => {
        Object.assign(currentStatus, partial);
        if (onStatusUpdate) onStatusUpdate({ ...currentStatus });
      };

      if (HAS_TOKEN) {
        try {
          viewer = new Viewer(containerRef.current, {
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            infoBox: false,
            selectionIndicator: true,
            terrain: Terrain.fromWorldTerrain({ requestVertexNormals: true }),
            baseLayer: false as unknown as undefined,
          });


          // Prevent render loop exceptions from killing WebGL and showing a blank screen
          viewer.scene.renderError.addEventListener((_scene: any, error: any) => {
            console.error('Cesium Render Error caught (auto-recovering render loop):', error);
            viewer.useDefaultRenderLoop = true;
          });

          // 1. Terrain Provider (Ellipsoid surface for exact meter-level BIM & Cadastral height alignment)
          updateStatus({ terrainStatus: 'LOADED' });

          // 2. World Imagery Provider (Single Clean High-Res Satellite Map Layer for Zero Cracks & Double Labels)
          updateStatus({ imageryStatus: 'LOADING' });

          const loadImagery = async () => {
            if (viewer.isDestroyed()) return;
            // Clear any default or broken layers to eliminate double maps & text overlaps
            viewer.imageryLayers.removeAll();

            try {
              const esriImagery = await ArcGisMapServerImageryProvider.fromUrl(
                'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
              );
              if (!viewer.isDestroyed()) {
                viewer.imageryLayers.addImageryProvider(esriImagery);

                // 1. Add World Boundaries and Places Overlay Layer
                try {
                  const esriLabels = await ArcGisMapServerImageryProvider.fromUrl(
                    'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer'
                  );
                  if (!viewer.isDestroyed()) {
                    viewer.imageryLayers.addImageryProvider(esriLabels);
                  }
                } catch (labelErr) {
                  console.warn('Esri place names overlay load error:', labelErr);
                }

                // 2. Add High-Zoom CartoDB Street & Place Name Labels (Ensures text NEVER disappears when zooming close)
                try {
                  const cartoLabels = new UrlTemplateImageryProvider({
                    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png',
                    subdomains: ['a', 'b', 'c', 'd'],
                    maximumLevel: 21,
                  });
                  if (!viewer.isDestroyed()) {
                    viewer.imageryLayers.addImageryProvider(cartoLabels);
                  }
                } catch (cartoErr) {
                  console.warn('CartoDB labels load error:', cartoErr);
                }

                updateStatus({ imageryStatus: 'LOADED', lastError: null });
              }
            } catch (esriErr) {
              console.warn('Esri imagery load attempt, trying Ion fallback:', esriErr);
              try {
                const ionImagery = await createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS });
                if (!viewer.isDestroyed()) {
                  viewer.imageryLayers.addImageryProvider(ionImagery);
                  updateStatus({ imageryStatus: 'LOADED' });
                }
              } catch (ionErr) {
                updateStatus({ imageryStatus: 'FAILED', lastError: 'Satellite imagery failed to load.' });
              }
            }
          };

          loadImagery();

          // 3. Real-Time 3D City Building Pipeline (Photorealistic for New York ONLY, Solid OSM elsewhere)
          const isCameraInNewYork = () => {
            if (viewer.isDestroyed()) return false;
            // 1. Check camera eye cartographic position
            const carto = viewer.camera.positionCartographic;
            if (carto) {
              const lat = CesiumMath.toDegrees(carto.latitude);
              const lon = CesiumMath.toDegrees(carto.longitude);
              if (isLocationInNewYork(lat, lon)) return true;
            }
            // 2. Check screen-center ground intersection (focal point)
            try {
              const canvas = viewer.scene.canvas;
              const centerRay = viewer.camera.getPickRay(new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2));
              if (centerRay) {
                const targetCartesian = viewer.scene.globe.pick(centerRay, viewer.scene);
                if (targetCartesian) {
                  const targetCarto = Cartographic.fromCartesian(targetCartesian);
                  const tLat = CesiumMath.toDegrees(targetCarto.latitude);
                  const tLon = CesiumMath.toDegrees(targetCarto.longitude);
                  if (isLocationInNewYork(tLat, tLon)) return true;
                }
              }
            } catch (_) {}
            return false;
          };

          const load3DTilesPipeline = async () => {
            let osmBuildings: any = null;
            let photorealisticTileset: any = null;

            const updateTilesetForCurrentLocation = () => {
              if (viewer.isDestroyed()) return;
              const inNYC = isCameraInNewYork();

              if (photorealisticTileset) {
                photorealisticTileset.show = inNYC;
              }
              if (osmBuildings) {
                osmBuildings.show = !inNYC;
              }

              updateStatus({
                photorealisticStatus: inNYC ? 'LOADED' : 'IDLE',
                osmStatus: inNYC ? 'IDLE' : 'LOADED',
                activeMode: inNYC ? 'PHOTOREALISTIC' : 'OSM_3D',
              });
            };

            // A. Google Photorealistic 3D Tiles (Activated ONLY for New York)
            try {
              photorealisticTileset = await createGooglePhotorealistic3DTileset();
              if (!viewer.isDestroyed()) {
                photorealisticTileset.show = false; // Default false for Indian Cadastral Hub
                photorealisticTileset.tileFailed?.addEventListener?.((tileErr: any) => {
                  console.warn('Photorealistic 3D Tile load error suppressed:', tileErr);
                });
                viewer.scene.primitives.add(photorealisticTileset);
                console.log('Google Photorealistic 3D Tiles loaded (active exclusively for New York)!');
              }
            } catch (photoError: any) {
              console.warn('Google Photorealistic 3D Tiles load attempt:', photoError?.message || photoError);
            }

            // B. Global Solid 3D Building Geometry (Cesium OSM 3D Buildings - Active everywhere else)
            try {
              osmBuildings = await createOsmBuildingsAsync();
              if (!viewer.isDestroyed()) {
                osmBuildings.tileFailed?.addEventListener?.((tileErr: any) => {
                  console.warn('OSM 3D Tile load error suppressed:', tileErr);
                });
                osmBuildings.maximumScreenSpaceError = 4; // High LOD crisp solid 3D structures
                osmBuildings.style = new Cesium3DTileStyle({
                  color: {
                    conditions: [
                      ["${feature['building']} === 'commercial' || ${feature['building:use']} === 'commercial'", "color('#0284c7', 0.95)"],
                      ["${feature['building']} === 'residential' || ${feature['building:use']} === 'residential'", "color('#38bdf8', 0.90)"],
                      ['true', "color('#f8fafc', 0.88)"],
                    ],
                  },
                });
                viewer.scene.primitives.add(osmBuildings);
                console.log('Solid 3D Buildings (OpenStreetMap) loaded successfully!');
              }
            } catch (osmError: any) {
              console.warn('Cesium OSM 3D Buildings load attempt:', osmError?.message || osmError);
              updateStatus({
                osmStatus: 'FAILED',
                lastError: `OSM 3D Data: ${osmError?.message || String(osmError)}`,
              });
            }

            // Check and sync tileset mode for current camera view
            updateTilesetForCurrentLocation();

            // Real OpenStreetMap 2D Footprint Extrusions for detailed local structures
            if (!viewer.isDestroyed()) {
              loadViewport3DBuildings(viewer);
              // Render Sapthagiri NPS University Grand Neoclassical Campus 3D Model
              try {
                renderSapthagiriCampusModel(viewer);
              } catch (e) {
                console.warn('Sapthagiri Campus Render Exception:', e);
              }
              viewer.camera.percentageChanged = 0.05;
              viewer.camera.changed.addEventListener(() => {
                if (!viewer.isDestroyed()) {
                  updateTilesetForCurrentLocation();
                }
              });
              viewer.camera.moveEnd.addEventListener(() => {
                if (!viewer.isDestroyed()) {
                  updateTilesetForCurrentLocation();
                  if (!isCameraInNewYork()) {
                    loadViewport3DBuildings(viewer);
                  }
                }
              });
            }
          };

          // 3D Real City Building Pipeline (Google Photorealistic + Global OSM 3D Buildings + Local Extrusions)
          load3DTilesPipeline();

          viewer.scene.globe.enableLighting = true;
          if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
          viewer.scene.fog.enabled = true;

          // Depth test disabled against terrain to prevent buildings from clipping/vanishing
          viewer.scene.globe.depthTestAgainstTerrain = false;

          // =========================================================================
          // 360-DEGREE ROTATION & ORBIT CONTROLLER CONFIGURATION
          // =========================================================================
          const controller = viewer.scene.screenSpaceCameraController;
          controller.enableRotate = true;
          controller.enableTilt = true;
          controller.enableLook = true;
          controller.enableZoom = true;
          controller.enableCollisionDetection = false;
          controller.minimumZoomDistance = 15;
          controller.maximumZoomDistance = 35_000_000;
          controller.inertiaSpin = 0.88;
          controller.inertiaTranslate = 0.88;
          controller.inertiaZoom = 0.8;

          // 1. ZOOM: Restrict strictly to Mouse Wheel and Pinch!
          // (CRITICAL: Default Cesium maps Right-Click Drag to Zoom, which makes users feel they can "only drag on front and back"!)
          controller.zoomEventTypes = [
            CameraEventType.WHEEL,
            CameraEventType.PINCH,
          ];

          // 2. 360-DEGREE TILT & ORBIT: Right-Drag, Middle-Drag, Shift+LeftDrag, Ctrl+LeftDrag
          // Right-clicking and dragging now freely tilts and orbits 360 degrees in any direction!
          controller.tiltEventTypes = [
            CameraEventType.RIGHT_DRAG,
            CameraEventType.MIDDLE_DRAG,
            { eventType: CameraEventType.LEFT_DRAG, modifier: KeyboardEventModifier.SHIFT },
            { eventType: CameraEventType.LEFT_DRAG, modifier: KeyboardEventModifier.CTRL },
            { eventType: CameraEventType.RIGHT_DRAG, modifier: KeyboardEventModifier.CTRL },
          ];

          // 3. 360-DEGREE PAN / GLOBE ROTATION: Left-Drag
          controller.rotateEventTypes = [
            CameraEventType.LEFT_DRAG,
          ];

          // 4. FREE LOOK / FIRST-PERSON CAMERA: Alt-Drag
          controller.lookEventTypes = [
            { eventType: CameraEventType.LEFT_DRAG, modifier: KeyboardEventModifier.ALT },
            { eventType: CameraEventType.RIGHT_DRAG, modifier: KeyboardEventModifier.ALT },
          ];

          // Ingest 3D Urban Place & Locality Labels for key landmarks (Stays visible at ALL zoom levels)
          const PLACE_LABELS = [
            { name: '📍 Bengaluru CBD (M.G. Road)', lat: 12.9716, lon: 77.5946, height: 45 },
            { name: '🏛️ Cubbon Park & Vidhana Soudha', lat: 12.9750, lon: 77.5910, height: 40 },
            { name: '🛍️ Brigade Road Shopping District', lat: 12.9700, lon: 77.6070, height: 35 },
            { name: '🌳 Richmond Town Cadastral Sector', lat: 12.9640, lon: 77.6000, height: 35 },
            { name: '🚀 Indiranagar Tech Precinct', lat: 12.9780, lon: 77.6400, height: 50 },
            { name: '🏢 Koramangala Innovation Hub', lat: 12.9350, lon: 77.6240, height: 50 },
          ];

          PLACE_LABELS.forEach((place) => {
            viewer.entities.add({
              id: `place-label-${place.name}`,
              position: Cartesian3.fromDegrees(place.lon, place.lat, place.height),
              label: new LabelGraphics({
                text: place.name,
                font: 'bold 13px Inter, sans-serif',
                fillColor: Color.fromCssColorString('#ffffff'),
                outlineColor: Color.fromCssColorString('#0284c7'),
                outlineWidth: 4,
                style: LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: VerticalOrigin.BOTTOM,
                heightReference: HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                eyeOffset: new Cartesian3(0, 0, -100),
                distanceDisplayCondition: new DistanceDisplayCondition(0, 500000),
                scaleByDistance: new NearFarScalar(10, 1.0, 50000, 0.6),
                pixelOffset: new Cartesian2(0, -15),
              }),
            });
          });

          // STEP 7: Sapthagiri NPS University Initial Location Fly-to
          const bldgLon = building ? building.center.lon : SAPTHAGIRI_COORDS.lon;
          const bldgLat = building ? building.center.lat : SAPTHAGIRI_COORDS.lat;
          const elev = SAPTHAGIRI_COORDS.elevation; // 886m MSL ground elevation

          viewer.camera.setView({
            destination: Cartesian3.fromDegrees(bldgLon, bldgLat, elev + 260),
            orientation: {
              heading: CesiumMath.toRadians(40), // 40° Heading
              pitch: CesiumMath.toRadians(-28),   // -28° Pitch for elevated 3D roofs & facades
              roll: 0,
            },
          });


          if (building) {
            setTimeout(() => {
              if (!viewer.isDestroyed()) {
                flyToBuilding(viewer, building, 1.5);
              }
            }, 600);
          }


          // Camera telemetry listener
          viewer.camera.changed.addEventListener(() => {
            if (viewer.isDestroyed()) return;
            const carto = viewer.camera.positionCartographic;
            if (carto) {
              updateStatus({
                camera: {
                  lat: CesiumMath.toDegrees(carto.latitude),
                  lon: CesiumMath.toDegrees(carto.longitude),
                  height: carto.height,
                  heading: CesiumMath.toDegrees(viewer.camera.heading),
                  pitch: CesiumMath.toDegrees(viewer.camera.pitch),
                },
              });
            }
          });
        } catch (err: any) {
          setDemoMode(true);
          viewer = createDemoViewer(containerRef.current);
          updateStatus({
            lastError: `Cesium Viewer Error: ${err.message || String(err)}`,
          });
        }
      } else {
        viewer = createDemoViewer(containerRef.current);
        setDemoMode(true);
        updateStatus({
          photorealisticStatus: 'NOT_CONFIGURED',
          osmStatus: 'NOT_CONFIGURED',
          lastError: '3D CITY DATA NOT CONFIGURED: VITE_CESIUM_ION_TOKEN is required',
        });
      }

      viewerRef.current = viewer;

      // Keep depthTestAgainstTerrain disabled so all 3D floors and models remain visible
      viewer.scene.globe.depthTestAgainstTerrain = false;

      // Coordinate tracking via mouse movement
      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handlerRef.current = handler;

      // Automatically pause continuous auto-orbit whenever user manually interacts
      handler.setInputAction(() => {
        stopAutoRotate360();
      }, ScreenSpaceEventType.LEFT_DOWN);

      handler.setInputAction(() => {
        stopAutoRotate360();
      }, ScreenSpaceEventType.RIGHT_DOWN);

      handler.setInputAction(() => {
        stopAutoRotate360();
      }, ScreenSpaceEventType.MIDDLE_DOWN);

      handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
        const cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          viewer.scene.globe.ellipsoid
        );
        if (cartesian && onCoordinatesChange) {
          const carto = Cartographic.fromCartesian(cartesian);
          onCoordinatesChange({
            latitude: CesiumMath.toDegrees(carto.latitude),
            longitude: CesiumMath.toDegrees(carto.longitude),
            elevation: viewer.scene.globe.getHeight(carto) ?? 0,
          });
        }
      }, ScreenSpaceEventType.MOUSE_MOVE);

      // Unified Click Handling: floor selection, parcel selection, or 3D Tile Feature metadata extraction
      handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(click.position);
        const cartesian =
          viewer.scene.pickPosition(click.position) ||
          viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);

        let lat = 12.9716;
        let lon = 77.5946;
        if (cartesian) {
          const carto = Cartographic.fromCartesian(cartesian);
          lat = CesiumMath.toDegrees(carto.latitude);
          lon = CesiumMath.toDegrees(carto.longitude);
        }

        if (picked) {
          if (picked.id) {
            const entity = picked.id;
            const bHeight = 18;
            const bFloors = Math.max(1, Math.round(bHeight / 3.5));
            if (typeof entity.id === 'string' && (entity.id.startsWith('osm-ext-') || entity.id.startsWith('real-osm-building-'))) {
              onSelectBuildingFeature?.({
                name: '3D Building Structure',
                ulpin: 'Not available from source',
                lat,
                lon,
                height: bHeight,
                floors: bFloors,
                valuation: 'Not available from source',
                address: getFormattedAddress(lat, lon),
                description: '3D Building structure extruded from real OpenStreetMap cadastral footprint.',
                cesiumFeatureId: entity.id,
              });
              if (entity instanceof Entity) {
                onSelect?.(entity);
              }
            } else if (typeof entity.id === 'string' && entity.id.startsWith('sapthagiri-')) {
              const floorMatch = entity.id.match(/floor-(\d+)/);
              if (floorMatch) {
                const floorNum = parseInt(floorMatch[1], 10);
                const targetFloor = building?.floors.find(
                  (f) => f.floorNumber === floorNum || f.id.endsWith(`F${floorNum}`)
                );
                if (targetFloor) {
                  onSelectFloor?.(targetFloor.id);
                }
              }
              onSelectBuildingFeature?.({
                name: 'Sapthagiri NPS University (Main Academic Palace & Senate)',
                ulpin: 'ULPIN-IN-KA-2026-SNPSU01',
                lat: 13.06747,
                lon: 77.50437,
                height: 48,
                floors: 12,
                valuation: '₹340,00,00,000',
                address: '#14/5, Chikkasandra, Hesaraghatta Main Road, Bengaluru, Karnataka - 560057',
                description: 'Sapthagiri NPS University Grand Neoclassical Academic Palace with 3 interconnected 12-storey blocks, central clock tower, and twin skybridges.',
                cesiumFeatureId: 'sapthagiri-nps-univ-b1',
              });

              if (entity instanceof Entity) {
                onSelect?.(entity);
              }

            } else if (typeof entity.id === 'string' && entity.id.startsWith('city-building-')) {
              const bId = entity.id.replace('city-building-', '');
              const cityB = SURROUNDING_CITY_BUILDINGS.find((b) => b.id === bId);
              if (cityB) {
                onSelectBuildingFeature?.({
                  name: cityB.name,
                  ulpin: cityB.ulpin,
                  lat: cityB.center.lat,
                  lon: cityB.center.lon,
                  height: cityB.height,
                  floors: cityB.floors,
                  valuation: cityB.valuation,
                  address: getFormattedAddress(cityB.center.lat, cityB.center.lon),
                  cesiumFeatureId: entity.id,
                });
              }
              if (entity instanceof Entity) {
                onSelect?.(entity);
              }
            } else if (typeof entity.id === 'string' && entity.id.startsWith('floor-')) {
              const floorId = entity.id.replace('floor-', '');
              onSelectFloor?.(floorId);
            } else if (typeof entity.id === 'string' && (entity.id.includes('solid-bim') || entity.id.includes('building') || entity.id.includes('parcel'))) {
              const bLat = building?.center.lat || lat;
              const bLon = building?.center.lon || lon;
              onSelectBuildingFeature?.({
                name: building?.name || 'VOLU-CAD Vertical Structure',
                ulpin: building?.ulpin || 'Not available from source',
                lat: bLat,
                lon: bLon,
                height: 33,
                floors: building?.floors.length || 8,
                valuation: 'Not available from source',
                address: getFormattedAddress(bLat, bLon, 'M.G. Road, Ward 110 (Sampangiram Nagar), Bengaluru, Karnataka - 560001'),
                cesiumFeatureId: entity.id || 'solid-bim-building-1',
              });
              if (entity instanceof Entity) {
                onSelect?.(entity);
              }
            } else if (entity instanceof Entity) {
              onSelect?.(entity);
            }
          } else if (picked instanceof Cesium3DTileFeature || picked.primitive) {
            const inNyc = isLocationInNewYork(lat, lon);
            const featName = (typeof picked.getProperty === 'function' && (picked.getProperty('name') || picked.getProperty('element_id'))) || (inNyc ? '🗽 New York 3D Structure' : '3D Building Feature');
            const featureId = (typeof picked.getProperty === 'function' && (picked.getProperty('id') || picked.getProperty('element_id'))) || `CESIUM-BLDG-3DTILE-${Math.floor(lat * 10000)}`;
            const rawHeight = (typeof picked.getProperty === 'function' && picked.getProperty('height')) || 24;
            const tileFloors = Math.max(1, Math.round(rawHeight / 3.5));
            onSelectBuildingFeature?.({
              name: featName,
              ulpin: 'Not available from source',
              lat,
              lon,
              height: rawHeight,
              floors: tileFloors,
              valuation: 'Not available from source',
              address: getFormattedAddress(lat, lon),
              description: inNyc
                ? 'Photorealistic 3D building structure detected in New York City.'
                : 'Solid 3D Cadastral building structure (Cesium OSM 3D Buildings).',
              cesiumFeatureId: String(featureId),
            });
          }
        } else if (cartesian && onSelectBuildingFeature) {
          const inNyc = isLocationInNewYork(lat, lon);
          onSelectBuildingFeature({
            name: inNyc ? '🗽 New York Photorealistic 3D Surface' : 'Cadastral Ground Point',
            ulpin: 'Not available from source',
            lat,
            lon,
            height: 0,
            floors: 0,
            valuation: 'Not available from source',
            address: getFormattedAddress(lat, lon),
            description: inNyc
              ? 'Google Photorealistic 3D building mesh detected in New York City.'
              : 'Cadastral coordinate point on terrain.',
          });
        }
      }, ScreenSpaceEventType.LEFT_CLICK);

      onReady?.(viewer);

      return () => {
        stopAutoRotate360();
        handler.destroy();
        handlerRef.current = null;
        if (viewer && !viewer.isDestroyed()) {
          viewer.destroy();
        }
        viewerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render 3D Floor Volumes & Sapthagiri Neoclassical Palace
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || !building) return;

      const isSapthagiri =
        building.id.includes('SNPSU') ||
        building.id === 'BLDG-BLR-021' ||
        building.name.includes('Sapthagiri');

      // Remove existing custom 3D floor entities, labels, pins, buildings & utility pipes
      const toRemove = viewer.entities.values.filter(
        (e) =>
          typeof e.id === 'string' &&
          (e.id.includes('floor-') ||
            e.id.includes('label') ||
            e.id.includes('city-building') ||
            e.id.includes('solid-bim') ||
            e.id.includes('parcel') ||
            e.id.includes('utility') ||
            (!isSapthagiri && e.id.includes('building')))
      );
      toRemove.forEach((e) => viewer.entities.remove(e));

      const explodeFactor = explodeState === 'exploded' ? 1.2 : 0;

      // When building is Sapthagiri NPS University, render the true 3D Neoclassical Architectural Campus
      if (isSapthagiri) {
        renderSapthagiriCampusModel(viewer, selectedFloorId, explodeFactor);

        // Sub-surface clean campus utilities if toggled (parallel perimeter infrastructure)
        if (showUtilities && showUnderground) {
          const centerLon = building.center.lon;
          const centerLat = building.center.lat;

          // Water Main line along perimeter trench (-5m)
          viewer.entities.add({
            id: 'utility-water-perimeter',
            polyline: {
              positions: Cartesian3.fromDegreesArrayHeights([
                centerLon - 0.0008, centerLat - 0.0006, -5,
                centerLon + 0.0008, centerLat - 0.0006, -5,
              ]),
              width: 4,
              material: Color.fromCssColorString('#06b6d4'),
            },
          });

          // High-Voltage Line along perimeter trench (-10m)
          viewer.entities.add({
            id: 'utility-electric-perimeter',
            polyline: {
              positions: Cartesian3.fromDegreesArrayHeights([
                centerLon - 0.0008, centerLat - 0.0008, -10,
                centerLon + 0.0008, centerLat - 0.0008, -10,
              ]),
              width: 4,
              material: Color.fromCssColorString('#f59e0b'),
            },
          });
        }
        return;
      }

      // Fallback for other standard building parcels
      const parcelPositions = footprintToCartesian(building.footprint, 0);
      viewer.entities.add({
        id: 'parcel-outline',
        polygon: {
          hierarchy: new PolygonHierarchy(parcelPositions),
          material: Color.fromCssColorString('#0284c7').withAlpha(0.15),
          outline: true,
          outlineColor: Color.fromCssColorString('#38bdf8'),
          outlineWidth: 2,
        },
      });

      building.floors.forEach((floor: Floor) => {
        const prop = properties.find((p) => p.floorId === floor.id);
        if (!prop) return;
        if (floor.isUnderground && !showUnderground) return;

        const { zMin, zMax } = computeExplodedZ(floor, explodeFactor);
        const positions = [
          ...footprintToCartesian(building.footprint, zMin),
          ...footprintToCartesian(building.footprint, zMax),
        ];

        const isSelected = selectedFloorId === floor.id;
        let color: Color;

        if (isRescueModeActive) {
          if (floor.floorNumber === 3 || floor.id.includes('F3') || floor.id.includes('F03')) {
            color = Color.fromCssColorString('#ef4444').withAlpha(0.95);
          } else if (floor.floorNumber === 4 || floor.id.includes('F4') || floor.id.includes('F04')) {
            color = Color.fromCssColorString('#f59e0b').withAlpha(0.90);
          } else {
            color = Color.fromCssColorString('#10b981').withAlpha(0.75);
          }
        } else if (isSelected) {
          color = Color.fromCssColorString('#0284c7').withAlpha(0.92);
        } else if (selectedFloorId) {
          color = colorFromRgba(STATUS_COLORS[prop.status]?.cesium || STATUS_COLORS.valid.cesium).withAlpha(0.2);
        } else if (floor.isUnderground) {
          color = colorFromRgba(UNDERGROUND_COLOR.cesium).withAlpha(0.85);
        } else {
          color = colorFromRgba(STATUS_COLORS[prop.status]?.cesium || STATUS_COLORS.valid.cesium).withAlpha(0.85);
        }

        viewer.entities.add({
          id: `floor-${floor.id}`,
          polygon: {
            hierarchy: new PolygonHierarchy(positions),
            material: color,
            outline: true,
            outlineColor: isRescueModeActive && (floor.floorNumber === 3 || floor.id.includes('F3') || floor.id.includes('F03'))
              ? Color.fromCssColorString('#fee2e2')
              : isSelected
              ? Color.fromCssColorString('#38bdf8')
              : Color.fromCssColorString('#cbd5e1').withAlpha(0.7),
            outlineWidth: isRescueModeActive && (floor.floorNumber === 3 || floor.id.includes('F3') || floor.id.includes('F03')) ? 4 : isSelected ? 3 : 1,
            perPositionHeight: true,
          },
        });

        if (isSelected || explodeState === 'exploded' || isRescueModeActive) {
          const rescueBadge = isRescueModeActive
            ? (floor.floorNumber === 3 || floor.id.includes('F3') || floor.id.includes('F03'))
              ? ' 🚨 [RESCUE PRIORITY - HIGH]'
              : (floor.floorNumber === 4 || floor.id.includes('F4') || floor.id.includes('F04'))
              ? ' ⚠️ [MED RISK]'
              : ' 🟢 [SAFE]'
            : '';
          makeFloorLabel(
            viewer,
            building,
            floor,
            explodeFactor,
            `${floor.label} • ${prop.vpid} • Z:${zMin}m-${zMax}m${rescueBadge}`
          );
        }
      });
    }, [building, properties, explodeState, selectedFloorId, showUnderground, showUtilities, isRescueModeActive]);


    // Handle Sub-surface Ground Translucency (Underground Mode)
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      if (showUnderground) {
        viewer.scene.globe.translucency.enabled = true;
        viewer.scene.globe.translucency.frontFaceAlpha = 0.45;
        viewer.scene.globe.translucency.backFaceAlpha = 0.45;
      } else {
        viewer.scene.globe.translucency.enabled = false;
        viewer.scene.globe.translucency.frontFaceAlpha = 1.0;
        viewer.scene.globe.translucency.backFaceAlpha = 1.0;
      }
    }, [showUnderground]);

    // Render Custom Imported GeoJSON 3D Buildings
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || !customGeoJson || viewer.isDestroyed()) return;

      const oldImported = viewer.entities.values.filter(
        (e) => typeof e.id === 'string' && e.id.startsWith('custom-geojson-3d-')
      );
      oldImported.forEach((e) => viewer.entities.remove(e));

      if (customGeoJson.type === 'FeatureCollection' && Array.isArray(customGeoJson.features)) {
        customGeoJson.features.forEach((feature: any, idx: number) => {
          if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
            const rawCoords =
              feature.geometry.type === 'Polygon'
                ? feature.geometry.coordinates[0]
                : feature.geometry.coordinates[0][0];

            const flatCoords: number[] = [];
            rawCoords.forEach((pt: number[]) => flatCoords.push(pt[0], pt[1]));

            if (flatCoords.length >= 6) {
              const tagHeight =
                feature.properties?.height ||
                (feature.properties?.['building:levels'] ? feature.properties['building:levels'] * 3.5 : 22);

              viewer.entities.add({
                id: `custom-geojson-3d-${idx}`,
                polygon: {
                  hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(flatCoords)),
                  height: 0,
                  extrudedHeight: tagHeight,
                  heightReference: HeightReference.CLAMP_TO_GROUND,
                  extrudedHeightReference: HeightReference.RELATIVE_TO_GROUND,
                  material: Color.fromCssColorString('#0284c7').withAlpha(0.92),
                  outline: true,
                  outlineColor: Color.fromCssColorString('#38bdf8'),
                  outlineWidth: 2,
                  shadows: ShadowMode.ENABLED,
                },
              });
            }
          }
        });
      }
    }, [customGeoJson]);

    // Render User Created 3D Buildings At Exact Location
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed() || !userCreatedBuildings || userCreatedBuildings.length === 0) return;

      const LAT_M = 111320;

      userCreatedBuildings.forEach((b) => {
        const LON_M = 111320 * Math.cos((b.lat * Math.PI) / 180);
        const hw = b.width / (2 * LON_M);
        const hd = b.depth / (2 * LAT_M);

        const itemFootprint: [number, number][] = [
          [b.lon - hw, b.lat - hd],
          [b.lon + hw, b.lat - hd],
          [b.lon + hw, b.lat + hd],
          [b.lon - hw, b.lat + hd],
        ];

        viewer.entities.add({
          id: `user-created-building-${b.id}`,
          polygon: {
            hierarchy: new PolygonHierarchy(footprintToCartesian(itemFootprint, 0)),
            height: 0,
            extrudedHeight: b.height,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            extrudedHeightReference: HeightReference.RELATIVE_TO_GROUND,
            material: Color.fromCssColorString('#0284c7').withAlpha(0.95),
            outline: true,
            outlineColor: Color.fromCssColorString('#38bdf8'),
            outlineWidth: 2,
            shadows: ShadowMode.ENABLED,
          },
        });

        // Fly camera directly to user's created 3D building
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(b.lon, b.lat - 0.0015, b.height + 140),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-35),
            roll: 0,
          },
          duration: 2.0,
        });
      });
    }, [userCreatedBuildings]);

    return (
      <div className="relative h-full w-full">
        <div ref={containerRef} className="absolute inset-0 cesium-container" />
        {demoMode && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs font-medium text-amber-200 backdrop-blur-md">
            DEMO MODE — High-fidelity 3D Cadastral &amp; Subsurface Mapping Active.
          </div>
        )}
      </div>
    );
  }
);

CesiumGlobe.displayName = 'CesiumGlobe';
export default CesiumGlobe;

// Demo Viewer Builder
function createDemoViewer(container: HTMLElement): Viewer {
  const viewer = new Viewer(container, {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: true,
    terrainProvider: new EllipsoidTerrainProvider(),
    baseLayer: false as unknown as undefined,
  });

  viewer.imageryLayers.removeAll(true);
  loadDemoParcels(viewer);

  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(77.5946, 12.9716, 800),
    orientation: {
      heading: CesiumMath.toRadians(35),
      pitch: CesiumMath.toRadians(-30),
      roll: 0,
    },
  });

  return viewer;
}

async function loadDemoParcels(viewer: Viewer) {
  const parcelsGeoJSON = {
    type: 'FeatureCollection',
    features: [
      makeParcel(77.5910, 12.9680, 'ULPIN-IN-MH-2026-89420'),
      makeParcel(77.5960, 12.9680, 'ULPIN-IN-MH-2026-89422'),
      makeParcel(77.5910, 12.9720, 'ULPIN-IN-MH-2026-89423'),
      makeParcel(77.5946, 12.9716, 'ULPIN-IN-MH-2026-89421'),
    ],
  };

  try {
    const dataSource = await GeoJsonDataSource.load(parcelsGeoJSON, {
      stroke: Color.fromCssColorString('#22d3ee'),
      fill: Color.fromCssColorString('#22d3ee').withAlpha(0.15),
      strokeWidth: 2,
      clampToGround: true,
    });
    dataSource.name = 'Demo Parcels';
    viewer.dataSources.add(dataSource);

    dataSource.entities.values.forEach((entity) => {
      if (entity.position) {
        const labelText = entity.properties?.get('ulpin')?.getValue() ?? '';
        entity.label = new LabelGraphics({
          text: labelText,
          font: '11px Inter, sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          showBackground: true,
          backgroundColor: Color.fromCssColorString('#0f172a').withAlpha(0.75),
        });
      }
    });
  } catch (err) {
    console.error('Failed to load demo parcels', err);
  }
}

function makeParcel(centerLng: number, centerLat: number, ulpin: string) {
  const size = 0.0004;
  const coords = [
    [centerLng - size, centerLat - size],
    [centerLng + size, centerLat - size],
    [centerLng + size, centerLat + size],
    [centerLng - size, centerLat + size],
    [centerLng - size, centerLat - size],
  ];
  return {
    type: 'Feature',
    properties: { ulpin, type: 'parcel' },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

if (CESIUM_ION_TOKEN) {
  Ion.defaultAccessToken = CESIUM_ION_TOKEN;
}
