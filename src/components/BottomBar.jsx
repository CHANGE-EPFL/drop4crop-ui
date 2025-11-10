import React, { useContext, useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import './BottomBar.css';
import { AppContext } from '../contexts/AppContext';


const BottomBar = () => {
  const {
    setSelectedTime,
    selectedTime,
    availableYears,
  } = useContext(AppContext);
  const initialTime = parseInt(selectedTime, 10);
  const [sliderValue, setSliderValue] = useState(initialTime);

  const onTimeChange = (time) => {
    setSelectedTime(time.target.value);
  };

  const handleSliderChange = (event, value) => {
    if (availableYears.includes(value)) {
      setSliderValue(value);
      onTimeChange(event, value);
    }
  };
  useEffect(() => {
    // When availableYears changes, update sliderValue if it's not in the available years
    if (availableYears.length > 0 && !availableYears.includes(sliderValue)) {
      const firstAvailableYear = availableYears[0];
      setSliderValue(firstAvailableYear);
      setSelectedTime(firstAvailableYear);
    }
  }, [availableYears, sliderValue, setSelectedTime]);

  useEffect(() => {
    // Sync sliderValue with selectedTime when selectedTime changes from outside
    if (selectedTime !== sliderValue && availableYears.includes(selectedTime)) {
      setSliderValue(selectedTime);
    }
  }, [selectedTime, sliderValue, availableYears]);

  const marks = [
    { value: 2000, label: '2000' },
    { value: 2010, label: '2010' },
    { value: 2020, label: '2020' },
    { value: 2030, label: '2030' },
    { value: 2040, label: '2040' },
    { value: 2050, label: '2050' },
    { value: 2060, label: '2060' },
    { value: 2070, label: '2070' },
    { value: 2080, label: '2080' },
    { value: 2090, label: '2090' },
  ];

  return (
    <div style={bottomBarStyle}>
      <Slider
        min={2000}
        max={2090}
        step={10}
        marks={marks}
        value={sliderValue}
        onChange={handleSliderChange}
        valueLabelDisplay="off"
        sx={{
          '& .MuiSlider-track': {
            display: 'none', // Hide the track
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#4a4a4a', // Keep rail visible
          },
          '& .MuiSlider-thumb': {
            backgroundColor: '#d1a766', // Thumb color
          },
          '& .MuiSlider-mark': {
            backgroundColor: '#4a4a4a', // Default mark color
          },
          '& .MuiSlider-markLabel': {
            color: 'grey', // Default mark label color for unavailable years
          },
          '& .MuiSlider-thumb:focus, & .MuiSlider-thumb:active, & .MuiSlider-thumb:hover': {
            boxShadow: 'none', // Remove blue shadow on thumb
          },
          ...availableYears.reduce((acc, year) => {
            const index = marks.findIndex((mark) => mark.value === year);
            if (index !== -1) {
              acc[`& .MuiSlider-mark[data-index="${index}"]`] = {
                backgroundColor: '#d1a766', // Mark color for available years
              };
              acc[`& .MuiSlider-markLabel[data-index="${index}"]`] = {
                color: 'white', // Label color for available years
              };
            }
            return acc;
          }, {}),
          [`& .MuiSlider-markLabel[data-index="${marks.findIndex(mark => mark.value === sliderValue)}"]`]: {
            color: '#d1a766', // Highlighted mark label color for the selected year
            fontWeight: 'bold', // Bold the selected year label
          },
        }}
      />
    </div>
  );
};

export default BottomBar;

const bottomBarStyle = {
  position: 'absolute',
  bottom: '30px',
  left: '100px',
  right: '50px',
  backgroundColor: '#333',
  color: '#d3d3d3',
  padding: '10px 40px',
  borderTop: '1px solid #444',
  display: 'flex',
  justifyContent: 'center',
  zIndex: '1000',
  boxSizing: 'border-box',
  overflow: 'hidden',
  opacity: '0.8',
  borderRadius: '10px',
};