import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheatAwn, faWater, faCloudSun, faCogs,
  faCog, faInfoCircle, faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import GrassIcon from '@mui/icons-material/Grass';
import './SidePanel.css';
import axios from 'axios';


const SidePanel = ({ onLayerSelect }) => {
  const [crops, setCrops] = useState([]);
  const [globalWaterModels, setGlobalWaterModels] = useState([]);
  const [climateModels, setClimateModels] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [variables, setVariables] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedGlobalWaterModel, setSelectedGlobalWaterModel] = useState(null);
  const [selectedClimateModel, setSelectedClimateModel] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Initialise the menus with their values, setting all to false
      // we will ask the API if we can enable them depending if they are available
      let cropItems = [
        { id: 'barley', name: 'Barley', enabled: false },
        { id: 'potato', name: 'Potato', enabled: false },
        { id: 'rice', name: 'Rice', enabled: false },
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
        { id: 'vwc_sub', name: 'Virtual Water Content', abbreviation: 'VWC_sub', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcb_sub', name: 'Blue Virtual Water Content', abbreviation: 'VWCb_sub', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcg_sub', name: 'Green Virtual Water Content', abbreviation: 'VWCg_sub', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcg_perc', name: 'Green Virtual Water Content Percentage', abbreviation: 'VWCg_perc', unit: '%', enabled: false },
        { id: 'vwcb_perc', name: 'Blue Virtual Water Content Percentage', abbreviation: 'VWCb_perc', unit: '%', enabled: false },
        { id: 'wf', name: 'Water Footprint', abbreviation: 'WF', unit: 'm³', enabled: false },
        { id: 'wfb', name: 'Blue Water Footprint', abbreviation: 'WFb', unit: 'm³', enabled: false },
        { id: 'wfg', name: 'Green Water Footprint', abbreviation: 'WFg', unit: 'm³', enabled: false },
        { id: 'etb', name: 'Blue Evapotranspiration', abbreviation: 'ETb', unit: 'mm', enabled: false },
        { id: 'etg', name: 'Green Evapotranspiration', abbreviation: 'ETg', unit: 'mm', enabled: false },
        { id: 'rb', name: 'Blue Renewability Rate', abbreviation: 'Rb', unit: 'mm', enabled: false },
        { id: 'rg', name: 'Green Renewability Rate', abbreviation: 'Rg', unit: 'mm', enabled: false },
        { id: 'wdb', name: 'Blue Water Debt', abbreviation: 'WDb', unit: 'years', enabled: false },
        { id: 'wdg', name: 'Green Water Debt', abbreviation: 'WDg', unit: 'years', enabled: false },
      ];

      // Request from API at GET /layers/groups to get the list of available layers
      // return is an object with keys of the key "id" in each layer group, these are to be set to enabled: true, and the rest to enabled: false
      const response = await axios.get('/api/layers/groups');
      const { crop, water_model, climate_model, scenario, variable } = response.data;

      cropItems = cropItems.map(c => ({ ...c, enabled: crop.includes(c.id) }));
      globalWaterModelsItems = globalWaterModelsItems.map(m => ({ ...m, enabled: water_model.includes(m.id) }));
      climateModelsItems = climateModelsItems.map(m => ({ ...m, enabled: climate_model.includes(m.id) }));
      scenariosItems = scenariosItems.map(s => ({ ...s, enabled: scenario.includes(s.id) }));
      variablesItems = variablesItems.map(v => ({ ...v, enabled: variable.includes(v.id) }));

      setCrops(cropItems);
      setGlobalWaterModels(globalWaterModelsItems);
      setClimateModels(climateModelsItems);
      setScenarios(scenariosItems);
      setVariables(variablesItems);

      // Select the first "enabled" item in each list
      setSelectedCrop(cropItems.find(crop => crop.enabled));
      setSelectedGlobalWaterModel(globalWaterModelsItems.find(model => model.enabled));
      setSelectedClimateModel(climateModelsItems.find(model => model.enabled));
      setSelectedScenario(scenariosItems.find(scenario => scenario.enabled));
      setSelectedVariable(variablesItems.find(variable => variable.enabled));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCrop && selectedGlobalWaterModel && selectedClimateModel && selectedScenario && selectedVariable) {
      const layerProps = {
        crop: selectedCrop.id,
        water_model: selectedGlobalWaterModel.id,
        climate_model: selectedClimateModel.id,
        scenario: selectedScenario.id,
        variable: selectedVariable.id,
      }
      onLayerSelect(layerProps);
    }
  }, [selectedCrop, selectedGlobalWaterModel, selectedClimateModel, selectedScenario, selectedVariable]);

  const handlePanelClick = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="side-panel">
      <div className="button-group top">
        <button onClick={() => handlePanelClick('crops')} className={activePanel === 'crops' ? 'active' : ''}>
          <div className="button-content">
            <GrassIcon />
            <span>Crop</span>
            <span className="current-selection">{selectedCrop ? selectedCrop.name : ''}</span>
          </div>
        </button>
        <button onClick={() => handlePanelClick('globalWaterModels')} className={activePanel === 'globalWaterModels' ? 'active' : ''}>
          <div className="button-content">
            <FontAwesomeIcon icon={faWater} size="2xl" />
            <span>Water Model</span>
            <span className="current-selection">{selectedGlobalWaterModel ? selectedGlobalWaterModel.name : ''}</span>
          </div>
        </button>
        <button onClick={() => handlePanelClick('climateModels')} className={activePanel === 'climateModels' ? 'active' : ''}>
          <div className="button-content">
            <FontAwesomeIcon icon={faCloudSun} size="2xl" />
            <span>Climate Model</span>
            <span className="current-selection">{selectedClimateModel ? selectedClimateModel.name : ''}</span>
          </div>
        </button>
        <button onClick={() => handlePanelClick('scenarios')} className={activePanel === 'scenarios' ? 'active' : ''}>
          <div className="button-content">
            <FontAwesomeIcon icon={faCogs} size="2xl" />
            <span>Scenario</span>
            <span className="current-selection">{selectedScenario ? selectedScenario.name : ''}</span>
          </div>
        </button>
        <button onClick={() => handlePanelClick('variables')} className={activePanel === 'variables' ? 'active' : ''}>
          <div className="button-content">
            <FontAwesomeIcon icon={faLayerGroup} size="2xl" />
            <span>Variable</span>
            <span className="current-selection">{selectedVariable ? `${selectedVariable.abbreviation}` : ''}</span>
          </div>
        </button>
      </div>
      <div className="button-group bottom">
        <button onClick={() => handlePanelClick('settings')} className={activePanel === 'settings' ? 'active' : ''}>
          <div className="button-content">
            <FontAwesomeIcon icon={faCog} size="2xl" />
            <span>Settings</span>
          </div>
        </button>
        <button onClick={() => handlePanelClick('info')} className={activePanel === 'info' ? 'active' : ''}>
          <div className="button-content">
            <FontAwesomeIcon icon={faInfoCircle} size="2xl" />
            <span>Info</span>
          </div>
        </button>
      </div>

      {activePanel === 'crops' && (
        <div className="popup">
          <h3>Crop</h3>
          {crops.map(crop => (
            <div key={crop.id}>
              <input
                type="radio"
                id={crop.id}
                name="crop"
                value={crop.id}
                checked={selectedCrop && selectedCrop.id === crop.id}
                disabled={!crop.enabled}
                onChange={() => setSelectedCrop(crop)}
              />
              <label htmlFor={crop.id}>{crop.name}</label>
            </div>
          ))}
        </div>
      )}
      {activePanel === 'globalWaterModels' && (
        <div className="popup">
          <h3>Global Water Model</h3>
          {globalWaterModels.map(model => (
            <div key={model.id}>
              <input
                type="radio"
                id={model.id}
                name="globalWaterModel"
                value={model.id}
                disabled={!model.enabled}
                checked={selectedGlobalWaterModel && selectedGlobalWaterModel.id === model.id}
                onChange={() => setSelectedGlobalWaterModel(model)}
              />
              <label htmlFor={model.id}>{model.name}</label>
            </div>
          ))}
        </div>
      )}
      {activePanel === 'climateModels' && (
        <div className="popup">
          <h3>Climate Model</h3>
          {climateModels.map(model => (
            <div key={model.id}>
              <input
                type="radio"
                id={model.id}
                name="climateModel"
                value={model.id}
                disabled={!model.enabled}
                checked={selectedClimateModel && selectedClimateModel.id === model.id}
                onChange={() => setSelectedClimateModel(model)}
              />
              <label htmlFor={model.id}>{model.name}</label>
            </div>
          ))}
        </div>
      )}
      {activePanel === 'scenarios' && (
        <div className="popup">
          <h3>Scenario</h3>
          {scenarios.map(scenario => (
            <div key={scenario.id}>
              <input
                type="radio"
                id={scenario.id}
                name="scenario"
                value={scenario.id}
                disabled={!scenario.enabled}
                checked={selectedScenario && selectedScenario.id === scenario.id}
                onChange={() => setSelectedScenario(scenario)}
              />
              <label htmlFor={scenario.id}>{scenario.name}</label>
            </div>
          ))}
        </div>
      )}
      {activePanel === 'variables' && (
        <div className="popup">
          <h3>Variable</h3>
          {variables.map(variable => (
            <div key={variable.id}>
              <input
                type="radio"
                id={variable.id}
                name="variable"
                value={variable.id}
                disabled={!variable.enabled}
                checked={selectedVariable && selectedVariable.id === variable.id}
                onChange={() => setSelectedVariable(variable)}
              />
              <label htmlFor={variable.id}>{variable.name} [{variable.unit}]</label>
            </div>
          ))}
        </div>
      )}
      {activePanel === 'settings' && (
        <div className="popup">
          <h3>Settings</h3>
          <p>Settings options go here.</p>
        </div>
      )}
      {activePanel === 'info' && (
        <div className="popup">
          <h3>Info</h3>
          <p>Information about the application goes here.</p>
        </div>
      )}
    </div>
  );
};

export default SidePanel;
