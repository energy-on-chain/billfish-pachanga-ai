import React from 'react';
import { Button } from '@mui/material';
import '../../pages/DashboardPage.css';

function TournamentCard({ tournament, cardWidth, cardHeight }) {
  // Attempt to require the image based on the logo path
  let logoImage;
  try {
    logoImage = require(`${tournament.logo}`); 
  } catch (err) {
    console.error(`Failed to load image at path: ${tournament.logo}`, err);
    logoImage = null; // Fallback in case the image is not found
  }

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
            style={{ width: '80%', height: '140px', objectFit: 'contain', margin: '0 auto', paddingBottom: '5px'}}
          />
        )}
        {tournament.title && <h3 style={{ paddingTop: '15px', paddingBottom: '15px' }}>{tournament.title}</h3>}
        {tournament.dates && <h4 style={{ paddingBottom: '5px' }}>{tournament.dates}</h4>}
        {tournament.home && <Button fullWidth variant="contained" href={tournament.home} target="_blank">Home</Button>}
        {tournament.register && <Button fullWidth variant="contained" href={tournament.register} target="_blank">Register</Button>}
        {tournament.leaderboard && <Button fullWidth variant="contained" href={tournament.leaderboard} target="_blank">Leaderboard</Button>}
        {tournament.pots && <Button fullWidth variant="contained" href={tournament.pots} target="_blank">Pots</Button>}
        {tournament.newsfeed && <Button fullWidth variant="contained" href={tournament.newsfeed} target="_blank">Newsfeed</Button>}
        {tournament.auction && <Button fullWidth variant="contained" href={tournament.auction} target="_blank">Auction</Button>}
        {tournament.admin && <Button fullWidth variant="contained" href={tournament.admin} target="_blank">Admin</Button>}
      </div>
    </div>
  );
}

export default TournamentCard;
