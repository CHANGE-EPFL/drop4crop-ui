import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheatAwn, faWater, faCloudSun, faCogs,
  faCog, faInfoCircle, faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import './SidePanel.css';
import axios from 'axios';
import { Chip } from '@material-ui/core';
import GrassIcon from '@mui/icons-material/Grass';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import VariablePanel from './Panels/Variables';
import ScenarioPanel from './Panels/Scenarios';
import ClimateModelsPanel from './Panels/ClimateModels';
import GlobalWaterModelsPanel from './Panels/GlobalWaterModels';
import CropsPanel from './Panels/Crops';
import DownloadPanel from './Panels/Download';
import InfoPanel from './Panels/Info';

const SidePanel = ({
  onLayerSelect,
  currentLayer,
  APIServerURL,
  boundingBox,
  setBoundingBox,
  setEnableSelection,
  clearLayers,
  selectedVariable, setSelectedVariable,
  crops,
  globalWaterModels,
  climateModels,
  scenarios,
  variables,
  activePanel, setActivePanel,
  selectedCrop, setSelectedCrop,
  selectedGlobalWaterModel, setSelectedGlobalWaterModel,
  selectedClimateModel, setSelectedClimateModel,
  selectedScenario, setSelectedScenario,
}) => {

  const getNextUnselected = () => {
    if (!selectedCrop) return 'crops';
    if (!selectedGlobalWaterModel) return 'globalWaterModels';
    if (!selectedClimateModel) return 'climateModels';
    if (!selectedScenario) return 'scenarios';
    if (!selectedVariable) return 'variables';
    return null;
  };

  useEffect(() => {
    if (!getNextUnselected()) {
      const layerProps = {
        crop: selectedCrop.id,
        water_model: selectedGlobalWaterModel.id,
        climate_model: selectedClimateModel.id,
        scenario: selectedScenario.id,
        variable: selectedVariable.id,
      };
      onLayerSelect(layerProps);
    }
  }, [selectedCrop, selectedGlobalWaterModel, selectedClimateModel, selectedScenario, selectedVariable]);

  const handlePanelClick = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const nextUnselected = getNextUnselected();
  const arrowPositions = {
    crops: 0,
    globalWaterModels: 1,
    climateModels: 2,
    scenarios: 3,
    variables: 4,
  };

  const arrowPositionStyle = nextUnselected !== null ? {
    top: `calc(${arrowPositions[nextUnselected]} * 100px + 50px)`,
  } : { display: 'none' };

  return (
    <div className="side-panel">
      {nextUnselected && (
        <div className="arrow-note" style={arrowPositionStyle}>
          <span>Select here</span>
        </div>
      )}
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
        <button disabled={!currentLayer}
          onClick={() => handlePanelClick('download')} className={`${activePanel === 'download' ? 'active' : ''} ${!currentLayer ? 'disabled' : ''}`}>
          <div className="button-content">
            <CloudDownloadOutlinedIcon />
            <span>Download</span>
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
        <CropsPanel
          crops={crops}
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
        />
      )}

      {activePanel === 'globalWaterModels' && (
        <GlobalWaterModelsPanel
          globalWaterModels={globalWaterModels}
          selectedGlobalWaterModel={selectedGlobalWaterModel}
          setSelectedGlobalWaterModel={setSelectedGlobalWaterModel}
        />
      )}

      {activePanel === 'climateModels' && (
        <ClimateModelsPanel
          climateModels={climateModels}
          selectedClimateModel={selectedClimateModel}
          setSelectedClimateModel={setSelectedClimateModel}
        />
      )}

      {activePanel === 'scenarios' && (
        <ScenarioPanel
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
        />
      )}

      {activePanel === 'variables' && (
        <VariablePanel
          variables={variables}
          selectedVariable={selectedVariable}
          setSelectedVariable={setSelectedVariable}
        />
      )}

      {activePanel === 'download' && (
        <DownloadPanel
          currentLayer={currentLayer}
          APIServerURL={APIServerURL}
          boundingBox={boundingBox}
          setBoundingBox={setBoundingBox}
          setEnableSelection={setEnableSelection}
          clearLayers={clearLayers}
        />
      )}

      {activePanel === 'info' && (
        <InfoPanel />
      )}
    </div>
  );
};

export default SidePanel;
