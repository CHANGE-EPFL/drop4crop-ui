import React from 'react';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';


const PanelTitleWithTooltip = ({ title, tooltip }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" style={{ fontSize: '1rem' }}>{title}</Typography>
                <Tooltip
                    title={tooltip}
                    placement="right"
                    disableFocusListener disableTouchListener enterDelay={10}
                    arrow
                    style={{ marginLeft: '5px', marginBottom: '4px' }}
                >
                    <HelpOutlineIcon sx={{ fontSize: '1rem', color: '#d1a766' }} />
                </Tooltip>
            </div>
        </div>
    )
};

export default PanelTitleWithTooltip;
