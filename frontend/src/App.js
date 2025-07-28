import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ApartmentTable from './components/ApartmentTable';
import LanguageSwitcher from './components/LanguageSwitcher';
import CurrentTime from './components/CurrentTime';
import ConnectionStatus from './components/ConnectionStatus';
import { SOCKET_EVENTS, APP_CONFIG } from './constants';
import { t } from './locales';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || APP_CONFIG.DEFAULT_BACKEND_URL;

function App() {
  const [apartments, setApartments] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setForceRender] = useState(0); // For forcing re-render on locale change

  // Listen for locale changes
  useEffect(() => {
    const handleLocaleChange = () => {
      setForceRender(prev => prev + 1);
    };

    window.addEventListener('localeChanged', handleLocaleChange);
    return () => window.removeEventListener('localeChanged', handleLocaleChange);
  }, []);

  useEffect(() => {
    // Establish Socket.IO connection
    const socket = io(BACKEND_URL);

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on(SOCKET_EVENTS.APARTMENT_UPDATE, (data) => {
      console.log('Received apartment update:', data);
      setApartments(data);
      setIsLoading(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      setIsLoading(false);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      {/* Left Banner */}
      <div className="left-banner"></div>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="top-status-bar">
          <div className="connection-status">
            <CurrentTime />
            <ConnectionStatus isConnected={isConnected} />
          </div>
          <LanguageSwitcher />
        </div>
        
        <header className="dashboard-header">
          <h1 className="dashboard-title">{t('dashboard.title')}</h1>
          <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
        </header>

        <main className="apartment-table-container">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              {t('common.loading')}
            </div>
          ) : (
            <ApartmentTable apartments={apartments} />
          )}
        </main>
      </div>
      
      {/* Right Banner */}
      <div className="right-banner"></div>
    </div>
  );
}

export default App;
