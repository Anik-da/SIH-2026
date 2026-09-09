import { useCallback, useEffect, useState } from 'react';
import { GameScene } from './GameScene';
import { StartScreen } from '@/components/StartScreen/StartScreen';
import { HUD } from '@/components/HUD/HUD';
import { PropertyPanel } from '@/components/PropertyPanel/PropertyPanel';
import { FloorExplorer } from '@/components/FloorExplorer/FloorExplorer';
import { ElevatorPanel } from '@/components/Elevator/ElevatorPanel';
import { GISTransition } from '@/components/Transition/GISTransition';
import { InteractionPrompt } from '@/components/HUD/InteractionPrompt';
import { ArrivalNotification } from '@/components/HUD/ArrivalNotification';
import { ObjectInspectionModal, type InspectedObjectData } from '@/components/Building/ObjectInspectionModal';
import { EmergencyHUDBanner, type EmergencyState, type EmergencyType } from '@/components/Building/EmergencySimulator';
import { useGameState } from '@/hooks/useGameState';
import { building, properties } from '@/data/buildingData';
import { FLOOR_NUMBER_MAP, FLOOR_HEIGHT, BUILDING_DIMENSIONS } from '@/data/constants';
import type { BuildingGameDemoProps, PropertyData } from '@/types';

import { usePlayerControls } from '@/hooks/usePlayerControls';

type Phase = 'start' | 'entering' | 'playing' | 'gis-transition';

const ELEVATOR_X = 0;
const ELEVATOR_Z = -BUILDING_DIMENSIONS.depth / 2 + 2.5;
const ELEVATOR_RADIUS = 3.5;
const ENTRANCE_Z = BUILDING_DIMENSIONS.depth / 2;
const ENTRANCE_RADIUS = 3.5;
const PROPERTY_RADIUS = 5.5;

