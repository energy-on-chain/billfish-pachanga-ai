import React, { useState, lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from "framer-motion";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import theme from './theme';

import RootLayout from "./layouts/RootLayout";
import ErrorPage from './pages/ErrorPage';
import Redirect from './Redirect';

// Lazy-loaded pages — each page is a separate chunk, loaded only when navigated to
const HomePage = lazy(() => import('./pages/HomePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RegisterSuccessPage = lazy(() => import('./pages/RegisterSuccessPage'));
const RegisterErrorPage = lazy(() => import('./pages/RegisterErrorPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewsfeedPage = lazy(() => import('./pages/NewsfeedPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const PotsPage = lazy(() => import('./pages/PotsPage'));

import './App.css';

const PageFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
    <CircularProgress sx={{ color: 'primary.main' }} />
  </Box>
);

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
      element: <Redirect />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/dashboard',
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        { path: '', element: <Suspense fallback={<PageFallback />}><DashboardPage /></Suspense> },
      ]
    },
    {
      path: '/:year',
      element: <RootLayout delayRefresh={delayRefresh} />,
      errorElement: <ErrorPage />,
      children: [
        { path: 'home', element: <Suspense fallback={<PageFallback />}><HomePage /></Suspense> },
        { path: 'register', element: <Suspense fallback={<PageFallback />}><RegisterPage delayRefresh={delayRefresh} /></Suspense> },
        { path: 'registration_success', element: <Suspense fallback={<PageFallback />}><RegisterSuccessPage /></Suspense> },
        { path: 'registration_error', element: <Suspense fallback={<PageFallback />}><RegisterErrorPage /></Suspense> },
        { path: 'admin', element: <Suspense fallback={<PageFallback />}><AdminPage /></Suspense> },
        { path: 'newsfeed', element: <Suspense fallback={<PageFallback />}><NewsfeedPage /></Suspense> },
        { path: 'leaderboard', element: <Suspense fallback={<PageFallback />}><LeaderboardPage /></Suspense> },
        { path: 'pots', element: <Suspense fallback={<PageFallback />}><PotsPage /></Suspense> },
      ],
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence>
        <RouterProvider router={router} />
        <ToastContainer />
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
