import { CircularProgress, Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RootNavigation from "../components/RootNavigation";
import { loadConfigForYear } from '../config/masterConfig';

function ErrorPage() {
  const { year } = useParams();
  const [configs, setConfigs] = useState(null);

  useEffect(() => {
    const loadConfigs = async () => {
      const config = await loadConfigForYear(year);
      if (config) {
        setConfigs(config);
      }
    };
    loadConfigs();
  }, [year]);

  if (!configs) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  const { CONFIG_STYLING_H2_COLOR, CONFIG_STYLING_P_COLOR } = configs.stylingConfig;

  return (
    <>
      <main>
        <br/>
        <br/>
        <h2 style={{color: CONFIG_STYLING_H2_COLOR}}>An error occurred!</h2>
        <p style={{color: CONFIG_STYLING_P_COLOR}}>Could not find this page :(</p>
        <p style={{color: CONFIG_STYLING_P_COLOR}}>Please refresh your browser.</p>
      </main>
    </>
  );
}

export default ErrorPage;

