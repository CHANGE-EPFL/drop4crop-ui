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
    required
} from 'react-admin';
import { useFormContext } from 'react-hook-form';


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
