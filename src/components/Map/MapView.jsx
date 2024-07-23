import React, { useEffect, forwardRef } from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  GeoJSON,
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
import { LegendControl } from './Legend';
import { MapClickHandler } from './Queries';
import ne_50m_admin_0_countries from "./ne_50m_admin_0_countries.json";

const UpdateLayer = ({ wmsParams, geoserverUrl }) => {
  const map = useMap();

  useEffect(() => {
    if (!wmsParams) return;

    const layer = L.tileLayer.wms(geoserverUrl, {
      layers: wmsParams,
      format: 'image/png',
      transparent: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
    };
  }, [wmsParams, geoserverUrl, map]);

  return null;
};



const MapView = forwardRef(({ wmsParams, geoserverUrl, setBoundingBox, enableSelection, setEnableSelection, countryAverages, setCountryAverages }, ref) => {
  const corner1 = L.latLng(-90, -200);
  const corner2 = L.latLng(90, 200);
  const bounds = L.latLngBounds(corner1, corner2);

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
                  backgroundColor: '#d1a766', // Active track color
                },
                '& .MuiSwitch-track': {
                  backgroundColor: countryAverages ? '#d1a766' : '#888', // Active: '#d1a766', Inactive: '#888'
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: countryAverages ? '#d1a766' : '#ccc', // Active: '#d1a766', Inactive: '#ccc'
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
        zoom={4}
        style={{ height: "100vh", width: "100%" }}
        zoomControl={false}
        maxBoundsViscosity={1.0}
        maxBounds={bounds}
        minZoom={3}
      >
        <UpdateLayer wmsParams={wmsParams} geoserverUrl={geoserverUrl} />
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains='abcd'
          maxZoom={20}
          zIndex={0} // Ensuring the base layer is below the WMS layer
        />
        <GeoJSON data={ne_50m_admin_0_countries} />
        <MapOverlay wmsParams={wmsParams} />
        <ZoomControl position="bottomright" />
        <ScaleControl imperial={false} maxWidth={250} />
        <MapClickHandler wmsParams={wmsParams} geoserverUrl={geoserverUrl} />
        <BoundingBoxSelection ref={ref} setBoundingBox={setBoundingBox} enableSelection={enableSelection} setEnableSelection={setEnableSelection} />
        <LegendControl wmsParams={wmsParams} geoserverUrl={geoserverUrl} />
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
  paddingLeft: '5px',
  borderRadius: '5px',
  borderColor: 'rgba(0, 0, 0, 0.7)',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000, // Ensure the toggle switch is above the map
  opacity: '0.8',
  borderTop: '1px solid #444',
  justifyContent: 'center',
  paddingLeft: '20px',
  borderRadius: '10px',
};
