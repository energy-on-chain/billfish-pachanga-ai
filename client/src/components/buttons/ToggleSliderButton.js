import React, { useState, useEffect } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function ToggleSliderButton(props) {

  const handleChange = (e) => {
    props.setAlignment(e.target.value)
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={props.choice}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
    >
      {props.choiceList.map((item) => {
        return <ToggleButton value={item}>{item}</ToggleButton>
      })}
    </ToggleButtonGroup>
  );
}

export default ToggleSliderButton;

