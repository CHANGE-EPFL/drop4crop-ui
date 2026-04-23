import { useRef } from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    required,
    useDataProvider,
    useNotify,
    useRedirect,
} from 'react-admin';
import { Box, Divider, Paper, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import MapPreview from './MapPreview';
import {
    ProjectConfigCreateSection,
    ProjectConfigCreateSectionHandle,
} from './ProjectConfigEditor';

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

const transform = (data: any) => {
    const ya = data.year_axis;
    const yearAxis = (!ya || (ya.min == null && ya.max == null && ya.step == null))
        ? null
        : { mode: 'range', ...ya };
    return { ...data, year_axis: yearAxis, tab_config: cleanTabConfig(data.tab_config) };
};

type RelationPath = 'crops' | 'water-models' | 'climate-models' | 'scenarios' | 'variables';

const ProjectCreate = () => {
    const configRef = useRef<ProjectConfigCreateSectionHandle>(null);
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();

    // After the project row is created, fan out five PUTs to seed the junction
    // tables from the config section's selections. If any fail we still land
    // the user on the Show page; they can re-open the Edit form to retry.
    const onSuccess = async (record: any) => {
        const selections = configRef.current?.getSelections();
        if (selections && record?.id) {
            const pairs: RelationPath[] = [
                'crops',
                'water-models',
                'climate-models',
                'scenarios',
                'variables',
            ];
            try {
                await Promise.all(
                    pairs.map((path) =>
                        (dataProvider as any).updateProjectRelation(
                            record.id as string,
                            path,
                            Array.from(selections[path]),
                        ),
                    ),
                );
                notify('Project created', { type: 'success' });
            } catch (err: any) {
                notify(
                    `Project created, but saving configuration failed: ${err?.message || err}. You can retry from the Edit page.`,
                    { type: 'warning' },
                );
            }
        } else {
            notify('Project created', { type: 'success' });
        }
        redirect('show', 'projects', record.id);
    };

    return (
        <Create mutationOptions={{ onSuccess }} transform={transform}>
            <SimpleForm>
                <TextInput source="title" validate={[required()]} fullWidth />
                <TextInput
                    source="slug"
                    validate={[required()]}
                    helperText="URL-friendly identifier (e.g., 'water-footprints')"
                    fullWidth
                />
                <TextInput source="description" multiline rows={3} fullWidth />
                <MapPreview />
                <NumberInput source="latitude" defaultValue={20.0} step={0.1} />
                <NumberInput source="longitude" defaultValue={0.0} step={0.1} />
                <NumberInput
                    source="zoom_level"
                    defaultValue={2}
                    min={1}
                    max={18}
                    helperText="Map zoom level for splash page preview (1-18)"
                />
                <BooleanInput source="enabled" defaultValue={true} />
                <NumberInput
                    source="sort_order"
                    defaultValue={0}
                    helperText="Lower numbers appear first on the splash page"
                />
                <Box sx={{ mt: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Typography variant="subtitle2">Year axis (timeline)</Typography>
                        <Tooltip title={YEAR_AXIS_TOOLTIP} arrow placement="right">
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                        </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <NumberInput source="year_axis.min" label="Min" />
                        <NumberInput source="year_axis.max" label="Max" />
                        <NumberInput source="year_axis.step" label="Step" />
                    </Box>
                </Box>
                <ProjectConfigCreateSection ref={configRef} />
                <TabConfigSection />
            </SimpleForm>
        </Create>
    );
};

export default ProjectCreate;
