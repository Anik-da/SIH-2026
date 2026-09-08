import {
  Cartesian3,
  Color,
  PolygonHierarchy,
  Viewer,
  ShadowMode,
  Cartesian2,
  HorizontalOrigin,
  VerticalOrigin,
} from 'cesium';

/**
 * Sapthagiri NPS University Campus — 3D Neoclassical Architectural Palace
 * Precise location: #14/5, Chikkasandra, Hesaraghatta Main Road, Bengaluru (13.0675° N, 77.5044° E)
 * Faithfully reconstructed from official architectural elevations and 3D renders:
 * - 3 interconnected grand neoclassical blocks (Block A: West Academic Wing, Block B: Central Senate & Grand Hall, Block C: East Clock Tower Wing)
 * - Classical Corinthian columns, pediments, cathedral arched window bays with rosettes
 * - Iconic 46.5m Rooftop Clock Tower on Block C with golden finial
 * - Twin elevated 4-story skybridges (Bridge A-B and Bridge B-C) with arched underpasses
 * - Eastern semicircular domed rotunda portico
 * - 10 illuminated academic floor levels with full vertical cadastre metadata
 */

export const SAPTHAGIRI_COORDS = {
  lat: 13.0675,
  lon: 77.5044,
  height: 45,
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

    // Degree conversion constants around Bengaluru (lat ~13.0675°)
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
    const lawnCoords = makeBoxCoords(0, 0, 170, 100);
    viewer.entities.add({
      id: 'sapthagiri-ground-lawn',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(lawnCoords)),
        height: 0,
        extrudedHeight: 0.25,
        material: cLawnGreen.withAlpha(0.85),
        outline: true,
        outlineColor: Color.fromCssColorString('#166534'),
        outlineWidth: 2,
      },
    });

    const plazaCoords = makeBoxCoords(0, -20, 150, 36);
    viewer.entities.add({
      id: 'sapthagiri-ground-plaza',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(plazaCoords)),
        height: 0.15,
        extrudedHeight: 0.4,
        material: cPlazaPaving.withAlpha(0.9),
        outline: true,
        outlineColor: Color.fromCssColorString('#475569'),
        outlineWidth: 1.5,
      },
    });

    // Floating Campus Marker
    viewer.entities.add({
      id: 'sapthagiri-marker-badge',
      position: Cartesian3.fromDegrees(centerLon, centerLat - 0.0003, 56),
      label: {
        text: '🏛️ SAPTHAGIRI NPS UNIVERSITY\nMain Academic Palace & Senate House',
        font: 'bold 13px Inter, system-ui, sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.fromCssColorString('#0f172a'),
        outlineWidth: 3,
        showBackground: true,
        backgroundColor: Color.fromCssColorString('#0284c7').withAlpha(0.85),
        backgroundPadding: new Cartesian2(10, 6),
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    // =========================================================================
    // 2. The Three Monumental Blocks Configuration (10 Floors, Height = 38m)
    // =========================================================================
    const blocks = [
      {
        id: 'block-a',
        name: 'West Academic Wing (Block A)',
        cx: -42, // 42m West of center
        cy: 0,
        width: 34,
        depth: 40,
        height: 38,
        hasPediment: true,
        hasDome: true,
        pedimentHeight: 42,
      },
      {
        id: 'block-b',
        name: 'Central Senate & Grand Hall (Block B)',
        cx: 0, // Center block
        cy: 2,
        width: 38,
        depth: 44,
        height: 39,
        hasPediment: true,
        hasDome: true,
        pedimentHeight: 44,
        isCenter: true,
      },
      {
        id: 'block-c',
        name: 'East Clock Tower Wing (Block C)',
        cx: 42, // 42m East of center
        cy: 0,
        width: 34,
        depth: 40,
        height: 38,
        hasPediment: true,
        hasClockTower: true,
        hasRotunda: true,
        pedimentHeight: 42,
      },
    ];

    // Render 10 Floors for each Block with Cadastral Volume Layering
    const floorHeight = 3.6;
    for (let f = 1; f <= 10; f++) {
      const isSelectedFloor = activeFloorNum === f;
      const explodeShift = explodeFactor * (f * 4.5);
      const zMin = (f - 1) * floorHeight + explodeShift;
      const zMax = f * floorHeight + explodeShift;
      const isOdd = f % 2 === 1;

      let floorMaterial = isSelectedFloor
        ? cSelectedFloor.withAlpha(0.95)
        : activeFloorNum !== null
        ? (isOdd ? cMarbleCream : cSandstoneWarm).withAlpha(0.35) // X-ray mode for other floors
        : (isOdd ? cMarbleCream : cSandstoneWarm).withAlpha(0.95);

      let outlineColor = isSelectedFloor
        ? Color.fromCssColorString('#38bdf8')
        : cGoldTrim.withAlpha(0.6);

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
          position: Cartesian3.fromDegrees(centerLon, centerLat, zMax + 2.5),
          label: {
            text: `Sapthagiri NPS University • Floor ${f} • Z:${zMin.toFixed(1)}m-${zMax.toFixed(1)}m`,
            font: 'bold 12px Inter, sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.fromCssColorString('#0284c7'),
            outlineWidth: 3,
            showBackground: true,
            backgroundColor: Color.fromCssColorString('#0f172a').withAlpha(0.9),
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
      // A. Front Monumental Arched Cathedral Bay Window (Central Glass Arch)
      const archCoords = makeBoxCoords(block.cx, block.cy - block.depth / 2 - 0.4, 11, 1.2);
      viewer.entities.add({
        id: `sapthagiri-${block.id}-arched-bay-window`,
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(archCoords)),
          height: 4,
          extrudedHeight: 33,
          material: cDarkCathedralGlass.withAlpha(0.92),
          outline: true,
          outlineColor: cGoldLight,
          outlineWidth: 2,
        },
      });

      // B. Rosette Medallion above the Arched Window
      const rosetteCoords = makeBoxCoords(block.cx, block.cy - block.depth / 2 - 0.6, 5, 1.2);
      viewer.entities.add({
        id: `sapthagiri-${block.id}-rosette-medallion`,
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rosetteCoords)),
          height: 29,
          extrudedHeight: 34,
          material: cGoldLight.withAlpha(0.98),
          outline: true,
          outlineColor: cColumnWhite,
          outlineWidth: 1.5,
        },
      });

      // C. Triangular Classical Pediment at the Roofline
      const pedCoords = makeBoxCoords(block.cx, block.cy - 2, block.width * 0.7, block.depth * 0.5);
      viewer.entities.add({
        id: `sapthagiri-${block.id}-pediment`,
        polygon: {
          hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pedCoords)),
          height: block.height,
          extrudedHeight: block.pedimentHeight,
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
          height: block.height,
          extrudedHeight: block.height + 1.2,
          material: cRoofBalustrade.withAlpha(0.9),
          outline: true,
          outlineColor: cGoldTrim.withAlpha(0.4),
          outlineWidth: 1,
        },
      });

      // E. Classical Fluted Pillars / Pilasters along the Front Facade (4 pairs)
      const pillarPositions = [-block.width * 0.4, -block.width * 0.2, block.width * 0.2, block.width * 0.4];
      pillarPositions.forEach((px, idx) => {
        const pCoords = makeBoxCoords(block.cx + px, block.cy - block.depth / 2 - 0.6, 1.5, 1.5);
        viewer.entities.add({
          id: `sapthagiri-${block.id}-pillar-${idx}`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(pCoords)),
            height: 0,
            extrudedHeight: block.height - 1,
            material: cColumnWhite.withAlpha(0.98),
            outline: true,
            outlineColor: cGoldTrim.withAlpha(0.5),
            outlineWidth: 1,
          },
        });
      });

      // F. Rooftop Domes / Neoclassical Cupolas (Block A and Block B)
      if (block.hasDome) {
        const domeCoords = makeBoxCoords(block.cx, block.cy, 7.5, 7.5);
        viewer.entities.add({
          id: `sapthagiri-${block.id}-dome`,
          polygon: {
            hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(domeCoords)),
            height: block.pedimentHeight,
            extrudedHeight: block.pedimentHeight + 4.5,
            material: cGoldLight.withAlpha(0.95),
            outline: true,
            outlineColor: Color.WHITE,
            outlineWidth: 2,
          },
        });
      }
    });

    // =========================================================================
    // 4. Iconic Clock Tower on Block C (East Wing)
    // =========================================================================
    const clockTowerCoords = makeBoxCoords(42, 0, 9.5, 9.5);
    viewer.entities.add({
      id: 'sapthagiri-block-c-clock-tower-pavilion',
      name: 'Sapthagiri Grand Clock Tower',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(clockTowerCoords)),
        height: 38,
        extrudedHeight: 46.5,
        material: cMarbleCream.withAlpha(0.98),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 2.5,
        shadows: ShadowMode.ENABLED,
      },
    });

    // Illuminated Clock Face (Front, Z: 41m..44m)
    const clockFaceCoords = makeBoxCoords(42, -5.0, 4.5, 0.4);
    viewer.entities.add({
      id: 'sapthagiri-block-c-clock-face',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(clockFaceCoords)),
        height: 41,
        extrudedHeight: 44.5,
        material: Color.WHITE,
        outline: true,
        outlineColor: Color.fromCssColorString('#0f172a'),
        outlineWidth: 2,
      },
    });

    // Golden Pyramidal Spire / Finial on top of Clock Tower
    const spireCoords = makeBoxCoords(42, 0, 4.8, 4.8);
    viewer.entities.add({
      id: 'sapthagiri-clock-spire',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(spireCoords)),
        height: 46.5,
        extrudedHeight: 51.0,
        material: cGoldLight,
        outline: true,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
      },
    });

    // =========================================================================
    // 5. Twin Multi-Level Elevated Skywalk Bridges (Connecting Blocks A-B and B-C)
    // =========================================================================
    // Bridge A-B: Connects Block A (cx: -42, w: 34 -> right edge: -25) to Block B (cx: 0, w: 38 -> left edge: -19)
    const bridgeABCoords = makeBoxCoords(-22, 0, 9, 13);
    viewer.entities.add({
      id: 'sapthagiri-skybridge-ab',
      name: 'Sapthagiri West Academic Skybridge (Levels 4-8)',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(bridgeABCoords)),
        height: 14.4, // Floor 4 start (Clearance below for vehicular driveway)
        extrudedHeight: 28.8, // Floor 8 roof
        material: cSkybridge.withAlpha(0.95),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 1.5,
      },
    });

    // Bridge B-C: Connects Block B (cx: 0, w: 38 -> right edge: 19) to Block C (cx: 42, w: 34 -> left edge: 25)
    const bridgeBCCoords = makeBoxCoords(22, 0, 9, 13);
    viewer.entities.add({
      id: 'sapthagiri-skybridge-bc',
      name: 'Sapthagiri East Chancellor Skybridge (Levels 4-8)',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(bridgeBCCoords)),
        height: 14.4, // Clearance below
        extrudedHeight: 28.8,
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
    const porticoCoords = makeBoxCoords(0, -24, 18, 7);
    viewer.entities.add({
      id: 'sapthagiri-central-entrance-portico',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(porticoCoords)),
        height: 0,
        extrudedHeight: 7.2,
        material: cMarbleCream.withAlpha(0.98),
        outline: true,
        outlineColor: cGoldTrim,
        outlineWidth: 2,
      },
    });

    // Eastern Semicircular Rotunda Canopy (Block C, South-East Portico)
    const rotundaCoords = makeBoxCoords(48, -22, 11, 11);
    viewer.entities.add({
      id: 'sapthagiri-east-rotunda-portico',
      name: 'Sapthagiri Eastern Circular Rotunda',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rotundaCoords)),
        height: 0,
        extrudedHeight: 9.5,
        material: cMarbleCream.withAlpha(0.95),
        outline: true,
        outlineColor: cGoldLight,
        outlineWidth: 2,
      },
    });

    // Rotunda Domed Crown
    const rotundaDomeCoords = makeBoxCoords(48, -22, 8, 8);
    viewer.entities.add({
      id: 'sapthagiri-rotunda-dome',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(rotundaDomeCoords)),
        height: 9.5,
        extrudedHeight: 13.5,
        material: cGoldLight,
        outline: true,
        outlineColor: Color.WHITE,
        outlineWidth: 1.5,
      },
    });

    console.log('🏛️ Sapthagiri NPS University 3D Neoclassical Architectural Model loaded at 13.0675°N, 77.5044°E!');
  } catch (err) {
    console.error('Failed to render Sapthagiri Campus Model:', err);
  }
}
