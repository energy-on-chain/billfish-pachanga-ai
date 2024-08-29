import React, { useState, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from 'dayjs';

// import StaticTable from '../components/StaticTable';

import './BasePage.css';

function NewsfeedPage() {

  // General component state
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));  
  const [apiUrl, setApiUrl] = useState();
  
  // General table state
  const desktopScroll = null;
  const mobileScroll = 'scroll';
  const [style, setStyle] = useState();
  const [initialState, setInitialState] = useState();
  const [pageSizeOptions, setPageSizeOptions] = useState();

  useEffect(() => {
    fetchData();    
  }, []);

  const fetchData = async () => {

    try {

      // set environment
      let initialApiUrl = null;
      if (process.env.REACT_APP_NODE_ENV === "staging") {
        initialApiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
      } else if (process.env.REACT_APP_NODE_ENV === "production") {
        initialApiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
      }

      // fetch default tab data from server
      const catchResponse2024 = await fetch(`${initialApiUrl}/api/get_catches`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({catchYear: 'catches2024'})
      })
      const catchResult2024 = await catchResponse2024.json();
      var tempCatchRows2024= [];
      Object.keys(catchResult2024).map((anglerKey, i) => {
        let tempObject = {...catchResult2024[anglerKey], id: i};
        tempCatchRows2024.push(tempObject);
      })

      // set states
      setApiUrl(initialApiUrl);
      // setCatchRows2024(tempCatchRows2024);
      // setCatchRows2024HasLoaded(true);
      setStyle({ height: 400, width: '100%'});
      setInitialState({pagination: {paginationModel: { page: 0, pageSize: 5 }}});
      // setPageSizeOptions([5, 10, 25, 100, { value: catchRows.length, label: 'All' }]);
      setPageSizeOptions([5, 10, 25, 100]);      
    } catch (error) {
      console.log('There was an error loading the server data for the default tab on the public catch page: ' + error);
    }
  }

  return (
    <AnimatedPage>
      <main>
        <section className="section-banner">
          <h1>Newsfeed</h1>
        </section>
        <section className="section-contact">
        <Box sx={{ width: '90%', typography: 'body1' }}>
          {/* FIXME: content goes here */}
        </Box>
        </section>
        <Footer/>
      </main>
    </AnimatedPage>
  );
}

export default NewsfeedPage;

