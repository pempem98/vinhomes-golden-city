// Application constants
export const STATUS_TYPES = {
  SOLD: 'Đã bán',
  LOCKED: 'Đang lock',
  AVAILABLE: 'Sẵn hàng'
};

export const STATUS_CLASSES = {
  'Đã bán': 'status-sold',
  'Đang lock': 'status-locked',
  'Sẵn hàng': 'status-available',
  '-': 'status-available'
};

export const API_ENDPOINTS = {
  UPDATE_SHEET: '/api/update-sheet',
  HEALTH: '/api/health'
};

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  APARTMENT_UPDATE: 'apartment-update',
  DISCONNECT: 'disconnect'
};

export const APP_CONFIG = {
  ANIMATION_DURATION: 600,
  DEFAULT_BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 
                       (window.location.hostname === 'localhost' 
                         ? 'http://localhost:5000' 
                         : `http://${window.location.hostname}:5000`)
};

export const FIELD_NAMES = {
  APARTMENT_ID: 'apartment_id',
  AGENCY: 'agency',
  AREA: 'area',
  PRICE: 'price',
  STATUS: 'status',
  UPDATED_AT: 'updated_at'
};
