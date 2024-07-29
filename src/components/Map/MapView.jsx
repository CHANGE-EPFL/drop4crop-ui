import React, { useState, useCallback, forwardRef } from 'react';
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

const Legend = ({ min, max, colorMap }) => {
  const gradient = `linear-gradient(to bottom, ${colorMap.map(c => c.color).join(", ")})`;

  return (
    <div style={legendStyle}>
      <div style={{ ...legendColorBarStyle, background: gradient }} />
      <div style={legendLabelsStyle}>
        {colorMap.map((entry, index) => (
          <div key={index} className="legend-label">
            <span>{entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MapView = forwardRef(({
  wmsParams,
  geoserverUrl,
  setBoundingBox,
  enableSelection,
  setEnableSelection,
  countryAverages,
  setCountryAverages,
  countryPolygons,
  globalAverage,
  countryAverageValues,
}, ref) => {
  const [highlightedFeature, setHighlightedFeature] = useState(null);
  const [legendData, setLegendData] = useState({ min: 0, max: 100, colorMap: [] });

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

  const colorMapString = `
    0.52352285385132002,215,25,28,255,0.5235
    2.24634027481079013,253,174,97,255,2.2463
    3.96915769577026012,255,255,191,255,3.9692
    5.69197511672973011,171,221,164,255,5.6920
    7.4147925376892001,43,131,186,255,7.4148
  `; // Example color map string

  return (
    <>
      <div style={toggleContainerMapStyle}>
        <FormControlLabel
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
          label={<Typography variant="body2">Country Averages</Typography>}
          labelPlacement="end"
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
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains='abcd'
          maxZoom={20}
          zIndex={0}
        />
        <GeoRaster
          url={"http://drop4crop:88/api/layers/sdfrs/cog"}
          setLegendData={setLegendData}
          opacity={0.7}
          resolution={128}
          colorMapString={colorMapString}
        />
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
          wmsParams={wmsParams}
          geoserverUrl={geoserverUrl}
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
        {legendData.colorMap.length > 0 && (
          <Legend min={legendData.min} max={legendData.max} colorMap={legendData.colorMap} />
        )}
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

// Legend CSS
const legendStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '10px',
  borderRadius: '5px',
  boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
  zIndex: 1000,
  opacity: '0.8',
  display: 'flex',
  alignItems: 'center',
};

const legendColorBarStyle = {
  width: '20px',
  height: '200px',
  borderRadius: '5px',
  marginRight: '10px',
};

const legendLabelsStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '200px',
};
