import React, { useState, useEffect } from 'react';

const CurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update every second using local time
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ 
      fontSize: '0.9rem', 
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'monospace',
      fontWeight: '500'
    }}>
      {currentTime.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })}
    </div>
  );
};

export default CurrentTime;
