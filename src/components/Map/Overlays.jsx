import CircularProgress from '@mui/material/CircularProgress';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import React from 'react';
import './MapView.css';

export const NoMapOverlay = () => {
    return (
        <div style={mapOverlayStyle}>
            <p>This layer is unavailable</p>
            <p>Please refer to the publication for more information.</p>
            <a href="https://www.epfl.ch/labs/change/publications" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                <AutoStoriesIcon fontSize='medium' /> Our publications
            </a>
        </div>
    );
};


export const NoMapMakeSelectionOverlay = () => {
    // Informs the user to select a layer
    return (
        <div style={noSelectionMapOverlayStyle}>
            <div style={selectionBoxStyle}>
                <p>Use the buttons on the left to select a layer to display</p>
            </div>
        </div>
    );
};

export const MapOverlay = ({ layerName, loading }) => {
    // Show an overlay with loading spinner if the layer name is not yet available
    // by making an assumption that the layer name is undefined when a layername is not provided
    if (loading) {
        return (
            <div style={mapOverlayStyle}>
                <div style={overlayContentStyle}>
                    <CircularProgress sx={{
                        color: '#d1a766',
                    }} />
                </div>
            </div>
        );
    }
    if (layerName === undefined) {
        // return <NoMapOverlay />;
        return <NoMapMakeSelectionOverlay />;
    }
    if (layerName === null) {
        return <NoMapOverlay />;
    }

    return null;
};

const noSelectionMapOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'top',
    alignItems: 'center',
    color: 'white',
    fontSize: '1.2em',
    textAlign: 'center',
    zIndex: 999, // Ensure it is above other map elements
};

const mapOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '1.5em',
    textAlign: 'center',
    zIndex: 999, // Ensure it is above other map elements
    pointerEvents: 'none', // Make the overlay background non-interactive
};

const linkStyle = {
    color: '#d1a766',
    textDecoration: 'none',
    marginTop: '10px', // Optional: Add some margin for better spacing
    pointerEvents: 'auto', // Make the link interactive
};


const overlayContentStyle = {
    color: 'white',
    fontSize: '1.5em',
    textAlign: 'center',
    padding: '10px',
    borderRadius: '5px',
    pointerEvents: 'auto', // Make the overlay content interactive
};
const selectionBoxStyle = {
    backgroundColor: '#333',
    padding: '5px 10px', // Adjust padding to reduce top/bottom space
    borderRadius: '5px',
    opacity: '0.95',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
    color: '#d3d3d3',
    fontSize: '1em', // Match the legend text size
    textAlign: 'center',
    marginTop: '10px',
    lineHeight: '1.2em', // Reduce line height to minimize vertical space
};
