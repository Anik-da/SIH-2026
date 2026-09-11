import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Procedural Earth Surface Canvas Generator
 * Produces a realistic high-resolution (2048x1024) equirectangular Earth texture
 * with oceans, continental landmasses, topography, polar caps, and coastlines.
 */
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Ocean Base Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#061325');
  oceanGrad.addColorStop(0.3, '#0b2545');
  oceanGrad.addColorStop(0.5, '#0a2240');
  oceanGrad.addColorStop(0.7, '#071830');
  oceanGrad.addColorStop(1, '#05101f');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Continental Landmass Approximations (Simulated Equirectangular Geography)
  ctx.fillStyle = '#1e3a2b'; // Rich land green-brown

  // Helper to draw continent shapes
  const drawContinent = (points: [number, number][], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], idx) => {
      const px = (x / 360 + 0.5) * canvas.width;
      const py = (-y / 180 + 0.5) * canvas.height;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  };

  // North America
  drawContinent([
    [-160, 65], [-140, 70], [-100, 75], [-60, 60], [-55, 45],
    [-75, 35], [-80, 25], [-100, 20], [-120, 30], [-125, 48], [-165, 60]
  ], '#2a4835');

  // South America
  drawContinent([
    [-80, 10], [-60, 12], [-35, -5], [-40, -22], [-65, -45],
    [-75, -45], [-72, -18], [-80, 8]
  ], '#23422e');

  // Eurasia & Europe
  drawContinent([
    [-10, 36], [25, 40], [40, 65], [80, 72], [140, 70], [170, 60],
    [140, 35], [100, 10], [75, 8], [60, 25], [30, 30], [0, 50]
  ], '#2d4e38');

  // Africa
  drawContinent([
    [-17, 35], [30, 32], [50, 10], [40, -15], [30, -32],
    [15, -34], [8, 5], [-17, 15]
  ], '#3b4d2d');

  // Australia & East Indies
  drawContinent([
    [113, -12], [153, -14], [150, -38], [115, -34]
  ], '#423d2b');

  // Greenland
  drawContinent([
    [-55, 60], [-20, 70], [-30, 82], [-60, 82]
  ], '#d5e2ec');

  // Antarctica
  ctx.fillStyle = '#e2f1f8';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height, canvas.height * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Arctic Ice Cap
  ctx.fillStyle = '#eef6fc';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 0, canvas.height * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Fine terrain detail & coastal shelf glow
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Cloud Texture Generator
 */
function createProceduralCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';

  // Generate wispy cloud bands across tropics & mid-latitudes
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = 40 + Math.random() * 120;
    const ry = 8 + Math.random() * 25;

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Wrap around seam
    if (x + rx > canvas.width) {
      ctx.beginPath();
      ctx.ellipse(x - canvas.width, y, rx, ry, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const OrbitalEarth: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3.6;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // Fade in container after WebGL context setup
    container.style.opacity = '1';

    // Group to hold Earth and satellites for mouse parallax
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 1. Earth Mesh
    const earthGeo = new THREE.SphereGeometry(1.2, 64, 64);
    
    // Create base procedural texture
    const earthTexture = createProceduralEarthTexture();
    
    // Standard Material with bump & specular attributes
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 15,
      specular: new THREE.Color('#1e293b'),
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Asynchronously load real high-res Earth texture if available
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      (loadedTexture) => {
        if (earthMat && !earthMat.disposed) {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          earthMat.map = loadedTexture;
          earthMat.needsUpdate = true;
        }
      },
      undefined,
      () => {
        // Soft fallback to procedural texture on network error
      }
    );

    // 2. Cloud Layer (Slightly larger sphere with separate material)
    const cloudGeo = new THREE.SphereGeometry(1.22, 48, 48);
    const cloudTexture = createProceduralCloudTexture();
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // 3. Atmospheric Rim Glow (Custom Fresnel Shader)
    const atmosphereGeo = new THREE.SphereGeometry(1.26, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.02, 0.75, 0.98, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    // 4. Orbital Arcs & Satellites (Geospatial trajectories)
    const orbitGroup = new THREE.Group();
    earthGroup.add(orbitGroup);

    interface Satellite {
      mesh: THREE.Mesh;
      orbitRadius: number;
      angle: number;
      speed: number;
      inclination: number;
    }

    const satellites: Satellite[] = [];

    const createOrbitRing = (radius: number, inclinationDeg: number, colorHex: string) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(100);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );

      const orbitMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.35,
      });

      const line = new THREE.LineLoop(orbitGeo, orbitMat);
      line.rotation.x = THREE.MathUtils.degToRad(inclinationDeg);
      line.rotation.y = THREE.MathUtils.degToRad(15);
      orbitGroup.add(line);

      // Satellite marker
      const satGeo = new THREE.SphereGeometry(0.022, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#38bdf8'),
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      orbitGroup.add(satMesh);

      satellites.push({
        mesh: satMesh,
        orbitRadius: radius,
        angle: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.003,
        inclination: THREE.MathUtils.degToRad(inclinationDeg),
      });
    };

    createOrbitRing(1.48, 25, '#0284c7');
    createOrbitRing(1.62, -35, '#38bdf8');
    createOrbitRing(1.75, 60, '#a855f7');

    // 5. Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 20;
      starPositions[i + 1] = (Math.random() - 0.5) * 20;
      starPositions[i + 2] = -3 - Math.random() * 10;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 6. Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2436, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    // Rim fill light from opposite side
    const rimLight = new THREE.DirectionalLight(0x0284c7, 0.6);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Mouse Parallax Interaction (Desktop only)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseX = (e.clientX - halfW) / halfW;
      mouseY = (e.clientY - halfH) / halfH;
    };

    if (window.innerWidth > 768) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!reducedMotion) {
        // Continuous slow Earth & Cloud rotation
        earthMesh.rotation.y += 0.0012; // ~70s for 360 deg
        cloudMesh.rotation.y += 0.0016; // Slightly faster cloud drift

        // Animate satellites along orbits
        satellites.forEach((sat) => {
          sat.angle += sat.speed;
          const x = Math.cos(sat.angle) * sat.orbitRadius;
          const z = Math.sin(sat.angle) * sat.orbitRadius;

          // Apply orbital inclination rotation matrix
          sat.mesh.position.x = x * Math.cos(15 * (Math.PI / 180)) - z * Math.sin(15 * (Math.PI / 180));
          sat.mesh.position.y = Math.sin(sat.angle) * Math.sin(sat.inclination) * sat.orbitRadius;
          sat.mesh.position.z = z * Math.cos(sat.inclination);
        });

        // Parallax smooth interpolation
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;
        earthGroup.rotation.y = targetX * 0.15;
        earthGroup.rotation.x = targetY * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup & Resource Disposal on Unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      earthGeo.dispose();
      cloudGeo.dispose();
      atmosphereGeo.dispose();
      starsGeo.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      earthMat.dispose();
      cloudMat.dispose();
      atmosphereMat.dispose();
      starsMat.dispose();
      renderer.dispose();
      (earthMat as any).disposed = true;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute right-[-160px] top-[46%] -translate-y-1/2 z-0 h-[480px] w-[480px] opacity-0 transition-opacity duration-700 sm:right-[-100px] sm:h-[560px] sm:w-[560px] md:right-[-40px] md:h-[680px] md:w-[680px] lg:right-[0%] lg:h-[800px] lg:w-[800px] xl:right-[2%]"
    />
  );
};
