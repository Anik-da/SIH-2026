import { getGroundElevation } from './cesium3dHelpers';
import {
  Cartesian3,
  Color,
  PolygonHierarchy,
  Viewer,
  ShadowMode,
  Cartesian2,
  HorizontalOrigin,
  VerticalOrigin,
  Cartographic,
  DistanceDisplayCondition,
  HeightReference,
} from 'cesium';

/**
 * Sapthagiri NPS University Campus â€” 3D Neoclassical Architectural Palace
 * Precise location: #14/5, Chikkasandra, Hesaraghatta Main Road, Bengaluru
 * Real Coordinates: 13.06745Â° N, 77.50440Â° E (Anchored directly to campus foundation footprint)
 * Orientation: Rotated -15Â° to face Hesaraghatta Main Road directly.
 * 
 * 3 DISTINCT BUILDINGS (12 FLOORS EACH, 43.2m height):
 * 1. West Building (Block A): School of Engineering & Technology (32m x 38m)
 *    - 4 Corinthian columns, arched cathedral bay, rosette window, triangular pediment, corner cupolas
 * 2. Center Building (Block B): Academic Senate & Grand Chancellor Hall (40m x 46m)
 *    - Monumental central pediment (48.5m), protruding grand entrance portico, central golden dome
 * 3. East Building (Block C): Chancellor Executive Wing & Heritage Clock Tower (46m x 40m)
 *    - Iconic 56m Rooftop Clock Tower with illuminated clock faces and golden finial
 *    - Semicircular Classical Rotunda Portico with golden dome on the Eastern lawn
 * 
 * Twin elevated skybridges connecting Blocks A-B and B-C across Floors 5-9.
 */

export const SAPTHAGIRI_COORDS = {
  lat: 13.06746,
  lon: 77.50426,
  elevation: 0.0,
};

// Alignment angle: +25Â° rotation to face Hesaraghatta Main Road directly
const ROTATION_DEG = 25;
const ROT_RAD = (ROTATION_DEG * Math.PI) / 180;
const cosR = Math.cos(ROT_RAD);
const sinR = Math.sin(ROT_RAD);

