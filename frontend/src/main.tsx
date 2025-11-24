import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider, CssBaseline} from '@mui/material';
import theme from './theme/theme';
import App from './App.tsx';
import {AuthProvider} from './providers/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StrictMode>
    </ThemeProvider>,
);

