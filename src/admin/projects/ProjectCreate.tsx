import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    required,
} from 'react-admin';
import { Box, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapPreview from './MapPreview';

const YEAR_AXIS_TOOLTIP =
    'Used to draw the year bar in the public UI. Leave empty if no variable in ' +
    'this project has has_time=true.';

const transform = (data: any) => {
    const ya = data.year_axis;
    if (!ya || (ya.min == null && ya.max == null && ya.step == null)) {
        return { ...data, year_axis: null };
    }
    return { ...data, year_axis: { mode: 'range', ...ya } };
};

const ProjectCreate = () => {
    return (
        <Create redirect="show" transform={transform}>
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
                <BooleanInput source="enabled" defaultValue={true} />
                <NumberInput
                    source="sort_order"
                    defaultValue={0}
                    helperText="Lower numbers appear first on the splash page"
                />
            </SimpleForm>
        </Create>
    );
};

export default ProjectCreate;
