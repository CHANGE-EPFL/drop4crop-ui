import React from 'react';
// import Slider from 'rc-slider';
import Slider from '@mui/material/Slider';
import './BottomBar.css';

const BottomBar = ({ selectedTime, onTimeChange }) => {


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
        defaultValue={parseInt(selectedTime, 10)}
        onChange={onTimeChange}
        valueLabelDisplay="auto"
        valueLabelDisplay="off"
        sx={{
          '& .MuiSlider-track': {
            display: 'none',
          },
          color: '#d1a766',
          '& .MuiSlider-markLabel': {
            color: '#d1a766',
          },
        }}
      />
    </div>
  );
};

export default BottomBar;
