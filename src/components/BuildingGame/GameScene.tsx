import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Building } from '@/components/Building/Building';
import { PlayerController } from '@/components/Player/PlayerController';
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
}

function SceneContent(props: GameSceneProps) {
  return (
    <>
      <color attach="background" args={['#0a0f1e']} />
      <fog attach="fog" args={['#0a0f1e', 25, 80]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[15, 30, 15]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight args={['#1e3a5f', '#0f172a', 0.3]} />

      <Building
        floors={building.floors}
        properties={properties}
        exploded={props.exploded}
        underground={props.underground}
        selectedProperty={props.selectedProperty}
        isolated={props.isolated}
        currentFloorId={props.currentFloorId}
        onSelectProperty={props.onSelectProperty}
      />

      <PlayerController
        enabled={props.playerActive}
        onFloorChange={props.onFloorChange}
        onInteract={props.onInteract}
        targetFloorY={props.targetFloorY}
        onElevatorArrive={props.onElevatorArrive}
        onPlayerPosition={props.onPlayerPosition}
      />

      <Environment preset="night" />
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
