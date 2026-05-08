import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { Box, Divider, Paper, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import MapPreview from './MapPreview';
import StylePaletteInput from './StylePaletteInput';
import ProjectConfigEditor from './ProjectConfigEditor';

const YEAR_AXIS_TOOLTIP =
    'Used to draw the year bar in the public UI. Leave empty if no variable in ' +
    'this project has has_time=true.';

const TAB_KEYS = [
    { key: 'crops', defaultLabel: 'Crop' },
    { key: 'crop_specific', defaultLabel: 'Crop Specific' },
    { key: 'variables', defaultLabel: 'Variable' },
    { key: 'water_models', defaultLabel: 'Water Model' },
    { key: 'climate_models', defaultLabel: 'Climate Model' },
    { key: 'scenarios', defaultLabel: 'Scenario' },
];

const TabConfigSection = () => (
    <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TuneIcon color="primary" />
            <Typography variant="h6">Tab Configuration</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customize the display name and help tooltip for each side panel tab.
            Leave blank to use the default. Help text supports markdown (e.g.
            [link text](https://...)).
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {TAB_KEYS.map(({ key, defaultLabel }) => (
            <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {defaultLabel}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextInput
                        source={`tab_config.${key}.label`}
                        label="Tab label"
                        placeholder={defaultLabel}
                        helperText={`Default: "${defaultLabel}"`}
                        fullWidth
                    />
                    <TextInput
                        source={`tab_config.${key}.help_text`}
                        label="Help text (markdown)"
                        placeholder="Leave blank for default"
                        multiline
                        rows={2}
                        fullWidth
                    />
                </Box>
            </Box>
        ))}
    </Paper>
);

const YearAxisSection = () => (
    <Box sx={{ mt: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Typography variant="subtitle2">Year axis (timeline)</Typography>
            <Tooltip title={YEAR_AXIS_TOOLTIP} arrow placement="right">
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <NumberInput source="year_axis.min" label="Min" helperText="First year on the slider" />
            <NumberInput source="year_axis.max" label="Max" helperText="Last year on the slider" />
            <NumberInput source="year_axis.step" label="Step" helperText="Increment between ticks" />
        </Box>
        <NumberInput
            source="historical_year"
            label="Historical year"
            helperText='When set, this year uses the "historical" scenario instead of the selected one'
        />
    </Box>
);

// Clean tab_config: strip empty strings and remove empty tab objects so we
// don't persist { "crops": { "label": "" } } in the database.
const cleanTabConfig = (tc: any): any => {
    if (!tc || typeof tc !== 'object') return null;
    const result: any = {};
    for (const [key, val] of Object.entries(tc)) {
        if (!val || typeof val !== 'object') continue;
        const cleaned: any = {};
        for (const [field, v] of Object.entries(val as any)) {
            if (typeof v === 'string' && v.trim()) cleaned[field] = v.trim();
        }
        if (Object.keys(cleaned).length > 0) result[key] = cleaned;
    }
    return Object.keys(result).length > 0 ? result : null;
};

const CardLayerInput = () => {
    const projectId = useWatch({ name: 'id' });
    return (
        <ReferenceInput
            source="card_layer_id"
            reference="layers"
            perPage={500}
            filter={projectId ? { project_id: projectId } : {}}
        >
            <AutocompleteInput
                optionText="layer_name"
                label="Card preview layer"
                helperText="Layer rendered on the splash card map (optional)"
                fullWidth
            />
        </ReferenceInput>
    );
};

const transform = (data: any) => {
    const ya = data.year_axis;
    const yearAxis = (!ya || (ya.min == null && ya.max == null && ya.step == null))
        ? null
        : { mode: 'range', ...ya };
    return { ...data, year_axis: yearAxis, tab_config: cleanTabConfig(data.tab_config) };
};

const ProjectEdit = () => {
    return (
        <Edit transform={transform}>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="title" validate={[required()]} fullWidth />
                <TextInput
                    source="slug"
                    validate={[required()]}
                    helperText="URL-friendly identifier (e.g., 'water-footprints')"
                    fullWidth
                />
                <TextInput source="description" multiline rows={3} fullWidth />
                <MapPreview />
                <Box sx={{ maxWidth: 400, mb: 2 }}>
                    <CardLayerInput />
                    <StylePaletteInput
                        source="card_style_id"
                        helperText="Overrides the layer's default style on the splash card (optional)"
                    />
                </Box>
                <BooleanInput source="enabled" />
                <NumberInput
                    source="sort_order"
                    helperText="Lower numbers appear first on the splash page"
                />
                <YearAxisSection />
                <ProjectConfigEditor />
                <TabConfigSection />
            </SimpleForm>
        </Edit>
    );
};

export default ProjectEdit;
