import React from 'react';
import Chip from '@mui/material/Chip';

const ClimateModelsPanel = ({
    climateModels,
    selectedClimateModel,
    setSelectedClimateModel
}) => {
    const handleChipClick = (model) => {
        if (selectedClimateModel && selectedClimateModel.id === model.id) {
            setSelectedClimateModel(undefined);  // Deselect if the same model is clicked
        } else {
            setSelectedClimateModel(model);  // Select the model
        }
    };

    return (
        <div className="popup">
            <h3>Climate Model</h3>
            <div className="chips-list">
                {climateModels.map(model => (
                    <Chip
                        key={model.id}
                        label={model.name}
                        clickable
                        className={selectedClimateModel && selectedClimateModel.id === model.id ? 'active' : ''}
                        disabled={!model.enabled}
                        onClick={() => handleChipClick(model)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ClimateModelsPanel;
