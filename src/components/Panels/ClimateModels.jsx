import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';
import Link from '@mui/material/Link';

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
                    : (
                    <>
                        Precipitation data used in the crop-specific evapotranspiration
                        model (<i>future link to our publication</i>) is derived
                        from the corresponding Global Climate Model, in <Link
                            href="https://data.isimip.org/"
                            target="_blank"
                            rel="noopener"
                            sx={{ color: '#acd8d8' }}
                        >ISIMIP Repository</Link>, simulation protocol <Link
                            href="https://www.isimip.org/protocol/2b/"
                            target="_blank"
                            rel="noopener"
                            sx={{ color: '#acd8d8' }}
                        >ISIMIP2b</Link> (Input Data &gt; Climate related forcing &gt; Atmospheric
                        forcing). For each simulation year (timeline 2000-2090), a
                        3-year average centered around the year of interest is considered (for
                        details see <i>future link to our publication</i>).
                    </>
                )}
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
