import React, { useRef, useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const DownloadPanel = ({ currentLayer, geoserverUrl, boundingBox, setBoundingBox, setEnableSelection, clearLayers }) => {
    const [open, setOpen] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const inputRef = useRef(null);

    const getCapabilitiesLink = `${geoserverUrl}/ows?service=WMS&request=GetCapabilities&version=1.3.0`;
    const downloadTifLink = boundingBox
        ? `${geoserverUrl}/wcs?service=WCS&version=2.0.1&request=GetCoverage&coverageId=${currentLayer}&format=image/tiff&subset=Long(${boundingBox.minx},${boundingBox.maxx})&subset=Lat(${boundingBox.miny},${boundingBox.maxy})`
        : null;
    const downloadEntireTifLink = `${geoserverUrl}/wcs?service=WCS&version=2.0.1&request=GetCoverage&coverageId=${currentLayer}&format=image/tiff`;

    useEffect(() => {
        if (!boundingBox) {
            setIsSelecting(false);
        }
    }, [boundingBox]);

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(getCapabilitiesLink).then(() => {
                setOpen(true);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            const input = inputRef.current;
            input.value = getCapabilitiesLink;
            input.select();
            input.setSelectionRange(0, 99999); // For mobile devices
            document.execCommand('copy');
            setOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpen(false);
    };

    const handleSelectArea = () => {
        setEnableSelection(true);
        setIsSelecting(true);
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
            <h3>Download</h3>
            <input
                ref={inputRef}
                type="text"
                value={getCapabilitiesLink}
                readOnly
                style={{ position: 'absolute', left: '-9999px' }}
            />
            <Box>
                <h4>Access to all layers (QGIS/ESRI) </h4>
                <IconButton
                    display="flex"
                    onClick={handleCopyLink}
                    style={{ cursor: 'pointer', color: '#d1a766' }}
                >
                    <Typography style={{ cursor: 'pointer', color: '#d1a766' }}>WMS Link</Typography>
                    <ContentCopyIcon style={{ marginLeft: '4px' }} />
                </IconButton>
            </Box>
            <hr />
            <Box>
                <h4>Current layer</h4>

                <Button
                    variant='outlined'
                    style={{
                        borderColor: '#d1a766',
                        color: '#d1a766',
                        backgroundColor: 'transparent'
                    }}
                    href={downloadEntireTifLink}
                >
                    Entire map (GeoTIFF)
                </Button>
            </Box><br />
            <Box display="flex" >
                <Button
                    variant="outlined"
                    onClick={boundingBox ? handleDownloadClick : handleSelectArea}
                    style={{
                        borderColor: '#d1a766',
                        color: '#d1a766',
                        backgroundColor: 'transparent'
                    }}
                >
                    {boundingBox ? "Download Data" : isSelecting ? "Select region to download" : "Selection (GeoTIFF)"}
                </Button>
                {boundingBox && (
                    <IconButton onClick={handleDeleteSelection} style={{ color: '#d1a766', marginLeft: '8px' }}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message="WMS link copied to clipboard. To use in QGIS: Layer > Add Layer > Add WMS Layer > New > URL: Paste > OK"
                action={
                    <React.Fragment>
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </React.Fragment>
                }
            />
        </div>
    );
};

export default DownloadPanel;
