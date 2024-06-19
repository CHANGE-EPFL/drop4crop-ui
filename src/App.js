import React, { useState } from 'react';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';

const App = () => {
  const [wmsParams, setWmsParams] = useState({ layer: 'ocd_0-5cm_mean', time: '2000' });

  const handleLayerSelect = (layerId) => {
    setWmsParams((prevParams) => ({ ...prevParams, layer: layerId }));
  };

  const handleTimeChange = (time) => {
    setWmsParams((prevParams) => ({ ...prevParams, time: time }));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SidePanel onLayerSelect={handleLayerSelect} />
        <MapView wmsParams={wmsParams} />
      </div>
      <BottomBar selectedTime={wmsParams.time} onTimeChange={handleTimeChange} />
    </div>
  );
};

export default App;
