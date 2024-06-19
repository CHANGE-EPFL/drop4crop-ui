import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './BottomBar.css';

const BottomBar = ({ selectedTime, onTimeChange }) => {
  return (
    <div className="bottom-bar">
      <Slider
              min={2000}
              max={2090}
              step={10}
              marks={{ 2000: '2000', 2010: '2010', 2020: '2020', 2030: '2030', 2040: '2040', 2050: '2050', 2060: '2060', 2070: '2070', 2080: '2080', 2090: '2090' }}
              defaultValue={parseInt(selectedTime, 10)}
              onChange={onTimeChange}
              styles={{
                  track: {
                      backgroundColor: '#007bff',
                  }
              }}
      />
    </div>
  );
};

export default BottomBar;
