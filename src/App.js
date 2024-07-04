import React, { useEffect, useState } from 'react';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';
import axios from 'axios';
const App = () => {
  const [LayerProps, setLayerProps] = useState({});
  const [year, setYear] = useState(2000);
  const [layerName, setLayerName] = useState(null);

  const handleLayerSelect = (props) => {
    setLayerProps(props);
  };

  const handleTimeChange = (time) => {
    setYear(time.target.value);
  };

  // Update the map layer with any change on the selected layer or time
  useEffect(() => {
    // Get layer name from api http://localhost:8015/layers with query params
    // of crop, water_model, climate_model, scenario, variable and year

    // const fetchData = async () => {
    //   const response = await axios.get(`http://localhost:8015/layers?crop=wheat&water_model=pcr-globwb&climate_model=ipsl-cm5a-lr&scenario=historical&variable=vwc_sub&year=${year}`);
    //   console.log(response);
    //   setLayerName(response.data[0].layer_name);
    // }
    // fetchData();
    // setLayerName(LayerProps.crop);
    console.log("Setting layer name", layerName);
  }, [LayerProps, year]);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SidePanel
          onLayerSelect={handleLayerSelect}
        />
        <MapView wmsLayer={layerName} />
      </div>
      <BottomBar selectedTime={year} onTimeChange={handleTimeChange} />
    </div>
  );
};

export default App;
