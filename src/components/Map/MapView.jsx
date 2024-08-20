import React, { useState, useCallback, forwardRef, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  GeoJSON
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import BoundingBoxSelection from './BoundingBoxSelection';
import { ScaleControl } from 'react-leaflet';
import Switch from '@mui/material/Switch';
import { Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MapOverlay } from './Overlays';
import { MapClickHandler } from './Queries';
import './MapView.css';
import GeoRaster from './GeoRasterLayer';
import { LegendControl } from './Legend';

const MapView = forwardRef(({
  layerName,
  APIServerURL,
  setBoundingBox,
  enableSelection,
  setEnableSelection,
  countryAverages,
  setCountryAverages,
  countryPolygons,
  globalAverage,
  countryAverageValues,
  layerStyle,
  selectedVariable,
  loading,
}, ref) => {
  const [highlightedFeature, setHighlightedFeature] = useState(null);

  const highlightFeature = useCallback((e) => {
    const layer = e.target;
    setHighlightedFeature(layer.feature);
    layer.bringToFront();
  }, []);

  const resetHighlight = useCallback(() => {
    setHighlightedFeature(null);
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

  const corner1 = L.latLng(-90, -200);
  const corner2 = L.latLng(90, 200);
  const bounds = L.latLngBounds(corner1, corner2);

  return (
    <>
      <div style={toggleContainerMapStyle}>
        <FormControlLabel
          disabled={!layerName}
          control={
            <Switch
              checked={countryAverages}
              size="small"
              onChange={(e) => {
                e.stopPropagation();
                setCountryAverages(e.target.checked);
              }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#d1a766',
                },
                '& .MuiSwitch-track': {
                  backgroundColor: countryAverages ? '#d1a766' : '#888',
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: countryAverages ? '#d1a766' : '#ccc',
                },
              }}
            />
          }
          label={<Typography variant="body2">Country Scale Values</Typography>}
          labelPlacement="end"
          className={!layerName ? 'disabled' : ''}
        />
      </div>
      <MapContainer
        center={[35, 20]}
        zoom={1}
        style={{ height: "100vh", width: "100%", backgroundColor: "#252525" }}
        zoomControl={false}
        maxBoundsViscosity={1.0}
        maxBounds={bounds}
        minZoom={2}
      >
        <MapOverlay layerName={layerName} loading={loading} />
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains='abcd'
          maxZoom={20}
          zIndex={0}
        />
        {layerName && !loading ? <TileLayer
          url={`/api/cog/tiles/{z}/{x}/{y}.png?url=${layerName}`}
          zIndex={1}
        /> : null}
        {countryAverages && (
          <GeoJSON
            data={countryPolygons}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}
        <ZoomControl position="bottomright" />
        <ScaleControl imperial={false} maxWidth={250} />
        <MapClickHandler
          layerName={layerName}
          APIServerURL={APIServerURL}
          countryAverages={countryAverages}
          highlightedFeature={highlightedFeature}
          countryPolygons={countryPolygons}
          countryAverageValues={countryAverageValues}
        />
        <BoundingBoxSelection
          ref={ref}
          setBoundingBox={setBoundingBox}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
        />
        <LegendControl
          globalAverage={globalAverage}
          colorMap={layerStyle}
          selectedVariable={selectedVariable}
        />
      </MapContainer>
    </>
  );
});

export default MapView;

const toggleContainerMapStyle = {
  position: 'absolute',
  bottom: '110px',
  left: '100px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#333',
  color: '#d3d3d3',
  borderColor: 'rgba(0, 0, 0, 0.7)',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  opacity: '0.8',
  borderTop: '1px solid #444',
  justifyContent: 'center',
  paddingLeft: '20px',
  borderRadius: '10px',
};
