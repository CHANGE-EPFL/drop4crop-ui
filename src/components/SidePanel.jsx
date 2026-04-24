import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useProject } from '../contexts/ProjectContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheatAwn, faWater, faCloudSun, faCogs,
  faCog, faInfoCircle, faLayerGroup, faHome, faChevronLeft,
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

// Helper to render variable abbreviation with subscript
const renderAbbreviation = (variable) => {
  if (!variable) return '';
  if (variable.subscript) {
    return <>{variable.abbreviation}<sub>{variable.subscript}</sub></>;
  }
  return variable.abbreviation;
};

const SidePanel = ({ clearLayers, backdrop = false }) => {
  const [isFirstTimeInfo, setIsFirstTimeInfo] = useState(true);
  const mountedRef = useRef(false);
  const { config } = useProject() || {};
  const tabConfig = config?.project?.tab_config || {};

  const {
    APIServerURL,
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
    layerName,
    setLayerName,
  } = useContext(AppContext);

  // A category is only "next to select" if the project actually exposes it —
  // otherwise we'd be pointing the hint arrow at a button that no longer
  // renders after the project-config filter drops empty groups.
  // In backdrop mode (splash page) force all buttons to render so the layout
  // reads as a complete map UI regardless of any loaded project data.
  const hasCrops = backdrop || crops.length > 0;
  const hasCropVariables = backdrop || cropVariables.length > 0;
  const hasVariables = backdrop || variables.length > 0;
  const hasGlobalWaterModels = backdrop || globalWaterModels.length > 0;
  const hasClimateModels = backdrop || climateModels.length > 0;
  const hasScenarios = backdrop || scenarios.length > 0;

  const getNextUnselected = () => {
    if (hasCrops && !selectedCrop) return 'crops';
    if (hasCropVariables && !selectedCropVariable && !selectedVariable) return 'cropSpecific';
    if (selectedCropVariable) return null;
    if (hasVariables && !selectedVariable) return 'variables';
    if (hasGlobalWaterModels && !selectedGlobalWaterModel) return 'globalWaterModels';
    if (hasClimateModels && !selectedClimateModel) return 'climateModels';
    if (hasScenarios && !selectedScenario) return 'scenarios';
    return null;
  };

  // Note: selectedLayer update logic has been moved to FrontendAppContent
  // to ensure it runs even when SidePanel is hidden (showcase mode)

  const handlePanelClick = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
    // If it's the first time info and user clicks any panel, disable first-time behavior
    if (isFirstTimeInfo) {
      setIsFirstTimeInfo(false);
    }
  };

  const handlePageClick = () => {
    // If it's the first time info panel is open, close it when clicking anywhere
    if (isFirstTimeInfo && activePanel === 'info') {
      setActivePanel(null);
      setIsFirstTimeInfo(false);
    }
  };

  const handleInfoPanelClick = (e) => {
    // Prevent the page click from closing the info panel if clicking inside it (for first time)
    if (isFirstTimeInfo) {
      e.stopPropagation();
    }
  };

  const handleInfoClose = () => {
    setActivePanel(null);
    if (isFirstTimeInfo) {
      setIsFirstTimeInfo(false);
    }
  };

  const nextUnselected = getNextUnselected();

  const arrowNames = {
    crops: tabConfig.crops?.label || 'crop',
    cropSpecific: tabConfig.crop_specific?.label || 'crop specific variable',
    variables: tabConfig.variables?.label || 'variable',
    globalWaterModels: tabConfig.water_models?.label || 'water model',
    climateModels: tabConfig.climate_models?.label || 'climate model',
    scenarios: tabConfig.scenarios?.label || 'scenario',
  };

  const getArrowTop = (key, extra = 0) => {
    const visibleButtons = [];
    if (hasCrops) visibleButtons.push('crops');
    if (hasCropVariables) visibleButtons.push('cropSpecific');
    if (hasVariables) visibleButtons.push('variables');
    if (hasGlobalWaterModels) visibleButtons.push('globalWaterModels');
    if (hasClimateModels) visibleButtons.push('climateModels');
    if (hasScenarios) visibleButtons.push('scenarios');

    const idx = visibleButtons.indexOf(key);
    if (idx === -1) return '0px';

    const sections = { crops: 0, cropSpecific: 1, variables: 1, globalWaterModels: 2, climateModels: 2, scenarios: 2 };
    const section = sections[key];
    const d1 = hasCrops && (hasCropVariables || hasVariables);
    const d2 = (hasCropVariables || hasVariables) && (hasGlobalWaterModels || hasClimateModels || hasScenarios);

    let offset = extra;
    if (section >= 1 && d1) offset += 20;
    if (section >= 2 && d2) offset += 20;

    return `calc(${idx} * 70px + 35px + ${offset}px)`;
  };

  const arrowPositionStyle = nextUnselected ? { top: getArrowTop(nextUnselected) } : {};

  // Mark as mounted after a short delay to avoid catching the click that opened the panel
  useEffect(() => {
    const timer = setTimeout(() => {
      mountedRef.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Add page click listener for first-time info dismissal
  useEffect(() => {
    if (isFirstTimeInfo && activePanel === 'info') {
      const handlePageClickWithGuard = () => {
        // Ignore clicks that happen before component is fully mounted
        if (!mountedRef.current) return;
        handlePageClick();
      };
      document.addEventListener('click', handlePageClickWithGuard);
      return () => {
        document.removeEventListener('click', handlePageClickWithGuard);
      };
    }
  }, [isFirstTimeInfo, activePanel]);

  // getNextUnselected() already skips axes the project doesn't have, so the
  // arrow simply tracks its result. (The previous override also checked water
  // model / climate model / scenario unconditionally, which flashed the arrow
  // back for projects that don't even render those buttons.)
  const showArrows = !backdrop && nextUnselected !== null;
  const showTwoArrows = (nextUnselected === 'cropSpecific' && !selectedVariable);

  return (
    <div className="side-panel">
      {showArrows && (
        <div>
          {!showTwoArrows ? (
            <div className="arrow-note" style={arrowPositionStyle}>
              <span>{`Select a ${arrowNames[nextUnselected]}`}</span>
            </div>
          ) : (
            <>
              <div className="arrow-note" style={{ right: '-120px', top: getArrowTop('cropSpecific') }}>
                <span>{tabConfig.crop_specific?.label || 'Crop specific variable'}</span>
              </div>
              <div className="variable-note" style={{ right: '-120px', top: getArrowTop('cropSpecific', 35) }}>
                <span>Select one option from either</span>
              </div>
              <div className="arrow-note" style={{ right: '-120px', top: getArrowTop('cropSpecific', 70) }}>
                <span>{tabConfig.variables?.label || 'Time-based variable'}</span>
              </div>
            </>
          )}
        </div>
      )}
      <div className="button-group top">
        {hasCrops && (
          <button onClick={() => handlePanelClick('crops')} className={activePanel === 'crops' ? 'active' : ''}>
            <div className="button-content">
              <GrassIcon />
              <span>{tabConfig.crops?.label || 'Crop'}</span>
              <span className="current-selection">{selectedCrop ? selectedCrop.name : ''}</span>
            </div>
          </button>
        )}

        {hasCrops && (hasCropVariables || hasVariables) && <div className="button-divider"></div>}

        {(hasCropVariables || hasVariables) && (
          <div className="variable-buttons">
            {hasCropVariables && (
              <button onClick={() => handlePanelClick('cropSpecific')} className={`variable-button ${activePanel === 'cropSpecific' ? 'active' : ''}`}>
                <div className="button-content">
                  <GrassIcon />
                  <span>{tabConfig.crop_specific?.label || 'Crop Specific'}</span>
                  <span className="current-selection">{selectedCropVariable ? `${selectedCropVariable.abbreviation} ` : ''}</span>
                </div>
              </button>
            )}

            {hasVariables && (
              <button onClick={() => handlePanelClick('variables')} className={`variable-button ${activePanel === 'variables' ? 'active' : ''}`}>
                <div className="button-content">
                  <FontAwesomeIcon icon={faLayerGroup} size="xl" />
                  <span>{tabConfig.variables?.label || 'Variable'}</span>
                  <span className="current-selection">{selectedVariable ? renderAbbreviation(selectedVariable) : ''}</span>
                </div>
              </button>
            )}
          </div>
        )}

        {(hasCropVariables || hasVariables) &&
          (hasGlobalWaterModels || hasClimateModels || hasScenarios) && (
            <div className="button-divider"></div>
          )}

        {hasGlobalWaterModels && (
          <button onClick={() => handlePanelClick('globalWaterModels')} className={activePanel === 'globalWaterModels' ? 'active' : ''}>
            <div className="button-content">
              <FontAwesomeIcon icon={faWater} size="xl" />
              <span>{tabConfig.water_models?.label || 'Water Model'}</span>
              <span className="current-selection">{selectedGlobalWaterModel ? selectedGlobalWaterModel.name : ''}</span>
            </div>
          </button>
        )}

        {hasClimateModels && (
          <button onClick={() => handlePanelClick('climateModels')} className={activePanel === 'climateModels' ? 'active' : ''}>
            <div className="button-content">
              <FontAwesomeIcon icon={faCloudSun} size="xl" />
              <span>{tabConfig.climate_models?.label || 'Climate Model'}</span>
              <span className="current-selection">{selectedClimateModel ? selectedClimateModel.name : ''}</span>
            </div>
          </button>
        )}

        {hasScenarios && (
          <button onClick={() => handlePanelClick('scenarios')} className={activePanel === 'scenarios' ? 'active' : ''}>
            <div className="button-content">
              <FontAwesomeIcon icon={faCogs} size="xl" />
              <span>{tabConfig.scenarios?.label || 'Scenario'}</span>
              <span className="current-selection">{selectedScenario ? selectedScenario.name : ''}</span>
            </div>
          </button>
        )}
      </div>

      <div className="button-group bottom">
        <button disabled={!layerName}
          onClick={() => handlePanelClick('download')} className={`${activePanel === 'download' ? 'active' : ''} ${!layerName ? 'disabled' : ''}`}>
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
        <Link to="/" className="projects-back-button" title="Back to projects">
          <div className="button-content">
            <span className="projects-back-icons">
              <FontAwesomeIcon icon={faChevronLeft} size="xs" />
              <FontAwesomeIcon icon={faHome} size="lg" />
            </span>
            <span>Projects</span>
          </div>
        </Link>
      </div>

      {activePanel === 'crops' && (
        <CropsPanel
          crops={crops}
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          setActivePanel={setActivePanel}
          tabConfig={tabConfig.crops}
        />
      )}

      {activePanel === 'globalWaterModels' && (
        <GlobalWaterModelsPanel
          globalWaterModels={globalWaterModels}
          selectedGlobalWaterModel={selectedGlobalWaterModel}
          setSelectedGlobalWaterModel={setSelectedGlobalWaterModel}
          setActivePanel={setActivePanel}
          tabConfig={tabConfig.water_models}
        />
      )}

      {activePanel === 'climateModels' && (
        <ClimateModelsPanel
          climateModels={climateModels}
          selectedClimateModel={selectedClimateModel}
          setSelectedClimateModel={setSelectedClimateModel}
          setActivePanel={setActivePanel}
          tabConfig={tabConfig.climate_models}
        />
      )}

      {activePanel === 'scenarios' && (
        <ScenarioPanel
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          setActivePanel={setActivePanel}
          tabConfig={tabConfig.scenarios}
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
          setLayerName={setLayerName}
          tabConfig={tabConfig.variables}
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
          setLayerName={setLayerName}
          tabConfig={tabConfig.crop_specific}
        />
      )}

      {activePanel === 'download' && (
        <DownloadPanel clearLayers={clearLayers} />
      )}

      {activePanel === 'info' && (
        <InfoPanel
          onClick={isFirstTimeInfo ? handleInfoPanelClick : undefined}
          onClose={handleInfoClose}
          hasTimeline={!!(
          (!hasCrops || selectedCrop) &&
          (!hasGlobalWaterModels || selectedGlobalWaterModel) &&
          (!hasClimateModels || selectedClimateModel) &&
          (!hasScenarios || selectedScenario) &&
          (selectedVariable || selectedCropVariable)
        )}
        />
      )}
    </div>
  );
};

export default SidePanel;
