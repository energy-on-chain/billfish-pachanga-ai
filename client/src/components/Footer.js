import React, { useState, useEffect } from 'react';
import AnimatedPage from '../pages/AnimatedPage';
import BackToTopButton from './buttons/BackToTopButton';
import { loadConfigForYear } from '../config/masterConfig';
import './Footer.css';

function Footer() {
  const [footerConfig, setFooterConfig] = useState({});
  const [stylingConfig, setStylingConfig] = useState({});

  useEffect(() => {
    const loadConfigs = async () => {
      const config = await loadConfigForYear(new Date().getFullYear()); // Use current year as default
      if (config) {
        setFooterConfig(config.generalConfig);
        setStylingConfig(config.stylingConfig);
      }
    };
    
    loadConfigs();
  }, []);

  if (!footerConfig || !stylingConfig) {
    return null; // Render nothing until config is loaded
  }

  return (
    <AnimatedPage>
      <main>
        <section style={{ backgroundColor: stylingConfig.CONFIG_STYLING_FOOTER_BACKGROUND_COLOR }} className="section-footer">
          <div className="section-footer-container">
            <h4 style={{ color: stylingConfig.CONFIG_STYLING_FOOTER_TEXT_COLOR, borderColor: stylingConfig.CONFIG_STYLING_FOOTER_SECTION_DIVIDER_COLOR }} className="bottomLine">CONTACT US</h4>
            <div style={{ color: stylingConfig.CONFIG_STYLING_FOOTER_TEXT_COLOR, borderColor: stylingConfig.CONFIG_STYLING_FOOTER_SECTION_DIVIDER_COLOR }} className="contactInfo">
              <p>{footerConfig.CONFIG_GENERAL_CONTACT_FOOTER_LOCATION_STRING}</p>
              <p>{footerConfig.CONFIG_GENERAL_CONTACT_FOOTER_PHONE_STRING}</p>
              <p>{footerConfig.CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING}</p>
            </div>
            <div style={{ color: stylingConfig.CONFIG_STYLING_FOOTER_TEXT_COLOR }} className="copyrightInfoContainer">
              <div className="copyrightTextLeft">
                <p>Note: All content is preliminary. Official results are certified by the tournament committee.</p>
                <p><span>&copy;</span>{footerConfig.CONFIG_GENERAL_CONTACT_FOOTER_COMPANY_COPYRIGHT_STRING}</p>
              </div>
              <div className="copyrightTextRight">
                <BackToTopButton />
              </div>
            </div>
          </div>
        </section>
      </main>
    </AnimatedPage>
  );
}

export default Footer;

