import React from 'react';
import Chip from '@mui/material/Chip';

const CropsPanel = ({
    crops,
    selectedCrop,
    setSelectedCrop
}) => {
    const handleChipClick = (crop) => {
        if (selectedCrop && selectedCrop.id === crop.id) {
            setSelectedCrop(undefined);  // Deselect if the same crop is clicked
        } else {
            setSelectedCrop(crop);  // Select the crop
        }
    };

    return (
        <div className="popup">
            <h3>Crop</h3>
            <div className="chips-list">
                {crops.map(crop => (
                    <Chip
                        key={crop.id}
                        label={crop.name}
                        clickable
                        className={selectedCrop && selectedCrop.id === crop.id ? 'active' : ''}
                        disabled={!crop.enabled}
                        onClick={() => handleChipClick(crop)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CropsPanel;
