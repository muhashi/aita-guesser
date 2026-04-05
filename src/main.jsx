import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core';
import App from './App.jsx'
import '@mantine/core/styles.css';

const theme = createTheme({
    fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.2rem',
    xl: '1.5rem',
  },
});

createRoot(document.getElementById('root')).render(
    <MantineProvider theme={theme} defaultColorScheme="auto">
        <App />
    </MantineProvider>
)
