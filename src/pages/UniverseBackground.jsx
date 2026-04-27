import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const EARTH_RADIUS_M = 6_371_000;
const MOON_RADIUS_M = 1_737_400;
const SUN_RADIUS_M = 696_340_000;
const FILL_FRACTION = 0.65;
const CLICK_RADIUS_PX = 70;
const SPIN_RATE = 0.05;

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

const UniverseBackground = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const stateRef = useRef({
    target: 'earth',
    angle: 0,
    flying: false,
    lastTimestamp: performance.now(),
  });

  useEffect(() => {
    if (!containerRef.current) return;

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
            radii: new Cesium.Cartesian3(
              SUN_RADIUS_M,
              SUN_RADIUS_M,
              SUN_RADIUS_M,
            ),
            material: Cesium.Color.fromCssColorString('#FDB813'),
          },
        });
        viewer.scene.sun.show = false;
        viewer.scene.light = new Cesium.DirectionalLight({ direction: dir });
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
        },
      });
    };

    // ---- Fly back to Earth ----
    const flyToEarth = () => {
      state.flying = true;

      if (state.target === 'sun') {
        viewer.entities.removeById('sun-sphere');
        viewer.scene.sun.show = true;
        viewer.scene.light = new Cesium.SunLight();
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
