import React from 'react';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';


const PanelTitleWithTooltip = ({ title, tooltip, onClose }) => {
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
            {onClose && (
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
                        onClick={onClose}
                    />
                </Tooltip>
            )}
        </div>
    )
};

export default PanelTitleWithTooltip;
