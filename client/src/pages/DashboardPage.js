import React from 'react';
import AnimatedPage from './AnimatedPage';
import Footer from '../components/Footer';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import TournamentCard from '../components/dashboard/TournamentCard';
import PlaceholderCard from '../components/dashboard/PlaceholderCard';
import './BasePage.css';
import './DashboardPage.css';

import {
  CONFIG_STYLING_BANNER_BACKGROUND_COLOR,
  CONFIG_STYLING_BANNER_TEXT_COLOR,
  CONFIG_STYLING_SECTION_BACKGROUND_COLOR,
  CONFIG_STYLING_SECTION_TEXT_COLOR,
  CONFIG_STYLING_H2_COLOR,
} from '../config/stylingConfig';

import {
  CONFIG_DASHBOARD_UPCOMING_AND_ACTIVE_TOURNAMENT_DATA,
  CONFIG_DASHBOARD_PAST_TOURNAMENT_DATA,
} from '../config/dashboardConfig';

function DashboardPage() {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Mobile: screen size smaller than 'sm'
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Tablet: screen size between 'sm' and 'md'
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // Desktop: screen size larger than 'md'

  let cardWidth;
  let cardHeight;
  let itemsPerRow;
  if (isMobile) {
    cardWidth = "100%";
    cardHeight = "575px";
    itemsPerRow = 1;
  } else if (isTablet) {
    cardWidth = "50%";
    cardHeight = "600px";
    itemsPerRow = 3;
  } else if (isDesktop) {
    cardWidth = "25%";
    cardHeight = "575px";
    itemsPerRow = 4;
  }

  // Splits the tournament data into rows of cards
  const createRows = (data) => {
    const rows = [];
    for (let i = 0; i < data.length; i += itemsPerRow) {
      rows.push(data.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  return (
    <AnimatedPage>
      <main>
        {/* BANNER */}
        <section style={{ backgroundColor: CONFIG_STYLING_BANNER_BACKGROUND_COLOR }} className="section-banner">
          <h1 style={{ color: CONFIG_STYLING_BANNER_TEXT_COLOR }}>Dashboard</h1>
        </section>

        {/* CONTENT */}
        <section style={{ backgroundColor: CONFIG_STYLING_SECTION_BACKGROUND_COLOR, color: CONFIG_STYLING_SECTION_TEXT_COLOR }} className="section-contact">
          
          {/* UPCOMING AND ACTIVE TOURNAMENTS */}
          <h2 style={{ color: CONFIG_STYLING_H2_COLOR }}>Upcoming and Active Tournaments</h2>
          <br/>
          <div className='dashboard-container'>
            {createRows(CONFIG_DASHBOARD_UPCOMING_AND_ACTIVE_TOURNAMENT_DATA).map((row, rowIndex) => (
              <div key={rowIndex} className='dashboard-container-row'>
                {row.map((tournament, index) => (
                  <TournamentCard
                    key={index}
                    tournament={tournament}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                  />
                ))}
                {/* Add Placeholder Cards if the row is not full */}
                {Array.from({ length: itemsPerRow - row.length }).map((_, idx) => (
                  <PlaceholderCard
                    key={`placeholder-${idx}`}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                  />
                ))}
              </div>
            ))}
          </div>

          <br/>
          <br/>
          <br/>

          {/* PAST TOURNAMENTS */}
          <h2 style={{ color: CONFIG_STYLING_H2_COLOR }}>Past Tournaments</h2>
          <br/>
          <div className='dashboard-container'>
            {createRows(CONFIG_DASHBOARD_PAST_TOURNAMENT_DATA).map((row, rowIndex) => (
              <div key={rowIndex} className='dashboard-container-row'>
                {row.map((tournament, index) => (
                  <TournamentCard
                    key={index}
                    tournament={tournament}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                  />
                ))}
                {/* Add Placeholder Cards if the row is not full */}
                {Array.from({ length: itemsPerRow - row.length }).map((_, idx) => (
                  <PlaceholderCard
                    key={`placeholder-${idx}`}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                  />
                ))}
              </div>
            ))}
          </div>

        </section>

        {/* FOOTER */}
        <Footer />

      </main>
    </AnimatedPage>
  );
}

export default DashboardPage;

