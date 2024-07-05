import React, { useRef, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const DownloadPanel = ({ currentLayer, geoserverUrl, boundingBox, setEnableSelection }) => {
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);

    const getCapabilitiesLink = `${geoserverUrl}/ows?service=WMS&request=GetCapabilities&version=1.3.0`;
    const downloadTifLink = boundingBox
        ? `${geoserverUrl}/wcs?service=WCS&version=2.0.1&request=GetCoverage&coverageId=${currentLayer}&format=image/tiff&subset=Long(${boundingBox.minx},${boundingBox.maxx})&subset=Lat(${boundingBox.miny},${boundingBox.maxy})`
        : null;
    const downloadEntireTifLink = `${geoserverUrl}/wcs?service=WCS&version=2.0.1&request=GetCoverage&coverageId=${currentLayer}&format=image/tiff`;

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
                <IconButton
                    display="flex"
                    alignItems="center"
                    onClick={handleCopyLink}
                    style={{ cursor: 'pointer', color: '#d1a766' }}
                >
                    <Typography style={{ cursor: 'pointer', color: '#d1a766' }}>WMS Link</Typography>
                    <ContentCopyIcon style={{ marginLeft: '4px' }} />
                </IconButton>
            </Box>
            <hr />
            <Box>
                <IconButton>
                    <Typography
                        component="a"
                        href={downloadEntireTifLink}
                        target="_blank"
                        style={{ textDecoration: 'none', color: '#d1a766' }}
                    >
                        Download entire layer as GeoTIFF
                    </Typography>
                </IconButton>
            </Box>
            <Box>
                <Button variant="contained" color="primary" onClick={handleSelectArea}>
                    Select Area
                </Button>
            </Box>
            {boundingBox && (
                <Box>
                    <IconButton>
                        <Typography
                            component="a"
                            href={downloadTifLink}
                            target="_blank"
                            style={{ textDecoration: 'none', color: '#d1a766' }}
                        >
                            Download layer as GeoTIFF
                        </Typography>
                    </IconButton>
                </Box>
            )}
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
