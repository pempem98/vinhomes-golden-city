import React, { useState, useEffect } from 'react';
import ApartmentGrid from './ApartmentGrid';

const ApartmentTable = ({ apartments }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [animatingRows, setAnimatingRows] = useState(new Set());
  const [previousApartments, setPreviousApartments] = useState([]);
  const [bigSaleNotifications, setBigSaleNotifications] = useState([]);
  const [superAnimatingCells, setSuperAnimatingCells] = useState(new Set());
  
  const BIG_SALE_THRESHOLDS = {
    LEVEL_1: 7.5,  // Bronze level
    LEVEL_2: 10,   // Silver level  
    LEVEL_3: 15    // Gold level
  };

  const MAX_NOTIFICATIONS = 3; // Maximum notifications shown at once

  useEffect(() => {
    if (apartments.length > 0) {
      // Find newly updated apartments
      const newlyUpdated = apartments.filter(apartment => {
        const previous = previousApartments.find(p => p.id === apartment.id);
        return previous && new Date(apartment.updated_at) > new Date(previous.updated_at);
      });

      if (newlyUpdated.length > 0) {
        // Check for big sales with different levels
        const bigSales = newlyUpdated.filter(apartment => {
          const previous = previousApartments.find(p => p.id === apartment.id);
          return apartment.status === 'Đã bán' && 
                 previous?.status !== 'Đã bán' && 
                 typeof apartment.price === 'number' && 
                 apartment.price >= BIG_SALE_THRESHOLDS.LEVEL_1;
        });

        if (bigSales.length > 0) {
          // Categorize sales by level
          const level1Sales = bigSales.filter(apt => apt.price >= BIG_SALE_THRESHOLDS.LEVEL_1 && apt.price < BIG_SALE_THRESHOLDS.LEVEL_2);
          const level2Sales = bigSales.filter(apt => apt.price >= BIG_SALE_THRESHOLDS.LEVEL_2 && apt.price < BIG_SALE_THRESHOLDS.LEVEL_3);
          const level3Sales = bigSales.filter(apt => apt.price >= BIG_SALE_THRESHOLDS.LEVEL_3);

          // Create enhanced animation data with levels
          const enhancedBigSales = bigSales.map(apt => {
            let level = 1;
            let levelName = 'Bronze';
            let emoji = '🥉';
            
            if (apt.price >= BIG_SALE_THRESHOLDS.LEVEL_3) {
              level = 3;
              levelName = 'Gold';
              emoji = '🥇';
            } else if (apt.price >= BIG_SALE_THRESHOLDS.LEVEL_2) {
              level = 2;
              levelName = 'Silver';
              emoji = '🥈';
            }
            
            return { ...apt, level, levelName, emoji };
          });

          // Add super animation for big sales with level info
          const bigSaleIds = new Set(enhancedBigSales.map(apt => ({ id: apt.id, level: apt.level })));
          setSuperAnimatingCells(bigSaleIds);

          // Add notification messages with levels and staggered timing
          const notifications = enhancedBigSales.map((apt, index) => ({
            id: apt.id,
            level: apt.level,
            message: `${apt.emoji} ${apt.levelName.toUpperCase()} SALE! Apartment ${apt.id} sold for ${apt.price.toFixed(1)}B VND! ${apt.emoji}`,
            timestamp: Date.now(),
            delay: index * 300 // Stagger notifications by 300ms
          }));
          
          // Add notifications with staggered timing
          notifications.forEach((notification, index) => {
            setTimeout(() => {
              setBigSaleNotifications(prev => {
                const newNotifications = [...prev, notification];
                // Keep only the latest MAX_NOTIFICATIONS
                return newNotifications.slice(-MAX_NOTIFICATIONS);
              });
            }, notification.delay);
          });

          // Auto-remove notifications based on level (they fade out via CSS)
          notifications.forEach(notification => {
            const duration = 10000 + (notification.level * 2000); // 10-16 seconds
            setTimeout(() => {
              setBigSaleNotifications(prev => 
                prev.filter(notif => notif.id !== notification.id)
              );
            }, duration + notification.delay);
          });
        }

        // Add simple highlight to newly updated rows
        const updatedIds = new Set(newlyUpdated.map(apt => apt.id));
        setAnimatingRows(updatedIds);

        // Remove highlight after 2 seconds
        setTimeout(() => {
          setAnimatingRows(new Set());
        }, 2000);
      }
    }
    
    setPreviousApartments([...apartments]);
  }, [apartments]);

  const getStatusClassName = (status) => {
    const normalizedStatus = (status || '').toString().trim();
    
    if (normalizedStatus === 'Đã bán') return 'status-sold';
    if (normalizedStatus === 'Đang Lock') return 'status-locked';
    if (normalizedStatus === 'Còn trống') return 'status-available';
    
    return '';
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `${price.toFixed(1)} tỷ`;
    }
    return price || 'N/A';
  };

  const formatArea = (area) => {
    if (typeof area === 'number') {
      return `${area} m²`;
    }
    return area || 'N/A';
  };

  if (!apartments || apartments.length === 0) {
    return (
      <div className="loading-container">
        <p>No apartment data to display</p>
      </div>
    );
  }

  return (
    <div>
      {/* Big Sale Banner Notification */}
      {bigSaleNotifications.length > 0 && (
        <div className="big-sale-banner">
          <div className="big-sale-banner-content">
            <div className="big-sale-marquee">
              {bigSaleNotifications.map((notification) => (
                <span 
                  key={notification.id} 
                  className={`big-sale-text big-sale-text-level-${notification.level}`}
                >
                  {notification.message}
                </span>
              )).reduce((prev, curr) => [prev, ' • ', curr])}
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 List
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          ⬜ Grid
        </button>
      </div>

      {/* Conditional Rendering based on view mode */}
      {viewMode === 'grid' ? (
        <ApartmentGrid 
          apartments={apartments} 
          animatingCells={animatingRows}
          superAnimatingCells={superAnimatingCells}
        />
      ) : (
        <>
          <div style={{ marginBottom: '15px', textAlign: 'right', opacity: 0.8 }}>
            Total apartments: {apartments.length}
          </div>
          
          <table className="apartment-table">
            <thead>
              <tr>
                <th>Apartment ID</th>
                <th>Agency</th>
                <th>Area</th>
                <th>Price</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apartment, index) => {
                const statusClass = getStatusClassName(apartment.status);
                const isAnimating = animatingRows.has(apartment.id);
                
                // Find if this apartment has super animation and its level
                let superAnimationClass = '';
                for (const item of superAnimatingCells) {
                  if (typeof item === 'object' && item.id === apartment.id) {
                    superAnimationClass = `big-sale-animation-level-${item.level}`;
                    break;
                  } else if (item === apartment.id) {
                    superAnimationClass = 'big-sale-animation-level-1'; // fallback
                    break;
                  }
                }
                
                const rowClass = `${statusClass} ${isAnimating ? 'newly-updated' : ''} ${superAnimationClass}`.trim();
                
                return (
                  <tr key={apartment.id} className={rowClass}>
                    <td style={{ fontWeight: 'bold' }}>{apartment.id}</td>
                    <td>{apartment.agency || 'N/A'}</td>
                    <td>{formatArea(apartment.area)}</td>
                    <td style={{ fontWeight: 'bold' }}>{formatPrice(apartment.price)}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {apartment.status || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      {apartment.updated_at ? 
                        new Date(apartment.updated_at).toLocaleString('vi-VN') : 
                        'N/A'
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ApartmentTable;
