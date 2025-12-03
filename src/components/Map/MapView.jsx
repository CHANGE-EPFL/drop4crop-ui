import React, { useState, useCallback, forwardRef, useContext, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  GeoJSON,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapView.css';
import BoundingBoxSelection from './BoundingBoxSelection';
import { ScaleControl } from 'react-leaflet';
import { MapOverlay } from './Overlays';
import { MapClickHandler } from './Queries';
import { LegendControl } from './Legend';
import { AppContext } from '../../contexts/AppContext';

function UpdateMapZoom({ computedZoom, resetView, onResetDone }) {
  const map = useMap();
  useEffect(() => {
    if (resetView) {
      // If the current zoom is lower than the computed zoom,
      // then update it so the whole earth is visible.
      if (map.getZoom() < computedZoom) {
        map.setZoom(computedZoom);
      }
      // Optionally, update minZoom so that the user cannot zoom out past the new computed zoom.
      map.setMinZoom(computedZoom);
      onResetDone();
    }
  }, [computedZoom, resetView, map, onResetDone]);
  return null;
}

const MapView = forwardRef((props, ref) => {
  const {
    layerName,
    setBoundingBox,
    enableSelection,
    setEnableSelection,
    countryAverages,
    countryPolygons,
    globalAverage,
    layerStyle,
    interpolationType,
    labelDisplayMode,
    labelCount,
    selectedVariable,
    loading,
  } = useContext(AppContext);

  // Ref for container measurements
  const containerRef = useRef(null);
  // computedZoom is the zoom level where the width of the world (256 * 2^zoom) equals the container width.
  const [computedZoom, setComputedZoom] = useState(null);
  // resetView indicates that on window resize we want to update the map view.
  const [resetView, setResetView] = useState(false);

  // Recalculate the computed zoom from the container width.
  const updateZoom = () => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      // Set the computed zoom based on the container width with the grid size of 256 pixels.
      const newZoom = Math.log2(width / 256);
      setComputedZoom(newZoom);
      // Signal that the view should be reset.
      setResetView(true);
    }
  };

  // Run updateZoom on mount and on window resize.
  useEffect(() => {
    updateZoom();
    const handleResize = () => {
      updateZoom();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Until we have a computedZoom, don't render the map.
  if (computedZoom === null) {
    return (
      <div ref={containerRef} style={{ height: "100vh", width: "100%", backgroundColor: "#262626" }}>
        Loading...
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[0, 0]}
        // Set the default zoom to the computed zoom.
        zoom={computedZoom}
        // Do not force a fixed minZoom in the MapContainer props—let the helper update it.
        style={{ height: "100%", width: "100%", backgroundColor: "#262626" }}
        zoomControl={false}
        // Keep the maxBounds as before.
        maxBounds={[[-85, -180], [85, 180]]}
        worldCopyJump={false}
      >
        <UpdateMapZoom
          computedZoom={computedZoom}
          resetView={resetView}
          onResetDone={() => setResetView(false)}
        />
        <MapOverlay layerName={layerName} loading={loading} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution="© Data and content by: F. Bassani, Q. Sun, S. Bonetti | &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors | &copy; <a href='https://carto.com/attributions'>CARTO</a>"
          subdomains="abcd"
          maxZoom={20}
          noWrap={true}
        />
        {layerName && !loading && (
          <TileLayer
            key={layerName} // Force remount when layer changes to clear old tiles
            url={`/api/layers/xyz/{z}/{x}/{y}?layer=${layerName}`}
            maxZoom={20}
            noWrap={true}
            eventHandlers={{
              tileerror: (error, tile) => {
                console.error('Tile loading error:', {
                  error,
                  tile: tile.src,
                  layerName,
                  timestamp: new Date().toISOString()
                });
              }
            }}
          />
        )}
        {countryAverages && (
          <GeoJSON data={countryPolygons} />
        )}
        <ZoomControl position="bottomright" />
        <ScaleControl imperial={false} maxWidth={250} />
        <BoundingBoxSelection
          ref={ref}
          setBoundingBox={setBoundingBox}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
        />
        {layerName && (
          <>
            <MapClickHandler />
            <LegendControl
              globalAverage={globalAverage}
              colorMap={layerStyle}
              interpolationType={interpolationType}
              labelDisplayMode={labelDisplayMode}
              labelCount={labelCount}
              selectedVariable={selectedVariable}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
});

export default MapView;
