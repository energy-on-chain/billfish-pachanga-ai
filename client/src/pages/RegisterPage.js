import { CircularProgress, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import AddTeamModal from '../components/modals/AddTeamModal';
import { loadConfigForYear } from '../config/masterConfig'; // Dynamic config loader
import './RegisterPage.css';

function RegisterPage(props) {
  const { year: yearFromParams } = useParams(); // Get year from URL params
  const [searchParams] = useSearchParams(); // Get search params
  const yearFromSearch = searchParams.get('year');
  const year = props.year || yearFromParams || yearFromSearch || new Date().getFullYear();

  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);

  // Styling state
  const [bannerBgColor, setBannerBgColor] = useState('');
  const [bannerTextColor, setBannerTextColor] = useState('');
  const [titleTextColor, setTitleTextColor] = useState('');
  const [subtitleTextColor, setSubtitleTextColor] = useState('');
  const [buttonBgColor, setButtonBgColor] = useState();
  const [buttonTextColor, setButtonTextColor] = useState();
  const [buttonBorderColor, setButtonBorderColor] = useState();
  const [isRegistrationDisabled, setIsRegistrationDisabled] = useState(false);
  const [pricesPendingConfirmation, setPricesPendingConfirmation] = useState(false);

  // Registration config state
  const [earlyBird, setEarlyBird] = useState({});
  const [normalFee, setNormalFee] = useState({});
  const [paidAddOns, setPaidAddOns] = useState({});
  const [disclaimers, setDisclaimers] = useState([]);
  const [configLoaded, setConfigLoaded] = useState(false);

  const openAddTeamModal = () => {
    setIsAddTeamModalOpen(true);
  };

  const closeAddTeamModal = () => {
    setIsAddTeamModalOpen(false);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await loadConfigForYear(year); // Load config dynamically based on the year
      if (config) {

        const leaderboardConfig = config.leaderboardConfig;
        const stylingConfig = config.stylingConfig;
        const registrationConfig = config.registrationConfig;

        // Set styling config
        setBannerBgColor(stylingConfig.CONFIG_STYLING_BANNER_BACKGROUND_COLOR);
        setBannerTextColor(stylingConfig.CONFIG_STYLING_BANNER_TEXT_COLOR);
        setTitleTextColor(stylingConfig.CONFIG_STYLING_REGISTER_TITLE_TEXT_COLOR);
        setSubtitleTextColor(stylingConfig.CONFIG_STYLING_REGISTER_SUBTITLE_TEXT_COLOR);
        setButtonBgColor(stylingConfig.CONFIG_STYLING_BUTTON_BACKGROUND_COLOR);
        setButtonTextColor(stylingConfig.CONFIG_STYLING_BUTTON_TEXT_COLOR);
        setButtonBorderColor(stylingConfig.CONFIG_STYLING_BUTTON_BORDER_COLOR);

        // Set registration config
        setEarlyBird({
          hasEarlyBird: registrationConfig.CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION,
          fee: registrationConfig.CONFIG_REGISTRATION_EARLYBIRD_FEE,
          date: registrationConfig.CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING,
        });
        setNormalFee({
          fee: registrationConfig.CONFIG_REGISTRATION_NORMAL_FEE,
          date: registrationConfig.CONFIG_REGISTRATION_NORMAL_DATE_STRING,
        });
        setPaidAddOns(registrationConfig.CONFIG_REGISTRATION_PAID_ADD_ONS);
        setDisclaimers(registrationConfig.CONFIG_REGISTRATION_DISCLAIMERS || []);

        const pending = registrationConfig.CONFIG_REGISTRATION_PRICES_PENDING_CONFIRMATION || false;
        setPricesPendingConfirmation(pending);

        const currentTime = new Date().getTime();
        if (pending || currentTime > registrationConfig.CONFIG_REGISTRATION_CUTOFF_IN_LOCAL_TIME_IN_MS) {
          setIsRegistrationDisabled(true);
        }

        setConfigLoaded(true); // Set config loaded to true once everything is ready
      }
    };

    fetchConfig();
    setIsAddTeamModalOpen(false);
  }, [year]);

  if (!configLoaded) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  return (
    <AnimatedPage>
      <main>
        {/* BANNER */}
        <section style={{ backgroundColor: bannerBgColor }} className="section-banner">
          <h1 style={{ color: bannerTextColor }}>Register</h1>
        </section>

        <section className="section-register">
          {pricesPendingConfirmation && (
            <div className="prices-pending-banner">
              <strong>Registration coming soon</strong>
              <p>
                Pricing and dates shown below are preliminary and subject to change.
                This page will be updated with confirmed details before registration officially opens.
                Contact us at{' '}
                <a href="mailto:support@customtournamentsolutions.com">
                  support@customtournamentsolutions.com
                </a>{' '}
                with any questions.
              </p>
            </div>
          )}

          <h1 style={{ color: titleTextColor }}>Entry Fee</h1>

          {earlyBird.hasEarlyBird && earlyBird.fee && (
            <>
              <h2 style={{ color: subtitleTextColor }}>
                ${earlyBird.fee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} per team
              </h2>
              <h4 style={{ color: subtitleTextColor }}>{earlyBird.date}</h4>
            </>
          )}

          {normalFee.fee && (
            <>
              <h2 style={{ color: subtitleTextColor }}>
                ${normalFee.fee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} per team
              </h2>
              <h4 style={{ color: subtitleTextColor }}>{normalFee.date}</h4>
            </>
          )}

          {paidAddOns && (
            <>
              <br/>
              {Object.entries(paidAddOns).map(([title, addOns], index) => (
                <div key={index}>
                  <h2 style={{ color: titleTextColor }}>{title}</h2>
                  {addOns.map((addOn, i) => (
                    <h3 key={i} style={{ color: subtitleTextColor }}>{addOn}</h3>
                  ))}
                  <br />
                </div>
              ))}
            </>
          )}

          <button 
            style={{ 
              backgroundColor: isRegistrationDisabled ? '#AEBDC4' : buttonBgColor, // Grey background if disabled
              color: isRegistrationDisabled ? 'white' : buttonTextColor,  // Light text color if disabled
              borderColor: isRegistrationDisabled ? 'black' : buttonBorderColor  // Grey border if disabled
            }} 
            className="home-signup-button" 
            onClick={openAddTeamModal} 
            disabled={isRegistrationDisabled} // Disable the button if the cutoff is reached
            type="button"
          >
            {pricesPendingConfirmation ? "Coming Soon" : isRegistrationDisabled ? "Signup Closed!" : "Register Now!"}
          </button>
          <AddTeamModal isAdmin={false} status={isAddTeamModalOpen} open={openAddTeamModal} close={closeAddTeamModal} />

          {/* Disclaimers Section */}
          {disclaimers && Object.keys(disclaimers).length > 0 && (
            <>
              <br />
              {Object.entries(disclaimers).map(([disclaimerCategory, disclaimerDetails], index) => (
                <div key={index}>
                  <h2 style={{ color: titleTextColor }}>{disclaimerCategory}</h2><br/>
                  {disclaimerDetails.map((disclaimer, i) => (
                    <h4 key={i} style={{ color: subtitleTextColor }}>{disclaimer}</h4>
                  ))}
                  <br />
                </div>
              ))}
            </>
          )}

        </section>
        <Footer />
      </main>
    </AnimatedPage>
  );
}

export default RegisterPage;

