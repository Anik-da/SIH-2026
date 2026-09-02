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
  createWorldTerrainAsync,
  createWorldImageryAsync,
  createOsmBuildingsAsync,
  createGooglePhotorealistic3DTileset,
  Cesium3DTileset,
  Cesium3DTileStyle,
  IonWorldImageryStyle,
  ShadowMode,
  Cesium3DTileFeature,
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
import { SURROUNDING_CITY_BUILDINGS } from '../data/cadastralDemoData';

export const CESIUM_ION_TOKEN =
  (import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN as string | undefined) ||
  (import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjdyUG1VUjdPQXZjbmtHQlYiLCJqdGkiOiJlZjMyYTZmMi00OWZkLTQyNTctYmIzOC05NDRiNzQ5YjJjY2QiLCJpZCI6NDcyNjEyLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODc3MzcxMTl9.uPJ4DnQzuEVLyPy4QjuiBHWb5AwMAvC8d8q9cK9QM7I';
const HAS_TOKEN = Boolean(CESIUM_ION_TOKEN);

// Configure global Cesium Ion Access Token
Ion.defaultAccessToken = CESIUM_ION_TOKEN;

function loadViewport3DBuildings(viewer: Viewer) {
  if (viewer.isDestroyed()) return;

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
    if (centerCartesian) {
      const carto = Cartographic.fromCartesian(centerCartesian);
      const cLat = CesiumMath.toDegrees(carto.latitude);
      const cLon = CesiumMath.toDegrees(carto.longitude);
      west = cLon - 0.015;
      east = cLon + 0.015;
      south = cLat - 0.015;
      north = cLat + 0.015;
    } else {
      west = 77.585;
      east = 77.615;
      south = 12.960;
      north = 12.985;
    }
  }

  const oldOsmEntities = viewer.entities.values.filter(
    (e) =>
      typeof e.id === 'string' &&
      (e.id.startsWith('osm-ext-') || e.id.startsWith('real-osm-building-'))
  );
  oldOsmEntities.forEach((e) => viewer.entities.remove(e));

  // Fetch REAL OpenStreetMap 2D building footprints for exact coordinate boundaries
  const minLat = Math.min(south, north).toFixed(4);
  const maxLat = Math.max(south, north).toFixed(4);
  const minLon = Math.min(west, east).toFixed(4);
  const maxLon = Math.max(west, east).toFixed(4);

  const query = `[out:json][timeout:15];(way["building"](${minLat},${minLon},${maxLat},${maxLon});way["building:levels"](${minLat},${minLon},${maxLat},${maxLon});relation["building"](${minLat},${minLon},${maxLat},${maxLon}););out body;>;out skel qt;`;
  const urlPrimary = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const urlMirror = `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`;

  const processOverpassData = (data: any) => {
    if (!data || !data.elements || viewer.isDestroyed()) return;

    const nodesMap = new Map<number, [number, number]>();
    data.elements.forEach((el: any) => {
      if (el.type === 'node') nodesMap.set(el.id, [el.lon, el.lat]);
    });

    let count = 0;
    data.elements.forEach((el: any) => {
      if ((el.type === 'way' || el.type === 'relation') && el.nodes && el.nodes.length >= 3 && count < 1000) {
        const coordsFlat: number[] = [];
        el.nodes.forEach((nodeId: number) => {
          const coord = nodesMap.get(nodeId);
          if (coord) coordsFlat.push(coord[0], coord[1]);
        });

        if (coordsFlat.length >= 6) {
          count++;
          const tagHeight = el.tags?.height
            ? parseFloat(el.tags.height)
            : el.tags?.['building:levels']
            ? parseFloat(el.tags['building:levels']) * 3.5
            : Math.max(10, (el.id % 25) + 8);

          // Architectural Color Palette for Realistic 3D Facades
          const colorHue = el.id % 5;
          const matColor =
            colorHue === 0
              ? Color.fromCssColorString('#f8fafc').withAlpha(0.95) // White Ceramic
              : colorHue === 1
              ? Color.fromCssColorString('#0284c7').withAlpha(0.88) // Reflected Sky Glass
              : colorHue === 2
              ? Color.fromCssColorString('#e2e8f0').withAlpha(0.94) // Concrete Architectural
              : colorHue === 3
              ? Color.fromCssColorString('#38bdf8').withAlpha(0.90) // Cyan Tinted Glass
              : Color.fromCssColorString('#f1f5f9').withAlpha(0.95); // Off-white Slate

          viewer.entities.add({
            id: `real-osm-building-${el.id}`,
            polygon: {
              hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(coordsFlat)),
              height: 0,
              extrudedHeight: tagHeight,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              extrudedHeightReference: HeightReference.RELATIVE_TO_GROUND,
              material: matColor,
              outline: true,
              outlineColor: Color.fromCssColorString('#0284c7'),
              outlineWidth: 1.5,
              shadows: ShadowMode.ENABLED,
            },
          });
        }
      }
    });
  };

  fetch(urlPrimary)
    .then((res) => res.json())
    .then(processOverpassData)
    .catch(() => {
      fetch(urlMirror)
        .then((res) => res.json())
        .then(processOverpassData)
        .catch((err) => console.warn('Real OpenStreetMap 3D Footprint fetch fallback:', err));
    });
}

