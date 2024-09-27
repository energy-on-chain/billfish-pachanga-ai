import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Select, MenuItem, InputLabel, Autocomplete, TextField } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import ToggleSliderButton from '../components/buttons/ToggleSliderButton';
import PotCarousel from '../components/PotCarousel';
import PotsResultTable from '../components/tables/PotsResultTable';
import './BasePage.css';

import { loadConfigForYear } from '../config/masterConfig';

dayjs.extend(advancedFormat);

function PotsPage() {

  // STATE - GENERAL
  const { year } = useParams();
  const [config, setConfig] = useState(null);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const [timestamp, setTimestamp] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tournamentHasStarted, setTournamentHasStarted] = useState(false);
  const [isPreliminaryResults, setIsPreliminaryResults] = useState(true);
  const [allDataIsFetched, setAllDataIsFetched] = useState(false);

  // STATE - ENTRIES
  const [potEntryData, setPotEntryData] = useState();    // data
  const [potEntryDataHasLoaded, setPotEntryDataHasLoaded] = useState(false);
  const displayOptions = ["Entries", "Payouts"];    // display options
  const [displaySelection, setDisplaySelection] = useState("Payouts");
  const entriesViewOptions = ["Board", "By Pot", "By Team"]    // for entries
  const [entriesViewSelection, setEntriesViewSelection] = useState("Board");
  const [entriesBoardOptions, setEntriesBoardOptions] = useState();
  const [entriesBoardSelection, setBoardSelection] = useState();
  const [registeredTeamList, setRegisteredTeamList] = useState([]);
  const [registeredTeamNameList, setRegisteredTeamNameList] = useState([]);
  const [teamNameListIsLoaded, setTeamNameListIsLoaded] = useState(false);
  const [entriesTeamSelection, setEntriesTeamSelection] = useState();
  const [entriesPotOptions, setEntriesPotOptions] = useState();
  const [entriesPotSelection, setEntriesPotSelection] = useState();

  // STATE - PAYOUTS
  const payoutsViewOptions = ["By Pot", "By Team"];    // for payouts
  const [payoutsViewSelection, setPayoutsViewSelection] = useState("By Pot");
  const payoutsDisplayOptions = ["List", "Select", "Slideshow"];
  const [payoutsDisplaySelection, setPayoutsDisplaySelection] = useState("List");
  const [payoutsSelectedResult, setPayoutsSelectedResult] = useState([]);
  const [payoutsHasSelectedResult, setPayoutsHasSelectedResult] = useState(false);
  const [payoutsResultArray, setPayoutsResultArray] = useState([]);
  const [payoutsTeamResultSummary, setPayoutsTeamResultSummary] = useState([]);
  const [payoutsTeamSelection, setPayoutsTeamSelection] = useState();
  const [payoutsTeamResultObject, setPayoutsTeamResultObject] = useState([]);
  const [totalGrossPot, setTotalGrossPot] = useState(0);

  useEffect(() => {
    fetchConfigAndData();
  }, [year]);

  useEffect(() => {
    if (potEntryData) {
      const totalPot = potEntryData.reduce((acc, entry) => {
        return acc + (entry.totalPotFee || 0); // Sum totalPotFee from each entry
      }, 0);
      setTotalGrossPot(totalPot);
    }
  }, [potEntryData]); // Runs this effect whenever potEntryData is updated

  const fetchConfigAndData = async () => {
    try {
      const loadedConfig = await loadConfigForYear(year); // Load config dynamically
      setConfig(loadedConfig); // Store the loaded config
      
      const {
        generalConfig: {
          CONFIG_GENERAL_YEAR,
          CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
          CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
        },
        stylingConfig: {
          CONFIG_STYLING_BANNER_BACKGROUND_COLOR,
          CONFIG_STYLING_BANNER_TEXT_COLOR,
          CONFIG_STYLING_POTS_TIMESTAMP_TEXT_COLOR,
          CONFIG_STYLING_POTS_TITLE_TEXT_COLOR,
          CONFIG_STYLING_SECTION_BACKGROUND_COLOR,
          CONFIG_STYLING_SECTION_TEXT_COLOR,
          CONFIG_STYLING_H2_COLOR,
        },
        homeConfig: {
          CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT,
        },
        potsConfig: {
          CONFIG_POTS_TEAM_SUMMARY_DESKTOP_COLUMN_DEFINITIONS,
          CONFIG_POTS_TEAM_SUMMARY_MOBILE_COLUMN_DEFINITIONS,
          CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_DESKTOP_COLUMN_DEFINITIONS,
          CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_MOBILE_COLUMN_DEFINITIONS,
          CONFIG_POTS_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER,
          CONFIG_POTS_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS,
          CONFIG_POTS_CATEGORIES,
          CONFIG_POTS_BOARD_LIST,
        },
      } = loadedConfig;

      // Set toggle menu options
      setEntriesBoardOptions(CONFIG_POTS_BOARD_LIST.map(boardObj => Object.keys(boardObj)[0]));
      setEntriesPotOptions(CONFIG_POTS_BOARD_LIST.flatMap(boardObj => {
        const boardName = Object.keys(boardObj)[0];  // Extract the board name
        return boardObj[boardName].map(pot => pot.title);  // Extract the pot titles for each board
      }))

      // Assess and set preliminary result status
      if (CONFIG_POTS_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER) {
        let now = dayjs().valueOf();
        setIsPreliminaryResults(parseInt(CONFIG_POTS_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS) > now);
        setTimestamp(generateTimestamp());
      } else {
        setIsPreliminaryResults(false);
      };

      const apiUrl = process.env.REACT_APP_NODE_ENV === "production"
      ? process.env.REACT_APP_SERVER_URL_PRODUCTION
      : process.env.REACT_APP_SERVER_URL_STAGING;

      // Build queries for payouts
      const queries = CONFIG_POTS_CATEGORIES.map((item) => {

        // Basic data
        let bodyData = { 
          catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          potYear: CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
          isReport: false, 
          title: item.title,
          subtitle: item.subtitle || "",
          potName: item.potName,
          entryAmount: item.entryAmount,
          tournamentCut: item.tournamentCut,
          payoutStructure: item.payoutStructure,
          numPlaces: Object.keys(item.payoutStructure).length,
        };
      
        // Add any extra inputs required (e.g. specific date)
        if (item.inputs && item.inputs.length > 0) {
          item.inputs.forEach(input => {
            Object.keys(input).forEach(param => {
              bodyData[param] = input[param];
            });
          })
        }
      
        // Return above info, including rest of query items
        return {
          url: item.url,
          body: JSON.stringify(bodyData),
          title: item.title,
          subtitle: item.subtitle || "",
          numPlaces: Object.keys(item.payoutStructure).length,
          desktopColumns: item.desktopColumns,
          mobileColumns: item.mobileColumns,
        };
      });    

      // Execute data retrieval
      confirmTournamentStarted(apiUrl, loadedConfig);
      fetchData(apiUrl, queries, setPayoutsResultArray);
      setHasLoaded(true);

  } catch (error) {
    console.error('Error loading config or fetching data:', error);
  }
  };

  const fetchData = async (apiUrl, queries, setResults) => {

    try {

      // ENTRIES - Get registered team list
      fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {    
        method: 'POST',    
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({tableName: `teams${year}`})
      })
      .then(res => res.json())
      .then(data => {
        var tempList = [];
        var tempNameList = [];
        Object.keys(data).map((teamKey, i) => {
          let tempObject = {};
          let tempNameObject = {};
          tempObject[teamKey] = data[teamKey]
          tempNameObject["teamKey"] = teamKey;
          tempNameObject["teamData"] = data[teamKey];
          tempNameObject["label"]= data[teamKey].teamName;
          tempList.push(tempObject);
          tempNameList.push(tempNameObject);
        })
        setRegisteredTeamList(tempList);
        setRegisteredTeamNameList(tempNameList);
        setTeamNameListIsLoaded(true);
      });

      // ENTRIES - Get all pot data
      fetch(`${apiUrl}/api/${year}/get_all_pot_data`, {    
        method: 'POST',    
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({potYear: `pots${year}`})
      })
      .then(res => res.json())
      .then(data => {
        setPotEntryData(data.data);
        setPotEntryDataHasLoaded(true);
        console.log(data.data);
      });

      // PAYOUTS - Fetch pot results for all categories
      const res = await Promise.all(queries.map((query) => {
        return fetch(`${apiUrl}/api/${year}/${query.url}`, {
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

      // PAYOUTS - Set pot results for all teams
      // Team summary
      const payoutsTeamMap = {};    
      res.forEach(potResult => {
        potResult.rows.forEach(row => {
          const team = row.team;
          if (!payoutsTeamMap[team]) {
            payoutsTeamMap[team] = { team: team, payout: 0 };
          }
          payoutsTeamMap[team].payout += row.payout; // Accumulate payout for each team
        });
      });
      const teamSummaryArray = Object.values(payoutsTeamMap).sort((a, b) => b.payout - a.payout);
      setPayoutsTeamResultSummary(teamSummaryArray);

      // Individual team summary
      const payoutsTeamResultObject = {};
      res.forEach(potResult => {
        potResult.rows.forEach(row => {
          const team = row.team;
          if (!payoutsTeamResultObject[team]) {
            payoutsTeamResultObject[team] = [];
          }
          if (row.payout > 0) {
            payoutsTeamResultObject[team].push({
              potName: potResult.title,
              place: row.place,
              payout: row.payout,
            });
          }
        });
      });
      Object.keys(payoutsTeamResultObject).forEach(team => {
        payoutsTeamResultObject[team].sort((a, b) => b.payout - a.payout);
      });
      setPayoutsTeamResultObject(payoutsTeamResultObject);

      // Confirm all data has been fetched from server
      setAllDataIsFetched(true);

    } catch (error) {
      console.log('There was an error loading initial data from the server in the admin add pots component: ' + error);
    }
  };

  const confirmTournamentStarted = async (apiUrl ,loadedConfig) => {
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
    return `Preliminary pot standings as of: ${timeString} on ${dateString}.`;
  };

  const handleEntriesTeamSelection = (event, value) => {
    setEntriesTeamSelection(value["teamData"]["teamName"]);
  };
  
  const handleEntriesPotSelection = (event, value) => {
    setEntriesPotSelection(value);
  };

  const handlePayoutsTeamSelection = (event, value) => {
    setPayoutsTeamSelection(value["teamData"]["teamName"]);
  };

  const handlePayoutsSelectResult = (e) => {
    let result = payoutsResultArray.filter(item => item.title === e.target.value);
    setPayoutsSelectedResult(result);
    setPayoutsHasSelectedResult(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPlace = (num) => {
    const j = num % 10,
          k = num % 100;
    if (j === 1 && k !== 11) {
      return `${num}st`;
    }
    if (j === 2 && k !== 12) {
      return `${num}nd`;
    }
    if (j === 3 && k !== 13) {
      return `${num}rd`;
    }
    return `${num}th`;
  };  
  
  return (
    <AnimatedPage>
      <main>

        {/* BANNER */}
        <section style={{ backgroundColor: config?.stylingConfig?.CONFIG_STYLING_BANNER_BACKGROUND_COLOR }} className="section-banner">
          <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_BANNER_TEXT_COLOR }}>Pots</h1>
        </section>

        {/* SELECT VIEW ENTRIES OR PAYOUTS */}
        { allDataIsFetched &&
          <section className="section-leaderboard">
            <div>
              { matches ? (
                <div>
                  <ToggleSliderButton choice={displaySelection} choiceList={displayOptions} aligment={displaySelection} setAlignment={setDisplaySelection} />
                </div>
              ) : (
                <div>
                  <Select labelId="view-label" id="view" value={displaySelection} onChange={(e) => setDisplaySelection(e.target.value)}>
                    {displayOptions.map(view => (
                      <MenuItem key={view} value={view}>View {view}</MenuItem>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </section>
        } 

        {/* SET DETAILED VIEW OPTIONS */}
        { allDataIsFetched &&
          <section className="section-leaderboard">
            <div>

              {/* "BY ..." SELECTION */}
              { matches ? (
                <div>
                  {displaySelection === "Entries" &&
                    <ToggleSliderButton choice={entriesViewSelection} choiceList={entriesViewOptions} aligment={entriesViewSelection} setAlignment={setEntriesViewSelection}/>
                  }
                  {displaySelection === "Payouts" &&
                    <>
                      <ToggleSliderButton choice={payoutsViewSelection} choiceList={payoutsViewOptions} aligment={payoutsViewSelection} setAlignment={setPayoutsViewSelection}/>
                      <ToggleSliderButton choice={payoutsDisplaySelection} choiceList={payoutsDisplayOptions} aligment={payoutsDisplaySelection} setAlignment={setPayoutsDisplaySelection}/>
                    </>
                  }
                </div>
              ) : (
                <div>
                  {displaySelection === "Entries" &&
                    <Select labelId="view-label" id="view" value={entriesViewSelection} onChange={(e) => setEntriesViewSelection(e.target.value)}>
                      {entriesViewOptions.map(view => (
                        <MenuItem key={view} value={view}>{view}</MenuItem>
                      ))}
                    </Select>
                  }
                  {displaySelection === "Payouts" &&
                    <div>
                      <Select labelId="view-label" id="view" value={payoutsViewSelection} onChange={(e) => setPayoutsViewSelection(e.target.value)}>
                        {payoutsViewOptions.map(view => (
                          <MenuItem key={view} value={view}>{view}</MenuItem>
                        ))}
                      </Select>
                      <Select labelId="view-payouts-label" id="payouts-view" value={payoutsDisplaySelection} onChange={(e) => setPayoutsDisplaySelection(e.target.value)}>
                        {payoutsDisplayOptions.map(view => (
                          <MenuItem key={view} value={view}>{view}</MenuItem>
                        ))}
                      </Select>
                    </div>
                  }
                </div>
              )}

            </div>
          </section>
        }

        <section className="section-view">
          <Box sx={{ width: '90%', typography: 'body1' }}>

            {/* Preliminary results disclaimer message */}
            { (allDataIsFetched && isPreliminaryResults && displaySelection === "Payouts") ?
              (
                <div>
                  <br/>
                  <h1 style={{ fontSize: '30px', marginBottom: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}>Total Pot Value: {formatCurrency(totalGrossPot)}</h1>
                  <h3 className="timestamp-text" style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TIMESTAMP_TEXT_COLOR}}><em>{timestamp}</em></h3>
                </div>
              ) : (
                <div>
                </div>
            )
            }

            {/* Holdover message if there are no catches yet */}
            { (!tournamentHasStarted && displaySelection === "Payouts") &&
              <div>
                <br/>
                <h2 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>The {year} tournament will begin soon!</h2>
              </div>
            }

            {/* Loading screen while fetching data from server */}
            { !allDataIsFetched && 
              <>
                <br/>
                <br/>
                <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Loading, one moment please...</h1>
                <CircularProgress/>
              </>
            }


            {/* ENTRIES - BY BOARD */}
            { ( (displaySelection === "Entries") && (entriesViewSelection === "Board") ) &&
              <>
                <br/> 

                {/* Board Table Display */}
                <div className="board-display">

                  <h3 style={{fontStyle: "italic", color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}} >Scroll bar at bottom if needed</h3>
                  <br/>

                  {potEntryData ? (
                    (() => {
                      // Step 1: Get all pot names from all boards
                      let allPots = [];
                      config?.potsConfig?.CONFIG_POTS_BOARD_LIST.forEach(boardObj => {
                        Object.values(boardObj).forEach(potArray => {
                          potArray.forEach(pot => {
                            allPots.push(pot.title); // Add pot titles
                          });
                        });
                      });
                      allPots = [...new Set(allPots)]; // Remove duplicates (just in case)

                      // Step 2: Get all team names and their selected pots
                      const teamsData = potEntryData.map(entry => {
                        const teamPots = [];
                        entry.boardSelections.forEach(boardSelection => {
                          teamPots.push(...boardSelection.potList); // Collect all pots a team entered
                        });
                        return {
                          teamName: entry.teamName,
                          potsEntered: teamPots.sort(), // Sort the pots alphabetically for consistency
                        };
                      });

                      // Step 3: Initialize a counter for the total number of entries in each pot
                      const totalEntered = allPots.map(() => 0);

                      // Define the styles for the table cells
                      const headerCellStyle = {
                        border: '1px solid #ddd',
                        padding: '8px',
                        fontSize: '14px',
                        backgroundColor: '#f4f4f4',
                        fontWeight: 'bold',
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR,
                      };

                      const teamCellStyle = {
                        border: '1px solid #ddd',
                        padding: '8px',
                        fontSize: '14px',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: '#fff',
                        zIndex: 1,
                        fontWeight: 'bold',
                        color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR,
                      };

                      const tableCellStyle = {
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR,
                      };

                      return (
                        <div className="scroll-wrapper"> {/* Scroll wrapper with reversed scroll */}
                          <div className="scroll-content"> {/* Inner content with normal direction */}
                            <table className="pot-table">
                              <thead>
                                <tr>
                                  <th className="sticky-col" style={headerCellStyle}>Team</th>
                                  {/* Render the pot names as columns */}
                                  {allPots.map((potName, index) => (
                                    <th key={index} style={headerCellStyle}>{potName}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {/* Render each team and their pot entries */}
                                {teamsData.map((team, teamIndex) => (
                                  <tr key={teamIndex}>
                                    <td className="sticky-col" style={teamCellStyle}>{team.teamName}</td>
                                    {allPots.map((potName, potIndex) => {
                                      const entered = team.potsEntered.includes(potName);
                                      if (entered) totalEntered[potIndex] += 1; // Increment the counter if the team entered the pot
                                      return (
                                        <td key={potIndex} style={tableCellStyle}>
                                          {entered ? 'X' : ''}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}

                                {/* Add the Total Entries row */}
                                <tr>
                                  <td style={{ ...teamCellStyle, fontWeight: 'bold' }}>Total Entries</td>
                                  {totalEntered.map((count, index) => (
                                    <td key={index} style={{ ...tableCellStyle, fontWeight: 'bold' }}>
                                      {count}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>No pot entry data available.</p>
                  )}
                </div>

              </>
            }

            {/* ENTRIES - BY POT */}
            { ( (displaySelection === "Entries") && (entriesViewSelection === "By Pot") ) &&
              <>
                <br/>

                {/* Select pot */}
                <div className='pot-div'>
                  <Autocomplete
                    className='pot-autocomplete'
                    disablePortal
                    id="select-entries-by-pot-autocomplete-box"
                    value={entriesPotSelection}
                    options={entriesPotOptions}
                    renderInput={(params) => <TextField {...params} label="Select Pot" />}
                    onChange={handleEntriesPotSelection}
                    sx={{ width: '400px' }}  
                  />
                </div>
                <br/>        

                {/* Display summary */}
                {entriesPotSelection && (
                  <>
                    {potEntryData ? (
                      (() => {
                        let selectedPotTeams = [];
                        let grossTotal = 0;
                        let tournamentCut = 1;  // Default cut in case it's not found.
                        let potAmount = 0;    // Default in case not found

                        // Find the tournamentCut from CONFIG_POTS_BOARD_LIST based on the selected pot.
                        config?.potsConfig?.CONFIG_POTS_BOARD_LIST.forEach(boardObj => {
                          Object.values(boardObj).forEach(potArray => {
                            potArray.forEach(pot => {
                              if (pot.title === entriesPotSelection) {
                                tournamentCut = pot.tournamentCut;
                                potAmount = pot.amount;
                              }
                            });
                          });
                        });

                        // Collect teams and calculate totals
                        potEntryData.forEach(entry => {
                          entry.boardSelections.forEach(boardSelection => {
                            if (boardSelection.potList.includes(entriesPotSelection)) {
                              selectedPotTeams.push(entry.teamName);
                              grossTotal += potAmount;
                            }
                          });
                        });

                        const netTotal = grossTotal * (1 - tournamentCut);

                        // Sort the teams alphabetically
                        selectedPotTeams = selectedPotTeams.sort();

                        return (
                          <div>
                            <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}><strong>Pot Name:</strong> {entriesPotSelection}</p>
                            <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}><strong>Total Payout:</strong> {formatCurrency(netTotal)}</p>
                            <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}><strong>Teams Entered ({selectedPotTeams.length})</strong></p>
                            <ul>
                              {selectedPotTeams.map((team, index) => (
                                <p key={index} style={{ fontSize: '18px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>{team}</p>
                              ))}
                            </ul>
                          </div>
                        );
                      })()
                    ) : (
                      <p style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>No entries found for this pot.</p>
                    )}
                  </>
                )}

              </>        
            }

            {/* ENTRIES - BY TEAM */}
            { ( (displaySelection === "Entries") && (entriesViewSelection === "By Team") ) &&
              <>
                <br/>

                {/* Select team */}
                {!teamNameListIsLoaded ? (
                    <CircularProgress/>
                  ) : (
                    <div className='pot-div'>
                      <Autocomplete
                        className='pot-autocomplete'
                        disablePortal
                        id="select-entries-by-team-autocomplete-box"
                        value={entriesTeamSelection}
                        options={registeredTeamNameList}
                        renderInput={(params) => <TextField {...params} label="Select Team" />}
                        onChange={handleEntriesTeamSelection}
                        sx={{ width: '400px' }}  
                      />
                    </div>
                  )
                }       
                <br/>       

                {/* Display summary */}
                {entriesTeamSelection && (
                  <>
                    {/* Team Name */}
                    <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}><strong>Team Name:</strong> {entriesTeamSelection}</p>

                    {potEntryData ? (
                      potEntryData
                        .filter(entry => entry.teamName === entriesTeamSelection)
                        .map((entry, index) => {
                          // Collect all pot names from different boards into a single list
                          let potsEntered = [];
                          entry.boardSelections.forEach(boardSelection => {
                            potsEntered = potsEntered.concat(boardSelection.potList);
                          });

                          // Sort the pot names alphabetically
                          potsEntered = potsEntered.sort();

                          // Total Pot Fee for the team
                          const totalPotFee = entry.totalPotFee;

                          return (
                            <div key={index}>
                              {/* Total Pot Fee */}
                              <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}>
                                <strong>Total Wagered:</strong> {formatCurrency(totalPotFee)}
                              </p>

                              {/* Pots Entered */}
                              <p style={{ fontSize: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}>
                                <strong>Pots Entered ({potsEntered.length}):</strong>
                              </p>

                              <ul>
                                {potsEntered.map((pot, potIndex) => (
                                  <p key={potIndex} style={{ fontSize: '18px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}>{pot}</p>
                                ))}
                              </ul>
                            </div>
                          );
                        })
                    ) : (
                      <p style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>No entries found for this team.</p>
                    )}
                  </>
                )}
                
              </>
            }

            {/* PAYOUTS - BY POT */}
            { (displaySelection === "Payouts") && (payoutsViewSelection === "By Pot") && (payoutsDisplaySelection === "List") && tournamentHasStarted &&
              (!hasLoaded ? (
                <div>
                  <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Loading...</h1>
                  <CircularProgress />
                </div>
              ) : (
                <>
                  <br/>
                  {payoutsResultArray.map(result => {
                    if (result.rows.length > 0) {
                      return (
                        <PotsResultTable
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
                      );
                    }
                    return null;
                  })}
                </>
              ))
            }

            { ( (displaySelection === "Payouts") && (payoutsViewSelection === "By Pot") && (payoutsDisplaySelection === "Slideshow") && (tournamentHasStarted) ) &&
              (!hasLoaded ? (
                <div>
                  <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Loading...</h1>
                  <CircularProgress />
                </div>
              ) : (
                <div>
                  <br/>
                  <PotCarousel results={payoutsResultArray} />
                </div>
              ))
            }

            { ( (displaySelection === "Payouts") && (payoutsViewSelection === "By Pot") && (payoutsDisplaySelection === "Select") && (tournamentHasStarted) ) &&
              (!hasLoaded ? (
                <div>
                  <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Loading...</h1>
                  <CircularProgress />
                </div>
                ) : (
                  <div>
                    <br/>
                    <div className="select-div">
                      <Select
                        labelId="select-category"
                        id="select-category"
                        value={payoutsSelectedResult[0]?.title || ''}
                        onChange={handlePayoutsSelectResult}
                      >
                        {config?.potsConfig?.CONFIG_POTS_CATEGORIES.map((category) => (
                          <MenuItem key={category.title} value={category.title}>
                            {category.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>

                    { payoutsHasSelectedResult ? (
                      <div>
                        {payoutsSelectedResult.map(result => (
                          result.rows.length > 0 ? (
                            <PotsResultTable
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
                            <h1 key={result.title} style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>No results yet.</h1>
                          )
                        ))}
                      </div>
                    ) : (
                      <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Please select a category</h1>
                    )}
                  </div>
                )
              )
            }

            {/* PAYOUTS - BY TEAM */}
            { ( (displaySelection === "Payouts") && (payoutsViewSelection === "By Team") && (payoutsDisplaySelection === "List") && (tournamentHasStarted) ) &&
            (!hasLoaded ? (
              <div>
                <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Loading...</h1>
                <CircularProgress />
              </div>
            ) : (
              <>
                <br/>
                <PotsResultTable
                  style={{ width: '100%' }}
                  title="Team Payout Summary"
                  rows={payoutsTeamResultSummary.map((team, index) => ({ ...team, id: index }))}
                  columns={matches ? config?.potsConfig?.CONFIG_POTS_TEAM_SUMMARY_DESKTOP_COLUMN_DEFINITIONS : config?.potsConfig?.CONFIG_POTS_TEAM_SUMMARY_MOBILE_COLUMN_DEFINITIONS}
                  scroll={matches ? null : "scroll"}
                  density="compact"
                />
              </>
            ))}

            { ( (displaySelection === "Payouts") && (payoutsViewSelection === "By Team") && (payoutsDisplaySelection === "Select") && (tournamentHasStarted) ) &&
            (!hasLoaded ? (
              <div>
                <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Loading...</h1>
                <CircularProgress />
              </div>
              ) : (
                <>
                  <br/>

                  {/* Select team */}
                  {!teamNameListIsLoaded ? (
                      <CircularProgress/>
                    ) : (
                      <div className='pot-div'>
                        <Autocomplete
                          className='pot-autocomplete'
                          disablePortal
                          id="select-payouts-by-team-autocomplete-box"
                          value={payoutsTeamSelection}
                          options={registeredTeamNameList}
                          renderInput={(params) => <TextField {...params} label="Select Team" />}
                          onChange={handlePayoutsTeamSelection}
                          sx={{ width: '400px' }}  
                        />
                      </div>
                    )
                  }       
                  <br/>  

                  {!payoutsTeamSelection && (
                    <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Please select a team</h1>
                  )}

                  {payoutsTeamSelection && (
                    <>
                      {payoutsTeamResultObject[payoutsTeamSelection] && payoutsTeamResultObject[payoutsTeamSelection].length > 0 ? (
                        <PotsResultTable
                          style={{ width: '100%' }}
                          title={`${payoutsTeamSelection} Payout: ${formatCurrency(payoutsTeamResultObject[payoutsTeamSelection].reduce((sum, result) => sum + result.payout, 0))}`}
                          rows={payoutsTeamResultObject[payoutsTeamSelection].map((result, index) => ({
                            ...result,
                            id: index,
                            place: formatPlace(result.place)  // Format the place value
                          }))}
                          columns={matches ? config?.potsConfig?.CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_DESKTOP_COLUMN_DEFINITIONS : config?.potsConfig?.CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_MOBILE_COLUMN_DEFINITIONS}
                          scroll={matches ? null : "scroll"}
                          density="compact"
                        />
                      ) : (
                        <h1 style={{color: config?.potsConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>{payoutsTeamSelection} has no payouts.</h1>
                      )}
                    </>
                  )}
                </>
              )
            )}

            {(displaySelection === "Payouts") && (payoutsViewSelection === "By Team") && (payoutsDisplaySelection === "Slideshow") && (tournamentHasStarted) && 
            (!hasLoaded ? (
              <div>
                <h1 style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR}}>Loading...</h1>
                <CircularProgress />
              </div>
            ) : (
              <>
                <br/>
                <PotCarousel
                    results={Object.keys(payoutsTeamResultObject).map((teamName) => ({
                    desktopColumns: config?.potsConfig?.CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_DESKTOP_COLUMN_DEFINITIONS,
                    mobileColumns: config?.potsConfig?.CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_MOBILE_COLUMN_DEFINITIONS,
                    title: `${teamName} Payout: ${formatCurrency(
                      payoutsTeamResultObject[teamName]?.reduce((sum, result) => sum + result.payout, 0) || 0
                    )}`,
                    rows: (payoutsTeamResultObject[teamName] || []).map((result, index) => ({
                      ...result,
                      id: index,
                      place: formatPlace(result.place)  // Format the place value
                    })),
                  }))}
                />
              </>
            ))}

          </Box>
        </section>
        <Footer/>
      </main>
    </AnimatedPage>
  );
}

export default PotsPage;

