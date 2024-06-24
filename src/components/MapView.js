import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl, useMapEvent, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

export const BaseLayers = () => {
  const { BaseLayer } = LayersControl;
  // Set z index to 1 to make sure the base layer is always below the WMS layer
  return (
    <LayersControl>
    <BaseLayer checked name="CartoDB Dark">
    <TileLayer url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
      attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains='abcd' maxZoom={20}
          zIndex={1}
    />
    </BaseLayer>
    <BaseLayer name="OpenStreetMap">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.5}
          zIndex={1}
        />
    </BaseLayer>
</LayersControl>)
};

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
      center={[35, 20]}
      zoom={4}
      style={{ height: "100vh", width: "100%" }}
      zoomControl={false}
    >
      <BaseLayers />
      {/* <TileLayer provider="OpenStreetMap.Mapnik" /> */}
        {/* url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" */}
        {/* attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' */}
      {/* /> */}
      {/* <BaseMap /> */}
      <ZoomControl position="bottomright" />
      <UpdateLayer wmsParams={wmsParams} />
      <MapClickHandler wmsParams={wmsParams} />
    </MapContainer>
  );
};

export default MapView;
