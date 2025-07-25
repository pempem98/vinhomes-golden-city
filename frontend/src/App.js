import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ApartmentTable from './components/ApartmentTable';
import { SOCKET_EVENTS, APP_CONFIG } from './constants';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || APP_CONFIG.DEFAULT_BACKEND_URL;

function App() {
  const [apartments, setApartments] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <header className="dashboard-header">
        <h1 className="dashboard-title">Real-Time Apartment Dashboard</h1>
        <p className="dashboard-subtitle">Live updates from Google Sheets</p>
      </header>

      <main className="apartment-table-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            Loading data...
          </div>
        ) : (
          <ApartmentTable apartments={apartments} />
        )}
      </main>
    </div>
  );
}

export default App;
