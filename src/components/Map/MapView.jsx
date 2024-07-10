import React, { useEffect, useState, forwardRef } from 'react';
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
import { ScaleControl } from 'react-leaflet';
import Switch from '@mui/material/Switch';
import './MapView.css';

const NoMapOverlay = () => {
  return (
    <div className="map-overlay">
      <div className="overlay-content">
        <p>This layer is unavailable</p>
        <p>Please refer to the publication for more information.</p>
        <a href="https://www.epfl.ch/labs/change/publications" target="_blank" rel="noopener noreferrer" className="overlay-link">
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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const legendUrl = `${geoserverUrl}/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=${wmsParams}&FORMAT=image/png&TRANSPARENT=true&LEGEND_OPTIONS=fontColor:0xd3d3d3;fontAntiAliasing:true;`;

    const legendContainer = L.DomUtil.create('div', 'legend-container');
    legendContainer.style.backgroundColor = '#333';
    legendContainer.style.padding = '10px';
    legendContainer.style.borderRadius = '5px';
    legendContainer.style.opacity = '0.95';

    const toggleButton = L.DomUtil.create('button', 'toggle-button', legendContainer);
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
      <div className="map-overlay">
        <div className="overlay-content">
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
      <div className="toggle-container-map">
        <Switch
          checked={countryAverages}
          size="small"
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
          onChange={(e) => {
            e.stopPropagation();
            setCountryAverages(e.target.checked);
          }}
        />
        <span>Country Averages</span>
      </div >
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
      </MapContainer></>
  );
});

export default MapView;
