import React, { useState } from 'react';
import './TimePickerModal.css';
import TimeKeeper from 'react-timekeeper';

const TimePickerModal = ({ isOpen, onClose, selectedTime, onChange }) => {
  const [time, setTime] = useState(selectedTime);

  const handleSaveTime = () => {
    onChange(time);
    onClose();
  };
  const timeChanged = (time) =>{
      if (time !== undefined && time !== null) {
          var timeVal = extractTime(time.formatted);
        setTime(timeVal);
    }
  }
    const extractTime = (inputString) => {
      const pattern = /(\d+)(:\d{2})?\s*([AP])M/i;
  
      // Use the 'match' method to extract the value that matches the pattern
      const matchedValue = inputString.match(pattern);
  
      // Check if a match is found and return the result, else return null
      if (matchedValue) {
          let hour = parseInt(matchedValue[1], 10);
          let minute = matchedValue[2] ? parseInt(matchedValue[2].substring(1), 10) : 0;
          const period = matchedValue[3].toUpperCase();
  
          // Round up the minute to the nearest multiple of 5
          minute = Math.ceil(minute / 5) * 5;
  
          return hour + "" + (minute === 0 ? '' : minute) + "" + period
      } else {
          return '';
      }
  };

  return (
    <>
      {isOpen && (
        <div className="time-picker-modal-container">
          <TimeKeeper
            onChange={(data) => timeChanged(data)}
            onDoneClick={() => handleSaveTime()}
            />
        </div>
      )}
    </>
  );
};

export default TimePickerModal;
