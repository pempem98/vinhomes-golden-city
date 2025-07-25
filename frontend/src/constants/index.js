// Application constants
export const STATUS_TYPES = {
  SOLD: 'Đã bán',
  LOCKED: 'Đang Lock',
  AVAILABLE: 'Còn trống'
};

export const STATUS_CLASSES = {
  'Đã bán': 'status-sold',
  'Đang Lock': 'status-locked',
  'Còn trống': 'status-available',
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
  DEFAULT_BACKEND_URL: 'http://localhost:5000'
};

export const FIELD_NAMES = {
  APARTMENT_ID: 'apartment_id',
  AGENCY: 'agency',
  AREA: 'area',
  PRICE: 'price',
  STATUS: 'status',
  UPDATED_AT: 'updated_at'
};
