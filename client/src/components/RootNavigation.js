import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { 
  CONFIG_GENERAL_HAS_REGISTRATION, 
  CONFIG_GENERAL_HAS_ADMIN, 
  CONFIG_GENERAL_HAS_LEADERBOARD, 
  CONFIG_GENERAL_HAS_CATCHES, 
  CONFIG_GENERAL_HAS_POTS, 
  CONFIG_GENERAL_HAS_AUCTION, 
} from '../config';

import './RootNavigation.css';
import logo from '../images/NavBarLogo.png';

function RootNavigation(props) {
  const currentUser = JSON.parse(window.localStorage.getItem('user'));
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    function handleMenuClick(event) {
      if (menu.checked === true) {
        if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
          document.getElementById('menu').style.marginTop = '70px';
        } else {
          document.getElementById('menu').style.marginTop = '90px';
        }
      }
      if (event.target instanceof HTMLAnchorElement) {
        menu.checked = false;
        document.getElementById('menu').style.marginTop = '0px';
      }
    }

    function scrollFunction() {
      if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        document.getElementById('navbar').style.height = '70px';
        if (menu.checked === true) {
          document.getElementById('menu').style.marginTop = '70px';
        } else {
          document.getElementById('menu').style.marginTop = '0px';
        }
      } else {
        document.getElementById('navbar').style.height = '90px';
        if (menu.checked === true) {
          document.getElementById('menu').style.marginTop = '90px';
        } else {
          document.getElementById('menu').style.marginTop = '0px';
        }
      }
    }

    function resizeFunction() {
      if (window.matchMedia('(max-width: 950px)').matches) {
        if ((document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) && menu.checked === true) {
          document.getElementById('menu').style.marginTop = '90px';
        } else if (!(document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) && menu.checked === false) {
          document.getElementById('menu').style.marginTop = '90px';
        }
      } else {
        document.getElementById('menu').style.marginTop = '0px';
        menu.checked = false;
      }
    }

    var menu = document.getElementById('menu-toggle');
    document.addEventListener('click', handleMenuClick);
    window.onscroll = function () {
      scrollFunction();
    };
    window.onresize = function () {
      resizeFunction();
    };
  });

  return (
    <section id="navbar" className="top-nav">
      <div>
        <Link to="/" className="logo">
          <img src={logo} alt="error" />
        </Link>
      </div>

      <input id="menu-toggle" type="checkbox" />
      <label className="menu-button-container" htmlFor="menu-toggle">
        <div className="menu-button"></div>
      </label>

      <ul id="menu" className="menu">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Home
          </NavLink>
        </li>
        {CONFIG_GENERAL_HAS_LEADERBOARD && (
          <li>
            <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Leaderboard
            </NavLink>
          </li>
        )}
        {CONFIG_GENERAL_HAS_POTS && (
          <li>
            <NavLink to="/pots" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Pots
            </NavLink>
          </li>
        )}
        {CONFIG_GENERAL_HAS_CATCHES && (
          <li>
            <NavLink to="/catches" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Catches
            </NavLink>
          </li>
        )}
        {CONFIG_GENERAL_HAS_ADMIN && (
          <li>
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Admin
            </NavLink>
          </li>
        )}
        <li className="navButtonHamburgerToggle">
          <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Register
          </NavLink>
        </li>
        <div className="navButtonHamburgerToggle2">
          <li>
            {currentUser ? (
              <Link to="/register" onClick={props.handleLogout}>
                <button className="navButton">Logout</button>
              </Link>
            ) : (
              <Link to="/register">
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

