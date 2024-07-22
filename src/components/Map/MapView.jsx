import React, { useEffect, useState, forwardRef } from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import CircularProgress from '@mui/material/CircularProgress';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import axios from 'axios';
import BoundingBoxSelection from './BoundingBoxSelection';
import { ScaleControl } from 'react-leaflet';
import Switch from '@mui/material/Switch';
import { Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

const NoMapOverlay = () => {
  return (
    <div style={mapOverlayStyle}>
      <p>This layer is unavailable</p>
      <p>Please refer to the publication for more information.</p>
      <a href="https://www.epfl.ch/labs/change/publications" target="_blank" rel="noopener noreferrer" style={linkStyle}>
        <AutoStoriesIcon fontSize='medium' /> Our publications
      </a>
    </div>
  );
};

const MapClickHandler = ({ wmsParams, geoserverUrl }) => {
  const map = useMap();

  useEffect(() => {
    if (!wmsParams) return;

    const clickHandler = (e) => {
      const { lat, lng } = e.latlng;
      const url = `${geoserverUrl}/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=${wmsParams}&QUERY_LAYERS=${wmsParams}&BBOX=${map.getBounds().toBBoxString()}&WIDTH=${map.getSize().x}&HEIGHT=${map.getSize().y}&X=${e.containerPoint.x}&Y=${e.containerPoint.y}&INFO_FORMAT=application/json`;

      axios.get(url).then(response => {
        // handle the response
        console.log(response.data);
      }).catch(error => {
        console.error(error);
      });
    };

    map.on('click', clickHandler);

    return () => {
      map.off('click', clickHandler);
    };
  }, [wmsParams, geoserverUrl, map]);

  return null;
};

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

const LegendControl = ({ wmsParams, geoserverUrl }) => {
  const map = useMap();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const legendUrl = `${geoserverUrl}/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=${wmsParams}&FORMAT=image/png&TRANSPARENT=true&LEGEND_OPTIONS=fontColor:0xd3d3d3;fontAntiAliasing:true;`;

    const legendContainer = L.DomUtil.create('div', 'legend-container');


    legendContainer.style.backgroundColor = '#333';
    legendContainer.style.padding = '10px';
    legendContainer.style.borderRadius = '5px';
    legendContainer.style.opacity = '0.95';

    const toggleButton = L.DomUtil.create('button', 'toggle-button', legendContainer);
    toggleButton.style.backgroundColor = '#282c34';
    toggleButton.style.color = '#d3d3d3';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '3px';
    toggleButton.style.padding = '5px';
    toggleButton.style.marginBottom = '10px';
    toggleButton.style.float = 'right'; // Move the button to the right

    toggleButton.innerHTML = isVisible ? 'Hide' : 'Show';
    toggleButton.className = 'toggle-button';
    toggleButton.onclick = (e) => {
      e.stopPropagation();
      setIsVisible(!isVisible);
      toggleButton.innerHTML = isVisible ? 'Show' : 'Hide';
      legendContent.style.display = isVisible ? 'none' : 'block';
    };

    const legendContent = L.DomUtil.create('div', 'legend-content', legendContainer);
    legendContent.style.display = isVisible ? 'block' : 'none';

    const legendTitle = L.DomUtil.create('div', 'legend-title', legendContent);
    legendTitle.innerHTML = '<strong>Legend</strong>';
    legendTitle.style.color = '#d3d3d3'; // Apply color to title explicitly

    const legendImage = L.DomUtil.create('img', 'legend-image', legendContent);
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
  }, [wmsParams, geoserverUrl, map, isVisible]);

  return null;
};

const MapOverlay = ({ wmsParams }) => {
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


const mapOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontSize: '1.5em',
  textAlign: 'center',
  zIndex: 999, // Ensure it is above other map elements
  pointerEvents: 'none', // Make the overlay background non-interactive
};

const linkStyle = {
  color: '#d1a766',
  textDecoration: 'none',
  marginTop: '10px', // Optional: Add some margin for better spacing
  pointerEvents: 'auto', // Make the link interactive
};


const overlayContentStyle = {
  color: 'white',
  fontSize: '1.5em',
  textAlign: 'center',
  padding: '10px',
  borderRadius: '5px',
  background: 'rgba(0, 0, 0, 0.7)',
  pointerEvents: 'auto', // Make the overlay content interactive
};


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
