import React from 'react';
import Chip from '@mui/material/Chip';

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
            <div className="chips-group">
                <h5>Crop Specific</h5>
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
