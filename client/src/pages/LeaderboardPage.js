import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import ToggleSliderButton from '../components/buttons/ToggleSliderButton';
import Carousel from '../components/Carousel';
import LeaderboardResultTable from '../components/tables/LeaderboardResultTable';
import './BasePage.css';

import { loadConfigForYear } from '../config/masterConfig';

dayjs.extend(advancedFormat);

function LeaderboardPage() {
  // General state
  const { year } = useParams();
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

  // State for dynamically loaded configuration
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchConfigAndData(); // Load config and fetch data
  }, [year]);

  const fetchConfigAndData = async () => {
    try {
      const loadedConfig = await loadConfigForYear(year); // Load config dynamically
      setConfig(loadedConfig); // Store the loaded config
      
      const {
        generalConfig: {
          CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
        },
        leaderboardConfig: {
          CONFIG_LEADERBOARD_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER,
          CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS,
          CONFIG_LEADERBOARD_CATEGORIES
        }
      } = loadedConfig;

      // Assess and set preliminary result status
      if (CONFIG_LEADERBOARD_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER) {
        let now = dayjs().valueOf();
        setIsPreliminaryResults(parseInt(CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS) > now);
        setTimestamp(generateTimestamp());
      } else {
        setIsPreliminaryResults(false);
      }

      const apiUrl = process.env.REACT_APP_NODE_ENV === "production"
        ? process.env.REACT_APP_SERVER_URL_PRODUCTION
        : process.env.REACT_APP_SERVER_URL_STAGING;

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
          });
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

      confirmTournamentStarted(apiUrl, loadedConfig);
      fetchData(apiUrl, queries, setResultArray);
      setHasLoaded(true);

      setViewAlignment("List");
      setSelectedResult([]);
      setHasSelectedResult(false);
      
    } catch (error) {
      console.error('Error loading config or fetching data:', error);
    }
  };

  const fetchData = async (apiUrl, queries, setResults) => {
    try {
      // Fetch from server and set result state
      const res = await Promise.all(queries.map((query) => {
        return fetch(`${apiUrl}/api/${year}/${query.url}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: query.body
        }).then(r => r.json()).then((result) => {
          var tempObject = {};
          var tempRows = [];
          Object.keys(result).map((catchKey, i) => {
            let tempObject = { ...result[catchKey], id: i, catchId: catchKey };
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
          return tempObject;
        });
      }));

      setResults(res);

    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const confirmTournamentStarted = async (apiUrl, loadedConfig) => {
    const { CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME } = loadedConfig.generalConfig;
    const { CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT } = loadedConfig.homeConfig;
    try {
      fetch(`${apiUrl}/api/${year}/get_catch_count_for_homepage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          catchesTableName: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          speciesTypeList: CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT,
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.count === 0) {
          setTournamentHasStarted(false);
        } else {
          setTournamentHasStarted(true);
        }
      })
      .catch(e => console.error(e));
    } catch (error) {
      console.error('Error confirming whether tournament has started: ', error);
    }
  };

  const generateTimestamp = () => {
    const now = dayjs();
    const timeString = now.format('hh:mm A');
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
        {config && (
          <>
            {/* BANNER */}
            <section style={{ backgroundColor: config?.stylingConfig?.CONFIG_STYLING_BANNER_BACKGROUND_COLOR }} className="section-banner">
              <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_BANNER_TEXT_COLOR }}>Leaderboard</h1>
            </section>

            <section className="section-leaderboard">
              <div style={{ marginTop: '0px', paddingTop: '0px' }}>
                <ToggleSliderButton choice={viewAlignment} choiceList={viewList} alignment={viewAlignment} setAlignment={setViewAlignment}/>
              </div>
            </section>

            {/* Leaderboard Views */}
            <section className="section-view">
              <Box sx={{ width: '90%', typography: 'body1' }}>
                {/* Preliminary results disclaimer message */}
                {isPreliminaryResults && (
                  <div>
                    <br/>
                    <h3 className="timestamp-text" style={{ color: config?.stylingConfig?.CONFIG_STYLING_LEADERBOARD_TIMESTAMP_TEXT_COLOR }}>
                      <em>{timestamp}</em>
                    </h3>
                    <br/>
                  </div>
                )}

                {/* Holdover message if there are no catches yet */}
                {!tournamentHasStarted && (
                  <div>
                    <br />
                    <h2 style={{ color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>
                      The {config?.generalConfig?.CONFIG_GENERAL_YEAR} tournament will begin soon!
                    </h2>
                  </div>
                )}

                {/* List view */}
                {viewAlignment === "List" && tournamentHasStarted && (
                  !hasLoaded ? (
                    <div>
                      <h1>Loading...</h1>
                    </div>
                  ) : (
                    <div>
                      <br/>
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
                              columns={matches ? result.desktopColumns : result.mobileColumns}
                              scroll={matches ? null : "scroll"}
                              density="compact"
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  )
                )}

                {/* Slideshow View */}
                {viewAlignment === "Slideshow" && tournamentHasStarted && (
                  !hasLoaded ? (
                    <div>
                      <h1>Loading...</h1>
                    </div>
                  ) : (
                    <div>
                      <br/>
                      <Carousel results={resultArray} />
                    </div>
                  )
                )}

                {/* Select View */}
                {viewAlignment === "Select" && tournamentHasStarted && (
                  !hasLoaded ? (
                    <div>
                      <h1>Loading...</h1>
                    </div>
                  ) : (
                    <div>
                      <div className="select-div">
                        <br/>
                        <Select
                          labelId="select-category"
                          id="select-category"
                          value={selectedResult[0]?.title || ''}
                          onChange={handleSelectResult}
                        >
                          {config?.leaderboardConfig?.CONFIG_LEADERBOARD_CATEGORIES.map((category) => (
                            <MenuItem key={category.title} value={category.title}>
                              {category.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </div>

                      {hasSelectedResult ? (
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
                                columns={matches ? result.desktopColumns : result.mobileColumns}
                                scroll={matches ? null : "scroll"}
                                density="compact"
                              />
                            ) : (
                              <h1 key={result.title}>No results yet.</h1>
                            )
                          ))}
                        </div>
                      ) : (
                        <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>Please select a category</h1>
                      )}
                    </div>
                  )
                )}
              </Box>
            </section>

            <Footer />
          </>
        )}
      </main>
    </AnimatedPage>
  );
}

export default LeaderboardPage;

