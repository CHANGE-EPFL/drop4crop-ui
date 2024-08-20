import React from 'react';
import Chip from '@mui/material/Chip';
import PanelTitleWithTooltip from './Title';

const ScenarioPanel = ({
    scenarios,
    selectedScenario,
    setSelectedScenario
}) => {
    const handleChipClick = (scenario) => {
        if (selectedScenario && selectedScenario.id === scenario.id) {
            setSelectedScenario(undefined);  // Deselect if the same scenario is clicked
        } else {
            setSelectedScenario(scenario);  // Select the scenario
        }
    };

    return (
        <div className="popup">
            <PanelTitleWithTooltip title="Scenario" tooltip={(
                <>
                    Representative Concentration Pathways (RCP) as formally
                    adopted by the Intergovernmental Panel Climate Change (IPCC).
                </>
            )} />
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
