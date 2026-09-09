import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dns from 'dns';
import { SEED_BUILDINGS, generateFloorsForBuilding, generateVerticalPropertiesForBuilding } from './seedData.js';

// Use Google/Cloudflare Public DNS to bypass local ISP SRV resolution blocks on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/volucad';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'volucad';

async function seedAtlas() {
  console.log('Connecting to MongoDB Atlas...');
  console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
  
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas!');
    const db = client.db(MONGODB_DATABASE);

    // 1. Buildings Collection
    const buildingsCol = db.collection('buildings');
    await buildingsCol.deleteMany({});
    const bldResult = await buildingsCol.insertMany(SEED_BUILDINGS);
    console.log(`Inserted ${bldResult.insertedCount} persistent building documents into MongoDB Atlas [buildings] collection.`);

    // 2. Floors Collection
    const floorsCol = db.collection('floors');
    await floorsCol.deleteMany({});
    let allFloors = [];
    SEED_BUILDINGS.forEach((bld) => {
      allFloors = allFloors.concat(generateFloorsForBuilding(bld));
    });
    const flrResult = await floorsCol.insertMany(allFloors);
    console.log(`Inserted ${flrResult.insertedCount} persistent floor documents into MongoDB Atlas [floors] collection.`);

    // 3. Vertical Properties Collection
    const vpsCol = db.collection('verticalProperties');
    await vpsCol.deleteMany({});
    let allVps = [];
    SEED_BUILDINGS.forEach((bld) => {
      allVps = allVps.concat(generateVerticalPropertiesForBuilding(bld));
    });
    const vpResult = await vpsCol.insertMany(allVps);
    console.log(`Inserted ${vpResult.insertedCount} persistent vertical property documents into MongoDB Atlas [verticalProperties] collection.`);

    // 4. Sources Collection
    const sourcesCol = db.collection('buildingSources');
    await sourcesCol.deleteMany({});
    const allSources = SEED_BUILDINGS.map((bld) => ({
      sourceId: `SRC-${bld.buildingId}-01`,
      buildingId: bld.buildingId,
      sourceName: bld.dataSource,
      sourceUrl: bld.sourceUrls[0] || 'https://bhuvan.nrsc.gov.in',
      sourceType: bld.dataSource === 'BBMP_EAISTHI' ? 'official_government' : 'open_data',
      collectedAt: bld.sourceCollectedAt,
      fieldsExtracted: ['floorCount', 'buildingHeight', 'address', 'buildingType', 'osmTags'],
      confidenceScore: bld.confidence,
      verificationStatus: bld.verificationStatus
    }));
    const srcResult = await sourcesCol.insertMany(allSources);
    console.log(`Inserted ${srcResult.insertedCount} provenance source documents into MongoDB Atlas [buildingSources] collection.`);

    console.log('\n✅ ALL 20+ BENGALURU 3D BUILDINGS ARE NOW PERSISTED IN YOUR MONGODB ATLAS DATABASE!');
  } catch (err) {
    console.error('Atlas Seeding Error:', err.message);
  } finally {
    await client.close();
  }
}

seedAtlas();
