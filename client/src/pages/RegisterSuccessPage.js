import React, { useState, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import { loadConfigForYear } from '../config/masterConfig'; // Dynamic config loader
import './HomePage.css';
import "./RegisterPage.css";

function RegisterSuccessPage(props) {
  const [bannerBgColor, setBannerBgColor] = useState('');
  const [bannerTextColor, setBannerTextColor] = useState('');
  const [h2Color, setH2Color] = useState('');
  const [pColor, setPColor] = useState('');

  // Load dynamic config based on the year
  useEffect(() => {
    const fetchConfig = async () => {
      const config = await loadConfigForYear(props.year);  // Load config based on the year from props
      const stylingConfig = config.stylingConfig;

      setBannerBgColor(stylingConfig.CONFIG_STYLING_BANNER_BACKGROUND_COLOR);
      setBannerTextColor(stylingConfig.CONFIG_STYLING_BANNER_TEXT_COLOR);
      setH2Color(stylingConfig.CONFIG_STYLING_H2_COLOR);
      setPColor(stylingConfig.CONFIG_STYLING_P_COLOR);
    };

    fetchConfig();
  }, [props.year]);

  return (
    <AnimatedPage>
      <main>
        <section className="section-banner" style={{ backgroundColor: bannerBgColor }}>
          <h1 style={{ color: bannerTextColor }}>Registration Success</h1>
        </section>
        <section className="section-hero2">
          <br />
          <p style={{ color: pColor }}>
            <strong>Registration was successful!</strong>
          </p>
          <br />
          <p style={{ color: pColor }}>
            Your payment has been processed via Stripe, and you will receive a confirmation email receipt from them shortly.
          </p>
          <br />
          <p style={{ color: pColor }}>
            <strong>See you at the event!</strong>
          </p>
        </section>
        <Footer />
      </main>
    </AnimatedPage>
  );
}

export default RegisterSuccessPage;

