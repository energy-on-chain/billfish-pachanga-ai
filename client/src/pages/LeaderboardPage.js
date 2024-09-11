import React, { useState, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import ToggleSliderButton from '../components/buttons/ToggleSliderButton';
import Carousel from '../components/Carousel';
import LeaderboardResultTable from '../components/tables/LeaderboardResultTable';
import './BasePage.css';

import {
  CONFIG_GENERAL_YEAR,
  CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME, 
} from '../config/generalConfig';

import { 
  CONFIG_LEADERBOARD_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER,
  CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS,
  CONFIG_LEADERBOARD_CATEGORIES, 
} from '../config/leaderboardConfig';

import { 
  CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT, 
} from '../config/homeConfig';


function LeaderboardPage() {

  dayjs.extend(advancedFormat);

  // General state
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const [timestamp, setTimestamp] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tournamentHasStarted, setTournamentHasStarted] = useState(false);
  const [resultArray, setResultArray] = useState([]);
  const [isPreliminaryResults, setIsPreliminaryResults] = useState(true);

  // View state
  const viewList = ["List", "Select", "Slideshow"];
  const [viewAlignment, setViewAlignment] = useState('List');
  const [selectedResult, setSelectedResult] = useState([]);
  const [hasSelectedResult, setHasSelectedResult] = useState(false);

  useEffect(() => {
    
    // Assess and set preliminary result status
    if (CONFIG_LEADERBOARD_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER) {
      let now = dayjs().valueOf();
      setIsPreliminaryResults(parseInt(CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS) > now);
      setTimestamp(generateTimestamp());
    } else {
      setIsPreliminaryResults(false);
    };

    // Define environment
    let apiUrl = null;   
    if (process.env.REACT_APP_NODE_ENV === "staging") {
      apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
    } else if (process.env.REACT_APP_NODE_ENV === "production") {
      apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
    }

    // Build queries
    const queries = CONFIG_LEADERBOARD_CATEGORIES.map((item) => {
      let bodyData = { 
        catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
        numPlaces: item.numPlaces,
        isReport: false, 
      };
    
      // Add any extra inputs in the item's inputs array
      if (item.inputs && item.inputs.length > 0) {
        item.inputs.forEach(input => {
          Object.keys(input).forEach(param => {
            bodyData[param] = input[param];
          });
        })
      }
    
      return {
        title: item.title,
        subtitle: item.subtitle || "",
        numPlaces: item.numPlaces,
        url: item.url,
        body: JSON.stringify(bodyData),
        desktopColumns: item.desktopColumns,
        mobileColumns: item.mobileColumns,
      };
    });    

    // Execute queries and set result state
    confirmTournamentStarted(apiUrl);
    fetchData(apiUrl, queries, setResultArray);
    setHasLoaded(true);

    // Set view state
    setViewAlignment("List");
    setSelectedResult([]);
    setHasSelectedResult(false);

  }, []);

  const fetchData = async (apiUrl, queries, setResults) => {

    try {

      // Fetch from server and set result state
      const res = await Promise.all(queries.map((query) => {
        return fetch(`${apiUrl}/api/${query.url}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: query.body
        }).then(r => r.json()).then((result) => {
          var tempObject = {};
          var tempRows = [];
          Object.keys(result).map((catchKey, i) => {
            let tempObject = {...result[catchKey], id: i, catchId: catchKey};
            tempRows.push(tempObject);
          });
          tempObject = {
            title: query.title, 
            subtitle: query.subtitle,
            numPlaces: query.numPlaces,
            rows: tempRows, 
            desktopColumns: query.desktopColumns, 
            mobileColumns: query.mobileColumns
          };
          console.log(tempObject);
          return tempObject;
        });
      }));
      
      setResults(res);

    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  }

  const confirmTournamentStarted = async (apiUrl) => {

    try {
      fetch(`${apiUrl}/api/get_catch_count_for_homepage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          catchesTableName: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          speciesTypeList: CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT,
         })
      })
      .then(res => res.json())
      .then(data => {
        if (data.count == 0) {
          console.log("Tournament has NOT started yet because there are no catches.");
          setTournamentHasStarted(false);
        } else {
          console.log("Tournament has begun, there are catches entered.");
          setTournamentHasStarted(true);
        }
      })
      .catch(e => console.error(e));

    } catch (error) {
      console.error('Error confirming whether tournament has started: ', error);
    }
  }

  // Helpers
  const generateTimestamp = () => {
    const now = dayjs();
    const timeString = now.format('hh:mm A'); // Adjust the format as needed
    const dateString = now.format('DD MMMM YYYY');
    return `Preliminary leaderboard as of: ${timeString} on ${dateString}.`;
  };

  const handleSelectResult = (e) => {
    let result = resultArray.filter(item => item.title === e.target.value);
    setSelectedResult(result);
    setHasSelectedResult(true);
  };

  return (
    <AnimatedPage>
      <main>

        <section className="section-banner">
          <h1>Leadboard</h1>
        </section>

        <section className="section-leaderboard">
          <div style={{ marginTop: '0px', paddingTop: '0px' }}>
            <ToggleSliderButton choice={viewAlignment} choiceList={viewList} aligment={viewAlignment} setAlignment={setViewAlignment}/>
          </div>
        </section>

        {/* Leaderboard Views */}
        <section className="section-view">
          <Box sx={{ width: '90%', typography: 'body1' }}>

            {/* Preliminary results disclaimer message */}
            { isPreliminaryResults ?
              (
                <div>
                  <br/>
                  <h3><em>{timestamp}</em></h3>
                  <br/>
                </div>
              ) : (
                <div>
                  <br/>
                </div>
             )
            }

            {/* Holdover message if there are no catches yet */}
            { !tournamentHasStarted &&
              <div>
                <br />
                <br />
                <h2>The {CONFIG_GENERAL_YEAR} tournament will begin soon!</h2>
              </div>
            }

            {/* List view */}
            { viewAlignment === "List" && tournamentHasStarted &&
              (!hasLoaded ? (
                <div>
                  <h1>Loading...</h1>
                </div>
              ) : (
                <div>
                  {resultArray.map(result => {
                    if (result.rows.length > 0) {
                      return (
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
                      );
                    }
                    return null;
                  })}
                </div>
              ))
            }

            {/* Slideshow View */}
            { (viewAlignment === "Slideshow" && tournamentHasStarted) &&
              (!hasLoaded ? (
                <div>
                  <h1>Loading...</h1>
                </div>
              ) : (
                <Carousel results={resultArray} />
              ))
            }

            {/* Select View */}
            { (viewAlignment === "Select" && tournamentHasStarted) &&
              (!hasLoaded ? (
                <div>
                  <h1>Loading...</h1>
                </div>
              ) : (
                <div>
                  <div className="select-div">
                    <Select
                      labelId="select-category"
                      id="select-category"
                      value={selectedResult[0]?.title || ''}
                      onChange={handleSelectResult}
                    >
                      {CONFIG_LEADERBOARD_CATEGORIES.map((category) => (
                        <MenuItem key={category.title} value={category.title}>
                          {category.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  { hasSelectedResult ? (
                    <div>
                      {selectedResult.map(result => (
                        result.rows.length > 0 ? (
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
                        ) : (
                          <h1 key={result.title}>No results yet.</h1>
                        )
                      ))}
                    </div>
                  ) : (
                    <h1>Please select a category</h1>
                  )}
                </div>
              ))
            }

          </Box>
        </section>

        <Footer/>
      </main>
    </AnimatedPage>
  );
}

export default LeaderboardPage;

