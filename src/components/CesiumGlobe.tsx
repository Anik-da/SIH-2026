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
  Cesium3DTileStyle,
  IonWorldImageryStyle,
} from 'cesium';
import type { CesiumGlobeHandle } from './cesium.types';
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

export const CESIUM_ION_TOKEN =
  (import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjdyUG1VUjdPQXZjbmtHQlYiLCJqdGkiOiJlZjMyYTZmMi00OWZkLTQyNTctYmIzOC05NDRiNzQ5YjJjY2QiLCJpZCI6NDcyNjEyLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODc3MzcxMTl9.uPJ4DnQzuEVLyPy4QjuiBHWb5AwMAvC8d8q9cK9QM7I';
const HAS_TOKEN = Boolean(CESIUM_ION_TOKEN);

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
  onReady?: (viewer: Viewer) => void;
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
      onReady,
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

          createWorldTerrainAsync()
            .then((terrain) => {
              if (!viewer.isDestroyed()) {
                viewer.terrainProvider = terrain;
              }
            })
            .catch((err) => console.error('Failed to load world terrain', err));

          createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS })
            .then((imagery) => {
              if (!viewer.isDestroyed()) {
                viewer.imageryLayers.addImageryProvider(imagery);
              }
            })
            .catch((err) => console.error('Failed to load world imagery', err));

          // 1. Try Google Photorealistic 3D Tileset for Shanghai/Global realistic 3D mesh
          if (typeof createGooglePhotorealistic3DTileset === 'function') {
            createGooglePhotorealistic3DTileset()
              .then((googleTiles) => {
                if (!viewer.isDestroyed()) {
                  viewer.scene.primitives.add(googleTiles);
                }
              })
              .catch(() => {
                // Fallback to OSM 3D Buildings with high-fidelity glass/cyan styling
                createOsmBuildingsAsync()
                  .then((buildings) => {
                    if (!viewer.isDestroyed()) {
                      buildings.style = new Cesium3DTileStyle({
                        color: {
                          conditions: [
                            ["${feature['building']} === 'commercial'", "color('#38bdf8', 0.85)"],
                            ["${feature['building']} === 'residential'", "color('#818cf8', 0.85)"],
                            ["true", "color('#0ea5e9', 0.8)"],
                          ],
                        },
                      });
                      viewer.scene.primitives.add(buildings);
                    }
                  })
                  .catch((err) => console.error('Failed to load OSM buildings', err));
              });
          } else {
            createOsmBuildingsAsync()
              .then((buildings) => {
                if (!viewer.isDestroyed()) {
                  buildings.style = new Cesium3DTileStyle({
                    color: {
                      conditions: [
                        ["${feature['building']} === 'commercial'", "color('#38bdf8', 0.85)"],
                        ["${feature['building']} === 'residential'", "color('#818cf8', 0.85)"],
                        ["true", "color('#0ea5e9', 0.8)"],
                      ],
                    },
                  });
                  viewer.scene.primitives.add(buildings);
                }
              })
              .catch((err) => console.error('Failed to load OSM buildings', err));
          }

          viewer.scene.globe.enableLighting = true;
          if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
          viewer.scene.fog.enabled = true;

          // Prevent camera from going under terrain/inside globe
          viewer.scene.screenSpaceCameraController.minimumZoomDistance = 35;
          viewer.scene.globe.depthTestAgainstTerrain = true;

          // Initialize camera high above terrain level (1250m = 815m ground + 435m overhead pitch distance)
          if (building) {
            viewer.camera.setView({
              destination: Cartesian3.fromDegrees(building.center.lon, building.center.lat, 1250),
              orientation: {
                heading: CesiumMath.toRadians(35),
                pitch: CesiumMath.toRadians(-35),
                roll: 0,
              },
            });
            // Smoothly fly to 95m close-up inspection after terrain renders
            setTimeout(() => {
              if (!viewer.isDestroyed()) {
                flyToBuilding(viewer, building, 2.0);
              }
            }, 1200);
          }
        } catch {
          setDemoMode(true);
          viewer = createDemoViewer(containerRef.current);
        }
      } else {
        viewer = createDemoViewer(containerRef.current);
        setDemoMode(true);
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

      // Unified Click Handling: floor selection or parcel selection
      handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(click.position);
        if (picked && picked.id) {
          const entity = picked.id;
          if (typeof entity.id === 'string' && entity.id.startsWith('floor-')) {
            const floorId = entity.id.replace('floor-', '');
            onSelectFloor?.(floorId);
          } else if (entity instanceof Entity) {
            onSelect?.(entity);
          }
        } else {
          onSelect?.(null);
        }
      }, ScreenSpaceEventType.LEFT_CLICK);

      onReady?.(viewer);

      return () => {
        handler.destroy();
        handlerRef.current = null;
        if (viewer && !viewer.isDestroyed()) {
          viewer.destroy();
        }
        viewerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render 3D Exploded Floor Volumes
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || !building) return;

      // Remove existing custom 3D floor entities, labels, pins & utility pipes
      const toRemove = viewer.entities.values.filter(
        (e) =>
          typeof e.id === 'string' &&
          (e.id.includes('floor') ||
            e.id.includes('label') ||
            e.id.includes('building-pin') ||
            e.id.includes('parcel') ||
            e.id.includes('utility'))
      );
      toRemove.forEach((e) => viewer.entities.remove(e));

      // 1. Parcel 2D Ground Footprint Outline & 3D Pin Label
      const parcelPositions = footprintToCartesian(building.footprint, 0);
      viewer.entities.add({
        id: 'parcel-outline',
        polygon: {
          hierarchy: new PolygonHierarchy(parcelPositions),
          material: colorFromRgba(PARCEL_COLOR.cesium),
          outline: true,
          outlineColor: Color.fromCssColorString('#38bdf8'),
          outlineWidth: 2,
        },
      });

      // 2. 3D Floor Extruded Volumes (Rendered cleanly when active)
      const explodeFactor = explodeState === 'exploded' ? 1 : 0;

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
