import AnimatedPage from '../pages/AnimatedPage';
import BackToTopButton from './buttons/BackToTopButton';

import { 
  CONFIG_GENERAL_CONTACT_FOOTER_LOCATION_STRING,
  CONFIG_GENERAL_CONTACT_FOOTER_PHONE_STRING,
  CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING,
  CONFIG_GENERAL_CONTACT_FOOTER_COMPANY_COPYRIGHT_STRING,
} from '../config/generalConfig';

import './Footer.css';

function Footer() {
  return (
    <AnimatedPage>
      <main>
        <section className="section-footer">
          <div className="section-footer-container">
            <h4 className="bottomLine">CONTACT US</h4>
            <div className="contactInfo">
              <p>{CONFIG_GENERAL_CONTACT_FOOTER_LOCATION_STRING}</p>
              <p>{CONFIG_GENERAL_CONTACT_FOOTER_PHONE_STRING}</p>
              <p>{CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING}</p>
            </div>
            <div className="copyrightInfoContainer">
              <div className="copyrightTextLeft">
                <p>Note: All content is preliminary. Official results are certified by the tournament committee.</p>
                <p><span>&copy;</span>{CONFIG_GENERAL_CONTACT_FOOTER_COMPANY_COPYRIGHT_STRING}</p>
              </div>
              <div className="copyrightTextRight">
                <BackToTopButton/>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AnimatedPage>
  );
}

export default Footer;

