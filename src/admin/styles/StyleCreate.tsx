/* eslint react/jsx-key: off */
import {
    ArrayInput,
    Create,
    NumberInput,
    SelectInput,
    SimpleForm,
    SimpleFormIterator,
    TextInput,
    required,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { Box, Typography, Alert } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { UpdateFromQGIS } from './StyleEdit';

const interpolationTypeChoices = [
    { id: 'linear', name: 'Linear (smooth gradient)' },
    { id: 'discrete', name: 'Discrete (stepped/bucketed)' },
];

const labelDisplayModeChoices = [
    { id: 'auto', name: 'Auto (evenly-spaced labels)' },
    { id: 'manual', name: 'Manual (show all labels)' },
];

// Component to show warning when manual mode with many steps
const LabelSettingsWarning = () => {
    const labelDisplayMode = useWatch({ name: 'label_display_mode' });
    const style = useWatch({ name: 'style' });

    const isManual = labelDisplayMode === 'manual';
    const steps = style?.length || 0;
    const showWarning = isManual && steps > 8;

    if (!showWarning) return null;

    return (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
            <Typography variant="body2">
                <strong>Warning:</strong> Manual mode with {steps} labels may cause display issues on the map legend.
                Consider using Auto mode, which will show evenly-spaced labels.
            </Typography>
        </Alert>
    );
};

// Component to conditionally show label count input
const LabelCountInput = () => {
    const labelDisplayMode = useWatch({ name: 'label_display_mode' });

    if (labelDisplayMode === 'manual') return null;

    return (
        <NumberInput
            source="label_count"
            label="Number of Labels"
            min={2}
            max={20}
            defaultValue={5}
            helperText="How many evenly-spaced labels to show (default: 5)"
            sx={{ width: '200px' }}
        />
    );
};

const StyleCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm>
                <TextInput source="name" validate={[required()]} fullWidth />
                <SelectInput
                    source="interpolation_type"
                    choices={interpolationTypeChoices}
                    defaultValue="linear"
                    helperText="Linear: smooth gradient between colors. Discrete: each value falls into a bucket."
                />

                {/* Label Display Settings */}
                <Box sx={{ mt: 2, mb: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Legend Label Settings
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Control how labels appear on the map legend. Auto mode shows evenly-spaced labels
                        to prevent overcrowding when you have many color stops.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <SelectInput
                            source="label_display_mode"
                            choices={labelDisplayModeChoices}
                            defaultValue="auto"
                            helperText="Auto: show limited labels. Manual: show all."
                            sx={{ minWidth: '250px' }}
                        />
                        <LabelCountInput />
                    </Box>
                    <LabelSettingsWarning />
                </Box>

                <UpdateFromQGIS />
                <ArrayInput source="style" validate={[required()]}>
                    <SimpleFormIterator inline>
                        <NumberInput source="value" validate={[required()]} sx={{ width: '12%' }} helperText="Threshold value" />
                        <NumberInput source="red" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} />
                        <NumberInput source="green" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} />
                        <NumberInput source="blue" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} />
                        <NumberInput source="opacity" validate={[required()]} sx={{ width: '10%' }} min={0} max={255} defaultValue={255} />
                        <TextInput source="label" sx={{ width: '20%' }} helperText="e.g., '0.1 - 0.2'" />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Create>
    );
};

export default StyleCreate;
