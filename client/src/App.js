import React, {useState} from "react";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {AnimatePresence} from "framer-motion";

import RootLayout from "./layouts/RootLayout";
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import RegisterSuccessPage from "./pages/RegisterSuccessPage";
import RegisterErrorPage from "./pages/RegisterErrorPage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import NewsfeedPage from "./pages/NewsfeedPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PotsPage from "./pages/PotsPage";
// import AuctionPage from "./pages/AuctionPage";


import './App.css';

function App() {

  const [loading, setLoading] = useState(false);

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2500);
  }

  const router = createBrowserRouter([
    {
      path: '/', 
      element: <RootLayout delayRefresh={delayRefresh} />, 
      errorElement: <ErrorPage/>,
      children: [
        { path: '/', element: <HomePage/> },
        { path: '/register', element: <RegisterPage delayRefresh={delayRefresh} /> },   
        { path: '/registration_success', element: <RegisterSuccessPage /> },   
        { path: '/registration_error', element: <RegisterErrorPage /> },   
        { path: '/admin', element: <AdminPage/> },    
        { path: '/dashboard', element: <DashboardPage/> },    
        { path: '/newsfeed', element: <NewsfeedPage/> },    
        { path: '/leaderboard', element: <LeaderboardPage/> },    
        { path: '/pots', element: <PotsPage/> },    
        // { path: '/auction', element: <AuctionPage/> },    
      ],
    },
  ]);

  return (
    <>
      <AnimatePresence>
        <RouterProvider router={router} />
        <ToastContainer />
      </AnimatePresence>
    </>
  )  
}

export default App;

