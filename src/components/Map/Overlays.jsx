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

export const MapOverlay = ({ layerName, loading }) => {
    // Show an overlay with loading spinner if the layer name is not yet available
    // by making an assumption that the layer name is undefined when a layername is not provided
    console.log("layerName: ", layerName);
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
        return null;
    }
    if (layerName === null) {
        return <NoMapOverlay />;
    }

    return null;
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