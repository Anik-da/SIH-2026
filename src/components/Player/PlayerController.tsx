import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerControls } from '@/hooks/usePlayerControls';
import {
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  WALK_SPEED,
  RUN_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
  BUILDING_DIMENSIONS,
  FLOOR_HEIGHT,
} from '@/data/constants';

interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
}

const { width: BW, depth: BD, wallThickness: WT } = BUILDING_DIMENSIONS;

const collisionBoxes: CollisionBox[] = [
  { minX: -BW / 2 - WT, maxX: -BW / 2 + WT, minZ: -BD / 2, maxZ: BD / 2, minY: 0, maxY: 100 },
  { minX: BW / 2 - WT, maxX: BW / 2 + WT, minZ: -BD / 2, maxZ: BD / 2, minY: 0, maxY: 100 },
  { minX: -BW / 2, maxX: BW / 2, minZ: -BD / 2 - WT, maxZ: -BD / 2 + WT, minY: 0, maxY: 100 },
  { minX: -BW / 2, maxX: -1, minZ: BD / 2 - WT, maxZ: BD / 2, minY: 0, maxY: 100 },
  { minX: 1, maxX: BW / 2, minZ: BD / 2 - WT, maxZ: BD / 2, minY: 0, maxY: 100 },
  { minX: -1.58, maxX: -1.42, minZ: -BD / 2 + 0.2, maxZ: BD / 2 - 0.2, minY: 0, maxY: 100 },
  { minX: 1.42, maxX: 1.58, minZ: -BD / 2 + 0.2, maxZ: BD / 2 - 0.2, minY: 0, maxY: 100 },
  { minX: -1.33, maxX: -1.17, minZ: -BD / 2 + 1.5, maxZ: -BD / 2 + 3.5, minY: 0, maxY: 100 },
  { minX: 1.17, maxX: 1.33, minZ: -BD / 2 + 1.5, maxZ: -BD / 2 + 3.5, minY: 0, maxY: 100 },
  { minX: -1.25, maxX: 1.25, minZ: -BD / 2 + 1.42, maxZ: -BD / 2 + 1.58, minY: 0, maxY: 100 },
];

function checkCollision(x: number, z: number, y: number): boolean {
  for (const box of collisionBoxes) {
    if (
      x + PLAYER_RADIUS > box.minX &&
      x - PLAYER_RADIUS < box.maxX &&
      z + PLAYER_RADIUS > box.minZ &&
      z - PLAYER_RADIUS < box.maxZ &&
      y + PLAYER_HEIGHT > box.minY &&
      y < box.maxY
    ) {
      return true;
    }
  }
  return false;
}

interface PlayerControllerProps {
  enabled: boolean;
  onFloorChange: (floorId: string) => void;
  onInteract: () => void;
  targetFloorY: number | null;
  onElevatorArrive: () => void;
  onPlayerPosition: (pos: [number, number, number]) => void;
}

