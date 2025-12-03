import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip from './Title';
import Link from '@mui/material/Link';

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
                title="Crop Specific Variable"
                tooltip={(
                    <>
                        Crop-specific irrigated and rainfed harvested areas are taken from MIRCA2000 dataset (
                        <Link
                            href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2008GB003435"
                            target="_blank"
                            rel="noopener"
                            sx={{ color: '#d1a766' }}
                        >Portmann et al., 2010</Link>) (total area is the sum of irrigated and rainfed
                        areas). Annual crop-specific yield (also referred to year 2000) is obtained
                        from <Link
                            href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2007GB002947"
                            target="_blank"
                            rel="noopener"
                            sx={{ color: '#d1a766' }}
                        >Monfreda et al. (2008)</Link>, while annual crop production
                        is the product between the crop yield and total areas.
                    </>
                )}
                onClose={handleClose}
            />
            <div className="chips-group">
                <div className="chips-list">
                    {cropVariables.filter(cropVariable => [
                        'mirca_area_irrigated', 'mirca_area_total', 'mirca_rainfed',
                        'yield', 'production',
                    ].includes(cropVariable.id)).map(cropVariable => (
                        <Chip
                            key={cropVariable.id}
                            label={`${cropVariable.name} [${cropVariable.unit}]`}
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
