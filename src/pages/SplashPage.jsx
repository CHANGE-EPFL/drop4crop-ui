import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer } from 'react-leaflet';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './SplashPage.css';

// Grace period before switching from skeleton to error UI. Short blips are
// absorbed by the skeleton animation without ever showing an error.
const ERROR_GRACE_MS = 10_000;
const SKELETON_COUNT = 3;

const GLOBE_STYLE = {
  version: 8,
  projection: { type: 'globe' },
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#131516' } },
    { id: 'carto-dark-layer', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 0.6 } },
  ],
};

const ROTATION_SPEED = 0.05;

const SplashBackground = () => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: GLOBE_STYLE,
      center: [0, 20],
      zoom: 3.14,
      interactive: false,
      attributionControl: false,
      renderWorldCopies: false,
      maxTileCacheSize: 32,
      pixelRatio: 1,
      fadeDuration: 0,
      maxZoom: 4,
    });
    mapRef.current = map;

    const rotate = () => {
      const c = map.getCenter();
      map.setCenter([c.lng + ROTATION_SPEED, c.lat]);
      frameRef.current = requestAnimationFrame(rotate);
    };
    map.on('load', rotate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div className="splash-background" aria-hidden="true" ref={containerRef} />;
};

const SplashPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Only flip to the error UI if the request fails OR hasn't returned within
    // the grace period. Until then, the skeleton cards keep pulsing.
    const graceTimer = setTimeout(() => {
      if (!cancelled) setFailed(true);
    }, ERROR_GRACE_MS);

    setLoading(true);
    setFailed(false);

    axios
      .get('/api/projects/active')
      .then((res) => {
        if (cancelled) return;
        clearTimeout(graceTimer);
        // Guard against a 200 that didn't actually carry the expected payload
        // (e.g. the Vite dev server falls back to serving index.html when the
        // API is off, so res.data arrives as an HTML string, not an array).
        if (!Array.isArray(res.data)) {
          console.error('Unexpected /api/projects/active response:', res.data);
          setProjects([]);
          setLoading(false);
          setFailed(true);
          return;
        }
        setProjects(res.data);
        setLoading(false);
        setFailed(false);
      })
      .catch((err) => {
        if (cancelled) return;
        clearTimeout(graceTimer);
        console.error('Failed to fetch projects:', err);
        setProjects([]);
        setLoading(false);
        setFailed(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(graceTimer);
    };
  }, [attempt]);

  let content;
  if (loading && !failed) {
    content = (
      <div className="splash-row splash-row-skeleton" aria-busy="true" aria-label="Loading projects">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className="splash-card splash-card-skeleton">
            <div className="splash-card-map splash-skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  } else if (failed) {
    content = (
      <div className="splash-unavailable">
        <h1 className="splash-unavailable-title">We'll be right back</h1>
        <p className="splash-unavailable-body">
          Drop4Crop is momentarily unavailable. Please try again in a few moments.
        </p>
        <button
          type="button"
          className="splash-unavailable-retry"
          onClick={() => setAttempt((n) => n + 1)}
        >
          Try again
        </button>
      </div>
    );
  } else {
    content = (
      <div className="splash-row">
        {projects.map((project) => {
          const cardClass = ['splash-card', project.enabled ? 'active' : 'disabled']
            .filter(Boolean)
            .join(' ');

          const cardInner = (
            <>
              <div className="splash-card-map">
                <MapContainer
                  center={[project.latitude || 20, project.longitude || 0]}
                  zoom={project.zoom_level || 2}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  touchZoom={false}
                  keyboard={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
                </MapContainer>
                {!project.enabled && (
                  <span className="splash-card-coming-soon-icon">
                    <FontAwesomeIcon icon={faClock} />
                  </span>
                )}
              </div>
              <h3 className="splash-card-title">{project.title}</h3>
              {project.description && (
                <div className="splash-card-detail">
                  <p className="splash-card-detail-text">{project.description}</p>
                </div>
              )}
            </>
          );

          if (project.enabled) {
            return (
              <Link key={project.id} to={`/projects/${project.slug}`} className={cardClass}>
                {cardInner}
              </Link>
            );
          }
          return (
            <div key={project.id} className={cardClass}>
              {cardInner}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <SplashBackground />
      <div className="splash-page">
        <header className="splash-header">
          <span className="splash-header-brand">drop4crop</span>
          <h1 className="splash-header-title">
            <span>CROPLAND</span>
            <span>SYSTEMS</span>
            <span>ANALYTICS</span>
          </h1>
          <p className="splash-header-subtitle">
            Modeled insights on crop water use, sustainability, suitability, and climate interactions
          </p>
        </header>
        <main className="splash-main">{content}</main>
        <footer className="splash-footer">
          <a
            href="https://www.epfl.ch/"
            target="_blank"
            rel="noopener noreferrer"
            className="splash-footer-logo"
          >
            <img src="/EPFLwhite.png" alt="EPFL" />
          </a>
          <a
            href="https://www.epfl.ch/labs/change/"
            target="_blank"
            rel="noopener noreferrer"
            className="splash-footer-logo"
          >
            <img src="/CHANGE.svg" alt="CHANGE Lab" />
          </a>
        </footer>
      </div>
    </>
  );
};

export default SplashPage;
