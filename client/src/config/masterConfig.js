/////////////////////////////////////////////////////////////////////////////
// MASTER SETTINGS //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

export const loadConfigForYear = async (year) => {
  try {
    if (!year) {
      console.error("Year is undefined, cannot load config.");
      return null;
    }
    // Load dynamic resources
    const adminConfig = await import(`./config${year}/adminConfig.js`);
    const catchConfig = await import(`./config${year}/catchConfig.js`);
    const generalConfig = await import(`./config${year}/generalConfig.js`);
    const homeConfig = await import(`./config${year}/homeConfig.js`);
    const leaderboardConfig = await import(`./config${year}/leaderboardConfig.js`);
    const newsfeedConfig = await import(`./config${year}/newsfeedConfig.js`);
    const registrationConfig = await import(`./config${year}/registrationConfig.js`);
    const potsConfig = await import(`./config${year}/potsConfig.js`);
    const stylingConfig = await import(`./config${year}/stylingConfig.js`);

    // Load remaining static resources
    const imagesPath = `../images/`;
    const defaultNoImage = `${imagesPath}defaultNoImage.png`;
    const logoDesktop = `${imagesPath}HomePageLogoDesktop.png`;
    const logoTablet = `${imagesPath}HomePageLogoTablet.png`;
    const logoMobile = `${imagesPath}HomePageLogoMobile.png`;
    const logoNavBar = `${imagesPath}NavBarLogo.png`;
    const dashboardConfig = await import(`./dashboardConfig.js`);

    return {
      adminConfig: adminConfig.default,
      catchConfig: catchConfig.default,
      generalConfig: generalConfig.default,
      homeConfig: homeConfig.default,
      leaderboardConfig: leaderboardConfig.default,
      newsfeedConfig: newsfeedConfig.default,
      registrationConfig: registrationConfig.default,
      potsConfig: potsConfig.default,
      stylingConfig: stylingConfig.default,
      dashboardConfig: dashboardConfig.default, // Load the dashboardConfig for the specific year
      images: {
        defaultNoImage,
        logoDesktop,
        logoTablet,
        logoMobile,
        logoNavBar,
      }
    };
  } catch (error) {
    console.error(`Error loading config for year ${year}:`, error);
    return null;
  }
};

