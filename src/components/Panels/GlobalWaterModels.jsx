import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip from './Title';
import Link from '@mui/material/Link';

const GlobalWaterModelsPanel = ({
    globalWaterModels,
    selectedGlobalWaterModel,
    setSelectedGlobalWaterModel
}) => {
    const handleChipClick = (model) => {
        if (selectedGlobalWaterModel && selectedGlobalWaterModel.id === model.id) {
            setSelectedGlobalWaterModel(undefined);  // Deselect if the same model is clicked
        } else {
            setSelectedGlobalWaterModel(model);  // Select the model
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip title="Global Water Model" tooltip={(
                <>
                    Potential evapotranspiration (<i>potevap</i>), total groundwater
                    recharge (<i>qr</i>), surface runoff (<i>qs</i>), soil moisture
                    content at root zone (<i>rootmoist</i>) used in the crop-specific
                    evapotranspiration model (<i>future link to our publication</i>) are
                    derived from the corresponding Global Water Model,
                    in <Link
                        href="https://data.isimip.org/"
                        target="_blank"
                        rel="noopener"
                        sx={{ color: '#d1a766' }}
                    >ISIMIP Repository</Link>, simulation protocol <Link
                        href="https://www.isimip.org/protocol/2b/"
                        target="_blank"
                        rel="noopener"
                        sx={{ color: '#d1a766' }}
                    >ISIMIP2b</Link> (Output Data > Water (global)).
                    For each simulation year (timeline 2000-2090), a long-term
                    average centered around the year of interest is considered. In
                    particular, 3-year average for <i>potevap</i>, 5-year average
                    for <i>qs</i> and <i>rootmoist</i>, 10-year average for <i>qr</i> (for
                    details see <i>future link to our publication</i>).
                </>
            )} />
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
