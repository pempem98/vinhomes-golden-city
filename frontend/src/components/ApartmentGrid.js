import React, { useState, useEffect } from 'react';
import { t, formatters } from '../locales';

const ApartmentGrid = ({ 
  apartments, 
  animatingCells = new Set(), 
  superAnimatingCells = new Set(), 
  recentlySoldApartments = new Set(),
  bigSaleNotifications = [],
  viewMode,
  setViewMode
}) => {
  const [previousApartments, setPreviousApartments] = useState([]);
  const [visibleApartments, setVisibleApartments] = useState(apartments);
  const [containerWidth, setContainerWidth] = useState(1200); // Better default width
  
  // Load columns from localStorage or default to 8, but adjust for mobile with max 10
  const [columnsPerRow, setColumnsPerRow] = useState(() => {
    try {
      const saved = localStorage.getItem('gridColumnsPerRow');
      const defaultColumns = window.innerWidth <= 480 ? 10 : 8; // Max 10 columns on mobile
      const loadedColumns = (saved && saved !== 'undefined' && saved !== 'null') ? parseInt(saved) : defaultColumns;
      // Cap at 10 for mobile, 40 for desktop
      const maxColumns = window.innerWidth <= 480 ? 10 : 40;
      return Math.min(loadedColumns, maxColumns);
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      return window.innerWidth <= 480 ? 10 : 8;
    }
  });

  // Adjust columns for mobile on window resize
  useEffect(() => {
    const handleResize = () => {
      // Different caps for mobile vs desktop
      const isMobile = window.innerWidth <= 480;
      const maxColumns = isMobile ? 10 : 40;
      
      if (columnsPerRow > maxColumns) {
        setColumnsPerRow(maxColumns);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columnsPerRow]);

  // Save columns to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('gridColumnsPerRow', columnsPerRow.toString());
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  }, [columnsPerRow]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      // Get the parent container width instead of grid element width
      const containerElement = document.querySelector('.apartment-table-container');
      if (containerElement) {
        // Different padding for mobile vs desktop
        const isMobile = window.innerWidth <= 480;
        const containerPadding = isMobile ? 4 : 50; // Minimal padding on mobile
        const availableWidth = containerElement.clientWidth - containerPadding;
        setContainerWidth(Math.max(200, availableWidth)); // Minimum width to prevent issues
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setPreviousApartments([...apartments]);
    setVisibleApartments(apartments); // Always show all apartments, including sold ones
  }, [apartments]);

  useEffect(() => {
    // Handle sold apartments - remove them after 5 minutes
    // REMOVED: We want to keep sold apartments visible permanently
  }, [apartments]);

  const getStatusClassName = (status) => {
    const normalizedStatus = (status || '').toString().trim();
    
    if (normalizedStatus === 'Đã bán') return 'grid-cell-sold';
    if (normalizedStatus === 'Đang lock') return 'grid-cell-locked';
    if (normalizedStatus === 'Sẵn hàng') return 'grid-cell-available';
    
    return 'grid-cell-default';
  };

  const formatPrice = (price) => {
    return formatters.price(price);
  };

  const formatAgency = (agency) => {
    return formatters.agency(agency);
  };

  const getCellSize = () => {
    // Calculate cell size based on selected columns
    const gap = 3;
    const availableWidth = containerWidth;
    
    const totalGaps = (columnsPerRow - 1) * gap;
    const cellSize = Math.floor((availableWidth - totalGaps) / columnsPerRow);
    
    // No size limits - let cells scale freely
    return Math.max(10, cellSize); // Only minimum 10px to prevent rendering issues
  };

  const getFontSizes = (cellSize) => {
    // Font sizes fully proportional to cell size - no limits, scales with cell
    const baseFontRatio = cellSize / 70;
    
    return {
      idFontSize: Math.round(10 * baseFontRatio), // Further reduced from 12
      agencyFontSize: Math.round(7 * baseFontRatio), // Further reduced from 8
      priceFontSize: Math.round(9 * baseFontRatio), // Further reduced from 10
      statusLabelFontSize: Math.max(5, Math.round(7 * baseFontRatio)) // Further reduced, minimum 5px
    };
  };

  const getSortedApartments = () => {
    // Sort apartments by apartment ID (alphabetical order A-Z)
    return [...visibleApartments].sort((a, b) => {
      // Convert IDs to string for comparison
      const aId = a.id.toString();
      const bId = b.id.toString();
      
      // Use localeCompare with numeric option for proper alphanumeric sorting
      // This handles cases like A01, A02, A10 correctly (instead of A01, A10, A02)
      return aId.localeCompare(bId, 'en', { 
        numeric: true,      // Handle numeric parts correctly
        sensitivity: 'base' // Case insensitive
      });
    });
  };

  const getColumnsPerRow = () => {
    return columnsPerRow; // Use state value directly
  };

  const getGridWithEmptyCells = () => {
    const sortedApartments = getSortedApartments();
    const columnsPerRow = getColumnsPerRow();
    
    // Only add empty cells if we have apartments and the last row is incomplete
    if (sortedApartments.length === 0) return sortedApartments;
    
    const remainder = sortedApartments.length % columnsPerRow;
    if (remainder === 0) return sortedApartments; // Already complete rows
    
    const emptyCellsNeeded = columnsPerRow - remainder;
    
    // Add empty cells to fill the last row
    const emptyCells = Array(emptyCellsNeeded).fill(null).map((_, index) => ({
      id: `empty-${index}`,
      isEmpty: true
    }));
    
    return [...sortedApartments, ...emptyCells];
  };

  // Calculate apartment statistics
  const getApartmentStats = () => {
    const total = 238; // Fixed total
    const sold = apartments.filter(apt => apt.status === 'Đã bán').length;
    const locked = apartments.filter(apt => apt.status === 'Đang lock').length;
    const available = apartments.filter(apt => apt.status === 'Sẵn hàng').length;
    
    return { total, sold, locked, available };
  };

  if (!visibleApartments || visibleApartments.length === 0) {
    return (
      <div className="loading-container">
        <p>{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'stretch',
      width: '100%',
      height: '100%',
      minHeight: 'auto'
    }}>
      {/* Grid Controls */}
      <div className="grid-controls">
        <div className="grid-stats">
          {(() => {
            const stats = getApartmentStats();
            return `${t('stats.total')} ${t('common.apartments')}: ${stats.total} • ${t('stats.sold')}: ${stats.sold} • ${t('stats.locked')}: ${stats.locked}`;
          })()}
        </div>
        
        <div className="grid-controls-right">
          <div className="column-slider-container">
            <label className="column-slider-label">
              {t('grid.columnsPerRow', { default: 'Cột/hàng' })}:
            </label>
            <input
              type="range"
              min="4"
              max="40"
              value={columnsPerRow}
              onChange={(e) => setColumnsPerRow(parseInt(e.target.value))}
              className="column-slider"
            />
            <span className="column-value">{columnsPerRow}</span>
          </div>
          
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
      </div>
      
      <div 
        className="apartment-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getColumnsPerRow()}, ${getCellSize()}px)`,
          gap: '3px',
          justifyContent: 'center',
          alignContent: 'start',
          width: 'fit-content',
          maxWidth: '100%',
          margin: '0 auto',
          paddingBottom: '20px', /* Increased padding for more bottom space */
          // Scroll properties handled by CSS
        }}
        ref={(el) => {
          // Ref for potential future use, but don't update containerWidth here
        }}
      >
        {getGridWithEmptyCells().map((item) => {
          // Handle empty cells
          if (item.isEmpty) {
            return (
              <div
                key={item.id}
                className="grid-cell grid-cell-empty"
                style={{
                  width: `${getCellSize()}px`,
                  height: `${getCellSize()}px`,
                  opacity: 0.1,
                  pointerEvents: 'none'
                }}
              />
            );
          }

          // Handle apartment cells
          const apartment = item;
          const statusClass = getStatusClassName(apartment.status);
          const isAnimating = animatingCells.has(apartment.id);
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
          
          const cellSize = getCellSize();
          const fontSizes = getFontSizes(cellSize);
          const recentlySoldClass = isRecentlySold ? 'recently-sold-animation' : '';
          const cellClass = `grid-cell ${statusClass} ${isAnimating ? 'newly-updated' : ''} ${superAnimationClass} ${recentlySoldClass}`.trim();
          
          // Calculate status label font size based on cell size - no minimum limit
          const statusLabelFontSize = Math.round(cellSize * 0.12); // 12% of cell size, fully proportional
          
          return (
            <div
              key={apartment.id}
              className={cellClass}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                '--status-label-font-size': `${statusLabelFontSize}px`
              }}
              data-status-label={formatters.statusLabel(apartment.status)}
              title={t('tooltips.apartmentInfo', {
                id: apartment.id,
                agency: apartment.agency,
                area: apartment.area,
                price: formatPrice(apartment.price),
                status: formatters.status(apartment.status)
              })}
            >
              <div 
                className="cell-id"
                style={{ fontSize: `${fontSizes.idFontSize}px` }}
              >
                {apartment.id}
              </div>
              <div 
                className="cell-agency"
                style={{ fontSize: `${fontSizes.agencyFontSize}px` }}
              >
                {apartment.agency_short || formatAgency(apartment.agency)}
              </div>
              <div 
                className="cell-price"
                style={{ fontSize: `${fontSizes.priceFontSize}px` }}
              >
                {formatPrice(apartment.price)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApartmentGrid;