export function BuildingGameDemo({ onOpenGISGlobe, onOpenPropertyPassport, onBackToHome }: BuildingGameDemoProps) {
  const [phase, setPhase] = useState<Phase>('start');
  const [showHint, setShowHint] = useState(true);
  const [promptMessage, setPromptMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [targetFloorY, setTargetFloorY] = useState<number | null>(null);
  const [arrivalFloor, setArrivalFloor] = useState('');
  const [enteredBuilding, setEnteredBuilding] = useState(true);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 1.7, 4]);
  const [nearProperty, setNearProperty] = useState<PropertyData | null>(null);
  const [inspectedObject, setInspectedObject] = useState<InspectedObjectData | null>(null);
  const [emergency, setEmergency] = useState<EmergencyState | null>(null);

  const game = useGameState();
  const { setControlState } = usePlayerControls();

  const triggerRandomEmergency = useCallback(() => {
    const floorIds = ['G', 'F1', 'F2', 'F3', 'F4', 'F5'];
    const randomFloor = floorIds[Math.floor(Math.random() * floorIds.length)];
    const types: ('FIRE' | 'ELECTRICAL' | 'GAS')[] = ['FIRE', 'ELECTRICAL', 'GAS'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    setEmergency({
      isActive: true,
      floorId: randomFloor,
      type: randomType,
      floorName: `Floor ${randomFloor}`,
      description: `CRITICAL ALERT: ${randomType} HAZARD detected on Floor ${randomFloor}! Initiate Evacuation!`,
    });
  }, []);

  // Periodic random emergency trigger (every 75 seconds)
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      // 60% chance to trigger random emergency periodically
      if (Math.random() < 0.6) {
        triggerRandomEmergency();
      }
    }, 75000);
    return () => clearInterval(interval);
  }, [phase, triggerRandomEmergency]);

  const handleEvacuate = useCallback(() => {
    if (!emergency) return;
    const floorNum = FLOOR_NUMBER_MAP[emergency.floorId] ?? 0;
    const targetY = floorNum * FLOOR_HEIGHT;
    setTargetFloorY(targetY);
    game.setCurrentFloorId(emergency.floorId);
  }, [emergency, game]);

  const handleEnter = useCallback(() => {
    setPhase('entering');
    setEnteredBuilding(true);
    setTimeout(() => {
      setPhase('playing');
      setShowHint(true);
    }, 600);
  }, []);

  const handleFloorChange = useCallback((floorId: string) => {
    game.setCurrentFloorId(floorId);
  }, [game]);

  const handlePlayerPosition = useCallback((pos: [number, number, number]) => {
    setPlayerPos(pos);
  }, []);

  // Proximity detection effect
  useEffect(() => {
    if (phase !== 'playing') return;
    const [px, , pz] = playerPos;

    // Check entrance proximity (only before entering)
    if (!enteredBuilding) {
      const distToEntrance = Math.sqrt(px * px + (pz - ENTRANCE_Z) * (pz - ENTRANCE_Z));
      if (distToEntrance < ENTRANCE_RADIUS) {
        setPromptMessage('PRESS E TO ENTER PROPERTY');
        setShowPrompt(true);
        return;
      } else {
        setShowPrompt(false);
        return;
      }
    }

    // Check elevator proximity
    const distToElevator = Math.sqrt((px - ELEVATOR_X) ** 2 + (pz - ELEVATOR_Z) ** 2);
    if (distToElevator < ELEVATOR_RADIUS && !game.elevatorOpen) {
      setPromptMessage('PRESS E TO USE ELEVATOR');
      setShowPrompt(true);
      return;
    }

    // Check property proximity
    const currentFloor = building.floors.find((f) => f.floorId === game.currentFloorId);
    if (currentFloor) {
      const floorProps = properties.filter((p) => p.floorId === game.currentFloorId);
      let foundProp: PropertyData | null = null;
      for (const prop of floorProps) {
        const dx = px - prop.position[0];
        const dz = pz - prop.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < PROPERTY_RADIUS) {
          foundProp = prop;
          break;
        }
      }
      if (foundProp && !game.selectedProperty) {
        setNearProperty(foundProp);
        setPromptMessage('PRESS E TO INSPECT PROPERTY');
        setShowPrompt(true);
        return;
      }
    }

    setNearProperty(null);
    if (!game.elevatorOpen) {
      setShowPrompt(false);
    }
  }, [phase, playerPos, enteredBuilding, game.elevatorOpen, game.currentFloorId, game.selectedProperty]);

  const handleInteract = useCallback(() => {
    if (phase !== 'playing') return;

    if (!enteredBuilding) {
      // Enter building
      setEnteredBuilding(true);
      setShowPrompt(false);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 5000);
      return;
    }

    // Elevator
    const [px, , pz] = playerPos;
    const distToElevator = Math.sqrt((px - ELEVATOR_X) ** 2 + (pz - ELEVATOR_Z) ** 2);
    if (distToElevator < ELEVATOR_RADIUS && !game.elevatorOpen) {
      game.setElevatorOpen(true);
      setShowPrompt(false);
      return;
    }

    // Property
    if (nearProperty && !game.selectedProperty) {
      game.selectProperty(nearProperty);
      setShowPrompt(false);
    }
  }, [phase, enteredBuilding, playerPos, game, nearProperty]);

  const handleSelectProperty = useCallback((prop: PropertyData) => {
    game.selectProperty(prop);
  }, [game]);

  const handleSelectFloor = useCallback((floorId: string) => {
    const floorNum = FLOOR_NUMBER_MAP[floorId];
    const targetY = floorNum * FLOOR_HEIGHT;
    setTargetFloorY(targetY);
    game.setElevatorOpen(false);
  }, [game]);

  const handleElevatorArrive = useCallback(() => {
    const floorId = Object.entries(FLOOR_NUMBER_MAP).find(([, num]) => {
      return Math.round(targetFloorY! / FLOOR_HEIGHT) === num;
    })?.[0] ?? 'G';
    game.setCurrentFloorId(floorId);
    setArrivalFloor(floorId);
    setTargetFloorY(null);
  }, [game, targetFloorY]);

  const handleOpenGIS = useCallback(() => {
    setPhase('gis-transition');
  }, []);

  const handleGISComplete = useCallback(() => {
    if (onOpenGISGlobe) {
      onOpenGISGlobe(game.propertyContext || undefined);
    }
    setTimeout(() => {
      setPhase('playing');
    }, 500);
  }, [game, onOpenGISGlobe]);

  const handleOpenPassport = useCallback(() => {
    if (game.propertyContext && onOpenPropertyPassport) {
      onOpenPropertyPassport(game.propertyContext);
    }
  }, [game, onOpenPropertyPassport]);

  const currentFloor = building.floors.find((f) => f.floorId === game.currentFloorId);

  // Auto-hide hint
  useEffect(() => {
    if (phase === 'playing' && showHint) {
      const t = setTimeout(() => setShowHint(false), 6000);
      return () => clearTimeout(t);
    }
  }, [phase, showHint]);

  // Clear arrival notification
  useEffect(() => {
    if (arrivalFloor) {
      const t = setTimeout(() => setArrivalFloor(''), 2500);
      return () => clearTimeout(t);
    }
  }, [arrivalFloor]);

  if (phase === 'start') {
    return <StartScreen onEnter={handleEnter} onOpenGIS={handleOpenGIS} onBackToHome={onBackToHome} />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      {/* 3D Scene */}
      <GameScene
        exploded={game.exploded}
        underground={game.underground}
        selectedProperty={game.selectedProperty}
        isolated={game.isolated}
        currentFloorId={game.currentFloorId}
        onSelectProperty={handleSelectProperty}
        onFloorChange={handleFloorChange}
        onInteract={handleInteract}
        targetFloorY={targetFloorY}
        onElevatorArrive={handleElevatorArrive}
        onPlayerPosition={handlePlayerPosition}
        playerActive={phase === 'playing'}
        onSelectObject={(objData) => setInspectedObject(objData)}
        emergency={emergency}
      />

      {/* HUD */}
      {phase === 'playing' && (
        <>
          <HUD
            currentFloorId={game.currentFloorId}
            currentFloor={currentFloor}
            enteredBuilding={enteredBuilding}
            exploded={game.exploded}
            underground={game.underground}
            onToggleExploded={() => game.setExploded(!game.exploded)}
            onToggleUnderground={() => game.setUnderground(!game.underground)}
            onReset={game.resetView}
            showCrosshair={true}
            onOpenGIS={handleOpenGIS}
            onBackToHome={onBackToHome}
            onMoveForward={(val) => setControlState('forward', val)}
            onMoveBackward={(val) => setControlState('backward', val)}
            onMoveLeft={(val) => setControlState('left', val)}
            onMoveRight={(val) => setControlState('right', val)}
            onInteractClick={handleInteract}
          />

          <FloorExplorer
            currentFloorId={game.currentFloorId}
            onSelectFloor={handleSelectFloor}
          />

          {/* Emergency HUD Banner & Simulation Controls */}
          <EmergencyHUDBanner
            emergency={emergency}
            onEvacuate={handleEvacuate}
            onDismiss={() => setEmergency(null)}
            onTriggerRandom={triggerRandomEmergency}
          />

          {/* Object Inspection Modal */}
          {inspectedObject && (
            <ObjectInspectionModal
              objectData={inspectedObject}
              onClose={() => setInspectedObject(null)}
            />
          )}

          {/* Property Panel */}
          {game.showPropertyPanel && game.selectedProperty && (
            <PropertyPanel
              property={game.selectedProperty}
              context={game.propertyContext}
              onClose={() => game.selectProperty(null)}
              onOpenGIS={handleOpenGIS}
              onOpenPassport={handleOpenPassport}
              onIsolate={() => game.setIsolated(!game.isolated)}
              onShowAll={() => { game.setIsolated(false); game.selectProperty(null); }}
              isIsolated={game.isolated}
            />
          )}

          {/* Elevator Panel */}
          <ElevatorPanel
            open={game.elevatorOpen}
            currentFloorId={game.currentFloorId}
            onSelectFloor={handleSelectFloor}
            onClose={() => game.setElevatorOpen(false)}
          />

          {/* Arrival notification */}
          <ArrivalNotification floorName={arrivalFloor} show={!!arrivalFloor} />

          {/* Interaction prompt */}
          <InteractionPrompt message={promptMessage} visible={showPrompt} />

          {/* Entry hint */}
          {showHint && !enteredBuilding && (
            <div className="pointer-events-none absolute left-1/2 top-[65%] z-10 -translate-x-1/2">
              <div className="rounded-lg border border-cyan-400/40 bg-slate-900/85 px-6 py-3 text-center backdrop-blur-md">
                <div className="text-sm text-slate-200">Click the viewport to lock mouse, then use <kbd className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-xs text-cyan-300">WASD</kbd> to walk</div>
                <div className="mt-1 text-xs text-slate-400">Walk to the building entrance and press <kbd className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-xs text-cyan-300">E</kbd> to enter</div>
              </div>
            </div>
          )}

          {/* Controls hint */}
          {showHint && enteredBuilding && (
            <div className="pointer-events-none absolute left-1/2 top-[65%] z-10 -translate-x-1/2">
              <div className="rounded-lg border border-cyan-400/40 bg-slate-900/85 px-6 py-3 text-center backdrop-blur-md">
                <div className="text-sm font-medium text-cyan-300">BUILDING MODE — PROPERTY EXPLORATION</div>
                <div className="mt-1 text-xs text-slate-400 font-mono">Walk to any furniture/object & click to inspect details | Press <kbd className="rounded bg-cyan-500/20 px-1 py-0.5 text-cyan-300">E</kbd> for elevator/property</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* GIS Transition */}
      <GISTransition
        active={phase === 'gis-transition'}
        context={game.propertyContext}
        onComplete={handleGISComplete}
      />
    </div>
  );
}
