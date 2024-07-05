import React from 'react';
import Chip from '@mui/material/Chip';
// import { variables } from '../../data/variables';


const VariablePanel = ({ variables, selectedVariable, setSelectedVariable }) => {
    return (< div className="popup" >
        <h3>Variable</h3>

        <div className="chips-group">
            <h5>Virtual Water Content</h5>
            <div className="chips-list">
                {variables.filter(variable => ['vwc_sub', 'vwcb_sub', 'vwcg_sub', 'vwcg_perc', 'vwcb_perc'].includes(variable.id)).map(variable => (
                    <Chip
                        key={variable.id}
                        label={`${variable.name} [${variable.unit}]`}
                        clickable
                        className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                        disabled={!variable.enabled}
                        onClick={() => setSelectedVariable(variable)}
                    />
                ))}
            </div>
        </div>

        <div className="chips-group">
            <h5>Water Footprint</h5>
            <div className="chips-list">
                {variables.filter(variable => ['wf', 'wfb', 'wfg'].includes(variable.id)).map(variable => (
                    <Chip
                        key={variable.id}
                        label={`${variable.name} [${variable.unit}]`}
                        clickable
                        className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                        disabled={!variable.enabled}
                        onClick={() => setSelectedVariable(variable)}
                    />
                ))}
            </div>
        </div>

        <div className="chips-group">
            <h5>Evapotranspiration</h5>
            <div className="chips-list">
                {variables.filter(variable => ['etb', 'etg'].includes(variable.id)).map(variable => (
                    <Chip
                        key={variable.id}
                        label={`${variable.name} [${variable.unit}]`}
                        clickable
                        className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                        disabled={!variable.enabled}
                        onClick={() => setSelectedVariable(variable)}
                    />
                ))}
            </div>
        </div>

        <div className="chips-group">
            <h5>Renewability Rate</h5>
            <div className="chips-list">
                {variables.filter(variable => ['rb', 'rg'].includes(variable.id)).map(variable => (
                    <Chip
                        key={variable.id}
                        label={`${variable.name} [${variable.unit}]`}
                        clickable
                        className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                        disabled={!variable.enabled}
                        onClick={() => setSelectedVariable(variable)}
                    />
                ))}
            </div>
        </div>

        <div className="chips-group">
            <h5>Water Debt</h5>
            <div className="chips-list">
                {variables.filter(variable => ['wdb', 'wdg'].includes(variable.id)).map(variable => (
                    <Chip
                        key={variable.id}
                        label={`${variable.name} [${variable.unit}]`}
                        clickable
                        className={selectedVariable && selectedVariable.id === variable.id ? 'active' : ''}
                        disabled={!variable.enabled}
                        onClick={() => setSelectedVariable(variable)}
                    />
                ))}
            </div>
        </div>

    </div>)
};

export default VariablePanel;