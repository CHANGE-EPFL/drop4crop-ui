import React, { useEffect, useRef, useContext, useCallback } from 'react';
import { AppContext } from './contexts/AppContext';
import { LayerManagerProvider } from './contexts/LayerManagerContext';
import MapView from './components/Map/MapView';
import SidePanel from './components/SidePanel';
import BottomBar from './components/BottomBar';
import './App.css';
import CountryPolygonSwitch from './components/CountryPolygonSwitch';


const App = () => {
  const boundingBoxSelectionRef = useRef(null);
  const { selectedLayer } = useContext(AppContext);

  return (
    <LayerManagerProvider>
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
    </LayerManagerProvider>
  );
};

export default App;
