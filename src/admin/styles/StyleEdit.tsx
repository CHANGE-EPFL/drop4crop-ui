/* eslint react/jsx-key: off */
import React, { useState } from 'react';
import {
    ArrayInput,
    Button,
    Edit,
    NumberInput,
    SelectInput,
    SimpleForm,
    SimpleFormIterator,
    TextInput,
    required,
    useRecordContext,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';


/**
 * Parses QGIS color map format into style array
 * Example QGIS format:
 * INTERPOLATION:DISCRETE
 * 0.1,49,54,149,105,<= 0.1
 * 0.22,69,117,180,255,0.1 - 0.2
 */
const parseQGISColorMap = (content) => {
    const lines = content.split('\n');
    const result = [];
    let interpolationType = 'linear';

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        // Check for interpolation header
        if (trimmedLine.startsWith('INTERPOLATION:')) {
            const interp = trimmedLine.split(':')[1]?.toUpperCase();
            interpolationType = interp === 'DISCRETE' ? 'discrete' : 'linear';
            continue;
        }

        // Skip nan/nv lines
        if (trimmedLine.startsWith('nan') || trimmedLine.startsWith('nv')) continue;

        // Parse color stop: value,R,G,B,A,label
        const parts = trimmedLine.split(',');
        if (parts.length >= 5 && !isNaN(parseFloat(parts[0]))) {
            result.push({
                value: parseFloat(parts[0]),
                red: parseInt(parts[1], 10),
                green: parseInt(parts[2], 10),
                blue: parseInt(parts[3], 10),
                opacity: parseInt(parts[4], 10),
                label: parts.length >= 6 ? parts.slice(5).join(',').trim() : null
            });
        }
    }

    return { stops: result, interpolationType };
};

export const UpdateFromQGIS = () => {
    const { setValue, getValues } = useFormContext();
    const [qgisData, setQgisData] = useState('');

    const handleImport = () => {
        const { stops, interpolationType } = parseQGISColorMap(qgisData);
        if (stops.length > 0) {
            setValue('style', stops);
            setValue('interpolation_type', interpolationType);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <textarea
                placeholder={`Paste QGIS color map export here. Example:

# QGIS Generated Color Map Export File
INTERPOLATION:DISCRETE
0.1,49,54,149,105,<= 0.1
0.22,69,117,180,255,0.1 - 0.2
0.32,107,174,214,255,0.2 - 0.3
1.5,255,255,191,255,1.0 - 1.5
1000,165,0,38,255,> 10`}
                value={qgisData}
                onChange={(event) => setQgisData(event.target.value)}
                rows={10}
                style={{ width: '100%', marginBottom: '10px', fontFamily: 'monospace' }}
            />
            <Button
                onClick={handleImport}
                variant="contained"
                disabled={!qgisData.trim()}
            >
                Import from QGIS Format
            </Button>
        </div>
    );
};

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

const StyleEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />
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
        </Edit>
    );
};

export default StyleEdit;
