import React, { useState } from 'react';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import './App.css'; // Ensure this is imported

const App = () => {
  const [wmsParams, setWmsParams] = useState({ layer: 'ocd_0-5cm_mean' });

  const handleLayerSelect = (layerId) => {
    setWmsParams({ layer: layerId });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}> {/* Ensure full height */}
      <SidePanel onLayerSelect={handleLayerSelect} />
      <MapView wmsParams={wmsParams} />
    </div>
  );
};

export default App;
