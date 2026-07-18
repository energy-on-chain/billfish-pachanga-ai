import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { Skeleton } from "@mui/material";
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import Carousel from '../components/Carousel';
import './BasePage.css';

import { loadConfigForYear } from '../config/masterConfig';

dayjs.extend(advancedFormat);

// Dedicated, always-on slideshow view of the leaderboard. Unlike LeaderboardPage,
// there is no view toggle, so a refresh of this page can never revert to "List".
function LeaderboardSlideshowPage() {
  const { year } = useParams();
  const [timestamp, setTimestamp] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tournamentHasStarted, setTournamentHasStarted] = useState(false);
  const [resultArray, setResultArray] = useState([]);
  const [isPreliminaryResults, setIsPreliminaryResults] = useState(true);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchConfigAndData();
  }, [year]);

  const fetchConfigAndData = async () => {
    try {
      const loadedConfig = await loadConfigForYear(year);
      setConfig(loadedConfig);

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

      const queries = CONFIG_LEADERBOARD_CATEGORIES.map((item) => {
        let bodyData = {
          catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          numPlaces: item.numPlaces,
          isReport: false,
        };
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

    } catch (error) {
      console.error('Error loading config or fetching data:', error);
    }
  };

  const fetchData = async (apiUrl, queries, setResults) => {
    try {
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
        setTournamentHasStarted(data.count !== 0);
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

  return (
    <AnimatedPage>
      <main>
        {config && (
          <>
            {/* BANNER */}
            <section style={{ backgroundColor: config?.stylingConfig?.CONFIG_STYLING_BANNER_BACKGROUND_COLOR }} className="section-banner">
              <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_BANNER_TEXT_COLOR }}>Leaderboard</h1>
            </section>

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

                {/* Slideshow (always on for this dedicated page) */}
                {tournamentHasStarted && (
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
              </Box>
            </section>

            <Footer />
          </>
        )}
      </main>
    </AnimatedPage>
  );
}

export default LeaderboardSlideshowPage;
