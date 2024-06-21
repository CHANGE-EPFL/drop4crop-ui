import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheatAwn, faWater, faCloudSun, faCogs, faCog, faInfoCircle, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './SidePanel.css';

const SidePanel = ({ onLayerSelect, selectedTime }) => {
  const [crops, setCrops] = useState([]);
  const [globalWaterModels, setGlobalWaterModels] = useState([]);
  const [climateModels, setClimateModels] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [variables, setVariables] = useState([]);
  const [timePeriods, setTimePeriods] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedGlobalWaterModel, setSelectedGlobalWaterModel] = useState(null);
  const [selectedClimateModel, setSelectedClimateModel] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Mock data fetch
      const mockCrops = [
        { id: 'barley', name: 'Barley', enabled: true },
        { id: 'potato', name: 'Potato', enabled: true },
        { id: 'rice', name: 'Rice', enabled: true },
        { id: 'soy', name: 'Soy', enabled: true },
        { id: 'sugarcane', name: 'Sugar Cane', enabled: true },
        { id: 'wheat', name: 'Wheat', enabled: true },
      ];

      const mockGlobalWaterModels = [
        { id: 'cwatm', name: 'CWatM', enabled: false },
        { id: 'h08', name: 'H08', enabled: false },
        { id: 'lpjml', name: 'LPJmL', enabled: false },
        { id: 'matsiro', name: 'MATSIRO', enabled: false },
        { id: 'pcr-globwb', name: 'PCR-GLOBWB', enabled: true },
        { id: 'watergap2', name: 'WaterGAP2', enabled: false },
        { id: 'watergap2-2c', name: 'WaterGAP2-2c', enabled: false },
      ];

      const mockClimateModels = [
        { id: 'gfdl-esm2m', name: 'GFDL-ESM2M', enabled: true },
        { id: 'hadgem2-es', name: 'HadGEM2-ES', enabled: true },
        { id: 'ipsl-cm5a-lr', name: 'IPSL-CM5A-LR', enabled: true },
        { id: 'miroc5', name: 'MIROC5', enabled: true },
      ];

      const mockScenarios = [
        { id: 'historical', name: 'Historical', enabled: true },
        { id: 'rcp26', name: 'RCP 2.6', enabled: true },
        { id: 'rcp60', name: 'RCP 6.0', enabled: true },
        { id: 'rcp85', name: 'RCP 8.5', enabled: true },
      ];

      const mockTimePeriods = [
        { id: '2000', name: '2000', enabled: true },
        { id: '2010', name: '2010', enabled: true },
        { id: '2020', name: '2020', enabled: true },
        { id: '2030', name: '2030', enabled: true },
        { id: '2040', name: '2040', enabled: true },
        { id: '2050', name: '2050', enabled: true },
        { id: '2060', name: '2060', enabled: true },
        { id: '2070', name: '2070', enabled: true },
        { id: '2080', name: '2080', enabled: true },
        { id: '2090', name: '2090', enabled: true },
      ];

      const mockSocioEconomicScenarios = [
        { id: '2005soc', name: '2005soc', enabled: true },
        { id: 'histsoc', name: 'histsoc', enabled: true },
      ];

      const mockVariables = [
        { id: 'vwc_sub', name: 'Virtual Water Content', abbreviation: 'VWC_sub', unit: 'm³ ton⁻¹', enabled: true },
        { id: 'vwcb_sub', name: 'Blue Virtual Water Content', abbreviation: 'VWCb_sub', unit: 'm³ ton⁻¹', enabled: true },
        { id: 'vwcg_sub', name: 'Green Virtual Water Content', abbreviation: 'VWCg_sub', unit: 'm³ ton⁻¹', enabled: true },
        { id: 'vwcg_perc', name: 'Green Virtual Water Content Percentage', abbreviation: 'VWCg_perc', unit: '%', enabled: true },
        { id: 'vwcb_perc', name: 'Blue Virtual Water Content Percentage', abbreviation: 'VWCb_perc', unit: '%', enabled: true },
        { id: 'production', name: 'Production', abbreviation: 'Production', unit: 'ton', enabled: true },
        { id: 'wf', name: 'Water Footprint', abbreviation: 'WF', unit: 'm³', enabled: true },
        { id: 'wfb', name: 'Blue Water Footprint', abbreviation: 'WFb', unit: 'm³', enabled: true },
        { id: 'wfg', name: 'Green Water Footprint', abbreviation: 'WFg', unit: 'm³', enabled: true },
        { id: 'etb', name: 'Blue Evapotranspiration', abbreviation: 'ETb', unit: 'mm', enabled: true },
        { id: 'etg', name: 'Green Evapotranspiration', abbreviation: 'ETg', unit: 'mm', enabled: true },
        { id: 'rb', name: 'Blue Renewability Rate', abbreviation: 'Rb', unit: 'mm', enabled: true },
        { id: 'rg', name: 'Green Renewability Rate', abbreviation: 'Rg', unit: 'mm', enabled: true },
        { id: 'wdb', name: 'Blue Water Debt', abbreviation: 'WDb', unit: 'years', enabled: true },
        { id: 'wdg', name: 'Green Water Debt', abbreviation: 'WDg', unit: 'years', enabled: true },
      ];

      setCrops(mockCrops);
      setGlobalWaterModels(mockGlobalWaterModels);
      setClimateModels(mockClimateModels);
      setScenarios(mockScenarios);
      setVariables(mockVariables);
      setTimePeriods(mockTimePeriods);

    // Select the first "enabled" item in each list
    setSelectedCrop(mockCrops.find(crop => crop.enabled));
    setSelectedGlobalWaterModel(mockGlobalWaterModels.find(model => model.enabled));
    setSelectedClimateModel(mockClimateModels.find(model => model.enabled));
    setSelectedScenario(mockScenarios.find(scenario => scenario.enabled));
    setSelectedVariable(mockVariables.find(variable => variable.enabled));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCrop && selectedGlobalWaterModel && selectedClimateModel && selectedScenario && selectedVariable) {
      const layerName = `${selectedCrop.id}_${selectedGlobalWaterModel.id}_${selectedClimateModel.id}_${selectedScenario.id}_${selectedVariable.id}`;
        onLayerSelect(layerName);

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
            <FontAwesomeIcon icon={faWheatAwn} size="2xl" />
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
