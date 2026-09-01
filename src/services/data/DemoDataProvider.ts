import { IDataProvider, ParcelRecord, BuildingRecord, VerticalUnitRecord, ValidationConflictRecord, RealGISAnalytics, SearchResultItem } from './IDataProvider';
import { demoBuilding, demoProperties, demoConflicts } from '../../data/cadastralDemoData';

export class DemoDataProvider implements IDataProvider {
  async getParcels(_bbox: [number, number, number, number]): Promise<ParcelRecord[]> {
    return [
      {
        id: 'demo-parcel-1',
        ulpin: demoBuilding.ulpin,
        surveyNumber: 'SY-108/2A',
        parcelId: 'P-KA-90123',
        pid: 'PID-8842-DEMO',
        areaSqm: 2450.75,
        landUse: 'Commercial / Mixed High Density',
        district: 'Bengaluru Urban',
        taluk: 'Bengaluru South',
        village: 'Vasanth Nagar',
        coordinates: [
          [77.5942, 12.9710],
          [77.5955, 12.9710],
          [77.5955, 12.9722],
          [77.5942, 12.9722],
          [77.5942, 12.9710],
        ],
        provenance: {
          sourceName: 'Demo Mock Provider (Development Mode)',
          sourceType: 'unverified',
          sourceRecordId: 'DEMO-PARCEL-001',
          sourceDate: '2026-01-01T00:00:00Z',
          confidenceScore: 0.50,
          verificationStatus: 'unverified',
        },
      },
    ];
  }

  async getBuildings(_bbox: [number, number, number, number]): Promise<BuildingRecord[]> {
    const floorsCount = demoBuilding.floors.length;
    const maxZ = demoBuilding.floors[floorsCount - 1]?.zMax || 35;

    return [
      {
        id: demoBuilding.id,
        parcelId: 'demo-parcel-1',
        name: demoBuilding.name,
        buildingType: 'Commercial Skyscraper',
        heightM: maxZ,
        floorsCount: floorsCount,
        builtUpAreaSqm: demoBuilding.footprintArea * floorsCount,
        coordinates: demoBuilding.footprint,
        provenance: {
          sourceName: 'Demo Mock Provider (Development Mode)',
          sourceType: 'unverified',
          sourceRecordId: 'DEMO-BLDG-001',
          sourceDate: '2026-01-01T00:00:00Z',
          confidenceScore: 0.50,
          verificationStatus: 'unverified',
        },
      },
    ];
  }

  async getBuildingById(id: string): Promise<BuildingRecord | null> {
    const buildings = await this.getBuildings([0, 0, 0, 0]);
    return buildings.find((b) => b.id === id) || buildings[0];
  }

  async getVerticalUnits(_buildingId: string): Promise<VerticalUnitRecord[]> {
    return demoProperties.map((p, idx) => ({
      id: `demo-unit-${idx}`,
      floorId: p.floorId,
      vpid: p.vpid, // Clearly system-generated in demo
      unitNumber: `Unit ${p.floorNumber}01`,
      propertyType: p.propertyType.toLowerCase().includes('residential') ? 'residential' : 'commercial',
      status: p.status === 'valid' ? 'occupied' : 'vacant',
      zMin: p.zMin,
      zMax: p.zMax,
      areaSqm: p.area,
      volumeCum: p.volume,
      ownerName: p.ownerName || 'State Land Cadastre',
      taxStatus: p.status === 'valid' ? 'Paid' : 'Pending',
      provenance: {
        sourceName: 'Demo Mock Provider (Development Mode)',
        sourceType: 'unverified',
        sourceRecordId: p.vpid,
        sourceDate: '2026-01-01T00:00:00Z',
        confidenceScore: 0.50,
        verificationStatus: 'unverified',
      },
    }));
  }

  async getZoning(_bbox: [number, number, number, number]): Promise<any[]> {
    return [
      {
        zoneCode: 'C-4',
        zoneName: 'Commercial High Intensity Zone',
        maxFsi: 3.75,
        maxHeightM: 60.0,
        permittedUses: ['Retail', 'Office', 'Hospitality'],
        provenance: {
          sourceName: 'Demo Mock Provider',
          sourceType: 'unverified',
          sourceRecordId: 'ZONE-DEMO-C4',
          confidenceScore: 0.5,
          verificationStatus: 'unverified',
        },
      },
    ];
  }

  async getValidationConflicts(_bbox: [number, number, number, number]): Promise<ValidationConflictRecord[]> {
    return demoConflicts.map((c) => ({
      id: c.id,
      conflictType: c.type,
      severity: c.severity === 'HIGH' ? 'critical' : c.severity === 'MEDIUM' ? 'warning' : 'info',
      entityAId: c.vpid,
      entityBId: c.buildingId,
      description: c.description,
      detectedAt: new Date().toISOString(),
      resolved: c.resolved,
      provenance: {
        sourceName: 'Demo Mock Provider',
        sourceType: 'unverified',
        sourceRecordId: c.id,
        confidenceScore: 0.5,
        verificationStatus: 'unverified',
      },
    }));
  }

  async getAnalytics(_bbox: [number, number, number, number]): Promise<RealGISAnalytics> {
    const floorsCount = demoBuilding.floors.length;
    const maxZ = demoBuilding.floors[floorsCount - 1]?.zMax || 35;

    return {
      totalParcels: 1,
      totalBuildings: 1,
      totalVerticalUnits: demoProperties.length,
      totalAreaSqm: demoBuilding.footprintArea * floorsCount,
      landUseBreakdown: [
        { category: 'Commercial', percentage: 60 },
        { category: 'Residential', percentage: 40 },
      ],
      avgBuildingHeightM: maxZ,
      avgFloors: floorsCount,
      verifiedCount: 0,
      pendingCount: demoProperties.length,
      activeConflictCount: demoConflicts.filter((c) => !c.resolved).length,
    };
  }

  async searchProperties(query: string): Promise<SearchResultItem[]> {
    const q = query.toLowerCase();
    const results: SearchResultItem[] = [];

    if (demoBuilding.ulpin.toLowerCase().includes(q) || demoBuilding.name.toLowerCase().includes(q)) {
      results.push({
        id: demoBuilding.id,
        title: demoBuilding.name,
        subtitle: `ULPIN: ${demoBuilding.ulpin}`,
        type: 'building',
        lat: 12.9716,
        lon: 77.5946,
        ulpin: demoBuilding.ulpin,
        provenance: {
          sourceName: 'Demo Mock Provider',
          sourceType: 'unverified',
          sourceRecordId: demoBuilding.id,
          confidenceScore: 0.5,
          verificationStatus: 'unverified',
        },
      });
    }

    return results;
  }
}
