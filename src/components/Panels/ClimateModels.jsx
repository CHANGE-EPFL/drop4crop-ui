import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';

const ClimateModelsPanel = ({
    climateModels,
    selectedClimateModel,
    setSelectedClimateModel,
    setActivePanel,
    tabConfig,
}) => {
    const handleClose = () => {
        setActivePanel(null);
    };
    const handleChipClick = (model) => {
        if (selectedClimateModel && selectedClimateModel.id === model.id) {
            setSelectedClimateModel(undefined);  // Deselect if the same model is clicked
        } else {
            setSelectedClimateModel(model);  // Select the model
            setActivePanel(null);
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip
                title={tabConfig?.label || "Global Climate Model"}
                tooltip={tabConfig?.help_text
                    ? <MarkdownTooltip>{tabConfig.help_text}</MarkdownTooltip>
                    : null}
                onClose={handleClose}
            />
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
