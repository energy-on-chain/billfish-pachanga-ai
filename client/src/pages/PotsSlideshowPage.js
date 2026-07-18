import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { Skeleton } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import PotCarousel from '../components/PotCarousel';
import './BasePage.css';

import { loadConfigForYear } from '../config/masterConfig';

dayjs.extend(advancedFormat);

// Dedicated, always-on slideshow view of the pot payouts (By Pot). Unlike
// PotsPage, there is no view toggle, so a refresh of this page can never
// revert to "List".
function PotsSlideshowPage() {
  const { year } = useParams();
  const [config, setConfig] = useState(null);
  const [timestamp, setTimestamp] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tournamentHasStarted, setTournamentHasStarted] = useState(false);
  const [isPreliminaryResults, setIsPreliminaryResults] = useState(true);
  const [payoutsResultArray, setPayoutsResultArray] = useState([]);
  const [totalGrossPot, setTotalGrossPot] = useState(0);

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
          CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
        },
        potsConfig: {
          CONFIG_POTS_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER,
          CONFIG_POTS_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS,
          CONFIG_POTS_CATEGORIES,
        },
      } = loadedConfig;

      if (CONFIG_POTS_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER) {
        let now = dayjs().valueOf();
        setIsPreliminaryResults(parseInt(CONFIG_POTS_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS) > now);
        setTimestamp(generateTimestamp());
      } else {
        setIsPreliminaryResults(false);
      }

      const apiUrl = import.meta.env.VITE_NODE_ENV === "production"
        ? import.meta.env.VITE_SERVER_URL_PRODUCTION
        : import.meta.env.VITE_SERVER_URL_STAGING;

      // Fetch pot config overrides from Firestore (via admin API)
      let potConfigOverrides = {};
      try {
        const potConfigRes = await fetch(`${apiUrl}/api/${year}/admin_get_pot_config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        if (potConfigRes.ok) {
          potConfigOverrides = await potConfigRes.json();
        }
      } catch (e) {
        console.warn('Could not fetch pot config overrides:', e);
      }

      const queries = CONFIG_POTS_CATEGORIES.map((item) => {
        const payoutStructure = potConfigOverrides[item.potName]?.payoutStructure || item.payoutStructure;

        let bodyData = {
          catchYear: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          potYear: CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
          isReport: false,
          title: item.title,
          subtitle: item.subtitle || "",
          potName: item.potName,
          entryAmount: item.entryAmount,
          tournamentCut: item.tournamentCut,
          payoutStructure: payoutStructure,
          numPlaces: Object.keys(payoutStructure).length,
        };

        if (item.inputs && item.inputs.length > 0) {
          item.inputs.forEach(input => {
            Object.keys(input).forEach(param => {
              bodyData[param] = input[param];
            });
          })
        }

        return {
          url: item.url,
          body: JSON.stringify(bodyData),
          title: item.title,
          subtitle: item.subtitle || "",
          numPlaces: Object.keys(payoutStructure).length,
          desktopColumns: item.desktopColumns,
          mobileColumns: item.mobileColumns,
        };
      });

      confirmTournamentStarted(apiUrl, loadedConfig);
      fetchData(apiUrl, queries);
      fetchTotalPotValue(apiUrl, CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME);
      setHasLoaded(true);

    } catch (error) {
      console.error('Error loading config or fetching data:', error);
    }
  };

  const fetchData = async (apiUrl, queries) => {
    try {
      const res = await Promise.all(queries.map((query) => {
        return fetch(`${apiUrl}/api/${year}/${query.url}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: query.body
        }).then(r => r.json()).then((result) => {
          var tempObject = {};
          var tempRows = [];
          if (!result.noQualifyingEntrants) {
            Object.keys(result).map((catchKey, i) => {
              let tempObject = {...result[catchKey], id: i, catchId: catchKey};
              tempRows.push(tempObject);
            });
          }
          tempObject = {
            title: query.title,
            subtitle: query.subtitle,
            numPlaces: query.numPlaces,
            rows: tempRows,
            noQualifyingEntrants: result.noQualifyingEntrants || false,
            desktopColumns: query.desktopColumns,
            mobileColumns: query.mobileColumns
          };
          return tempObject;
        });
      }));
      setPayoutsResultArray(res);

    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const fetchTotalPotValue = async (apiUrl, potYear) => {
    try {
      const res = await fetch(`${apiUrl}/api/${year}/get_all_pot_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ potYear })
      });
      const data = await res.json();
      // Satellite Tag buy-ins aren't a real pot with a payout - exclude
      // them so the displayed total pot value only reflects actual pots.
      const total = (data.data || []).reduce((acc, entry) => {
        return acc + (entry.totalPotFee || 0) - (entry.totalSatelliteTagFee || 0);
      }, 0);
      setTotalGrossPot(total);
    } catch (error) {
      console.error('Error fetching total pot value: ', error);
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
    return `Preliminary pot standings as of: ${timeString} on ${dateString}.`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <AnimatedPage>
      <main>

        {/* BANNER */}
        <section style={{ backgroundColor: config?.stylingConfig?.CONFIG_STYLING_BANNER_BACKGROUND_COLOR }} className="section-banner">
          <h1 style={{ color: config?.stylingConfig?.CONFIG_STYLING_BANNER_TEXT_COLOR }}>Pots</h1>
        </section>

        <section className="section-view">
          <Box sx={{ width: '90%', typography: 'body1' }}>

            {/* Preliminary results disclaimer message */}
            {isPreliminaryResults && (
              <div>
                <br/>
                <h1 style={{ fontSize: '30px', marginBottom: '20px', color: config?.stylingConfig?.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR }}>Total Pot Value: {formatCurrency(totalGrossPot)}</h1>
                <h3 className="timestamp-text" style={{color: config?.stylingConfig?.CONFIG_STYLING_POTS_TIMESTAMP_TEXT_COLOR}}><em>{timestamp}</em></h3>
                <h3 className="timestamp-text" style={{color: "red"}}><em>For information only.</em></h3>
                <h3 className="timestamp-text" style={{color: "red"}}><em>Official results can only be certified by the tournament committee.</em></h3>
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
                <div>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Skeleton variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ mb: 0.5 }} />
                    <Skeleton variant="rectangular" height={36} />
                  </Box>
                  <CircularProgress />
                </div>
              ) : (
                <div>
                  <br/>
                  <PotCarousel results={payoutsResultArray} />
                </div>
              )
            )}
          </Box>
        </section>

        <Footer />
      </main>
    </AnimatedPage>
  );
}

export default PotsSlideshowPage;
