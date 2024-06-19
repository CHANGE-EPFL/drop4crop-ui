import React, { useState } from 'react';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';

const App = () => {
  const [wmsParams, setWmsParams] = useState({ layer: "wheat_pcr-globwb_ipsl-cm5a-lr_historical_vwc_sub", time: "2000" });

  const handleLayerSelect = (layerId) => {
    return
    // setWmsParams((prevParams) => ({ ...prevParams, layer: layerId }));
  };

  const handleTimeChange = (time) => {
    return
    // setWmsParams((prevParams) => ({ ...prevParams, time: time }));
  };
  //wmsParams is a combination of {layer}_{time}

  console.log(wmsParams, 'wmsParams',)
  const layer_name = `ne:${wmsParams.layer}_${wmsParams.time}`
  console.log("Loading layer: ", layer_name)
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SidePanel onLayerSelect={handleLayerSelect} />
        <MapView wmsParams={layer_name} />
      </div>
      <BottomBar selectedTime={wmsParams.time} onTimeChange={handleTimeChange} />
    </div>
  );
};

export default App;
