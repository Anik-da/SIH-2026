import { useEffect, useRef } from 'react';

export interface ControlState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
  interact: boolean;
}

export function usePlayerControls() {
  const controls = useRef<ControlState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    interact: false,
  });

  const interactPressed = useRef<(() => void) | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': controls.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': controls.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': controls.current.left = true; break;
        case 'KeyD': case 'ArrowRight': controls.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': controls.current.run = true; break;
        case 'Space': controls.current.jump = true; e.preventDefault(); break;
        case 'KeyE':
          if (!controls.current.interact) {
            controls.current.interact = true;
            interactPressed.current?.();
          }
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': controls.current.forward = false; break;
        case 'KeyS': case 'ArrowDown': controls.current.backward = false; break;
        case 'KeyA': case 'ArrowLeft': controls.current.left = false; break;
        case 'KeyD': case 'ArrowRight': controls.current.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': controls.current.run = false; break;
        case 'Space': controls.current.jump = false; break;
        case 'KeyE': controls.current.interact = false; break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const onInteract = (fn: () => void) => {
    interactPressed.current = fn;
  };

  const setControlState = (key: keyof ControlState, val: boolean) => {
    controls.current[key] = val;
    if (key === 'interact' && val) {
      interactPressed.current?.();
    }
  };

  return { controls, onInteract, setControlState };
}
