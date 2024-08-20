import React from 'react';
import Chip from '@mui/material/Chip';

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
            <h3>Scenario</h3>
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
