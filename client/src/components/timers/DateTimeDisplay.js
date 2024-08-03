import React from 'react';

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <div className={isDanger ? 'countdown danger' : 'countdown'}>
      <p className="countdown-number">{value}</p>
      <span>{type}</span>
    </div>
  );
};

export default DateTimeDisplay;

