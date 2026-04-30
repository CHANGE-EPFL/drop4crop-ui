import React, { useState, useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';

const renderVariableLabel = (variable) => {
    const hasName = variable.name && variable.name.trim();
    const hasAbbr = variable.abbreviation && variable.abbreviation.trim();

    if (hasName && hasAbbr) {
        if (variable.subscript) {
            return <span>{variable.name} ({variable.abbreviation}<sub>{variable.subscript}</sub>)</span>;
        }
        return `${variable.name} (${variable.abbreviation})`;
    }
    if (hasName) return variable.name;
    if (hasAbbr) {
        if (variable.subscript) {
            return <span>{variable.abbreviation}<sub>{variable.subscript}</sub></span>;
        }
        return variable.abbreviation;
    }
    return variable.slug || variable.id;
};

const VariablePanel = ({
    variables,
    selectedVariable,
    setSelectedVariable,
    setActivePanel,
    selectedCropVariable,
    setSelectedCropVariable,
    setLayerName,
    tabConfig,
}) => {
    const handleClose = () => {
        setActivePanel(null);
    };

    const handleChipClick = (variable) => {
        if (selectedVariable && selectedVariable.id === variable.id) {
            setSelectedVariable(undefined);  // Deselect if the same variable is clicked
        } else {
            // Clear the layer immediately when switching from crop-specific to time-based variable
            // This prevents the old layer from persisting during the transition
            if (selectedCropVariable) {
                setLayerName(null);  // Clear map layer immediately
                setSelectedCropVariable(undefined);  // Deselect the Crop variable, as we cannot have both at the same time
            }
            setSelectedVariable(variable);  // Select the variable
            setActivePanel(null);
        }
    };

    // Dynamically group variables by group_name
    const groups = useMemo(() => {
        const result = {};
        variables.forEach(v => {
            const group = v.group_name || 'Other';
            if (!result[group]) result[group] = [];
            result[group].push(v);
        });
        // Sort variables within each group by sort_order
        Object.values(result).forEach(groupVars => {
            groupVars.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        });
        return result;
    }, [variables]);

    return (
        <div className="popup">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PanelTitleWithTooltip title={tabConfig?.label || "Variable"} tooltip={tabConfig?.help_text
                        ? <MarkdownTooltip>{tabConfig.help_text}</MarkdownTooltip>
                        : null} />
                </div>
                <Tooltip
                    title="Close panel"
                    placement="left"
                    disableFocusListener disableTouchListener enterDelay={10}
                    arrow
                >
                    <CloseIcon
                        sx={{
                            fontSize: '1.2rem',
                            color: '#acd8d8',
                            cursor: 'pointer',
                            '&:hover': {
                                color: '#ffffff'
                            }
                        }}
                        onClick={handleClose}
                    />
                </Tooltip>
            </div>

            <>
                {Object.entries(groups).map(([groupName, groupVars]) => (
                    <div className="chips-group" key={groupName}>
                        <h5>{groupName}</h5>
                        <div className="chips-list">
                            {groupVars.map(variable => (
                                <Chip
                                    key={variable.id}
                                    label={renderVariableLabel(variable)}
                                    clickable
                                    className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                                    disabled={!variable.enabled}
                                    onClick={() => handleChipClick(variable)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </>

        </div>
    );
};

export default VariablePanel;
