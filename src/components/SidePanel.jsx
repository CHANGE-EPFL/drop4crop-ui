import React, { useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheatAwn, faWater, faCloudSun, faCogs,
  faCog, faInfoCircle, faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import './SidePanel.css';
import GrassIcon from '@mui/icons-material/Grass';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import VariablePanel from './Panels/Variables';
import ScenarioPanel from './Panels/Scenarios';
import ClimateModelsPanel from './Panels/ClimateModels';
import GlobalWaterModelsPanel from './Panels/GlobalWaterModels';
import CropsPanel from './Panels/Crops';
import DownloadPanel from './Panels/Download';
import InfoPanel from './Panels/Info';
import CropSpecificPanel from './Panels/CropSpecific';

const SidePanel = ({
  onLayerSelect,
  currentLayer,
  APIServerURL,
  clearLayers,
}) => {
  const {
    boundingBox,
    setBoundingBox,
    setEnableSelection,
    selectedVariable, setSelectedVariable,
    selectedCropVariable, setSelectedCropVariable,
    crops,
    globalWaterModels,
    climateModels,
    scenarios,
    variables,
    cropVariables,
    activePanel, setActivePanel,
    selectedCrop, setSelectedCrop,
    selectedGlobalWaterModel, setSelectedGlobalWaterModel,
    selectedClimateModel, setSelectedClimateModel,
    selectedScenario, setSelectedScenario,
  } = useContext(AppContext);

  const getNextUnselected = () => {
    if (!selectedCrop) return 'crops';
    if (!selectedCropVariable && !selectedVariable) return 'cropSpecific';
    if (!selectedVariable) return 'variables';
    if (!selectedGlobalWaterModel) return 'globalWaterModels';
    if (!selectedClimateModel) return 'climateModels';
    if (!selectedScenario) return 'scenarios';
    return null;
  };

  useEffect(() => {
    const layerProps = {
      crop: selectedCrop?.id,
      water_model: selectedGlobalWaterModel?.id,
      climate_model: selectedClimateModel?.id,
      scenario: selectedScenario?.id,
      variable: selectedVariable?.id,
      crop_variable: selectedCropVariable?.id,
    };
    onLayerSelect(layerProps);
  }, [
    selectedCrop,
    selectedGlobalWaterModel,
    selectedClimateModel,
    selectedScenario,
    selectedVariable,
    selectedCropVariable,
  ]);

  const handlePanelClick = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const nextUnselected = getNextUnselected();

  const arrowPositions = {
    crops: { id: 0, name: 'crop', offset: 0 },
    cropSpecific: { id: 1, name: 'crop specific variable', offset: 20 },
    variables: { id: 2, name: 'variable', offset: 20 },
    globalWaterModels: { id: 3, name: 'water model', offset: 40 },
    climateModels: { id: 4, name: 'climate model', offset: 40 },
    scenarios: { id: 5, name: 'scenario', offset: 40 },
  };

  const arrowPositionStyle = nextUnselected ? {
    top: `calc(${arrowPositions[nextUnselected].id} * 70px + 35px + ${arrowPositions[nextUnselected].offset}px)`,
  } : {};

  const showArrows = (
    nextUnselected !== null && (nextUnselected !== 'variables'
      || !(selectedCropVariable && selectedCrop)
      || (selectedVariable && (!selectedGlobalWaterModel || !selectedClimateModel || !selectedScenario)))
  );
  const showTwoArrows = (nextUnselected === 'cropSpecific' && !selectedVariable);

  return (
    <div className="side-panel">
      {showArrows && (
        <div>
          {!showTwoArrows ? (
            <div className="arrow-note" style={arrowPositionStyle}>
              <span>{`Select a ${arrowPositions[nextUnselected].name}`}</span>
            </div>
          ) : (
            <>
              <div className="arrow-note" style={{ ...arrowPositionStyle, right: '-120px' }}>
                <span>Crop specific variable</span>
              </div>
              <div className="variable-note" style={{ ...arrowPositionStyle, right: '-120px', top: `calc(${arrowPositions[nextUnselected].id} * 70px + 35px + 20px + 35px)` }}>
                <span>Select one option from either</span>
              </div>
              <div className="arrow-note" style={{ ...arrowPositionStyle, right: '-120px', top: `calc(${arrowPositions[nextUnselected].id} * 70px + 35px + 20px + 70px)` }}>
                <span>Time-based variable</span>
              </div>
            </>
          )}
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

        <div className="button-divider"></div>

        <div className="variable-buttons">
          <button onClick={() => handlePanelClick('cropSpecific')} className={`variable-button ${activePanel === 'cropSpecific' ? 'active' : ''}`}>
            <div className="button-content">
              <GrassIcon />
              <span>Crop Specific</span>
              <span className="current-selection">{selectedCropVariable ? `${selectedCropVariable.abbreviation} ` : ''}</span>
            </div>
          </button>

          <button onClick={() => handlePanelClick('variables')} className={`variable-button ${activePanel === 'variables' ? 'active' : ''}`}>
            <div className="button-content">
              <FontAwesomeIcon icon={faLayerGroup} size="2xl" />
              <span>Variable</span>
              <span className="current-selection">{selectedVariable ? `${selectedVariable.abbreviation} ` : ''}</span>
            </div>
          </button>
        </div>

        <div className="button-divider"></div>

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
          setActivePanel={setActivePanel}
        />
      )}

      {activePanel === 'globalWaterModels' && (
        <GlobalWaterModelsPanel
          globalWaterModels={globalWaterModels}
          selectedGlobalWaterModel={selectedGlobalWaterModel}
          setSelectedGlobalWaterModel={setSelectedGlobalWaterModel}
          setActivePanel={setActivePanel}
        />
      )}

      {activePanel === 'climateModels' && (
        <ClimateModelsPanel
          climateModels={climateModels}
          selectedClimateModel={selectedClimateModel}
          setSelectedClimateModel={setSelectedClimateModel}
          setActivePanel={setActivePanel}
        />
      )}

      {activePanel === 'scenarios' && (
        <ScenarioPanel
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          setActivePanel={setActivePanel}
        />
      )}

      {activePanel === 'variables' && (
        <VariablePanel
          variables={variables}
          selectedVariable={selectedVariable}
          setSelectedVariable={setSelectedVariable}
          setActivePanel={setActivePanel}
          selectedCropVariable={selectedCropVariable}
          setSelectedCropVariable={setSelectedCropVariable}
        />
      )}

      {activePanel === 'cropSpecific' && (
        <CropSpecificPanel
          cropVariables={cropVariables}
          selectedCropVariable={selectedCropVariable}
          setSelectedCropVariable={setSelectedCropVariable}
          setActivePanel={setActivePanel}
          setSelectedVariable={setSelectedVariable}
          setSelectedClimateModel={setSelectedClimateModel}
          setSelectedGlobalWaterModel={setSelectedGlobalWaterModel}
          setSelectedScenario={setSelectedScenario}
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
