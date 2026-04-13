import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import './SplashPage.css';

const projects = [
  {
    id: 'project1',
    title: 'Water Footprints',
    description:
      'Water footprints, evapotranspiration, runoff, and water debt for 8 major crops under projected climate change.',
    active: true,
    tileStyle: { backgroundImage: 'url(https://a.basemaps.cartocdn.com/dark_nolabels/1/1/0.png)' },
  },
  {
    id: 'project2',
    title: 'Project 2',
    description: 'This project is under development.',
    active: false,
    tileStyle: { backgroundImage: 'url(https://b.basemaps.cartocdn.com/dark_nolabels/1/0/0.png)' },
  },
  {
    id: 'project3',
    title: 'Project 3',
    description: 'This project is under development.',
    active: false,
    tileStyle: { backgroundImage: 'url(https://c.basemaps.cartocdn.com/dark_nolabels/2/3/1.png)' },
  },
];

const SplashPage = () => {
  return (
    <div className="splash-page">
      <div className="splash-grid">
        {projects.map((project, index) => {
          const isLast = index === projects.length - 1;
          const cardClass = [
            'splash-card',
            project.active ? 'active' : 'disabled',
            isLast ? 'centered' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const cardContent = (
            <>
              <div
                className="splash-card-visual"
                style={project.tileStyle}
              >
                {!project.active && (
                  <span className="splash-card-coming-soon-icon">
                    <FontAwesomeIcon icon={faClock} />
                  </span>
                )}
              </div>
              <div className="splash-card-body">
                <h3 className="splash-card-title">{project.title}</h3>
                <p className="splash-card-description">{project.description}</p>
                <span
                  className={`splash-card-btn ${project.active ? 'explore' : 'coming-soon'}`}
                >
                  {project.active ? 'Explore' : 'Coming Soon'}
                </span>
              </div>
            </>
          );

          if (project.active) {
            return (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
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
