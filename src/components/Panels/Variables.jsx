import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import PanelTitleWithTooltip from './Title';

const VariablePanel = ({
    variables,
    selectedVariable,
    setSelectedVariable,
    setActivePanel,
}) => {
    const [showCropSpecific, setShowCropSpecific] = useState(false);

    const handleChipClick = (variable) => {
        if (selectedVariable && selectedVariable.id === variable.id) {
            setSelectedVariable(undefined);  // Deselect if the same variable is clicked
        } else {
            setSelectedVariable(variable);  // Select the variable
            setActivePanel(null);
        }
    };

    return (
        <div className="popup">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <PanelTitleWithTooltip title="Variable" tooltip={(
                    <>
                        Definition and details about the listed variables can be found in [<i>future link to our publication</i>].
                    </>
                )} />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" style={{ fontSize: '0.8rem', marginRight: '14px' }}>Timeseries</Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showCropSpecific}
                                onChange={() => setShowCropSpecific(!showCropSpecific)}
                                size="small"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#d1a766', // Active track color
                                    },
                                    '& .MuiSwitch-track': {
                                        backgroundColor: showCropSpecific ? '#d1a766' : '#888', // Active: '#d1a766', Inactive: '#888'
                                    },
                                    '& .MuiSwitch-thumb': {
                                        backgroundColor: showCropSpecific ? '#d1a766' : '#ccc', // Active: '#d1a766', Inactive: '#ccc'
                                    },
                                }}
                            />
                        }
                        label={<Typography variant="body2" style={{ fontSize: '0.8rem' }}>Crop Specific</Typography>}
                        labelPlacement="end"
                        style={{ marginRight: '8px' }}
                    />
                    <Tooltip
                        title="Does not align to timeseries"
                        placement="right"
                        disableFocusListener disableTouchListener enterDelay={10}
                        arrow
                    >
                        <HelpOutlineIcon sx={{ fontSize: '0.8rem' }} />
                    </Tooltip>
                </div>
            </div>

            {!showCropSpecific ? (
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
                                    <HelpOutlineIcon sx={{ fontSize: '1rem' }} />
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
            ) : (
                <div className="chips-group">
                    <h5>Crop Specific</h5>
                    <div className="chips-list">
                        {variables.filter(variable => [
                            'mirca_area_irrigated', 'mirca_area_total', 'mirca_rainfed',
                            'yield', 'production',
                        ].includes(variable.id)).map(variable => (
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
            )}
        </div>
    );
};

export default VariablePanel;
