import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import './BottomBar.css';

const BottomBar = ({ selectedTime, onTimeChange }) => {
  const initialTime = parseInt(selectedTime, 10);

  const [sx, setSx] = useState({
    '& .MuiSlider-markLabel': {
      color: '#d3d3d3',
    },
    '& .MuiSlider-track': {
      display: 'none',
    },
    color: '#d1a766',
    '& .MuiSlider-markLabel': {
      color: '#d3d3d3',
    },
  });

  const handleSliderChange = (event, value) => {
    const selectedYear = value.toString();
    const colorStyles = {
      '& .MuiSlider-markLabel': {
        color: 'white',
      },
    };

    const defaultColorStyles = {
      '& .MuiSlider-markLabel': {
        color: '#d3d3d3',
      },
      '& .MuiSlider-track': {
        display: 'none',
      },
      color: '#d1a766',
      '& .MuiSlider-markLabel': {
        color: '#d1a766',
      },
    };

    const yearToIndex = {
      '2000': '0',
      '2010': '1',
      '2020': '2',
      '2030': '3',
      '2040': '4',
      '2050': '5',
      '2060': '6',
      '2070': '7',
      '2080': '8',
      '2090': '9',
    };

    const index = yearToIndex[selectedYear];
    if (index !== undefined) {
      colorStyles[`& .MuiSlider-markLabel[data-index="${index}"]`] = {
        color: '#d1a766',
        fontWeight: 'bold',
      };
    }
    const updatedStyles = {
      ...defaultColorStyles,
      ...colorStyles,
    };

    setSx(updatedStyles);

    // Ensure event is defined and has a target before calling onTimeChange
    if (event && event.target) {
      onTimeChange(event, value);
    } else {
      // Create a synthetic event for initial useEffect call
      onTimeChange({ target: { value } }, value);
    }
  };

  useEffect(() => {
    handleSliderChange({}, initialTime);
  }, [initialTime]);

  return (
    <div className="bottom-bar">
      <Slider
        min={2000}
        max={2090}
        step={10}
        marks={[
          {
            value: 2000,
            label: '2000',
          },
          {
            value: 2010,
            label: '2010',
          },
          {
            value: 2020,
            label: '2020',
          },
          {
            value: 2030,
            label: '2030',
          },
          {
            value: 2040,
            label: '2040',
          },
          {
            value: 2050,
            label: '2050',
          },
          {
            value: 2060,
            label: '2060',
          },
          {
            value: 2070,
            label: '2070',
          },
          {
            value: 2080,
            label: '2080',
          },
          {
            value: 2090,
            label: '2090',
          },
        ]}
        defaultValue={initialTime}
        onChange={handleSliderChange}
        valueLabelDisplay="off"
        sx={sx}
      />
    </div>
  );
};

export default BottomBar;
