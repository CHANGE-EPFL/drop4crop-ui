import React from 'react';
import Chip from '@mui/material/Chip';

const GlobalWaterModelsPanel = ({
    globalWaterModels,
    selectedGlobalWaterModel,
    setSelectedGlobalWaterModel
}) => {
    const handleChipClick = (model) => {
        if (selectedGlobalWaterModel && selectedGlobalWaterModel.id === model.id) {
            setSelectedGlobalWaterModel(undefined);  // Deselect if the same model is clicked
        } else {
            setSelectedGlobalWaterModel(model);  // Select the model
        }
    };

    return (
        <div className="popup">
            <h3>Global Water Model</h3>
            <div className="chips-list">
                {globalWaterModels.map(model => (
                    <Chip
                        key={model.id}
                        label={model.name}
                        clickable
                        className={selectedGlobalWaterModel && selectedGlobalWaterModel.id === model.id ? 'active' : ''}
                        disabled={!model.enabled}
                        onClick={() => handleChipClick(model)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GlobalWaterModelsPanel;
