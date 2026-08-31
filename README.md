<div align="center">

# 🌐 VOLU-CAD 3D
### 3D ULPIN Generation and Vertical Property Mapping System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=for-the-badge&logo=hackaday)](https://sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26011-blue.svg?style=for-the-badge)](https://sih.gov.in/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-3D_GIS-6B90B5?style=for-the-badge)](https://cesium.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

<p align="center">
  <b>Extending traditional 2D land parcel mapping into a high-precision, validated 3D Vertical Property Cadastre.</b>
</p>

[Overview](#-overview) •
[Core Features](#-core-features) •
[Tech Stack](#-technology-stack) •
[System Architecture](#-system-architecture) •
[Demonstration Flow](#-primary-demonstration-flow) •
[Role-Based Access](#-audit--administration)

---

</div>

## 📌 Overview

**VOLU-CAD 3D** is a GIS-powered 3D cadastral platform designed for the **Smart India Hackathon (SIH) 2026** under Problem Statement **SIH26011**. 

Traditional cadastral systems map land in two dimensions (2D), attributing ownership purely to ground boundaries. In modern urban infrastructure with multi-story complexes, subsurface utilities, and multi-owner high-rises, 2D boundaries are insufficient. **VOLU-CAD 3D** bridges this gap by extending 2D land parcels vertically upward and downward into validated, searchable, and interoperable 3D property volumes.

### 🔄 The Core Transformation

```
2D Parcel ──> Building ──> Floors ──> 3D Property Volumes ──> VPID ──> Topology Validation ──> Digital Property Passport
```

The unified platform seamlessly combines geospatial data visualization, vertical property identification (VPID), 3D spatial topology validation, and document verification into a single interoperable environment.

---

## ✨ Core Features

### 1. 🌍 GIS 3D Globe
* **CesiumJS Integration**: Interactive 3D Earth providing true geographic spatial context.
* **Geospatial Layers**: Seamless loading of satellite imagery, digital terrain models (DTM), parcel polygons, and 3D building extrusions.
* **Camera Navigation & Views**: Dynamic switching between 2D orthographic and 3D oblique views with precise geographic coordinates tracking.
* **Layer Management**: Granular control over visibility and opacity for surface and sub-surface spatial layers.

### 2. 🗺️ Cadastral GIS & Hierarchy
* **Hierarchical Modeling**: `Parcel → ULPIN → Building → Vertical Units`.
* **Multi-Building Support**: A single parcel can contain multiple complex building structures.
* **Search & Selection**: Quick lookup by **Parcel ID**, Unique Land Parcel Identification Number (**ULPIN**), or **Building ID** with interactive real-time highlighting on the 3D globe.

### 3. 🏢 Vertical Property Mapping
* **Floor Breakdown**: Vertically divides structures into distinct functional floors (`Basement`, `Ground`, `Floor 1` ... `Floor N`).
* **Volume Generation**: Converts 2D footprints into bounded 3D spatial volumes defined by:
  $$\text{Volume} = \text{Footprint Area} \times (Z_{\text{max}} - Z_{\text{min}})$$
* **Attributes Tracked**: Height ($m$), Footprint Area ($m^2$), Volume ($m^3$), $Z_{\text{min}}$, and $Z_{\text{max}}$.

### 4. 🆔 Vertical Property ID (VPID)
* **Unique Identification**: Generates a standardized, prototype VPID for every floor/volume unit.
  * **Example VPID**: `VP-001-B01-F03`
* **Relational Association**: Directly links the 3D spatial volume to its parent **ULPIN**, **Parcel ID**, **Building ID**, and specific **Floor Level**.

### 5. 🛡️ 3D Topology Validation Engine
Extends 2D GIS topology rules into 3D space to detect critical structural and spatial conflicts:
* ⚠️ **Volume & Floor Overlaps**: Multi-ownership volumetric collisions.
* ⚠️ **Floor Gaps**: Unmapped spatial gaps between adjacent levels.
* ⚠️ **Invalid Z-Ranges**: Inverted or illegal floor height definitions.
* ⚠️ **Parcel Boundary Encroachment**: Buildings or volumetric units extending outside legal parcel bounds.
* ⚠️ **Restricted-Zone & Underground Collisions**: Conflict detection with sub-surface utilities and restricted zones.
* 📍 **In-Globe Visualization**: Real-time 3D bounding box highlights rendering conflicts visually directly on the 3D viewport.

### 6. ⛏️ Underground Cadastre
* **Sub-Surface Mapping**: Represents basements, underground parking, transit hubs, and utility tunnels using negative $Z$ coordinates ($Z < 0$).
* **Underground Mode**: Dedicated visual toggle that renders the ground surface translucent, exposing underground property volumes and infrastructure.

### 7. 📄 Document Verification
* Cross-references uploaded property deeds and physical documents against database attributes and 3D volumetric metrics.
* Displays automated verification statuses:
  * 🟩 **MATCH**: Complete structural & record alignment.
  * 🟨 **WARNING**: Minor discrepancy in area/Z-range parameters.
  * 🟥 **MISMATCH**: Unverified document data or volume collision.

### 8. 🪪 Digital Property Passport
* Comprehensive digital certificate per vertical property unit containing:
  * **Identifiers**: ULPIN, VPID, Parcel ID, Building ID
  * **Volumetric Metrics**: Floor Level, Area ($m^2$), $Z_{\text{min}}$, $Z_{\text{max}}$, Volume ($m^3$)
  * **Audit Metadata**: Data Source, Confidence Score, Topology Validation Status
* **QR Verification**: Built-in public QR verification interface allowing secure validation without exposing confidential owner credentials.

### 9. 📊 Operational Dashboard & Analytics
* **Key Performance Indicators**: Total Parcels, Buildings Count, Vertical Property Volumes, Verified vs. Pending Properties, and Active Conflicts.
* **Spatial Analytics**: Graphical charts (using Recharts) breaking down conflict types, volumetric distributions, and confidence ratings.

### 10. 🚨 Emergency 3D Planning
* Building-level emergency situational awareness for first responders.
* Enables drill-down inspection: `Building → Floor → Basement → Underground Assets → Access Points → Emergency Priority`.
* Provides precise 3D vertical spatial location during rescue and hazard mitigation scenarios.

### 11. 🔒 Audit & Administration
Role-based administrative control supporting distinct user perspectives:
| Role | Capabilities |
| :--- | :--- |
| 🛡️ **ADMIN** | Full system configuration, user management, and rule adjustments |
| 📐 **SURVEY OFFICER** | Property definition, Z-range adjustment, 3D volume modeling |
| ✅ **VERIFICATION OFFICER** | Document matching, conflict resolution, status sign-off |
| 👁️ **VIEWER** | Public query, VPID search, Digital Property Passport viewing |

* **Audit Log**: Immutable event logs for actions such as VPID generation, floor modifications, validation runs, document uploads, and conflict resolutions.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | High-performance React component architecture bundled with Vite |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Modern responsive UI & custom glassmorphism design tokens |
| **3D & GIS Engine** | **CesiumJS** | WebGL 3D globe visualization & spatial coordinate engine |
| **Icons & Charts** | **Lucide React** / **Recharts** | Crisp iconography and interactive data visualizers |
| **Authentication** | ![Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=flat&logo=firebase&logoColor=black) | Secure role-based user authentication |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white) | Document store for parcel records, spatial metadata & audit logs |

---

## 🏗️ System Architecture & Integration Flow

The entire platform operates as **ONE unified end-to-end web application**.

```
                           [ 🔐 Landing / Auth Page ]
                                        │
                                        ▼
                           [ 📊 Central Dashboard ]
                                        │
                                        ▼
                           [ 🌍 3D GIS Globe View ]
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
    [ 📍 Cadastral Parcel ]                               [ ⛏️ Underground Mode ]
             │                                                     │
             ▼                                                     │
       [ 🆔 ULPIN ]                                                │
             │                                                     │
             ▼                                                     │
     [ 🏢 Select Building ]                                        │
             │                                                     │
             ▼                                                     │
  [ 💥 Explode 3D Floors ] ◄───────────────────────────────────────┘
             │
             ▼
  [ 📦 Floor / Volume Unit ] ──> [ 🏷️ Generate VPID ]
             │
             ├──────────────────────────┐
             ▼                          ▼
[ 📐 Z-Min/Z-Max Metrics ]   [ 🛡️ Run 3D Validation ]
                                        │
                                        ▼
                             [ ⚠️ Conflict Detection ]
                                        │
                                        ▼
                             [ 📄 Document Verification ]
                                        │
                                        ▼
                             [ 🪪 Digital Property Passport ]
                                        │
                                        ▼
                             [ 🚨 Emergency & Audit ]
```

---

## 🚀 Primary Demonstration Flow

For SIH evaluators and judges, the benchmark workflow demonstrates the full transition from 2D cadastral records to a validated 3D Vertical Property Model:

- [ ] **1. Open GIS Globe**: Launch the interactive 3D Earth environment.
- [ ] **2. Navigate to Demo Area**: Pan/zoom into the target cadastral region.
- [ ] **3. Select Parcel**: Click on a 2D land parcel boundary polygon.
- [ ] **4. Display ULPIN**: Inspect associated Unique Land Parcel Identification Number.
- [ ] **5. Select Building**: Target a 3D building structure within the parcel.
- [ ] **6. Open 3D Building View**: Focus spatial camera on the 3D structure.
- [ ] **7. Explode Floors**: Trigger the vertical floor separation view.
- [ ] **8. Select a Floor Unit**: Choose a specific volumetric level (e.g., Floor 3).
- [ ] **9. Display VPID**: View generated Vertical Property ID (`VP-001-B01-F03`).
- [ ] **10. Inspect Metrics**: Review $Z_{\text{min}}$, $Z_{\text{max}}$, Footprint Area, and 3D Volume.
- [ ] **11. Execute 3D Validation**: Run the topology engine to evaluate geometry.
- [ ] **12. Detect & Inspect Conflict**: Locate volume overlaps highlighted directly in 3D.
- [ ] **13. Underground Inspection**: Activate Underground Mode to view sub-surface assets ($Z < 0$).
- [ ] **14. Digital Property Passport**: Open the public QR verification passport for the unit.

---

## 🔒 Data Integrity Note

> [!NOTE]
> The prototype utilizes high-fidelity synthetic demo data where real government cadastral datasets or spatial API web services are unavailable. Synthetic datasets are solely for workflow demonstration and do not represent official government land records.

---

<div align="center">

**VOLU-CAD 3D — Developed for Smart India Hackathon (SIH) 2026**

</div>
