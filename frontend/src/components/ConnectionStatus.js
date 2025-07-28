import React from 'react';
import { t } from '../locales';

const ConnectionStatus = ({ isConnected }) => {
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem', 
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'monospace',
      fontWeight: '500'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isConnected ? '#4CAF50' : '#F44336',
        boxShadow: isConnected ? '0 0 6px #4CAF50' : '0 0 6px #F44336'
      }}></div>
      <span>
        {isConnected ? t('common.connected') : t('common.disconnected')}
      </span>
    </div>
  );
};

export default ConnectionStatus;
