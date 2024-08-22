import React, { useEffect, useState, useRef } from 'react';
import MapView from './components/Map/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';
import axios from 'axios';
import {
  cropItems,
  globalWaterModelsItems,
  climateModelsItems,
  scenariosItems,
  variablesItems,
  cropVariablesItems,
} from './variables';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Typography } from '@mui/material';

const getLayer = async (props) => {
  // This function is used to get the map's layer name from the API
  try {
    const scenario = props.year === 2000 ? "historical" : props.scenario;

    const params = {
      crop: props.crop,
    };


    if (props.crop_variable) {
      params.variable = props.crop_variable;
    } else {
      params.variable = props.variable;
      params.year = props.year;
      params.scenario = scenario;
      params.water_model = props.water_model;
      params.climate_model = props.climate_model;
    }

    const response = await axios.get("/api/layers/map", { params });

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
  // Set a variable to store whether we are loading or not, helps to show a loading spinner
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingLayer, setloadingLayer] = useState(false); // False because we don't load a layer on start
  const [loadingAll, setLoadingAll] = useState(true);
  const APIServerURL = window.location.origin + '/api';

  const [layerName, setLayerName] = useState(undefined);  // The name of the current layer
  const [globalAverage, setGlobalAverage] = useState(undefined);  // The global average value of the current layer
  const [countryAverageValues, setCountryAverageValues] = useState(undefined);  // The country average values of the current layer
  const [layerStyle, setLayerStyle] = useState([]);  // The style of the current layer, for the legend
  const [selectedLayer, setSelectedLayer] = useState({ // Layer properties to discover the layer from the API
    crop: undefined,
    water_model: undefined,
    climate_model: undefined,
    scenario: undefined,
    variable: undefined,
    crop_variable: undefined,
  });
  const [boundingBox, setBoundingBox] = useState(null);  // The bounding box selected by the user for downloading
  const [enableSelection, setEnableSelection] = useState(false);  // Whether the user is currently selecting a bounding box
  const [countryAverages, setCountryAverages] = useState(false);  // Information about country averages in country view
  const boundingBoxSelectionRef = useRef(null);

  // These determine what is available in the menus
  const [crops, setCrops] = useState([]);  // The list of available crops
  const [globalWaterModels, setGlobalWaterModels] = useState([]);  // The list of available global water models
  const [climateModels, setClimateModels] = useState([]);  // The list of available climate models
  const [scenarios, setScenarios] = useState([]);  // The list of available scenarios
  const [variables, setVariables] = useState([]);  // The list of available variables
  const [cropVariables, setCropVariables] = useState([]);  // The list of available crop variables
  const [availableYears, setAvailableYears] = useState([]);  // The list of available years

  // Manages which panel to show in the SidePanel
  const [activePanel, setActivePanel] = useState(null);

  // These determine the selected items in the menus
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedGlobalWaterModel, setSelectedGlobalWaterModel] = useState(null);
  const [selectedClimateModel, setSelectedClimateModel] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [selectedCropVariable, setSelectedCropVariable] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [variableForLegend, setVariableForLegend] = useState(undefined);


  const [countryPolygons, setCountryPolygons] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Initialise the menus with their values, setting all to false
      // we will ask the API if we can enable them depending if they are available
      // Request from API at GET /layers/groups to get the list of available layers
      // return is an object with keys of the key "id" in each layer group, these are to be set to enabled: true, and the rest to enabled: false
      const response = await axios.get('/api/layers/groups');
      const { crop, water_model, climate_model, scenario, variable, year } = response.data;

      setCrops(cropItems.map(c => ({ ...c, enabled: crop.includes(c.id) })));
      setGlobalWaterModels(globalWaterModelsItems.map(m => ({ ...m, enabled: water_model.includes(m.id) })));
      setClimateModels(climateModelsItems.map(m => ({ ...m, enabled: climate_model.includes(m.id) })));
      setScenarios(scenariosItems.map(s => ({ ...s, enabled: scenario.includes(s.id) })));
      setVariables(variablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) })));
      setCropVariables(cropVariablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) })));
      setAvailableYears(year);
      setSelectedTime(year[0]);

      setLoadingGroups(false);  // We are done loading the groups
    };
    fetchData();


  }, []);

  const handleLayerSelect = (layerId) => {
    setSelectedLayer(layerId);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time.target.value);
  };
  useEffect(() => {
    setloadingLayer(true);

    const isBasicFieldsFilled =
      selectedLayer.crop &&
      selectedLayer.water_model &&
      selectedLayer.climate_model &&
      selectedLayer.scenario &&
      selectedTime;

    const isStandardScenarioValid =
      isBasicFieldsFilled &&
      selectedLayer.variable;

    const isCropSpecificScenarioValid =
      selectedLayer.crop &&
      selectedLayer.crop_variable;

    // The function will fire if either the standard scenario or crop-specific scenario is valid
    if (!isStandardScenarioValid && !isCropSpecificScenarioValid) {
      setLayerName(undefined);
      setloadingLayer(false);
      return;
    }

    setloadingLayer(true);
    getLayer({
      crop: selectedLayer.crop,
      water_model: selectedLayer.water_model,
      climate_model: selectedLayer.climate_model,
      scenario: selectedLayer.scenario,
      variable: selectedLayer.variable,
      crop_variable: selectedLayer.crop_variable,
      year: selectedTime
    }).then(response => {
      if (response === null) {
        setLayerName(null);
        setCountryAverageValues(null);
        setGlobalAverage(null);
        setLayerStyle([]);
      } else {
        setLayerName(response.layer_name);
        setCountryAverageValues(response.country_values);
        setGlobalAverage(response.global_average);
        setLayerStyle(response.style || []);

      }
      // Set what variable appears in the legend
      if (selectedLayer.variable) {
        setVariableForLegend(selectedVariable);
      } else if (selectedLayer.crop_variable) {
        setVariableForLegend(selectedCropVariable);
      } else {
        setVariableForLegend(undefined);
      }

      setloadingLayer(false);
    }).catch(error => {
      console.error("Error getting layer", error);
    });
  }, [
    selectedLayer.crop,
    selectedLayer.water_model,
    selectedLayer.climate_model,
    selectedLayer.scenario,
    selectedLayer.variable,
    selectedLayer.crop_variable,
    selectedTime
  ]);


  useEffect(() => {
    axios.get("/api/countries")
      .then(response => {
        setCountryPolygons(response.data);
        setLoadingCountries(false);
      })
      .catch(error => {
        console.error("Error getting countries", error);
      });
  }, []);

  useEffect(() => {
    // If we are done loading the groups and countries, we are done loading everything
    if (loadingGroups === false && loadingCountries === false && loadingLayer === false) {
      setLoadingAll(false);
    } else {
      setLoadingAll(true);
    }
  }, [loadingGroups, loadingCountries, loadingLayer]);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SidePanel
          onLayerSelect={handleLayerSelect}
          currentLayer={layerName}
          APIServerURL={APIServerURL}
          boundingBox={boundingBox}
          setBoundingBox={setBoundingBox}
          setEnableSelection={setEnableSelection}
          clearLayers={() => boundingBoxSelectionRef.current.clearLayers()}
          selectedVariable={selectedVariable}
          setSelectedVariable={setSelectedVariable}
          selectedCropVariable={selectedCropVariable}
          setSelectedCropVariable={setSelectedCropVariable}
          crops={crops}
          globalWaterModels={globalWaterModels}
          climateModels={climateModels}
          scenarios={scenarios}
          variables={variables}
          cropVariables={cropVariables}
          activePanel={activePanel} setActivePanel={setActivePanel}
          selectedCrop={selectedCrop} setSelectedCrop={setSelectedCrop}
          selectedGlobalWaterModel={selectedGlobalWaterModel} setSelectedGlobalWaterModel={setSelectedGlobalWaterModel}
          selectedClimateModel={selectedClimateModel} setSelectedClimateModel={setSelectedClimateModel}
          selectedScenario={selectedScenario} setSelectedScenario={setSelectedScenario}
        />
        <MapView
          layerName={layerName}
          APIServerURL={APIServerURL}
          setBoundingBox={setBoundingBox}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
          ref={boundingBoxSelectionRef}
          countryAverages={countryAverages}
          setCountryAverages={setCountryAverages}
          countryPolygons={countryPolygons}
          globalAverage={globalAverage}
          countryAverageValues={countryAverageValues}
          layerStyle={layerStyle}
          selectedVariable={variableForLegend}
          loading={loadingAll}
        />
      </div>

      {layerName && !selectedLayer.crop_variable
        ? (
          <>
            <BottomBar
              selectedTime={selectedTime}
              onTimeChange={handleTimeChange}
              availableYears={availableYears}
            />
            <div style={toggleContainerMapStyle}>
              <FormControlLabel
                disabled={!layerName}
                control={
                  <Switch
                    checked={countryAverages}
                    size="small"
                    onChange={(e) => {
                      e.stopPropagation();
                      setCountryAverages(e.target.checked);
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#d1a766',
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: countryAverages ? '#d1a766' : '#888',
                      },
                      '& .MuiSwitch-thumb': {
                        backgroundColor: countryAverages ? '#d1a766' : '#ccc',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2">Country Scale Values</Typography>}
                labelPlacement="end"
                className={!layerName ? 'disabled' : ''}
              />
            </div>
          </>
        ) : null}
    </div>
  );
};

export default App;

const toggleContainerMapStyle = {
  position: 'absolute',
  bottom: '110px',
  left: '100px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#333',
  color: '#d3d3d3',
  borderColor: 'rgba(0, 0, 0, 0.7)',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  opacity: '0.8',
  borderTop: '1px solid #444',
  justifyContent: 'center',
  paddingLeft: '20px',
  borderRadius: '10px',
};
