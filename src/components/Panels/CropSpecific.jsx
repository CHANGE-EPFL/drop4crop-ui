import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';

const CropSpecificPanel = ({
    cropVariables,
    selectedCropVariable,
    setSelectedCropVariable,
    setActivePanel,
    setSelectedVariable,
    setSelectedClimateModel,
    setSelectedGlobalWaterModel,
    setSelectedScenario,
    setLayerName,
    tabConfig,
}) => {
    const handleClose = () => {
        setActivePanel(null);
    };

    const handleChipClick = (cropVariable) => {
        if (selectedCropVariable && selectedCropVariable.id === cropVariable.id) {
            setSelectedCropVariable(undefined);  // Deselect if the same variable is clicked
        } else {
            // Clear the layer immediately when switching to crop-specific
            // This prevents the old layer from persisting during the transition
            setLayerName(null);

            // Deselect the other variables as they don't apply to the crop-specific variables
            setSelectedClimateModel(undefined);
            setSelectedGlobalWaterModel(undefined);
            setSelectedScenario(undefined);
            setSelectedVariable(undefined);

            // Now select the variable
            setSelectedCropVariable(cropVariable);
            setActivePanel(null);
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip
                title={tabConfig?.label || "Crop Specific Variable"}
                tooltip={tabConfig?.help_text
                    ? <MarkdownTooltip>{tabConfig.help_text}</MarkdownTooltip>
                    : null}
                onClose={handleClose}
            />
            <div className="chips-group">
                <div className="chips-list">
                    {cropVariables.map(cropVariable => (
                        <Chip
                            key={cropVariable.id}
                            label={cropVariable.name}
                            clickable
                            className={selectedCropVariable && selectedCropVariable.id === cropVariable.id ? 'active' : ''}
                            disabled={!cropVariable.enabled}
                            onClick={() => handleChipClick(cropVariable)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CropSpecificPanel;
