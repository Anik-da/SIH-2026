import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { FloorData } from '@/types';
import type { InspectedObjectData } from './ObjectInspectionModal';
import { FLOOR_HEIGHT } from '@/data/constants';

interface FloorInteriorProps {
  floor: FloorData;
  hasDimming?: boolean;
  onSelectObject?: (info: InspectedObjectData) => void;
}

export function FloorInterior({ floor, hasDimming = false, onSelectObject }: FloorInteriorProps) {
  const opacity = hasDimming ? 0.3 : 1;
  const fid = floor.floorId.toUpperCase();
  const fType = floor.floorType;

  // Reusable materials with rich vibrant colors
  const matWoodDark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.4 }), []);
  const matWoodWarm = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.5 }), []);
  const matOakLight = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.6 }), []);
  const matMetalChrome = useMemo(() => new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8, roughness: 0.2 }), []);
  const matBlackMetal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.7, roughness: 0.3 }), []);
  const matScreenGlow = useMemo(() => new THREE.MeshBasicMaterial({ color: '#38bdf8' }), []);
  const matGreenPlant = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6 }), []);
  const matPotTerracotta = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c2410c', roughness: 0.8 }), []);
  const matSofaLeather = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 }), []);
  const matBlueVelvet = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.4 }), []);
  const matRedChair = useMemo(() => new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 }), []);
  const matWhiteBoard = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 }), []);
  const matGoldAccent = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.9, roughness: 0.2 }), []);

  // Floor G: Grand Lobby & Reception
  if (fid === 'G' || fType === 'ground') {
    return (
      <group position={[0, 0, 0]}>
        {/* Reception Desk */}
        <mesh position={[0, 0.45, 2]} material={matWoodWarm}>
          <boxGeometry args={[3.2, 0.9, 0.8]} />
        </mesh>
        <mesh position={[0, 0.92, 2]} material={matOakLight}>
          <boxGeometry args={[3.4, 0.08, 0.9]} />
        </mesh>
        {/* Monitor & Lamp on desk */}
        <mesh position={[-0.6, 1.15, 2.1]} material={matBlackMetal}>
          <boxGeometry args={[0.6, 0.4, 0.08]} />
        </mesh>
        <mesh position={[-0.6, 1.15, 2.05]} material={matScreenGlow}>
          <boxGeometry args={[0.55, 0.35, 0.01]} />
        </mesh>
        <mesh position={[0.6, 1.1, 2.1]} material={matGoldAccent}>
          <cylinderGeometry args={[0.08, 0.12, 0.3, 12]} />
        </mesh>

        {/* Turnstile Security Gates */}
        <mesh position={[-2.5, 0.5, 0]} material={matMetalChrome}>
          <boxGeometry args={[0.2, 1.0, 1.2]} />
        </mesh>
        <mesh position={[-1.7, 0.5, 0]} material={matMetalChrome}>
          <boxGeometry args={[0.2, 1.0, 1.2]} />
        </mesh>
        <mesh position={[1.7, 0.5, 0]} material={matMetalChrome}>
          <boxGeometry args={[0.2, 1.0, 1.2]} />
        </mesh>
        <mesh position={[2.5, 0.5, 0]} material={matMetalChrome}>
          <boxGeometry args={[0.2, 1.0, 1.2]} />
        </mesh>

        {/* Lounge Sofas & Coffee Table */}
        <mesh position={[-4.5, 0.35, -2]} material={matBlueVelvet}>
          <boxGeometry args={[2.2, 0.7, 1.0]} />
        </mesh>
        <mesh position={[-4.5, 0.25, -0.8]} material={matWoodDark}>
          <boxGeometry args={[1.4, 0.4, 0.8]} />
        </mesh>

        <mesh position={[4.5, 0.35, -2]} material={matBlueVelvet}>
          <boxGeometry args={[2.2, 0.7, 1.0]} />
        </mesh>
        <mesh position={[4.5, 0.25, -0.8]} material={matWoodDark}>
          <boxGeometry args={[1.4, 0.4, 0.8]} />
        </mesh>

        {/* Potted Indoor Plants */}
        <mesh position={[-5.8, 0.4, 3.5]} material={matPotTerracotta}>
          <cylinderGeometry args={[0.3, 0.25, 0.8, 16]} />
        </mesh>
        <mesh position={[-5.8, 1.2, 3.5]} material={matGreenPlant}>
          <sphereGeometry args={[0.55, 16, 16]} />
        </mesh>

        <mesh position={[5.8, 0.4, 3.5]} material={matPotTerracotta}>
          <cylinderGeometry args={[0.3, 0.25, 0.8, 16]} />
        </mesh>
        <mesh position={[5.8, 1.2, 3.5]} material={matGreenPlant}>
          <sphereGeometry args={[0.55, 16, 16]} />
        </mesh>

        {/* Directory Touch Kiosk Screen */}
        <mesh position={[0, 0.9, -3.8]} material={matBlackMetal}>
          <boxGeometry args={[0.8, 1.8, 0.15]} />
        </mesh>
        <mesh position={[0, 1.2, -3.72]} material={matScreenGlow}>
          <boxGeometry args={[0.7, 1.0, 0.02]} />
        </mesh>
      </group>
    );
  }

  // Floor 1: Computer Science & AI Labs
  if (fid === 'F1' || floor.floorNumber === 1) {
    return (
      <group position={[0, 0, 0]}>
        {/* 4 Developer Workstation Rows */}
        {[-3.5, 3.5].map((x) =>
          [-2, 2].map((z) => (
            <group key={`ws-${x}-${z}`} position={[x, 0, z]}>
              {/* Desk */}
              <mesh position={[0, 0.4, 0]} material={matOakLight}>
                <boxGeometry args={[2.4, 0.8, 1.2]} />
              </mesh>
              {/* Monitors */}
              <mesh position={[-0.5, 1.0, 0]} material={matBlackMetal}>
                <boxGeometry args={[0.5, 0.35, 0.05]} />
              </mesh>
              <mesh position={[-0.5, 1.0, -0.02]} material={matScreenGlow}>
                <boxGeometry args={[0.46, 0.3, 0.01]} />
              </mesh>
              <mesh position={[0.5, 1.0, 0]} material={matBlackMetal}>
                <boxGeometry args={[0.5, 0.35, 0.05]} />
              </mesh>
              <mesh position={[0.5, 1.0, -0.02]} material={matScreenGlow}>
                <boxGeometry args={[0.46, 0.3, 0.01]} />
              </mesh>
              {/* Chairs */}
              <mesh position={[0, 0.45, 0.9]} material={matSofaLeather}>
                <cylinderGeometry args={[0.3, 0.3, 0.7, 12]} />
              </mesh>
            </group>
          ))
        )}

        {/* Server Racks with LED lights */}
        <mesh position={[-5.8, 1.2, -3.5]} material={matBlackMetal}>
          <boxGeometry args={[0.8, 2.2, 1.0]} />
        </mesh>
        <mesh position={[-5.8, 1.5, -2.99]} material={matScreenGlow}>
          <boxGeometry args={[0.6, 0.05, 0.01]} />
        </mesh>

        {/* Code Whiteboard */}
        <mesh position={[0, 1.5, -4.3]} material={matWhiteBoard}>
          <boxGeometry args={[3.2, 1.4, 0.05]} />
        </mesh>
      </group>
    );
  }

  // Floor 2: Lecture Halls & Auditoriums
  if (fid === 'F2' || floor.floorNumber === 2) {
    return (
      <group position={[0, 0, 0]}>
        {/* Raised Stage & Speaker Podium */}
        <mesh position={[0, 0.15, -3.2]} material={matWoodDark}>
          <boxGeometry args={[5.5, 0.3, 1.8]} />
        </mesh>
        <mesh position={[0, 0.7, -2.8]} material={matWoodWarm}>
          <boxGeometry args={[0.8, 1.0, 0.5]} />
        </mesh>

        {/* Widescreen Projector Display */}
        <mesh position={[0, 1.8, -4.3]} material={matWhiteBoard}>
          <boxGeometry args={[4.5, 1.8, 0.04]} />
        </mesh>

        {/* 3 Rows of Tiered Auditorium Seating */}
        {[-0.5, 1.2, 2.9].map((z, rowIdx) => (
          <group key={`row-${rowIdx}`} position={[0, rowIdx * 0.25, z]}>
            {[-3.2, -1.6, 0, 1.6, 3.2].map((x) => (
              <mesh key={`seat-${x}`} position={[x, 0.4, 0]} material={matBlueVelvet}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }

  // Floor 3: Central Library & Digital Resource Center
  if (fid === 'F3' || floor.floorNumber === 3) {
    return (
      <group position={[0, 0, 0]}>
        {/* Bookshelves Stacks */}
        {[-4.5, -2.2, 2.2, 4.5].map((x) => (
          <mesh key={`shelf-${x}`} position={[x, 1.2, -1.8]} material={matWoodWarm}>
            <boxGeometry args={[1.0, 2.2, 3.5]} />
          </mesh>
        ))}

        {/* Study Reading Tables with brass lamps */}
        {[-2.5, 2.5].map((x) => (
          <group key={`table-${x}`} position={[x, 0, 2.5]}>
            <mesh position={[0, 0.4, 0]} material={matOakLight}>
              <boxGeometry args={[2.8, 0.8, 1.4]} />
            </mesh>
            <mesh position={[0, 0.95, 0]} material={matGoldAccent}>
              <cylinderGeometry args={[0.05, 0.1, 0.3, 12]} />
            </mesh>
            {[-1, 1].map((cx) => (
              <mesh key={`chair-${cx}`} position={[cx, 0.4, 0.9]} material={matWoodDark}>
                <boxGeometry args={[0.45, 0.6, 0.45]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }

  // Floor 4: Robotics & Innovation Lab
  if (fid === 'F4' || floor.floorNumber === 4) {
    return (
      <group position={[0, 0, 0]}>
        {/* Heavy-duty Industrial Workbenches */}
        {[-3.2, 3.2].map((x) => (
          <group key={`bench-${x}`} position={[x, 0, -1.2]}>
            <mesh position={[0, 0.4, 0]} material={matMetalChrome}>
              <boxGeometry args={[3.2, 0.8, 1.4]} />
            </mesh>
            {/* Oscilloscope / Testing Equipment */}
            <mesh position={[-0.8, 1.0, -0.2]} material={matBlackMetal}>
              <boxGeometry args={[0.6, 0.4, 0.4]} />
            </mesh>
            <mesh position={[-0.8, 1.0, -0.01]} material={matScreenGlow}>
              <boxGeometry args={[0.5, 0.3, 0.01]} />
            </mesh>
          </group>
        ))}

        {/* Robotic Arm Station */}
        <mesh position={[0, 0.5, 2.2]} material={matMetalChrome}>
          <cylinderGeometry args={[0.5, 0.6, 1.0, 16]} />
        </mesh>
        <mesh position={[0, 1.2, 2.2]} material={matGoldAccent}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
        </mesh>
        <mesh position={[0.2, 1.5, 2.2]} material={matBlackMetal}>
          <sphereGeometry args={[0.2, 12, 12]} />
        </mesh>

        {/* 3D Printer Enclosure */}
        <mesh position={[-5.5, 0.7, 2.5]} material={matBlackMetal}>
          <boxGeometry args={[0.9, 1.2, 0.9]} />
        </mesh>
        <mesh position={[-5.5, 0.7, 2.5]} material={matScreenGlow}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
        </mesh>
      </group>
    );
  }

  // Floor 5: Faculty & Department Administration Offices
  if (fid === 'F5' || floor.floorNumber === 5) {
    return (
      <group position={[0, 0, 0]}>
        {/* Private Glass Offices */}
        {[-3.8, 3.8].map((x) => (
          <group key={`office-${x}`} position={[x, 0, 0]}>
            <mesh position={[0, 0.4, -1]} material={matOakLight}>
              <boxGeometry args={[2.2, 0.8, 1.2]} />
            </mesh>
            <mesh position={[0, 0.45, 0.2]} material={matSofaLeather}>
              <cylinderGeometry args={[0.3, 0.3, 0.7, 12]} />
            </mesh>
            <mesh position={[0.8, 0.8, -1.8]} material={matMetalChrome}>
              <boxGeometry args={[0.8, 1.6, 0.5]} />
            </mesh>
          </group>
        ))}

        {/* Central Department Conference Table */}
        <mesh position={[0, 0.4, 1.5]} material={matWoodDark}>
          <boxGeometry args={[3.2, 0.8, 1.5]} />
        </mesh>
        {[-1.2, 0, 1.2].map((cx) => (
          <group key={`conf-chair-${cx}`}>
            <mesh position={[cx, 0.45, 0.5]} material={matSofaLeather}>
              <boxGeometry args={[0.45, 0.7, 0.45]} />
            </mesh>
            <mesh position={[cx, 0.45, 2.5]} material={matSofaLeather}>
              <boxGeometry args={[0.45, 0.7, 0.45]} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // Floor 6: Student Recreation & Activity Lounge
  if (fid === 'F6' || floor.floorNumber === 6) {
    return (
      <group position={[0, 0, 0]}>
        {/* Ping Pong (Table Tennis) Table */}
        <mesh position={[-3.5, 0.4, -0.5]} material={matBlueVelvet}>
          <boxGeometry args={[2.7, 0.75, 1.5]} />
        </mesh>
        <mesh position={[-3.5, 0.8, -0.5]} material={matWhiteBoard}>
          <boxGeometry args={[0.02, 0.2, 1.5]} />
        </mesh>

        {/* Billiards (Pool) Table */}
        <mesh position={[3.5, 0.4, -0.5]} material={matGreenPlant}>
          <boxGeometry args={[2.8, 0.8, 1.6]} />
        </mesh>
        <mesh position={[3.5, 0.82, -0.5]} material={matWoodWarm}>
          <boxGeometry args={[2.9, 0.06, 1.7]} />
        </mesh>

        {/* Modular Lounge Sofa & Coffee Table */}
        <mesh position={[0, 0.35, 2.8]} material={matRedChair}>
          <boxGeometry args={[3.5, 0.7, 1.2]} />
        </mesh>
        <mesh position={[0, 0.25, 1.6]} material={matWoodDark}>
          <boxGeometry args={[2.0, 0.4, 0.8]} />
        </mesh>
      </group>
    );
  }

  // Floor 7: Dean's Suite & Academic Council
  if (fid === 'F7' || floor.floorNumber === 7) {
    return (
      <group position={[0, 0, 0]}>
        {/* Dean's Executive Desk */}
        <mesh position={[-3.8, 0.4, -2]} material={matWoodDark}>
          <boxGeometry args={[2.6, 0.85, 1.3]} />
        </mesh>
        <mesh position={[-3.8, 0.5, -1.1]} material={matSofaLeather}>
          <boxGeometry args={[0.6, 0.9, 0.6]} />
        </mesh>

        {/* Oval Boardroom Table */}
        <mesh position={[2.5, 0.4, 0]} material={matWoodDark}>
          <cylinderGeometry args={[1.6, 1.6, 0.8, 24]} />
        </mesh>
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <mesh key={`bchair-${idx}`} position={[2.5 + Math.cos(rad) * 2.1, 0.45, Math.sin(rad) * 2.1]} material={matSofaLeather}>
              <boxGeometry args={[0.5, 0.7, 0.5]} />
            </mesh>
          );
        })}

        {/* Glass Trophy Display Cabinet */}
        <mesh position={[-5.8, 1.1, 1.5]} material={matMetalChrome}>
          <boxGeometry args={[0.6, 2.0, 2.2]} />
        </mesh>
        <mesh position={[-5.7, 1.2, 1.5]} material={matGoldAccent}>
          <cylinderGeometry args={[0.15, 0.2, 0.4, 12]} />
        </mesh>
      </group>
    );
  }

  // Floor 8: Advanced Physics & Chemistry Research Labs
  if (fid === 'F8' || floor.floorNumber === 8) {
    return (
      <group position={[0, 0, 0]}>
        {/* Chemical-resistant White Lab Benches */}
        {[-3.5, 3.5].map((x) => (
          <group key={`lbench-${x}`} position={[x, 0, 0]}>
            <mesh position={[0, 0.4, 0]} material={matWhiteBoard}>
              <boxGeometry args={[3.4, 0.8, 1.4]} />
            </mesh>
            <mesh position={[0, 0.9, 0]} material={matMetalChrome}>
              <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
            </mesh>
          </group>
        ))}

        {/* Fume Hood Enclosure */}
        <mesh position={[0, 1.1, -3.8]} material={matMetalChrome}>
          <boxGeometry args={[2.5, 2.0, 0.9]} />
        </mesh>
        <mesh position={[0, 1.1, -3.4]} material={matBlueVelvet}>
          <boxGeometry args={[2.2, 1.5, 0.1]} />
        </mesh>
      </group>
    );
  }

  // Floor 9: Multi-Purpose Seminar & Event Hall
  if (fid === 'F9' || floor.floorNumber === 9) {
    return (
      <group position={[0, 0, 0]}>
        {/* Presentation Stage */}
        <mesh position={[0, 0.2, -3.2]} material={matWoodWarm}>
          <boxGeometry args={[6.5, 0.4, 2.0]} />
        </mesh>
        {/* Presentation Screen */}
        <mesh position={[0, 1.8, -4.3]} material={matWhiteBoard}>
          <boxGeometry args={[5.2, 2.0, 0.05]} />
        </mesh>
        {/* Audience Seating */}
        {[-0.8, 0.8, 2.4].map((z, rIdx) => (
          <group key={`srow-${rIdx}`} position={[0, 0, z]}>
            {[-3.5, -2.1, -0.7, 0.7, 2.1, 3.5].map((x) => (
              <mesh key={`schair-${x}`} position={[x, 0.35, 0]} material={matRedChair}>
                <boxGeometry args={[0.55, 0.65, 0.55]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }

  // Floor 10: Chancellor's Boardroom & Executive Suite
  if (fid === 'F10' || floor.floorNumber === 10) {
    return (
      <group position={[0, 0, 0]}>
        {/* Grand Boardroom Table */}
        <mesh position={[0, 0.4, -0.5]} material={matWoodDark}>
          <boxGeometry args={[5.5, 0.85, 2.2]} />
        </mesh>
        {/* Executive Chairs around table */}
        {[-2.2, -1.1, 0, 1.1, 2.2].map((x) => (
          <group key={`echair-${x}`}>
            <mesh position={[x, 0.45, -1.8]} material={matSofaLeather}>
              <boxGeometry args={[0.55, 0.85, 0.55]} />
            </mesh>
            <mesh position={[x, 0.45, 0.8]} material={matSofaLeather}>
              <boxGeometry args={[0.55, 0.85, 0.55]} />
            </mesh>
          </group>
        ))}
        {/* President Chair at head of table */}
        <mesh position={[3.2, 0.45, -0.5]} material={matGoldAccent}>
          <boxGeometry args={[0.65, 0.95, 0.65]} />
        </mesh>

        {/* Private Chancellor Lounge */}
        <mesh position={[-4.5, 0.35, 2.5]} material={matBlueVelvet}>
          <boxGeometry args={[2.5, 0.7, 1.2]} />
        </mesh>
      </group>
    );
  }

  // Floor 11: Sky Lounge & Rooftop Garden
  if (fid === 'F11' || floor.floorNumber === 11 || fType === 'terrace') {
    return (
      <group position={[0, 0, 0]}>
        {/* Pergola Wooden Beams Overhead */}
        {[-3, 0, 3].map((x) => (
          <mesh key={`pbeam-${x}`} position={[x, FLOOR_HEIGHT - 0.2, 0]} material={matWoodWarm}>
            <boxGeometry args={[0.3, 0.25, 7.5]} />
          </mesh>
        ))}

        {/* Outdoor Patio Tables & Chairs */}
        {[-3.2, 3.2].map((x) => (
          <group key={`patio-${x}`} position={[x, 0, -1]}>
            <mesh position={[0, 0.4, 0]} material={matMetalChrome}>
              <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
            </mesh>
            {/* Parasol Umbrella Pole */}
            <mesh position={[0, 1.2, 0]} material={matMetalChrome}>
              <cylinderGeometry args={[0.04, 0.04, 1.6, 12]} />
            </mesh>
            <mesh position={[0, 2.0, 0]} material={matBlueVelvet}>
              <coneGeometry args={[1.2, 0.5, 16]} />
            </mesh>
          </group>
        ))}

        {/* Observatory Telescope on Tripod */}
        <group position={[0, 0, 2.8]}>
          <mesh position={[0, 0.6, 0]} material={matBlackMetal}>
            <cylinderGeometry args={[0.05, 0.35, 1.2, 12]} />
          </mesh>
          <mesh position={[0, 1.3, 0]} rotation={[0.4, 0.3, 0]} material={matMetalChrome}>
            <cylinderGeometry args={[0.15, 0.2, 1.4, 16]} />
          </mesh>
        </group>

        {/* Garden Planters */}
        {[-5, 5].map((x) => (
          <mesh key={`gplanter-${x}`} position={[x, 0.4, 3.2]} material={matGreenPlant}>
            <boxGeometry args={[1.2, 0.8, 1.2]} />
          </mesh>
        ))}
      </group>
    );
  }

  // Basement: Smart Underground Parking & Utility Infrastructure
  if (fType === 'basement') {
    return (
      <group position={[0, 0, 0]}>
        {/* EV Charging Pillars */}
        {[-4, 0, 4].map((x) => (
          <group key={`ev-${x}`} position={[x, 0, -2.5]}>
            <mesh position={[0, 0.75, 0]} material={matScreenGlow}>
              <boxGeometry args={[0.4, 1.5, 0.4]} />
            </mesh>
          </group>
        ))}

        {/* Electrical Transformer Unit */}
        <mesh position={[-5, 0.8, 2.2]} material={matBlackMetal}>
          <boxGeometry args={[1.8, 1.6, 1.4]} />
        </mesh>

        {/* HVAC Ceiling Ducting */}
        <mesh position={[0, FLOOR_HEIGHT - 0.3, 0]} material={matMetalChrome}>
          <boxGeometry args={[11, 0.3, 0.4]} />
        </mesh>
      </group>
    );
  }

  // Default fallback interior for any unhandled floor
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.4, 0]} material={matOakLight}>
        <boxGeometry args={[2.5, 0.8, 1.2]} />
      </mesh>
      <mesh position={[0, 0.45, 1.0]} material={matSofaLeather}>
        <boxGeometry args={[0.5, 0.7, 0.5]} />
      </mesh>
    </group>
  );
}
