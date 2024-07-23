import { useMap, useMapEvent } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';


export const MapClickHandler = ({ wmsParams, geoserverUrl }) => {
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

export default MapClickHandler;