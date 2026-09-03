import * as Cesium from 'cesium';

export type SensorMode = 'NORMAL' | 'NVG' | 'FLIR' | 'CRT' | 'NOIR';

// Custom GLSL Shaders inspired by God's Eye View GLSL Sensor Pipeline

// 1. Night Vision (NVG) - Phosphor Green, Scanlines & Vignette
const NVG_FRAGMENT_SHADER = `
  uniform sampler2D colorTexture;
  varying vec2 v_textureCoordinates;

  void main() {
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    
    // Calculate luminance
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Phosphor Green tinting
    vec3 nvgColor = vec3(lum * 0.1, lum * 1.35, lum * 0.25);
    
    // Subtle scanline overlay
    float scanline = sin(v_textureCoordinates.y * 800.0) * 0.04;
    nvgColor -= scanline;
    
    // Vignetting
    vec2 uv = v_textureCoordinates - vec2(0.5);
    float dist = length(uv);
    float vignette = smoothstep(0.7, 0.2, dist);
    nvgColor *= vignette;
    
    gl_FragColor = vec4(nvgColor, color.a);
  }
`;

// 2. FLIR Thermal (Ironbow) - Heat Map False Color Transition
const FLIR_FRAGMENT_SHADER = `
  uniform sampler2D colorTexture;
  varying vec2 v_textureCoordinates;

  vec3 ironbow(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c;
    c.r = smoothstep(0.0, 0.5, t) + smoothstep(0.8, 1.0, t) * 0.5;
    c.g = smoothstep(0.25, 0.75, t);
    c.b = smoothstep(0.5, 0.0, t) + smoothstep(0.65, 0.85, t) * 0.4;
    return c;
  }

  void main() {
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 thermal = ironbow(lum * 1.2);
    gl_FragColor = vec4(thermal, color.a);
  }
`;

// 3. CRT Tactical Monitor - Scanlines, Curvature & Green Raster
const CRT_FRAGMENT_SHADER = `
  uniform sampler2D colorTexture;
  varying vec2 v_textureCoordinates;

  void main() {
    vec2 uv = v_textureCoordinates;
    
    // Cathode ray distortion
    vec2 cc = uv - vec2(0.5);
    uv = uv + cc * dot(cc, cc) * 0.08;
    
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    
    vec4 color = texture2D(colorTexture, uv);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Amber/Cyan CRT Phosphor Glow
    vec3 crtColor = vec3(lum * 0.3, lum * 1.1, lum * 0.9);
    
    // Raster Scanlines
    float scan = sin(uv.y * 600.0) * 0.08;
    crtColor -= scan;
    
    gl_FragColor = vec4(crtColor, color.a);
  }
`;

// 4. NOIR - High Contrast Monochromatic Tactical
const NOIR_FRAGMENT_SHADER = `
  uniform sampler2D colorTexture;
  varying vec2 v_textureCoordinates;

  void main() {
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // High contrast curve
    float contrast = 1.3;
    lum = clamp((lum - 0.5) * contrast + 0.5, 0.0, 1.0);
    
    vec3 noir = vec3(lum * 0.9, lum * 0.95, lum * 1.0);
    gl_FragColor = vec4(noir, color.a);
  }
`;

// Map of active Cesium PostProcessStages
const activeStages = new Map<string, Cesium.PostProcessStage>();

export function applySensorMode(viewer: Cesium.Viewer, mode: SensorMode) {
  if (viewer.isDestroyed()) return;

  const stages = viewer.scene.postProcessStages;

  // Remove previous custom sensor stages
  ['gods_eye_nvg', 'gods_eye_flir', 'gods_eye_crt', 'gods_eye_noir'].forEach((stageId) => {
    const existing = activeStages.get(stageId);
    if (existing) {
      stages.remove(existing);
      activeStages.delete(stageId);
    }
  });

  if (mode === 'NORMAL') return;

  let shaderSource = '';
  let stageId = '';

  switch (mode) {
    case 'NVG':
      shaderSource = NVG_FRAGMENT_SHADER;
      stageId = 'gods_eye_nvg';
      break;
    case 'FLIR':
      shaderSource = FLIR_FRAGMENT_SHADER;
      stageId = 'gods_eye_flir';
      break;
    case 'CRT':
      shaderSource = CRT_FRAGMENT_SHADER;
      stageId = 'gods_eye_crt';
      break;
    case 'NOIR':
      shaderSource = NOIR_FRAGMENT_SHADER;
      stageId = 'gods_eye_noir';
      break;
  }

  if (shaderSource && stageId) {
    try {
      const stage = new Cesium.PostProcessStage({
        name: stageId,
        fragmentShader: shaderSource,
      });
      stages.add(stage);
      activeStages.set(stageId, stage);
    } catch (err) {
      console.warn(`Failed to apply sensor stage ${mode}:`, err);
    }
  }
}
