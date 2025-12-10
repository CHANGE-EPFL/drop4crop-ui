import { useMap, useMapEvent } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { useEffect, useState, useRef, useContext } from 'react';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppContext } from '../../contexts/AppContext';

// Subtle layer info header for popups - shows essential info only
const LayerInfoHeader = ({ crop, variable, cropVariable, year }) => {
    const parts = [];
    if (crop) parts.push(crop.name);
    if (variable) {
        const varLabel = variable.subscript
            ? `${variable.abbreviation}${variable.subscript}`
            : variable.abbreviation;
        parts.push(varLabel);
    }
    if (cropVariable) parts.push(cropVariable.name);
    // Only show year for time-based variables, not crop-specific
    if (year && !cropVariable) parts.push(year);

    if (parts.length === 0) return null;

    return (
        <div style={{
            fontSize: '0.85em',
            color: '#d1a766',
            opacity: 0.8,
            marginBottom: '10px',
            paddingBottom: '8px',
            borderBottom: '1px solid #444',
            textAlign: 'center',
            width: '100%',
        }}>
            {parts.join(' · ')}
        </div>
    );
};

const CountryPopupContent = ({ country, countryAverage, onClose }) => {
    const handleClosePopup = () => {
        map.closePopup();
    };

    return (
        <div style={{ ...popupBoxStyle, width: '250px', height: '200px', padding: '10px', color: 'white', position: 'relative' }}>
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
            <table style={{ marginTop: '10px', lineHeight: '1.2em', textAlign: 'left', width: '100%' }}>
                <tbody>
                    <tr>
                        <td>WF [m3]</td>
                        <td>{countryAverage?.var_wf.toFixed(3) || 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>WFb [m3]</td>
                        <td>{countryAverage?.var_wfb.toFixed(3) || 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>WFg [m3]</td>
                        <td>{countryAverage?.var_wfg.toFixed(3) || 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>VWC [m3 ton-1]</td>
                        <td>{countryAverage?.var_vwc.toFixed(3) || 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>VWCb [m3 ton-1]</td>
                        <td>{countryAverage?.var_vwcb.toFixed(3) || 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>VWCg [m3 ton-1]</td>
                        <td>{countryAverage?.var_vwcg.toFixed(3) || 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>WDb [years]</td>
                        <td>{countryAverage?.var_wdb.toFixed(3) || 'n/a'}</td>
                    </tr>
                    <tr>
                        <td>WDg [years]</td>
                        <td>{countryAverage?.var_wdg.toFixed(3) || 'n/a'}</td>
                    </tr>
                </tbody>
            </table>
        </div >
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

export const MapClickHandler = () => {
    const {
        layerName,
        countryAverages,
        highlightedFeature,
        countryPolygons,
        countryAverageValues,
        enableSelection,
        setEnableSelection,
        selectedCrop,
        selectedVariable,
        selectedCropVariable,
        selectedTime,
    } = useContext(AppContext);
    const map = useMap();
    const [clickPosition, setClickPosition] = useState(null);
    const rootRef = useRef(null);
    const popupRef = useRef(null);
    const container = PopupContentContainer();

    const fetchPixelValue = async (lat, lon, layer) => {
        try {
            const response = await axios.get(`/api/layers/${layer}/value`, {
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

    // Clear click position only when popup is closed by user (not programmatically)
    useEffect(() => {
        const onPopupClose = (e) => {
            // Only reset if closed by user interaction, not by our updates
            if (!e.popup._keepOpen) {
                setClickPosition(null);
                popupRef.current = null;
            }
        };
        map.on('popupclose', onPopupClose);
        return () => {
            map.off('popupclose', onPopupClose);
        };
    }, [map]);

    useMapEvent('click', (e) => {
        if (enableSelection) {
            setEnableSelection(false);
            return;
        }
        // Close existing popup and open new one at clicked location
        if (popupRef.current) {
            map.closePopup(popupRef.current);
            popupRef.current = null;
        }
        setClickPosition(e.latlng);
    });

    // Close popup when layer is cleared (switching modes, layer doesn't exist, etc.)
    // Use a small delay to distinguish between layer transitions and intentional clearing
    useEffect(() => {
        if (!layerName && popupRef.current) {
            const timeout = setTimeout(() => {
                // Only close if layer is still null after delay (not a transition)
                if (popupRef.current) {
                    map.closePopup(popupRef.current);
                    popupRef.current = null;
                    setClickPosition(null);
                }
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [layerName, map]);

    // Update popup content when click position OR layer/selection changes
    useEffect(() => {
        if (!clickPosition || !layerName) return;

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

                // Only create popup if it doesn't exist
                if (!popupRef.current) {
                    requestAnimationFrame(() => {
                        popupRef.current = L.popup({
                            closeButton: true,
                            autoClose: false,
                            closeOnClick: false,
                            className: 'custom-leaflet-popup'
                        })
                            .setLatLng(clickPosition)
                            .setContent(container)
                            .openOn(map);
                    });
                }

                return;
            }

            try {
                const pixelValue = await fetchPixelValue(clickPosition.lat, clickPosition.lng, layerName);
                if (!rootRef.current) {
                    rootRef.current = createRoot(container);
                }
                rootRef.current.render(
                    <div style={{ ...popupBoxStyle, width: '200px', padding: '10px', position: 'relative', textAlign: 'left' }}>
                        <LayerInfoHeader
                            crop={selectedCrop}
                            variable={selectedVariable}
                            cropVariable={selectedCropVariable}
                            year={selectedTime}
                        />
                        <div style={{ textAlign: 'left', width: '100%' }}>
                            <b>Lat</b>: {clickPosition.lat.toFixed(6)}°
                            <br />
                            <b>Lon</b>: {clickPosition.lng.toFixed(6)}°
                            <br />
                            <b>Value</b>: {pixelValue !== null ? pixelValue.toFixed(2) : 'No data'}
                        </div>
                    </div>
                );

                // Only create popup if it doesn't exist, otherwise just update content
                if (!popupRef.current) {
                    requestAnimationFrame(() => {
                        popupRef.current = L.popup({
                            closeButton: true,
                            autoClose: false,
                            closeOnClick: false,
                            className: 'custom-leaflet-popup'
                        })
                            .setLatLng(clickPosition)
                            .setContent(container)
                            .openOn(map);
                    });
                }

            } catch (error) {
                console.error('Error fetching pixel value:', error);
            }
        };

        fetchData();
    }, [clickPosition, layerName, selectedCrop, selectedVariable, selectedCropVariable, selectedTime, highlightedFeature, countryAverages, countryPolygons, countryAverageValues, map, container]);

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
    padding: '12px',
    borderRadius: '5px',
    opacity: '0.95',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
    color: 'white',
    fontSize: '1.05em',
    textAlign: 'center',
    lineHeight: '1.5em',
    minWidth: '150px',
    maxWidth: '300px',
};
