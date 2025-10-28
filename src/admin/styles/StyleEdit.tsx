/* eslint react/jsx-key: off */
import React, { useState, useEffect } from 'react';
import {
    ArrayInput,
    Button,
    Edit,
    NumberInput,
    SimpleForm,
    SimpleFormIterator,
    TextField,
    TextInput,
    required
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';


const parseCSV = (csv) => {
    const lines = csv.split('\n');
    const result = [];

    for (const line of lines) {
        const values = line.split(',').map(value => value.trim());
        if (values.length === 6 && !isNaN(values[0])) {
            result.push({
                value: parseFloat(values[0]),
                red: parseInt(values[1], 10),
                green: parseInt(values[2], 10),
                blue: parseInt(values[3], 10),
                opacity: parseInt(values[4], 10),
                label: parseFloat(values[5])
            });
        }
    }

    return result;
};

export const UpdateFromCSV = () => {
    const { setValue } = useFormContext();
    const [csvData, setCsvData] = useState('');

    return (
        <>
            <div>
                <textarea
                    placeholder="You may use a QGIS saved styly by pasting the data here.
It should look similar to:

# QGIS Generated Color Map Export File
INTERPOLATION:INTERPOLATED
0.523522,215,25,28,255,0.5235
2.246340,253,174,97,255,2.2463
3.969157,255,255,191,255,3.9692"
                    onChange={(event) => setCsvData(event.target.value)}
                    rows="10"
                    style={{ width: '200%', marginBottom: '20px' }}
                />
            </div>
            <Button onClick={() => {
                const parsedData = parseCSV(csvData);
                setValue('style', parsedData);
            }
            } variant="contained">Update from CSV</Button>
        </>
    )
}

const StyleEdit = () => {

    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" validate={[required()]} />
                <UpdateFromCSV />
                <ArrayInput source="style" validate={[required()]}>
                    <SimpleFormIterator inline>
                        <NumberInput source="value" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="red" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="green" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="blue" validate={[required()]} sx={{ width: '10%' }} />
                        <NumberInput source="opacity" validate={[required()]} sx={{ width: '10%' }} defaultValue={255} />
                        <NumberInput source="label" validate={[required()]} sx={{ width: '10%' }} />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Edit>
    );
};

export default StyleEdit;
