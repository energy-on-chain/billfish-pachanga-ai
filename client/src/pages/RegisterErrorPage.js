import React, { useState, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import { loadConfigForYear } from '../config/masterConfig'; // Dynamic config loader
import './HomePage.css';
import './RegisterPage.css';

function RegisterErrorPage(props) {
  const [bannerBgColor, setBannerBgColor] = useState('');
  const [bannerTextColor, setBannerTextColor] = useState('');
  const [h2Color, setH2Color] = useState('');
  const [pColor, setPColor] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Load dynamic config based on the year
  useEffect(() => {
    const fetchConfig = async () => {
      const config = await loadConfigForYear(props.year); // Load config based on the year from props
      const stylingConfig = config.stylingConfig;
      const generalConfig = config.generalConfig;

      setBannerBgColor(stylingConfig.CONFIG_STYLING_BANNER_BACKGROUND_COLOR);
      setBannerTextColor(stylingConfig.CONFIG_STYLING_BANNER_TEXT_COLOR);
      setH2Color(stylingConfig.CONFIG_STYLING_H2_COLOR);
      setPColor(stylingConfig.CONFIG_STYLING_P_COLOR);
      setContactEmail(generalConfig.CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING);
    };

    fetchConfig();
  }, [props.year]);

  return (
    <AnimatedPage>
      <main>
        <section className="section-banner" style={{ backgroundColor: bannerBgColor }}>
          <h1 style={{ color: bannerTextColor }}>Registration Error</h1>
        </section>
        <section className="section-hero2">
          <br />
          <p style={{ color: pColor }}>
            <strong>An error occurred during the registration process.</strong>
          </p>
          <br />
          <p style={{ color: pColor }}>
            Your card has not been charged. Please try again or contact the site administrators listed below for assistance.
          </p>
          <br />
          {contactEmail && (
            <p style={{ color: pColor }}>
              <strong>{contactEmail}</strong>
            </p>
          )}
        </section>
        <Footer />
      </main>
    </AnimatedPage>
  );
}

export default RegisterErrorPage;

