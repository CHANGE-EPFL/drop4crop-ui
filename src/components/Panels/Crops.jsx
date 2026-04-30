import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';

const CropsPanel = ({
    crops,
    selectedCrop,
    setSelectedCrop,
    setActivePanel,
    tabConfig,
}) => {
    const handleClose = () => {
        setActivePanel(null);
    };
    const handleChipClick = (crop) => {
        if (selectedCrop && selectedCrop.id === crop.id) {
            setSelectedCrop(undefined);  // Deselect if the same crop is clicked
        } else {
            setSelectedCrop(crop);  // Select the crop
            setActivePanel(null);
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip
                title={tabConfig?.label || "Crop"}
                tooltip={tabConfig?.help_text
                    ? <MarkdownTooltip>{tabConfig.help_text}</MarkdownTooltip>
                    : null}
                onClose={handleClose}
            />
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
