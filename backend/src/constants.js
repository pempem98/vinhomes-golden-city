// Backend constants
const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  APARTMENT_UPDATE: 'apartment-update',
  DISCONNECT: 'disconnect'
};

const API_ENDPOINTS = {
  UPDATE_SHEET: '/api/update-sheet',
  HEALTH: '/api/health'
};

const DATABASE = {
  TABLE_NAME: 'apartments',
  COLUMNS: {
    ID: 'id',
    AGENCY: 'agency',
    AREA: 'area',
    PRICE: 'price',
    STATUS: 'status',
    UPDATED_AT: 'updated_at'
  }
};

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  SOCKET_EVENTS,
  API_ENDPOINTS,
  DATABASE,
  HTTP_STATUS
};
