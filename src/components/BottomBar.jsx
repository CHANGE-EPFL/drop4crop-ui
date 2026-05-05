import React, { useContext, useEffect, useState, useMemo } from 'react';
import Slider from '@mui/material/Slider';
import './BottomBar.css';
import { AppContext } from '../contexts/AppContext';
import { useProject } from '../contexts/ProjectContext';


const BottomBar = () => {
  const {
    setSelectedTime,
    selectedTime,
    availableYears,
  } = useContext(AppContext);
  const { config } = useProject() || {};
  const yearAxis = config?.project?.year_axis;

  const { min, max, step, marks } = useMemo(() => {
    if (yearAxis?.mode === 'list' && Array.isArray(yearAxis.values)) {
      const sorted = [...yearAxis.values].sort((a, b) => a - b);
      return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        step: null,
        marks: sorted.map(v => ({ value: v, label: String(v) })),
      };
    }
    const lo = yearAxis?.min ?? availableYears[0] ?? 2000;
    const hi = yearAxis?.max ?? availableYears[availableYears.length - 1] ?? 2090;
    const st = yearAxis?.step ?? 10;
    const m = [];
    for (let v = lo; v <= hi; v += st) m.push({ value: v, label: String(v) });
    return { min: lo, max: hi, step: st, marks: m };
  }, [yearAxis, availableYears]);

  const initialTime = parseInt(selectedTime, 10);
  const [sliderValue, setSliderValue] = useState(initialTime);

  const handleSliderChange = (event, value) => {
    if (availableYears.includes(value)) {
      setSliderValue(value);
      setSelectedTime(value);
    }
  };

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(sliderValue)) {
      const firstAvailableYear = availableYears[0];
      setSliderValue(firstAvailableYear);
      setSelectedTime(firstAvailableYear);
    }
  }, [availableYears, sliderValue, setSelectedTime]);

  useEffect(() => {
    if (selectedTime !== sliderValue && availableYears.includes(selectedTime)) {
      setSliderValue(selectedTime);
    }
  }, [selectedTime, sliderValue, availableYears]);

  return (
    <div style={bottomBarStyle}>
      <Slider
        min={min}
        max={max}
        step={step}
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
            backgroundColor: '#009da9', // Thumb color
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
                backgroundColor: '#009da9', // Mark color for available years
              };
              acc[`& .MuiSlider-markLabel[data-index="${index}"]`] = {
                color: 'white', // Label color for available years
              };
            }
            return acc;
          }, {}),
          [`& .MuiSlider-markLabel[data-index="${marks.findIndex(mark => mark.value === sliderValue)}"]`]: {
            color: '#009da9', // Highlighted mark label color for the selected year
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