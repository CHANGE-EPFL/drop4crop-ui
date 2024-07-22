import React, { useEffect, useState, useRef } from 'react';
import MapView from './components/Map/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';
import axios from 'axios';

const getLayer = async (props) => {
  try {
    const scenario = props.year === 2000 ? "historical" : props.scenario;

    const response = await axios.get("/api/layers/map", {
      params: {
        crop: props.crop,
        water_model: props.water_model,
        climate_model: props.climate_model,
        scenario: scenario,
        variable: props.variable,
        year: props.year,
      },
    });
    if (response && response.data.length === 1) {
      return response.data[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Get Layer", error);
  }
};

const App = () => {
  const [layerName, setLayerName] = useState(undefined);
  const [selectedLayer, setSelectedLayer] = useState({
    crop: undefined,
    water_model: undefined,
    climate_model: undefined,
    scenario: undefined,
    variable: undefined,
  });
  const [selectedTime, setSelectedTime] = useState(2000);
  const [boundingBox, setBoundingBox] = useState(null);
  const [enableSelection, setEnableSelection] = useState(false);
  const [countryAverages, setCountryAverages] = useState(false);
  const boundingBoxSelectionRef = useRef(null);

  const handleLayerSelect = (layerId) => {
    setSelectedLayer(layerId);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time.target.value);
  };

  useEffect(() => {
    if (
      selectedLayer.crop === undefined ||
      selectedLayer.water_model === undefined ||
      selectedLayer.climate_model === undefined ||
      selectedLayer.scenario === undefined ||
      selectedLayer.variable === undefined ||
      selectedTime === undefined
    ) {
      return;
    }
    getLayer({
      crop: selectedLayer.crop,
      water_model: selectedLayer.water_model,
      climate_model: selectedLayer.climate_model,
      scenario: selectedLayer.scenario,
      variable: selectedLayer.variable,
      year: selectedTime
    }).then(response => {
      if (response === null) {
        console.error("Layer not found");
        setLayerName(null);
      }
      console.log("Layer: ", response);
      setLayerName(response.layer_name);
    }).catch(error => {
      console.error("Error getting layer", error);
    });
  }, [
    selectedLayer.crop,
    selectedLayer.water_model,
    selectedLayer.climate_model,
    selectedLayer.scenario,
    selectedLayer.variable,
    selectedTime
  ]);

  const [geoserverUrl, setGeoserverUrl] = useState(null);

  useEffect(() => {
    axios.get("/api/config/geoserver")
      .then(response => {
        console.log("Geoserver URL defined as:", response.data);
        setGeoserverUrl(response.data);
      })
      .catch(error => {
        console.error("Error getting geoserver URL", error);
      });
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SidePanel
          onLayerSelect={handleLayerSelect}
          currentLayer={layerName}
          geoserverUrl={geoserverUrl}
          boundingBox={boundingBox}
          setBoundingBox={setBoundingBox}
          setEnableSelection={setEnableSelection}
          clearLayers={() => boundingBoxSelectionRef.current.clearLayers()}
        />
        <MapView
          wmsParams={layerName}
          geoserverUrl={geoserverUrl}
          setBoundingBox={setBoundingBox}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
          ref={boundingBoxSelectionRef}
          countryAverages={countryAverages}
          setCountryAverages={setCountryAverages}
        />
      </div>
      <BottomBar
        selectedTime={selectedTime}
        onTimeChange={handleTimeChange}
      />
    </div>
  );
};

export default App;
