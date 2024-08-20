import { useMap, useMapEvent } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { createRoot } from 'react-dom/client';

const CountryPopupContent = ({ country, countryAverage, onClose }) => {
    const handleClosePopup = () => {
        map.closePopup();
    };

    return (
        <div style={{ ...popupBoxStyle, width: '250px', height: '150px', padding: '10px', color: 'white', position: 'relative' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1em' }}>
                <b>{country.properties.name}</b>
                <Tooltip
                    title={(<>Country-scale values computed as detailed in [<i>future link to our publication</i>].</>)}
                    placement="right"
                    enterDelay={10}
                    arrow
                >
                    <HelpOutlineIcon style={{ fontSize: '1rem', marginLeft: '5px', cursor: 'pointer', color: '#d1a766' }} />
                </Tooltip>
            </span>
            <br />
            <div style={{ marginTop: '10px', lineHeight: '1.2em', textAlign: 'left', width: '100%' }}>
                <div>WF [m3]: {countryAverage?.wf || '...'}</div>
                <div>WFb [m3]: {countryAverage?.wfb || '...'}</div>
                <div>WFg [m3]: {countryAverage?.wfg || '...'}</div>
                <div>VWC [m3 ton-1]: {countryAverage?.vwc || '...'}</div>
                <div>VWCb [m3 ton-1]: {countryAverage?.vwcb || '...'}</div>
                <div>VWCg [m3 ton-1]: {countryAverage?.vwcg || '...'}</div>
                <div>WDb [years]: {countryAverage?.wdb || '...'}</div>
                <div>WDg [years]: {countryAverage?.wdg || '...'}</div>
            </div>
        </div>
    );
};

const PopupContentContainer = () => {
    const containerRef = useRef(document.createElement('div'));

    useEffect(() => {
        const container = containerRef.current;
        document.body.appendChild(container);

        return () => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        };
    }, []);

    return containerRef.current;
};

export const MapClickHandler = ({
    layerName,
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
            const response = await axios.get(`/api/layers/${layerName}/value`, {
                params: { lat, lon }
            });
            return response.data.value;
        } catch (error) {
            console.error('Error fetching pixel value:', error);
            return null;
        }
    };

    const handleClosePopup = () => {
        map.closePopup();
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

                const countryAverage = countryAverageValues.find(
                    (average) => average.country.name === country.properties.name
                );
                if (!rootRef.current) {
                    rootRef.current = createRoot(container);
                }
                rootRef.current.render(
                    <CountryPopupContent
                        country={country}
                        countryAverage={countryAverage}
                        onClose={handleClosePopup}
                    />
                );
                L.popup({
                    closeButton: true, // Enable the default close button
                    autoClose: true,
                    className: 'custom-leaflet-popup'
                })
                    .setLatLng(clickPosition)
                    .setContent(container)
                    .openOn(map);

                return;
            }

            try {
                const pixelValue = await fetchPixelValue(clickPosition.lat, clickPosition.lng);
                if (!rootRef.current) {
                    rootRef.current = createRoot(container);
                }
                rootRef.current.render(
                    <div style={{ ...popupBoxStyle, width: '200px', padding: '10px', position: 'relative', textAlign: 'left' }}>
                        <div style={{ textAlign: 'left', width: '100%' }}>
                            <b>Lat</b>: {clickPosition.lat.toFixed(6)}°
                            <br />
                            <b>Lon</b>: {clickPosition.lng.toFixed(6)}°
                            <br />
                            <b>Value</b>: {pixelValue !== null ? pixelValue.toFixed(2) : 'No data'}
                        </div>
                    </div>
                );

                L.popup({
                    closeButton: true, // Enable the default close button
                    autoClose: true,
                    className: 'custom-leaflet-popup'
                })
                    .setLatLng(clickPosition)
                    .setContent(container)
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
            map.closePopup(); // Ensure the popup is closed when the component unmounts
        };
    }, [map]);

    return null;
};

export default MapClickHandler;

const popupBoxStyle = {
    backgroundColor: '#333',
    padding: '10px',
    borderRadius: '5px',
    opacity: '0.95',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
    color: '#d3d3d3',
    fontSize: '1em',
    textAlign: 'center',
    lineHeight: '1.2em',
    minWidth: '150px',  // Ensures the popup is not too squished
    maxWidth: '300px',  // Limits the width
};
