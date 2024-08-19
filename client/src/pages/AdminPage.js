import React, {useState, useEffect} from 'react';
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
import CrudTable from '../components/CrudTable';
import Footer from '../components/Footer';
import Login from '../components/Login';

import { 
  CONFIG_GENERAL_YEAR,    // general
  CONFIG_ADMIN_DEFAULT_TAB_NAME,
  CONFIG_ADMIN_DEFAULT_TAB_NAME_LIST,
  CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING,
  CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING,

  CONFIG_FIREBASE_TEAMS_TABLE_NAME,   // teams
  CONFIG_FIREBASE_TEAMS_ID_NAME,    
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS,

  CONFIG_FIREBASE_CATCHES_TABLE_NAME,    // catches
  CONFIG_FIREBASE_CATCHES_ID_NAME,
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_CATCHES,

  CONFIG_FIREBASE_POTS_TABLE_NAME,    // pots
  CONFIG_FIREBASE_POTS_ID_NAME,
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_POTS,

  CONFIG_FIREBASE_AUCTION_TABLE_NAME,    // auctions
  CONFIG_FIREBASE_AUCTION_ID_NAME,
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_AUCTIONS,
} from '../config';

import "./RegisterPage.css";

function AdminPage() {   

  // STATE - GENERAL
  const theme = useTheme();    // device size
  const matches = useMediaQuery(theme.breakpoints.up("md"));  
  const currentUser = JSON.parse(window.localStorage.getItem('user'));    // login status
  const [tab, setTab] = useState(window.localStorage.getItem('selectedTab') || (CONFIG_ADMIN_DEFAULT_TAB_NAME)); 
  const [apiUrl, setApiUrl] = useState();

  // STATE - TABS
  const today = new Date();
  const [rows, setRows] = useState([]);
  const [rowsHaveLoaded, setRowsHaveLoaded] = useState(false);
  const desktopScroll = null;
  const mobileScroll = 'scroll';
  const [style, setStyle] = useState();
  const [initialState, setInitialState] = useState();
  const [pageSizeOptions, setPageSizeOptions] = useState();

  // STATE - MODALS
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState();
  const [editInfo, setEditInfo] = useState();
  const openAddModal = () => {setIsAddModalOpen(true)};
  const closeAddModal = () => {setIsAddModalOpen(false)};
  const openEditModal = () => {setIsEditModalOpen(true)};
  const closeEditModal = () => {setIsEditModalOpen(false)};
  const openDeleteModal = () => {setIsDeleteModalOpen(true)};
  const closeDeleteModal = () => {setIsDeleteModalOpen(false)};

  // INITIALIZE
  useEffect(() => {
    const initialTab = window.localStorage.getItem('selectedTab') || CONFIG_ADMIN_DEFAULT_TAB_NAME;
    fetchData(initialTab);
  }, []);  

  const fetchData = async (tab) => {

    try {

      // Environment
      let initialApiUrl = null; 
      if (process.env.REACT_APP_NODE_ENV === "staging") {
        initialApiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
      } else if (process.env.REACT_APP_NODE_ENV === "production") {
        initialApiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
      }
  
      // Tab settings
      let tableName;
      let idName;
      let tableProperties;
      switch (tab) {   
        case 'Teams':
          tableName = CONFIG_FIREBASE_TEAMS_TABLE_NAME;
          idName = CONFIG_FIREBASE_TEAMS_ID_NAME;
          tableProperties = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS;
          break;
        case 'Catches':
          tableName = CONFIG_FIREBASE_CATCHES_TABLE_NAME;
          idName = CONFIG_FIREBASE_CATCHES_ID_NAME;
          tableProperties = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_CATCHES;
          break;
        case 'Pots':
          tableName = CONFIG_FIREBASE_POTS_TABLE_NAME;
          idName = CONFIG_FIREBASE_POTS_ID_NAME;
          tableProperties = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_POTS;
          break;
        case 'Auction':
          tableName = CONFIG_FIREBASE_AUCTION_TABLE_NAME;
          idName = CONFIG_FIREBASE_AUCTION_ID_NAME;
          tableProperties = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_AUCTIONS;
          break;
        default:    // handles "Stats" and "Reports" tab cases
          break;
      }
      let tempRows = [];

      // Fetch
      if (tab != "Stats" && tab != "Reports") {
        const res = await fetch(`${initialApiUrl}/api/admin_get_database_list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: tableName })
        });
        await res.json().then(result => {
          Object.keys(result).forEach((elementKey, i) => {
            let tempObject = { ...result[elementKey] };
            tempObject["id"] = i;
            tempObject[idName] = elementKey;
            tempRows.push(tempObject);
          });
        });
      }
      
      // Tab state
      setApiUrl(initialApiUrl);
      setRows(tempRows);
      setRowsHaveLoaded(true);
      setStyle({ height: 400, width: '100%' });
      setInitialState({ pagination: { paginationModel: { page: 0, pageSize: 5 } } });
      setPageSizeOptions([5, 10, 25, 100]);
  
      // Modal state
      setIsAddModalOpen(false);   
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
  
    } catch (error) {
      console.log('There was an error loading the server data for the default tab on the admin page: ' + error);
    }
  } 
  
  // HELPERS
  const handleTabChange = (event, newTab) => {
    setTab(newTab);
    window.localStorage.setItem('selectedTab', newTab); // Save the selected tab to local storage
    fetchData(newTab);
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

  return (
    <AnimatedPage>
      <main>
        <section className="section-banner">
          <h1>Admin</h1>
        </section>

        <section className="section-logout">
          {(!(currentUser === undefined) && !(currentUser === null)) && 
            <Box sx={{ width: '90%', typography: 'body1' }}>
              <p>{`You are currently logged in as: ${currentUser.email}`}</p>
              <br/>

              <Button onClick={handleLogout} color="primary" variant="contained" fullwidth >Logout</Button>  
              <br/>
              <br/>

              <TabContext value={tab}>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList variant="scrollable" onChange={handleTabChange} aria-label="lab API tabs example">
                    <Tab key={tabName} label={tabName} value={tabName} />
                  </TabList>
                </Box>

                {CONFIG_ADMIN_DEFAULT_TAB_NAME_LIST.map((tabName) => {

                  if (tabName === "Stats") {
                    <TabPanel value="Reports">
                      <div>
                        <h2>FIXME: stats go here</h2>
                      </div>
                    </TabPanel>
                  } else if (tabName === "Reports") {
                    <TabPanel value="Reports">
                      <div>
                        <h2>FIXME: reports go here</h2>
                      </div>
                    </TabPanel>
                  } else {
                    <TabPanel key={tabName} value={tabName}>
                      {(!rowsHaveLoaded) ? (
                        <CircularProgress />
                      ) : (
                        <div style={style}>
                          <CrudTable

                            // dates
                            today={today}
                            startDate={CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING}
                            endDate={CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING}

                            // table styling                            
                            tableType={tabName}
                            buttonLabel={`Add ${tabName} Entry`}
                            tableProperties={tableProperties}
                            style={style}
                            rows={rows || []}
                            scroll={matches ? (desktopScroll) : (mobileScroll)}
                            initialState={initialState}
                            pageSizeOptions={pageSizeOptions}
                            checkboxSelection={true}

                            // add
                            addStatus={isAddModalOpen}
                            openAddModal={openAddModal}
                            closeAddModal={closeAddModal}

                            // edit
                            editStatus={isEditModalOpen}
                            editInfo={editInfo}
                            setEditInfo={setEditInfo}
                            openEditModal={openEditModal}
                            closeEditModal={closeEditModal}
                            
                            // delete
                            deleteStatus={isDeleteModalOpen}
                            deleteInfo={deleteInfo}
                            setDeleteInfo={setDeleteInfo}
                            openDeleteModal={openDeleteModal}
                            closeDeleteModal={closeDeleteModal}

                          />
                        </div>
                      )}
                    </TabPanel>
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

