import React, { useEffect, useRef, useContext, useCallback, useState } from 'react';
import { AppContext, AppProvider } from '../contexts/AppContext';
import { LayerManagerProvider } from '../contexts/LayerManagerContext';
import MapView from '../components/Map/MapView';
import SidePanel from '../components/SidePanel';
import BottomBar from '../components/BottomBar';
import './App.css';
import { useSearchParams } from 'react-router-dom';
import {
  cropItems,
  globalWaterModelsItems,
  climateModelsItems,
  scenariosItems,
  variablesItems,
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
    setSelectedCrop,
    setSelectedGlobalWaterModel,
    setSelectedClimateModel,
    setSelectedScenario,
    setSelectedVariable,
    setSelectedTime,
    loadingGroups,
  } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [urlParamsApplied, setUrlParamsApplied] = useState(false);

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
    const year = searchParams.get('year');

    if (crop || waterModel || climateModel || scenario || variable || year) {
      // Look up the full objects from the variables file
      if (crop) {
        const cropObj = cropItems.find(c => c.id === crop);
        if (cropObj) {
          setSelectedCrop({ ...cropObj, enabled: true });
        }
      }
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

      // Mark that we've applied URL params
      if (crop || waterModel || climateModel || scenario || variable || year) {
        setUrlParamsApplied(true);
      }
    }
  }, [searchParams, loadingGroups, urlParamsApplied, setSelectedCrop, setSelectedGlobalWaterModel, setSelectedClimateModel, setSelectedScenario, setSelectedVariable, setSelectedTime]);

  return (
      <div style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', flex: 1 }}>
          <SidePanel
            clearLayers={() => boundingBoxSelectionRef.current.clearLayers()}
          />
          <MapView ref={boundingBoxSelectionRef} />


          {(
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
        </div>
      </div>
  );
};

export default FrontendApp;
