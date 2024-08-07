import { useMap, useMapEvent } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import React from 'react';

const CountryPopupContent = ({ country, countryAverage }) => {
    return (
        <div>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <b>{country.properties.name}</b>
                <Tooltip
                    title="Average value calculated from all pixels within the country"
                    placement="right"
                    enterDelay={10}
                    arrow
                >
                    <HelpOutlineIcon style={{ fontSize: '1rem', marginLeft: '0', cursor: 'pointer' }} />
                </Tooltip>
            </span>
            <br />
            Average: {countryAverage.value.toFixed(2)}
        </div>
    );
};


const PopupContentContainer = () => {
    const containerRef = useRef(document.createElement('div'));
    useEffect(() => {
        const container = containerRef.current;
        document.body.appendChild(container);
        return () => {
            document.body.removeChild(container);
        };
    }, []);

    return containerRef.current;
};

export const MapClickHandler = ({
    wmsParams,
    APIServerURL,
    countryAverages,
    highlightedFeature,
    countryPolygons,
    countryAverageValues
}) => {
    const map = useMap();
    const [clickPosition, setClickPosition] = useState(null);
    const rootRef = useRef(null);
    const container = PopupContentContainer();

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
                const country = countryPolygons.features.find(
                    (feature) => feature.properties.name === highlightedFeature.properties.name
                );

                if (country) {
                    const countryAverage = countryAverageValues.find(
                        (average) => average.country.name === country.properties.name
                    );
                    if (countryAverage) {
                        if (!rootRef.current) {
                            rootRef.current = createRoot(container);
                        }

                        rootRef.current.render(
                            <CountryPopupContent
                                country={country}
                                countryAverage={countryAverage}
                            />
                        );

                        L.popup()
                            .setLatLng(clickPosition)
                            .setContent(container)
                            .openOn(map);

                        return;
                    }
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
    }, [clickPosition, highlightedFeature, countryAverages, countryPolygons, countryAverageValues, map, container]);

    useEffect(() => {
        return () => {
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }
        };
    }, []);

    return null;
};

export default MapClickHandler;