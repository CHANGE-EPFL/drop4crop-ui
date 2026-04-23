import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';
import Link from '@mui/material/Link';

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
                    : (
                    <>
                        The crops are grouped according to the MIRCA2000
                        dataset (
                        <Link
                            href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2008GB003435"
                            target="_blank"
                            rel="noopener"
                            sx={{ color: '#d1a766' }}
                        >Portmann et al., 2010</Link>).
                    </>
                )}
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
