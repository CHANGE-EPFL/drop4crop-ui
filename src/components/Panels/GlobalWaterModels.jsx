import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';

const GlobalWaterModelsPanel = ({
    globalWaterModels,
    selectedGlobalWaterModel,
    setSelectedGlobalWaterModel,
    setActivePanel,
    tabConfig,
}) => {
    const handleClose = () => {
        setActivePanel(null);
    };
    const handleChipClick = (model) => {
        if (selectedGlobalWaterModel && selectedGlobalWaterModel.id === model.id) {
            setSelectedGlobalWaterModel(undefined);  // Deselect if the same model is clicked
        } else {
            setSelectedGlobalWaterModel(model);  // Select the model
            setActivePanel(null);
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip
                title={tabConfig?.label || "Global Water Model"}
                tooltip={tabConfig?.help_text
                    ? <MarkdownTooltip>{tabConfig.help_text}</MarkdownTooltip>
                    : null}
                onClose={handleClose}
            />
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
