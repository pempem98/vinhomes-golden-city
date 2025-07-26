import React from 'react';
import { getCurrentLocale, setLocale } from '../locales';

const LanguageSwitcher = ({ onLanguageChange }) => {
  const currentLocale = getCurrentLocale();

  const handleLanguageChange = (newLocale) => {
    if (setLocale(newLocale)) {
      if (onLanguageChange) {
        onLanguageChange(newLocale);
      }
      // Force re-render by triggering a small state change
      window.dispatchEvent(new Event('localeChanged'));
    }
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${currentLocale === 'vi' ? 'active' : ''}`}
        onClick={() => handleLanguageChange('vi')}
        title="Tiếng Việt"
      >
        🇻🇳
      </button>
      <button
        className={`lang-btn ${currentLocale === 'en' ? 'active' : ''}`}
        onClick={() => handleLanguageChange('en')}
        title="English"
      >
        🇺🇸
      </button>
    </div>
  );
};

export default LanguageSwitcher;
