<div align="center">

# 🌐 VOLU-CAD 3D
### 3D ULPIN Generation and Vertical Property Mapping System
**Smart India Hackathon 2026 — Problem Statement SIH26011**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-propertymap--system.web.app-0284c7?style=for-the-badge&logo=firebase)](https://propertymap-system.web.app)
[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=for-the-badge&logo=hackaday)](https://sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26011-blue.svg?style=for-the-badge)](https://sih.gov.in/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-3D_GIS-6B90B5?style=for-the-badge)](https://cesium.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_4EA94B?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

<p align="center">
  <b>Extending traditional 2D land parcel mapping into a high-precision, validated 3D Vertical Property Cadastre for high-rise urban complexes, multi-tier developments, and subsurface assets.</b>
</p>

[Live Application](https://propertymap-system.web.app) •
[Mission & Architecture](#-mission--transformation-pipeline) •
[Key Features](#-core-capabilities) •
[Tech Stack](#-technology-stack) •
[Quick Start](#-quick-start) •
[Demonstration Workflow](#-primary-sih-demonstration-flow)

---

</div>

## 📌 Mission & Transformation Pipeline

Traditional cadastral systems in India and worldwide map land parcels in two dimensions (2D), attributing ownership purely to ground surface boundaries. In modern dense urban infrastructure with multi-story complexes, underground metro/transit networks, and multi-owner high-rises, 2D boundaries fail to resolve volumetric rights, vertical ownership disputes, and emergency rescue access.

**VOLU-CAD 3D** bridges this gap by extending 2D land parcels vertically upward and downward into validated, searchable, and interoperable 3D property volumes with deterministic **3D ULPINs** (Unique Land Parcel Identification Numbers conforming to the Department of Land Resources, Ministry of Rural Development, Government of India standards).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                TRANSFORMATION PIPELINE                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
  2D Cadastral Parcel (Bhoomi / BBMP e-Aasthi)
          ↓
  3D Building Volume (Solid BIM / OpenStreetMap GIS Extrusions)
          ↓
  Floorplan CAD Vectorization & Perimeter Detection (AI / Convex Hull)
          ↓
  Vertical Floor Stratification (Basement $Z < 0$ ... Tower $Z > 0$)
          ↓
  Deterministic 3D ULPIN Generation: ULPIN-IN-KA-2026-B01-F03
          ↓
  3D Topology Conflict Engine (Clashes, Inverted Heights, Encroachments)
          ↓
  Disaster Situational Rescue View (Evacuation Egress & Hazard Zoning)
          ↓
  Digital Property Passport & Public QR Verification Portal (/verify/:id)
```

---

## ✨ Core Capabilities

### 1. 🏗️ Floorplan → 3D Building Studio (SIH MVP)
- **CAD & Floorplan Ingestion**: Upload architectural blueprints, floorplan image scans, or choose from pre-loaded CAD samples (Residential 3BHK, Commercial Office Tower, Penthouse Duplex).
- **Automated Perimeter Detection**: Real-time canvas contour analysis and vertex vectorization to extract structural perimeter footprints with interactive manual corner adjustment.
- **Parametric 3D Stacking**: Configures above-ground floors, subterranean basement levels ($Z < 0$), and floor heights ($m$) to extrude accurate 3D volumetric building solids.
- **Deterministic 3D ULPIN Engine**: Computes standardized 14-to-18 character volumetric identification codes encoded with state code, district, parcel, building, and vertical level indices.

### 2. 🌍 Real Spatial Data & Live User GPS
- **Zero Mock Fallback Mode**: Connected directly to the live OpenStreetMap Overpass GIS API (`https://overpass-api.de/api/interpreter`), fetching real urban building footprints, levels, and boundaries.
- **Browser GPS Integration**: Features a `📍 Live Location` button that requests high-accuracy browser geolocation and animates the Cesium 3D camera to your real street or rooftop.
- **Indian National Cadastral Hubs**: Pre-calibrated spatial navigation presets for key Indian pilot zones:
  - 🇮🇳 **Bengaluru Central**: M.G. Road & Ward 110 (Sampangiram Nagar)
  - 🏛️ **New Delhi**: Connaught Place & Barakhamba Road
  - 🏙️ **Mumbai**: Bandra-Kurla Complex (BKC) Financial District
  - 💻 **Hyderabad**: HITEC City & Cyber Towers

### 3. 🚨 Disaster Rescue & Situational Awareness View
- Instant situational intelligence for first responders (NDRF, State Fire Services, Municipal Ward Officers).
- Highlights high-priority rescue zones (senior citizens, pediatric care, mobility-restricted occupants).
- Visualizes vertical evacuation corridors, external fire escapes, and subsurface utility hazards (substations, gas mains, HVAC ducts).

### 4. 🪪 Digital Property Passport & Public Verification Portal
- **Tamper-Evident Digital Certificate**: Contains complete volumetric parameters:
  - ULPIN & Vertical Property ID (VPID)
  - 3D Coordinates (Lat, Lon, $Z_{\text{min}}$, $Z_{\text{max}}$, Floor Area $m^2$, Volume $m^3$)
  - Ingestion Source Provenance (ISRO Bhuvan, BBMP e-Aasthi, Town Planning Authority)
  - Data Confidence Score & Topology Compliance Status
- **Live Verification (`/verify/:id`)**: Dynamic QR code on each passport opens the public mobile verification portal, allowing instant citizen or banking due-diligence without credential leaks.

### 5. 🛡️ 3D Spatial Topology Validation Engine
Detects and pinpoints critical 3D cadastral violations directly on the globe with volumetric bounding boxes:
- ⚠️ **Multi-Ownership Volumetric Clashes**: Overlapping spatial floor deeds.
- ⚠️ **Vertical Floor Gaps**: Unregistered voids between consecutive levels.
- ⚠️ **Inverted Z-Ranges**: Illogical or corrupted vertical elevations.
- ⚠️ **Cadastral Boundary Encroachments**: Building cantilevers protruding beyond legal parcel lines.

### 6. ⛏️ Sub-Surface Underground Cadastre ($Z < 0$)
- Dedicated subsurface mode with translucent terrain rendering.
- Visualizes basements, foundation pilings, underground parking, and municipal utility networks.

### 7. 🎨 Zero-Overlap Government-Grade UI
- Clean, responsive glassmorphic top header with no horizontal scrollbars.
- Dedicated centered telemetry HUD with real-time citywide metrics.
- Mutually exclusive panel routing: selecting a building opens the deep cadastral inspector without covering camera controls or background layer controls.

---

## 🛠️ Technology Stack

| Layer | Technologies | Role in System |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Component architecture and fast client-side rendering |
| **Styling** | Vanilla Tailwind CSS, Glassmorphism | Government-grade dark/light theme, custom scrollbars, animations |
| **3D GIS Engine** | CesiumJS, WebGL, Cesium OSM 3D Buildings | Photorealistic 3D Earth, terrain elevation, coordinate transformations |
| **Data Engine** | OpenStreetMap Overpass API, Turf.js | Live real spatial building queries and polygon geometric calculations |
| **Backend API** | Node.js, Express | REST API for building intelligence, floorplans, and verification |
| **Database** | MongoDB Atlas (Mongoose) | Persistent storage for parcels, buildings, floors, and audit trails |
| **Authentication** | Firebase Auth | Role-based authorization (Admin, Surveyor, Verifier, Public) |
| **Deployment** | Firebase Hosting | Production global CDN hosting (`propertymap-system.web.app`) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ installed
- **npm**: v9+ installed

### 1. Clone & Install
```bash
git clone https://github.com/Anik-da/SIH-2026.git
cd SIH-2026
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Cesium Ion Access Token (Optional for default tiles)
VITE_CESIUM_ION_ACCESS_TOKEN=your_cesium_token_here

# MongoDB Atlas Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.rnjbssz.mongodb.net/volucad?retryWrites=true&w=majority
MONGODB_DATABASE=volucad

# Live API Base URL (leave blank for local proxy /api)
VITE_API_BASE_URL=
```

### 3. Run Locally
Start the backend API server and frontend development server concurrently:

```bash
# Terminal 1: Start MongoDB / Express Backend API
node server/index.js

# Terminal 2: Start Vite Frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🎬 Primary SIH Demonstration Flow

Follow this benchmark sequence to evaluate the complete end-to-end functionality:

1. **Open Globe & Location Detection**:
   - Access **[https://propertymap-system.web.app](https://propertymap-system.web.app)**.
   - Click **`📍 Live Location`** in bottom camera controls to fly to your live GPS position, or pick **`Bengaluru Central`**.
2. **Inspect 3D Cadastral Structure**:
   - Click any 3D building on the globe (e.g. *B1-A Commercial Skyscraper*).
   - Inspect building details: parcel ID, height, floors, and data confidence score.
3. **Floor Decomposition & Exploded View**:
   - Click **`[View Floors Metadata]`** or click **`Explode`** in the top bar to separate floors into distinct volumetric layers.
   - Select an individual floor (e.g. Floor 3) to view unit-level occupancy and VPID.
4. **Floorplan → 3D Generation**:
   - Click **`Floorplan → 3D`** in the header.
   - Choose a sample CAD floorplan (e.g. *Commercial Office Tower*).
   - Review detected polygon outline, approve vertices, and generate the 3D model.
   - Observe automatic 3D ULPIN generation (`ULPIN-IN-KA-...`).
5. **Disaster Situational Awareness**:
   - Click **`Rescue View`** or open **`Disaster Rescue View`** from the modal.
   - Inspect high-priority rescue units (elderly, infants), fire escape routes, and hazardous storage.
6. **Digital Property Passport & Public Verification**:
   - Click **`[Passport]`** on any verified unit.
   - Scan or click the QR code to open the public verification portal (`/verify/:id`) and view the official digital certificate.
7. **3D Topology Conflict Detection**:
   - Click **`Validation`** in the header to review detected structural clashes.
   - Click **`Locate Conflict in 3D`** to fly the camera directly to highlighted conflict bounding boxes.

---

<div align="center">

**VOLU-CAD 3D — Developed for Smart India Hackathon (SIH) 2026**
*Author: [Anik Das](https://github.com/Anik-da)*

</div>
