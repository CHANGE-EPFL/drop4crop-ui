import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { AppProvider } from '../contexts/AppContext';
import SidePanel from '../components/SidePanel';
import './SplashPage.css';

// Grace period before switching from skeleton to error UI. Short blips are
// absorbed by the skeleton animation without ever showing an error.
const ERROR_GRACE_MS = 10_000;
const SKELETON_COUNT = 3;

// Renders a generic, empty map UI (bare CARTO basemap + SidePanel with all
// six category buttons forced on via `backdrop` mode) as a faded, frozen
// backdrop behind the splash cards. No ProjectProvider / LayerManagerProvider
// — we deliberately skip any project-specific data fetch so the backdrop
// doesn't trigger showcase overlays, layer loads, or country polygons.
// Zoom is computed from the container width the same way MapView does it
// (256px per world tile) so the backdrop framing matches the real MapView.
const SplashBackground = () => {
  const containerRef = useRef(null);
  const [computedZoom, setComputedZoom] = useState(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      // +0.4 crops the empty polar ocean the real MapView hides via its
      // maxBounds interaction with dragging; splashes looks too zoomed-out
      // without this nudge.
      if (width > 0) setComputedZoom(Math.log2(width / 256) + 0.4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="splash-background" aria-hidden="true">
      <AppProvider>
        <div className="splash-backdrop-layout">
          <SidePanel backdrop />
          <div className="splash-backdrop-map" ref={containerRef}>
            {computedZoom !== null && (
              <MapContainer
                center={[0, 0]}
                zoom={computedZoom}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                keyboard={false}
                boxZoom={false}
                maxBounds={[[-85, -180], [85, 180]]}
                worldCopyJump={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                  noWrap
                />
              </MapContainer>
            )}
          </div>
        </div>
      </AppProvider>
    </div>
  );
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
      <div className="splash-grid splash-grid-skeleton" aria-busy="true" aria-label="Loading projects">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => {
          const isLast = SKELETON_COUNT % 2 === 1 && i === SKELETON_COUNT - 1;
          return (
            <div key={i} className={`splash-card splash-card-skeleton ${isLast ? 'centered' : ''}`}>
              <div className="splash-card-visual splash-skeleton-shimmer" />
              <div className="splash-card-body">
                <div className="splash-skeleton-bar splash-skeleton-bar-title splash-skeleton-shimmer" />
                <div className="splash-skeleton-bar splash-skeleton-bar-desc splash-skeleton-shimmer" />
                <div className="splash-skeleton-bar splash-skeleton-bar-desc-short splash-skeleton-shimmer" />
                <div className="splash-skeleton-bar splash-skeleton-bar-btn splash-skeleton-shimmer" />
              </div>
            </div>
          );
        })}
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
          className="splash-card-btn explore splash-unavailable-retry"
          onClick={() => setAttempt((n) => n + 1)}
        >
          Try again
        </button>
      </div>
    );
  } else {
    content = (
      <div className="splash-grid">
        {projects.map((project, index) => {
          const isLast = projects.length > 2 && projects.length % 2 === 1 && index === projects.length - 1;
          const cardClass = [
            'splash-card',
            project.enabled ? 'active' : 'disabled',
            isLast ? 'centered' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const cardContent = (
            <>
              <div className="splash-card-visual">
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
              <div className="splash-card-body">
                <h3 className="splash-card-title">{project.title}</h3>
                <p className="splash-card-description">{project.description}</p>
                <span
                  className={`splash-card-btn ${project.enabled ? 'explore' : 'coming-soon'}`}
                >
                  {project.enabled ? 'Explore' : 'Coming Soon'}
                </span>
              </div>
            </>
          );

          if (project.enabled) {
            return (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                className={cardClass}
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div key={project.id} className={cardClass}>
              {cardContent}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <SplashBackground />
      <div className="splash-overlay" aria-hidden="true" />
      <div className="splash-page">{content}</div>
    </>
  );
};

export default SplashPage;
