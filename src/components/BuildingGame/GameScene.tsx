import { Canvas } from '@react-three/fiber';
import { Environment, Sky } from '@react-three/drei';
import { Building } from '@/components/Building/Building';
import { PlayerController } from '@/components/Player/PlayerController';
import { Emergency3DView, type EmergencyState } from '@/components/Building/EmergencySimulator';
import type { InspectedObjectData } from '@/components/Building/ObjectInspectionModal';
import { building, properties } from '@/data/buildingData';
import { PLAYER_HEIGHT } from '@/data/constants';
import type { PropertyData } from '@/types';

interface GameSceneProps {
  exploded: boolean;
  underground: boolean;
  selectedProperty: PropertyData | null;
  isolated: boolean;
  currentFloorId: string;
  onSelectProperty: (prop: PropertyData) => void;
  onFloorChange: (floorId: string) => void;
  onInteract: () => void;
  targetFloorY: number | null;
  onElevatorArrive: () => void;
  onPlayerPosition: (pos: [number, number, number]) => void;
  playerActive: boolean;
  onSelectObject?: (info: InspectedObjectData) => void;
  emergency?: EmergencyState | null;
}

function SceneContent(props: GameSceneProps) {
  const isTerrace = props.currentFloorId === 'TERRACE' || props.currentFloorId === 'F11';
  const bgSkyColor = isTerrace ? '#38bdf8' : '#0f172a';
  const fogColor = isTerrace ? '#7dd3fc' : '#0f172a';

  return (
    <>
      <color attach="background" args={[bgSkyColor]} />
      <fog attach="fog" args={[fogColor, isTerrace ? 40 : 30, isTerrace ? 180 : 90]} />

      {/* Realistic 3D Sky Dome with Sun and Atmospheric Scattering */}
      <Sky
        distance={450000}
        sunPosition={[100, isTerrace ? 80 : 40, 100]}
        inclination={0.5}
        azimuth={0.25}
        rayleigh={isTerrace ? 0.8 : 0.4}
        turbidity={8}
      />

      <ambientLight intensity={isTerrace ? 1.5 : 1.1} color={isTerrace ? '#f0f9ff' : '#ffffff'} />
      <directionalLight
        position={[20, 45, 20]}
        intensity={isTerrace ? 2.0 : 1.5}
        color="#fff7ed"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={90}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />
      <hemisphereLight args={[isTerrace ? '#38bdf8' : '#f8fafc', '#334155', isTerrace ? 1.0 : 0.8]} />

      <Building
        floors={building.floors}
        properties={properties}
        exploded={props.exploded}
        underground={props.underground}
        selectedProperty={props.selectedProperty}
        isolated={props.isolated}
        currentFloorId={props.currentFloorId}
        onSelectProperty={props.onSelectProperty}
        onSelectObject={props.onSelectObject}
        emergency={props.emergency}
      />

      <PlayerController
        enabled={props.playerActive}
        onFloorChange={props.onFloorChange}
        onInteract={props.onInteract}
        targetFloorY={props.targetFloorY}
        onElevatorArrive={props.onElevatorArrive}
        onPlayerPosition={props.onPlayerPosition}
      />

      <Environment preset="city" />
    </>
  );
}

export function GameScene(props: GameSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, PLAYER_HEIGHT, 8], fov: 70, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
