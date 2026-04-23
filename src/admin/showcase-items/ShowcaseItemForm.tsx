import {
    AutocompleteInput,
    BooleanInput,
    NumberInput,
    ReferenceInput,
    TextInput,
    required,
    useGetOne,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createStyleGradient } from '../../utils/styleUtils';

interface ShowcaseItemFormProps {
    isEdit?: boolean;
}

// Keys tried in order on the layer record for the AutocompleteInput label.
// layer_name is always populated; crop/variable slug lookups come through the
// record too but would need extra joins, so layer_name is sufficient for the
// dropdown and the sidebar preview fills in the richer details.
const layerOptionText = (record: any) => record?.layer_name ?? '';

const ProjectScopedLayerInput = () => {
    const projectId: string | undefined = useWatch({ name: 'project_id' });
    return (
        <ReferenceInput
            source="layer_id"
            reference="layers"
            perPage={25}
            filter={projectId ? { project_id: projectId } : { project_id: '00000000-0000-0000-0000-000000000000' }}
            fullWidth
        >
            <AutocompleteInput
                optionText={layerOptionText}
                validate={[required()]}
                filterToQuery={(q) => ({ q })}
                helperText={projectId ? "Type to search layers in this project" : "Select a project first"}
                disabled={!projectId}
            />
        </ReferenceInput>
    );
};

const ShowcaseItemForm = ({ isEdit = false }: ShowcaseItemFormProps) => {
    return (
        <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {isEdit && <TextInput source="id" disabled />}
                <ReferenceInput source="project_id" reference="projects" fullWidth>
                    <AutocompleteInput
                        optionText="title"
                        validate={[required()]}
                        filterToQuery={(q) => ({ q })}
                    />
                </ReferenceInput>
                <ProjectScopedLayerInput />
                <TextInput source="title" validate={[required()]} fullWidth />
                <TextInput source="description" multiline rows={3} fullWidth />
                <NumberInput source="sort_order" defaultValue={0} />
                <BooleanInput source="enabled" defaultValue={true} />
            </Box>
            <Box sx={{ width: 360, flexShrink: 0 }}>
                <LayerPreview />
            </Box>
        </Box>
    );
};

// Sidebar preview for the currently-selected layer. Watches the form's
// layer_id and renders: identifying attributes (crop/variable/year/...),
// the style gradient, and a small Leaflet map showing tiles for the layer.
const LayerPreview = () => {
    const layerId: string | undefined = useWatch({ name: 'layer_id' });

    const { data: layer } = useGetOne(
        'layers',
        { id: layerId! },
        { enabled: !!layerId }
    );
    const { data: style } = useGetOne(
        'styles',
        { id: layer?.style_id },
        { enabled: !!layer?.style_id }
    );

    if (!layerId) {
        return (
            <Paper variant="outlined" sx={{ p: 2, position: 'sticky', top: 16 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Layer preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Select a layer on the left to see its style, metadata, and a map preview here.
                </Typography>
            </Paper>
        );
    }

    if (!layer) {
        return (
            <Paper variant="outlined" sx={{ p: 2, position: 'sticky', top: 16 }}>
                <Typography variant="body2" color="text.secondary">
                    Loading layer…
                </Typography>
            </Paper>
        );
    }

    const chips: Array<[string, string | number | undefined | null]> = [
        ['Year', layer.year],
        ['Min', layer.min_value != null ? Number(layer.min_value).toFixed(2) : null],
        ['Max', layer.max_value != null ? Number(layer.max_value).toFixed(2) : null],
        ['Avg', layer.global_average != null ? Number(layer.global_average).toFixed(2) : null],
    ];

    const gradient = style?.style ? createStyleGradient(style.style) : null;

    return (
        <Paper variant="outlined" sx={{ p: 2, position: 'sticky', top: 16 }}>
            <Typography variant="subtitle2" gutterBottom>
                Layer preview
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1, wordBreak: 'break-all' }}>
                {layer.layer_name}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                {chips.map(([k, v]) =>
                    v != null ? (
                        <Chip key={k} size="small" label={`${k}: ${v}`} variant="outlined" />
                    ) : null
                )}
            </Box>

            <Typography variant="caption" color="text.secondary">
                Style{style?.name ? `: ${style.name}` : ' (none assigned)'}
            </Typography>
            <Box
                sx={{
                    height: 10,
                    mt: 0.5,
                    mb: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: gradient ?? 'linear-gradient(to right, #000, #fff)',
                }}
            />

            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Map preview
            </Typography>
            <Box
                sx={{
                    height: 220,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <MapContainer
                    center={[20, 0]}
                    zoom={1}
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                        noWrap
                    />
                    <TileLayer
                        key={layer.layer_name}
                        url={`/api/layers/xyz/{z}/{x}/{y}?layer=${encodeURIComponent(layer.layer_name)}`}
                        noWrap
                    />
                </MapContainer>
            </Box>
        </Paper>
    );
};

export default ShowcaseItemForm;
