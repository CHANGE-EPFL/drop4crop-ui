import React from 'react';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';

const MarkdownTooltip = ({ children }) => (
    <ReactMarkdown
        components={{
            p: ({ children }) => <span>{children}</span>,
            a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#009da9' }}>
                    {children}
                </a>
            ),
        }}
    >
        {children}
    </ReactMarkdown>
);

const PanelTitleWithTooltip = ({ title, tooltip, onClose }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" style={{ fontSize: '1rem' }}>{title}</Typography>
                {tooltip && (
                    <Tooltip
                        title={tooltip}
                        placement="right"
                        disableFocusListener disableTouchListener enterDelay={10}
                        arrow
                        style={{ marginLeft: '5px', marginBottom: '4px' }}
                    >
                        <HelpOutlineIcon sx={{ fontSize: '1rem', color: '#009da9' }} />
                    </Tooltip>
                )}
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
                            color: '#009da9',
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

export { MarkdownTooltip };
export default PanelTitleWithTooltip;
