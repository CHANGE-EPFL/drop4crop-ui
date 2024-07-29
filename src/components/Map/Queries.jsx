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

    const fetchPixelValue = async (lat, lon) => {
        try {
            const response = await axios.get(`/api/layers/${wmsParams}/value`, {
                params: { lat, lon }
            });
            return response.data.value;
        } catch (error) {
            console.error('Error fetching pixel value:', error);
            return null;
        }
    };

    useMapEvent('click', (e) => {
        setClickPosition(e.latlng);
    });

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
                const pixelValue = await fetchPixelValue(clickPosition.lat, clickPosition.lng);
                L.popup()
                    .setLatLng(clickPosition)
                    .setContent(`
                    <b>Lat</b>: ${clickPosition.lat.toFixed(6)}°
                    <br><b>Lon</b>: ${clickPosition.lng.toFixed(6)}°
                    <br><b>Value</b>: ${pixelValue !== null ? pixelValue.toFixed(2) : 'No data'}`)
                    .openOn(map);
            } catch (error) {
                console.error('Error fetching pixel value:', error);
            }
        };

        fetchData();
    }, [clickPosition, highlightedFeature, countryAverages, countryPolygons, countryAverageValues]);

    return null;
};

export default MapClickHandler;
