import React, { useRef, useState, useEffect, useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { AppContext } from '../../contexts/AppContext';

const DownloadPanel = ({ clearLayers }) => {
    const {
        enableSelection,
        setEnableSelection,
        boundingBox,
        setBoundingBox,
        APIServerURL,
        layerName: currentLayer,
        selectedCrop,
        selectedGlobalWaterModel,
        selectedClimateModel,
        selectedScenario,
        selectedVariable,
        selectedCropVariable,
        selectedTime,
    } = useContext(AppContext); // Access state from context

    const [open, setOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const inputRef = useRef(null);

    const XYZTileLink = `${APIServerURL}/layers/xyz/{z}/{x}/{y}?layer=${currentLayer}`;
    const STACLink = `${APIServerURL}/stac`;
    const downloadTifLink = boundingBox
        ? `${APIServerURL}/layers/cog/${currentLayer}.tif?minx=${boundingBox.minx}&miny=${boundingBox.miny}&maxx=${boundingBox.maxx}&maxy=${boundingBox.maxy}`
        : null;

    const downloadEntireTifLink = `${APIServerURL}/layers/cog/${currentLayer}.tif`;

    // Build shareable link with current layer parameters
    const buildShareLink = () => {
        const params = new URLSearchParams();
        if (selectedCrop?.id) params.set('crop', selectedCrop.id);

        // Check if this is a crop-specific layer
        if (selectedCropVariable?.id) {
            // For crop-specific layers, only include crop and crop_variable
            params.set('crop_variable', selectedCropVariable.id);
        } else {
            // For climate layers, include all model parameters
            if (selectedGlobalWaterModel?.id) params.set('water_model', selectedGlobalWaterModel.id);
            if (selectedClimateModel?.id) params.set('climate_model', selectedClimateModel.id);
            if (selectedScenario?.id) params.set('scenario', selectedScenario.id);
            if (selectedVariable?.id) params.set('variable', selectedVariable.id);
            if (selectedTime) params.set('year', selectedTime.toString());
        }

        const baseUrl = window.location.origin;
        return `${baseUrl}/?${params.toString()}`;
    };

    useEffect(() => {
        if (!boundingBox) {
            setEnableSelection(false);
        }
    }, [boundingBox]);

    const handleCopyLink = (link, message) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => {
                setSnackbarMessage(message);
                setOpen(true);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            const input = inputRef.current;
            input.value = link;
            input.select();
            input.setSelectionRange(0, 99999); // For mobile devices
            document.execCommand('copy');
            setSnackbarMessage(message);
            setOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpen(false);
    };

    const handleSelectArea = () => {
        setEnableSelection(true);
    };

    const handleDeleteSelection = () => {
        setBoundingBox(null);
        setEnableSelection(false);
        clearLayers();
    };

    const handleDownloadClick = () => {
        // Download the selected area
        if (boundingBox && downloadTifLink) {
            window.open(downloadTifLink, '_blank');
        }
        handleDeleteSelection();
    };

    return (
        <div className="popup">
            <Typography variant="h6" style={{ fontSize: '1rem', marginBottom: '15px' }}>Download</Typography>
            <input
                ref={inputRef}
                type="text"
                readOnly
                style={{ position: 'absolute', left: '-9999px' }}
            />

            <Typography variant="subtitle2" style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: '#d1a766' }}>
                STAC Server
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="text"
                    fullWidth
                    onClick={() => handleCopyLink(STACLink, "STAC API endpoint copied to clipboard")}
                    sx={{
                        color: '#d1a766',
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        padding: '4px 8px',
                        fontSize: '0.875rem',
                        '&:hover': {
                            backgroundColor: 'rgba(209, 167, 102, 0.08)',
                        }
                    }}
                >
                    <ContentCopyIcon sx={{ fontSize: '1rem', mr: 1 }} />
                    Copy STAC Server Link
                </Button>
            </Box>

            <div style={{ borderTop: "1px solid #d1a766", marginBottom: '15px' }} />

            <Typography variant="subtitle2" style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: '#d1a766' }}>
                Share Current Layer
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="text"
                    fullWidth
                    onClick={() => handleCopyLink(buildShareLink(), "Shareable link copied to clipboard")}
                    disabled={!currentLayer}
                    sx={{
                        color: '#d1a766',
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        padding: '4px 8px',
                        fontSize: '0.875rem',
                        '&:hover': {
                            backgroundColor: 'rgba(209, 167, 102, 0.08)',
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(209, 167, 102, 0.3)',
                        }
                    }}
                >
                    <ShareIcon sx={{ fontSize: '1rem', mr: 1 }} />
                    Copy Shareable Link
                </Button>
            </Box>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                action={
                    <React.Fragment>
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </React.Fragment>
                }
            />

            <div style={{ borderTop: "1px solid #d1a766", marginBottom: '15px' }} />

            <Typography variant="subtitle2" style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: '#d1a766' }}>
                Download
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    href={downloadEntireTifLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!currentLayer}
                    sx={{
                        borderColor: '#d1a766',
                        color: '#d1a766',
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                        '&:hover': {
                            backgroundColor: 'rgba(209, 167, 102, 0.08)',
                            borderColor: '#d1a766',
                        },
                        '&.Mui-disabled': {
                            borderColor: 'rgba(209, 167, 102, 0.3)',
                            color: 'rgba(209, 167, 102, 0.3)',
                        }
                    }}
                >
                    Entire Map (GeoTIFF)
                </Button>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleSelectArea}
                    disabled={!currentLayer || enableSelection || boundingBox}
                    sx={{
                        borderColor: '#d1a766',
                        color: '#d1a766',
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                        '&:hover': {
                            backgroundColor: 'rgba(209, 167, 102, 0.08)',
                            borderColor: '#d1a766',
                        },
                        '&.Mui-disabled': {
                            borderColor: 'rgba(209, 167, 102, 0.3)',
                            color: 'rgba(209, 167, 102, 0.3)',
                        }
                    }}
                >
                    {boundingBox ? "Selection active - use map button" : enableSelection ? "Drawing selection..." : "Select Area (GeoTIFF)"}
                </Button>
            </Box>

            {(enableSelection || boundingBox) && (
                <Box
                    display="grid"
                    gridTemplateColumns="1fr 1fr"
                    gap={2}
                    alignItems="center"
                    marginTop={2}
                    width="75%"
                >
                    <TextField
                        label="Longitude [min]"
                        variant="outlined"
                        value={boundingBox ? boundingBox.minx : ''}
                        onChange={(e) => setBoundingBox({ ...boundingBox, minx: e.target.value })}
                        InputLabelProps={{
                            style: { color: '#d1a766' }, // Match label color
                        }}
                        inputProps={{
                            style: { color: '#d1a766' }, // Match input text color
                        }}
                        style={{
                            borderColor: '#d1a766',
                            color: '#d1a766',
                            backgroundColor: 'transparent',
                            width: '100%',
                        }}
                        InputProps={{
                            style: { borderColor: '#d1a766' }, // Match border color
                        }}
                    />
                    <TextField
                        label="Latitude [min]"
                        variant="outlined"
                        value={boundingBox ? boundingBox.miny : ''}
                        onChange={(e) => setBoundingBox({ ...boundingBox, miny: e.target.value })}
                        InputLabelProps={{
                            style: { color: '#d1a766' }, // Match label color
                        }}
                        inputProps={{
                            style: { color: '#d1a766' }, // Match input text color
                        }}
                        style={{
                            borderColor: '#d1a766',
                            color: '#d1a766',
                            backgroundColor: 'transparent',
                            width: '100%',
                        }}
                        InputProps={{
                            style: { borderColor: '#d1a766' }, // Match border color
                        }}
                    />
                    <TextField
                        label="Longitude [max]"
                        variant="outlined"
                        value={boundingBox ? boundingBox.maxx : ''}
                        onChange={(e) => setBoundingBox({ ...boundingBox, maxx: e.target.value })}
                        InputLabelProps={{
                            style: { color: '#d1a766' }, // Match label color
                        }}
                        inputProps={{
                            style: { color: '#d1a766' }, // Match input text color
                        }}
                        style={{
                            borderColor: '#d1a766',
                            color: '#d1a766',
                            backgroundColor: 'transparent',
                            width: '100%',
                        }}
                        InputProps={{
                            style: { borderColor: '#d1a766' }, // Match border color
                        }}
                    />
                    <TextField
                        label="Latitude [max]"
                        variant="outlined"
                        value={boundingBox ? boundingBox.maxy : ''}
                        onChange={(e) => setBoundingBox({ ...boundingBox, maxy: e.target.value })}
                        InputLabelProps={{
                            style: { color: '#d1a766' }, // Match label color
                        }}
                        inputProps={{
                            style: { color: '#d1a766' }, // Match input text color
                        }}
                        style={{
                            borderColor: '#d1a766',
                            color: '#d1a766',
                            backgroundColor: 'transparent',
                            width: '100%',
                        }}
                        InputProps={{
                            style: { borderColor: '#d1a766' }, // Match border color
                        }}
                    />
                </Box>
            )}

        </div>
    );
};

export default DownloadPanel;
