import React, { useState, useEffect } from 'react';

const ApartmentGrid = ({ apartments, animatingCells = new Set(), superAnimatingCells = new Set() }) => {
  const [previousApartments, setPreviousApartments] = useState([]);
  const [visibleApartments, setVisibleApartments] = useState(apartments);
  const [containerWidth, setContainerWidth] = useState(800);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      const gridElement = document.querySelector('.apartment-grid');
      if (gridElement) {
        setContainerWidth(gridElement.clientWidth);
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
    if (normalizedStatus === 'Đang Lock') return 'grid-cell-locked';
    if (normalizedStatus === 'Còn trống') return 'grid-cell-available';
    
    return 'grid-cell-default';
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `${price.toFixed(1)}tỷ`;
    }
    return price || 'N/A';
  };

  const formatAgency = (agency) => {
    if (!agency) return 'N/A';
    
    // Create abbreviation from agency name
    const words = agency.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    
    // Take first letter of each word, max 3 letters
    return words
      .slice(0, 3)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getCellSize = (apartment) => {
    // Base size calculation - proportional to area
    const baseSize = 60; // minimum size
    let areaMultiplier = 1;
    
    if (typeof apartment.area === 'number' && apartment.area > 0) {
      // Direct proportional relationship: area 100 = 2x size of area 50
      areaMultiplier = apartment.area / 50; // 50 is reference area
      areaMultiplier = Math.max(0.8, Math.min(3, areaMultiplier)); // Clamp between 0.8x and 3x
    }
    
    const calculatedSize = Math.round(baseSize * areaMultiplier);
    
    // Ensure size fits within container constraints
    const totalApartments = visibleApartments.length;
    const minColumns = Math.max(4, Math.floor(Math.sqrt(totalApartments)));
    const maxColumns = Math.max(minColumns, Math.floor(containerWidth / 80));
    const maxCellSize = Math.floor((containerWidth - (maxColumns * 8)) / maxColumns);
    
    return Math.max(baseSize, Math.min(calculatedSize, maxCellSize, 200));
  };

  const getFontSizes = (cellSize) => {
    // Font sizes proportional to cell size
    const baseFontRatio = cellSize / 80; // 80px is our reference size
    
    return {
      idFontSize: Math.max(10, Math.round(16 * baseFontRatio)), // Increased base size
      agencyFontSize: Math.max(8, Math.round(11 * baseFontRatio)),
      priceFontSize: Math.max(9, Math.round(13 * baseFontRatio))
    };
  };

  const getSortedApartments = () => {
    // Sort apartments: sold ones first, then by status, then by area (descending)
    return [...visibleApartments].sort((a, b) => {
      // First priority: sold apartments go to top
      const aIsSold = a.status === 'Đã bán';
      const bIsSold = b.status === 'Đã bán';
      
      if (aIsSold && !bIsSold) return -1;
      if (!aIsSold && bIsSold) return 1;
      
      // Second priority: sort by status
      const statusOrder = { 'Đã bán': 0, 'Đang Lock': 1, 'Còn trống': 2 };
      const aStatusPriority = statusOrder[a.status] || 3;
      const bStatusPriority = statusOrder[b.status] || 3;
      
      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority;
      }
      
      // Third priority: sort by area (larger first)
      const aArea = typeof a.area === 'number' ? a.area : 0;
      const bArea = typeof b.area === 'number' ? b.area : 0;
      
      return bArea - aArea;
    });
  };

  const getColumnsPerRow = () => {
    // Calculate approximate columns based on container width and average cell size
    const averageCellSize = 90; // Approximate average cell size including gap
    const columnsEstimate = Math.floor(containerWidth / averageCellSize);
    return Math.max(4, Math.min(columnsEstimate, 10)); // Between 4 and 10 columns
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

  if (!visibleApartments || visibleApartments.length === 0) {
    return (
      <div className="loading-container">
        <p>No apartment data to display</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '15px', textAlign: 'right', opacity: 0.8 }}>
        Total apartments: {visibleApartments.length}
      </div>
      
      <div 
        className="apartment-grid"
        ref={(el) => {
          if (el && el.clientWidth !== containerWidth) {
            setContainerWidth(el.clientWidth);
          }
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
                  width: '80px',
                  height: '80px',
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
          
          const cellSize = getCellSize(apartment);
          const fontSizes = getFontSizes(cellSize);
          const cellClass = `grid-cell ${statusClass} ${isAnimating ? 'newly-updated' : ''} ${superAnimationClass}`.trim();
          
          return (
            <div
              key={apartment.id}
              className={cellClass}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
              title={`${apartment.id} - ${apartment.agency} - Area: ${apartment.area}m² - ${formatPrice(apartment.price)} - ${apartment.status}`}
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
                {formatAgency(apartment.agency)}
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
