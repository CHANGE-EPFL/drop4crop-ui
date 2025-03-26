import React, { useState, useCallback, forwardRef, useContext, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  GeoJSON,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapView.css';
import BoundingBoxSelection from './BoundingBoxSelection';
import { ScaleControl } from 'react-leaflet';
import { MapOverlay } from './Overlays';
import { MapClickHandler } from './Queries';
import { LegendControl } from './Legend';
import { AppContext } from '../../contexts/AppContext';

function SetInitialZoom({ zoom }) {
  const map = useMap();
  const initialSet = useRef(false);
  useEffect(() => {
    if (!initialSet.current) {
      map.setZoom(zoom);
      initialSet.current = true;
    }
  }, [map, zoom]);
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
    selectedVariable,
    loading,
  } = useContext(AppContext);

  // Ref for container to compute its width
  const containerRef = useRef(null);
  // Initialize computedZoom as null, so we don't render the map until it's set.
  const [computedZoom, setComputedZoom] = useState(null);
  const [highlightedFeature, setHighlightedFeature] = useState(null);

  useEffect(() => {
    const updateZoom = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;

        // Calculate the zoom level based on the container width
        // Assuming the tile size is 256x256 pixels
        const newZoom = Math.floor(Math.log2(width / 256));
        setComputedZoom(newZoom);
      }
    };

    updateZoom();
  }, []);


  const highlightFeature = useCallback((e) => {
    const layer = e.target;
    setHighlightedFeature(layer.feature);
    layer.bringToFront();
  }, []);

  const geoJsonStyle = useCallback((feature) => ({
    weight: 2,
    color: highlightedFeature && highlightedFeature === feature ? '#ff7800' : '#3388ff',
    opacity: 1,
    fillOpacity: 0.2,
    fillColor: '#3388ff'
  }), [highlightedFeature]);

  const onEachFeature = useCallback((feature, layer) => {
    layer.on({
      click: highlightFeature,
    });
  }, [highlightFeature]);

  if (computedZoom === null) {
    // Wait until we have the container width
    return <div ref={containerRef} style={{ height: "100vh", width: "100%", backgroundColor: "#262626" }}>Loading...</div>;
  }

  return (
    <div ref={containerRef} style={{ height: "100vh", width: "100%", backgroundColor: "#262626" }}>
      <MapContainer
        center={[0, 0]}
        zoom={computedZoom}
        minZoom={computedZoom}
        style={{ height: "100%", width: "100%", backgroundColor: "#262626" }}
        zoomControl={false}
        maxBoundsViscosity={1.0}
        maxBounds={[[-85, -180], [85, 180]]}
        worldCopyJump={false}
      >
        <SetInitialZoom zoom={computedZoom} />
        <MapOverlay layerName={layerName} loading={loading} />
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains='abcd'
          maxZoom={20}
          zIndex={0}
          noWrap={true}
        />
        {layerName && !loading ? (
          <TileLayer
            url={`/api/tiles/{z}/{x}/{y}?layer=${layerName}`}
            maxZoom={20}
            zIndex={1}
            noWrap={true}
          />
        ) : null}
        {countryAverages && (
          <GeoJSON
            data={countryPolygons}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}
        <ZoomControl position="bottomright" />
        <ScaleControl imperial={false} maxWidth={250} />
        <BoundingBoxSelection
          ref={ref}
          setBoundingBox={setBoundingBox}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
        />
        {layerName ? (
          <>
            <MapClickHandler />
            <LegendControl
              globalAverage={globalAverage}
              colorMap={layerStyle}
              selectedVariable={selectedVariable}
            />
          </>
        ) : null}
      </MapContainer>
    </div>
  );
});

export default MapView;
