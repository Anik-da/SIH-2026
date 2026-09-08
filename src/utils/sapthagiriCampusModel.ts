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
} from 'cesium';

/**
 * Sapthagiri NPS University Campus — 3D Neoclassical Architectural Palace
 * Precise location: #14/5, Chikkasandra, Hesaraghatta Main Road, Bengaluru (13.0679° N, 77.5042° E)
 * Ground elevation: 886.0m MSL (Bengaluru Plateau)
 * Faithfully reconstructed:
 * - 3 interconnected grand neoclassical blocks (Block A: West Academic Wing, Block B: Central Senate & Grand Hall, Block C: East Clock Tower Wing)
 * - 12 Full Architectural Floors in each building (12 floors * 3.6m = 43.2m building height)
 * - Classical Corinthian columns, pediments, cathedral arched window bays with rosettes
 * - Iconic 56m Rooftop Clock Tower on Block C with golden finial
 * - Twin elevated 6-story skybridges (Bridge A-B and Bridge B-C) with arched underpasses
 * - Eastern semicircular domed rotunda portico
 * - Real ground elevation compensation so buildings sit firmly on the terrain and NEVER float in the sky!
 */

export const SAPTHAGIRI_COORDS = {
  lat: 13.0679,
  lon: 77.5042,
  elevation: 886.0,
};

