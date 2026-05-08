import { useWatch, useFormContext } from 'react-hook-form';
import { useGetOne } from 'react-admin';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Box, Button, Typography } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const FitExtent = ({ extent }: { extent: any }) => {
    const map = useMap();
    useEffect(() => {
        if (extent && Array.isArray(extent) && extent.length === 2) {
            map.fitBounds(extent, { animate: false });
        }
    }, [extent, map]);
    return null;
};

const MapRefCapture = ({ mapRef }: { mapRef: { current: any } }) => {
    const map = useMap();
    mapRef.current = map;
    return null;
};

const MapPreview = () => {
    const { setValue } = useFormContext();
    const cardLayerId = useWatch({ name: 'card_layer_id' });
    const cardStyleId = useWatch({ name: 'card_style_id' });
    const extent = useWatch({ name: 'extent' });
    const mapRef = useRef<any>(null);

    const captureExtent = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        const b = map.getBounds();
        setValue(
            'extent',
            [
                [parseFloat(b.getSouth().toFixed(4)), parseFloat(b.getWest().toFixed(4))],
                [parseFloat(b.getNorth().toFixed(4)), parseFloat(b.getEast().toFixed(4))],
            ],
            { shouldDirty: true },
        );
    }, [setValue]);

    const clearExtent = useCallback(() => {
        setValue('extent', null, { shouldDirty: true });
    }, [setValue]);

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

    const extentLabel = extent
        ? `SW: ${extent[0][0]}, ${extent[0][1]}  /  NE: ${extent[1][0]}, ${extent[1][1]}`
        : 'Not set (full world view)';

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Map Extent
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Navigate to the region you want, then click "Set as map extent".
                Both the splash card and public map will show this region.
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
                    center={[20, 0]}
                    zoom={2}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={true}
                    attributionControl={false}
                >
                    <FitExtent extent={extent} />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
                    {overlayUrl && (
                        <TileLayer
                            key={`${layer?.layer_name}-${cardStyleId ?? 'default'}`}
                            url={overlayUrl}
                            opacity={0.85}
                            noWrap
                        />
                    )}
                    <MapRefCapture mapRef={mapRef} />
                </MapContainer>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={captureExtent}>
                        Set as map extent
                    </Button>
                    {extent && (
                        <Button size="small" variant="text" color="secondary" onClick={clearExtent}>
                            Clear extent
                        </Button>
                    )}
                </Box>
                <Typography variant="caption" color="textSecondary">
                    {extentLabel}
                </Typography>
            </Box>
        </Box>
    );
};

export default MapPreview;
