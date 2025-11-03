import { createTheme } from '@mui/material/styles';

// Neon violet-blue palette
const lightPalette = {
  primary: {
    main: '#6C4BFF',
    light: '#8A7BFF',
    dark: '#4C6BFF',
  },
  secondary: {
    main: '#00B0FF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
  },
  text: {
    primary: '#0B1330',
    secondary: '#6C757D',
  },
};

const darkPalette = {
  primary: {
    main: '#8A7BFF',
    light: '#9B8BFF',
    dark: '#5B3BFF',
  },
  secondary: {
    main: '#00B0FF',
  },
  background: {
    default: '#0B1220',
    paper: '#1A1F2E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B7C3',
  },
};

const getThemeOptions = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark' ? darkPalette : lightPalette),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(108,75,255,0.15)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(108,75,255,0.25)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? darkPalette.background.paper : lightPalette.background.paper,
          borderRight: `1px solid ${mode === 'dark' ? darkPalette.primary.main : lightPalette.primary.main}`,
          boxShadow: mode === 'dark'
            ? '0 0 20px rgba(138,123,255,0.1)'
            : '0 0 20px rgba(108,75,255,0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? darkPalette.primary.main : lightPalette.primary.main,
            color: mode === 'dark' ? darkPalette.text.primary : lightPalette.background.default,
            boxShadow: mode === 'dark'
              ? '0 4px 14px rgba(138,123,255,0.3)'
              : '0 4px 14px rgba(108,75,255,0.3)',
            '&:hover': {
              backgroundColor: mode === 'dark' ? darkPalette.primary.dark : lightPalette.primary.dark,
              boxShadow: mode === 'dark'
                ? '0 6px 20px rgba(91,59,255,0.4)'
                : '0 6px 20px rgba(76,107,255,0.4)',
            },
          },
          '&:hover': {
            backgroundColor: mode === 'dark'
              ? 'rgba(138,123,255,0.1)'
              : 'rgba(108,75,255,0.1)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: mode === 'dark' ? darkPalette.primary.main : lightPalette.primary.main,
              boxShadow: mode === 'dark'
                ? '0 6px 26px rgba(138,123,255,0.12)'
                : '0 6px 26px rgba(76,107,255,0.12)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: mode === 'dark' ? darkPalette.primary.main : lightPalette.primary.main,
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: mode === 'dark' ? darkPalette.primary.main : lightPalette.primary.main,
          },
        },
      },
    },
  },
  transitions: {
    duration: {
      enteringScreen: 400,
      leavingScreen: 400,
    },
  },
});

export const createAppTheme = (mode) => createTheme(getThemeOptions(mode));

export default createAppTheme;
