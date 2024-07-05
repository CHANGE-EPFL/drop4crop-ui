import React from 'react';
import Chip from '@mui/material/Chip';


const GlobalWaterModelsPanel = ({
    globalWaterModels,
    selectedGlobalWaterModel,
    setSelectedGlobalWaterModel
}) => {
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
                        onClick={() => setSelectedGlobalWaterModel(model)}
                    />
                ))}
            </div>
        </div>
    )
};

export default GlobalWaterModelsPanel;