import React, { useEffect, useRef, useContext, useState } from 'react';
import { AppContext, AppProvider } from '../contexts/AppContext';
import { LayerManagerProvider } from '../contexts/LayerManagerContext';
import MapView from '../components/Map/MapView';
import SidePanel from '../components/SidePanel';
import BottomBar from '../components/BottomBar';
import ShowcaseOverlay from '../components/ShowcaseOverlay';
import './App.css';
import { useSearchParams } from 'react-router-dom';
import {
  cropItems,
  globalWaterModelsItems,
  climateModelsItems,
  scenariosItems,
  variablesItems,
  cropVariablesItems,
} from '../variables';


const FrontendApp = () => {
  const boundingBoxSelectionRef = useRef(null);

  return (
    <AppProvider>
      <LayerManagerProvider>
        <FrontendAppContent boundingBoxSelectionRef={boundingBoxSelectionRef} />
      </LayerManagerProvider>
    </AppProvider>
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
      // Disable showcase mode when URL params are present
      setShowcaseMode(false);
      // Show info panel when loading from URL
      setActivePanel('info');

      // Look up the full objects from the variables file
      if (crop) {
        const cropObj = cropItems.find(c => c.id === crop);
        if (cropObj) {
          setSelectedCrop({ ...cropObj, enabled: true });
        }
      }

      // Handle crop-specific variable
      if (cropVariable) {
        const cropVariableObj = cropVariablesItems.find(v => v.id === cropVariable);
        if (cropVariableObj) {
          setSelectedCropVariable({ ...cropVariableObj, enabled: true });
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
          const waterModelObj = globalWaterModelsItems.find(w => w.id === waterModel);
          if (waterModelObj) {
            setSelectedGlobalWaterModel({ ...waterModelObj, enabled: true });
          }
        }
        if (climateModel) {
          const climateModelObj = climateModelsItems.find(c => c.id === climateModel);
          if (climateModelObj) {
            setSelectedClimateModel({ ...climateModelObj, enabled: true });
          }
        }
        if (scenario) {
          const scenarioObj = scenariosItems.find(s => s.id === scenario);
          if (scenarioObj) {
            setSelectedScenario({ ...scenarioObj, enabled: true });
          }
        }
        if (variable) {
          const variableObj = variablesItems.find(v => v.id === variable);
          if (variableObj) {
            setSelectedVariable({ ...variableObj, enabled: true });
          }
        }
        if (year) {
          setSelectedTime(parseInt(year, 10));
        }
      }

      // Mark that we've applied URL params
      setUrlParamsApplied(true);
    }
  }, [searchParams, loadingGroups, urlParamsApplied, setSelectedCrop, setSelectedGlobalWaterModel, setSelectedClimateModel, setSelectedScenario, setSelectedVariable, setSelectedCropVariable, setSelectedTime, setShowcaseMode, setActivePanel]);

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
