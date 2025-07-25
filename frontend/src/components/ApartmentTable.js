import React, { useState, useEffect } from 'react';

const ApartmentTable = ({ apartments }) => {
  const [animatingRows, setAnimatingRows] = useState(new Set());
  const [previousApartments, setPreviousApartments] = useState([]);

  useEffect(() => {
    if (apartments.length > 0) {
      // Find newly updated apartments
      const newlyUpdated = apartments.filter(apartment => {
        const previous = previousApartments.find(p => p.id === apartment.id);
        return previous && new Date(apartment.updated_at) > new Date(previous.updated_at);
      });

      if (newlyUpdated.length > 0) {
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
            const rowClass = `${statusClass} ${isAnimating ? 'newly-updated' : ''}`.trim();
            
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
    </div>
  );
};

export default ApartmentTable;
