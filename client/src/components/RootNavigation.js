import React, { useState, useEffect } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import { loadConfigForYear } from '../config/masterConfig';
import './RootNavigation.css';
import logo from '../images/NavBarLogo.png';

function RootNavigation(props) {
  // Get the year from URL params if available
  const { year: yearFromParams } = useParams();
  // Get query params
  const [searchParams] = useSearchParams();
  // Get the year from the query params
  const yearFromSearch = searchParams.get('year');
  // Use year from URL params if available, otherwise fallback to query params or current year
  const year = yearFromParams || yearFromSearch || null; // Initially null, so we can wait for the year to be available

  const currentUser = JSON.parse(window.localStorage.getItem('user'));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 950);
  const [config, setConfig] = useState(null); // Initially null, so we can show loading state
  const [stylingConfig, setStylingConfig] = useState(null); // Initially null

  useEffect(() => {
    if (year) { // Only call loadConfigForYear if the year is defined
      const loadConfigs = async () => {
        const loadedConfig = await loadConfigForYear(year); // Dynamically load config for the given year
        if (loadedConfig) {
          setConfig(loadedConfig.generalConfig || {});
          setStylingConfig(loadedConfig.stylingConfig || {});
        }
      };
      loadConfigs();
    }
  }, [year]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 950);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const menu = document.getElementById('menu-toggle');
  
    function handleMenuClick(event) {
      if (menu && menu.checked === true) {  // Ensure menu exists
        if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
          document.getElementById("menu").style.marginTop = "70px";
        } else {
          document.getElementById("menu").style.marginTop = "90px";
        }
      }
      if (menu && event.target instanceof HTMLAnchorElement) {  // Ensure menu exists
        menu.checked = false;
        document.getElementById("menu").style.marginTop = "0px";
      }
    }
  
    function scrollFunction() {
      if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        document.getElementById("navbar").style.height = "70px";
        if (menu && menu.checked === true) {  // Ensure menu exists
          document.getElementById("menu").style.marginTop = "70px";
        } else {
          document.getElementById("menu").style.marginTop = "0px";
        }
      } else {
        document.getElementById("navbar").style.height = "90px";
        if (menu && menu.checked === true) {  // Ensure menu exists
          document.getElementById("menu").style.marginTop = "90px";
        } else {
          document.getElementById("menu").style.marginTop = "0px";
        }
      }
    }
  
    function resizeFunction() {
      if (window.matchMedia("(max-width: 950px)").matches) {
        if ((document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) && menu && menu.checked === true) {
          document.getElementById("menu").style.marginTop = "90px";
        } else if (!(document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) && menu && menu.checked === false) {
          document.getElementById("menu").style.marginTop = "90px";
        }
      } else {
        if (menu) {
          document.getElementById("menu").style.marginTop = "0px";
          menu.checked = false;
        }
      }
    }
  
    document.addEventListener('click', handleMenuClick);
    window.onscroll = scrollFunction;
    window.onresize = resizeFunction;
  
    return () => {
      document.removeEventListener('click', handleMenuClick); // Cleanup event listener
      window.onscroll = null; // Cleanup scroll event listener
      window.onresize = null; // Cleanup resize event listener
    };
  }, []);  

  // Prevent rendering until configs are loaded
  if (!year || !config || !stylingConfig) {
    return <div>Loading...</div>; // Show a loading state while configs are being fetched
  }

  return (
    <section id="navbar" className="top-nav" style={{ backgroundColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR || '#000' }}>
      <div>
        <Link to={`/${year}/home`} className="logo">
          <img src={logo} alt="error" />
        </Link>   
      </div>
          
      <input id="menu-toggle" type="checkbox" />
      <label className='menu-button-container' htmlFor="menu-toggle">
        <div className='menu-button'></div>
      </label>
      
      <ul id="menu" className="menu">

        {/* HOME */}
        <li style={{ backgroundColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR, borderColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR }}>
          <NavLink to={`/${year}/home`} className={({ isActive }) => isActive ? "active" : undefined} style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}>Home</NavLink>
        </li>

        {/* INFO LINKS */}
        {config.CONFIG_GENERAL_HAS_INFO && !isMobile && (
          <div className="dropdown">
            <button className="dropbtn">Info <i className="fa fa-caret-down nav-icon"></i></button>
            <div className="dropdown-content">
              {Object.entries(config.CONFIG_GENERAL_INFO_LINK_OBJECT || {}).map(([label, url]) => (
                <a key={label} href={url} target="_blank" style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}>{label}</a>
              ))}
            </div>
          </div>
        )}
        {config.CONFIG_GENERAL_HAS_INFO && isMobile && (
          Object.entries(config.CONFIG_GENERAL_INFO_LINK_OBJECT || {}).map(([label, url]) => (
            <li key={label} style={{ backgroundColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR, borderColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR }}>
              <a href={url} target="_blank" style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}>{label}</a>
            </li>
          ))
        )}

        {/* TOURNAMENT LINKS */}
        {!isMobile && (
          <div className="dropdown">
            <button className="dropbtn">Tournament <i className="fa fa-caret-down nav-icon"></i></button>
            <div className="dropdown-content">
              {Object.entries(config.CONFIG_GENERAL_TOURNAMENT_LINK_OBJECT || {}).map(([label, url]) => (
                <li key={label}>
                  <NavLink to={url} className={({ isActive }) => isActive ? "active" : undefined} style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}>{label}</NavLink>
                </li>
              ))}
            </div>
          </div>
        )}
        {isMobile && (
          Object.entries(config.CONFIG_GENERAL_TOURNAMENT_LINK_OBJECT || {}).map(([label, url]) => (
            <li key={label} style={{ backgroundColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR, borderColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR }}>
              <NavLink to={url} className={({ isActive }) => isActive ? "active" : undefined} style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}>{label}</NavLink>
            </li>
          ))
        )}

        {/* ADMIN LINKS */}
        {config.CONFIG_GENERAL_HAS_ADMIN && !isMobile && (
          <div className="dropdown">
            <button className="dropbtn">Admin <i className="fa fa-caret-down nav-icon"></i></button>
            <div className="dropdown-content">
              {Object.entries(config.CONFIG_GENERAL_ADMIN_LINK_OBJECT || {}).map(([label, url]) => (
                <li key={label}>
                  {label === 'Dashboard' ? (
                    // If label is 'Dashboard', append the year as a query parameter
                    <NavLink
                      to={`${url}?year=${year}`}
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                      style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}
                    >
                      {label}
                    </NavLink>
                  ) : (
                    // Otherwise, render the regular NavLink
                    <NavLink
                      to={url}
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                      style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}
                    >
                      {label}
                    </NavLink>
                  )}
                </li>
              ))}
            </div>
          </div>
        )}
        {config.CONFIG_GENERAL_HAS_ADMIN && isMobile && (
          Object.entries(config.CONFIG_GENERAL_ADMIN_LINK_OBJECT || {}).map(([label, url]) => (
            <li key={label} style={{ backgroundColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR, borderColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR }}>
              {label === 'Dashboard' ? (
                // If label is 'Dashboard', append the year as a query parameter for mobile
                <NavLink
                  to={`${url}?year=${year}`}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                  style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}
                >
                  {label}
                </NavLink>
              ) : (
                // Otherwise, render the regular NavLink
                <NavLink
                  to={url}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                  style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}
                >
                  {label}
                </NavLink>
              )}
            </li>
          ))
        )}

        {/* REGISTRATION LINKS */}
        {config.CONFIG_GENERAL_HAS_REGISTRATION && (
          <li className="navButtonHamburgerToggle" style={{ backgroundColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR, borderColor: stylingConfig.CONFIG_STYLING_NAVBAR_BACKGROUND_COLOR }}>
            <NavLink to={`/${year}/register`} className={({ isActive }) => isActive ? "active" : undefined} style={{ color: stylingConfig.CONFIG_STYLING_NAVBAR_TEXT_COLOR }}>Register</NavLink>
          </li>
        )}
        <div className="navButtonHamburgerToggle2">
          <li>
            {(currentUser === undefined || currentUser === null) ? (
              <Link to={`/${year}/register`}>
                <button className="navButton">Register</button>
              </Link>
            ) : (
              <Link to={`/${year}/register`} onClick={props.handleLogout}>
                <button className="navButton">Register</button>
              </Link>
            )}
          </li>
        </div>

      </ul>
    </section>
  );
}

export default RootNavigation;

