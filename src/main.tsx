import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouter } from './routes/AppRoutes.tsx';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgba(48, 163, 220, 1)',
    },
    secondary: {
      main: 'rgba(249, 53, 232, 1)',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <AppRouter />
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
