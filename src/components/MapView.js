import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const UpdateLayer = ({ wmsParams }) => {
  const map = useMap();

  useEffect(() => {
      const wmsLayer = L.tileLayer.wms("https://drop4crop-api-dev.epfl.ch/geoserver/ows", {
      layers: wmsParams.layer,
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

const MapView = ({ wmsParams }) => {
  return (
      <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: "100vh", width: "100%" }}
          zoomControl={false}
      >
    <ZoomControl position="bottomright" />
      <UpdateLayer wmsParams={wmsParams} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
};

export default MapView;
