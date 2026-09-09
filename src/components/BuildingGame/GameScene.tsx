import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
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
  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 30, 90]} />

      <ambientLight intensity={1.1} />
      <directionalLight
        position={[20, 35, 20]}
        intensity={1.5}
        color="#fff7ed"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={70}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />
      <hemisphereLight args={['#f8fafc', '#334155', 0.8]} />

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
      />

      <Emergency3DView emergency={props.emergency} currentFloorId={props.currentFloorId} />

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
