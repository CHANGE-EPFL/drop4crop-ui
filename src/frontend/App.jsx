import React, { useEffect, useRef, useContext, useState } from 'react';
import { AppContext, AppProvider } from '../contexts/AppContext';
import { LayerManagerProvider } from '../contexts/LayerManagerContext';
import MapView from '../components/Map/MapView';
import SidePanel from '../components/SidePanel';
import BottomBar from '../components/BottomBar';
import ShowcaseOverlay from '../components/ShowcaseOverlay';
import './App.css';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { ProjectProvider } from '../contexts/ProjectContext';


const FrontendApp = () => {
  const { slug } = useParams();
  const boundingBoxSelectionRef = useRef(null);

  return (
    <ProjectProvider slug={slug}>
      <AppProvider>
        <LayerManagerProvider>
          <FrontendAppContent boundingBoxSelectionRef={boundingBoxSelectionRef} />
        </LayerManagerProvider>
      </AppProvider>
    </ProjectProvider>
  );
};

const FrontendAppContent = ({ boundingBoxSelectionRef }) => {
  const {
    selectedLayer,
    setSelectedLayer,
    setSelectedCrop,
    setSelectedGlobalWaterModel,
    setSelectedClimateModel,
    setSelectedScenario,
    setSelectedVariable,
    setSelectedCropVariable,
    setSelectedTime,
    selectedCrop,
    selectedGlobalWaterModel,
    selectedClimateModel,
    selectedScenario,
    selectedVariable,
    selectedCropVariable,
    loadingGroups,
    showcaseMode,
    setShowcaseMode,
    setActivePanel,
    crops,
    globalWaterModels,
    climateModels,
    scenarios,
    variables,
    cropVariables,
  } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [urlParamsApplied, setUrlParamsApplied] = useState(false);

  // Update selectedLayer whenever individual selections change
  // This needs to run even when SidePanel is hidden (showcase mode)
  useEffect(() => {
    const layerProps = {
      crop: selectedCrop?.id,
      water_model: selectedGlobalWaterModel?.id,
      climate_model: selectedClimateModel?.id,
      scenario: selectedScenario?.id,
      variable: selectedVariable?.id,
      crop_variable: selectedCropVariable?.id,
    };
    setSelectedLayer(layerProps);
  }, [
    selectedCrop,
    selectedGlobalWaterModel,
    selectedClimateModel,
    selectedScenario,
    selectedVariable,
    selectedCropVariable,
    setSelectedLayer,
  ]);

  // Load layer from URL parameters after groups are loaded
  useEffect(() => {
    // Only apply URL params once and after groups are loaded
    if (urlParamsApplied || loadingGroups) {
      return;
    }
    const crop = searchParams.get('crop');
    const waterModel = searchParams.get('water_model');
    const climateModel = searchParams.get('climate_model');
    const scenario = searchParams.get('scenario');
    const variable = searchParams.get('variable');
    const cropVariable = searchParams.get('crop_variable');
    const year = searchParams.get('year');

    if (crop || waterModel || climateModel || scenario || variable || cropVariable || year) {
      // Disable showcase mode when URL params are present. Leave activePanel
      // untouched so the map opens without the Info & Attribution popup —
      // user opens it on demand.
      setShowcaseMode(false);

      // Look up the full objects from context arrays
      if (crop) {
        const cropObj = crops.find(c => c.id === crop);
        if (cropObj) {
          setSelectedCrop(cropObj);
        }
      }

      // Handle crop-specific variable
      if (cropVariable) {
        const cropVariableObj = cropVariables.find(v => v.id === cropVariable);
        if (cropVariableObj) {
          setSelectedCropVariable(cropVariableObj);
        }
        // Clear climate layer parameters when loading crop-specific layer
        setSelectedGlobalWaterModel(null);
        setSelectedClimateModel(null);
        setSelectedScenario(null);
        setSelectedVariable(null);
        setSelectedTime(null);
      } else {
        // Only set climate layer parameters if NOT a crop-specific layer
        // Clear crop-specific variable
        setSelectedCropVariable(null);

        if (waterModel) {
          const waterModelObj = globalWaterModels.find(w => w.id === waterModel);
          if (waterModelObj) {
            setSelectedGlobalWaterModel(waterModelObj);
          }
        }
        if (climateModel) {
          const climateModelObj = climateModels.find(c => c.id === climateModel);
          if (climateModelObj) {
            setSelectedClimateModel(climateModelObj);
          }
        }
        if (scenario) {
          const scenarioObj = scenarios.find(s => s.id === scenario);
          if (scenarioObj) {
            setSelectedScenario(scenarioObj);
          }
        }
        if (variable) {
          const variableObj = variables.find(v => v.id === variable);
          if (variableObj) {
            setSelectedVariable(variableObj);
          }
        }
        if (year) {
          setSelectedTime(parseInt(year, 10));
        }
      }

      // Mark that we've applied URL params
      setUrlParamsApplied(true);
    }
  }, [searchParams, loadingGroups, urlParamsApplied, setSelectedCrop, setSelectedGlobalWaterModel, setSelectedClimateModel, setSelectedScenario, setSelectedVariable, setSelectedCropVariable, setSelectedTime, setShowcaseMode, setActivePanel, crops, globalWaterModels, climateModels, scenarios, variables, cropVariables]);

  return (
      <div style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Hide SidePanel in showcase mode */}
          {!showcaseMode && (
            <SidePanel
              clearLayers={() => boundingBoxSelectionRef.current?.clearLayers()}
            />
          )}
          <MapView ref={boundingBoxSelectionRef} />

          {/* Home button only visible during showcase mode (sidebar hidden) */}
          {showcaseMode && (
            <Link
              to="/"
              style={{
                position: 'absolute',
                top: 15,
                left: 15,
                zIndex: 1200,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(51, 51, 51, 0.9)',
                border: '1px solid rgba(209, 167, 102, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d1a766',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              title="Back to projects"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d1a766';
                e.currentTarget.style.background = 'rgba(51, 51, 51, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(209, 167, 102, 0.3)';
                e.currentTarget.style.background = 'rgba(51, 51, 51, 0.9)';
              }}
            >
              <FontAwesomeIcon icon={faHome} size="sm" />
            </Link>
          )}

          {/* Show BottomBar only when not in showcase mode and layer is configured */}
          {!showcaseMode && (
            selectedLayer.crop
            && selectedLayer.water_model
            && selectedLayer.climate_model
            && selectedLayer.scenario
          ) ? (
            <>
              <BottomBar />
              {/* <CountryPolygonSwitch /> */}
            </>
          ) : null}

          {/* Showcase overlay */}
          <ShowcaseOverlay />
        </div>
      </div>
  );
};

export default FrontendApp;
