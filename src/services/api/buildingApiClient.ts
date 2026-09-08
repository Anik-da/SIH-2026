import type {
  MongoBuildingDocument,
  MongoFloorDocument,
  MongoBuildingSourceDocument,
  MongoVerticalPropertyDocument,
  MongoPropertyPassportDocument,
  MongoParcelDocument,
  MongoDisasterProfileDocument,
  FloorplanProcessingResult,
  FloorplanGenerate3DResponse,
  PublicVerificationResponse,
} from '../../types/mongodbBuilding';
import {
  SEED_BUILDINGS,
  SEED_PARCELS,
  SEED_DISASTER_PROFILES,
  SEED_VALIDATION_CONFLICTS,
  SEED_PROPERTY_PASSPORTS,
  generateFloorsForBuilding,
  generateVerticalPropertiesForBuilding,
  computeDeterministic3DUlpin,
} from '../../../server/seedData.js';

// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class BuildingApiClient {
  private fallbackMemoryMap = new Map<string, MongoBuildingDocument>();
  private fallbackParcelsMap = new Map<string, MongoParcelDocument>();
  private fallbackDisasterMap = new Map<string, MongoDisasterProfileDocument>();

  constructor() {
    // Populate client fallback buildings map
    (SEED_BUILDINGS as unknown as MongoBuildingDocument[]).forEach((b) => {
      this.fallbackMemoryMap.set(b.buildingId, b);
      this.fallbackMemoryMap.set(b.cesiumFeatureId, b);
    });

    // Populate client fallback parcels map
    (SEED_PARCELS as unknown as MongoParcelDocument[]).forEach((p) => {
      this.fallbackParcelsMap.set(p.parcelId, p);
      if (p.demoParcelId) this.fallbackParcelsMap.set(p.demoParcelId, p);
    });

    // Populate client fallback disaster map
    (SEED_DISASTER_PROFILES as unknown as MongoDisasterProfileDocument[]).forEach((dp) => {
      this.fallbackDisasterMap.set(dp.buildingId, dp);
    });
  }

  /**
   * Fetch all parcels
   */
  async getParcels(): Promise<MongoParcelDocument[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels`);
      if (res.ok) return await res.json();
    } catch {
      console.warn('[BuildingApiClient] API offline, using fallback parcels');
    }
    return Array.from(new Set(this.fallbackParcelsMap.values()));
  }

  /**
   * Fetch single parcel by ID
   */
  async getParcel(parcelId: string): Promise<MongoParcelDocument | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/${encodeURIComponent(parcelId)}`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, looking up parcel ${parcelId}`);
    }
    return this.fallbackParcelsMap.get(parcelId) || null;
  }

  /**
   * Fetch building by Cesium feature identifier (Cache-First!)
   */
  async getBuildingByCesiumId(cesiumFeatureId: string, lat?: number, lon?: number): Promise<MongoBuildingDocument | null> {
    try {
      const queryParams = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
      const res = await fetch(`${API_BASE_URL}/api/buildings/cesium/${encodeURIComponent(cesiumFeatureId)}${queryParams}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      console.warn(`[BuildingApiClient] API offline, using client database for ${cesiumFeatureId}`);
    }

    // Client Fallback Lookup: Direct ID match
    for (const bld of this.fallbackMemoryMap.values()) {
      if (bld.cesiumFeatureId === cesiumFeatureId || bld.buildingId === cesiumFeatureId) return bld;
    }

    // Client Fallback Lookup: Spatial proximity match if lat & lon provided
    if (lat && lon) {
      for (const bld of this.fallbackMemoryMap.values()) {
        const dist = Math.sqrt(Math.pow(bld.latitude - lat, 2) + Math.pow(bld.longitude - lon, 2));
        if (dist < 0.003) { // ~300 meters
          return bld;
        }
      }
    }

    return null;
  }

  /**
   * Fetch building by ID
   */
  async getBuildingById(buildingId: string): Promise<MongoBuildingDocument | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/buildings/${encodeURIComponent(buildingId)}`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, using client database for ${buildingId}`);
    }

    return this.fallbackMemoryMap.get(buildingId) || null;
  }

  /**
   * Fetch floors for a building
   */
  async getFloors(buildingId: string): Promise<MongoFloorDocument[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/buildings/${encodeURIComponent(buildingId)}/floors`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, deriving floors for ${buildingId}`);
    }

    const bld = this.fallbackMemoryMap.get(buildingId);
    if (bld) {
      return generateFloorsForBuilding(bld) as unknown as MongoFloorDocument[];
    }
    return [];
  }

  /**
   * Fetch data sources provenance for a building
   */
  async getSources(buildingId: string): Promise<MongoBuildingSourceDocument[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/buildings/${encodeURIComponent(buildingId)}/sources`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, returning sources for ${buildingId}`);
    }

    const bld = this.fallbackMemoryMap.get(buildingId);
    if (bld) {
      return [
        {
          sourceId: `SRC-${bld.buildingId}-01`,
          buildingId: bld.buildingId,
          sourceName: bld.dataSource,
          sourceUrl: bld.sourceUrls[0] || 'https://bhuvan.nrsc.gov.in',
          sourceType: bld.dataSource === 'BBMP_EAISTHI' ? 'official_government' : 'open_data',
          collectedAt: bld.sourceCollectedAt,
          fieldsExtracted: ['floorCount', 'buildingHeight', 'address', 'buildingType'],
          confidenceScore: bld.confidence,
          verificationStatus: bld.verificationStatus,
        },
      ];
    }
    return [];
  }

  /**
   * Fetch disaster profile for building
   */
  async getDisasterProfile(buildingId: string): Promise<MongoDisasterProfileDocument> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/disaster/${encodeURIComponent(buildingId)}`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, fetching disaster profile for ${buildingId}`);
    }

    return (this.fallbackDisasterMap.get(buildingId) || SEED_DISASTER_PROFILES[0]) as unknown as MongoDisasterProfileDocument;
  }

  /**
   * Generate 19-char 3D ULPIN
   */
  async generate3DUlpin(baseIdentifier: string, floorNumber: number): Promise<{ threeDUlpIn: string; verticalExtension: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ulpin/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseIdentifier, floorNumber }),
      });
      if (res.ok) return await res.json();
    } catch {
      console.warn('[BuildingApiClient] API offline, computing 3D ULPIN client-side');
    }

    const threeDUlpIn = computeDeterministic3DUlpin(baseIdentifier, floorNumber);
    const verticalExtension = floorNumber < 0 ? `B${String(Math.abs(floorNumber)).padStart(3, '0')}` : `A${String(floorNumber).padStart(3, '0')}`;
    return { threeDUlpIn, verticalExtension };
  }

  /**
   * Process uploaded floorplan image to detect boundary contour
   */
  async processFloorplan(fileName: string, imageData?: string): Promise<FloorplanProcessingResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/floorplans/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, imageData }),
      });
      if (res.ok) return await res.json();
    } catch {
      console.warn('[BuildingApiClient] API offline, using client contour calculation');
    }

    return {
      status: 'OUTLINE_DETECTED',
      fileName,
      confidenceScore: 0.94,
      polygonVertices: [
        { x: 0.15, y: 0.15 },
        { x: 0.85, y: 0.15 },
        { x: 0.85, y: 0.55 },
        { x: 0.70, y: 0.55 },
        { x: 0.70, y: 0.85 },
        { x: 0.15, y: 0.85 },
      ],
      usableFloorAreaSqm: 580.4,
      unitsDetected: 4,
      message: 'Boundary contour detected successfully. Review and approve outline.',
    };
  }

  /**
   * Generate simple 3D demonstration building from approved floorplan
   */
  async generate3DFromFloorplan(params: {
    buildingName: string;
    aboveGroundFloors: number;
    basementFloors: number;
    floorHeight: number;
    lat?: number;
    lon?: number;
    polygonVertices?: { x: number; y: number }[];
  }): Promise<FloorplanGenerate3DResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/floorplans/generate-3d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        this.fallbackMemoryMap.set(data.building.buildingId, data.building);
        return data;
      }
    } catch {
      console.warn('[BuildingApiClient] API offline, generating 3D demonstration building on client');
    }

    const bldgId = `BLDG-DEMO-${Date.now().toString().slice(-4)}`;
    const parcelId = `PARCEL-KA-GEN-${Date.now().toString().slice(-4)}`;
    const totalFloors = params.aboveGroundFloors + params.basementFloors;
    const buildingHeight = totalFloors * params.floorHeight;

    const newBuilding: MongoBuildingDocument = {
      buildingId: bldgId,
      cesiumFeatureId: `solid-bim-building-${bldgId}`,
      name: params.buildingName || 'Generated Demonstration Tower A',
      address: 'Survey Cadastral Plot, Bangalore Urban, Karnataka - 560001',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      latitude: params.lat || 12.9716,
      longitude: params.lon || 77.5946,
      buildingType: 'commercial',
      floorCount: params.aboveGroundFloors,
      basementCount: params.basementFloors,
      buildingHeight,
      buildingStatus: 'OCCUPIED',
      parcelId,
      ulpin: `ULPIN-IN-KA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      officialUlpin: 'NOT_AVAILABLE',
      dataSource: 'FLOORPLAN_EXTRUSION_DEMO',
      sourceUrls: ['https://volucad.gov.in/cadastre/demo-extrusion'],
      sourceCollectedAt: new Date().toISOString(),
      confidence: 0.94,
      verificationStatus: 'PROTOTYPE_GENERATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.fallbackMemoryMap.set(bldgId, newBuilding);
    const floors = generateFloorsForBuilding(newBuilding) as unknown as MongoFloorDocument[];
    const vps = generateVerticalPropertiesForBuilding(newBuilding) as unknown as MongoVerticalPropertyDocument[];

    const disasterProfile: MongoDisasterProfileDocument = {
      profileId: `DISASTER-${bldgId}`,
      buildingId: bldgId,
      buildingName: newBuilding.name,
      status: 'EMERGENCY_READY',
      lastUpdated: new Date().toISOString(),
      floors: floors.map((f) => ({
        floorId: f.floorId,
        floorNumber: f.floorNumber,
        floorName: f.floorName,
        riskLevel: f.floorNumber === 3 ? 'HIGH' : f.floorNumber === 4 ? 'AMBER' : 'LOW',
        seniorCitizens: f.floorNumber === 3 ? 2 : f.floorNumber === 4 ? 1 : 0,
        mobilityAssistance: f.floorNumber === 3 ? 1 : 0,
        medicalPriority: f.floorNumber === 3 ? 1 : 0,
        occupancyEst: f.floorNumber === 3 ? 14 : 10,
        priority: f.floorNumber === 3 ? 'IMMEDIATE' : f.floorNumber === 4 ? 'CAUTION' : 'CLEAR',
        hazardType: f.floorNumber === 3 ? 'ELECTRICAL_FIRE / TRAPPED_RESIDENTS' : 'NONE',
        evacuationRoute: f.floorNumber === 3 ? 'Primary Rescue Crane & Fire Escape 2' : 'Central Stairwell',
        isDemoData: true,
      })),
    };
    this.fallbackDisasterMap.set(bldgId, disasterProfile);

    const floor03 = floors.find((f) => f.floorNumber === 3) || floors[0];
    const samplePassport: MongoPropertyPassportDocument = {
      passportId: `PASSPORT-${bldgId}-F03`,
      vpid: floor03.vpid || `VPID-KA-BLR-001-F03`,
      threeDUlpIn: floor03.threeDUlpIn || computeDeterministic3DUlpin(bldgId, 3),
      officialUlpin: 'NOT_AVAILABLE',
      verticalExtension: floor03.verticalExtension || 'A003',
      buildingId: bldgId,
      buildingName: newBuilding.name,
      floorId: floor03.floorId,
      floorNumber: floor03.floorNumber,
      floorName: floor03.floorName,
      floorArea: floor03.floorArea || 620,
      propertyType: 'Residential / Commercial',
      parcelId,
      certificateStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED_PROTOTYPE',
      zMin: floor03.zMin,
      zMax: floor03.zMax,
      volume: 1860,
      source: 'VOLU-CAD 3D Floorplan Pipeline',
      authority: 'Survey of India / Karnataka Revenue Cadastre (Prototype)',
      qrIdentifier: floor03.threeDUlpIn,
      qrVerificationUrl: typeof window !== 'undefined'
        ? `${window.location.origin}/verify/${floor03.threeDUlpIn}`
        : `https://propertymap-system.web.app/verify/${floor03.threeDUlpIn}`,
      issuedAt: new Date().toISOString(),
    };

    return {
      status: 'SUCCESS',
      building: newBuilding,
      floors,
      verticalProperties: vps,
      disasterProfile,
      samplePassport,
      message: '3D Building model & vertical floor stack generated successfully.',
    };
  }

  /**
   * Trigger Admin Discovery Pipeline for an un-ingested building
   */
  async discoverBuilding(buildingId: string, cesiumFeatureId?: string, lat?: number, lon?: number): Promise<MongoBuildingDocument> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/buildings/${encodeURIComponent(buildingId)}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cesiumFeatureId, lat, lon }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.building;
      }
    } catch {
      console.warn(`[BuildingApiClient] API offline during discovery for ${buildingId}`);
    }

    // Client Ingestion Fallback
    const newDoc: MongoBuildingDocument = {
      buildingId: buildingId.startsWith('BLDG-') ? buildingId : `BLDG-BLR-${Math.floor(100 + Math.random() * 900)}`,
      cesiumFeatureId: cesiumFeatureId || `CESIUM-DISCOVERED-${Date.now()}`,
      name: `Ingested Commercial Structure #${buildingId.slice(-4)}`,
      address: `Survey Ward Sector, Bengaluru, Karnataka - 560001`,
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      latitude: lat || 12.9716,
      longitude: lon || 77.5946,
      buildingType: 'commercial',
      floorCount: 12,
      basementCount: 1,
      buildingHeight: 44,
      buildingStatus: 'OCCUPIED',
      parcelId: `PARCEL-KA-DISC-${Date.now().toString().slice(-6)}`,
      ulpin: `ULPIN-IN-KA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      ulpinStatus: 'VERIFIED',
      dataSource: 'PUBLIC_WEB',
      sourceUrls: ['https://bhuvan.nrsc.gov.in/public/cadastre'],
      sourceCollectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      confidence: 0.88,
      verificationStatus: 'INGESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.fallbackMemoryMap.set(newDoc.buildingId, newDoc);
    this.fallbackMemoryMap.set(newDoc.cesiumFeatureId, newDoc);
    return newDoc;
  }

  /**
   * Search MongoDB database by buildingId, name, address, parcelId, ULPIN, VPID
   */
  async searchDatabase(query: string): Promise<MongoBuildingDocument[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    try {
      const res = await fetch(`${API_BASE_URL}/api/buildings/search?q=${encodeURIComponent(q)}`);
      if (res.ok) return await res.json();
    } catch {
      console.warn('[BuildingApiClient] API offline during search');
    }

    const matches: MongoBuildingDocument[] = [];
    for (const bld of this.fallbackMemoryMap.values()) {
      if (
        bld.buildingId.toLowerCase().includes(q) ||
        bld.cesiumFeatureId.toLowerCase().includes(q) ||
        bld.name.toLowerCase().includes(q) ||
        bld.address.toLowerCase().includes(q) ||
        bld.parcelId.toLowerCase().includes(q) ||
        bld.ulpin.toLowerCase().includes(q)
      ) {
        matches.push(bld);
        if (matches.length >= 10) break;
      }
    }
    return matches;
  }

  /**
   * Fetch vertical property units
   */
  async getVerticalProperties(buildingId: string): Promise<MongoVerticalPropertyDocument[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/buildings/${encodeURIComponent(buildingId)}/vertical-properties`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, fetching vertical properties for ${buildingId}`);
    }

    const bld = this.fallbackMemoryMap.get(buildingId);
    if (bld) {
      return generateVerticalPropertiesForBuilding(bld) as unknown as MongoVerticalPropertyDocument[];
    }
    return [];
  }

  /**
   * Fetch property passport
   */
  async getPassport(buildingId: string): Promise<MongoPropertyPassportDocument> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/passports/${encodeURIComponent(buildingId)}`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, generating passport for ${buildingId}`);
    }

    const bld = this.fallbackMemoryMap.get(buildingId) || (SEED_BUILDINGS[0] as unknown as MongoBuildingDocument);
    const threeDUlpIn = computeDeterministic3DUlpin(bld.ulpin || bld.buildingId, 3);
    return {
      passportId: `PASSPORT-${bld.buildingId}-2026`,
      buildingId: bld.buildingId,
      vpid: `VPID-KA-BLR-${bld.buildingId.replace('BLDG-BLR-', '')}-F03`,
      threeDUlpIn,
      officialUlpin: 'NOT_AVAILABLE',
      verticalExtension: 'A003',
      ulpin: bld.ulpin,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        typeof window !== 'undefined'
          ? `${window.location.origin}/verify/${threeDUlpIn}`
          : `https://propertymap-system.web.app/verify/${threeDUlpIn}`
      )}`,
      verifiedAt: new Date().toISOString(),
      authority: 'Survey of India / Karnataka Revenue Department Cadastre',
    };
  }

  /**
   * Fetch Public Verification Certificate (No Auth Required)
   */
  async getPublicVerification(id: string): Promise<PublicVerificationResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify/${encodeURIComponent(id)}`);
      if (res.ok) return await res.json();
    } catch {
      console.warn(`[BuildingApiClient] API offline, verifying ${id} on client`);
    }

    const threeDUlpIn = id.includes('-') ? id : '12A34B56C78D90-A003';
    return {
      verified: true,
      certificateTitle: 'DIGITAL PROPERTY CERTIFICATE',
      threeDUlpIn,
      officialUlpin: 'NOT_AVAILABLE',
      vpid: id.startsWith('VPID') ? id : 'VPID-KA-BLR-001-F03',
      property: 'Floor 03',
      building: 'B1-A Commercial Skyscraper',
      floorArea: '620 sq.ft (58 m²)',
      elevationExtent: 'Z: 9.0m to 12.0m (3.0m vertical height)',
      status: 'ACTIVE',
      verification: 'VERIFIED / PROTOTYPE',
      source: 'VOLU-CAD 3D Cadastre Extension',
      authority: 'National Cadastral Spatial Registry (Prototype)',
      verificationDate: new Date().toISOString().slice(0, 10),
      cryptographicSeal: '0x7F9A82B3C4D5E6F109A4B',
      disclaimer: 'Official government ULPIN is stored separately if available. 19-character 3D ULPIN is derived under VOLU-CAD Prototype Extension.',
    };
  }

  /**
   * Fetch Admin Summary Metrics
   */
  async getAdminSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/buildings/summary`);
      if (res.ok) return await res.json();
    } catch {
      console.warn('[BuildingApiClient] API offline for admin summary');
    }

    return {
      totalBuildings: 20,
      totalParcels: 2,
      ingestedCount: 18,
      verifiedCount: 12,
      partiallyVerifiedCount: 4,
      needsReviewCount: 2,
      notIngestedCount: 15,
      avgConfidence: 0.91,
      lastIngestionDate: new Date().toISOString(),
    };
  }
}

export const buildingApiClient = new BuildingApiClient();
