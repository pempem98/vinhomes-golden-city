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
    connected: 'Đã kết nối',
    disconnected: 'Mất kết nối'
  },

  // Status
  status: {
    available: 'Sẵn hàng',
    sold: 'Đã bán', 
    locked: 'Đang lock',
    unknown: 'Không xác định'
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
    billion: 'tỷ',
    squareMeters: 'm²',
    vnd: 'VND'
  },

  // Notifications
  notifications: {
    bigSale: {
      bronze: 'GIAO DỊCH LỚN',
      silver: 'GIAO DỊCH XUẤT SẮC', 
      gold: 'GIAO DỊCH ĐẶC BIỆT',
      message: '🔥 {level}! Căn hộ {id} vừa được bán thành công với giá {price}B {currency}! 🎉',
      levels: {
        1: 'GIAO DỊCH LỚN',
        2: 'GIAO DỊCH XUẤT SẮC',
        3: 'GIAO DỊCH ĐẶC BIỆT'
      }
    },
    saleBanner: 'Thông báo bán hàng',
    salesAlert: 'Cảnh báo giao dịch lớn'
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
    },
    rowsPerPage: 'Hàng hiển thị'
  },

  // Stats
  stats: {
    total: 'Tổng số',
    sold: 'Đã bán',
    locked: 'Đang lock',
    available: 'Sẵn hàng'
  },

  // Dashboard
  dashboard: {
    title: 'SỰ KIỆN BÁN HÀNG - KHU MẶT TRỜI',
    subtitle: 'Dự án bất động sản Vinhomes Dương Kinh',
    realtime: 'Thời gian thực'
  },

  // Tooltips
  tooltips: {
    apartmentInfo: '{id} - {agency} - Diện tích: {area}m² - {price} - {status}',
    switchToList: 'Chuyển sang chế độ List',
    switchToGrid: 'Chuyển sang chế độ Grid'
  },

  // Formatting
  format: {
    price: '{value}tỷ',
    area: '{value} m²',
    noValue: 'N/A'
  },

  // Grid controls
  grid: {
    columnsPerRow: 'Cột/hàng',
    columns: 'cột'
  }
};
