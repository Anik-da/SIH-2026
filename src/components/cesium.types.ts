import type { Viewer, Entity } from 'cesium';
import type { SensorMode } from '../utils/godsEyeShaders';

export interface CesiumGlobeHandle {
  getViewer: () => Viewer | null;
  flyToDemoArea: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetNorth: () => void;
  goHome: () => void;
  setMode3D: (is3D: boolean) => void;
  toggleFullscreen: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  tiltView: () => void;
  flyToLocation: (lat: number, lon: number, height?: number) => void;
  setSensorMode: (mode: SensorMode) => void;
}

export type { Viewer, Entity };