export function renderSapthagiriCampusModel(
  viewer: Viewer,
  selectedFloorId?: string | null,
  explodeFactor: number = 0,
  isRescueModeActive: boolean = false
) {
  if (!viewer || viewer.isDestroyed()) return;

  try {
    // Clean up previous Sapthagiri entities
    const oldEntities = viewer.entities.values.filter(
      (e) => typeof e.id === 'string' && e.id.startsWith('sapthagiri-')
    );
    oldEntities.forEach((e) => viewer.entities.remove(e));

    const centerLat = SAPTHAGIRI_COORDS.lat;
    const centerLon = SAPTHAGIRI_COORDS.lon;

    // Ground elevation: sample peak footprint height across 90m campus radius to align flush with terrain
    const baseElev = getGroundElevation(viewer, centerLon, centerLat, 90) + 0.15;

    // Degree conversion constants around Bengaluru (lat ~13.0675°)
    const LAT_M = 111320;
    const LON_M = 111320 * Math.cos((centerLat * Math.PI) / 180);

    // Rotate and project relative coordinates to geographic lat/lon
    const rotateOffset = (dx: number, dy: number): [number, number] => [
      dx * cosR - dy * sinR,
      dx * sinR + dy * cosR,
    ];

    const toCoords = (dx: number, dy: number): [number, number] => {
      const [rx, ry] = rotateOffset(dx, dy);
      return [centerLon + rx / LON_M, centerLat + ry / LAT_M];
    };

    const makeBoxCoords = (cx: number, cy: number, w: number, d: number): number[] => {
      const hw = w / 2;
      const hd = d / 2;
      const p1 = toCoords(cx - hw, cy - hd);
      const p2 = toCoords(cx + hw, cy - hd);
      const p3 = toCoords(cx + hw, cy + hd);
      const p4 = toCoords(cx - hw, cy + hd);
      return [p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]];
    };

    // Parse active floor number from selectedFloorId
    let activeFloorNum: number | null = null;
    if (selectedFloorId) {
      const match = selectedFloorId.match(/(?:F|floor-?)(\d+)/i);
      if (match) {
        activeFloorNum = parseInt(match[1], 10);
      } else if (selectedFloorId.includes('GF')) {
        activeFloorNum = 0;
      }
    }

    // Color Palette matching actual Sapthagiri architectural renderings
    const cMarbleCream = Color.fromCssColorString('#fcf9ed');
    const cSandstoneWarm = Color.fromCssColorString('#f4ebd0');
    const cGoldTrim = Color.fromCssColorString('#d97706');
    const cGoldLight = Color.fromCssColorString('#f59e0b');
    const cDarkCathedralGlass = Color.fromCssColorString('#0f172a');
    const cColumnWhite = Color.fromCssColorString('#ffffff');
    const cRoofBalustrade = Color.fromCssColorString('#e2e8f0');
    const cSkybridge = Color.fromCssColorString('#fef3c7');
    const cLawnGreen = Color.fromCssColorString('#15803d');
    const cPlazaPaving = Color.fromCssColorString('#334155');
    const cSelectedFloor = Color.fromCssColorString('#0284c7');

    // =========================================================================
    // 0. Subterranean Foundation Base / Plinth Skirt (Prevents Floating on Slope)
    // =========================================================================
    const foundationCoords = makeBoxCoords(0, 0, 188, 112);
    viewer.entities.add({
      id: 'sapthagiri-foundation-pad',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(foundationCoords)),
        height: baseElev - 3.5,
        extrudedHeight: baseElev + 0.1,
        material: Color.fromCssColorString('#1e293b').withAlpha(0.98),
        outline: true,
        outlineColor: Color.fromCssColorString('#0f172a'),
        outlineWidth: 2,
      },
    });

    // =========================================================================
    // 1. Campus Ground Plaza & Manicured Lawns (Rotated -15° facing the road)
    // =========================================================================
    const lawnCoords = makeBoxCoords(0, 0, 185, 110);
    viewer.entities.add({
      id: 'sapthagiri-ground-lawn',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(lawnCoords)),
        height: baseElev,
        extrudedHeight: baseElev + 0.35,
        material: cLawnGreen.withAlpha(0.88),
        outline: true,
        outlineColor: Color.fromCssColorString('#166534'),
        outlineWidth: 2,
      },
    });

    const plazaCoords = makeBoxCoords(0, -24, 165, 42);
    viewer.entities.add({
      id: 'sapthagiri-ground-plaza',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(plazaCoords)),
        height: baseElev + 0.15,
        extrudedHeight: baseElev + 0.5,
        material: cPlazaPaving.withAlpha(0.92),
        outline: true,
        outlineColor: Color.fromCssColorString('#475569'),
        outlineWidth: 1.5,
      },
    });

    // Campus Main Entrance Marker
    viewer.entities.add({
      id: 'sapthagiri-marker-badge',
      position: Cartesian3.fromDegrees(centerLon, centerLat - 0.0003, baseElev + 68),
      label: {
        text: '🏛️ SAPTHAGIRI NPS UNIVERSITY\nMain Academic Palace & Senate Complex (12 Floors)',
        font: 'bold 13px Inter, system-ui, sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.fromCssColorString('#0f172a'),
        outlineWidth: 3,
        showBackground: true,
        backgroundColor: Color.fromCssColorString('#0284c7').withAlpha(0.9),
        backgroundPadding: new Cartesian2(10, 6),
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 4500),
      },
    });

    // =========================================================================
    // 2. THE THREE DISTINCT BUILDINGS (12 Floors Each, Height = 43.2m)
    // =========================================================================
    const distinctBuildings = [
      {
        id: 'block-a',
        name: 'West Academic Wing (Block A)',
        cx: -44, // 44m West of center
        cy: 0,
        width: 32, // Distinct narrower profile
        depth: 38,
        height: 43.2,
        hasPediment: true,
        hasDome: false,
        hasCupolas: true, // Distinct Baroque corner cupolas
        pedimentHeight: 47.0,
      },
      {
        id: 'block-b',
        name: 'Central Senate & Grand Hall (Block B)',
        cx: 0, // Center block
        cy: 2,
        width: 40, // Grand majestic center block
        depth: 46,
        height: 43.2,
        hasPediment: true,
        hasDome: true, // Central golden ribbed dome
        hasGrandPortico: true, // Protruding monumental entrance
        pedimentHeight: 48.5, // Tallest pediment
        isCenter: true,
      },
      {
        id: 'block-c',
        name: 'East Clock Tower & Rotunda Wing (Block C)',
        cx: 46, // 46m East of center
        cy: 0,
        width: 46, // Widest building with Clock Tower & Rotunda
        depth: 40,
        height: 43.2,
        hasPediment: true,
        hasClockTower: true, // Iconic 56m clock tower
        hasRotunda: true, // Semicircular domed rotunda on east garden
        pedimentHeight: 47.0,
      },
    ];

    // Render 12 Floors for each distinct building
    const floorHeight = 3.6;
    for (let f = 1; f <= 12; f++) {
      const isSelectedFloor = activeFloorNum === f;
      const explodeShift = explodeFactor * (f * 4.5);
      const zMin = baseElev + (f - 1) * floorHeight + explodeShift;
      const zMax = baseElev + f * floorHeight + explodeShift;
      const isOdd = f % 2 === 1;

      let floorMaterial: Color;
      let outlineColor: Color;

      if (isRescueModeActive) {
        if (f === 3) {
          // Critical Fire Floor: Glowing Crimson Flame
          floorMaterial = Color.fromCssColorString('#dc2626').withAlpha(0.95);
          outlineColor = Color.fromCssColorString('#fef08a');
        } else if (f === 4) {
          // High-Heat Smoke Caution Floor
          floorMaterial = Color.fromCssColorString('#ea580c').withAlpha(0.90);
          outlineColor = Color.fromCssColorString('#fdba74');
        } else {
          // Safe Evacuated / Cleared Floors: Translucent Emerald Green
          floorMaterial = Color.fromCssColorString('#10b981').withAlpha(0.60);
          outlineColor = Color.fromCssColorString('#86efac');
        }
      } else if (isSelectedFloor) {
        floorMaterial = cSelectedFloor.withAlpha(0.95);
        outlineColor = Color.fromCssColorString('#38bdf8');
      } else if (activeFloorNum !== null) {
        floorMaterial = (isOdd ? cMarbleCream : cSandstoneWarm).withAlpha(0.35);
        outlineColor = cGoldTrim.withAlpha(0.4);
      } else {
        floorMaterial = (isOdd ? cMarbleCream : cSandstoneWarm).withAlpha(0.95);
        outlineColor = cGoldTrim.withAlpha(0.65);
      }

      distinctBuildings.forEach((bld) => {
        const boxCoords = makeBoxCoords(bld.cx, bld.cy, bld.width, bld.depth);
        viewer.entities.add({
          id: `sapthagiri-${bld.id}-floor-${f}`,
          name: `Sapthagiri NPS University â€” ${bld.name} Floor ${f}`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(boxCoords)),
            height: zMin,
            extrudedHeight: zMax,
            material: floorMaterial,
            outline: true,
            outlineColor: outlineColor,
            outlineWidth: isRescueModeActive && (f === 3 || f === 4) ? 4 : isSelectedFloor ? 3 : 1.5,
            shadows: ShadowMode.ENABLED,
            distanceDisplayCondition: new DistanceDisplayCondition(0, 6000),
          },
        });
      });

      // Show floating label when floor is selected
      if (isSelectedFloor) {
        viewer.entities.add({
          id: `sapthagiri-selected-floor-label-${f}`,
          position: Cartesian3.fromDegrees(centerLon, centerLat, zMax + 3),
          label: {
            text: `Sapthagiri NPS University â€¢ Floor ${f} of 12 â€¢ Z:${((f - 1) * floorHeight).toFixed(1)}m-${(f * floorHeight).toFixed(1)}m`,
            font: 'bold 12px Inter, sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.fromCssColorString('#0284c7'),
            outlineWidth: 3,
            showBackground: true,
            backgroundColor: Color.fromCssColorString('#0f172a').withAlpha(0.92),
            backgroundPadding: new Cartesian2(8, 5),
            horizontalOrigin: HorizontalOrigin.CENTER,
            verticalOrigin: VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      }
    }

    // =========================================================================
    // 3. DISTINCT ARCHITECTURAL FEATURES FOR EACH BUILDING
    // =========================================================================

    // --- BUILDING 1 (West Academic Wing - Block A) ---
    {
      const bld = distinctBuildings[0];
      // Front Arched Cathedral Window (Floors 3-10)
      const archCoords = makeBoxCoords(bld.cx, bld.cy - bld.depth / 2 - 0.4, 10, 1.2);
      viewer.entities.add({
        id: 'sapthagiri-block-a-cathedral-arch',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(archCoords)),
          height: baseElev + 7.2,
          extrudedHeight: baseElev + 36.0,
          material: cDarkCathedralGlass.withAlpha(0.92),
          outline: true,
          outlineColor: cGoldLight,
          outlineWidth: 2,
        },
      });

      // Rosette Medallion (Floor 7)
      const rosetteCoords = makeBoxCoords(bld.cx, bld.cy - bld.depth / 2 - 0.6, 5, 1.2);
      viewer.entities.add({
        id: 'sapthagiri-block-a-rosette',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rosetteCoords)),
          height: baseElev + 31.0,
          extrudedHeight: baseElev + 36.0,
          material: cGoldLight,
          outline: true,
          outlineColor: cColumnWhite,
          outlineWidth: 1.5,
        },
      });

      // Triangular Pediment over 4 Corinthian Pillars
      const pedCoords = makeBoxCoords(bld.cx, bld.cy - 1, bld.width * 0.7, bld.depth * 0.5);
      viewer.entities.add({
        id: 'sapthagiri-block-a-pediment',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pedCoords)),
          height: baseElev + bld.height,
          extrudedHeight: baseElev + bld.pedimentHeight,
          material: cMarbleCream,
          outline: true,
          outlineColor: cGoldTrim,
          outlineWidth: 2,
        },
      });

      // 4 Corinthian Pillars
      [-bld.width * 0.35, -bld.width * 0.12, bld.width * 0.12, bld.width * 0.35].forEach((px, idx) => {
        const pCoords = makeBoxCoords(bld.cx + px, bld.cy - bld.depth / 2 - 0.5, 1.5, 1.5);
        viewer.entities.add({
          id: `sapthagiri-block-a-pillar-${idx}`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pCoords)),
            height: baseElev,
            extrudedHeight: baseElev + bld.height - 0.5,
            material: cColumnWhite,
            outline: true,
            outlineColor: cGoldTrim.withAlpha(0.5),
            outlineWidth: 1,
          },
        });
      });

      // Distinct Baroque Corner Cupolas (Left & Right roof corners)
      [-bld.width * 0.45, bld.width * 0.45].forEach((cx, idx) => {
        const cupolaCoords = makeBoxCoords(bld.cx + cx, bld.cy - bld.depth * 0.4, 4, 4);
        viewer.entities.add({
          id: `sapthagiri-block-a-cupola-${idx}`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(cupolaCoords)),
            height: baseElev + bld.height,
            extrudedHeight: baseElev + bld.height + 4.5,
            material: cGoldLight,
            outline: true,
            outlineColor: Color.WHITE,
            outlineWidth: 1.5,
          },
        });
      });
    }

    // --- BUILDING 2 (Central Senate & Grand Hall - Block B) ---
    {
      const bld = distinctBuildings[1];
      // Monumental Central Arched Cathedral Bay (Floors 2-11)
      const archCoords = makeBoxCoords(bld.cx, bld.cy - bld.depth / 2 - 0.4, 14, 1.2);
      viewer.entities.add({
        id: 'sapthagiri-block-b-cathedral-arch',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(archCoords)),
          height: baseElev + 5.0,
          extrudedHeight: baseElev + 39.0,
          material: cDarkCathedralGlass.withAlpha(0.92),
          outline: true,
          outlineColor: cGoldLight,
          outlineWidth: 2,
        },
      });

      // Grand Sunburst Rosette Medallion
      const rosetteCoords = makeBoxCoords(bld.cx, bld.cy - bld.depth / 2 - 0.6, 6.5, 1.2);
      viewer.entities.add({
        id: 'sapthagiri-block-b-rosette',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rosetteCoords)),
          height: baseElev + 33.0,
          extrudedHeight: baseElev + 39.5,
          material: cGoldLight,
          outline: true,
          outlineColor: cColumnWhite,
          outlineWidth: 2,
        },
      });

      // Protruding Grand Ceremonial Entrance Portico (Forward entrance with steps)
      const porticoCoords = makeBoxCoords(bld.cx, bld.cy - bld.depth / 2 - 4.0, 20, 8);
      viewer.entities.add({
        id: 'sapthagiri-block-b-grand-portico',
        name: 'Chancellor Ceremonial Grand Entrance Portico',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(porticoCoords)),
          height: baseElev,
          extrudedHeight: baseElev + 8.0,
          material: cMarbleCream,
          outline: true,
          outlineColor: cGoldTrim,
          outlineWidth: 2.5,
        },
      });

      // Grand Portico Entrance Arch Portal
      const entrancePortalCoords = makeBoxCoords(bld.cx, bld.cy - bld.depth / 2 - 7.5, 8, 1);
      viewer.entities.add({
        id: 'sapthagiri-block-b-entrance-portal',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(entrancePortalCoords)),
          height: baseElev,
          extrudedHeight: baseElev + 6.5,
          material: Color.fromCssColorString('#0284c7').withAlpha(0.95),
          outline: true,
          outlineColor: cGoldTrim,
          outlineWidth: 2,
        },
      });

      // Tallest Central Pediment rising to 48.5m
      const pedCoords = makeBoxCoords(bld.cx, bld.cy - 1, bld.width * 0.75, bld.depth * 0.5);
      viewer.entities.add({
        id: 'sapthagiri-block-b-pediment',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pedCoords)),
          height: baseElev + bld.height,
          extrudedHeight: baseElev + bld.pedimentHeight,
          material: cMarbleCream,
          outline: true,
          outlineColor: cGoldTrim,
          outlineWidth: 2.5,
        },
      });

      // Neoclassical Central Golden Dome on Block B
      const domeCoords = makeBoxCoords(bld.cx, bld.cy, 9, 9);
      viewer.entities.add({
        id: 'sapthagiri-block-b-central-dome',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(domeCoords)),
          height: baseElev + bld.pedimentHeight,
          extrudedHeight: baseElev + bld.pedimentHeight + 5.5,
          material: cGoldLight,
          outline: true,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
      });

      // 6 Front Columns along the Senate Facade
      [-bld.width * 0.4, -bld.width * 0.24, -bld.width * 0.08, bld.width * 0.08, bld.width * 0.24, bld.width * 0.4].forEach((px, idx) => {
        const pCoords = makeBoxCoords(bld.cx + px, bld.cy - bld.depth / 2 - 0.5, 1.6, 1.6);
        viewer.entities.add({
          id: `sapthagiri-block-b-pillar-${idx}`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pCoords)),
            height: baseElev,
            extrudedHeight: baseElev + bld.height - 0.5,
            material: cColumnWhite,
            outline: true,
            outlineColor: cGoldTrim.withAlpha(0.5),
            outlineWidth: 1,
          },
        });
      });
    }

    // --- BUILDING 3 (East Clock Tower & Rotunda Wing - Block C) ---
    {
      const bld = distinctBuildings[2];
      // Front Arched Window Bay
      const archCoords = makeBoxCoords(bld.cx, bld.cy - bld.depth / 2 - 0.4, 12, 1.2);
      viewer.entities.add({
        id: 'sapthagiri-block-c-cathedral-arch',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(archCoords)),
          height: baseElev + 7.2,
          extrudedHeight: baseElev + 38.0,
          material: cDarkCathedralGlass.withAlpha(0.92),
          outline: true,
          outlineColor: cGoldLight,
          outlineWidth: 2,
        },
      });

      // Pediment at Roofline
      const pedCoords = makeBoxCoords(bld.cx, bld.cy - 1, bld.width * 0.65, bld.depth * 0.5);
      viewer.entities.add({
        id: 'sapthagiri-block-c-pediment',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pedCoords)),
          height: baseElev + bld.height,
          extrudedHeight: baseElev + bld.pedimentHeight,
          material: cMarbleCream,
          outline: true,
          outlineColor: cGoldTrim,
          outlineWidth: 2,
        },
      });

      // 1. ICONIC SQUARE CLOCK TOWER ON ROOF (Z: 43.2m to 52m)
      const clockTowerCoords = makeBoxCoords(bld.cx, 0, 10, 10);
      viewer.entities.add({
        id: 'sapthagiri-block-c-clock-tower',
        name: 'Sapthagiri Grand Heritage Clock Tower',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(clockTowerCoords)),
          height: baseElev + bld.height,
          extrudedHeight: baseElev + 52.0,
          material: cMarbleCream,
          outline: true,
          outlineColor: cGoldTrim,
          outlineWidth: 2.5,
        },
      });

      // Illuminated Clock Face on Front (facing the road)
      const clockFaceCoords = makeBoxCoords(bld.cx, -5.2, 5.0, 0.4);
      viewer.entities.add({
        id: 'sapthagiri-block-c-clock-face',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(clockFaceCoords)),
          height: baseElev + 46.0,
          extrudedHeight: baseElev + 50.5,
          material: Color.WHITE,
          outline: true,
          outlineColor: Color.fromCssColorString('#0f172a'),
          outlineWidth: 2,
        },
      });

      // Bronze/Gold Pyramidal Spire atop Clock Tower (Z: 52m to 56.5m)
      const spireCoords = makeBoxCoords(bld.cx, 0, 5.2, 5.2);
      viewer.entities.add({
        id: 'sapthagiri-block-c-clock-spire',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(spireCoords)),
          height: baseElev + 52.0,
          extrudedHeight: baseElev + 56.5,
          material: cGoldLight,
          outline: true,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
      });

      // 2. DISTINCT EASTERN SEMICIRCULAR ROTUNDA ON LAWN (Protruding on the East side)
      const rotundaCoords = makeBoxCoords(bld.cx + bld.width / 2 + 5, bld.cy - 6, 12, 12);
      viewer.entities.add({
        id: 'sapthagiri-block-c-rotunda-portico',
        name: 'Sapthagiri Eastern Classical Rotunda Portico',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rotundaCoords)),
          height: baseElev,
          extrudedHeight: baseElev + 11.0,
          material: cMarbleCream,
          outline: true,
          outlineColor: cGoldLight,
          outlineWidth: 2,
        },
      });

      // Rotunda Golden Dome
      const rotundaDomeCoords = makeBoxCoords(bld.cx + bld.width / 2 + 5, bld.cy - 6, 9, 9);
      viewer.entities.add({
        id: 'sapthagiri-block-c-rotunda-dome',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rotundaDomeCoords)),
          height: baseElev + 11.0,
          extrudedHeight: baseElev + 15.5,
          material: cGoldLight,
          outline: true,
          outlineColor: Color.WHITE,
          outlineWidth: 1.5,
        },
      });
    }

    // =========================================================================
    // 4. TWIN ELEVATED SKYWALK BRIDGES (Connecting Blocks A-B and B-C, Floors 5-9)
    // =========================================================================
    // Bridge A-B: West Skybridge
    const bridgeABCoords = makeBoxCoords(-22, 0, 10, 14);
    viewer.entities.add({
      id: 'sapthagiri-skybridge-ab',
      name: 'Sapthagiri West Academic Skybridge (Floors 5-9)',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(bridgeABCoords)),
        height: baseElev + 18.0,
        extrudedHeight: baseElev + 32.4,
        material: cSkybridge.withAlpha(0.95),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 1.5,
      },
    });

    // Bridge B-C: East Skybridge
    const bridgeBCCoords = makeBoxCoords(23, 0, 10, 14);
    viewer.entities.add({
      id: 'sapthagiri-skybridge-bc',
      name: 'Sapthagiri East Chancellor Skybridge (Floors 5-9)',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(bridgeBCCoords)),
        height: baseElev + 18.0,
        extrudedHeight: baseElev + 32.4,
        material: cSkybridge.withAlpha(0.95),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 1.5,
      },
    });

    // =========================================================================
    // 5. TACTICAL FIRST-RESPONDER RESCUE OVERLAY (When isRescueModeActive = true)
    // =========================================================================
    if (isRescueModeActive) {
      // 1. Critical Hazard Beacon atop Floor 3
      viewer.entities.add({
        id: 'sapthagiri-rescue-incident-badge',
        position: Cartesian3.fromDegrees(centerLon, centerLat, baseElev + 3 * floorHeight + 14),
        label: {
          text: 'ðŸš¨ ACTIVE FIRE INCIDENT â€” FLOOR 03 (LAB)\nâš ï¸ 14 OCCUPANTS DETECTED â€¢ TEMP 420Â°C\nâœ… EVACUATE VIA STAIRWELL B (CLEAR)',
          font: 'bold 12px Inter, sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.fromCssColorString('#7f1d1d'),
          outlineWidth: 4,
          showBackground: true,
          backgroundColor: Color.fromCssColorString('#dc2626').withAlpha(0.96),
          backgroundPadding: new Cartesian2(12, 7),
          horizontalOrigin: HorizontalOrigin.CENTER,
          verticalOrigin: VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      // 2. Front Plaza Fire Brigade Incident Command & Triage Staging Area
      const stagingCoords = makeBoxCoords(0, -30, 80, 20);
      viewer.entities.add({
        id: 'sapthagiri-rescue-staging-zone',
        name: 'Fire Brigade Incident Command & Triage Staging Area',
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(stagingCoords)),
          height: baseElev + 0.55,
          extrudedHeight: baseElev + 0.9,
          material: Color.fromCssColorString('#ef4444').withAlpha(0.85),
          outline: true,
          outlineColor: Color.WHITE,
          outlineWidth: 2.5,
        },
      });

      viewer.entities.add({
        id: 'sapthagiri-rescue-staging-badge',
        position: Cartesian3.fromDegrees(centerLon, centerLat - 0.00035, baseElev + 6),
        label: {
          text: 'ðŸš’ INCIDENT COMMAND & TRIAGE STAGING POST',
          font: 'bold 11px Inter, sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.fromCssColorString('#b91c1c'),
          outlineWidth: 3,
          showBackground: true,
          backgroundColor: Color.fromCssColorString('#991b1b').withAlpha(0.92),
          backgroundPadding: new Cartesian2(8, 5),
          horizontalOrigin: HorizontalOrigin.CENTER,
          verticalOrigin: VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      // 3. Green Illuminated Evacuation Route Corridor (from Floor 3 stairs to staging zone)
      const escP1 = toCoords(-20, 0);
      const escP2 = toCoords(0, -10);
      const escP3 = toCoords(0, -28);
      viewer.entities.add({
        id: 'sapthagiri-rescue-evac-corridor',
        polyline: {
          positions: Cartesian3.fromDegreesArrayHeights([
            escP1[0], escP1[1], baseElev + 10.8,
            escP2[0], escP2[1], baseElev + 4.0,
            escP3[0], escP3[1], baseElev + 0.8,
          ]),
          width: 6,
          material: Color.fromCssColorString('#22c55e'),
        },
      });
    }

    console.log(
      `ðŸ›ï¸ Sapthagiri NPS University (3 Distinct 12-storey Buildings) anchored at 13.06746Â°N, 77.50426Â°E (Elevation: ${baseElev.toFixed(1)}m, RescueMode: ${isRescueModeActive})!`
    );
  } catch (err) {
    console.error('Failed to render Sapthagiri Campus Model:', err);
  }
}
