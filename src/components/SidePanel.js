import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheatAwn, faWater, faCloudSun, faCogs, faCog, faInfoCircle,faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './SidePanel.css';

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
      const mockCrops = [
        { id: 'crop1', name: 'Crop 1' },
        { id: 'crop2', name: 'Crop 2' },
      ];
      const mockGlobalWaterModels = [
        { id: 'cwatm', name: 'CWatM' },
      ];
      const mockClimateModels = [
        { id: 'gfdl-esm2m', name: 'GFDL-ESM2M' },
      ];
      const mockScenarios = [
        { id: 'rcp26', name: 'RCP 2.6' },
        { id: 'rcp60', name: 'RCP 6.0' },
      ];
      const mockVariables = [
        { id: 'vwc_sub', name: 'VWC_sub' },
        // Add other variables as needed
      ];
      setCrops(mockCrops);
      setGlobalWaterModels(mockGlobalWaterModels);
      setClimateModels(mockClimateModels);
      setScenarios(mockScenarios);
      setVariables(mockVariables);
    };
    fetchData();
  }, []);

  const handlePanelClick = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleSelection = (type, item) => {
    switch (type) {
      case 'crop':
        setSelectedCrop(item);
        break;
      case 'globalWaterModel':
        setSelectedGlobalWaterModel(item);
        break;
      case 'climateModel':
        setSelectedClimateModel(item);
        break;
      case 'scenario':
        setSelectedScenario(item);
        break;
      case 'variable':
        setSelectedVariable(item);
        break;
      default:
        break;
    }
    onLayerSelect(item.id); // Adjust according to your needs
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
            <span className="current-selection">{selectedVariable ? selectedVariable.name : ''}</span>
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
                onChange={() => handleSelection('crop', crop)}
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
                checked={selectedGlobalWaterModel && selectedGlobalWaterModel.id === model.id}
                onChange={() => handleSelection('globalWaterModel', model)}
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
                checked={selectedClimateModel && selectedClimateModel.id === model.id}
                onChange={() => handleSelection('climateModel', model)}
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
                checked={selectedScenario && selectedScenario.id === scenario.id}
                onChange={() => handleSelection('scenario', scenario)}
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
                checked={selectedVariable && selectedVariable.id === variable.id}
                onChange={() => handleSelection('variable', variable)}
              />
              <label htmlFor={variable.id}>{variable.name}</label>
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
