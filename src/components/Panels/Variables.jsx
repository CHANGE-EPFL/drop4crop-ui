import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import PanelTitleWithTooltip from './Title';

const VariablePanel = ({
    variables,
    selectedVariable,
    setSelectedVariable,
    setActivePanel,
    selectedCropVariable,
    setSelectedCropVariable,
}) => {
    const [showCropSpecific, setShowCropSpecific] = useState(false);

    const handleClose = () => {
        setActivePanel(null);
    };

    const handleChipClick = (variable) => {
        if (selectedVariable && selectedVariable.id === variable.id) {
            setSelectedVariable(undefined);  // Deselect if the same variable is clicked
        } else {
            if (selectedCropVariable) {
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
                    <h5>Evapotranspiration</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['etb', 'etg'].includes(variable.id)).map(variable => (
                            <Chip
                                key={variable.id}
                                label={`${variable.name} [${variable.unit}]`}
                                clickable
                                className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                                disabled={!variable.enabled}
                                onClick={() => handleChipClick(variable)}
                            />
                        ))}
                    </div>
                </div>

                <div className="chips-group">
                    <h5>Virtual Water Content</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['vwc', 'vwcb', 'vwcg', 'vwcg_perc', 'vwcb_perc'].includes(variable.id)).map(variable => (
                            <Chip
                                key={variable.id}
                                label={`${variable.name} [${variable.unit}]`}
                                clickable
                                className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                                disabled={!variable.enabled}
                                onClick={() => handleChipClick(variable)}
                            />
                        ))}
                    </div>
                </div>

                <div className="chips-group">
                    <h5>Water Footprint</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['wf', 'wfb', 'wfg'].includes(variable.id)).map(variable => (
                            <Chip
                                key={variable.id}
                                label={`${variable.name} [${variable.unit}]`}
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
                            <h5>Renewability Rates</h5>
                            <Tooltip
                                title="Soil moisture, surface water and groundwater"
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
                        {variables.filter(variable => ['rb', 'rg'].includes(variable.id)).map(variable => (
                            <Chip
                                key={variable.id}
                                label={`${variable.name} [${variable.unit}]`}
                                clickable
                                className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                                disabled={!variable.enabled}
                                onClick={() => handleChipClick(variable)}
                            />
                        ))}
                    </div>
                </div>

                <div className="chips-group">
                    <h5>Water Debt</h5>
                    <div className="chips-list">
                        {variables.filter(variable => ['wdb', 'wdg'].includes(variable.id)).map(variable => (
                            <Chip
                                key={variable.id}
                                label={`${variable.name} [${variable.unit}]`}
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
