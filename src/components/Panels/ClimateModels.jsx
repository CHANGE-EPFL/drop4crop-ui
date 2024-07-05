import React from 'react';
import Chip from '@mui/material/Chip';


const ClimateModelsPanel = ({
    climateModels,
    selectedClimateModel,
    setSelectedClimateModel
}) => {
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
                        onClick={() => setSelectedClimateModel(model)}
                    />
                ))}
            </div>
        </div>
    )
};

export default ClimateModelsPanel;