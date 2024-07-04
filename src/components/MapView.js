import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
  useMapEvent,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';


const NoMapOverlay = () => {
  return (
    <div style={mapOverlayStyle}>
      <div style={overlayContentStyle}>
        <p>This layer is unavailable</p>
        <p>Please refer to the publication for more information.</p>
        <a href="https://www.epfl.ch/labs/change/publications" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <AutoStoriesIcon fontSize='medium' /> Our publications
        </a>
      </div>
    </div>
  );
};

const UpdateLayer = ({ layer }) => {
  const map = useMap();
  useEffect(() => {
    console.log('Adding WMS layer:', layer);
    const wmsLayer = L.tileLayer.wms("https://drop4crop-api-dev.epfl.ch/geoserver/ows", {
      layers: layer,
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      tiled: true,
      zIndex: 2 // Setting zIndex to ensure WMS layer is on top
    }).addTo(map);

    return () => {
      map.removeLayer(wmsLayer);
    };
  }, []);

  return null;
};

const MapClickHandler = ({ layer }) => {
  const map = useMap();

  useMapEvent('click', async (e) => {
    const bbox = map.getBounds().toBBoxString();
    const size = map.getSize();
    const width = size.x;
    const height = size.y;

    const url = `https://drop4crop-api-dev.epfl.ch/geoserver/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=${layer}&QUERY_LAYERS=${layer}&STYLES=&BBOX=${bbox}&CRS=CRS:84&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&INFO_FORMAT=text/plain&I=${Math.floor(e.containerPoint.x)}&J=${Math.floor(e.containerPoint.y)}`;

    try {
      const response = await axios.get(url);
      const responseText = response.data;

      const match = responseText.match(/-{40,}\n(.*?)\n-{40,}/s);
      const value = match ? match[1].trim() : 'No data';

      L.popup()
        .setLatLng(e.latlng)
        .setContent(`${value}`)
        .openOn(map);
    } catch (error) {
      console.error('Error fetching WMS data:', error);
    }
  });

  return null;
};

const MapView = ({ wmsLayer }) => {
  const corner1 = L.latLng(-90, -200)
  const corner2 = L.latLng(90, 200)
  const bounds = L.latLngBounds(corner1, corner2)
  console.log("Layer", wmsLayer);
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer
        center={[35, 20]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        maxBoundsViscosity={1.0}
        maxBounds={bounds}
        minZoom={3}
      >
        <UpdateLayer layer={wmsLayer} />
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains='abcd'
          maxZoom={20}
          zIndex={0}
        />
        <ZoomControl position="bottomright" />
        <MapClickHandler layer={wmsLayer} />
        </MapContainer>
      {wmsLayer ? null : <NoMapOverlay />}
    </div>
  );
};

const mapOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999, // Ensure it is above other map elements
  pointerEvents: 'none', // Make the overlay background non-interactive
};

const overlayContentStyle = {
  color: 'white',
  fontSize: '1.5em',
  textAlign: 'center',
  padding: '10px',
  borderRadius: '5px',
  pointerEvents: 'auto', // Make the overlay content interactive
};

const linkStyle = {
  color: '#d1a766',
  textDecoration: 'none',
};

export default MapView;