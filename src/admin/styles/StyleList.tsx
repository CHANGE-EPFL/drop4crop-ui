import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    useRecordContext,
    ReferenceManyCount,
} from "react-admin";
import { createStyleGradient } from '../../utils/styleUtils';
import { Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

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
    const isManual = record.label_display_mode === 'manual';
    const showWarning = isManual && steps > 8;

    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {steps}
            {showWarning && (
                <Tooltip title="Manual mode with many labels may cause display issues">
                    <WarningIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                </Tooltip>
            )}
        </span>
    );
};


// Label display mode badge
const LabelModeField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const isAuto = record.label_display_mode !== 'manual';
    const labelCount = record.label_count || 5;

    return (
        <Tooltip title={isAuto ? `Auto: showing ${labelCount} labels` : 'Manual: showing all labels'}>
            <span style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                backgroundColor: isAuto ? '#4caf50' : '#9c27b0',
                color: 'white'
            }}>
                {isAuto ? `Auto (${labelCount})` : 'Manual'}
            </span>
        </Tooltip>
    );
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
                <ReferenceManyCount
                    label="Layers"
                    reference="layers"
                    target="style_id"
                    link
                />
                <InterpolationTypeField label="Type" />
                <LabelModeField label="Labels" />
                <MinValueField label="Min" />
                <MaxValueField label="Max" />
                <StepsField label="Steps" />
                <ColorBarField label="Style" />
            </Datagrid>
        </List>
    );
};

export default StyleList;
