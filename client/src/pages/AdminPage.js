import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {auth} from "../firebase";
import {signOut, signInWithEmailAndPassword} from "firebase/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CircularProgress from '@mui/material/CircularProgress';

import AnimatedPage from './AnimatedPage';
import CrudTable from '../components/tables/CrudTable';
import Footer from '../components/Footer';
import Login from '../components/Login';
import { fetchAndGenerateRegistrationReport } from '../generators/registrationReports';
import { fetchAndGenerateCatchesReport } from '../generators/catchesReports';
import { generateLeaderboardReport } from '../generators/leaderboardReports';
import { generatePotsReport } from '../generators/potReports';
import { generateAwardsReport } from '../generators/awardReports';
import "./RegisterPage.css";
import { loadConfigForYear } from '../config/masterConfig';

function AdminPage() {   

  // STATE - GENERAL
  const { year } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();    // device size
  const matches = useMediaQuery(theme.breakpoints.up("md"));  
  const isMobile = !matches; // Detect if the user is on mobile
  const currentUser = JSON.parse(window.localStorage.getItem('user'));    // login status
  const [tabName, setTabName] = useState(window.localStorage.getItem('selectedTab') || "Catches"); 
  const [tableProperties, setTableProperties] = useState([])
  const [apiUrl, setApiUrl] = useState();
  const today = new Date();
  const desktopScroll = null;
  const mobileScroll = 'scroll';
  const [style, setStyle] = useState();
  const [initialState, setInitialState] = useState();
  const [pageSizeOptions, setPageSizeOptions] = useState();

  // STATE - TEAMS
  const [teamRows, setTeamRows] = useState([]);
  const [teamRowsHaveLoaded, setTeamRowsHaveLoaded] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [deleteTeamInfo, setDeleteTeamInfo] = useState();
  const [editTeamInfo, setEditTeamInfo] = useState();
  const [registrationStats, setRegistrationStats] = useState({
    totalTeams: 0,
    checkedInTeams: 0,
    totalFees: 0,
    totalRegistrationFees: 0,
    totalAddOnFees: 0
  });
  const openAddTeamModal = () => {setIsAddTeamModalOpen(true)};
  const closeAddTeamModal = () => {setIsAddTeamModalOpen(false)};
  const openEditTeamModal = () => {setIsEditTeamModalOpen(true)};
  const closeEditTeamModal = () => {setIsEditTeamModalOpen(false)};
  const openDeleteTeamModal = () => {setIsDeleteTeamModalOpen(true)};
  const closeDeleteTeamModal = () => {setIsDeleteTeamModalOpen(false)};

  // STATE - CATCHES
  const [catchRows, setCatchRows] = useState([]);
  const [catchRowsHaveLoaded, setCatchRowsHaveLoaded] = useState(false);
  const [isAddCatchModalOpen, setIsAddCatchModalOpen] = useState(false);
  const [isDeleteCatchModalOpen, setIsDeleteCatchModalOpen] = useState(false);
  const [isEditCatchModalOpen, setIsEditCatchModalOpen] = useState(false);
  const [deleteCatchInfo, setDeleteCatchInfo] = useState();
  const [editCatchInfo, setEditCatchInfo] = useState();
  const [catchesStats, setCatchesStats] = useState({
    totalFish: 0,
  });
  const openAddCatchModal = () => {setIsAddCatchModalOpen(true)};
  const closeAddCatchModal = () => {setIsAddCatchModalOpen(false)};
  const openEditCatchModal = () => {setIsEditCatchModalOpen(true)};
  const closeEditCatchModal = () => {setIsEditCatchModalOpen(false)};
  const openDeleteCatchModal = () => {setIsDeleteCatchModalOpen(true)};
  const closeDeleteCatchModal = () => {setIsDeleteCatchModalOpen(false)};

  // STATE - ANNOUNCEMENTS
  const [announcementRows, setAnnouncementRows] = useState([]);
  const [announcementRowsHaveLoaded, setAnnouncementRowsHaveLoaded] = useState(false);
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] = useState(false);
  const [isDeleteAnnouncementModalOpen, setIsDeleteAnnouncementModalOpen] = useState(false);
  const [isEditAnnouncementModalOpen, setIsEditAnnouncementModalOpen] = useState(false);
  const [deleteAnnouncementInfo, setDeleteAnnouncementInfo] = useState();
  const [editAnnouncementInfo, setEditAnnouncementInfo] = useState();
  const openAddAnnouncementModal = () => {setIsAddAnnouncementModalOpen(true)};
  const closeAddAnnouncementModal = () => {setIsAddAnnouncementModalOpen(false)};
  const openEditAnnouncementModal = () => {setIsEditAnnouncementModalOpen(true)};
  const closeEditAnnouncementModal = () => {setIsEditAnnouncementModalOpen(false)};
  const openDeleteAnnouncementModal = () => {setIsDeleteAnnouncementModalOpen(true)};
  const closeDeleteAnnouncementModal = () => {setIsDeleteAnnouncementModalOpen(false)};

  // STATE - POTS
  const [potRows, setPotRows] = useState([]);
  const [potRowsHaveLoaded, setPotRowsHaveLoaded] = useState(false);
  const [isAddPotModalOpen, setIsAddPotModalOpen] = useState(false);
  const [isDeletePotModalOpen, setIsDeletePotModalOpen] = useState(false);
  const [isEditPotModalOpen, setIsEditPotModalOpen] = useState(false);
  const [deletePotInfo, setDeletePotInfo] = useState();
  const [editPotInfo, setEditPotInfo] = useState();
  const [potStats, setPotStats] = useState({
    totalPotSize: 0,
    boardTotals: {},
  });
  const openAddPotModal = () => {setIsAddPotModalOpen(true)};
  const closeAddPotModal = () => {setIsAddPotModalOpen(false)};
  const openEditPotModal = () => {setIsEditPotModalOpen(true)};
  const closeEditPotModal = () => {setIsEditPotModalOpen(false)};
  const openDeletePotModal = () => {setIsDeletePotModalOpen(true)};
  const closeDeletePotModal = () => {setIsDeletePotModalOpen(false)};

  // STATE - AUCTION
  // FIXME

  // REPORTS
  const [isRegistrationReportLoading, setIsRegistrationReportLoading] = useState(false);
  const [isCatchesSpeciesReportLoading, setIsCatchesSpeciesReportLoading] = useState(false);
  const [isCatchesTeamReportLoading, setIsCatchesTeamReportLoading] = useState(false);
  const [isLeaderboardReportLoading, setIsLeaderboardReportLoading] = useState(false);
  const [isPotsReportLoading, setIsPotsReportLoading] = useState(false);
  const [isAwardsReportLoading, setIsAwardsReportLoading] = useState(false);

  // INITIALIZE
  useEffect(() => {
    const selectedTab = tabName || "Catches";  // Ensure fallback to the default tab
    fetchConfigAndData(tabName); // Load config and fetch data
  }, [year, tabName]);  // add tabName as a dependency to re-fetch when the tab changes

  const fetchConfigAndData = async (tab) => {

    setLoading(true);

    try {
      const loadedConfig = await loadConfigForYear(year); // Load the config dynamically
      setConfig(loadedConfig); // Set the loaded configuration

      const {
        generalConfig: {
          CONFIG_GENERAL_TOURNAMENT_NAME,
          CONFIG_GENERAL_YEAR,    
          CONFIG_GENERAL_HAS_REGISTRATION,
          CONFIG_GENERAL_HAS_NEWSFEED,
          CONFIG_GENERAL_HAS_POTS,
          CONFIG_GENERAL_HAS_AUCTION,
          CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,   // firebase properties
          CONFIG_GENERAL_FIREBASE_TEAMS_ID_NAME,   
          CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,  
          CONFIG_GENERAL_FIREBASE_CATCHES_ID_NAME,
          CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME,  
          CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_ID_NAME,
          CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,  
          CONFIG_GENERAL_FIREBASE_POTS_ID_NAME,
          CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME,    
          CONFIG_GENERAL_FIREBASE_AUCTION_ID_NAME,
          CONFIG_GENERAL_HAS_LEADERBOARD,
        },
        stylingConfig: {
          CONFIG_STYLING_BANNER_BACKGROUND_COLOR,
          CONFIG_STYLING_BANNER_TEXT_COLOR,
          CONFIG_STYLING_LOGIN_TEXT_COLOR,
          CONFIG_STYLING_STATS_TEXT_COLOR,
        },
        adminConfig: {
          CONFIG_ADMIN_DEFAULT_TAB_NAME,
          CONFIG_ADMIN_DEFAULT_TAB_NAME_LIST,
          CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING,
          CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING,
          CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS,    // display properties
          CONFIG_ADMIN_TABLE_PROPERTIES_FOR_CATCHES,
          CONFIG_ADMIN_TABLE_PROPERTIES_FOR_ANNOUNCEMENTS,
          CONFIG_ADMIN_TABLE_PROPERTIES_FOR_POTS,
          CONFIG_ADMIN_TABLE_PROPERTIES_FOR_AUCTIONS,
        },
        catchConfig: {
          CONFIG_CATCHES_STATS_LIST, 
          CONFIG_CATCHES_SPECIES_LIST,
        },
        potsConfig: {
          CONFIG_POTS_BOARD_LIST,
        },
      } = loadedConfig;

      const apiUrl = process.env.REACT_APP_NODE_ENV === 'production'
        ? process.env.REACT_APP_SERVER_URL_PRODUCTION
        : process.env.REACT_APP_SERVER_URL_STAGING;

      // Clear all row data
      setTeamRows([]);
      setTeamRowsHaveLoaded(false);
      setCatchRows([]);
      setCatchRowsHaveLoaded(false);
      setAnnouncementRows([]);
      setAnnouncementRowsHaveLoaded(false);
      setPotRows([]);
      setPotRowsHaveLoaded(false);
      // FIXME: auctions
  
      // Define tab settings
      let tableName;
      let idName;
      let tempTableProperties;
      switch (tab) {   
        case 'Teams':
          tableName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME;
          idName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_ID_NAME;
          tempTableProperties = loadedConfig.adminConfig.CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS;
          break;
        case 'Catches':
          tableName = CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME;
          idName = CONFIG_GENERAL_FIREBASE_CATCHES_ID_NAME;
          tempTableProperties = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_CATCHES;
          break;
        case 'Announcements':
          tableName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME;
          idName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_ID_NAME;
          tempTableProperties = loadedConfig.adminConfig.CONFIG_ADMIN_TABLE_PROPERTIES_FOR_ANNOUNCEMENTS;
          break;
        case 'Pots':
          tableName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME;
          idName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_POTS_ID_NAME;
          tempTableProperties = loadedConfig.adminConfig.CONFIG_ADMIN_TABLE_PROPERTIES_FOR_POTS;
          break;
        case 'Auction':
          tableName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME;
          idName = loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_AUCTION_ID_NAME;
          tempTableProperties = loadedConfig.adminConfig.CONFIG_ADMIN_TABLE_PROPERTIES_FOR_AUCTIONS;
          break;
        default:    // handles "Stats" and "Reports" tab cases
          break;
      }
      let tempRows = [];

      // Fetch tab data
      if (tab === "Stats") {
        try {

          // Registration
          if (loadedConfig.generalConfig.CONFIG_GENERAL_HAS_REGISTRATION) {
            const [totalTeamsRes, checkedInTeamsRes, totalFeesRes, totalRegistrationFeesRes, totalAddOnFeesRes] = await Promise.all([
              fetch(`${apiUrl}/api/${year}/registration_get_number_of_registered_teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamTableName: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
              }),
              fetch(`${apiUrl}/api/${year}/registration_get_number_of_checked_in_teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamTableName: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
              }),
              fetch(`${apiUrl}/api/${year}/registration_get_total_fees_collected`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamTableName: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
              }),
              fetch(`${apiUrl}/api/${year}/registration_get_total_registration_fees_collected`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamTableName: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
              }),
              fetch(`${apiUrl}/api/${year}/registration_get_total_add_on_fees_collected`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamTableName: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
              })
            ]);

            const totalTeams = await totalTeamsRes.json();
            const checkedInTeams = await checkedInTeamsRes.json();
            const totalFees = await totalFeesRes.json();
            const totalRegistrationFees = await totalRegistrationFeesRes.json();
            const totalAddOnFees = await totalAddOnFeesRes.json();
        
            // Update state with fetched data
            setRegistrationStats({
              totalTeams: totalTeams.totalTeams,
              checkedInTeams: checkedInTeams.checkedInTeams,
              totalFees: totalFees.totalFees,
              totalRegistrationFees: totalRegistrationFees.totalRegistrationFees,
              totalAddOnFees: totalAddOnFees.totalAddOnFees
            });
          }

          // Catches
          if (loadedConfig.generalConfig.CONFIG_GENERAL_HAS_NEWSFEED) {
            try {
              // Fetch total fish count as a promise
              const totalFishRes = fetch(`${apiUrl}/api/${year}/admin_get_total_catch_count`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ catchYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
              }).then(res => res.json());

              // Fetch fish count by species
              const speciesStatsPromises = loadedConfig.catchConfig.CONFIG_CATCHES_STATS_LIST.map((speciesType) => {
                return fetch(`${apiUrl}/api/${year}/admin_get_total_catch_count_by_species`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ catchYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME, speciesType })
                })
                .then(res => res.json())
                .then(data => ({ speciesType, count: data.speciesCount }));
              });

              // Wait for all promises to resolve
              const [totalFishData, ...speciesStats] = await Promise.all([totalFishRes, ...speciesStatsPromises]);

              // Parse the results
              const totalFishCount = totalFishData.totalFishCount;
              const speciesCountStats = speciesStats.reduce((acc, { speciesType, count }) => {
                acc[speciesType] = count;
                return acc;
              }, {});

              // Update the state
              setCatchesStats({
                totalFish: totalFishCount,
                speciesStats: speciesCountStats,
              });

            } catch (error) {
              console.error('Error fetching catches data:', error);
            }
          }         

          if (loadedConfig.generalConfig.CONFIG_GENERAL_HAS_POTS) {
            try {
              // Fetch total pot size data
              const boardNames = loadedConfig.potsConfig.CONFIG_POTS_BOARD_LIST.map(board => Object.keys(board)[0]);
              const potSizeRes = await fetch(`${apiUrl}/api/${year}/get_total_pot_size_data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ potYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME, boardNames })
              });
              const potSizeData = await potSizeRes.json();
          
              // Parse the results
              const boardTotals = potSizeData.boardTotals;
              const totalPotSize = potSizeData.totalPotSize;

              console.log("boardTotals", boardTotals)
          
              // Update the state
              setPotStats({
                totalPotSize,
                boardTotals,
              });
          
            } catch (error) {
              console.error('Error fetching pot data:', error);
            }
          }

        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      } else if (tab !== "Reports") {
        const res = await fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableName: tableName })
        });
        await res.json().then(result => {
          Object.keys(result).forEach((elementKey, i) => {
            let tempObject = { ...result[elementKey] };
            tempObject["id"] = i;
            tempObject[idName] = elementKey;
            tempRows.push(tempObject);
            console.log('List of fetched data for tab:');
            console.log(tempObject);
          });
        });
      }
      
      // Set general state
      setApiUrl(apiUrl);
      setTableProperties(tempTableProperties);
      setStyle({ height: 800, width: '100%' });
      setInitialState({ pagination: { paginationModel: { page: 0, pageSize: 10 } } });
      setPageSizeOptions([5, 10, 25, 100]);

      // Set specific tab state
      if (tab === 'Teams') {
        setTeamRows(tempRows);
        setTeamRowsHaveLoaded(true);
      } else if (tab === 'Catches') {
        setCatchRows(tempRows);
        setCatchRowsHaveLoaded(true);
      } else if (tab === 'Announcements') {
        setAnnouncementRows(tempRows);
        setAnnouncementRowsHaveLoaded(true);
      } else if (tab === 'Pots') {
        setPotRows(tempRows);
        setPotRowsHaveLoaded(true);
      } else if (tab === 'Auction') {
        // FIXME
      }
  
      // Set all modal states
      // Teams
      setIsAddTeamModalOpen(false);   
      setIsEditTeamModalOpen(false);
      setIsDeleteTeamModalOpen(false);

      // Catches
      setIsAddCatchModalOpen(false);   
      setIsEditCatchModalOpen(false);
      setIsDeleteCatchModalOpen(false);

      // Announcements
      setIsAddAnnouncementModalOpen(false);   
      setIsEditAnnouncementModalOpen(false);
      setIsDeleteAnnouncementModalOpen(false);

      // Pots FIXME
      setIsAddPotModalOpen(false);
      setIsEditPotModalOpen(false);
      setIsDeletePotModalOpen(false);

      // Auction FIXME
  
    } catch (error) {
      console.log('There was an error loading the server data for the default tab on the admin page: ' + error);
    } finally {
      setLoading(false);
    };
  } 
  
  // HELPERS
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleTabChange = (event, newTab) => {
    setTabName(newTab);
    window.localStorage.setItem('selectedTab', newTab); // Save the selected tab to local storage
    fetchConfigAndData(newTab);
  };

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  }

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  // AUTHENTICATION
  const handleLogin = (e, email, password) => {

    if (!validateEmail(email)) {
      toast.error("Please input a valid email.");
      return;
    }

    if (!password) {
      toast.error("Please input your password");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        toast.success("Login successful! Redirecting...");
        window.localStorage.setItem('user', JSON.stringify(userCredential.user));   
        delayRefresh();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error("Invalid login attempt. Please try again or contact the site administrator.")
      })

  }

  const handleLogout = (e) => {
    signOut(auth)
      .then(() => {
        window.localStorage.setItem('user', JSON.stringify(null));
        toast.success('Logout successful! Redirecting...');
        delayRefresh();        
      })
      .catch(error => {
        console.log(error);
        toast.error("There was an error while attempting to log you out. Please contact the site administrator.")
      })
  }

  // REPORT GENERATORS
  const handleGenerateRegistrationReport = async (year) => {
    setIsRegistrationReportLoading(true); // Set the loading state
    try {
      console.log('In handleGenerateRegistrationReport...');
      await fetchAndGenerateRegistrationReport(year, config?.generalConfig?.CONFIG_GENERAL_TOURNAMENT_NAME, config?.adminConfig?.CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS);
    } catch (error) {
      console.error("Error generating registration report:", error);
    } finally {
      setIsRegistrationReportLoading(false); // Reset the loading state after completion
    }
  };

  const handleGenerateCatchesReportSpecies = async (year) => {
    setIsCatchesSpeciesReportLoading(true);
    try {
      console.log('In handleGenerateCatchesReport (Species)...');
      await fetchAndGenerateCatchesReport(year, "Species", config?.generalConfig?.CONFIG_GENERAL_TOURNAMENT_NAME);
    } catch (error) {
      console.error("Error generating catches report (Species):", error);
    } finally {
      setIsCatchesSpeciesReportLoading(false);
    }
  };

  const handleGenerateCatchesReportTeams = async (year) => {
    setIsCatchesTeamReportLoading(true);
    try {
      console.log('In handleGenerateCatchesReport (Teams)...');
      await fetchAndGenerateCatchesReport(year, "Team", config?.generalConfig?.CONFIG_GENERAL_TOURNAMENT_NAME);
    } catch (error) {
      console.error("Error generating catches report (Teams):", error);
    } finally {
      setIsCatchesTeamReportLoading(false);
    }
  };

  const handleGenerateLeaderboardReport = async (year) => {
    setIsLeaderboardReportLoading(true);
    try {
      console.log('In handleGenerateLeaderboardReport...');
      await generateLeaderboardReport(year, config?.generalConfig?.CONFIG_GENERAL_TOURNAMENT_NAME);
    } catch (error) {
      console.error("Error generating leaderboard report:", error);
    } finally {
      setIsLeaderboardReportLoading(false);
    }
  };

  const handleGeneratePotsReport = async (year) => {
    setIsPotsReportLoading(true);
    try {
      console.log('In handleGeneratePotsReport...');
      await generatePotsReport(year, config?.generalConfig?.CONFIG_GENERAL_TOURNAMENT_NAME);
    } catch (error) {
      console.error("Error generating pots report:", error);
    } finally {
      setIsPotsReportLoading(false);
    }
  };

  const handleGenerateAwardsReport = async (year) => {
    setIsAwardsReportLoading(true);
    try {
      console.log('In handleGenerateAwardsReport...');
      await generateAwardsReport(year, config?.generalConfig?.CONFIG_GENERAL_TOURNAMENT_NAME);
    } catch (error) {
      console.error("Error generating awards report:", error);
    } finally {
      setIsAwardsReportLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <main>

        {/* BANNER */}
        <section style={{ backgroundColor: config?.stylingConfig?.CONFIG_STYLING_BANNER_BACKGROUND_COLOR }} className="section-banner">
          <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_BANNER_TEXT_COLOR }}>Settings</h1>
        </section>

        <section className="section-logout">
          {(!(currentUser === undefined) && !(currentUser === null)) && 
            <Box sx={{ width: '90%', typography: 'body1' }}>
              <p style={{color: config?.stylingConfig?.CONFIG_STYLING_LOGIN_TEXT_COLOR}}>{`You are currently logged in as: ${currentUser.email}`}</p>
              <br/>

              <Button onClick={handleLogout} color="primary" variant="contained" fullwidth >Logout</Button>  
              <br/>
              <br/>

              <TabContext value={tabName}>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList variant="scrollable" onChange={handleTabChange} aria-label="lab API tabs example">
                    {config?.adminConfig?.CONFIG_ADMIN_DEFAULT_TAB_NAME_LIST.map((tab) => (
                      <Tab key={tab} label={tab} value={tab} />
                    ))}
                  </TabList>
                </Box>

                {config?.adminConfig?.CONFIG_ADMIN_DEFAULT_TAB_NAME_LIST.map((tab) => {
                  if (tab === "Stats") {
                    return (
                      <TabPanel key="Stats" value="Stats">
                        <div>
                          { config?.generalConfig?.CONFIG_GENERAL_HAS_REGISTRATION && 
                            <div style={{color: config?.stylingConfig?.CONFIG_STYLING_STATS_TEXT_COLOR}}>
                              <h2>Registration</h2>
                              {isMobile ? (
                                <>
                                  <p><strong>Total Teams Registered:</strong></p>
                                  <p>{registrationStats.totalTeams} ({registrationStats.checkedInTeams} checked-in)</p>
                                  <p><strong>Total Fees Collected:</strong></p>
                                  <p>{formatCurrency(registrationStats.totalFees)}</p>
                                  <p>({formatCurrency(registrationStats.totalRegistrationFees)} registration)</p>
                                  <p>({formatCurrency(registrationStats.totalAddOnFees)} add-ons)</p>
                                </>
                              ) : (
                                <>
                                  <p><strong>Total Teams Registered:</strong> {registrationStats.totalTeams} ({registrationStats.checkedInTeams} checked-in)</p>
                                  <p><strong>Total Fees Collected:</strong> {formatCurrency(registrationStats.totalFees)} ({formatCurrency(registrationStats.totalRegistrationFees)} registration, {formatCurrency(registrationStats.totalAddOnFees)} add-ons)</p>
                                </>
                              )}
                              <br/>
                            </div>
                          }

                          {config?.generalConfig?.CONFIG_GENERAL_HAS_NEWSFEED &&
                            <div style={{color: config?.stylingConfig?.CONFIG_STYLING_STATS_TEXT_COLOR}}>
                              <h2>Catches</h2>
                              {console.log("Rendering catchesStats:", catchesStats)}
                              {isMobile ? (
                                <>
                                  <p><strong>Total Fish Caught:</strong></p>
                                  <p>{catchesStats.totalFish}</p>
                                  {catchesStats.speciesStats && Object.keys(catchesStats.speciesStats).map(speciesType => (
                                    <div key={speciesType}>
                                      <p>({catchesStats.speciesStats[speciesType]} {speciesType})</p>
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <>
                                  <p>
                                    <strong>Total Fish Caught:</strong> {catchesStats.totalFish}
                                    {catchesStats.speciesStats && (
                                      <> (
                                        {Object.keys(catchesStats.speciesStats).map((speciesType, index, array) => (
                                          <span key={speciesType}>
                                            {catchesStats.speciesStats[speciesType]} {speciesType}
                                            {index < array.length - 1 && ', '}
                                          </span>
                                        ))}
                                        )
                                      </>
                                    )}
                                  </p>
                                </>
                              )}
                              <br />
                            </div>
                          }

                          {config?.generalConfig?.CONFIG_GENERAL_HAS_POTS && (
                            <div style={{color: config?.stylingConfig?.CONFIG_STYLING_STATS_TEXT_COLOR}}>
                              <h2>Pots</h2>
                              {isMobile ? (
                                <>
                                  <p><strong>Total Gross Pot:</strong></p>
                                  <p>-----</p>
                                  <p>{formatCurrency(potStats.totalPotSize)}</p>
                                  {Object.keys(potStats.boardTotals).map(board => (
                                    <p key={board}><strong>{board} Board Total:</strong> {formatCurrency(potStats.boardTotals[board])}</p>
                                  ))}
                                </>
                              ) : (
                                <>
                                  <p><strong>Total Gross Pot:</strong> {formatCurrency(potStats.totalPotSize)}</p>
                                  <p>-----</p>
                                  {Object.keys(potStats.boardTotals).map(board => (
                                    <p key={board}><strong>{board} Board Total:</strong> {formatCurrency(potStats.boardTotals[board])}</p>
                                  ))}
                                </>
                              )}
                              <br />
                            </div>
                          )}

                        </div>
                      </TabPanel>
                    );
                  } else if (tab === "Reports") {
                    return (
                      <TabPanel key="Reports" value="Reports">
                        <div>
                          {config?.generalConfig?.CONFIG_GENERAL_HAS_REGISTRATION && (
                            <div>
                              <Button
                                onClick={() => handleGenerateRegistrationReport(config?.generalConfig?.CONFIG_GENERAL_YEAR)}
                                color="primary"
                                variant="contained"
                                disabled={isRegistrationReportLoading} // Disable while loading
                              >
                                {isRegistrationReportLoading ? "Processing..." : "Download Check-In Form"}
                              </Button>
                              <br /><br />
                            </div>
                          )}

                          {config?.generalConfig?.CONFIG_GENERAL_HAS_NEWSFEED && (
                            <div>
                              <Button
                                onClick={() => handleGenerateCatchesReportSpecies(config?.generalConfig?.CONFIG_GENERAL_YEAR)}
                                color="primary"
                                variant="contained"
                                disabled={isCatchesSpeciesReportLoading}
                              >
                                {isCatchesSpeciesReportLoading ? "Processing..." : "Download Catch Log (Species)"}
                              </Button>
                              <br /><br />
                              <Button
                                onClick={() => handleGenerateCatchesReportTeams(config?.generalConfig?.CONFIG_GENERAL_YEAR)}
                                color="primary"
                                variant="contained"
                                disabled={isCatchesTeamReportLoading}
                              >
                                {isCatchesTeamReportLoading ? "Processing..." : "Download Catch Log (Teams)"}
                              </Button>
                              <br /><br />
                            </div>
                          )}

                          {config?.generalConfig?.CONFIG_GENERAL_HAS_LEADERBOARD && (
                            <div>
                              <Button
                                onClick={() => handleGenerateLeaderboardReport(config?.generalConfig?.CONFIG_GENERAL_YEAR)}
                                color="primary"
                                variant="contained"
                                disabled={isLeaderboardReportLoading}
                              >
                                {isLeaderboardReportLoading ? "Processing..." : "Download Leaderboard"}
                              </Button>
                              <br /><br />
                            </div>
                          )}

                          {config?.generalConfig?.CONFIG_GENERAL_HAS_POTS && (
                            <div>
                              <Button
                                onClick={() => handleGeneratePotsReport(config?.generalConfig?.CONFIG_GENERAL_YEAR)}
                                color="primary"
                                variant="contained"
                                disabled={isPotsReportLoading}
                              >
                                {isPotsReportLoading ? "Processing..." : "Download Pot Standings"}
                              </Button>
                              <br /><br />
                            </div>
                          )}

                          {config?.generalConfig?.CONFIG_GENERAL_HAS_LEADERBOARD &&
                            config?.generalConfig?.CONFIG_GENERAL_HAS_POTS && (
                              <div>
                                <Button
                                  onClick={() => handleGenerateAwardsReport(config?.generalConfig?.CONFIG_GENERAL_YEAR)}
                                  color="primary"
                                  variant="contained"
                                  disabled={isAwardsReportLoading}
                                >
                                  {isAwardsReportLoading ? "Processing..." : "Download Awards"}
                                </Button>
                                <br /><br />
                              </div>
                            )}
                        </div>
                      </TabPanel>
                    );
                  } else if (tab === "Teams") {
                    return (
                      <TabPanel key={tab} value={tab}>
                        {!teamRowsHaveLoaded ? (
                          <CircularProgress />
                        ) : (
                          <div style={style}> 
                            <CrudTable
                              // dates
                              today={today}
                              startDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING}
                              endDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING}

                              // table styling
                              tableType={tab}
                              buttonLabel={`Add ${tab}`}
                              tableProperties={tableProperties}
                              style={style}
                              rows={teamRows || []}
                              scroll={matches ? desktopScroll : mobileScroll}
                              initialState={initialState}
                              pageSizeOptions={pageSizeOptions}
                              checkboxSelection={true}

                              // add
                              addStatus={isAddTeamModalOpen}
                              openAddModal={openAddTeamModal}
                              closeAddModal={closeAddTeamModal}

                              // edit
                              editStatus={isEditTeamModalOpen}
                              editInfo={editTeamInfo}
                              setEditInfo={setEditTeamInfo}
                              openEditModal={openEditTeamModal}
                              closeEditModal={closeEditTeamModal}

                              // delete
                              deleteStatus={isDeleteTeamModalOpen}
                              deleteInfo={deleteTeamInfo}
                              setDeleteInfo={setDeleteTeamInfo}
                              openDeleteModal={openDeleteTeamModal}
                              closeDeleteModal={closeDeleteTeamModal}
                            />
                          </div>
                        )}
                      </TabPanel>
                    );
                  } else if (tab === "Catches") {
                    return (
                      <TabPanel key={tab} value={tab}>
                        {!catchRowsHaveLoaded ? (
                          <CircularProgress />
                        ) : (
                          <div style={style}> 
                            <CrudTable
                              // dates
                              today={today}
                              startDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING}
                              endDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING}

                              // table styling
                              tableType={tab}
                              buttonLabel={`Add ${tab}`}
                              tableProperties={tableProperties}
                              style={style}
                              rows={catchRows || []}
                              scroll={matches ? desktopScroll : mobileScroll}
                              initialState={initialState}
                              pageSizeOptions={pageSizeOptions}
                              checkboxSelection={true}

                              // add
                              addStatus={isAddCatchModalOpen}
                              openAddModal={openAddCatchModal}
                              closeAddModal={closeAddCatchModal}

                              // edit
                              editStatus={isEditCatchModalOpen}
                              editInfo={editCatchInfo}
                              setEditInfo={setEditCatchInfo}
                              openEditModal={openEditCatchModal}
                              closeEditModal={closeEditCatchModal}

                              // delete
                              deleteStatus={isDeleteCatchModalOpen}
                              deleteInfo={deleteCatchInfo}
                              setDeleteInfo={setDeleteCatchInfo}
                              openDeleteModal={openDeleteCatchModal}
                              closeDeleteModal={closeDeleteCatchModal}
                            />
                          </div>
                        )}
                      </TabPanel>
                    );
                  } else if (tab === "Announcements") {
                    return (
                      <TabPanel key={tab} value={tab}>
                        {!announcementRowsHaveLoaded ? (
                          <CircularProgress />
                        ) : (
                          <div style={style}> 
                            <CrudTable
                              // dates
                              today={today}
                              startDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING}
                              endDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING}

                              // table styling
                              tableType={tab}
                              buttonLabel={`Add ${tab}`}
                              tableProperties={tableProperties}
                              style={style}
                              rows={announcementRows || []}
                              scroll={matches ? desktopScroll : mobileScroll}
                              initialState={initialState}
                              pageSizeOptions={pageSizeOptions}
                              checkboxSelection={true}

                              // add
                              addStatus={isAddAnnouncementModalOpen}
                              openAddModal={openAddAnnouncementModal}
                              closeAddModal={closeAddAnnouncementModal}

                              // edit
                              editStatus={isEditAnnouncementModalOpen}
                              editInfo={editAnnouncementInfo}
                              setEditInfo={setEditAnnouncementInfo}
                              openEditModal={openEditAnnouncementModal}
                              closeEditModal={closeEditAnnouncementModal}

                              // delete
                              deleteStatus={isDeleteAnnouncementModalOpen}
                              deleteInfo={deleteAnnouncementInfo}
                              setDeleteInfo={setDeleteAnnouncementInfo}
                              openDeleteModal={openDeleteAnnouncementModal}
                              closeDeleteModal={closeDeleteAnnouncementModal}
                            />
                          </div>
                        )}
                      </TabPanel>
                    );
                  } else if (tab === "Pots") {
                    return (
                      <TabPanel key={tab} value={tab}>
                        {!potRowsHaveLoaded ? (
                          <CircularProgress />
                        ) : (
                          <div style={style}> 
                            <CrudTable
                              // dates
                              today={today}
                              startDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING}
                              endDate={config?.adminConfig?.CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING}

                              // table styling
                              tableType={tab}
                              buttonLabel={`Add ${tab}`}
                              tableProperties={tableProperties}
                              style={style}
                              rows={potRows || []}
                              scroll={matches ? desktopScroll : mobileScroll}
                              initialState={initialState}
                              pageSizeOptions={pageSizeOptions}
                              checkboxSelection={true}

                              // add
                              addStatus={isAddPotModalOpen}
                              openAddModal={openAddPotModal}
                              closeAddModal={closeAddPotModal}

                              // edit
                              editStatus={isEditPotModalOpen}
                              editInfo={editPotInfo}
                              setEditInfo={setEditPotInfo}
                              openEditModal={openEditPotModal}
                              closeEditModal={closeEditPotModal}

                              // delete
                              deleteStatus={isDeletePotModalOpen}
                              deleteInfo={deletePotInfo}
                              setDeleteInfo={setDeletePotInfo}
                              openDeleteModal={openDeletePotModal}
                              closeDeleteModal={closeDeletePotModal}
                            />
                          </div>
                        )}
                      </TabPanel>
                    );
                  }

                })}

              </TabContext>

            </Box> 
          }
          {(currentUser === undefined || currentUser === null) && <Login handleLogin={handleLogin} handleLogout={handleLogout} />}     
        </section>

        <Footer/>
      </main>
    </AnimatedPage>
  );
}

export default AdminPage;

