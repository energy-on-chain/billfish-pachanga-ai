import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { Select, MenuItem, Skeleton, Autocomplete, TextField, CircularProgress } from "@mui/material";
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

  // Select view - lookup mode (by category, or by team)
  const selectViewOptions = ["By Category", "By Team"];
  const [selectViewSelection, setSelectViewSelection] = useState("By Category");
  const [registeredTeamNameList, setRegisteredTeamNameList] = useState([]);
  const [teamNameListIsLoaded, setTeamNameListIsLoaded] = useState(false);
  const [teamLookupSelection, setTeamLookupSelection] = useState();

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

      const apiUrl = import.meta.env.VITE_NODE_ENV === "production"
        ? import.meta.env.VITE_SERVER_URL_PRODUCTION
        : import.meta.env.VITE_SERVER_URL_STAGING;

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
      fetchTeamNameList(apiUrl);
      setHasLoaded(true);

      setViewAlignment("List");
      setSelectedResult([]);
      setHasSelectedResult(false);
      setSelectViewSelection("By Category");
      setTeamLookupSelection();

    } catch (error) {
      console.error('Error loading config or fetching data:', error);
    }
  };

  const fetchTeamNameList = async (apiUrl) => {
    try {
      const res = await fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: `teams${year}` })
      });
      const data = await res.json();
      const tempNameList = Object.keys(data).map((teamKey) => ({
        teamKey,
        teamData: data[teamKey],
        label: data[teamKey].teamName,
      }));
      setRegisteredTeamNameList(tempNameList);
      setTeamNameListIsLoaded(true);
    } catch (error) {
      console.error('Error fetching team name list: ', error);
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

  const handleTeamLookupSelection = (event, value) => {
    setTeamLookupSelection(value ? value["teamData"]["teamName"] : undefined);
  };

  const formatPlace = (num) => {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
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
                    <h3 className="timestamp-text" style={{color: "red"}}><em>For information only.</em></h3>
                    <h3 className="timestamp-text" style={{color: "red"}}><em>Official results can only be certified by the tournament committee.</em></h3>
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
                    <Box sx={{ px: 2, py: 1 }}>
                      <Skeleton variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                      <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                      <Skeleton variant="rectangular" height={36} />
                    </Box>
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
                              isMobile={!matches}
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
                    <Box sx={{ px: 2, py: 1 }}>
                      <Skeleton variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                      <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                      <Skeleton variant="rectangular" height={36} />
                    </Box>
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
                    <Box sx={{ px: 2, py: 1 }}>
                      <Skeleton variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                      <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                      <Skeleton variant="rectangular" height={36} />
                    </Box>
                  ) : (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        {matches ? (
                          <ToggleSliderButton choice={selectViewSelection} choiceList={selectViewOptions} setAlignment={setSelectViewSelection} />
                        ) : (
                          <Select
                            labelId="select-lookup-mode"
                            id="select-lookup-mode"
                            value={selectViewSelection}
                            onChange={(e) => setSelectViewSelection(e.target.value)}
                          >
                            {selectViewOptions.map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        )}
                      </div>

                      {/* BY CATEGORY */}
                      {selectViewSelection === "By Category" && (
                        <>
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
                                    isMobile={!matches}
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
                        </>
                      )}

                      {/* BY TEAM */}
                      {selectViewSelection === "By Team" && (
                        <>
                          <br/>
                          {!teamNameListIsLoaded ? (
                            <CircularProgress/>
                          ) : (
                            <div className='pot-div'>
                              <Autocomplete
                                className='pot-autocomplete'
                                disablePortal
                                id="select-leaderboard-by-team-autocomplete-box"
                                options={registeredTeamNameList}
                                renderInput={(params) => <TextField {...params} label="Select Team" />}
                                onChange={handleTeamLookupSelection}
                                sx={{ width: '400px' }}
                              />
                            </div>
                          )}
                          <br/>

                          {!teamLookupSelection && (
                            <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>Please select a team</h1>
                          )}

                          {teamLookupSelection && (() => {
                            const overallResult = resultArray.find(r => r.title === "Tournament Grand Champion");
                            const overallRow = overallResult?.rows.find(row => row.team === teamLookupSelection);
                            const otherCategoryRows = resultArray
                              .filter(r => r.title !== "Tournament Grand Champion")
                              .map(r => ({ title: r.title, ...r.rows.find(row => row.team === teamLookupSelection) }))
                              .filter(entry => entry.team === teamLookupSelection);

                            return (
                              <div>
                                <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>
                                  <strong>Team Name:</strong> {teamLookupSelection}
                                </p>
                                {overallRow ? (
                                  <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>
                                    <strong>Total Points:</strong> {overallRow.points} (Overall Place: {formatPlace(overallRow.place)})
                                  </p>
                                ) : (
                                  <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>
                                    This team has not caught any qualifying fish yet.
                                  </p>
                                )}

                                {otherCategoryRows.length > 0 && (
                                  <>
                                    <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>
                                      <strong>Also Ranked In ({otherCategoryRows.length}):</strong>
                                    </p>
                                    <ul>
                                      {otherCategoryRows.map(entry => (
                                        <p key={entry.title} style={{ fontSize: '18px', color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>
                                          {entry.title} &mdash; {formatPlace(entry.place)}{entry.points !== undefined && ` (${entry.points} points)`}
                                        </p>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                        </>
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

