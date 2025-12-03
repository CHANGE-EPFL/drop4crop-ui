import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    ChipField,
    useRecordContext
} from "react-admin";
import { createStyleGradient } from '../../utils/styleUtils';

// Custom ColorBarField component that shows discrete blocks for discrete styles
const ColorBarField = () => {
    const record = useRecordContext();
    if (!record || !record.style) return null;

    const isDiscrete = record.interpolation_type === 'discrete';

    if (isDiscrete && record.style.length > 0) {
        // Show discrete color blocks
        const sortedStyle = [...record.style].sort((a, b) => a.value - b.value);
        return (
            <div style={{ display: 'flex', height: '20px', marginBottom: '10px' }}>
                {sortedStyle.map((stop, index) => (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            backgroundColor: `rgba(${stop.red},${stop.green},${stop.blue},${(stop.opacity || 255) / 255})`,
                        }}
                        title={stop.label || `≤ ${stop.value}`}
                    />
                ))}
            </div>
        );
    }

    // Linear gradient
    const gradient = createStyleGradient(record.style);
    return (
        <div style={{ height: '20px', marginBottom: '10px', background: gradient }} />
    );
};

// Custom component to display min, max and steps values
const MinValueField = () => {
    const record = useRecordContext();
    if (!record || !record.style) return null;
    const minValue = Math.min(...record.style.map(s => s.value));
    return <span>{minValue.toFixed(2)}</span>;
};

const MaxValueField = () => {
    const record = useRecordContext();
    if (!record || !record.style) return null;
    const maxValue = Math.max(...record.style.map(s => s.value));
    return <span>{maxValue.toFixed(2)}</span>;
};

const StepsField = () => {
    const record = useRecordContext();
    if (!record || !record.style) return null;
    const steps = record.style.length;
    return <span>{steps}</span>;
};

// Interpolation type chip with color coding
const InterpolationTypeField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const isDiscrete = record.interpolation_type === 'discrete';
    return (
        <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            backgroundColor: isDiscrete ? '#ff9800' : '#2196f3',
            color: 'white'
        }}>
            {isDiscrete ? 'Discrete' : 'Linear'}
        </span>
    );
};

export const StyleList = () => {
    return (
        <List storeKey={false}>
            <Datagrid rowClick="show">
                <TextField source="name" />
                <InterpolationTypeField label="Type" />
                <MinValueField label="Min Value" />
                <MaxValueField label="Max Value" />
                <StepsField label="Steps" />
                <ColorBarField label="Style" />
            </Datagrid>
        </List>
    );
};

export default StyleList;
