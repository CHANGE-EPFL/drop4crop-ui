import React, { useRef, useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const DownloadPanel = ({ currentLayer, APIServerURL, boundingBox, setBoundingBox, setEnableSelection, clearLayers }) => {
    const [open, setOpen] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const inputRef = useRef(null);

    const XYZTileLink = `${APIServerURL}/cog/tiles/{z}/{x}/{y}.png?url=${currentLayer}`;
    const downloadTifLink = boundingBox
        ? `${APIServerURL}/layers/${currentLayer}/download?minx=${boundingBox.minx}&miny=${boundingBox.miny}&maxx=${boundingBox.maxx}&maxy=${boundingBox.maxy}`
        : null;

    const downloadEntireTifLink = `${APIServerURL}/layers/${currentLayer}/download`;

    useEffect(() => {
        if (!boundingBox) {
            setIsSelecting(false);
        }
    }, [boundingBox]);

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(XYZTileLink).then(() => {
                setOpen(true);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            const input = inputRef.current;
            input.value = XYZTileLink;
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
                value={XYZTileLink}
                readOnly
                style={{ position: 'absolute', left: '-9999px' }}
            />
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
            </Box><br />
            <IconButton
                display="flex"
                onClick={handleCopyLink}
                style={{ cursor: 'pointer', color: '#d1a766' }}
            >
                <Typography style={{ cursor: 'pointer', color: '#d1a766' }}>XYZ Tile</Typography>
                <ContentCopyIcon style={{ marginLeft: '4px' }} />
            </IconButton>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message="XYZ link copied to clipboard. To use in QGIS: Layer > Add Layer > Add XYZ Layer > New > URL: Paste > OK"
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
