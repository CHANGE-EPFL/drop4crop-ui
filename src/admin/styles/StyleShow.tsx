import React from 'react';
import {
    ArrayField,
    Datagrid,
    FunctionField,
    ListContextProvider,
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
    useList,
} from "react-admin";
import { createStyleGradient } from '../../utils/styleUtils';

// Custom ColorBar component that adapts to interpolation type
export const ColorBar = () => {
    const record = useRecordContext();
    if (!record || !record.style) return null;

    const isDiscrete = record.interpolation_type === 'discrete';

    if (isDiscrete && record.style.length > 0) {
        // Show discrete color blocks with labels
        const sortedStyle = [...record.style].sort((a, b) => a.value - b.value);
        return (
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', height: '30px', marginBottom: '5px' }}>
                    {sortedStyle.map((stop, index) => (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                backgroundColor: `rgba(${stop.red},${stop.green},${stop.blue},${(stop.opacity || 255) / 255})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: (stop.red + stop.green + stop.blue) / 3 > 128 ? '#000' : '#fff',
                                fontSize: '10px',
                                fontWeight: 'bold',
                            }}
                        >
                            {stop.label || `≤${stop.value}`}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Linear gradient
    const gradient = createStyleGradient(record.style);
    return (
        <div style={{ height: '30px', marginBottom: '20px', background: gradient, borderRadius: '4px' }} />
    );
};

// Interpolation type badge
const InterpolationTypeBadge = () => {
    const record = useRecordContext();
    if (!record) return null;

    const isDiscrete = record.interpolation_type === 'discrete';
    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            backgroundColor: isDiscrete ? '#ff9800' : '#2196f3',
            color: 'white',
            fontWeight: 'bold'
        }}>
            {isDiscrete ? 'Discrete' : 'Linear'}
        </span>
    );
};

// Color swatch for individual stops
const ColorSwatchField = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <div
            style={{
                width: '30px',
                height: '20px',
                backgroundColor: `rgba(${record.red},${record.green},${record.blue},${(record.opacity || 255) / 255})`,
                border: '1px solid #ccc',
                borderRadius: '3px'
            }}
        />
    );
};

// Sorted ArrayField that displays color stops from high to low (+ to 0 to -)
const SortedStyleArrayField = () => {
    const record = useRecordContext();
    if (!record || !record.style) return null;

    // Sort high to low for display
    const sortedStyle = [...record.style].sort((a, b) => b.value - a.value);
    const listContext = useList({ data: sortedStyle });

    return (
        <ListContextProvider value={listContext}>
            <Datagrid bulkActionButtons={false} rowClick={false}>
                <ColorSwatchField label="Color" />
                <TextField source="value" />
                <TextField source="red" />
                <TextField source="green" />
                <TextField source="blue" />
                <TextField source="opacity" />
                <TextField source="label" emptyText="-" />
            </Datagrid>
        </ListContextProvider>
    );
};

export const StyleShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="name" />
                <InterpolationTypeBadge label="Interpolation Type" />
                <ColorBar label="Preview" />
                <SortedStyleArrayField label="Style" />
            </SimpleShowLayout>
        </Show>
    );
};

export default StyleShow;
