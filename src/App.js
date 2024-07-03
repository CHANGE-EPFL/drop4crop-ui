import React, { useEffect, useState } from 'react';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';

const App = () => {
  const [layerName, setLayerName] = useState(null)
  const [selectedLayer, setSelectedLayer] = useState("wheat_pcr-globwb_ipsl-cm5a-lr_historical_vwc_sub");
  const [selectedTime, setSelectedTime] = useState("2000");

  const handleLayerSelect = (layerId) => {
    setSelectedLayer(layerId);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time.target.value);
  };

  // Update the map layer with any change on the selected layer or time
  useEffect(() => {
    setLayerName(`drop4crop:${selectedLayer}_${selectedTime}`);
  }, [selectedLayer, selectedTime]);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SidePanel onLayerSelect={handleLayerSelect} />
        <MapView wmsParams={layerName} />
      </div>
      <BottomBar selectedTime={selectedTime} onTimeChange={handleTimeChange} />
    </div>
  );
};

export default App;
