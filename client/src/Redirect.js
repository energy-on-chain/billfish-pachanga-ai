import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { loadConfigForYear } from './config/masterConfig';

function Redirect() {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(null);

  useEffect(() => {
    const getCurrentYearAndRedirect = async () => {
      const currentYear = new Date().getFullYear(); // Default to the current year
      const config = await loadConfigForYear(currentYear);

      // Set the year based on config or default to the current year
      if (config && config.generalConfig) {
        setCurrentYear(config.generalConfig.CONFIG_GENERAL_YEAR || currentYear);
      } else {
        setCurrentYear(currentYear);
      }
    };

    getCurrentYearAndRedirect();
  }, []);

  useEffect(() => {
    // When currentYear is set, redirect to the current year
    if (currentYear) {
      navigate(`/${currentYear}/home`, { replace: true });  // Redirect to /{year}/home
    }
  }, [currentYear, navigate]);

  return null;  // Nothing to display, just handles redirection
}

export default Redirect;

