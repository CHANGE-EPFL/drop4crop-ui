import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const EARTH_RADIUS_M = 6_371_000;
const MOON_RADIUS_M = 1_737_400;
const SUN_RADIUS_M = 696_340_000;
const FILL_FRACTION = 0.65;
const CLICK_RADIUS_PX = 120;
const SPIN_RATE = 0.05;

const MOON_TEXTURE = '/textures/moon_2k.jpg';
const SUN_TEXTURE = '/textures/sun_2k.jpg';

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

  const cx = w / 2;
  const cy = h / 2;
  const diskR = (Math.min(w, h) * FILL_FRACTION) / 2;

  let flares = [];
  let lastSpawn = performance.now() - 2000;
  let frameId = null;

  const draw = () => {
    const now = performance.now();
    ctx.clearRect(0, 0, w, h);

    // Corona glow
    const cg = ctx.createRadialGradient(
      cx, cy, diskR * 0.95,
      cx, cy, diskR * 1.5,
    );
    cg.addColorStop(0, 'rgba(255,170,60,0.3)');
    cg.addColorStop(0.25, 'rgba(255,110,40,0.14)');
    cg.addColorStop(0.6, 'rgba(255,60,20,0.04)');
    cg.addColorStop(1, 'rgba(255,40,10,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, diskR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Spawn flares
    if (now - lastSpawn > 1200 + Math.random() * 2800) {
      flares.push({
        angle: Math.random() * Math.PI * 2,
        maxLen: 18 + Math.random() * 55,
        width: 4 + Math.random() * 12,
        peak: 0.3 + Math.random() * 0.5,
        birth: now,
        life: 2500 + Math.random() * 4500,
      });
      lastSpawn = now;
      if (flares.length > 10) flares.shift();
    }

    // Update + draw flares
    flares = flares.filter((f) => {
      const age = (now - f.birth) / f.life;
      if (age > 1) return false;
      const bright =
        age < 0.15
          ? (age / 0.15) * f.peak
          : f.peak * Math.pow(1 - (age - 0.15) / 0.85, 1.5);
      const len = f.maxLen * (age < 0.2 ? age / 0.2 : 1 - (age - 0.2) * 0.15);

      const bx = cx + Math.cos(f.angle) * diskR;
      const by = cy + Math.sin(f.angle) * diskR;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(f.angle);

      const fg = ctx.createLinearGradient(0, 0, len, 0);
      fg.addColorStop(0, `rgba(255,210,110,${bright})`);
      fg.addColorStop(0.4, `rgba(255,140,55,${bright * 0.55})`);
      fg.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.ellipse(len * 0.38, 0, len * 0.48, f.width, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return true;
    });

    // Pulsing limb glow
    const pulse = 0.5 + 0.5 * Math.sin(now / 1100);
    const lg = ctx.createRadialGradient(
      cx, cy, diskR * 0.9,
      cx, cy, diskR * 1.08,
    );
    lg.addColorStop(0, `rgba(255,210,130,${0.07 + pulse * 0.06})`);
    lg.addColorStop(0.6, `rgba(255,160,80,${0.03 + pulse * 0.03})`);
    lg.addColorStop(1, 'rgba(255,120,50,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(cx, cy, diskR * 1.08, 0, Math.PI * 2);
    ctx.fill();

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

const UniverseBackground = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const stopSunAnimRef = useRef(null);
  const stateRef = useRef({
    target: 'earth',
    angle: 0,
    flying: false,
    lastTimestamp: performance.now(),
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
    viewer.clockViewModel.multiplier = 60 * 30;
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
    viewer.camera.lookAt(
      Cesium.Cartesian3.ZERO,
      new Cesium.Cartesian3(initialDist, 0, 0),
    );

    // ---- Earth spin + responsive camera distance ----
    const onPreRender = () => {
      if (state.flying || state.target !== 'earth') return;

      const now = performance.now();
      const dt = (now - state.lastTimestamp) / 1000;
      state.lastTimestamp = now;
      state.angle += SPIN_RATE * dt;

      const c = viewer.scene.canvas;
      const a = c.clientWidth / c.clientHeight;
      const f = viewer.camera.frustum.fov;
      const d = computeCameraDistance(EARTH_RADIUS_M, f, a);

      viewer.camera.lookAt(
        Cesium.Cartesian3.ZERO,
        new Cesium.Cartesian3(
          d * Math.cos(state.angle),
          d * Math.sin(state.angle),
          0,
        ),
      );
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

    // ---- Fly to a celestial body ----
    const flyToBody = (bodyFixed, bodyRadius, bodyName) => {
      state.flying = true;
      viewer.clockViewModel.shouldAnimate = false;

      const c = viewer.scene.canvas;
      const a = c.clientWidth / c.clientHeight;
      const f = viewer.camera.frustum.fov;
      const viewDist = computeCameraDistance(bodyRadius, f, a);

      const dir = Cesium.Cartesian3.normalize(
        bodyFixed,
        new Cesium.Cartesian3(),
      );
      const offset = Cesium.Cartesian3.multiplyByScalar(
        dir,
        viewDist,
        new Cesium.Cartesian3(),
      );
      const dest = Cesium.Cartesian3.subtract(
        bodyFixed,
        offset,
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

      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      viewer.camera.flyTo({
        destination: dest,
        orientation: {
          direction: Cesium.Cartesian3.clone(dir),
          up: Cesium.Cartesian3.UNIT_Z,
        },
        duration: 3,
        complete: () => {
          if (!viewerRef.current) return;
          state.target = bodyName;
          state.flying = false;
          viewer.scene.canvas.style.cursor = 'zoom-out';
          if (bodyName === 'sun') {
            stopSunAnimRef.current = startSunAnimation(containerRef.current);
          }
        },
      });
    };

    // ---- Fly back to Earth ----
    const flyToEarth = () => {
      state.flying = true;

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

      const c = viewer.scene.canvas;
      const a = c.clientWidth / c.clientHeight;
      const f = viewer.camera.frustum.fov;
      const d = computeCameraDistance(EARTH_RADIUS_M, f, a);

      const dest = new Cesium.Cartesian3(
        d * Math.cos(state.angle),
        d * Math.sin(state.angle),
        0,
      );
      const dir = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.negate(dest, new Cesium.Cartesian3()),
        new Cesium.Cartesian3(),
      );

      viewer.camera.flyTo({
        destination: dest,
        orientation: {
          direction: dir,
          up: Cesium.Cartesian3.UNIT_Z,
        },
        duration: 2.5,
        complete: () => {
          if (!viewerRef.current) return;
          state.target = 'earth';
          state.flying = false;
          state.lastTimestamp = performance.now();
          viewer.clockViewModel.shouldAnimate = true;

          const c2 = viewer.scene.canvas;
          const a2 = c2.clientWidth / c2.clientHeight;
          const f2 = viewer.camera.frustum.fov;
          const d2 = computeCameraDistance(EARTH_RADIUS_M, f2, a2);
          viewer.camera.lookAt(
            Cesium.Cartesian3.ZERO,
            new Cesium.Cartesian3(
              d2 * Math.cos(state.angle),
              d2 * Math.sin(state.angle),
              0,
            ),
          );
          viewer.scene.canvas.style.cursor = 'default';
        },
      });
    };

    // ---- Click + hover handlers ----
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click) => {
      if (state.flying) return;

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
      if (state.flying) return;
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
