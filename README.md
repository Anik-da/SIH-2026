<div align="center">

# 🌐 3D ULPIN — Vertical Property Mapping & Volumetric Cadastre Platform
### High-Precision 3D GIS Building Explorer, Subsurface Cadastre & Geo-Spatial Digital Passports
**Smart India Hackathon 2026 — Problem Statement SIH26011**

[![Live Application](https://img.shields.io/badge/Live%20Demo-propertymap--system.web.app-0284c7?style=for-the-badge&logo=firebase)](https://propertymap-system.web.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-3D--ULPIN--Vertical--Property--Mapping-181717?style=for-the-badge&logo=github)](https://github.com/Meghna6111/3D-ULPIN-Vertical-Property-Mapping)
[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=for-the-badge&logo=hackaday)](https://sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26011-blue.svg?style=for-the-badge)](https://sih.gov.in/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-3D_GIS-6B90B5?style=for-the-badge)](https://cesium.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

<p align="center">
  <b>Extending traditional 2D land parcel mapping into a high-precision, validated 3D Vertical Property Cadastre for high-rise urban complexes, multi-tier developments, and subsurface assets.</b>
</p>

[🌐 Live Application](https://propertymap-system.web.app) •
[📌 Executive Summary](#-executive-summary) •
[🔄 Transformation Pipeline](#-transformation-pipeline) •
[📐 3D ULPIN Standard](#-deterministic-3d-ulpin-standard) •
[✨ Key Features](#-core-capabilities) •
[🛠️ Tech Stack](#%EF%B8%8F-technology-stack) •
[🚀 Local Setup](#-quick-start) •
[📡 API Reference](#-api-specification)

---

</div>

## 📌 Executive Summary

Traditional cadastral systems map land parcels in two dimensions (2D), attributing ownership purely to ground surface boundaries. In modern dense urban infrastructure with multi-story complexes, underground transit networks, and multi-owner high-rises, 2D boundaries fail to resolve volumetric rights, vertical ownership disputes, tax assessments, and emergency rescue access.

**3D ULPIN Vertical Property Mapping System** bridges this gap by extending 2D land parcels vertically upward and downward into validated, searchable, and interoperable 3D property volumes with deterministic **3D ULPINs** (Unique Land Parcel Identification Numbers conforming to Department of Land Resources, Ministry of Rural Development standards).

---

## 🔄 Transformation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   VOLUMETRIC CADASTRE PIPELINE                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

   2D Cadastral Parcel Data (Bhoomi / e-Aasthi / Land Records)
                              │
                              ▼
   OpenStreetMap & Cesium 3D Tile Ingestion (Overpass API Live Query)
                              │
                              ▼
   2D Blueprint Vectorization & Corner Contour Detection (Convex Hull & Contour Extraction)
                              │
                              ▼
   Parametric 3D Volumetric Extrusion (Subsurface Z < 0 ... Aboveground Z > 0)
                              │
                              ▼
   Deterministic 3D ULPIN Encoding (ULPIN-IN-KA-2026-B01-F03-U02)
                              │
                              ▼
   3D Spatial Topology Validation (Clashes, Voids, Inverted Z-Ranges, Cantilevers)
                              │
                              ▼
   Disaster Situational Rescue View (Fire Strobes, Evacuation Routes & Alarm Sirens)
                              │
                              ▼
   Digital Property Passports & Public QR Verification Portal (/verify/:vpid)
```

---

## 📐 Deterministic 3D ULPIN Standard

The 3D ULPIN is a unique, standardized volumetric identification code generated deterministically from spatial coordinates and vertical hierarchy:

$$\text{3D ULPIN} = \text{STATE} - \text{DIST} - \text{PARCEL} - \text{BLDG} - \text{FLOOR} - \text{UNIT}$$

### Code Format Specification:
- **State & District Prefix**: `IN-KA` (Karnataka) / `IN-DL` (Delhi) / `IN-MH` (Maharashtra)
- **Parcel Identifier**: 14-character Bhuvan / Bhoomi Geo-Hash code
- **Building Index**: `B01` ... `B99`
- **Floor Hierarchy**: `B02` (Basement 2), `G00` (Ground Floor), `F01`–`F10` (Tower Floors), `TRC` (Terrace)
- **Volumetric Bounding Specs**: $[X_{\text{min}}, Y_{\text{min}}, Z_{\text{min}}] \times [X_{\text{max}}, Y_{\text{max}}, Z_{\text{max}}]$ in meters ($m$) relative to MSL (Mean Sea Level).

---

## ✨ Core Capabilities

### 1. 🏢 First-Person 3D Building Explorer & Simulator
- **Interactive First-Person Controls**: Explore buildings using keyboard (WASD / Arrow Keys), D-Pad, touch controls, or mouse look ($360^\circ$).
- **Multi-Stop Elevator Simulator**: Functional 3D elevator shaft with elevator panel interface for smooth vertical floor navigation.
- **Dynamic 3D Sky Dome & Atmosphere**: Photorealistic open sky dome (`<Sky />`) rendered with Rayleigh scattering, daylight sunlight, soft horizon fog (`#7dd3fc`), and unobstructed $360^\circ$ top-floor terrace views.
- **Double-Sided Solid Architectural Walls**: Custom `DoubleSide` lighting materials preventing see-through wall glitches from exterior and interior camera angles.

### 2. 🏗️ Blueprint → 3D Building Studio
- **CAD Blueprint Ingestion**: Upload architectural blueprints or select pre-loaded CAD samples (Residential 3BHK, Commercial Office Tower, Penthouse Duplex).
- **Automated Contour Detection**: Real-time vertex vectorization and canvas contour extraction with manual corner adjustment.
- **Parametric Volumetric Extrusion**: Customize aboveground floors, subterranean basement levels ($Z < 0$), floor heights ($m$), and wall thicknesses.

### 3. 🌍 GIS Globe & Sapthagiri NPS Campus Elevation Model
- **Live OpenStreetMap & Cesium 3D Tiles**: Connected directly to the live OpenStreetMap Overpass GIS API (`https://overpass-api.de/api/interpreter`).
- **Sapthagiri NPS University Campus Elevation**: Pre-cached multi-building campus model with multi-point elevation sampling and subterranean foundation plinths preventing ground clipping.
- **Indian National Spatial Presets**: Instant spatial fly-to navigation for key pilot zones:
  - 🇮🇳 **Bengaluru Central**: M.G. Road & Ward 110 (Sampangiram Nagar)
  - 🏛️ **New Delhi**: Connaught Place & Barakhamba Road
  - 🏙️ **Mumbai**: Bandra-Kurla Complex (BKC) Financial District
  - 💻 **Hyderabad**: HITEC City & Cyber Towers

### 4. 🚨 Emergency Disaster Simulator & Situational Egress View
- First-responder emergency view for NDRF, Fire Services, and Municipal Officers.
- Highlights emergency floor zones with flashing red warning strobes, evacuation egress guidance arrows, evacuation pathing, and alarm audio sirens.

### 5. 🪪 Digital Property Passport & Public Verification Portal
- **Tamper-Evident Digital Certificate**: Complete volumetric metadata:
  - 3D ULPIN & Vertical Property ID (VPID)
  - 3D Coordinates ($Lat, Lon, Z_{\text{min}}, Z_{\text{max}}$, Floor Area $m^2$, Volume $m^3$)
  - Ingestion Source Provenance (ISRO Bhuvan, BBMP e-Aasthi, Town Planning Authority)
- **Public Verification (`/verify/:id`)**: Scan dynamic QR code to access mobile public verification portal for banking due diligence and citizen verification.

### 6. 🛡️ 3D Spatial Topology Validation Engine
Detects and highlights critical 3D cadastral violations directly on the globe with volumetric bounding boxes:
- ⚠️ **Multi-Ownership Volumetric Clashes**: Overlapping spatial floor deeds.
- ⚠️ **Vertical Floor Gaps**: Unregistered voids between consecutive levels.
- ⚠️ **Inverted Z-Ranges**: Illogical or corrupted vertical elevations.
- ⚠️ **Cadastral Boundary Encroachments**: Building cantilevers protruding beyond legal parcel lines.

### 7. ⛏️ Sub-Surface Underground Cadastre ($Z < 0$)
- Subsurface mode with translucent terrain rendering.
- Visualizes basements, foundation pilings, underground parking, metro tunnels, and municipal utility networks.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Icons** | Tailwind CSS, Lucide React Icons |
| **3D Rendering Engine** | Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei` |
| **GIS & Globe Engine** | CesiumJS, OpenStreetMap Overpass API |
| **Backend API** | Node.js, Express, MongoDB Atlas / In-Memory Store Fallback |
| **Cloud Hosting** | Firebase Hosting (`propertymap-system.web.app`) |

---

## 🔒 Environment Configuration

Copy `.env.example` to `.env` and set your credentials:

```bash
# Cesium Ion Token (Required for 3D Photorealistic Tiles & Terrain)
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token_here

# Backend API Configuration
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DATABASE=cosmoplot
```

> ⚠️ **Security Notice**: All sensitive credentials and API keys are stored securely in environment variables (`.env`) and are **never** committed to public version control.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Meghna6111/3D-ULPIN-Vertical-Property-Mapping.git
cd 3D-ULPIN-Vertical-Property-Mapping
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

### 5. Start Backend Server (Optional for Local MongoDB)
```bash
npm run server
```

---

## 📡 API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/parcels` | `GET` | Retrieve 2D & 3D cadastral land parcels |
| `/api/buildings` | `GET / POST` | Fetch and create volumetric 3D building models |
| `/api/buildings/:id/floors` | `GET` | Get vertical floor stratification & 3D ULPINs |
| `/api/verify/:vpid` | `GET` | Retrieve public property passport for QR verification |
| `/api/disaster/simulate` | `POST` | Trigger emergency disaster profile & egress routes |

---

<div align="center">
  <b>Developed for Smart India Hackathon 2026 — Ministry of Rural Development & DoLR</b>
</div>