export function PlayerController({
  enabled,
  onFloorChange,
  onInteract,
  targetFloorY,
  onElevatorArrive,
  onPlayerPosition,
}: PlayerControllerProps) {
  const { camera, gl } = useThree();
  const { controls, onInteract: setInteractHandler } = usePlayerControls();

  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, PLAYER_HEIGHT, 8));
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isLocked = useRef(false);
  const isGrounded = useRef(true);
  const elevatorTargetY = useRef<number | null>(null);
  const lastFloorId = useRef('outside');
  const posUpdateTimer = useRef(0);

  useEffect(() => {
    camera.position.copy(position.current);
  }, [camera]);

  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => {
      if (enabled && !isLocked.current) {
        canvas.requestPointerLock();
      }
    };
    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };
    canvas.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => {
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl, enabled]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isLocked.current || !enabled) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;
      pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [enabled]);

  useEffect(() => {
    setInteractHandler(onInteract);
  }, [onInteract, setInteractHandler]);

  useEffect(() => {
    if (targetFloorY !== null) {
      elevatorTargetY.current = targetFloorY + PLAYER_HEIGHT;
    }
  }, [targetFloorY]);

  const getFloorId = useCallback((y: number): string => {
    const floorLevel = Math.round((y - PLAYER_HEIGHT) / FLOOR_HEIGHT);
    const floorMap: Record<string, string> = {
      ['-1']: 'B01', ['0']: 'G', ['1']: 'F01', ['2']: 'F02',
      ['3']: 'F03', ['4']: 'F04', ['5']: 'F05', ['6']: 'F06', ['7']: 'T',
    };
    return floorMap[String(floorLevel)] ?? 'G';
  }, []);

  useFrame((_, delta) => {
    if (!enabled) return;
    const dt = Math.min(delta, 0.05);
    const ctrl = controls.current;

    // Elevator mode
    if (elevatorTargetY.current !== null) {
      const target = elevatorTargetY.current;
      const diff = target - position.current.y;
      if (Math.abs(diff) < 0.05) {
        position.current.y = target;
        velocity.current.y = 0;
        elevatorTargetY.current = null;
        onElevatorArrive();
      } else {
        position.current.y += diff * (1 - Math.pow(0.005, dt));
        camera.position.copy(position.current);
        camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
        posUpdateTimer.current += dt;
        if (posUpdateTimer.current > 0.1) {
          onPlayerPosition([position.current.x, position.current.y, position.current.z]);
          posUpdateTimer.current = 0;
        }
        return;
      }
    }

    // Movement direction
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    forward.copy(dir);

    const moveDir = new THREE.Vector3();
    if (ctrl.forward) moveDir.add(forward);
    if (ctrl.backward) moveDir.sub(forward);
    if (ctrl.right) moveDir.add(right);
    if (ctrl.left) moveDir.sub(right);
    moveDir.normalize();

    const speed = ctrl.run ? RUN_SPEED : WALK_SPEED;
    velocity.current.x = moveDir.x * speed;
    velocity.current.z = moveDir.z * speed;

    // Jump
    if (ctrl.jump && isGrounded.current) {
      velocity.current.y = JUMP_VELOCITY;
      isGrounded.current = false;
    }

    // Gravity
    velocity.current.y -= GRAVITY * dt;

    // Apply movement with collision
    const nextX = position.current.x + velocity.current.x * dt;
    const nextZ = position.current.z + velocity.current.z * dt;
    const nextY = position.current.y + velocity.current.y * dt;

    // Horizontal collision
    if (!checkCollision(nextX, position.current.z, position.current.y)) {
      position.current.x = nextX;
    }
    if (!checkCollision(position.current.x, nextZ, position.current.y)) {
      position.current.z = nextZ;
    }

    // Vertical: floor collision
    const floorLevel = Math.round((position.current.y - PLAYER_HEIGHT) / FLOOR_HEIGHT) * FLOOR_HEIGHT + PLAYER_HEIGHT;
    if (nextY <= floorLevel && velocity.current.y <= 0) {
      position.current.y = floorLevel;
      velocity.current.y = 0;
      isGrounded.current = true;
    } else {
      position.current.y = nextY;
    }

    // Clamp to building bounds
    const maxX = BW / 2 - PLAYER_RADIUS - 0.1;
    const maxZ = BD / 2 - PLAYER_RADIUS - 0.1;
    position.current.x = Math.max(-maxX, Math.min(maxX, position.current.x));
    position.current.z = Math.max(-maxZ - 5, Math.min(maxZ + 5, position.current.z));

    // Prevent falling below basement
    if (position.current.y < -FLOOR_HEIGHT + PLAYER_HEIGHT) {
      position.current.y = -FLOOR_HEIGHT + PLAYER_HEIGHT;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    // Update camera
    camera.position.copy(position.current);
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');

    // Floor change detection
    const floorId = getFloorId(position.current.y);
    if (floorId !== lastFloorId.current) {
      lastFloorId.current = floorId;
      onFloorChange(floorId);
    }

    // Throttled position update for proximity detection
    posUpdateTimer.current += dt;
    if (posUpdateTimer.current > 0.1) {
      onPlayerPosition([position.current.x, position.current.y, position.current.z]);
      posUpdateTimer.current = 0;
    }
  });

  return null;
}
