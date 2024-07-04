import React from 'react';
import './NoMapOverlay.css';

const NoMapOverlay = () => {
  return (
    <div className="map-overlay">
      <div className="overlay-content">
        <p>No layer available. Please refer to the publication for more information.</p>
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">More Info</a>
      </div>
    </div>
  );
};

export default NoMapOverlay;
