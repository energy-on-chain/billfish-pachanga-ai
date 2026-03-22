import { createTheme } from '@mui/material/styles';

// Brand palette derived from stylingConfig.js
// Primary:   #288DAF (ocean blue — banner, tables, hero)
// Secondary: #004B8C (navy — headings, text accents)
// Success:   #00A686 (teal — buttons, CTAs)

const theme = createTheme({
  palette: {
    primary: {
      main: '#288DAF',
      dark: '#1a6b8a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#004B8C',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00A686',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#222222',
      secondary: '#004B8C',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { color: '#ffffff', fontWeight: 700 },
    h2: { color: '#004B8C', fontWeight: 600 },
    h3: { color: '#004B8C', fontWeight: 600 },
    h4: { color: '#004B8C', fontWeight: 600 },
    body1: { color: '#222222' },
    body2: { color: '#222222' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#00A686',
          '&:hover': { backgroundColor: '#008c70' },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        columnHeaders: {
          backgroundColor: '#288DAF',
          color: '#ffffff',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': { color: '#288DAF' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#288DAF' },
      },
    },
  },
});

export default theme;
