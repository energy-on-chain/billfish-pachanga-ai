import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { MenuItem, FormControl, InputLabel, Select, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import CountTable from '../components/tables/CountTable';
import { loadConfigForYear } from '../config/masterConfig';

import './BasePage.css';

dayjs.extend(advancedFormat);

function NewsfeedPage() {
  const { year } = useParams();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md")); // Detect mobile screen size
  const [loading, setLoading] = useState(true);
  const [countType, setCountType] = useState("By Species");
  const [eventType, setEventType] = useState("Show All Events");

  // State for dynamically loaded configuration
  const [config, setConfig] = useState(null);

  // States for various data tables
  const [typeCountData, setTypeCountData] = useState([]);
  const [speciesCountData, setSpeciesCountData] = useState([]);
  const [teamCountData, setTeamCountData] = useState([]);
  const [dateCountData, setDateCountData] = useState([]);
  const [newsfeedData, setNewsfeedData] = useState([]);
  const [filteredNewsfeedData, setFilteredNewsfeedData] = useState([]);

  useEffect(() => {
    fetchConfigAndData(); // Load config and fetch data
  }, [year]);

  useEffect(() => {
    filterNewsfeedData();
  }, [eventType, newsfeedData]);

  const fetchConfigAndData = async () => {
    setLoading(true);
    try {
      const loadedConfig = await loadConfigForYear(year); // Load the config dynamically
      console.log('loadedConfig', loadedConfig);
      setConfig(loadedConfig); // Set the loaded configuration

      const {
        generalConfig: {
          CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
          CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME,
        },
        newsfeedConfig: {
          CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE,
          CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE,
          CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE,
          CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE,
          CONFIG_NEWSFEED_INCLUDE_NEWSFEED_TABLE,
        },
        stylingConfig: {
          CONFIG_STYLING_BANNER_BACKGROUND_COLOR,
          CONFIG_STYLING_BANNER_TEXT_COLOR,
          CONFIG_STYLING_SECTION_BACKGROUND_COLOR,
          CONFIG_STYLING_SECTION_TEXT_COLOR,
          CONFIG_STYLING_H2_COLOR,
        }
      } = loadedConfig;

      const apiUrl = process.env.REACT_APP_NODE_ENV === 'production'
        ? process.env.REACT_APP_SERVER_URL_PRODUCTION
        : process.env.REACT_APP_SERVER_URL_STAGING;

      // Fetch Type Count Table Data
      if (loadedConfig.newsfeedConfig.CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE) {
        const typeResponse = await fetch(`${apiUrl}/api/${year}/get_type_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const typeData = await typeResponse.json();
        const typeDataWithIds = typeData.map((row, index) => ({ id: index, ...row }));
        setTypeCountData(typeDataWithIds);
        console.log(typeDataWithIds);
      }

      // Fetch Species Count Table Data
      if (loadedConfig.newsfeedConfig.CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE) {
        const speciesResponse = await fetch(`${apiUrl}/api/${year}/get_species_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const speciesData = await speciesResponse.json();
        const speciesDataWithIds = speciesData.map((row, index) => ({ id: index, ...row }));
        setSpeciesCountData(speciesDataWithIds);
        console.log(speciesDataWithIds);
      }

      // Fetch Team Count Table Data
      if (loadedConfig.newsfeedConfig.CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE) {
        const teamResponse = await fetch(`${apiUrl}/api/${year}/get_team_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const teamData = await teamResponse.json();
        const teamDataWithIds = teamData.map((row, index) => ({ id: index, ...row }));
        setTeamCountData(teamDataWithIds);
        console.log(teamDataWithIds);
      }

      // Fetch Date Count Table Data
      if (loadedConfig.newsfeedConfig.CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE) {
        const dateResponse = await fetch(`${apiUrl}/api/${year}/get_date_count_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ catchYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME })
        });
        const dateData = await dateResponse.json();
        const dateDataWithIds = dateData.map((row, index) => ({ id: index, ...row }));
        setDateCountData(dateDataWithIds);
        console.log(dateDataWithIds);
      }

      // Fetch Newsfeed Table Data
      if (loadedConfig.newsfeedConfig.CONFIG_NEWSFEED_INCLUDE_NEWSFEED_TABLE) {
        const newsfeedResponse = await fetch(`${apiUrl}/api/${year}/get_event_data_for_newsfeed_table`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            catchYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
            teamsYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
            announcementsYear: loadedConfig.generalConfig.CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME,
          })
        });
        const newsfeedData = await newsfeedResponse.json();
        const newsfeedDataWithIds = newsfeedData.map((row, index) => ({ id: index, ...row }));
        console.log('Fetched newsfeedData:', newsfeedDataWithIds); // Add this line for debugging
        setNewsfeedData(newsfeedDataWithIds);  // Set original data
        console.log(newsfeedDataWithIds);
      }

    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filterNewsfeedData = () => {
    if (eventType === "Show All Events") {
      setFilteredNewsfeedData(newsfeedData);
    } else if (eventType === "Show Catches Only") {
      setFilteredNewsfeedData(newsfeedData.filter(event => event.type === "Catch"));
    } else if (eventType === "Show Registration Only") {
      setFilteredNewsfeedData(newsfeedData.filter(event => event.type === "Register"));
    } else if (eventType === "Show Announcements Only") {
      setFilteredNewsfeedData(newsfeedData.filter(event => event.type === "Announcement"));
    }
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

  const onChangeCountType = (e) => {
    setCountType(e.target.value);
  };

  const onChangeEventType = (e) => {
    setEventType(e.target.value);
  };

  return (
    <AnimatedPage>
      <main>
        <section style={{ backgroundColor: config?.stylingConfig?.CONFIG_STYLING_BANNER_BACKGROUND_COLOR }} className="section-banner">
          <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_BANNER_TEXT_COLOR }}>Newsfeed</h1>
        </section>
        <section style={{ backgroundColor: config?.stylingConfig?.CONFIG_STYLING_SECTION_BACKGROUND_COLOR, color: config?.stylingConfig?.CONFIG_STYLING_SECTION_TEXT_COLOR }} className="section-contact">
          <Box sx={{
            width: '90%',
            typography: 'body1',
            display: 'flex',
            flexDirection: matches ? 'row' : 'column',
            gap: 4
          }}>
            {/* Count Tables */}
            <Box sx={{ width: matches ? '33%' : '100%', paddingRight: matches ? 2 : 0 }}>
              {!loading && (
                <>
                  <h2 style={{ color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>Counts</h2>
                  <br />
                  <FormControl key={`count-type-dropdown`} fullWidth>
                    <InputLabel>Select View</InputLabel>
                    <Select
                      label="None Selected"
                      value={countType}
                      onChange={onChangeCountType}
                    >
                      {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE && <MenuItem value="By Type">By Type</MenuItem>}
                      {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE && <MenuItem value="By Species">By Species</MenuItem>}
                      {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE && <MenuItem value="By Team">By Team</MenuItem>}
                      {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE && <MenuItem value="By Date">By Date</MenuItem>}
                    </Select>
                  </FormControl>
                  <br />
                  <br />
                  {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_TYPE_COUNT_TABLE && countType === "By Type" &&
                    <CountTable rows={typeCountData} columns={matches ? desktopColumns : mobileColumns} pagination={false} hideFooter={true} />}
                  {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_SPECIES_COUNT_TABLE && countType === "By Species" &&
                    <CountTable rows={speciesCountData} columns={matches ? desktopColumns : mobileColumns} pagination={false} hideFooter={true} />}
                  {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_TEAM_COUNT_TABLE && countType === "By Team" &&
                    <CountTable rows={teamCountData} columns={matches ? desktopColumns : mobileColumns} pagination={false} hideFooter={true} />}
                  {config?.newsfeedConfig?.CONFIG_NEWSFEED_INCLUDE_DATE_COUNT_TABLE && countType === "By Date" &&
                    <CountTable rows={dateCountData} columns={matches ? desktopColumns : mobileColumns} pagination={false} hideFooter={true} />}
                </>
              )}
            </Box>

            {/* Newsfeed Table */}
            <Box sx={{ width: matches ? '66%' : '100%', paddingLeft: matches ? 2 : 0 }}>
              {!loading ? (
                <>
                  <h2 style={{ color: config?.stylingConfig?.CONFIG_STYLING_H2_COLOR }}>Event Log</h2>
                  <br />
                  <FormControl key={`event-type-dropdown`} fullWidth>
                    <InputLabel>Select View</InputLabel>
                    <Select
                      label="None Selected"
                      value={eventType}
                      onChange={onChangeEventType}
                    >
                      <MenuItem value="Show All Events">Show All Events</MenuItem>
                      <MenuItem value="Show Catches Only">Show Catches Only</MenuItem>
                      <MenuItem value="Show Registration Only">Show Registration Only</MenuItem>
                      <MenuItem value="Show Announcements Only">Show Announcements Only</MenuItem>
                    </Select>
                  </FormControl>
                  <br />
                  <br />
                  <CountTable
                    rows={filteredNewsfeedData}
                    columns={matches ? desktopEventColumns : mobileEventColumns}
                    pagination={true}
                    pageSize={100}
                    pageSizeOptions={[100]}
                    hideFooter={false}
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

