import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AppContext } from '../contexts/AppContext';
import React, { useContext } from 'react';


const CountryPolygonSwitch = () => {

    const { layerName, countryAverages, setCountryAverages } = useContext(AppContext);
    return (<div style={toggleContainerMapStyle}>
        <FormControlLabel
            disabled={!layerName}
            control={
                <Switch
                    checked={countryAverages}
                    size="small"
                    onChange={(e) => {
                        e.stopPropagation();
                        setCountryAverages(e.target.checked);
                    }}
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#d1a766',
                        },
                        '& .MuiSwitch-track': {
                            backgroundColor: countryAverages ? '#d1a766' : '#888',
                        },
                        '& .MuiSwitch-thumb': {
                            backgroundColor: countryAverages ? '#d1a766' : '#ccc',
                        },
                    }}
                />
            }
            label={<Typography variant="body2">Country Scale Values</Typography>}
            labelPlacement="end"
            className={!layerName ? 'disabled' : ''}
        />
    </div>)
};

export default CountryPolygonSwitch;

const toggleContainerMapStyle = {
    position: 'absolute',
    bottom: '110px',
    left: '100px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#333',
    color: '#d3d3d3',
    borderColor: 'rgba(0, 0, 0, 0.7)',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    opacity: '0.8',
    borderTop: '1px solid #444',
    justifyContent: 'center',
    paddingLeft: '20px',
    borderRadius: '10px',
};
