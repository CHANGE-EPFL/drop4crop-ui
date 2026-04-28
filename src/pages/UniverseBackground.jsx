import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const EARTH_RADIUS_M = 6_371_000;
const MOON_RADIUS_M = 1_737_400;
const SUN_RADIUS_M = 696_340_000;
const FILL_FRACTION = 0.75;
const CLICK_RADIUS_PX = 120;
const SPIN_RATE = 0.10;

const MOON_TEXTURE =
  'https://upload.wikimedia.org/wikipedia/commons/2/26/Solarsystemscope_texture_2k_moon.jpg';
const SUN_TEXTURE =
  'https://upload.wikimedia.org/wikipedia/commons/c/cb/Solarsystemscope_texture_2k_sun.jpg';

// --- Starfield ---

const generateStarFace = (size = 2048) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  const starCount = Math.floor(size * size * 0.0009);
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const brightness = 0.35 + Math.random() * 0.65;
    const isBright = Math.random() < 0.04;
    const radius = isBright ? 1.3 + Math.random() * 0.7 : 0.5;
    ctx.fillStyle = `rgba(255,255,255,${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas.toDataURL('image/png');
};

// --- Animated sun corona + flares (2D canvas overlay) ---

const startSunAnimation = (container) => {
  const dpr = window.devicePixelRatio || 1;
  const w = container.clientWidth;
  const h = container.clientHeight;

  const overlay = document.createElement('canvas');
  overlay.width = w * dpr;
  overlay.height = h * dpr;
  overlay.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:10';
  container.appendChild(overlay);

  const ctx = overlay.getContext('2d');
  ctx.scale(dpr, dpr);

  const bloom = document.createElement('canvas');
  bloom.width = w * dpr;
  bloom.height = h * dpr;
  const bctx = bloom.getContext('2d');
  bctx.scale(dpr, dpr);

  const cx = w / 2;
  const cy = h / 2;
  const diskR = (Math.min(w, h) * FILL_FRACTION) / 2;

  const noise = (t, seed) => {
    const s = seed * 1.3;
    return (
      (Math.sin(t * 1.7 + s) +
        Math.sin(t * 3.1 + s * 2.3) +
        Math.sin(t * 5.3 + s * 4.7)) / 3
    );
  };

  const bezAt = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };

  const tempColor = (temp, a) => {
    if (temp > 0.7) {
      const g = Math.min(235 + temp * 20, 255) | 0;
      const b = Math.min(200 + temp * 55, 255) | 0;
      return `rgba(255,${g},${b},${a})`;
    }
    if (temp > 0.3) {
      return `rgba(255,${(170 + temp * 80) | 0},${(60 + temp * 70) | 0},${a})`;
    }
    return `rgba(${(220 + temp * 35) | 0},${(90 + temp * 60) | 0},${(30 + temp * 30) | 0},${a})`;
  };

  const envelope = (age, peak) =>
    age < 0.12
      ? (age / 0.12) * peak
      : peak * Math.pow(1 - (age - 0.12) / 0.88, 1.6);

  const NUM_RAYS = 14;
  const rays = Array.from({ length: NUM_RAYS }, (_, i) => ({
    baseAngle: (i / NUM_RAYS) * Math.PI * 2,
    len: 0.3 + Math.random() * 0.5,
    width: 0.02 + Math.random() * 0.03,
    seed: Math.random() * 100,
    brightness: 0.3 + Math.random() * 0.4,
  }));

  let ejections = [];
  let arcs = [];
  let embers = [];
  let lastFlareSpawn = performance.now() - 2000;
  let lastArcSpawn = performance.now() - 4000;
  let frameId = null;

  const draw = () => {
    const now = performance.now();
    const t = now / 1000;
    ctx.clearRect(0, 0, w, h);
    bctx.clearRect(0, 0, w, h);

    // --- Corona base glow ---
    const cg = ctx.createRadialGradient(cx, cy, diskR * 0.95, cx, cy, diskR * 1.6);
    cg.addColorStop(0, 'rgba(255,170,60,0.28)');
    cg.addColorStop(0.2, 'rgba(255,120,40,0.13)');
    cg.addColorStop(0.5, 'rgba(255,60,20,0.04)');
    cg.addColorStop(1, 'rgba(255,40,10,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, diskR * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // --- Corona rays ---
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ray of rays) {
      const a = ray.baseAngle + noise(t * 0.15, ray.seed) * 0.12;
      const bright = ray.brightness * (0.7 + 0.3 * Math.sin(t * 0.8 + ray.seed));
      const rLen = diskR * (0.5 + ray.len * 0.7);
      const halfW = ray.width * Math.PI;

      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(a) * diskR * 0.98,
        cy + Math.sin(a) * diskR * 0.98,
      );
      ctx.lineTo(
        cx + Math.cos(a - halfW) * (diskR + rLen),
        cy + Math.sin(a - halfW) * (diskR + rLen),
      );
      ctx.lineTo(
        cx + Math.cos(a) * (diskR + rLen * 1.3),
        cy + Math.sin(a) * (diskR + rLen * 1.3),
      );
      ctx.lineTo(
        cx + Math.cos(a + halfW) * (diskR + rLen),
        cy + Math.sin(a + halfW) * (diskR + rLen),
      );
      ctx.closePath();

      const rg = ctx.createRadialGradient(cx, cy, diskR, cx, cy, diskR + rLen * 1.3);
      rg.addColorStop(0, `rgba(255,180,80,${bright * 0.12})`);
      rg.addColorStop(0.5, `rgba(255,120,50,${bright * 0.04})`);
      rg.addColorStop(1, 'rgba(255,80,30,0)');
      ctx.fillStyle = rg;
      ctx.fill();
    }
    ctx.restore();

    // --- Spawn ejection flares ---
    if (now - lastFlareSpawn > 800 + Math.random() * 2200) {
      ejections.push({
        angle: Math.random() * Math.PI * 2,
        angleDrift: (Math.random() - 0.5) * 0.0003,
        maxLen: 20 + Math.random() * 55,
        baseWidth: 5 + Math.random() * 10,
        tipWidth: 1 + Math.random() * 2.5,
        temperature: Math.random(),
        peak: 0.35 + Math.random() * 0.45,
        birth: now,
        life: 2500 + Math.random() * 3500,
        seed: Math.random() * 100,
        curvature: (Math.random() - 0.5) * 0.5,
      });
      lastFlareSpawn = now;
      if (ejections.length > 8) ejections.shift();
    }

    // --- Spawn prominence arcs ---
    if (now - lastArcSpawn > 5000 + Math.random() * 8000) {
      const aStart = Math.random() * Math.PI * 2;
      arcs.push({
        angleStart: aStart,
        angleEnd: aStart + (0.4 + Math.random() * 0.8) * (Math.random() < 0.5 ? 1 : -1),
        maxHeight: 30 + Math.random() * 50,
        width: 3 + Math.random() * 5,
        temperature: 0.2 + Math.random() * 0.5,
        peak: 0.3 + Math.random() * 0.35,
        birth: now,
        life: 4000 + Math.random() * 5000,
        seed: Math.random() * 100,
      });
      lastArcSpawn = now;
      if (arcs.length > 3) arcs.shift();
    }

    // --- Prominence arcs ---
    arcs = arcs.filter((arc) => {
      const age = (now - arc.birth) / arc.life;
      if (age > 1) return false;

      const bright = age < 0.15
        ? (age / 0.15) * arc.peak
        : age < 0.7
          ? arc.peak
          : arc.peak * Math.pow(1 - (age - 0.7) / 0.3, 1.4);
      const hScale = age < 0.2 ? age / 0.2 : age > 0.8 ? (1 - age) / 0.2 : 1;

      const sx = cx + Math.cos(arc.angleStart) * diskR;
      const sy = cy + Math.sin(arc.angleStart) * diskR;
      const ex = cx + Math.cos(arc.angleEnd) * diskR;
      const ey = cy + Math.sin(arc.angleEnd) * diskR;

      const midA = (arc.angleStart + arc.angleEnd) / 2;
      const h = arc.maxHeight * hScale;
      const wobX = noise(t * 0.8, arc.seed) * 8;
      const wobY = noise(t * 0.8, arc.seed + 50) * 8;
      const apexX = cx + Math.cos(midA) * (diskR + h) + wobX;
      const apexY = cy + Math.sin(midA) * (diskR + h) + wobY;

      const cp1x = sx + (apexX - sx) * 0.6 + noise(t * 0.5, arc.seed + 10) * 6;
      const cp1y = sy + (apexY - sy) * 0.6 + noise(t * 0.5, arc.seed + 20) * 6;
      const cp2x = ex + (apexX - ex) * 0.6 + noise(t * 0.5, arc.seed + 30) * 6;
      const cp2y = ey + (apexY - ey) * 0.6 + noise(t * 0.5, arc.seed + 40) * 6;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = bright;
      ctx.strokeStyle = tempColor(arc.temperature, 0.8);
      ctx.lineWidth = arc.width;
      ctx.lineCap = 'round';
      ctx.shadowBlur = arc.width * 3;
      ctx.shadowColor = tempColor(arc.temperature, 0.5);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
      ctx.stroke();
      ctx.restore();

      return true;
    });

    // --- Ejection flares (to offscreen canvas for bloom) ---
    ejections = ejections.filter((f) => {
      const age = (now - f.birth) / f.life;
      if (age > 1) return false;

      const bright = envelope(age, f.peak);
      const flicker = 1 + 0.08 * noise(t * 4, f.seed + 100);
      const a = bright * flicker;
      const curAngle = f.angle + f.angleDrift * (now - f.birth);
      const len = f.maxLen * (age < 0.18 ? age / 0.18 : 1 - (age - 0.18) * 0.12);

      const cos = Math.cos(curAngle);
      const sin = Math.sin(curAngle);
      const bx = cx + cos * diskR;
      const by = cy + sin * diskR;

      const nPerp = noise(t * 1.2, f.seed) * len * 0.15 * f.curvature;
      const perpX = -sin;
      const perpY = cos;

      const p0x = bx, p0y = by;
      const p1x = bx + cos * len * 0.33 + perpX * nPerp;
      const p1y = by + sin * len * 0.33 + perpY * nPerp;
      const p2x = bx + cos * len * 0.66 + perpX * nPerp * 0.5;
      const p2y = by + sin * len * 0.66 + perpY * nPerp * 0.5;
      const p3x = bx + cos * len;
      const p3y = by + sin * len;

      const STEPS = 8;
      const leftX = [], leftY = [], rightX = [], rightY = [];
      for (let i = 0; i <= STEPS; i++) {
        const s = i / STEPS;
        const px = bezAt(p0x, p1x, p2x, p3x, s);
        const py = bezAt(p0y, p1y, p2y, p3y, s);
        const hw = ((1 - s) * f.baseWidth + s * f.tipWidth) / 2;
        const nx = bezAt(p0x, p1x, p2x, p3x, Math.min(s + 0.05, 1));
        const ny = bezAt(p0y, p1y, p2y, p3y, Math.min(s + 0.05, 1));
        const dx = nx - px, dy = ny - py;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        leftX.push(px + (-dy / d) * hw);
        leftY.push(py + (dx / d) * hw);
        rightX.push(px - (-dy / d) * hw);
        rightY.push(py - (dx / d) * hw);
      }

      const fg = bctx.createLinearGradient(p0x, p0y, p3x, p3y);
      fg.addColorStop(0, tempColor(f.temperature, a));
      fg.addColorStop(0.35, tempColor(Math.max(0, f.temperature - 0.2), a * 0.6));
      fg.addColorStop(1, 'rgba(255,60,20,0)');

      bctx.fillStyle = fg;
      bctx.beginPath();
      bctx.moveTo(leftX[0], leftY[0]);
      for (let i = 1; i <= STEPS; i++) bctx.lineTo(leftX[i], leftY[i]);
      for (let i = STEPS; i >= 0; i--) bctx.lineTo(rightX[i], rightY[i]);
      bctx.closePath();
      bctx.fill();

      if (age > 0.15 && age < 0.75 && embers.length < 30 && Math.random() < 0.12) {
        for (let k = 0; k < 1 + Math.random() * 2; k++) {
          embers.push({
            x: p3x + (Math.random() - 0.5) * 4,
            y: p3y + (Math.random() - 0.5) * 4,
            vx: cos * (20 + Math.random() * 40) + (Math.random() - 0.5) * 18,
            vy: sin * (20 + Math.random() * 40) + (Math.random() - 0.5) * 18,
            radius: 0.5 + Math.random() * 2,
            temperature: Math.min(1, f.temperature + (Math.random() - 0.3) * 0.3),
            birth: now,
            life: 600 + Math.random() * 1400,
          });
        }
      }

      return true;
    });

    // --- Bloom composite ---
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(bloom, 0, 0, w, h);
    ctx.filter = 'blur(8px)';
    ctx.globalAlpha = 0.45;
    ctx.drawImage(bloom, 0, 0, w, h);
    ctx.restore();

    // --- Embers ---
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    embers = embers.filter((e) => {
      const age = (now - e.birth) / e.life;
      if (age > 1) return false;

      const dt = 1 / 60;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx *= 0.97;
      e.vy *= 0.97;

      const bright = age < 0.15
        ? age / 0.15
        : Math.pow(1 - (age - 0.15) / 0.85, 2);

      ctx.shadowBlur = 4;
      ctx.shadowColor = tempColor(e.temperature, bright * 0.7);
      ctx.fillStyle = tempColor(e.temperature, bright);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();

      return true;
    });
    ctx.shadowBlur = 0;
    ctx.restore();

    // --- Enhanced pulsing limb glow ---
    const pulse1 = 0.5 + 0.5 * Math.sin(now / 1100);
    const pulse2 = 0.5 + 0.5 * Math.sin(now / 1700);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const lg1 = ctx.createRadialGradient(cx, cy, diskR * 0.9, cx, cy, diskR * 1.1);
    lg1.addColorStop(0, `rgba(255,210,130,${0.06 + pulse1 * 0.05})`);
    lg1.addColorStop(0.6, `rgba(255,160,80,${0.03 + pulse1 * 0.025})`);
    lg1.addColorStop(1, 'rgba(255,120,50,0)');
    ctx.fillStyle = lg1;
    ctx.beginPath();
    ctx.arc(cx, cy, diskR * 1.1, 0, Math.PI * 2);
    ctx.fill();

    const lg2 = ctx.createRadialGradient(cx, cy, diskR * 0.92, cx, cy, diskR * 1.06);
    lg2.addColorStop(0, `rgba(255,190,100,${0.04 + pulse2 * 0.04})`);
    lg2.addColorStop(0.5, `rgba(255,140,60,${0.02 + pulse2 * 0.02})`);
    lg2.addColorStop(1, 'rgba(255,100,40,0)');
    ctx.fillStyle = lg2;
    ctx.beginPath();
    ctx.arc(cx, cy, diskR * 1.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    frameId = requestAnimationFrame(draw);
  };

  frameId = requestAnimationFrame(draw);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
    overlay.remove();
  };
};

// --- Helpers ---

const computeCameraDistance = (bodyRadius, fov, aspect) => {
  const tanHalf = Math.tan(fov / 2);
  const minHalfFov =
    aspect > 1 ? Math.atan(tanHalf / aspect) : Math.atan(tanHalf * aspect);
  return bodyRadius / Math.sin(minHalfFov * FILL_FRACTION);
};

const toFixedFrame = (icrfPos, time) => {
  const out = new Cesium.Cartesian3();
  const m =
    Cesium.Transforms.computeIcrfToFixedMatrix(time) ||
    Cesium.Transforms.computeTemeToPseudoFixedMatrix(time);
  return m
    ? Cesium.Matrix3.multiplyByVector(m, icrfPos, out)
    : Cesium.Cartesian3.clone(icrfPos, out);
};

const dist2D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// --- Component ---

const UniverseBackground = ({ globeConfig }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const stopSunAnimRef = useRef(null);
  const stateRef = useRef({
    target: 'earth',
    angle: 0,
    lastTimestamp: performance.now(),
    bodyCenter: null,
    bodyRadius: 0,
    transition: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const preload = (src) => {
      const img = new Image();
      img.src = src;
    };
    preload(MOON_TEXTURE);
    preload(SUN_TEXTURE);

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      shouldAnimate: true,
      baseLayer: false,
    });
    viewerRef.current = viewer;

    viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
        subdomains: ['a', 'b', 'c', 'd'],
        maximumLevel: 5,
      }),
    );

    if (globeConfig?.globe_layer_name) {
      const dataLayer = viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: `/api/site-settings/globe-tile/{z}/{x}/{y}?layer=${encodeURIComponent(globeConfig.globe_layer_name)}`,
          maximumLevel: 5,
        }),
      );
      dataLayer.alpha = 0.85;
    }

    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.sun.show = true;
    viewer.scene.moon.show = true;
    viewer.scene.globe.enableLighting = true;

    viewer.scene.skyBox = new Cesium.SkyBox({
      sources: {
        positiveX: generateStarFace(),
        negativeX: generateStarFace(),
        positiveY: generateStarFace(),
        negativeY: generateStarFace(),
        positiveZ: generateStarFace(),
        negativeZ: generateStarFace(),
      },
    });
    viewer.scene.skyBox.show = true;

    viewer.clockViewModel.currentTime = Cesium.JulianDate.now();
    viewer.clockViewModel.multiplier = 60 * 65;
    viewer.clockViewModel.shouldAnimate = true;

    if (viewer.cesiumWidget?.creditContainer) {
      viewer.cesiumWidget.creditContainer.style.display = 'none';
    }

    const ctrl = viewer.scene.screenSpaceCameraController;
    ctrl.enableRotate = false;
    ctrl.enableTranslate = false;
    ctrl.enableZoom = false;
    ctrl.enableTilt = false;
    ctrl.enableLook = false;

    const state = stateRef.current;

    const canvas = viewer.scene.canvas;
    const fov = viewer.camera.frustum.fov;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const initialDist = computeCameraDistance(EARTH_RADIUS_M, fov, aspect);
    viewer.camera.lookAtTransform(
      Cesium.Matrix4.IDENTITY,
      new Cesium.Cartesian3(initialDist, 0, 0),
    );

    const easeInOut = (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // ---- Unified preRender: spin, responsive sizing, and smooth transitions ----
    const onPreRender = () => {
      const now = performance.now();
      const dt = (now - state.lastTimestamp) / 1000;
      state.lastTimestamp = now;
      state.angle -= SPIN_RATE * dt;

      const c = viewer.scene.canvas;
      const a = c.clientWidth / c.clientHeight;
      const f = viewer.camera.frustum.fov;

      let center, radius;

      if (state.transition) {
        const t = Math.min(
          (now - state.transition.startTime) / state.transition.duration,
          1,
        );
        const e = easeInOut(t);

        center = Cesium.Cartesian3.lerp(
          state.transition.fromCenter,
          state.transition.toCenter,
          e,
          new Cesium.Cartesian3(),
        );
        radius =
          state.transition.fromRadius +
          (state.transition.toRadius - state.transition.fromRadius) * e;

        if (t >= 1) {
          state.transition.onComplete?.();
          state.transition = null;
        }
      } else {
        center =
          state.target === 'earth'
            ? Cesium.Cartesian3.ZERO
            : state.bodyCenter;
        radius =
          state.target === 'earth' ? EARTH_RADIUS_M : state.bodyRadius;
      }

      if (!center) return;

      const d = computeCameraDistance(radius, f, a);
      const transform = Cesium.Matrix4.fromTranslation(center);
      viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(
        d * Math.cos(state.angle),
        d * Math.sin(state.angle),
        0,
      ));
    };
    viewer.scene.preRender.addEventListener(onPreRender);

    // ---- Body position helpers ----
    const getBodyInfo = (bodyType) => {
      const time = viewer.clock.currentTime;
      const icrf =
        bodyType === 'moon'
          ? Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(time)
          : Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(time);
      const fixed = toFixedFrame(icrf, time);
      const screen = Cesium.SceneTransforms.worldToWindowCoordinates(
        viewer.scene,
        fixed,
      );
      return { fixed, screen };
    };

    // ---- Fly to a celestial body (smooth lookAt interpolation) ----
    const flyToBody = (bodyFixed, bodyRadius, bodyName) => {
      viewer.clockViewModel.shouldAnimate = false;

      const fromCenter =
        state.target === 'earth'
          ? Cesium.Cartesian3.clone(Cesium.Cartesian3.ZERO)
          : Cesium.Cartesian3.clone(state.bodyCenter);
      const fromRadius =
        state.target === 'earth' ? EARTH_RADIUS_M : state.bodyRadius;

      const dir = Cesium.Cartesian3.normalize(
        bodyFixed,
        new Cesium.Cartesian3(),
      );

      if (bodyName === 'sun') {
        viewer.entities.add({
          id: 'sun-sphere',
          position: bodyFixed,
          ellipsoid: {
            radii: new Cesium.Cartesian3(SUN_RADIUS_M, SUN_RADIUS_M, SUN_RADIUS_M),
            material: new Cesium.ImageMaterialProperty({ image: SUN_TEXTURE }),
          },
        });
        viewer.scene.sun.show = false;
        viewer.scene.light = new Cesium.DirectionalLight({ direction: dir });
      }

      if (bodyName === 'moon') {
        viewer.entities.add({
          id: 'moon-sphere',
          position: bodyFixed,
          ellipsoid: {
            radii: new Cesium.Cartesian3(MOON_RADIUS_M, MOON_RADIUS_M, MOON_RADIUS_M),
            material: new Cesium.ImageMaterialProperty({ image: MOON_TEXTURE }),
          },
        });
        viewer.scene.moon.show = false;
      }

      state.bodyCenter = Cesium.Cartesian3.clone(bodyFixed);
      state.bodyRadius = bodyRadius;

      state.transition = {
        startTime: performance.now(),
        duration: 3000,
        fromCenter,
        toCenter: Cesium.Cartesian3.clone(bodyFixed),
        fromRadius,
        toRadius: bodyRadius,
        onComplete: () => {
          if (!viewerRef.current) return;
          state.target = bodyName;
          viewer.scene.canvas.style.cursor = 'zoom-out';
          if (bodyName === 'sun') {
            stopSunAnimRef.current = startSunAnimation(containerRef.current);
          }
        },
      };
    };

    // ---- Fly back to Earth (smooth lookAt interpolation) ----
    const flyToEarth = () => {
      if (state.target === 'sun') {
        if (stopSunAnimRef.current) {
          stopSunAnimRef.current();
          stopSunAnimRef.current = null;
        }
        viewer.entities.removeById('sun-sphere');
        viewer.scene.sun.show = true;
        viewer.scene.light = new Cesium.SunLight();
      }
      if (state.target === 'moon') {
        viewer.entities.removeById('moon-sphere');
        viewer.scene.moon.show = true;
      }

      state.transition = {
        startTime: performance.now(),
        duration: 2500,
        fromCenter: Cesium.Cartesian3.clone(state.bodyCenter),
        toCenter: Cesium.Cartesian3.clone(Cesium.Cartesian3.ZERO),
        fromRadius: state.bodyRadius,
        toRadius: EARTH_RADIUS_M,
        onComplete: () => {
          if (!viewerRef.current) return;
          state.target = 'earth';
          state.bodyCenter = null;
          state.bodyRadius = 0;
          viewer.clockViewModel.shouldAnimate = true;
          viewer.scene.canvas.style.cursor = 'default';
        },
      };
    };

    // ---- Click + hover handlers ----
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click) => {
      if (state.transition) return;

      if (state.target !== 'earth') {
        flyToEarth();
        return;
      }

      const moon = getBodyInfo('moon');
      const sun = getBodyInfo('sun');
      const pos = click.position;

      if (moon.screen && dist2D(pos, moon.screen) < CLICK_RADIUS_PX) {
        flyToBody(moon.fixed, MOON_RADIUS_M, 'moon');
      } else if (sun.screen && dist2D(pos, sun.screen) < CLICK_RADIUS_PX) {
        flyToBody(sun.fixed, SUN_RADIUS_M, 'sun');
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement) => {
      if (state.transition) return;
      if (state.target !== 'earth') {
        viewer.scene.canvas.style.cursor = 'zoom-out';
        return;
      }

      const moon = getBodyInfo('moon');
      const sun = getBodyInfo('sun');
      const pos = movement.endPosition;
      const near =
        (moon.screen && dist2D(pos, moon.screen) < CLICK_RADIUS_PX) ||
        (sun.screen && dist2D(pos, sun.screen) < CLICK_RADIUS_PX);
      viewer.scene.canvas.style.cursor = near ? 'zoom-in' : 'default';
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      if (stopSunAnimRef.current) {
        stopSunAnimRef.current();
        stopSunAnimRef.current = null;
      }
      viewer.scene.preRender.removeEventListener(onPreRender);
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  return (
    <div
      className="splash-background splash-background--interactive"
      aria-hidden="true"
      ref={containerRef}
      style={{ background: '#000' }}
    />
  );
};

export default UniverseBackground;
