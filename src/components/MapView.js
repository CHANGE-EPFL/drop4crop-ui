import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl, useMapEvent, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const UpdateLayer = ({ wmsParams }) => {
  const map = useMap();
  useEffect(() => {
    console.log("Loading layer: ", wmsParams)
    const wmsLayer = L.tileLayer.wms("https://drop4crop-api-dev.epfl.ch/geoserver/ows", {
      layers: wmsParams,
      format: "image/png",
      transparent: true,
      version: "1.3.0",
    }).addTo(map);

    return () => {
      map.removeLayer(wmsLayer);
    };
  }, [wmsParams, map]);

  return null;
};


const MapClickHandler = ({ wmsParams }) => {
  const map = useMap();

  useMapEvent('click', async (e) => {
    const { lat, lng } = e.latlng;
    const bbox = map.getBounds().toBBoxString();
    const size = map.getSize();
    const width = size.x;
    const height = size.y;

    const url = `https://drop4crop-api-dev.epfl.ch/geoserver/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=${wmsParams}&QUERY_LAYERS=${wmsParams}&STYLES=&BBOX=${bbox}&CRS=CRS:84&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&INFO_FORMAT=text/plain&I=${Math.floor(e.containerPoint.x)}&J=${Math.floor(e.containerPoint.y)}`;

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

const MapView = ({ wmsParams }) => {
  return (
    <MapContainer
      center={[40.416775, -3.703790]}  // Centered on Madrid
      zoom={6}
      style={{ height: "100vh", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ZoomControl position="bottomright" />
      <UpdateLayer wmsParams={wmsParams} />
      <MapClickHandler wmsParams={wmsParams} />
    </MapContainer>
  );
};

export default MapView;
