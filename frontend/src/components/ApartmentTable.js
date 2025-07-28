import React, { useState, useEffect, useCallback } from 'react';
import ApartmentGrid from './ApartmentGrid';
import { t, formatters } from '../locales';

const ApartmentTable = ({ apartments }) => {
  // Feature toggles from environment variables
  const showBigSaleBanner = process.env.REACT_APP_SHOW_BIG_SALE_BANNER !== 'false';
  const showStats = process.env.REACT_APP_SHOW_STATS !== 'false';
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [animatingRows, setAnimatingRows] = useState(new Set());
  const [previousApartments, setPreviousApartments] = useState([]);
  const [bigSaleNotifications, setBigSaleNotifications] = useState([]);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isChangingNotification, setIsChangingNotification] = useState(false);
  const [superAnimatingCells, setSuperAnimatingCells] = useState(new Set());
  const [recentlySoldApartments, setRecentlySoldApartments] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState('updated_at'); // Default sort by Last Updated
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc' - newest first
  
  const BIG_SALE_THRESHOLDS = {
    LEVEL_1: 7.5,  // Bronze level
    LEVEL_2: 10,   // Silver level  
    LEVEL_3: 15    // Gold level
  };

  const MAX_NOTIFICATIONS = 10; // Maximum notifications in queue

  // Handle window resize to detect mobile and controls wrapping
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
      
      // Detect if controls are wrapping
      const checkControlsWrapping = () => {
        const tableControls = document.querySelector('.table-controls');
        const gridControls = document.querySelector('.grid-controls');
        const banner = document.querySelector('.sale-notification-banner');
        
        if (banner) {
          let isWrapped = false;
          
          // Check table controls wrapping
          if (tableControls) {
            const children = tableControls.children;
            if (children.length > 1) {
              const firstChild = children[0].getBoundingClientRect();
              const lastChild = children[children.length - 1].getBoundingClientRect();
              // If children are not on the same horizontal line
              isWrapped = Math.abs(firstChild.top - lastChild.top) > 10;
            }
          }
          
          // Check grid controls wrapping
          if (gridControls && !isWrapped) {
            const children = gridControls.children;
            if (children.length > 1) {
              const firstChild = children[0].getBoundingClientRect();
              const lastChild = children[children.length - 1].getBoundingClientRect();
              // If children are not on the same horizontal line
              isWrapped = Math.abs(firstChild.top - lastChild.top) > 10;
            }
          }
          
          // Apply or remove the wrapped class
          if (isWrapped) {
            banner.classList.add('controls-wrapped');
          } else {
            banner.classList.remove('controls-wrapped');
          }
        }
      };
      
      // Small delay to allow layout to settle
      setTimeout(checkControlsWrapping, 100);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check controls wrapping on mount and when viewMode changes
  useEffect(() => {
    const checkControlsWrapping = () => {
      const tableControls = document.querySelector('.table-controls');
      const gridControls = document.querySelector('.grid-controls');
      const banner = document.querySelector('.sale-notification-banner');
      
      if (banner) {
        let isWrapped = false;
        
        // Check table controls wrapping (only if in list view)
        if (tableControls && viewMode === 'list') {
          const children = Array.from(tableControls.children);
          if (children.length > 1) {
            const firstChild = children[0].getBoundingClientRect();
            const lastChild = children[children.length - 1].getBoundingClientRect();
            // If children are not on the same horizontal line
            isWrapped = Math.abs(firstChild.top - lastChild.top) > 10;
          }
        }
        
        // Check grid controls wrapping (only if in grid view)
        if (gridControls && viewMode === 'grid' && !isWrapped) {
          const children = Array.from(gridControls.children);
          if (children.length > 1) {
            const firstChild = children[0].getBoundingClientRect();
            const lastChild = children[children.length - 1].getBoundingClientRect();
            // If children are not on the same horizontal line
            isWrapped = Math.abs(firstChild.top - lastChild.top) > 10;
          }
        }
        
        // Apply or remove the wrapped class
        if (isWrapped) {
          banner.classList.add('controls-wrapped');
        } else {
          banner.classList.remove('controls-wrapped');
        }
      }
    };
    
    // Small delay to allow layout to settle after viewMode change
    const timeoutId = setTimeout(checkControlsWrapping, 150);
    
    return () => clearTimeout(timeoutId);
  }, [viewMode, apartments.length]);

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
          // Create enhanced animation data with levels
          const enhancedBigSales = bigSales.map(apt => {
            let level = 1;
            let levelName = 'BigTransaction';
            let emoji = '💰';
            
            if (apt.price >= BIG_SALE_THRESHOLDS.LEVEL_3) {
              level = 3;
              levelName = 'PremiumDeal';
              emoji = '🏆';
            } else if (apt.price >= BIG_SALE_THRESHOLDS.LEVEL_2) {
              level = 2;
              levelName = 'ExcellentSale';
              emoji = '⭐';
            }
            
            return { ...apt, level, levelName, emoji };
          });

          // Add super animation for big sales with level info
          const bigSaleIds = new Set(enhancedBigSales.map(apt => ({ id: apt.id, level: apt.level })));
          setSuperAnimatingCells(bigSaleIds);

          // Add notification messages with levels
          const notifications = enhancedBigSales.map((apt, index) => ({
            id: apt.id,
            level: apt.level,
            message: t('notifications.bigSale.message', {
              level: `${apt.emoji} ${t(`notifications.bigSale.levels.${apt.level}`)}`,
              id: apt.id,
              price: apt.price.toFixed(1),
              currency: t('units.vnd')
            }),
            timestamp: Date.now() + index // Ensure unique timestamps
          }));
          
          // Add notifications to queue
          setBigSaleNotifications(prev => {
            const newNotifications = [...prev, ...notifications];
            // Keep only the latest MAX_NOTIFICATIONS
            return newNotifications.slice(-MAX_NOTIFICATIONS);
          });

          // Auto-remove notifications after total queue cycle
          const notificationDuration = 15000; // 15 seconds per notification
          const totalDuration = notificationDuration * bigSaleNotifications.length + notificationDuration * notifications.length;
          
          setTimeout(() => {
            setBigSaleNotifications(prev => {
              const filtered = prev.filter(notif => !notifications.find(n => n.id === notif.id));
              // Reset index if current index is out of bounds
              if (filtered.length === 0) {
                setCurrentNotificationIndex(0);
                setIsProcessingQueue(false);
              } else if (currentNotificationIndex >= filtered.length) {
                setCurrentNotificationIndex(0);
              }
              return filtered;
            });
          }, totalDuration);
        }

        // Track all apartments that just became sold (for 10s animation)
        const newlySold = newlyUpdated.filter(apartment => {
          const previous = previousApartments.find(p => p.id === apartment.id);
          return apartment.status === 'Đã bán' && previous?.status !== 'Đã bán';
        });

        if (newlySold.length > 0) {
          // Add to recently sold set
          const newRecentlySold = new Set(recentlySoldApartments);
          newlySold.forEach(apt => newRecentlySold.add(apt.id));
          setRecentlySoldApartments(newRecentlySold);

          // Remove from recently sold after 10 seconds
          setTimeout(() => {
            setRecentlySoldApartments(prev => {
              const updated = new Set(prev);
              newlySold.forEach(apt => updated.delete(apt.id));
              return updated;
            });
          }, 10000); // 10 seconds
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

  // Banner hiển thị tĩnh - không cần animation marquee
  // Chỉ theo dõi bigSaleNotifications để cập nhật banner khi có thay đổi

  // Queue processing - hiển thị từng notification một
  useEffect(() => {
    let timeoutId;
    
    if (bigSaleNotifications.length > 0) {
      if (!isProcessingQueue) {
        setIsProcessingQueue(true);
        setCurrentNotificationIndex(0);
      }
      
      // Tự động chuyển sang notification tiếp theo
      timeoutId = setTimeout(() => {
        if (bigSaleNotifications.length > 1) {
          // Bắt đầu hiệu ứng fade
          setIsChangingNotification(true);
          
          setTimeout(() => {
            setCurrentNotificationIndex(prev => {
              const nextIndex = (prev + 1) % bigSaleNotifications.length;
              return nextIndex;
            });
            
            // Kết thúc hiệu ứng fade
            setTimeout(() => {
              setIsChangingNotification(false);
            }, 300);
          }, 250);
        }
      }, 15000); // 15 giây mỗi notification
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bigSaleNotifications.length, currentNotificationIndex, isProcessingQueue]);

  // Reset queue khi không còn notification
  useEffect(() => {
    if (bigSaleNotifications.length === 0) {
      setCurrentNotificationIndex(0);
      setIsProcessingQueue(false);
      setIsChangingNotification(false);
    }
  }, [bigSaleNotifications.length]);

  const getStatusClassName = (status) => {
    const normalizedStatus = (status || '').toString().trim();
    
    if (normalizedStatus === 'Đã bán') return 'status-sold';
    if (normalizedStatus === 'Đang lock') return 'status-locked';
    if (normalizedStatus === 'Sẵn hàng') return 'status-available';
    
    return '';
  };

  const formatPrice = (price) => {
    return formatters.price(price);
  };

  const formatArea = (area) => {
    return formatters.area(area);
  };

  // Format time for mobile - only show time, not date
  const formatTimeForMobile = (dateString) => {
    if (!dateString) return t('format.noValue');
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Handle column sorting - disabled on mobile
  const handleSort = (column) => {
    if (isMobile) return; // Disable sorting on mobile
    
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort apartments based on current sort settings
  const getSortedApartments = () => {
    const sorted = [...apartments].sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'id':
          // Extract numeric part from apartment ID for proper sorting
          const getNumericId = (id) => {
            const match = id.toString().match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          aValue = getNumericId(a.id);
          bValue = getNumericId(b.id);
          break;
        case 'agency':
          aValue = (a.agency || '').toString().toLowerCase();
          bValue = (b.agency || '').toString().toLowerCase();
          break;
        case 'area':
          aValue = typeof a.area === 'number' ? a.area : 0;
          bValue = typeof b.area === 'number' ? b.area : 0;
          break;
        case 'price':
          aValue = typeof a.price === 'number' ? a.price : 0;
          bValue = typeof b.price === 'number' ? b.price : 0;
          break;
        case 'status':
          aValue = (a.status || '').toString().toLowerCase();
          bValue = (b.status || '').toString().toLowerCase();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || 0);
          bValue = new Date(b.updated_at || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Get sort icon for column headers - hidden on mobile
  const getSortIcon = (column) => {
    if (isMobile) return ''; // No sort icons on mobile
    
    if (sortColumn !== column) {
      // Unsorted icon - both triangles dim
      return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" style={{ marginLeft: '4px', fontSize: '1.2em', verticalAlign: 'middle' }}>
          <path d="M7 10l5-5 5 5H7z" fill="currentColor" opacity="0.3"/>
          <path d="M7 14l5 5 5-5H7z" fill="currentColor" opacity="0.3"/>
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      // Ascending icon - top triangle bright, bottom dim
      return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" style={{ marginLeft: '4px', fontSize: '1.2em', verticalAlign: 'middle' }}>
          <path d="M7 10l5-5 5 5H7z" fill="currentColor" opacity="1"/>
          <path d="M7 14l5 5 5-5H7z" fill="currentColor" opacity="0.3"/>
        </svg>
      );
    } else {
      // Descending icon - bottom triangle bright, top dim
      return (
        <svg width="1em" height="1em" viewBox="0 0 24 24" style={{ marginLeft: '4px', fontSize: '1.2em', verticalAlign: 'middle' }}>
          <path d="M7 10l5-5 5 5H7z" fill="currentColor" opacity="0.3"/>
          <path d="M7 14l5 5 5-5H7z" fill="currentColor" opacity="1"/>
        </svg>
      );
    }
  };

  // Calculate apartment statistics
  const getApartmentStats = () => {
    const total = 238; // Fixed total
    const sold = apartments.filter(apt => apt.status === 'Đã bán').length;
    const locked = apartments.filter(apt => apt.status === 'Đang lock').length;
    const available = apartments.filter(apt => apt.status === 'Sẵn hàng').length;
    
    return { total, sold, locked, available };
  };

  if (!apartments || apartments.length === 0) {
    return (
      <div className="loading-container">
        <p>{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sales Notification Banner - Between header and content */}
      {showBigSaleBanner && bigSaleNotifications.length > 0 && (
        <div 
          className={`sale-notification-banner ${isChangingNotification ? 'changing' : ''}`}
          data-queue-info={`${currentNotificationIndex + 1}/${bigSaleNotifications.length}`}
        >
          <div className="sale-notification-content">
            <div className="sale-notification-marquee">
              <span className="sale-notification-text">
                {bigSaleNotifications[currentNotificationIndex]?.message || t('notifications.bigSale.defaultMessage')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Rendering based on view mode */}
      {viewMode === 'grid' ? (
        <ApartmentGrid 
          apartments={apartments} 
          animatingCells={animatingRows}
          superAnimatingCells={superAnimatingCells}
          recentlySoldApartments={recentlySoldApartments}
          bigSaleNotifications={bigSaleNotifications}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ) : (
        <div className="table-scroll-wrapper">
          {/* Table Stats and View Toggle */}
          <div className="table-controls">
            {showStats && (
              <div className="table-stats">
                {(() => {
                  const stats = getApartmentStats();
                  return `${t('stats.total')} ${t('common.apartments')}: ${stats.total} • ${t('stats.sold')}: ${stats.sold} • ${t('stats.locked')}: ${stats.locked}`;
                })()}
              </div>
            )}
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title={t('tooltips.switchToList')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                {t('viewModes.list')}
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title={t('tooltips.switchToGrid')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
                </svg>
                {t('viewModes.grid')}
              </button>
            </div>
          </div>
          <table className="apartment-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('agency')}>
                  {t('table.headers.agency')} {getSortIcon('agency')}
                </th>
                <th onClick={() => handleSort('id')}>
                  {t('table.headers.apartmentId')} {getSortIcon('id')}
                </th>
                <th onClick={() => handleSort('area')}>
                  {t('table.headers.area')} {getSortIcon('area')}
                </th>
                <th onClick={() => handleSort('price')}>
                  {t('table.headers.price')} {getSortIcon('price')}
                </th>
                <th onClick={() => handleSort('status')}>
                  {t('table.headers.status')} {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('updated_at')}>
                  {t('table.headers.lastUpdated')} {getSortIcon('updated_at')}
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedApartments().map((apartment, index) => {
                const statusClass = getStatusClassName(apartment.status);
                const isAnimating = animatingRows.has(apartment.id);
                const isRecentlySold = recentlySoldApartments.has(apartment.id);
                
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
                
                const recentlySoldClass = isRecentlySold ? 'recently-sold-animation' : '';
                const rowClass = `${statusClass} ${isAnimating ? 'newly-updated' : ''} ${superAnimationClass} ${recentlySoldClass}`.trim();
                
                return (
                  <tr 
                    key={apartment.id} 
                    className={rowClass}
                  >
                    <td>{apartment.agency || t('format.noValue')}</td>
                    <td style={{ fontWeight: 'bold' }}>{apartment.id}</td>
                    <td>{formatArea(apartment.area)}</td>
                    <td style={{ fontWeight: 'bold' }}>{formatPrice(apartment.price)}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {formatters.status(apartment.status)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      {apartment.updated_at ? (
                        isMobile ? 
                          formatTimeForMobile(apartment.updated_at) :
                          new Date(apartment.updated_at).toLocaleString('vi-VN')
                      ) : t('format.noValue')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApartmentTable;
