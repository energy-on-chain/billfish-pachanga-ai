import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from '@mui/material/Box';

import LeaderboardResultTable from './tables/LeaderboardResultTable';

function Carousel(props) {

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("sm"));
  const [activeStep, setActiveStep] = useState(0);
  const [maxSteps, setMaxSteps] = useState(0);
  const [results, setResults] = useState([]);
  const touchStartX = useRef(null);

  useEffect(() => {
    const filteredArray = props.results.filter(item => item.rows.length > 0);
    setResults(filteredArray);
    setMaxSteps(filteredArray.length);
    setActiveStep(0);
  }, [props.results]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, maxSteps - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (maxSteps < 2) return;
    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev === maxSteps - 1 ? 0 : prev + 1));
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
      if (diff > 0) handleNext();
      else handleBack();
    }
    touchStartX.current = null;
  };

  if (results.length === 0) return null;

  return (
    <Box
      sx={{ width: '100%', fontSize: '16px', margin: 0, padding: 0, overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{
        display: 'flex',
        transform: `translateX(-${activeStep * 100}%)`,
        transition: 'transform 0.4s ease-in-out',
        willChange: 'transform',
      }}>
        {results.map((result) => (
          <div key={result.title} style={{ minWidth: '100%' }}>
            <LeaderboardResultTable
              style={{ width: '100%' }}
              title={result.title}
              subtitle={result.subtitle}
              numPlaces={result.numPlaces}
              rows={result.rows}
              columns={isMobile ? (result.mobileColumns || []) : (result.desktopColumns || [])}
              isMobile={isMobile}
              density="compact"
            />
          </div>
        ))}
      </div>
    </Box>
  );
}

export default Carousel;
