import { useMap, useMapEvent } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { useEffect, useState } from 'react';

export const MapClickHandler = ({
    wmsParams,
    geoserverUrl,
    countryAverages,
    highlightedFeature,
    countryPolygons,
    countryAverageValues
}) => {
    const map = useMap();
    const [clickPosition, setClickPosition] = useState(null);
    const [url, setUrl] = useState(null);

    const createBboxAroundPoint = (point, buffer) => {
        const latLngBounds = L.latLng(point.lat + buffer, point.lng + buffer)
            .toBounds(buffer * 2); // Creates a bounding box with a specific buffer size
        return [
            latLngBounds.getSouthWest().lng,
            latLngBounds.getSouthWest().lat,
            latLngBounds.getNorthEast().lng,
            latLngBounds.getNorthEast().lat,
        ].join(',');
    };

    useMapEvent('click', (e) => {
        setClickPosition(e.latlng);
        const bbox = createBboxAroundPoint(e.latlng, 0.01); // Adjust the buffer size as needed
        const size = map.getSize();
        const width = size.x;
        const height = size.y;

        setUrl(`${geoserverUrl}/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=${wmsParams}&QUERY_LAYERS=${wmsParams}&STYLES=&BBOX=${bbox}&CRS=CRS:84&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&INFO_FORMAT=text/plain&I=${Math.floor(e.containerPoint.x)}&J=${Math.floor(e.containerPoint.y)}`);
    });

    console.log("Click position:", clickPosition);

    useEffect(() => {
        if (!clickPosition) return;

        const fetchData = async () => {
            if (countryAverages && countryPolygons) {
                if (!highlightedFeature) {
                    return;
                }
                // Get matching country from the highlighted feature
                const country = countryPolygons.features.find(
                    (feature) => feature.properties.name === highlightedFeature.properties.name
                );

                if (country) {
                    const countryAverage = countryAverageValues.find(
                        (average) => average.country.name === country.properties.name
                    );
                    console.log('Country average:', countryAverage);
                    if (countryAverage) {
                        L.popup()
                            .setLatLng(clickPosition)
                            .setContent(`<b>${country.properties.name}</b><br>Average: ${countryAverage.value.toFixed(2)}`)
                            .openOn(map);
                    }
                    return;
                }
            }

            try {
                const response = await axios.get(url);
                const responseText = response.data;

                const match = responseText.match(/-{40,}\n(.*?)\n-{40,}/s);
                let value = match ? match[1].trim() : 'No data';

                if (value !== 'No data') {
                    // Extracting the value
                    const grayValueMatch = value.match(/GRAY_INDEX = (.+)/);
                    if (grayValueMatch) {
                        const grayValue = grayValueMatch[1].trim();
                        value = grayValue === 'NaN' ? null : parseFloat(grayValue);
                    } else {
                        value = null;
                    }
                } else {
                    value = null;
                }

                L.popup()
                    .setLatLng(clickPosition)
                    .setContent(`
                    <b>Lat</b>: ${clickPosition.lat.toFixed(6)}°
                    <br><b>Lon</b>: ${clickPosition.lng.toFixed(6)}°
                    <br><b>Value</b>: ${value ? value.toFixed(2) : 'No data'}`)
                    .openOn(map);
            } catch (error) {
                console.error('Error fetching WMS data:', error);
            }

        };

        fetchData();
    }, [clickPosition, highlightedFeature, url]);

    return null;
};

export default MapClickHandler;
