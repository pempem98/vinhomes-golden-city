export const en = {
  // Common
  common: {
    loading: 'Loading...',
    noData: 'No data to display',
    total: 'Total',
    apartments: 'apartments',
    apartment: 'apartment',
    area: 'Area',
    price: 'Price',
    status: 'Status',
    agency: 'Agency',
    lastUpdated: 'Last Updated',
    apartmentId: 'Apartment ID',
    status: {
      connected: 'Connected',
      disconnected: 'Disconnected'
    }
  },

  // Status
  status: {
    available: 'Available',
    sold: 'Sold',
    locked: 'Locked',
    unknown: 'Unknown'
  },

  // Status labels for grid cells
  statusLabels: {
    sold: 'SOLD',
    locked: 'LOCK'
  },

  // View modes
  viewModes: {
    list: 'List',
    grid: 'Grid'
  },

  // Units
  units: {
    billion: 'B',
    squareMeters: 'm²',
    vnd: 'VND'
  },

  // Notifications
  notifications: {
    bigSale: {
      bronze: 'BRONZE SALE',
      silver: 'SILVER SALE',
      gold: 'GOLD SALE', 
      message: '{level}! Apartment {id} sold for {price}B {currency}!',
      levels: {
        1: 'BRONZE',
        2: 'SILVER',
        3: 'GOLD'
      }
    },
    worldChannel: 'World Channel'
  },

  // Table headers
  table: {
    headers: {
      apartmentId: 'Apartment ID',
      agency: 'Agency',
      area: 'Area',
      price: 'Price',
      status: 'Status',
      lastUpdated: 'Last Updated'
    }
  },

  // Dashboard
  dashboard: {
    title: 'Real Estate Dashboard',
    subtitle: 'Real-time apartment status monitoring',
    realtime: 'Real-time'
  },

  // Tooltips
  tooltips: {
    apartmentInfo: '{id} - {agency} - Area: {area}m² - {price} - {status}',
    switchToList: 'Switch to list view',
    switchToGrid: 'Switch to grid view'
  },

  // Formatting
  format: {
    price: '{value}B',
    area: '{value} m²',
    noValue: 'N/A'
  }
};
