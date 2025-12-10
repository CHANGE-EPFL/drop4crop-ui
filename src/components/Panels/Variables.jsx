import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import PanelTitleWithTooltip from './Title';

// Helper to render variable label with subscript
const renderVariableLabel = (variable) => {
    if (variable.subscript) {
        return (
            <span>
                {variable.name} ({variable.abbreviation}<sub>{variable.subscript}</sub>)
            </span>
        );
    }
    return `${variable.name} (${variable.abbreviation})`;
};

const VariablePanel = ({
    variables,
    selectedVariable,
    setSelectedVariable,
    setActivePanel,
    selectedCropVariable,
    setSelectedCropVariable,
    setLayerName,
}) => {
    const [showCropSpecific, setShowCropSpecific] = useState(false);

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

    return (
        <div className="popup">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PanelTitleWithTooltip title="Variable" tooltip={(
                        <>
                            Definition and details about the listed variables can be found in [<i>future link to our publication</i>].
                        </>
                    )} />
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
                            color: '#d1a766',
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

                <div className="chips-group">
                    <h5>Evapotranspiration [mm]</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['etb', 'etg'].includes(variable.id))
                            .sort((a, b) => {
                                const order = ['etb', 'etg'];
                                return order.indexOf(a.id) - order.indexOf(b.id);
                            })
                            .map(variable => (
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

                <div className="chips-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h5>Renewability Rates [mm]</h5>
                            <Tooltip
                                title="Blue renewability rate indicates the sum of surface runoff and groundwater recharge. The green renewability rate corresponds to the root zone soil moisture."
                                placement="right"
                                disableFocusListener disableTouchListener enterDelay={10}
                                arrow
                                style={{ marginLeft: '5px', marginBottom: '4px' }}
                            >
                                <HelpOutlineIcon sx={{ fontSize: '1rem', color: '#d1a766' }} />
                            </Tooltip>
                        </div>
                    </div>
                    <div className="chips-list">
                        {variables.filter(variable => ['rb', 'rg'].includes(variable.id))
                            .sort((a, b) => {
                                const order = ['rb', 'rg'];
                                return order.indexOf(a.id) - order.indexOf(b.id);
                            })
                            .map(variable => (
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

                <div className="chips-group">
                    <h5>Virtual Water Content [m³ ton⁻¹]</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['vwcb', 'vwcg', 'vwc'].includes(variable.id))
                            .sort((a, b) => {
                                const order = ['vwcb', 'vwcg', 'vwc'];
                                return order.indexOf(a.id) - order.indexOf(b.id);
                            })
                            .map(variable => (
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

                <div className="chips-group">
                    <h5>Water Footprint [m³]</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['wfb', 'wfg', 'wf'].includes(variable.id))
                            .sort((a, b) => {
                                const order = ['wfb', 'wfg', 'wf'];
                                return order.indexOf(a.id) - order.indexOf(b.id);
                            })
                            .map(variable => (
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

                <div className="chips-group">
                    <h5>Water Debt [years]</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['wdb', 'wdg'].includes(variable.id))
                            .sort((a, b) => {
                                const order = ['wdb', 'wdg'];
                                return order.indexOf(a.id) - order.indexOf(b.id);
                            })
                            .map(variable => (
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
            </>

        </div>
    );
};

export default VariablePanel;