export interface PickedBuildingData {
  name: string;
  ulpin: string;
  lat: number;
  lon: number;
  height: number;
  floors: number;
  valuation: string;
  description?: string;
}

interface CesiumGlobeProps {
  building?: Building;
  properties?: VerticalProperty[];
  selectedFloorId?: string | null;
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
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const [demoMode, setDemoMode] = useState(!HAS_TOKEN);
    const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

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
        viewer.camera.rotateLeft(CesiumMath.toRadians(45));
      },
      rotateRight: () => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.rotateRight(CesiumMath.toRadians(45));
      },
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
      flyToLocation: (lat: number, lon: number, height = 1200) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(lon, lat, height),
          orientation: {
            heading: CesiumMath.toRadians(35),
            pitch: CesiumMath.toRadians(-35),
            roll: 0,
          },
          duration: 2.5,
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
            terrainProvider: undefined,
            baseLayer: false as unknown as undefined,
          });

          // 1. World Terrain Provider
          updateStatus({ terrainStatus: 'LOADING' });
          createWorldTerrainAsync()
            .then((terrain) => {
              if (!viewer.isDestroyed()) {
                viewer.terrainProvider = terrain;
                updateStatus({ terrainStatus: 'LOADED' });
              }
            })
            .catch((err) => {
              console.error('Failed to load world terrain', err);
              updateStatus({ terrainStatus: 'FAILED', lastError: `Terrain Error: ${err.message || String(err)}` });
            });

          // 2. World Imagery Provider
          updateStatus({ imageryStatus: 'LOADING' });
          createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS })
            .then((imagery) => {
              if (!viewer.isDestroyed()) {
                viewer.imageryLayers.addImageryProvider(imagery);
                updateStatus({ imageryStatus: 'LOADED' });
              }
            })
            .catch((err) => {
              console.error('Failed to load world imagery', err);
              updateStatus({ imageryStatus: 'FAILED', lastError: `Imagery Error: ${err.message || String(err)}` });
            });

          // 3. Real-Time 3D City Building Pipeline (Google Photorealistic + Global OSM 3D Buildings + Viewport Real-Time Footprints)
          const load3DTilesPipeline = async () => {
            let googleSuccess = false;
            updateStatus({ photorealisticStatus: 'LOADING' });

            // A. Primary: Google Photorealistic 3D Tiles (Ion Asset 2275207 / API function)
            try {
              let googleTileset: any = null;
              if (typeof createGooglePhotorealistic3DTileset === 'function') {
                try {
                  googleTileset = await createGooglePhotorealistic3DTileset();
                } catch {
                  // Fall back to Ion Asset 2275207
                }
              }
              if (!googleTileset) {
                googleTileset = await Cesium3DTileset.fromIonAssetId(2275207);
              }

              if (!viewer.isDestroyed() && googleTileset) {
                viewer.scene.primitives.add(googleTileset);
                googleSuccess = true;
                updateStatus({
                  photorealisticStatus: 'LOADED',
                  activeMode: 'PHOTOREALISTIC',
                  lastError: null,
                });
                console.log('Google Photorealistic 3D Tiles loaded successfully!');
              }
            } catch (error: any) {
              console.warn('Google Photorealistic 3D Tiles load attempt:', error?.message || error);
              updateStatus({
                photorealisticStatus: 'FAILED',
                lastError: `Photorealistic 3D data: ${error?.message || String(error)}`,
              });
            }

            // B. Global 3D Building Layer: Cesium OSM 3D Buildings for worldwide coverage
            updateStatus({ osmStatus: 'LOADING' });
            try {
              const osmBuildings = await createOsmBuildingsAsync();
              if (!viewer.isDestroyed()) {
                osmBuildings.style = new Cesium3DTileStyle({
                  color: {
                    conditions: [
                      ["${feature['building']} === 'commercial'", "color('#38bdf8', 0.95)"],
                      ["${feature['building']} === 'residential'", "color('#818cf8', 0.95)"],
                      ["true", "color('#f8fafc', 0.92)"],
                    ],
                  },
                  show: true,
                });
                viewer.scene.primitives.add(osmBuildings);
                updateStatus({
                  osmStatus: 'LOADED',
                  activeMode: googleSuccess ? 'PHOTOREALISTIC' : 'OSM_3D',
                });
                console.log('Global 3D Buildings (OpenStreetMap) loaded successfully!');
              }
            } catch (osmError: any) {
              console.warn('Cesium OSM 3D Buildings load attempt:', osmError?.message || osmError);
            }

            // C. Real-time Overpass API 3D Building Footprints for local areas
            if (!viewer.isDestroyed()) {
              loadViewport3DBuildings(viewer);
              viewer.camera.moveEnd.addEventListener(() => {
                if (!viewer.isDestroyed()) loadViewport3DBuildings(viewer);
              });
            }
          };

          load3DTilesPipeline();

          viewer.scene.globe.enableLighting = true;
          if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
          viewer.scene.fog.enabled = true;

          // Prevent camera from going under terrain/inside globe
          viewer.scene.screenSpaceCameraController.minimumZoomDistance = 75;
          viewer.scene.globe.depthTestAgainstTerrain = true;

          // STEP 7: India / Bengaluru Initial Location Fly-to
          const bldgLon = building ? building.center.lon : 77.5946; // Bengaluru Longitude
          const bldgLat = building ? building.center.lat : 12.9716; // Bengaluru Latitude

          viewer.camera.setView({
            destination: Cartesian3.fromDegrees(bldgLon, bldgLat, 1200),
            orientation: {
              heading: CesiumMath.toRadians(45), // 45° Heading
              pitch: CesiumMath.toRadians(-40),   // -40° Pitch for elevated 3D roofs & facades
              roll: 0,
            },
          });

          if (building) {
            setTimeout(() => {
              if (!viewer.isDestroyed()) {
                flyToBuilding(viewer, building, 2.0);
              }
            }, 1200);
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

      // Enable depth testing for 3D floors
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // Coordinate tracking via mouse movement
      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handlerRef.current = handler;

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
            if (typeof entity.id === 'string' && (entity.id.startsWith('osm-ext-') || entity.id.startsWith('real-osm-building-'))) {
              onSelectBuildingFeature?.({
                name: '3D Building Feature',
                ulpin: 'Not available from source',
                lat,
                lon,
                height: 18,
                floors: 5,
                valuation: 'Not available from source',
                description: 'Photorealistic building detected. No verified cadastral/property record is linked to this building.',
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
                });
              }
              if (entity instanceof Entity) {
                onSelect?.(entity);
              }
            } else if (typeof entity.id === 'string' && entity.id.startsWith('floor-')) {
              const floorId = entity.id.replace('floor-', '');
              onSelectFloor?.(floorId);
            } else if (typeof entity.id === 'string' && (entity.id.includes('solid-bim') || entity.id.includes('building') || entity.id.includes('parcel'))) {
              onSelectBuildingFeature?.({
                name: building?.name || 'VOLU-CAD Vertical Structure',
                ulpin: building?.ulpin || 'Not available from source',
                lat: building?.center.lat || lat,
                lon: building?.center.lon || lon,
                height: 33,
                floors: building?.floors.length || 8,
                valuation: 'Not available from source',
              });
              if (entity instanceof Entity) {
                onSelect?.(entity);
              }
            } else if (entity instanceof Entity) {
              onSelect?.(entity);
            }
          } else if (picked instanceof Cesium3DTileFeature || picked.primitive) {
            const featName = (typeof picked.getProperty === 'function' && (picked.getProperty('name') || picked.getProperty('element_id'))) || 'Photorealistic 3D Building';
            onSelectBuildingFeature?.({
              name: featName,
              ulpin: 'Not available from source',
              lat,
              lon,
              height: (typeof picked.getProperty === 'function' && picked.getProperty('height')) || 0,
              floors: 0,
              valuation: 'Not available from source',
              description: 'Photorealistic building detected. No verified cadastral/property record is linked to this building.',
            });
          }
        } else if (cartesian && onSelectBuildingFeature) {
          onSelectBuildingFeature({
            name: 'Photorealistic Surface Point',
            ulpin: 'Not available from source',
            lat,
            lon,
            height: 0,
            floors: 0,
            valuation: 'Not available from source',
            description: 'Photorealistic building detected. No verified cadastral/property record is linked to this building.',
          });
        }
      }, ScreenSpaceEventType.LEFT_CLICK);

      onReady?.(viewer);

      return () => {
        handler.destroy();
        handlerRef.current = null;
        if (viewer && !viewer.isDestroyed()) {
          viewer.entities.removeAll();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render 3D Exploded Floor Volumes
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || !building) return;

      // Remove existing custom 3D floor entities, labels, pins, buildings & utility pipes
      const toRemove = viewer.entities.values.filter(
        (e) =>
          typeof e.id === 'string' &&
          (e.id.includes('floor') ||
            e.id.includes('label') ||
            e.id.includes('building') ||
            e.id.includes('city-building') ||
            e.id.includes('solid-bim') ||
            e.id.includes('parcel') ||
            e.id.includes('utility'))
      );
      toRemove.forEach((e) => viewer.entities.remove(e));

      // 1. Parcel 2D Ground Footprint Outline
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

      // 2. High-Detail 3D Architectural Building Model & Surrounding 3D Urban Grid
      // Note: Synthetic extruded boxes (solid-bim-building) are disabled to ensure authentic 3D photorealistic tiles / 3D buildings are fully visible.
      if (explodeState !== 'exploded') {
        return;
      }

      // 3D Floor Extruded Volumes (Rendered ONLY when user explicitly toggles Explode 3D Floors)
      const explodeFactor = 1;

      building.floors.forEach((floor: Floor) => {
        const prop = properties.find((p) => p.floorId === floor.id);
        if (!prop) return;
        if (floor.isUnderground && !showUnderground) return;

        const { zMin, zMax } = computeExplodedZ(floor, explodeFactor);
        const positions = [
          ...footprintToCartesian(building.footprint, zMin),
          ...footprintToCartesian(building.footprint, zMax),
        ];

        let color: Color;
        if (selectedFloorId === floor.id) {
          color = colorFromRgba(SELECTED_COLOR.cesium);
        } else if (floor.isUnderground) {
          color = colorFromRgba(UNDERGROUND_COLOR.cesium);
        } else {
          color = colorFromRgba(STATUS_COLORS[prop.status].cesium);
        }

        const isSelected = selectedFloorId === floor.id;

        viewer.entities.add({
          id: `floor-${floor.id}`,
          polygon: {
            hierarchy: new PolygonHierarchy(positions),
            material: color,
            outline: true,
            outlineColor: isSelected
              ? Color.fromCssColorString('#38bdf8')
              : Color.fromCssColorString('#cbd5e1'),
            outlineWidth: isSelected ? 3 : 1,
            perPositionHeight: true,
          },
        });

        // Only render floor label for the SELECTED floor in exploded view to prevent text overlap
        if (explodeState === 'exploded' && isSelected) {
          makeFloorLabel(
            viewer,
            building,
            floor,
            explodeFactor,
            `${floor.label} (${prop.vpid})`
          );
        }
      });

        // 3. Sub-surface Utility Infrastructure Lines ($Z < 0$)
        if (showUtilities && showUnderground) {
          const centerLon = building.center.lon;
          const centerLat = building.center.lat;

          // Water Main (Cyan, -5m)
          viewer.entities.add({
            id: 'utility-water',
            polyline: {
              positions: Cartesian3.fromDegreesArrayHeights([
                centerLon - 0.001, centerLat - 0.0005, -5,
                centerLon + 0.001, centerLat + 0.0005, -5,
              ]),
              width: 5,
              material: Color.fromCssColorString('#06b6d4'),
            },
          });

          // Electric Cable Grid (Amber, -10m)
          viewer.entities.add({
            id: 'utility-electric',
            polyline: {
              positions: Cartesian3.fromDegreesArrayHeights([
                centerLon - 0.0008, centerLat + 0.0008, -10,
                centerLon + 0.0008, centerLat - 0.0008, -10,
              ]),
              width: 4,
              material: Color.fromCssColorString('#f59e0b'),
            },
          });

          // Fiber Optic Transit Line (Purple, -15m)
          viewer.entities.add({
            id: 'utility-fiber',
            polyline: {
              positions: Cartesian3.fromDegreesArrayHeights([
                centerLon - 0.0012, centerLat, -15,
                centerLon + 0.0012, centerLat, -15,
              ]),
              width: 4,
              material: Color.fromCssColorString('#a855f7'),
            },
          });
        }
      }, [building, properties, explodeState, selectedFloorId, showUnderground, showUtilities]);

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
