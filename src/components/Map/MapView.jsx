import React, { useEffect, forwardRef } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
  useMapEvent,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import CircularProgress from '@mui/material/CircularProgress';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import axios from 'axios';
import BoundingBoxSelection from './BoundingBoxSelection';

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

const MapClickHandler = ({ wmsParams, geoserverUrl }) => {
  const map = useMap();

  useMapEvent('click', async (e) => {
    const bbox = map.getBounds().toBBoxString();
    const size = map.getSize();
    const width = size.x;
    const height = size.y;

    const url = `${geoserverUrl}/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=${wmsParams}&QUERY_LAYERS=${wmsParams}&STYLES=&BBOX=${bbox}&CRS=CRS:84&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&INFO_FORMAT=text/plain&I=${Math.floor(e.containerPoint.x)}&J=${Math.floor(e.containerPoint.y)}`;

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

const UpdateLayer = ({ wmsParams, geoserverUrl }) => {
  const map = useMap();

  useEffect(() => {
    if (wmsParams !== undefined) {
      console.log('Adding WMS layer:', wmsParams);
    }
    const wmsLayer = L.tileLayer.wms(`${geoserverUrl}/ows`, {
      layers: wmsParams,
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      tiled: true,
      zIndex: 2 // Setting zIndex to ensure WMS layer is on top
    }).addTo(map);

    return () => {
      map.removeLayer(wmsLayer);
    };
  }, [wmsParams, map]);

  return null;
};

const LegendControl = ({ wmsParams, geoserverUrl }) => {
  const map = useMap();

  useEffect(() => {
    const legendUrl = `${geoserverUrl}/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=${wmsParams}&FORMAT=image/png&TRANSPARENT=true&LEGEND_OPTIONS=fontColor:0xFFFFFF;fontAntiAliasing:true;`;

    const legendContainer = L.DomUtil.create('div', 'legend-container');
    legendContainer.style.backgroundColor = '#4a4a4a';
    legendContainer.style.padding = '10px';
    legendContainer.style.borderRadius = '5px';
    legendContainer.style.opacity = '0.95';

    // Apply the text color to all child elements
    legendContainer.style.setProperty('color', '#d3d3d3', 'important');

    const legendTitle = L.DomUtil.create('div', 'legend-title', legendContainer);
    legendTitle.innerHTML = '<strong>Legend</strong>';
    legendTitle.style.color = '#d3d3d3'; // Apply color to title explicitly

    const legendImage = L.DomUtil.create('img', 'legend-image', legendContainer);
    legendImage.src = legendUrl;
    legendImage.alt = 'Legend';

    const legendControl = L.control({ position: 'topright' });

    legendControl.onAdd = () => {
      return legendContainer;
    };

    legendControl.addTo(map);

    return () => {
      legendControl.remove();
    };
  }, [wmsParams, geoserverUrl, map]);

  return null;
};



const MapOverlay = ({ wmsParams }) => {
  // Returns an overlay if the layer is loading or unavailable
  if (wmsParams) {
    return null;
  }

  if (wmsParams === undefined) {
    return (
      <div style={mapOverlayStyle}>
        <div style={overlayContentStyle}>
          <CircularProgress sx={{
            color: '#d1a766',
          }} />
        </div>
      </div>
    );
  }

  return <NoMapOverlay />;
};

const MapView = forwardRef(({ wmsParams, geoserverUrl, setBoundingBox, enableSelection, setEnableSelection }, ref) => {
  const corner1 = L.latLng(-90, -200);
  const corner2 = L.latLng(90, 200);
  const bounds = L.latLngBounds(corner1, corner2);

  return (
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
      <MapOverlay wmsParams={wmsParams} />
      <ZoomControl position="bottomright" />
      <MapClickHandler wmsParams={wmsParams} geoserverUrl={geoserverUrl} />
      <BoundingBoxSelection ref={ref} setBoundingBox={setBoundingBox} enableSelection={enableSelection} setEnableSelection={setEnableSelection} />
      <LegendControl wmsParams={wmsParams} geoserverUrl={geoserverUrl} />
    </MapContainer>
  );
});

export default MapView;

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
