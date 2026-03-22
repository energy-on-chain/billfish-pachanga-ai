import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { loadConfigForYear } from '../../config/masterConfig';
import '../../pages/DashboardPage.css';

function TournamentCard({ tournament, cardWidth, cardHeight }) {
  // Get the year from URL params if available
  const { year: yearFromParams } = useParams();
  // Get query params
  const [searchParams] = useSearchParams();
  // Get the year from the query params
  const yearFromSearch = searchParams.get('year');
  // Use year from URL params if available, otherwise fallback to query params or current year
  const year = yearFromParams || yearFromSearch || new Date().getFullYear();
  const [configs, setConfigs] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [apiUrl, setApiUrl] = useState();

  useEffect(() => {
    if (year) {
      const loadConfigs = async () => {
        const config = await loadConfigForYear(year);
        if (config) {
          setConfigs(config);
          
          // Attempt to require the image based on the logo path
          try {
            const image = require(`${tournament.logo}`);
            setLogoImage(image);
          } catch (err) {
            console.error(`Failed to load image at path: ${tournament.logo}`, err);
            setLogoImage(null); // Fallback in case the image is not found
          }
        }
      };
      loadConfigs();
    };

    // Define api
    const apiUrl = import.meta.env.VITE_NODE_ENV === "staging"
      ? import.meta.env.VITE_SERVER_URL_STAGING
      : import.meta.env.VITE_SERVER_URL_PRODUCTION;

  }, [year]);

  if (!configs) {
    return null; // Don't render anything until the config is loaded
  }

  const { CONFIG_STYLING_DASHBOARD_TITLE_TEXT_COLOR } = configs.stylingConfig;

  return (
    <div
      className='dashboard-card-container'
      style={{ width: cardWidth, height: cardHeight }}
    >
      <div className='dashboard-card-container-row'>
        {logoImage && (
          <img
            src={logoImage}
            alt={tournament.title}
            style={{ width: '80%', height: '140px', objectFit: 'contain', margin: '0 auto', paddingBottom: '5px' }}
          />
        )}
        {tournament.title && <h3 style={{ paddingTop: '15px', paddingBottom: '15px', color: CONFIG_STYLING_DASHBOARD_TITLE_TEXT_COLOR }}>{tournament.title}</h3>}
        {tournament.dates && <h4 style={{ paddingBottom: '5px', color: CONFIG_STYLING_DASHBOARD_TITLE_TEXT_COLOR }}>{tournament.dates}</h4>}
        {tournament.home && <Button fullWidth variant="contained" href={`${tournament.home}`} >Home</Button>}
        {tournament.register && <Button fullWidth variant="contained" href={`${tournament.register}`} >Register</Button>}
        {tournament.leaderboard && <Button fullWidth variant="contained" href={`${tournament.leaderboard}`} >Leaderboard</Button>}
        {tournament.pots && <Button fullWidth variant="contained" href={`${tournament.pots}`} >Pots</Button>}
        {tournament.newsfeed && <Button fullWidth variant="contained" href={`${tournament.newsfeed}`} >Newsfeed</Button>}
        {tournament.auction && <Button fullWidth variant="contained" href={`${tournament.auction}`} >Auction</Button>}
        {tournament.admin && <Button fullWidth variant="contained" href={`${tournament.admin}`} >Admin</Button>}
      </div>
    </div>
  );
}

export default TournamentCard;

