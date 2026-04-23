import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip, { MarkdownTooltip } from './Title';

const ScenarioPanel = ({
    scenarios,
    selectedScenario,
    setSelectedScenario,
    setActivePanel,
    tabConfig,
}) => {
    const handleClose = () => {
        setActivePanel(null);
    };
    const handleChipClick = (scenario) => {
        if (selectedScenario && selectedScenario.id === scenario.id) {
            setSelectedScenario(undefined);  // Deselect if the same scenario is clicked
        } else {
            setSelectedScenario(scenario);  // Select the scenario
            setActivePanel(null);
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip
                title={tabConfig?.label || "Scenario"}
                tooltip={tabConfig?.help_text
                    ? <MarkdownTooltip>{tabConfig.help_text}</MarkdownTooltip>
                    : (
                    <>
                        Representative Concentration Pathways (RCP) as formally
                        adopted by the Intergovernmental Panel Climate Change (IPCC).
                    </>
                )}
                onClose={handleClose}
            />
            <div className="chips-list">
                {scenarios.map(scenario => (
                    <Chip
                        key={scenario.id}
                        label={scenario.name}
                        clickable
                        className={selectedScenario && selectedScenario.id === scenario.id ? 'active' : ''}
                        disabled={!scenario.enabled}
                        onClick={() => handleChipClick(scenario)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ScenarioPanel;
