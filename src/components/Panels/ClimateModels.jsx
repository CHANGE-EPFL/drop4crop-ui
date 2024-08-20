import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip from './Title';
import Link from '@mui/material/Link';

const ClimateModelsPanel = ({
    climateModels,
    selectedClimateModel,
    setSelectedClimateModel,
    setActivePanel,
}) => {
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
            <PanelTitleWithTooltip title="Global Climate Model" tooltip={(
                <>
                    Precipitation data used in the crop-specific evapotranspiration
                    model (<i>future link to our publication</i>) is derived
                    from the corresponding Global Climate Model, in <Link
                        href="https://data.isimip.org/"
                        target="_blank"
                        rel="noopener"
                        sx={{ color: '#d1a766' }}
                    >ISIMIP Repository</Link>, simulation protocol <Link
                        href="https://www.isimip.org/protocol/2b/"
                        target="_blank"
                        rel="noopener"
                        sx={{ color: '#d1a766' }}
                    >ISIMIP2b</Link> (Input Data > Climate related forcing > Atmospheric
                    forcing). For each simulation year (timeline 2000-2090), a
                    3-year average centered around the year of interest is considered (for
                    details see <i>future link to our publication</i>).
                </>
            )} />
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
