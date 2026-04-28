import { useState } from 'react';
import {
    Edit,
    SimpleForm,
    ReferenceInput,
    AutocompleteInput,
    useGetOne,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import StylePaletteInput from '../projects/StylePaletteInput';

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

const GlobePreview = () => {
    const globeLayerId = useWatch({ name: 'globe_layer_id' });
    const globeStyleId = useWatch({ name: 'globe_style_id' });

    const { data: layer } = useGetOne(
        'layers',
        { id: globeLayerId },
        { enabled: Boolean(globeLayerId) },
    );

    const overlayUrl = layer?.layer_name
        ? `/api/layers/xyz/{z}/{x}/{y}?layer=${encodeURIComponent(layer.layer_name)}${
              globeStyleId ? `&style_id=${globeStyleId}` : ''
          }`
        : null;

    return (
        <Box sx={{ mb: 2, width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
                Preview
            </Typography>
            <Box
                sx={{
                    width: '100%',
                    height: 300,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid #ccc',
                }}
            >
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    touchZoom={false}
                    keyboard={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
                    {overlayUrl && (
                        <TileLayer
                            key={`${layer?.layer_name}-${globeStyleId ?? 'default'}`}
                            url={overlayUrl}
                            opacity={0.85}
                            noWrap
                        />
                    )}
                </MapContainer>
            </Box>
        </Box>
    );
};

const GlobeLayerInput = () => {
    const [projectFilter, setProjectFilter] = useState<string | null>(null);

    return (
        <>
            <ReferenceInput
                source="_project_filter"
                reference="projects"
                perPage={100}
            >
                <AutocompleteInput
                    optionText="title"
                    label="Filter by project"
                    helperText="Narrow the layer list to a specific project (optional)"
                    fullWidth
                    onChange={(value) => setProjectFilter(value || null)}
                />
            </ReferenceInput>
            <ReferenceInput
                source="globe_layer_id"
                reference="layers"
                perPage={500}
                filter={projectFilter ? { project_id: projectFilter } : {}}
            >
                <AutocompleteInput
                    optionText="layer_name"
                    label="Globe layer"
                    helperText="Data layer rendered on the globe (optional)"
                    fullWidth
                />
            </ReferenceInput>
        </>
    );
};

const SiteSettingsEdit = () => (
    <Edit id={SINGLETON_ID} resource="site-settings" title="Site Settings">
        <SimpleForm sx={{ maxWidth: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Globe Background</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure the data layer overlay shown on the splash page globe.
            </Typography>
            <GlobePreview />
            <Box sx={{ maxWidth: 400 }}>
                <GlobeLayerInput />
                <StylePaletteInput
                    source="globe_style_id"
                    helperText="Overrides the layer's default style on the globe (optional)"
                />
            </Box>
        </SimpleForm>
    </Edit>
);

export default SiteSettingsEdit;