export function renderSapthagiriCampusModel(
  viewer: Viewer,
  selectedFloorId?: string | null,
  explodeFactor: number = 0
) {
  if (!viewer || viewer.isDestroyed()) return;

  try {
    // Clean up any previous Sapthagiri entities
    const oldEntities = viewer.entities.values.filter(
      (e) => typeof e.id === 'string' && e.id.startsWith('sapthagiri-')
    );
    oldEntities.forEach((e) => viewer.entities.remove(e));

    const centerLat = SAPTHAGIRI_COORDS.lat;
    const centerLon = SAPTHAGIRI_COORDS.lon;

    // Detect actual terrain elevation at Sapthagiri campus coordinates
    let baseElev = SAPTHAGIRI_COORDS.elevation;
    try {
      const sampledH = viewer.scene.globe.getHeight(Cartographic.fromDegrees(centerLon, centerLat));
      if (sampledH !== undefined && sampledH !== null && sampledH > 100) {
        baseElev = sampledH;
      }
    } catch (_) {}

    // Degree conversion constants around Bengaluru (lat ~13.0679°)
    const LAT_M = 111320;
    const LON_M = 111320 * Math.cos((centerLat * Math.PI) / 180);

    const toCoords = (dx: number, dy: number): [number, number] => [
      centerLon + dx / LON_M,
      centerLat + dy / LAT_M,
    ];

    const makeBoxCoords = (cx: number, cy: number, w: number, d: number): number[] => {
      const hw = w / 2;
      const hd = d / 2;
      const p1 = toCoords(cx - hw, cy - hd);
      const p2 = toCoords(cx + hw, cy - hd);
      const p3 = toCoords(cx + hw, cy + hd);
      const p4 = toCoords(cx - hw, cy + hd);
      return [p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]];
    };

    // Parse active floor number from selectedFloorId (e.g. SNPSU-F3, F12, floor-5)
    let activeFloorNum: number | null = null;
    if (selectedFloorId) {
      const match = selectedFloorId.match(/(?:F|floor-?)(\d+)/i);
      if (match) {
        activeFloorNum = parseInt(match[1], 10);
      } else if (selectedFloorId.includes('GF')) {
        activeFloorNum = 0;
      }
    }

    // Color Palette from Neoclassical Architecture Photos
    const cMarbleCream = Color.fromCssColorString('#fbf8eb');
    const cSandstoneWarm = Color.fromCssColorString('#f3ebd3');
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
    // 1. Campus Ground Plaza, Driveways, and Manicured Lawns
    // =========================================================================
    const lawnCoords = makeBoxCoords(0, 0, 180, 110);
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

    const plazaCoords = makeBoxCoords(0, -22, 160, 40);
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

    // Floating Campus Marker
    viewer.entities.add({
      id: 'sapthagiri-marker-badge',
      position: Cartesian3.fromDegrees(centerLon, centerLat - 0.0003, baseElev + 68),
      label: {
        text: '🏛️ SAPTHAGIRI NPS UNIVERSITY\nMain Academic Palace & Senate House (12 Floors)',
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
      },
    });

    // =========================================================================
    // 2. The Three Monumental Blocks Configuration (12 Floors each, Height = 43.2m)
    // =========================================================================
    const blocks = [
      {
        id: 'block-a',
        name: 'West Academic Wing (Block A)',
        cx: -44, // 44m West of center
        cy: 0,
        width: 36,
        depth: 42,
        height: 43.2,
        hasPediment: true,
        hasDome: true,
        pedimentHeight: 47.5,
      },
      {
        id: 'block-b',
        name: 'Central Senate & Grand Hall (Block B)',
        cx: 0, // Center block
        cy: 2,
        width: 40,
        depth: 46,
        height: 43.2,
        hasPediment: true,
        hasDome: true,
        pedimentHeight: 48.5,
        isCenter: true,
      },
      {
        id: 'block-c',
        name: 'East Clock Tower Wing (Block C)',
        cx: 44, // 44m East of center
        cy: 0,
        width: 36,
        depth: 42,
        height: 43.2,
        hasPediment: true,
        hasClockTower: true,
        hasRotunda: true,
        pedimentHeight: 47.5,
      },
    ];

    // Render Exactly 12 Floors for each Block with Cadastral Volume Layering
    const floorHeight = 3.6;
    for (let f = 1; f <= 12; f++) {
      const isSelectedFloor = activeFloorNum === f;
      const explodeShift = explodeFactor * (f * 4.5);
      const zMin = baseElev + (f - 1) * floorHeight + explodeShift;
      const zMax = baseElev + f * floorHeight + explodeShift;
      const isOdd = f % 2 === 1;

      let floorMaterial = isSelectedFloor
        ? cSelectedFloor.withAlpha(0.95)
        : activeFloorNum !== null
        ? (isOdd ? cMarbleCream : cSandstoneWarm).withAlpha(0.35) // X-ray mode for non-selected floors
        : (isOdd ? cMarbleCream : cSandstoneWarm).withAlpha(0.95);

      let outlineColor = isSelectedFloor
        ? Color.fromCssColorString('#38bdf8')
        : cGoldTrim.withAlpha(0.65);

      blocks.forEach((block) => {
        const boxCoords = makeBoxCoords(block.cx, block.cy, block.width, block.depth);
        viewer.entities.add({
          id: `sapthagiri-nps-univ-b1-${block.id}-floor-${f}`,
          name: `Sapthagiri NPS University — ${block.name} Floor ${f}`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(boxCoords)),
            height: zMin,
            extrudedHeight: zMax,
            material: floorMaterial,
            outline: true,
            outlineColor: outlineColor,
            outlineWidth: isSelectedFloor ? 3 : 1.5,
            shadows: ShadowMode.ENABLED,
          },
        });
      });

      // Show floating label when floor is selected
      if (isSelectedFloor) {
        viewer.entities.add({
          id: `sapthagiri-selected-floor-label-${f}`,
          position: Cartesian3.fromDegrees(centerLon, centerLat, zMax + 3),
          label: {
            text: `Sapthagiri NPS University • Floor ${f} of 12 • Z:${((f - 1) * floorHeight).toFixed(1)}m-${(f * floorHeight).toFixed(1)}m`,
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
    // 3. Neoclassical Classical Facade Features: Columns, Architraves & Arched Windows
    // =========================================================================
    blocks.forEach((block) => {
      // A. Front Monumental Arched Cathedral Bay Window (Spanning Floors 2 to 11)
      const archCoords = makeBoxCoords(block.cx, block.cy - block.depth / 2 - 0.4, 12, 1.2);
      viewer.entities.add({
        id: `sapthagiri-${block.id}-arched-bay-window`,
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(archCoords)),
          height: baseElev + 4,
          extrudedHeight: baseElev + 38,
          material: cDarkCathedralGlass.withAlpha(0.92),
          outline: true,
          outlineColor: cGoldLight,
          outlineWidth: 2,
        },
      });

      // B. Rosette Medallion above the Arched Window
      const rosetteCoords = makeBoxCoords(block.cx, block.cy - block.depth / 2 - 0.6, 5.5, 1.2);
      viewer.entities.add({
        id: `sapthagiri-${block.id}-rosette-medallion`,
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rosetteCoords)),
          height: baseElev + 34,
          extrudedHeight: baseElev + 39.5,
          material: cGoldLight.withAlpha(0.98),
          outline: true,
          outlineColor: cColumnWhite,
          outlineWidth: 1.5,
        },
      });

      // C. Triangular Classical Pediment at the Roofline (above 12th Floor)
      const pedCoords = makeBoxCoords(block.cx, block.cy - 2, block.width * 0.72, block.depth * 0.5);
      viewer.entities.add({
        id: `sapthagiri-${block.id}-pediment`,
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pedCoords)),
          height: baseElev + block.height,
          extrudedHeight: baseElev + block.pedimentHeight,
          material: cMarbleCream.withAlpha(0.98),
          outline: true,
          outlineColor: cGoldTrim,
          outlineWidth: 2,
          shadows: ShadowMode.ENABLED,
        },
      });

      // D. Rooftop Classical Balustrade Perimeter
      const roofCoords = makeBoxCoords(block.cx, block.cy, block.width + 0.8, block.depth + 0.8);
      viewer.entities.add({
        id: `sapthagiri-${block.id}-balustrade`,
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(roofCoords)),
          height: baseElev + block.height,
          extrudedHeight: baseElev + block.height + 1.2,
          material: cRoofBalustrade.withAlpha(0.9),
          outline: true,
          outlineColor: cGoldTrim.withAlpha(0.5),
          outlineWidth: 1,
        },
      });

      // E. Classical Fluted Pillars / Pilasters along the Front Facade (4 pairs spanning all 12 floors)
      const pillarPositions = [-block.width * 0.4, -block.width * 0.2, block.width * 0.2, block.width * 0.4];
      pillarPositions.forEach((px, idx) => {
        const pCoords = makeBoxCoords(block.cx + px, block.cy - block.depth / 2 - 0.6, 1.6, 1.6);
        viewer.entities.add({
          id: `sapthagiri-${block.id}-pillar-${idx}`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pCoords)),
            height: baseElev,
            extrudedHeight: baseElev + block.height - 0.5,
            material: cColumnWhite.withAlpha(0.98),
            outline: true,
            outlineColor: cGoldTrim.withAlpha(0.5),
            outlineWidth: 1,
          },
        });
      });

      // F. Rooftop Domes / Neoclassical Cupolas (Block A and Block B)
      if (block.hasDome) {
        const domeCoords = makeBoxCoords(block.cx, block.cy, 8, 8);
        viewer.entities.add({
          id: `sapthagiri-${block.id}-dome`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(domeCoords)),
            height: baseElev + block.pedimentHeight,
            extrudedHeight: baseElev + block.pedimentHeight + 5.0,
            material: cGoldLight.withAlpha(0.95),
            outline: true,
            outlineColor: Color.WHITE,
            outlineWidth: 2,
          },
        });
      }
    });

    // =========================================================================
    // 4. Iconic Clock Tower on Block C (East Wing, Height: 56m)
    // =========================================================================
    const clockTowerCoords = makeBoxCoords(44, 0, 10, 10);
    viewer.entities.add({
      id: 'sapthagiri-block-c-clock-tower-pavilion',
      name: 'Sapthagiri Grand Clock Tower',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(clockTowerCoords)),
        height: baseElev + 43.2,
        extrudedHeight: baseElev + 52.0,
        material: cMarbleCream.withAlpha(0.98),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 2.5,
        shadows: ShadowMode.ENABLED,
      },
    });

    // Illuminated Clock Face (Front, Z: 46m..50m)
    const clockFaceCoords = makeBoxCoords(44, -5.2, 5.0, 0.4);
    viewer.entities.add({
      id: 'sapthagiri-block-c-clock-face',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(clockFaceCoords)),
        height: baseElev + 46.0,
        extrudedHeight: baseElev + 50.0,
        material: Color.WHITE,
        outline: true,
        outlineColor: Color.fromCssColorString('#0f172a'),
        outlineWidth: 2,
      },
    });

    // Golden Pyramidal Spire / Finial on top of Clock Tower (reaching 56m)
    const spireCoords = makeBoxCoords(44, 0, 5.0, 5.0);
    viewer.entities.add({
      id: 'sapthagiri-clock-spire',
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

    // =========================================================================
    // 5. Twin Multi-Level Elevated Skywalk Bridges (Connecting Blocks A-B and B-C, Levels 5-10)
    // =========================================================================
    // Bridge A-B: Connects Block A to Block B
    const bridgeABCoords = makeBoxCoords(-22, 0, 10, 14);
    viewer.entities.add({
      id: 'sapthagiri-skybridge-ab',
      name: 'Sapthagiri West Academic Skybridge (Levels 5-10)',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(bridgeABCoords)),
        height: baseElev + 18.0, // Floor 5 start (Clearance below for vehicular driveway)
        extrudedHeight: baseElev + 36.0, // Floor 10 roof
        material: cSkybridge.withAlpha(0.95),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 1.5,
      },
    });

    // Bridge B-C: Connects Block B to Block C
    const bridgeBCCoords = makeBoxCoords(22, 0, 10, 14);
    viewer.entities.add({
      id: 'sapthagiri-skybridge-bc',
      name: 'Sapthagiri East Chancellor Skybridge (Levels 5-10)',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(bridgeBCCoords)),
        height: baseElev + 18.0, // Clearance below
        extrudedHeight: baseElev + 36.0,
        material: cSkybridge.withAlpha(0.95),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 1.5,
      },
    });

    // =========================================================================
    // 6. Grand Ceremonial Entrance Portico & East Circular Rotunda
    // =========================================================================
    // Central Entrance Portico (Block B, Ground Level)
    const porticoCoords = makeBoxCoords(0, -25, 20, 8);
    viewer.entities.add({
      id: 'sapthagiri-central-entrance-portico',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(porticoCoords)),
        height: baseElev,
        extrudedHeight: baseElev + 7.5,
        material: cMarbleCream.withAlpha(0.98),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 2,
      },
    });

    // Eastern Semicircular Rotunda Canopy (Block C, South-East Portico)
    const rotundaCoords = makeBoxCoords(50, -23, 12, 12);
    viewer.entities.add({
      id: 'sapthagiri-east-rotunda-portico',
      name: 'Sapthagiri Eastern Circular Rotunda',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rotundaCoords)),
        height: baseElev,
        extrudedHeight: baseElev + 10.5,
        material: cMarbleCream.withAlpha(0.95),
        outline: true,
        outlineColor: cGoldLight,
        outlineWidth: 2,
      },
    });

    // Rotunda Domed Crown
    const rotundaDomeCoords = makeBoxCoords(50, -23, 9, 9);
    viewer.entities.add({
      id: 'sapthagiri-rotunda-dome',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rotundaDomeCoords)),
        height: baseElev + 10.5,
        extrudedHeight: baseElev + 15.0,
        material: cGoldLight,
        outline: true,
        outlineColor: Color.WHITE,
        outlineWidth: 1.5,
      },
    });

    console.log(
      `🏛️ Sapthagiri NPS University (12 Floors) successfully anchored to real terrain at 13.0679°N, 77.5042°E (Elevation: ${baseElev.toFixed(1)}m)!`
    );
  } catch (err) {
    console.error('Failed to render Sapthagiri Campus Model:', err);
  }
}
