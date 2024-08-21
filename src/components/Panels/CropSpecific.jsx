import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip from './Title';
import Link from '@mui/material/Link';

const CropSpecificPanel = ({ variables, selectedVariable, setSelectedVariable, setActivePanel }) => {

    const handleChipClick = (variable) => {
        if (selectedVariable && selectedVariable.id === variable.id) {
            setSelectedVariable(undefined);  // Deselect if the same variable is clicked
        } else {
            setSelectedVariable(variable);  // Select the variable
            setActivePanel(null);
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip title="Crop Specific" tooltip={(
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
            )} />
            <div className="chips-group">
                <div className="chips-list">
                    {variables.filter(variable => [
                        'mirca_area_irrigated', 'mirca_area_total', 'mirca_rainfed',
                        'yield', 'production',
                    ].includes(variable.id)).map(variable => (
                        <Chip
                            key={variable.id}
                            label={`${variable.name} [${variable.unit}]`}
                            clickable
                            className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                            // disabled={!variable.enabled}
                            onClick={() => handleChipClick(variable)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CropSpecificPanel;
