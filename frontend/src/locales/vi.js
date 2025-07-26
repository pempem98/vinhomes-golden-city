export const vi = {
  // Common
  common: {
    loading: 'Đang tải...',
    noData: 'Không có dữ liệu để hiển thị',
    total: 'Tổng số',
    apartments: 'căn hộ',
    apartment: 'căn hộ',
    area: 'Diện tích',
    price: 'Giá',
    status: 'Trạng thái',
    agency: 'Đại lý',
    lastUpdated: 'Cập nhật lần cuối',
    apartmentId: 'Mã căn hộ',
    status: {
      connected: 'Đã kết nối',
      disconnected: 'Mất kết nối'
    }
  },

  // Status
  status: {
    available: 'Còn trống',
    sold: 'Đã bán', 
    locked: 'Đang Lock',
    unknown: 'Không xác định'
  },

  // Status labels for grid cells
  statusLabels: {
    sold: 'SOLD',
    locked: 'LOCK'
  },

  // View modes
  viewModes: {
    list: 'Danh sách',
    grid: 'Lưới'
  },

  // Units
  units: {
    billion: 'tỷ',
    squareMeters: 'm²',
    vnd: 'VND'
  },

  // Notifications
  notifications: {
    bigSale: {
      bronze: 'BRONZE SALE',
      silver: 'SILVER SALE', 
      gold: 'GOLD SALE',
      message: '{level}! Căn hộ {id} đã bán với giá {price}B {currency}!',
      levels: {
        1: 'BRONZE',
        2: 'SILVER',
        3: 'GOLD'
      }
    },
    worldChannel: 'Kênh thế giới'
  },

  // Table headers
  table: {
    headers: {
      apartmentId: 'Mã căn hộ',
      agency: 'Đại lý',
      area: 'Diện tích',
      price: 'Giá',
      status: 'Trạng thái',
      lastUpdated: 'Cập nhật lần cuối'
    }
  },

  // Dashboard
  dashboard: {
    title: 'Bảng Điều Khiển Căn Hộ',
    subtitle: 'Theo dõi trạng thái căn hộ theo thời gian thực',
    realtime: 'Thời gian thực'
  },

  // Tooltips
  tooltips: {
    apartmentInfo: '{id} - {agency} - Diện tích: {area}m² - {price} - {status}',
    switchToList: 'Chuyển sang chế độ danh sách',
    switchToGrid: 'Chuyển sang chế độ lưới'
  },

  // Formatting
  format: {
    price: '{value}tỷ',
    area: '{value} m²',
    noValue: 'N/A'
  }
};
