import React, { useEffect, useRef, useContext, useCallback } from 'react';
import { AppContext } from './contexts/AppContext';
import MapView from './components/Map/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';
import axios from 'axios';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Typography } from '@mui/material';
import {
  cropItems,
  globalWaterModelsItems,
  climateModelsItems,
  scenariosItems,
  variablesItems,
  cropVariablesItems,
} from './variables';

const getLayer = async (props) => {
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
  const boundingBoxSelectionRef = useRef(null);

  const {
    loadingGroups,
    setLoadingGroups,
    loadingCountries,
    setLoadingCountries,
    loadingLayer,
    setloadingLayer,
    loadingAll,
    setLoadingAll,
    layerName,
    setLayerName,
    globalAverage,
    setGlobalAverage,
    countryAverageValues,
    setCountryAverageValues,
    layerStyle,
    setLayerStyle,
    selectedLayer,
    setSelectedLayer,
    setBoundingBox,
    enableSelection,
    setEnableSelection,
    countryAverages,
    setCountryAverages,
    setCrops,
    setGlobalWaterModels,
    setClimateModels,
    setScenarios,
    setVariables,
    setCropVariables,
    availableYears,
    setAvailableYears,
    selectedVariable,
    selectedCropVariable,
    selectedTime,
    setSelectedTime,
    variableForLegend,
    setVariableForLegend,
    countryPolygons,
    setCountryPolygons,
  } = useContext(AppContext);

  const APIServerURL = window.location.origin + '/api';

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/layers/groups');
      const { crop, water_model, climate_model, scenario, variable, year } = response.data;

      setCrops(cropItems.map(c => ({ ...c, enabled: crop.includes(c.id) })));
      setGlobalWaterModels(globalWaterModelsItems.map(m => ({ ...m, enabled: water_model.includes(m.id) })));
      setClimateModels(climateModelsItems.map(m => ({ ...m, enabled: climate_model.includes(m.id) })));
      setScenarios(scenariosItems.map(s => ({ ...s, enabled: scenario.includes(s.id) })));
      setVariables(variablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) })));
      setCropVariables(cropVariablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) })));
      setAvailableYears(year);

      setSelectedTime(year.sort((a, b) => a - b)[0]);
      setLoadingGroups(false);
    };
    fetchData();
  }, [setCrops, setGlobalWaterModels, setClimateModels, setScenarios, setVariables, setCropVariables, setAvailableYears, setSelectedTime, setLoadingGroups]);

  const handleLayerSelect = useCallback((layerProps) => {
    setSelectedLayer(layerProps);
  }, [setSelectedLayer]);

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
    selectedTime,
    setLayerName,
    setCountryAverageValues,
    setGlobalAverage,
    setLayerStyle,
    setloadingLayer,
    setVariableForLegend,
    selectedVariable,
    selectedCropVariable
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
  }, [setCountryPolygons, setLoadingCountries]);

  useEffect(() => {
    if (loadingGroups === false && loadingCountries === false && loadingLayer === false) {
      setLoadingAll(false);
    } else {
      setLoadingAll(true);
    }
  }, [loadingGroups, loadingCountries, loadingLayer, setLoadingAll]);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SidePanel
          onLayerSelect={handleLayerSelect}
          currentLayer={layerName}
          APIServerURL={APIServerURL}
          clearLayers={() => boundingBoxSelectionRef.current.clearLayers()}
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

      {selectedLayer.crop && selectedLayer.water_model && selectedLayer.climate_model && selectedLayer.scenario
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
