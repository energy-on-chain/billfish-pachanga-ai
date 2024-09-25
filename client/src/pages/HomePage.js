import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadConfigForYear } from '../config/masterConfig';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from 'react-router-dom';

import AnimatedPage from './AnimatedPage';
import HomeCountdownTimer from '../components/timers/HomeCountdownTimer';
import Footer from '../components/Footer';
import logoDesktop from '../images/HomePageLogoDesktop.png';
import logoTablet from '../images/HomePageLogoTablet.png';
import logoMobile from '../images/HomePageLogoMobile.png';
import './HomePage.css';
import './RegisterPage.css';

function HomePage() {

  // STATE
  const { year } = useParams(); 
  const [logo, setLogo] = useState();
  const [configs, setConfigs] = useState(null);
  const [numTeams, setNumTeams] = useState(0);
  const [numCatches, setNumCatches] = useState(0);
  const [potTotal, setPotTotal] = useState(0);
  const [isRegistrationDisabled, setIsRegistrationDisabled] = useState(false); // New state to track registration button state

  // INITIALIZE
  useEffect(() => {
    // Load configs
    const loadConfigs = async () => {
      const config = await loadConfigForYear(year); // Load configs dynamically based on year
      if (config) {
        setConfigs(config);
      }
    };
    loadConfigs();
  }, [year]);

  useEffect(() => {
    // Set logo based on screen size
    const updateLogo = () => {
      if (configs && configs.images) {
        if (window.innerWidth <= 750) {
          setLogo(logoMobile);
        } else if (window.innerWidth <= 1024) {
          setLogo(logoTablet);
        } else {
          setLogo(logoDesktop);
        }
      }
    };

    // Add event listener for window resizing
    window.addEventListener('resize', updateLogo);
    updateLogo(); // Call it once initially

    return () => {
      window.removeEventListener('resize', updateLogo);
    };
  }, [configs]);

  useEffect(() => {
    if (!configs) return; // Prevent running fetches until configs are loaded

    const {
      CONFIG_GENERAL_HAS_REGISTRATION,
      CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
      CONFIG_GENERAL_HAS_NEWSFEED,
      CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
      CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
      CONFIG_GENERAL_HAS_POTS
    } = configs.generalConfig;

    const {
      CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS,
    } = configs.leaderboardConfig;

    const apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
      ? process.env.REACT_APP_SERVER_URL_STAGING
      : process.env.REACT_APP_SERVER_URL_PRODUCTION;

    // Check if the current time is past the cutoff, and disable registration if so
    const currentTime = new Date().getTime();
    if (currentTime > CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS) {
      setIsRegistrationDisabled(true); // Disable the registration button
    }

    // Fetch teams
    if (CONFIG_GENERAL_HAS_REGISTRATION) {
      fetch(`${apiUrl}/api/${year}/get_registrant_count_for_homepage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ teamTableName: CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
      })
      .then(res => res.json())
      .then(data => {
        setNumTeams(data.count === 0 ? "TBD" : data.count);
      })
      .catch(e => console.error(e));
    }

    // Fetch catches
    if (CONFIG_GENERAL_HAS_NEWSFEED) {
      fetch(`${apiUrl}/api/${year}/get_catch_count_for_homepage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          catchesTableName: configs.generalConfig.CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          speciesTypeList: configs.homeConfig.CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT,
        })
      })
      .then(res => res.json())
      .then(data => {
        setNumCatches(data.count === 0 ? "TBD" : data.count);
      })
      .catch(e => console.error(e));
    }

    // Fetch pot total
    if (CONFIG_GENERAL_HAS_POTS) {
      const boardNames = configs.potsConfig.CONFIG_POTS_BOARD_LIST.map(board => Object.keys(board)[0]);
      fetch(`${apiUrl}/api/${year}/get_total_pot_size_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ potYear: CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME, boardNames })
      })
      .then(res => res.json())
      .then(data => {
        console.log('homepage pot data', data)
        setPotTotal(data.totalPotSize === 0 ? "TBD" : data.totalPotSize);
      })
      .catch(e => {
        setPotTotal("TBD");
        console.error(e);
      });
    }
  }, [year, configs && configs.generalConfig]);  // Ensure this runs only after configs are set

  const formatCurrency = (value) => {
    if (value === "TBD") {
      return "TBD";
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
  };

  if (!configs) {
    return <div>Loading...</div>; // Show a loading state while configs are being fetched
  }

  // CONFIG
  const {
    CONFIG_HOME_TOURNAMENT_DATE_STRING,
    CONFIG_HOME_TOURNAMENT_START_IN_LOCAL_TIME_IN_MS,
    CONFIG_HOME_PAST_TOURNAMENT_RESULT_STRINGS,
    CONFIG_HOME_CATCH_STAT_TYPE
  } = configs.homeConfig;

  const {
    CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION,
    CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING,
    CONFIG_REGISTRATION_EARLYBIRD_FEE,
    CONFIG_REGISTRATION_NORMAL_DATE_STRING,
    CONFIG_REGISTRATION_NORMAL_FEE
  } = configs.registrationConfig;

  const {
    CONFIG_STYLING_HOME_HERO_BACKGROUND_COLOR,
    CONFIG_STYLING_HOME_HERO_TEXT_COLOR,
    CONFIG_STYLING_BUTTON_BORDER_COLOR,
    CONFIG_STYLING_BUTTON_BACKGROUND_COLOR,
    CONFIG_STYLING_BUTTON_TEXT_COLOR,
    CONFIG_STYLING_HOME_INFO_BACKGROUND_COLOR,
    CONFIG_STYLING_HOME_INFO_TEXT_COLOR,
    CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR
  } = configs.stylingConfig;

  return (
    <AnimatedPage>
      <main>
        <section style={{backgroundColor: CONFIG_STYLING_HOME_HERO_BACKGROUND_COLOR}} className="section-hero">
          <img src={logo} alt="Tournament Logo" />
          <br />
          <h2 style={{color: CONFIG_STYLING_HOME_HERO_TEXT_COLOR}}>{CONFIG_HOME_TOURNAMENT_DATE_STRING}</h2>
          <div className="tournamentColElement">
            <HomeCountdownTimer className="countdown-timer-element" targetDate={parseInt(CONFIG_HOME_TOURNAMENT_START_IN_LOCAL_TIME_IN_MS, 10)} />
          </div>
        </section>
        <section style={{backgroundColor: CONFIG_STYLING_HOME_INFO_BACKGROUND_COLOR}} className="section-hero2">
          {configs.generalConfig.CONFIG_GENERAL_HAS_REGISTRATION && (
            <div className="registration-info">
              <Link to={`/${year}/register`}>
                <button 
                  style={{ 
                    backgroundColor: isRegistrationDisabled ? '#AEBDC4' : CONFIG_STYLING_BUTTON_BACKGROUND_COLOR, // Grey background if disabled
                    color: isRegistrationDisabled ? 'white' : CONFIG_STYLING_BUTTON_TEXT_COLOR,  // Light text color if disabled
                    borderColor: isRegistrationDisabled ? 'black' : CONFIG_STYLING_BUTTON_BORDER_COLOR  // Grey border if disabled
                  }} 
                  className="home-signup-button" 
                  type="button"
                  disabled={isRegistrationDisabled} // Disable the button if the cutoff is reached
                >
                  {isRegistrationDisabled ? "Signup Closed!" : "Register Now!"} {/* Change the label */}
                </button>
              </Link>
              <br />
              {CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION && (
                <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}}>
                  <strong>{CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING} </strong>
                  <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}>{formatCurrency(CONFIG_REGISTRATION_EARLYBIRD_FEE)}</span>
                </p>
              )}
              <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}}>
                <strong>{CONFIG_REGISTRATION_NORMAL_DATE_STRING} </strong>
                <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}>{formatCurrency(CONFIG_REGISTRATION_NORMAL_FEE)}</span>
              </p>
              <br />
              <br />
            </div>
          )}
          {CONFIG_HOME_PAST_TOURNAMENT_RESULT_STRINGS.map((result, index) => (
            <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}} key={index}>{result}</p>
          ))}
          <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}}>
            <strong>{configs.generalConfig.CONFIG_GENERAL_YEAR} Tournament: </strong>
            <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}> {numTeams} teams </span> /
            <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}> {numCatches} {CONFIG_HOME_CATCH_STAT_TYPE}</span> /
            <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}> {formatCurrency(potTotal)} total pot</span>
          </p>
        </section>
        <Footer />
      </main>
    </AnimatedPage>
  );
}

export default HomePage;
