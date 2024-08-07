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
  const [globalAverage, setGlobalAverage] = useState(undefined);
  const [countryAverageValues, setCountryAverageValues] = useState(undefined);
  const [layerStyle, setLayerStyle] = useState([]);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState({
    crop: undefined,
    water_model: undefined,
    climate_model: undefined,
    scenario: undefined,
    variable: undefined,
  });
  const [selectedTime, setSelectedTime] = useState(null);
  const [boundingBox, setBoundingBox] = useState(null);
  const [enableSelection, setEnableSelection] = useState(false);
  const [countryAverages, setCountryAverages] = useState(false);
  const boundingBoxSelectionRef = useRef(null);
  const [crops, setCrops] = useState([]);
  const [globalWaterModels, setGlobalWaterModels] = useState([]);
  const [climateModels, setClimateModels] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [variables, setVariables] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [activePanel, setActivePanel] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedGlobalWaterModel, setSelectedGlobalWaterModel] = useState(null);
  const [selectedClimateModel, setSelectedClimateModel] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Initialise the menus with their values, setting all to false
      // we will ask the API if we can enable them depending if they are available
      let cropItems = [
        { id: 'barley', name: 'Barley', enabled: false },
        { id: 'maize', name: 'Maize', enabled: false },
        { id: 'potato', name: 'Potato', enabled: false },
        { id: 'rice', name: 'Rice', enabled: false },
        { id: 'sorghum', name: 'Sorghum', enabled: false },
        { id: 'soy', name: 'Soy', enabled: false },
        { id: 'sugarcane', name: 'Sugar Cane', enabled: false },
        { id: 'wheat', name: 'Wheat', enabled: false },
      ];

      let globalWaterModelsItems = [
        { id: 'cwatm', name: 'CWatM', enabled: false },
        { id: 'h08', name: 'H08', enabled: false },
        { id: 'lpjml', name: 'LPJmL', enabled: false },
        { id: 'matsiro', name: 'MATSIRO', enabled: false },
        { id: 'pcr-globwb', name: 'PCR-GLOBWB', enabled: false },
        { id: 'watergap2', name: 'WaterGAP2', enabled: false },
      ];

      let climateModelsItems = [
        { id: 'gfdl-esm2m', name: 'GFDL-ESM2M', enabled: false },
        { id: 'hadgem2-es', name: 'HadGEM2-ES', enabled: false },
        { id: 'ipsl-cm5a-lr', name: 'IPSL-CM5A-LR', enabled: false },
        { id: 'miroc5', name: 'MIROC5', enabled: false },
      ];

      let scenariosItems = [
        { id: 'rcp26', name: 'RCP 2.6', enabled: false },
        { id: 'rcp60', name: 'RCP 6.0', enabled: false },
        { id: 'rcp85', name: 'RCP 8.5', enabled: false },
      ];


      let variablesItems = [
        { id: 'vwc', name: 'Total', abbreviation: 'VWC', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcb', name: 'Blue', abbreviation: 'VWCb', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcg', name: 'Green', abbreviation: 'VWCg', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcg_perc', name: 'Green', abbreviation: 'VWCg', unit: '%', enabled: false },
        { id: 'vwcb_perc', name: 'Blue', abbreviation: 'VWCb', unit: '%', enabled: false },
        { id: 'wf', name: 'Total', abbreviation: 'WF', unit: 'm³', enabled: false },
        { id: 'wfb', name: 'Blue', abbreviation: 'WFb', unit: 'm³', enabled: false },
        { id: 'wfg', name: 'Green', abbreviation: 'WFg', unit: 'm³', enabled: false },
        { id: 'etb', name: 'Blue', abbreviation: 'ETb', unit: 'mm', enabled: false },
        { id: 'etg', name: 'Green', abbreviation: 'ETg', unit: 'mm', enabled: false },
        { id: 'rb', name: 'Blue', abbreviation: 'Rb', unit: 'mm', enabled: false },
        { id: 'rg', name: 'Green', abbreviation: 'Rg', unit: 'mm', enabled: false },
        { id: 'wdb', name: 'Blue', abbreviation: 'WDb', unit: 'years', enabled: false },
        { id: 'wdg', name: 'Green', abbreviation: 'WDg', unit: 'years', enabled: false },
        { id: 'mirca_area_irrigated', name: 'Irrigated Area', abbreviation: 'MircaAreaIrrigated', unit: 'ha', enabled: false },
        { id: 'mirca_area_total', name: 'Total Area', abbreviation: 'MircaAreaTotal', unit: 'ha', enabled: false },
        { id: 'mirca_rainfed', name: 'Rainfed Area', abbreviation: 'MircaRainfed', unit: 'ha', enabled: false },
        { id: 'yield', name: 'Yield', abbreviation: 'Yield', unit: 'ton ha⁻¹' },
        { id: 'production', name: 'Production', abbreviation: 'Production', unit: 'ton' },
      ];

      // Request from API at GET /layers/groups to get the list of available layers
      // return is an object with keys of the key "id" in each layer group, these are to be set to enabled: true, and the rest to enabled: false
      const response = await axios.get('/api/layers/groups');
      const { crop, water_model, climate_model, scenario, variable, year } = response.data;

      cropItems = cropItems.map(c => ({ ...c, enabled: crop.includes(c.id) }));
      globalWaterModelsItems = globalWaterModelsItems.map(m => ({ ...m, enabled: water_model.includes(m.id) }));
      climateModelsItems = climateModelsItems.map(m => ({ ...m, enabled: climate_model.includes(m.id) }));
      scenariosItems = scenariosItems.map(s => ({ ...s, enabled: scenario.includes(s.id) }));
      variablesItems = variablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) }));
      console.log("YEARS", year);
      setCrops(cropItems);
      setGlobalWaterModels(globalWaterModelsItems);
      setClimateModels(climateModelsItems);
      setScenarios(scenariosItems);
      setVariables(variablesItems);
      setAvailableYears(year);
      setSelectedTime(year[0]);

      // Select the first "enabled" item in each list
      setSelectedCrop(cropItems.find(crop => crop.enabled));
      setSelectedGlobalWaterModel(globalWaterModelsItems.find(model => model.enabled));
      setSelectedClimateModel(climateModelsItems.find(model => model.enabled));
      setSelectedScenario(scenariosItems.find(scenario => scenario.enabled));
      setSelectedVariable(variablesItems.find(variable => variable.enabled));
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

  const APIServerURL = window.location.origin + '/api';
  const [countryPolygons, setCountryPolygons] = useState(null);

  useEffect(() => {
    axios.get("/api/countries")
      .then(response => {
        setCountryPolygons(response.data);
      })
      .catch(error => {
        console.error("Error getting countries", error);
      });
  }, []);


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
          crops={crops}
          globalWaterModels={globalWaterModels}
          climateModels={climateModels}
          scenarios={scenarios}
          variables={variables}
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
          selectedVariable={selectedVariable}

        />
      </div>
      <BottomBar
        selectedTime={selectedTime}
        onTimeChange={handleTimeChange}
        availableYears={availableYears}
      />
    </div>
  );
};

export default App;
