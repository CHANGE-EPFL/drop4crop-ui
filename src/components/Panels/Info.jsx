import React from 'react';

const InfoPanel = () => {
    return (
        <div className="popup">
            <h3>Drop4Crop</h3>
            <p>
                <a href="https://www.epfl.ch/labs/change/" target="_blank" rel="noopener noreferrer" style={linkStyle}>CHANGE lab</a>
            </p>
            {/* <br />
            <p>
                <a href="https://www.epfl.ch/labs/change/publications" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Our publications
                </a>
            </p> */}
        </div>
    );
}

export default InfoPanel;

const linkStyle = {
    color: '#d1a766',
    textDecoration: 'none',
};
