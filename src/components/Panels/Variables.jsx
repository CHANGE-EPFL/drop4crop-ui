import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Icon from '@mui/material/Icon';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

const VariablePanel = ({ variables, selectedVariable, setSelectedVariable }) => {
    const [showCropSpecific, setShowCropSpecific] = useState(false);

    return (
        <div className="popup">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" style={{ fontSize: '1rem' }}>Variable</Typography>
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


            {
                !showCropSpecific ? (
                    <>
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
                                        onClick={() => setSelectedVariable(variable)}
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
                                        onClick={() => setSelectedVariable(variable)}
                                    />
                                ))}
                            </div>
                        </div>

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
                                        onClick={() => setSelectedVariable(variable)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="chips-group">
                            <h5>Renewability Rate</h5>
                            <div className="chips-list">
                                {variables.filter(variable => ['rb', 'rg'].includes(variable.id)).map(variable => (
                                    <Chip
                                        key={variable.id}
                                        label={`${variable.name} [${variable.unit}]`}
                                        clickable
                                        className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                                        disabled={!variable.enabled}
                                        onClick={() => setSelectedVariable(variable)}
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
                                        onClick={() => setSelectedVariable(variable)}
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
                                    onClick={() => setSelectedVariable(variable)}
                                />
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default VariablePanel;
