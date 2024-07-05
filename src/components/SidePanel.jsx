import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheatAwn, faWater, faCloudSun, faCogs,
  faCog, faInfoCircle, faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import GrassIcon from '@mui/icons-material/Grass';
import './SidePanel.css';
import axios from 'axios';
import { Chip } from '@material-ui/core';

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
        { id: 'vwcb_sub', name: 'Blue', abbreviation: 'VWCb_sub', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcg_sub', name: 'Green', abbreviation: 'VWCg_sub', unit: 'm³ ton⁻¹', enabled: false },
        { id: 'vwcg_perc', name: 'Green', abbreviation: 'VWCg_perc', unit: '%', enabled: false },
        { id: 'vwcb_perc', name: 'Blue', abbreviation: 'VWCb_perc', unit: '%', enabled: false },
        { id: 'wf', name: 'Water', abbreviation: 'WF', unit: 'm³', enabled: false },
        { id: 'wfb', name: 'Blue Water', abbreviation: 'WFb', unit: 'm³', enabled: false },
        { id: 'wfg', name: 'Green Water', abbreviation: 'WFg', unit: 'm³', enabled: false },
        { id: 'etb', name: 'Blue', abbreviation: 'ETb', unit: 'mm', enabled: false },
        { id: 'etg', name: 'Green', abbreviation: 'ETg', unit: 'mm', enabled: false },
        { id: 'rb', name: 'Blue', abbreviation: 'Rb', unit: 'mm', enabled: false },
        { id: 'rg', name: 'Green', abbreviation: 'Rg', unit: 'mm', enabled: false },
        { id: 'wdb', name: 'Blue', abbreviation: 'WDb', unit: 'years', enabled: false },
        { id: 'wdg', name: 'Green', abbreviation: 'WDg', unit: 'years', enabled: false },
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
          <div className="chips-list">
            {crops.map(crop => (
              <Chip
                key={crop.id}
                label={crop.name}
                clickable
                className={selectedCrop && selectedCrop.id === crop.id ? 'active' : ''}
                disabled={!crop.enabled}
                onClick={() => setSelectedCrop(crop)}
              />
            ))}
          </div>
        </div>
      )}

      {activePanel === 'globalWaterModels' && (
        <div className="popup">
          <h3>Global Water Model</h3>
          <div className="chips-list">
            {globalWaterModels.map(model => (
              <Chip
                key={model.id}
                label={model.name}
                clickable
                className={selectedGlobalWaterModel && selectedGlobalWaterModel.id === model.id ? 'active' : ''}
                disabled={!model.enabled}
                onClick={() => setSelectedGlobalWaterModel(model)}
              />
            ))}
          </div>
        </div>
      )}

      {activePanel === 'climateModels' && (
        <div className="popup">
          <h3>Climate Model</h3>
          <div className="chips-list">
            {climateModels.map(model => (
              <Chip
                key={model.id}
                label={model.name}
                clickable
                className={selectedClimateModel && selectedClimateModel.id === model.id ? 'active' : ''}
                disabled={!model.enabled}
                onClick={() => setSelectedClimateModel(model)}
              />
            ))}
          </div>
        </div>
      )}

      {activePanel === 'scenarios' && (
        <div className="popup">
          <h3>Scenario</h3>
          <div className="chips-list">
            {scenarios.map(scenario => (
              <Chip
                key={scenario.id}
                label={scenario.name}
                clickable
                className={selectedScenario && selectedScenario.id === scenario.id ? 'active' : ''}
                disabled={!scenario.enabled}
                onClick={() => setSelectedScenario(scenario)}
              />
            ))}
          </div>
        </div>
      )}

      {activePanel === 'variables' && (
        <div className="popup">
          <h3>Variable</h3>

          <div className="chips-group">
            <h5>Virtual Water Content</h5>
            <div className="chips-list">
              {variables.filter(variable => ['vwc_sub', 'vwcb_sub', 'vwcg_sub', 'vwcg_perc', 'vwcb_perc'].includes(variable.id)).map(variable => (
                <Chip
                  key={variable.id}
                  label={`${variable.name} [${variable.unit}]`}
                  clickable
                  className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                  disabled={!variable.enabled}
                  onClick={() => setSelectedVariable(variable)}
                />
              ))}
            </div>
          </div>

          <div className="chips-group">
            <h5>Water Footprint</h5>
            <div className="chips-list">
              {variables.filter(variable => ['wf', 'wfb', 'wfg'].includes(variable.id)).map(variable => (
                <Chip
                  key={variable.id}
                  label={`${variable.name} [${variable.unit}]`}
                  clickable
                  className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                  disabled={!variable.enabled}
                  onClick={() => setSelectedVariable(variable)}
                />
              ))}
            </div>
          </div>

          <div className="chips-group">
            <h5>Evapotranspiration</h5>
            <div className="chips-list">
              {variables.filter(variable => ['etb', 'etg'].includes(variable.id)).map(variable => (
                <Chip
                  key={variable.id}
                  label={`${variable.name} [${variable.unit}]`}
                  clickable
                  className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                  disabled={!variable.enabled}
                  onClick={() => setSelectedVariable(variable)}
                />
              ))}
            </div>
          </div>

          <div className="chips-group">
            <h5>Renewability Rate</h5>
            <div className="chips-list">
              {variables.filter(variable => ['rb', 'rg'].includes(variable.id)).map(variable => (
                <Chip
                  key={variable.id}
                  label={`${variable.name} [${variable.unit}]`}
                  clickable
                  className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                  disabled={!variable.enabled}
                  onClick={() => setSelectedVariable(variable)}
                />
              ))}
            </div>
          </div>

          <div className="chips-group">
            <h5>Water Debt</h5>
            <div className="chips-list">
              {variables.filter(variable => ['wdb', 'wdg'].includes(variable.id)).map(variable => (
                <Chip
                  key={variable.id}
                  label={`${variable.name} [${variable.unit}]`}
                  clickable
                  className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                  disabled={!variable.enabled}
                  onClick={() => setSelectedVariable(variable)}
                />
              ))}
            </div>
          </div>

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
