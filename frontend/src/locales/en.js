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
    connected: 'Connected',
    disconnected: 'Disconnected'
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
    locked: 'LOCK',
    available: 'AVAILABLE'
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
      bronze: 'BIG TRANSACTION',
      silver: 'EXCELLENT SALE',
      gold: 'PREMIUM DEAL', 
      message: '🔥 {level}! Apartment {id} just sold successfully for {price}B {currency}! 🎉',
      levels: {
        1: 'BIG TRANSACTION',
        2: 'EXCELLENT SALE',
        3: 'PREMIUM DEAL'
      }
    },
    saleBanner: 'Sales Notification',
    salesAlert: 'Major Transaction Alert'
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
    },
    rowsPerPage: 'Visible rows'
  },

  // Stats
  stats: {
    total: 'Total',
    sold: 'Sold',
    locked: 'Locked',
    available: 'Available'
  },

  // Dashboard
  dashboard: {
    title: 'SALES EVENT - SUNSHINE DISTRICT',
    subtitle: 'Vinhomes Duong Kinh Real Estate',
    realtime: 'Real-time'
  },

  // Tooltips
  tooltips: {
    apartmentInfo: '{id} - {agency} - Area: {area}m² - {price} - {status}',
    switchToList: 'Switch to List mode',
    switchToGrid: 'Switch to Grid mode'
  },

  // Formatting
  format: {
    price: '{value}B',
    area: '{value} m²',
    noValue: 'N/A'
  },

  // Grid controls
  grid: {
    columnsPerRow: 'Columns/Row',
    columns: 'columns'
  }
};
