import React, { useState } from 'react';
import { useDataProvider, useGetList, Loading, useNotify, useRefresh } from 'react-admin';
import { Box, Select, MenuItem, Typography, IconButton, Tooltip, Menu } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PaletteIcon from '@mui/icons-material/Palette';
import { createStyleGradient } from '../../utils/styleUtils';

// Helper component to render style preview (supports discrete and linear)
const StylePreview: React.FC<{ style: any; height?: number; width?: number }> = ({
    style,
    height = 8,
    width = 60
}) => {
    if (!style || !style.style || style.style.length === 0) {
        return (
            <Box
                sx={{
                    height: `${height}px`,
                    width: `${width}px`,
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                }}
            />
        );
    }

    const isDiscrete = style.interpolation_type === 'discrete';

    if (isDiscrete) {
        const sortedStops = [...style.style].sort((a, b) => a.value - b.value);
        return (
            <Box
                sx={{
                    display: 'flex',
                    height: `${height}px`,
                    width: `${width}px`,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                }}
            >
                {sortedStops.map((stop, index) => (
                    <Box
                        key={index}
                        sx={{
                            flex: 1,
                            backgroundColor: `rgba(${stop.red},${stop.green},${stop.blue},${(stop.opacity || 255) / 255})`,
                        }}
                    />
                ))}
            </Box>
        );
    }

    // Linear gradient
    const gradient = createStyleGradient(style.style);
    return (
        <Box
            sx={{
                height: `${height}px`,
                width: `${width}px`,
                background: gradient,
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
        />
    );
};

interface StyleSelectorProps {
    layerId: string;
    currentStyleId?: string | null;
    variant?: 'icon' | 'inline';
}

/**
 * Reusable style selector component
 * - variant="icon": Shows as icon button with dropdown menu (for LayerShow)
 * - variant="inline": Shows as inline select dropdown (for bulk actions)
 */
export const StyleSelector: React.FC<StyleSelectorProps> = ({
    layerId,
    currentStyleId,
    variant = 'icon'
}) => {
    const { data: styles, isLoading } = useGetList('styles', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' }
    });
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [selectedStyle, setSelectedStyle] = useState(currentStyleId || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleChange = async (event: any) => {
        const newStyleId = event.target.value;
        setSelectedStyle(newStyleId);
        setIsUpdating(true);

        try {
            await dataProvider.update('layers', {
                id: layerId,
                data: { style_id: newStyleId === 'remove' ? null : newStyleId },
                previousData: { style_id: currentStyleId }
            });

            if (newStyleId === 'remove') {
                notify('Style removed successfully', { type: 'success' });
            } else {
                const styleName = styles?.find(style => style.id === newStyleId)?.name || 'Style';
                notify(`Style "${styleName}" applied successfully`, { type: 'success' });
            }
            refresh();
        } catch (error) {
            console.error('Error updating style:', error);
            notify('Failed to update style', { type: 'error' });
            // Revert on error
            setSelectedStyle(currentStyleId || '');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = async (styleId: string) => {
        handleClose();
        const event = { target: { value: styleId } } as any;
        await handleChange(event);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (variant === 'icon') {
        const open = Boolean(anchorEl);

        return (
            <>
                <Tooltip title="Change style">
                    <IconButton
                        size="small"
                        onClick={handleClick}
                        disabled={isUpdating}
                        sx={{
                            color: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                            }
                        }}
                    >
                        <PaletteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            maxHeight: 300,
                            minWidth: '280px',
                        }
                    }}
                >
                    <MenuItem onClick={() => handleMenuItemClick('remove')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                            <DeleteIcon sx={{ fontSize: '1rem', color: 'error.main' }} />
                            <Typography variant="body2" sx={{ flex: 1, color: 'error.main' }}>
                                Remove Style
                            </Typography>
                        </Box>
                    </MenuItem>
                    {styles && styles.map((style) => (
                        <MenuItem
                            key={style.id}
                            onClick={() => handleMenuItemClick(style.id)}
                            selected={style.id === currentStyleId}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 1 }}>
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    {style.name || 'Unnamed Style'}
                                </Typography>
                                <StylePreview style={style} />
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>
            </>
        );
    }

    // Inline variant (for bulk actions or other uses)
    return (
        <Select
            size="small"
            value={selectedStyle}
            onChange={handleChange}
            disabled={isUpdating}
            sx={{
                minWidth: 250,
                height: '36px',
                '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center'
                }
            }}
        >
            <MenuItem disabled value="">
                <em>Change style</em>
            </MenuItem>
            <MenuItem value="remove">
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                    <DeleteIcon sx={{ fontSize: '1rem', color: 'error.main' }} />
                    <Typography variant="body2" sx={{ flex: 1, color: 'error.main' }}>
                        Remove Style
                    </Typography>
                </Box>
            </MenuItem>
            {styles && styles.map((style) => (
                <MenuItem key={style.id} value={style.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 1 }}>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            {style.name || 'Unnamed Style'}
                        </Typography>
                        <StylePreview style={style} />
                    </Box>
                </MenuItem>
            ))}
        </Select>
    );
};
