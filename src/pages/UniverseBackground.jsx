import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Generates a single 2048×2048 cubemap face packed with small, sharp stars.
// Cesium's default starfield is a low-res cubemap — at our close camera
// distance it visibly blurs/smears. A procedural high-res face keeps
// individual stars pixel-crisp at any zoom.
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
    // Most stars are sub-pixel; a few are slightly larger for variety.
    const isBright = Math.random() < 0.04;
    const radius = isBright ? 1.3 + Math.random() * 0.7 : 0.5;
    ctx.fillStyle = `rgba(255,255,255,${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas.toDataURL('image/png');
};

const UniverseBackground = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const animationIdRef = useRef(null);

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
      // Use plain ellipsoid surface — no imagery — so we get a globe shape
      // without depending on Cesium Ion / Bing tile fetches. We layer the
      // CARTO tiles on top below.
      baseLayer: false,
    });
    viewerRef.current = viewer;

    // Layer the same CARTO dark_nolabels basemap onto the Cesium globe so
    // Earth's surface visually matches the rest of the splash page.
    viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
        subdomains: ['a', 'b', 'c', 'd'],
        maximumLevel: 5,
      }),
    );

    // Real-physics moon, sun, and starfield are on by default in Cesium's
    // scene. We just confirm they're visible and clock-driven so the moon
    // sits where it actually is right now.
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.sun.show = true;
    viewer.scene.moon.show = true;
    viewer.scene.globe.enableLighting = true;

    // Replace Cesium's low-res default starfield with a sharper procedural
    // one. Each cube face uses an independent random pattern so seams stay
    // hidden inside the field of stars.
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
    // 30 minutes per real second — moon visibly drifts across the scene
    // over a minute or so without flying past too quickly.
    viewer.clockViewModel.multiplier = 60 * 30;
    viewer.clockViewModel.shouldAnimate = true;

    // Hide all default UI chrome that the Viewer constructor still injects.
    if (viewer.cesiumWidget?.creditContainer) {
      viewer.cesiumWidget.creditContainer.style.display = 'none';
    }

    // Disable user interaction — this is a background.
    const c = viewer.scene.screenSpaceCameraController;
    c.enableRotate = false;
    c.enableTranslate = false;
    c.enableZoom = false;
    c.enableTilt = false;
    c.enableLook = false;

    // Park the camera close enough that Earth fills a similar portion of
    // the viewport as the non-universe MapLibre globe (zoom ~3). Looking
    // straight at the equator from the side (not top-down) so the moon's
    // orbital plane sweeps through the frame as time advances.
    //
    // Earth radius is ~6,371 km. At ~25,000 km altitude with a default 60°
    // FOV, Earth fills roughly the central two-thirds of the frame.
    const EARTH_RADIUS_M = 6_371_000;
    const CAMERA_ALTITUDE_M = 25_000_000; // 25,000 km from surface
    const CAMERA_DISTANCE_M = EARTH_RADIUS_M + CAMERA_ALTITUDE_M;

    // Camera is fixed in space, looking at Earth from the equatorial plane.
    // Earth itself doesn't rotate (Cesium's default frame is Earth-fixed),
    // so the *only* motion is the moon drifting through frame as the sim
    // clock advances and the day/night terminator slowly sweeping the globe.
    viewer.camera.lookAt(
      Cesium.Cartesian3.ZERO,
      new Cesium.Cartesian3(CAMERA_DISTANCE_M, 0, 0),
      Cesium.Cartesian3.UNIT_Z,
    );

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  return (
    <div
      className="splash-background"
      aria-hidden="true"
      ref={containerRef}
      style={{ background: '#000' }}
    />
  );
};

export default UniverseBackground;
