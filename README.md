<div align="center">

# 🌐 3D ULPIN — Vertical Property Mapping System
### Volumetric Cadastre, 3D Building Exploration & Geo-Spatial Digital Passports
**Smart India Hackathon 2026 — Problem Statement SIH26011**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-propertymap--system.web.app-0284c7?style=for-the-badge&logo=firebase)](https://propertymap-system.web.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Meghna6111%2F3D--ULPIN--Vertical--Property--Mapping-181717?style=for-the-badge&logo=github)](https://github.com/Meghna6111/3D-ULPIN-Vertical-Property-Mapping)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-3D_GIS-6B90B5?style=for-the-badge)](https://cesium.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

<p align="center">
  <b>Extending traditional 2D land parcel mapping into a high-precision, validated 3D Vertical Property Cadastre for high-rise urban complexes, multi-tier developments, and subsurface assets.</b>
</p>

[Live Application](https://propertymap-system.web.app) •
[Mission & Pipeline](#-mission--transformation-pipeline) •
[Core Features](#-core-capabilities) •
[Tech Stack](#-technology-stack) •
[Local Setup](#-quick-start) •
[Environment Variables](#-environment-configuration)

---

</div>

## 📌 Mission & Transformation Pipeline

Traditional cadastral systems map land parcels in two dimensions (2D), attributing ownership purely to ground surface boundaries. In modern dense urban infrastructure with multi-story complexes, underground transit networks, and multi-owner high-rises, 2D boundaries fail to resolve volumetric rights, vertical ownership disputes, and emergency rescue access.

**3D ULPIN Vertical Property Mapping System** bridges this gap by extending 2D land parcels vertically upward and downward into validated, searchable, and interoperable 3D property volumes with deterministic **3D ULPINs** (Unique Land Parcel Identification Numbers conforming to the Department of Land Resources, Ministry of Rural Development, Government of India standards).

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
  Vertical Floor Stratification (Basement Z < 0 ... Tower Z > 0)
          ↓
  Deterministic 3D ULPIN Generation: ULPIN-IN-KA-2026-B01-F03
          ↓
  3D Topology Conflict Engine (Clashes, Inverted Heights, Encroachments)
          ↓
  Disaster Situational Rescue View (Evacuation Egress, Siren FX & Hazard Zoning)
          ↓
  Digital Property Passport & Public QR Verification Portal (/verify/:id)
```

---

## ✨ Core Capabilities

### 1. 🏢 3D Building Simulation & First-Person Explorer
- **Realistic 3D Interior & Exterior Exploration**: Navigate multi-floor buildings with first-person keyboard (WASD / Arrow keys), D-Pad, touch controls, or mouse look.
- **Elevator System & Floor Teleportation**: Multi-stop interactive elevator panel to move seamlessly between basement, ground floor, commercial levels, and top terrace.
- **Dynamic 3D Sky & Atmosphere**: Realistic open sky dome with Rayleigh scattering, daylight sunlight, atmospheric haze, and open top-floor terrace views.

### 2. 🏗️ Floorplan → 3D Building Studio
- **Blueprints & Vectorization**: Upload architectural blueprints or choose from pre-loaded CAD samples (Residential 3BHK, Commercial Office Tower, Penthouse Duplex).
- **Automated Perimeter Contour Analysis**: Real-time canvas contour analysis and vertex vectorization to extract structural perimeter footprints with corner adjustment.
- **Parametric 3D Volumetric Extrusion**: Configure above-ground floors, subterranean basement levels ($Z < 0$), and floor heights ($m$) to extrude accurate 3D volumetric building solids.

### 3. 🌍 GIS Globe & Real Spatial Elevation
- **Live OpenStreetMap & Cesium Integration**: Render real urban building footprints, 3D tiles, and terrain.
- **Sapthagiri NPS University Campus Model**: Photorealistic, multi-layer 3D campus model anchored flush to terrain with foundation plinths.
- **Indian National Cadastral Hubs**: Fast spatial navigation presets for key pilot zones (Bengaluru Central, New Delhi CP, Mumbai BKC, Hyderabad HITEC City).

### 4. 🚨 Emergency Disaster Simulator & First-Responder View
- Instant situational intelligence for first responders (NDRF, State Fire Services, Municipal Ward Officers).
- Highlights high-priority emergency floors with flashing warning strobes, evacuation egress guidance arrows, alarm sirens, and hazard zoning.

### 5. 🪪 Digital Property Passport & Public Verification Portal
- **Tamper-Evident Digital Certificates**: Complete volumetric parameters (3D ULPIN, VPID, 3D Bounding Coordinates, Volume $m^3$).
- **Public Verification (`/verify/:id`)**: Dynamic QR code on each passport opens the public mobile verification portal.

### 6. 🛡️ 3D Spatial Topology Validation Engine
- Detects multi-ownership volumetric clashes, vertical floor gaps, inverted Z-ranges, and parcel boundary encroachments.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **3D Graphics & GIS Engine**: Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`, CesiumJS
- **Backend API**: Node.js, Express, MongoDB Atlas / In-Memory Store Fallback
- **Deployment**: Firebase Hosting (`propertymap-system.web.app`)

---

## 🔒 Environment Configuration

Copy `.env.example` to `.env` and set your credentials:

```bash
# Cesium Ion Token (Required for 3D Photorealistic Tiles & Terrain)
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token_here

# Backend API Configuration
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DATABASE=volucad
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

---

<div align="center">
  <b>Developed for Smart India Hackathon 2026 — Ministry of Rural Development & DoLR</b>
</div>
