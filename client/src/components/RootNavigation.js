import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { 
  CONFIG_GENERAL_HAS_INFO, 
  CONFIG_GENERAL_TOURNAMENT_LINK_OBJECT,
  CONFIG_GENERAL_INFO_LINK_OBJECT,
  CONFIG_GENERAL_HAS_REGISTRATION, 
  CONFIG_GENERAL_HAS_ADMIN, 
} from '../config/generalConfig';

import './RootNavigation.css';
import logo from '../images/NavBarLogo.png';

function RootNavigation(props) {
  const currentUser = JSON.parse(window.localStorage.getItem('user'));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 950);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 950);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const menu = document.getElementById('menu-toggle');

    function handleMenuClick(event) {
      if (menu.checked === true) {
        if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
          document.getElementById("menu").style.marginTop = "70px";
        } else {
          document.getElementById("menu").style.marginTop = "90px";
        }
      }
      if (event.target instanceof HTMLAnchorElement) {
        menu.checked = false;
        document.getElementById("menu").style.marginTop = "0px";
      }
    }

    function scrollFunction() {
      if ((document.body.scrollTop > 0 || document.documentElement.scrollTop > 0)) {
        document.getElementById("navbar").style.height = "70px";
        if (menu.checked === true) {
          document.getElementById("menu").style.marginTop = "70px";
        } else {
          document.getElementById("menu").style.marginTop = "0px";
        }
      } else {
        document.getElementById("navbar").style.height = "90px";
        if (menu.checked === true) {
          document.getElementById("menu").style.marginTop = "90px";
        } else {
          document.getElementById("menu").style.marginTop = "0px";
        }
      }
    }

    function resizeFunction() {
      if (window.matchMedia("(max-width: 950px)").matches) {
        if ((document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) && menu.checked === true) {
          document.getElementById("menu").style.marginTop = "90px";
        } else if (!(document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) && menu.checked === false) {
          document.getElementById("menu").style.marginTop = "90px";
        }
      } else {
        document.getElementById("menu").style.marginTop = "0px";
        menu.checked = false;
      }
    }

    document.addEventListener('click', handleMenuClick);
    window.onscroll = scrollFunction;
    window.onresize = resizeFunction;
  }, []);

  return (
    <section id="navbar" className="top-nav">
      <div>
        <Link to="/" className="logo">
          <img src={logo} alt="error"/>
        </Link>   
      </div>
          
      <input id="menu-toggle" type="checkbox"/>
      <label className='menu-button-container' htmlFor="menu-toggle">
        <div className='menu-button'></div>
      </label>
      
      <ul id="menu" className="menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : undefined}>Home</NavLink>
        </li>

        {CONFIG_GENERAL_HAS_INFO && !isMobile && (
          <div className="dropdown">
            <button className="dropbtn">Info <i className="fa fa-caret-down nav-icon"></i></button>
            <div className="dropdown-content">
              {Object.entries(CONFIG_GENERAL_INFO_LINK_OBJECT).map(([label, url]) => (
                <a key={label} href={url} target="_blank">{label}</a>
              ))}
            </div>
          </div>
        )}
        {CONFIG_GENERAL_HAS_INFO && isMobile && (
          Object.entries(CONFIG_GENERAL_INFO_LINK_OBJECT).map(([label, url]) => (
            <li key={label}>
              <a href={url} target="_blank">{label}</a>
            </li>
          ))
        )}

        {!isMobile && (
          <div className="dropdown">
            <button className="dropbtn">Tournament <i className="fa fa-caret-down nav-icon"></i></button>
            <div className="dropdown-content">
              {Object.entries(CONFIG_GENERAL_TOURNAMENT_LINK_OBJECT).map(([label, url]) => (
                <li>
                  <NavLink to={url} className={({ isActive }) => isActive ? "active" : undefined}>{label}</NavLink>
                </li>
              ))}
            </div>
          </div>
        )}
        {isMobile && (
          Object.entries(CONFIG_GENERAL_TOURNAMENT_LINK_OBJECT).map(([label, url]) => (
            <li key={label}>
              <NavLink to={url} className={({ isActive }) => isActive ? "active" : undefined}>{label}</NavLink>
            </li>
          ))
        )}

        {CONFIG_GENERAL_HAS_ADMIN && (
          <li>
            <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : undefined}>Admin</NavLink>
          </li>
        )}

        {CONFIG_GENERAL_HAS_REGISTRATION && (
          <li className="navButtonHamburgerToggle">
            <NavLink to="/register" className={({ isActive }) => isActive ? "active" : undefined}>Register</NavLink>
          </li>
        )}
        <div className="navButtonHamburgerToggle2">
          <li>
            {(currentUser === undefined || currentUser === null) ? (
              <Link to="/register">
                <button className="navButton">Register</button>
              </Link>
            ) : (
              <Link to="/register" onClick={props.handleLogout}>
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

