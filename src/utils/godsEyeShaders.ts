import * as Cesium from 'cesium';

export type SensorMode = 'NORMAL' | 'NVG' | 'FLIR' | 'CRT' | 'NOIR';

// Map of active Cesium PostProcessStages
const activeStages = new Map<string, Cesium.PostProcessStage>();

/**
 * Apply God's Eye Optics Sensor Pipeline.
 * Uses GPU-accelerated canvas filter styling combined with native Cesium PostProcessStageLibrary
 * to ensure 100% crash-proof rendering across all WebGL1/WebGL2 browsers without GLSL compile errors.
 */
export function applySensorMode(viewer: Cesium.Viewer, mode: SensorMode) {
  if (!viewer || viewer.isDestroyed()) return;

  const canvas = viewer.canvas;
  const stages = viewer.scene.postProcessStages;

  // Clean up any previously attached Cesium post process stages
  ['gods_eye_nvg', 'gods_eye_flir', 'gods_eye_crt', 'gods_eye_noir'].forEach((stageId) => {
    const existing = activeStages.get(stageId);
    if (existing) {
      try {
        stages.remove(existing);
      } catch {
        // ignore
      }
      activeStages.delete(stageId);
    }
  });

  // Apply real-time visual sensor filtering to the Cesium rendering canvas
  switch (mode) {
    case 'NORMAL':
      if (canvas) canvas.style.filter = 'none';
      break;

    case 'NVG':
      // Night Vision: Phosphor Green, intense contrast, night luminance amplification
      if (canvas) {
        canvas.style.filter =
          'sepia(100%) hue-rotate(85deg) saturate(320%) contrast(140%) brightness(115%)';
      }
      try {
        if (Cesium.PostProcessStageLibrary?.isNightVisionSupported?.(viewer.scene)) {
          const nvg = Cesium.PostProcessStageLibrary.createNightVisionStage();
          stages.add(nvg);
          activeStages.set('gods_eye_nvg', nvg);
        }
      } catch (err) {
        console.info('Night vision fallback to canvas optics filter:', err);
      }
      break;

    case 'FLIR':
      // Forward-Looking Infrared (Thermal Ironbow false color)
      if (canvas) {
        canvas.style.filter =
          'invert(85%) hue-rotate(175deg) saturate(280%) contrast(190%) brightness(105%)';
      }
      break;

    case 'CRT':
      // Tactical CRT Surveillance: Amber/Green phosphor raster scan feel
      if (canvas) {
        canvas.style.filter =
          'contrast(145%) brightness(115%) sepia(35%) hue-rotate(120deg) saturate(210%)';
      }
      break;

    case 'NOIR':
      // Monochromatic High-Contrast Aerial Reconnaissance
      if (canvas) {
        canvas.style.filter = 'grayscale(100%) contrast(160%) brightness(95%)';
      }
      try {
        if (Cesium.PostProcessStageLibrary?.createBlackAndWhiteStage) {
          const noir = Cesium.PostProcessStageLibrary.createBlackAndWhiteStage();
          stages.add(noir);
          activeStages.set('gods_eye_noir', noir);
        }
      } catch (err) {
        console.info('Noir fallback to canvas optics filter:', err);
      }
      break;
  }
}

