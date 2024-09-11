import React, { useState, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { MenuItem, FormControl, InputLabel, Select, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from 'dayjs'; // Import dayjs for date formatting
import advancedFormat from 'dayjs/plugin/advancedFormat'; // For 'Do' format (like 1st, 2nd, etc.)

import CountTable from '../components/tables/CountTable';

import './BasePage.css';

import {
  CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME,
} from '../config/generalConfig';

import {
  CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE,
  CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE,
  CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE,
  CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE,
  CONFIG_NEWSFEED_INCLUDE_NEWSFEED_TABLE,
} from '../config/newsfeedConfig';

dayjs.extend(advancedFormat);

function NewsfeedPage() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md")); // Detects mobile screen size
  const [loading, setLoading] = useState(true);
  const [countType, setCountType] = useState("By Species");
  const [eventType, setEventType] = useState("Show All Events");
  
  // States for the different tables
  const [typeCountData, setTypeCountData] = useState([]);
  const [speciesCountData, setSpeciesCountData] = useState([]);
  const [teamCountData, setTeamCountData] = useState([]);
  const [dateCountData, setDateCountData] = useState([]);
  const [newsfeedData, setNewsfeedData] = useState([]);
  const [filteredNewsfeedData, setFilteredNewsfeedData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterNewsfeedData();
  }, [eventType, newsfeedData]);  

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_NODE_ENV === 'production'
        ? process.env.REACT_APP_SERVER_URL_PRODUCTION
        : process.env.REACT_APP_SERVER_URL_STAGING;

      // Fetch Type Count Table Data
      if (CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE) {
        const typeResponse = await fetch(`${apiUrl}/api/get_type_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const typeData = await typeResponse.json();
        const typeDataWithIds = typeData.map((row, index) => ({ id: index, ...row }));
        setTypeCountData(typeDataWithIds);
      }

      // Fetch Species Count Table Data
      if (CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE) {
        const speciesResponse = await fetch(`${apiUrl}/api/get_species_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const speciesData = await speciesResponse.json();
        const speciesDataWithIds = speciesData.map((row, index) => ({ id: index, ...row }));
        setSpeciesCountData(speciesDataWithIds);
      }

      // Fetch Team Count Table Data
      if (CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE) {
        const teamResponse = await fetch(`${apiUrl}/api/get_team_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const teamData = await teamResponse.json();
        const teamDataWithIds = teamData.map((row, index) => ({ id: index, ...row }));
        setTeamCountData(teamDataWithIds);
      }

      // Fetch Date Count Table Data
      if (CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE) {
        const dateResponse = await fetch(`${apiUrl}/api/get_date_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const dateData = await dateResponse.json();
        const dateDataWithIds = dateData.map((row, index) => ({ id: index, ...row }));
        setDateCountData(dateDataWithIds);
      }

      // Fetch Newsfeed Table Data
      if (CONFIG_NEWSFEED_INCLUDE_NEWSFEED_TABLE) {
        const newsfeedResponse = await fetch(`${apiUrl}/api/get_event_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
            teamsYear: CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
            announcementsYear: CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME,
          })
        });
        const newsfeedData = await newsfeedResponse.json();
        const newsfeedDataWithIds = newsfeedData.map((row, index) => ({ id: index, ...row }));
        console.log('Fetched newsfeedData:', newsfeedDataWithIds); // Add this line for debugging
        setNewsfeedData(newsfeedDataWithIds);  // Set original data
      }

    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filterNewsfeedData = () => {
    console.log('Filtering newsfeedData:', newsfeedData); // Add this line for debugging
    console.log('Selected eventType:', eventType); // Add this line for debugging  
    if (eventType === "Show All Events") {
      setFilteredNewsfeedData(newsfeedData);  // Reset to show all events
    } else if (eventType === "Show Catches Only") {
      setFilteredNewsfeedData(newsfeedData.filter(event => event.type === "Catch"));
    } else if (eventType === "Show Registration Only") {
      setFilteredNewsfeedData(newsfeedData.filter(event => event.type === "Register"));
    } else if (eventType === "Show Announcements Only") {
      setFilteredNewsfeedData(newsfeedData.filter(event => event.type === "Announcement"));
    }
    console.log('Filtered newsfeedData:', filteredNewsfeedData); // Add this line to confirm filtering
  };

  // Count Column Definitions
  const desktopColumns = [
    { field: 'category', headerName: 'Category', flex: 2, headerClassName: "super-app-theme--header", headerAlign: "center" },
    { field: 'count', headerName: 'Count', flex: 1, headerClassName: "super-app-theme--header", headerAlign: "center" }
  ];

  const mobileColumns = [
    { field: 'category', headerName: 'Category', flex: 2, headerClassName: "super-app-theme--header", headerAlign: "center" },
    { field: 'count', headerName: 'Count', flex: 1, headerClassName: "super-app-theme--header", headerAlign: "center" }
  ];

  // Event Column Definitions
  const desktopEventColumns = [
    { field: 'type', headerName: 'Type', flex: 2, headerClassName: "super-app-theme--header", headerAlign: "center" },
    { field: 'title', headerName: 'Team', flex: 2, headerClassName: "super-app-theme--header", headerAlign: "center" },
    {
      field: 'subtitle',
      headerName: 'Event',
      flex: 4,
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
    },
    {
      field: 'points',
      headerName: 'Points',
      flex: 1,
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      valueFormatter: (params) => {
        return params === "-" ? "-" : params;
      },
      sortComparator: (v1, v2) => {
        const value1 = v1 === "-" ? -Infinity : parseFloat(v1);
        const value2 = v2 === "-" ? -Infinity : parseFloat(v2);
        return value1 - value2;
      }
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      flex: 3,
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      valueFormatter: (params) => {
        return dayjs(params).format('hh:mm A, MMM Do YYYY');
      }
    }
  ];

  const mobileEventColumns = [
    { field: 'type', headerName: 'Type', width: 150, headerClassName: "super-app-theme--header", headerAlign: "center" },
    { field: 'title', headerName: 'Team', width: 200, headerClassName: "super-app-theme--header", headerAlign: "center" },
    {
      field: 'subtitle',
      headerName: 'Event',
      width: 300,
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
    },
    { 
      field: 'points', 
      headerName: 'Points', 
      width: 150, 
      headerClassName: "super-app-theme--header", 
      headerAlign: "center",
      valueFormatter: (params) => {
        return params === "-" ? "-" : params;
      },
      sortComparator: (v1, v2) => {
        const value1 = v1 === "-" ? -Infinity : parseFloat(v1);
        const value2 = v2 === "-" ? -Infinity : parseFloat(v2);
        return value1 - value2;
      }
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 300,
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      valueFormatter: (params) => {
        return dayjs(params).format('hh:mm A, MMM Do YYYY');
      }
    }
  ];

  // Helpers
  const onChangeCountType = (e) => {
    setCountType(e.target.value);
  };

  const onChangeEventType = (e) => {
    setEventType(e.target.value);
  };

  return (
    <AnimatedPage>
      <main>
        <section className="section-banner">
          <h1>Newsfeed</h1>
        </section>
        <section className="section-contact">
          <Box sx={{ 
            width: '90%', 
            typography: 'body1', 
            display: 'flex', 
            flexDirection: matches ? 'row' : 'column', // Stack in column on mobile
            gap: 4 // Add some space between tables
          }}>
            {/* Count Tables */}
            <Box sx={{ width: matches ? '33%' : '100%', paddingRight: matches ? 2 : 0 }}>
              {!loading && (
                <>
                  <h2>Counts</h2>
                  <br/>
                  <FormControl key={`count-type-dropdown`} fullWidth>
                  <InputLabel>Select View</InputLabel>
                    <Select
                      label="None Selected"
                      value={countType}
                      onChange={onChangeCountType}
                    >
                      { CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE && 
                        <MenuItem key="type-count-menu-option" value="By Type">By Type</MenuItem>
                      }
                      { CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE && 
                        <MenuItem key="species-count-menu-option" value="By Species">By Species</MenuItem>
                      }
                      { CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE && 
                        <MenuItem key="team-count-menu-option" value="By Team">By Team</MenuItem>
                      }
                      { CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE && 
                        <MenuItem key="date-count-menu-option" value="By Date">By Date</MenuItem>
                      }
                    </Select>
                  </FormControl>
                  <br/>
                  <br/>
                    { (CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE && countType === "By Type") &&
                      <CountTable 
                        rows={typeCountData} 
                        columns={matches ? desktopColumns : mobileColumns} 
                        pagination={false}
                        hideFooter={true}
                      />                
                    }
                    { (CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE && countType === "By Species") &&
                      <CountTable 
                        rows={speciesCountData} 
                        columns={matches ? desktopColumns : mobileColumns} 
                        pagination={false}
                        hideFooter={true}
                      />
                    }
                    { (CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE && countType === "By Team") &&
                      <CountTable 
                        rows={teamCountData} 
                        columns={matches ? desktopColumns : mobileColumns} 
                        pagination={false}
                        hideFooter={true}
                      />               
                    }
                    { (CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE && countType === "By Date") &&
                      <CountTable 
                        rows={dateCountData} 
                        columns={matches ? desktopColumns : mobileColumns} 
                        pagination={false}
                        hideFooter={true}
                      />              
                    }
                </>
              )}
            </Box>

            {/* Newsfeed Table */}
            <Box sx={{ width: matches ? '66%' : '100%', paddingLeft: matches ? 2 : 0 }}>
              {!loading ? (
                <>
                  <h2>Event Log</h2>
                  <br/>
                  <FormControl key={`event-type-dropdown`} fullWidth>
                    <InputLabel>Select View</InputLabel>
                    <Select
                      label="None Selected"
                      value={eventType}
                      onChange={onChangeEventType}
                    >
                      <MenuItem key="all-menu-option" value="Show All Events">Show All Events</MenuItem>
                      <MenuItem key="catches-menu-option" value="Show Catches Only">Show Catches Only</MenuItem>
                      <MenuItem key="registration-menu-option" value="Show Registration Only">Show Registration Only</MenuItem>
                      <MenuItem key="announcement-menu-option" value="Show Announcements Only">Show Announcements Only</MenuItem>
                    </Select>
                  </FormControl>
                  <br/>
                  <br/>
                  <CountTable
                      rows={filteredNewsfeedData}
                      columns={matches ? desktopEventColumns : mobileEventColumns}
                      pagination={true} // Enable pagination for the event table
                      pageSize={100} // Set page size to 100 rows
                      pageSizeOptions={[100]} // Option for 100 rows per page
                      hideFooter={false} // Show the footer for pagination
                  />
                </>
              ) : (
                <CircularProgress />
              )}
            </Box>
          </Box>
        </section>
        <Footer />
      </main>
    </AnimatedPage>
  );
}

export default NewsfeedPage;

