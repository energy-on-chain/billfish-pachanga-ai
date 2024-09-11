import React, {useState, useEffect} from 'react';

import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';

import { 
  CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING,
} from '../config/generalConfig';

import './HomePage.css';
import "./RegisterPage.css";

function RegisterErrorPage(props) {   

  return (
    <AnimatedPage>
      <main>
      <section className="section-banner">
          <h1>Regsitration Error</h1>
        </section>
        <section className="section-hero2">
          <br/>
          <p><strong>An error occurred during the registration process.</strong></p>
          <br/>
          <p>Your card has not been charged. Please try again or contact the site administrators listed below for assistance.</p>
          <br/>
          <p><strong>({CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING})</strong></p>
        </section>
      </main>
    </AnimatedPage>
  );
}

export default RegisterErrorPage;

