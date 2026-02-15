import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/themeContext'
import { NotificationProvider } from './context/NotificationContext'
import './index.css'
import App from './App.tsx'
import React from 'react'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
