import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from '@mui/material/Box';

import LeaderboardResultTable from './tables/LeaderboardResultTable';

function Carousel(props) {

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const [activeStep, setActiveStep] = useState(0);
  const [maxSteps, setMaxSteps] = useState();
  const [results, setResults] = useState([]);
  const touchStartX = useRef(null);

  useEffect(() => {
    let filteredArray = props.results.filter(item => item.rows.length > 0);
    setResults(filteredArray);
    setMaxSteps(filteredArray.length);
  }, [props.results]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveStep(
        activeStep === maxSteps - 1 ? 0 : activeStep + 1
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStep, maxSteps]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeStep < maxSteps - 1) handleNext();
      else if (diff < 0 && activeStep > 0) handleBack();
    }
    touchStartX.current = null;
  };

  return (
    <Box
      sx={{ flexGrow: 1, fontSize: '16px', margin: 0, padding: 0 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {results.map((result, index) => (
        index === activeStep ? (
          <LeaderboardResultTable
            key={result.title}
            style={{ width: '100%' }}
            title={result.title}
            subtitle={result.subtitle}
            numPlaces={result.numPlaces}
            rows={result.rows}
            columns={matches ? (result.desktopColumns || []) : (result.mobileColumns || [])}
            scroll={matches ? null : "scroll"}
            density="compact"
          />
        ) : null
      ))}
    </Box>
  );
}

export default Carousel;
