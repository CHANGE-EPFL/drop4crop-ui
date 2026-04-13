import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './SplashPage.css';

const SplashPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/projects/active')
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch projects:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="splash-page">
        <div style={{ color: '#8a8a8a', fontSize: '1rem' }}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="splash-page">
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
    </div>
  );
};

export default SplashPage;
