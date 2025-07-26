import { vi } from './vi';
import { en } from './en';

// Available locales
export const locales = {
  vi,
  en
};

// Default locale
export const DEFAULT_LOCALE = 'vi';

// Current locale state
let currentLocale = DEFAULT_LOCALE;

// Get current locale
export const getCurrentLocale = () => currentLocale;

// Set locale
export const setLocale = (locale) => {
  if (locales[locale]) {
    currentLocale = locale;
    // Save to localStorage
    localStorage.setItem('apartment-dashboard-locale', locale);
    return true;
  }
  return false;
};

// Get translation
export const t = (key, params = {}) => {
  const locale = locales[currentLocale] || locales[DEFAULT_LOCALE];
  
  // Split key by dots to access nested properties
  const keys = key.split('.');
  let value = locale;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return key as fallback
    }
  }
  
  // Replace parameters in the translation
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }
  
  return value;
};

// Format utilities
export const formatters = {
  price: (value, locale = currentLocale) => {
    if (typeof value !== 'number') return t('format.noValue');
    return t('format.price', { value: value.toFixed(1) });
  },
  
  area: (value, locale = currentLocale) => {
    if (typeof value !== 'number') return t('format.noValue');
    return t('format.area', { value });
  },
  
  agency: (agency) => {
    if (!agency) return t('format.noValue');
    
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
  },
  
  status: (status) => {
    const normalizedStatus = (status || '').toString().trim();
    
    if (normalizedStatus === 'Đã bán') return t('status.sold');
    if (normalizedStatus === 'Đang Lock') return t('status.locked');
    if (normalizedStatus === 'Còn trống') return t('status.available');
    
    return t('status.unknown');
  },
  
  statusLabel: (status) => {
    const normalizedStatus = (status || '').toString().trim();
    
    if (normalizedStatus === 'Đã bán') return t('statusLabels.sold');
    if (normalizedStatus === 'Đang Lock') return t('statusLabels.locked');
    
    return '';
  }
};

// Initialize locale from localStorage on import
const savedLocale = localStorage.getItem('apartment-dashboard-locale');
if (savedLocale && locales[savedLocale]) {
  currentLocale = savedLocale;
}

export default {
  locales,
  getCurrentLocale,
  setLocale,
  t,
  formatters
};
