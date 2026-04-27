import { useWatch, useFormContext } from 'react-hook-form';
import { useGetOne } from 'react-admin';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const MapSyncToForm = () => {
    const { setValue } = useFormContext();
    const map = useMap();
    const skipNextSync = useRef(false);

    useMapEvents({
        moveend: () => {
            if (skipNextSync.current) {
                skipNextSync.current = false;
                return;
            }
            const center = map.getCenter();
            const zoom = map.getZoom();
            setValue('latitude', parseFloat(center.lat.toFixed(4)), { shouldDirty: true });
            setValue('longitude', parseFloat(center.lng.toFixed(4)), { shouldDirty: true });
            setValue('zoom_level', zoom, { shouldDirty: true });
        },
    });

    const latitude = useWatch({ name: 'latitude' });
    const longitude = useWatch({ name: 'longitude' });
    const zoomLevel = useWatch({ name: 'zoom_level' });

    useEffect(() => {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const zoom = parseInt(zoomLevel);
        if (isNaN(lat) || isNaN(lon) || isNaN(zoom)) return;

        const center = map.getCenter();
        const currentZoom = map.getZoom();
        if (
            Math.abs(center.lat - lat) > 0.001 ||
            Math.abs(center.lng - lon) > 0.001 ||
            currentZoom !== zoom
        ) {
            skipNextSync.current = true;
            map.setView([lat, lon], zoom);
        }
    }, [latitude, longitude, zoomLevel, map]);

    return null;
};

const MapPreview = () => {
    const latitude = useWatch({ name: 'latitude' });
    const longitude = useWatch({ name: 'longitude' });
    const zoomLevel = useWatch({ name: 'zoom_level' });
    const cardLayerId = useWatch({ name: 'card_layer_id' });
    const cardStyleId = useWatch({ name: 'card_style_id' });

    const lat = parseFloat(latitude) || 20.0;
    const lon = parseFloat(longitude) || 0.0;
    const zoom = parseInt(zoomLevel) || 2;

    // Resolve the chosen layer's `layer_name` (the tile endpoint identifies
    // layers by name, not UUID). Skipped when no layer is selected.
    const { data: layer } = useGetOne(
        'layers',
        { id: cardLayerId },
        { enabled: Boolean(cardLayerId) },
    );

    const overlayUrl = layer?.layer_name
        ? `/api/layers/xyz/{z}/{x}/{y}?layer=${encodeURIComponent(layer.layer_name)}${
              cardStyleId ? `&style_id=${cardStyleId}` : ''
          }`
        : null;

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Splash Page Preview
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Drag and zoom the map to set the card preview. The coordinates and zoom update automatically.
                When a card layer is selected below, it renders here with the chosen style override.
            </Typography>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 200,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid #ccc',
                }}
            >
                <MapContainer
                    center={[lat, lon]}
                    zoom={zoom}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={true}
                    attributionControl={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
                    {overlayUrl && (
                        <TileLayer
                            key={`${layer?.layer_name}-${cardStyleId ?? 'default'}`}
                            url={overlayUrl}
                            opacity={0.85}
                            noWrap
                        />
                    )}
                    <MapSyncToForm />
                </MapContainer>
            </Box>
        </Box>
    );
};

export default MapPreview;
