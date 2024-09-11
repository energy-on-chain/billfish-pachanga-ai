import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from '@mui/material/Box';
import SwipeableViews from 'react-swipeable-views-react-18-fix';

// import Button from '@mui/material/Button';
// import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
// import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
// import { autoPlay } from 'react-swipeable-views-utils';

import LeaderboardResultTable from './tables/LeaderboardResultTable';

// const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function Carousel(props) {

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const [activeStep, setActiveStep] = useState(0);
  const [maxSteps, setMaxSteps] = useState();
  const [results, setResults] = useState([]);

  useEffect(() => { 
    let filteredArray = props.results.filter(item => item.rows.length > 0);
    setResults(filteredArray);
    setMaxSteps(filteredArray.length);
    console.log(filteredArray);
    console.log(filteredArray.length);
  }, [props.results]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveStep(
        activeStep === maxSteps - 1 ? 0 : activeStep + 1
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStep, maxSteps]);

  return (
    <Box sx={{ flexGrow: 1, fontSize: '16px', margin: 0, padding: 0 }}>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        {results.map((result, index) => (
          <div key={result.title}>
            {Math.abs(activeStep - index) <= 2 ? (
              <LeaderboardResultTable
                key={result.title}
                style={{ width: '100%' }}
                title={result.title}
                subtitle={result.subtitle}
                numPlaces={result.numPlaces}
                rows={result.rows}
                columns={matches ? (result.desktopColumns || []) : (result.mobileColumns || [])}
                scroll={matches ? (null) : ("scroll")}
                density="compact"
              />
            ) : null}
          </div>
        ))}
      </SwipeableViews>

      {/* <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="large"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            Next
            {theme.direction === 'rtl' ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button size="large" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      /> */}
      
    </Box>
  );
}

export default Carousel;
