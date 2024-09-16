import React, { useState, useEffect } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from 'react-router-dom';

import AnimatedPage from './AnimatedPage';
import HomeCountdownTimer from '../components/timers/HomeCountdownTimer';
import Footer from '../components/Footer';
import './HomePage.css';
import './RegisterPage.css';

import desktopLogo from '../images/HomePageLogoDesktop.png';
import tabletLogo from '../images/HomePageLogoTablet.png';
import mobileLogo from '../images/HomePageLogoMobile.png';

import {
  CONFIG_GENERAL_YEAR,
  CONFIG_GENERAL_HAS_REGISTRATION, 
  CONFIG_GENERAL_HAS_NEWSFEED, 
  CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
  CONFIG_GENERAL_HAS_POTS
} from '../config/generalConfig';

import { 
  CONFIG_HOME_TOURNAMENT_DATE_STRING, 
  CONFIG_HOME_TOURNAMENT_START_IN_LOCAL_TIME_IN_MS,
  CONFIG_HOME_PAST_TOURNAMENT_RESULT_STRINGS,
  CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT,
  CONFIG_HOME_CATCH_STAT_TYPE,
} from '../config/homeConfig';

import {
  CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION,
  CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS,
  CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING,
  CONFIG_REGISTRATION_NORMAL_DATE_STRING,
  CONFIG_REGISTRATION_EARLYBIRD_FEE,
  CONFIG_REGISTRATION_NORMAL_FEE,
} from '../config/registrationConfig';

import { 
  CONFIG_POTS_BOARD_LIST 
} from '../config/potsConfig';

import { 
  CONFIG_STYLING_HOME_HERO_BACKGROUND_COLOR,
  CONFIG_STYLING_HOME_HERO_TEXT_COLOR,
  CONFIG_STYLING_BUTTON_BORDER_COLOR,
  CONFIG_STYLING_BUTTON_BACKGROUND_COLOR,
  CONFIG_STYLING_BUTTON_TEXT_COLOR,
  CONFIG_STYLING_HOME_INFO_BACKGROUND_COLOR,
  CONFIG_STYLING_HOME_INFO_TEXT_COLOR,
  CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR,
} from '../config/stylingConfig';

function HomePage() {
  const [logo, setLogo] = useState(desktopLogo);
  const [numTeams, setNumTeams] = useState(0);
  const [numCatches, setNumCatches] = useState(0);
  const [potTotal, setPotTotal] = useState(0);

  useEffect(() => {
    const updateLogo = () => {
      if (window.innerWidth <= 750) {
        setLogo(mobileLogo);
      } else if (window.innerWidth <= 1024) {
        setLogo(tabletLogo);
      } else {
        setLogo(desktopLogo);
      }
    };

    // Set the logo initially
    updateLogo();

    // Add event listener
    window.addEventListener('resize', updateLogo);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateLogo);
    };
  }, []);

  useEffect(() => {
    let apiUrl = null;
    if (process.env.REACT_APP_NODE_ENV === "staging") {
      apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
    } else if (process.env.REACT_APP_NODE_ENV === "production") {
      apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
    }

    // Teams
    if (CONFIG_GENERAL_HAS_REGISTRATION) {
      fetch(`${apiUrl}/api/get_registrant_count_for_homepage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ teamTableName: CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME })
      })
      .then(res => res.json())
      .then(data => {
        if (data.count == 0) {
          setNumTeams("TBD");
        } else {
          setNumTeams(data.count);
        }
      })
      .catch(e => console.error(e));
    }

    // Catches
    if (CONFIG_GENERAL_HAS_NEWSFEED) {
      fetch(`${apiUrl}/api/get_catch_count_for_homepage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          catchesTableName: CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
          speciesTypeList: CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT,
         })
      })
      .then(res => res.json())
      .then(data => {
        if (data.count == 0) {
          setNumCatches("TBD");
        } else {
          setNumCatches(data.count);
        }
      })
      .catch(e => console.error(e));
    }

    // Pot total
    if (CONFIG_GENERAL_HAS_POTS) {
      const boardNames = CONFIG_POTS_BOARD_LIST.map(board => Object.keys(board)[0]);
      fetch(`${apiUrl}/api/get_total_pot_size_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ potYear: CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME, boardNames })
      })
      .then(res => res.json())
      .then(data => {
        console.log('potData', data);
        if (data.totalPotSize == 0 || data.totalPotSize == undefined || data.totalPotSize == null) {
          setPotTotal("TBD");
        } else {
          setPotTotal(data.totalPotSize);
        }
      })
      .catch(e => {
        setPotTotal("TBD");
        console.error(e);
      });
    }
  }, []); // <-- Missing dependency array

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
    };
  };

  return (
    <AnimatedPage>
      <main>
        <section style={{backgroundColor: CONFIG_STYLING_HOME_HERO_BACKGROUND_COLOR}} className="section-hero">
          <img src={logo} alt="Tournament Logo" />
          <br/>
          <h2 style={{color: CONFIG_STYLING_HOME_HERO_TEXT_COLOR}}>{CONFIG_HOME_TOURNAMENT_DATE_STRING}</h2>
          <div className="tournamentColElement">
            <HomeCountdownTimer className="countdown-timer-element" targetDate={parseInt(CONFIG_HOME_TOURNAMENT_START_IN_LOCAL_TIME_IN_MS, 10)} />
          </div>
        </section>
        <section 
          style={{backgroundColor: CONFIG_STYLING_HOME_INFO_BACKGROUND_COLOR}} 
          className="section-hero2"
        >
          {CONFIG_GENERAL_HAS_REGISTRATION && (
            <div className="registration-info">
              <Link to="/register">
                <button 
                  style={{backgroundColor: CONFIG_STYLING_BUTTON_BACKGROUND_COLOR, color: CONFIG_STYLING_BUTTON_TEXT_COLOR, borderColor: CONFIG_STYLING_BUTTON_BORDER_COLOR}} 
                  className="home-signup-button" 
                  type="button"
                >
                    Register Now!
                </button>  
              </Link>
              <br/>
              {CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION && (
                <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}} >
                  <strong>{CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING} </strong>
                  <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}>{formatCurrency(CONFIG_REGISTRATION_EARLYBIRD_FEE)}</span>
                </p>
              )}
              <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}}>
                <strong>{CONFIG_REGISTRATION_NORMAL_DATE_STRING} </strong>
                <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}>{formatCurrency(CONFIG_REGISTRATION_NORMAL_FEE)}</span>
              </p>
              <br/>
              <br/>
            </div>
          )}
          {CONFIG_HOME_PAST_TOURNAMENT_RESULT_STRINGS.map((result, index) => (
            <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}} key={index}>{result}</p>
          ))}
          <p style={{color: CONFIG_STYLING_HOME_INFO_TEXT_COLOR}}>
            <strong>{CONFIG_GENERAL_YEAR} Tournament:</strong> <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}>{numTeams} teams </span> / <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}>{numCatches} {CONFIG_HOME_CATCH_STAT_TYPE}</span> / <span style={{color: CONFIG_STYLING_HOME_INFO_HIGHLIGHTED_TEXT_COLOR}}>{formatCurrency(potTotal)} total pot</span></p>
        </section>
        <Footer/>
      </main>
    </AnimatedPage>
  );
}

export default HomePage;

