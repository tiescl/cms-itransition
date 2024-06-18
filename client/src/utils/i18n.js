import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../../public/locales/en.json';
import deTranslation from '../../public/locales/de.json';

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  debug: true,
  resources: {
    en: {
      translation: enTranslation
    },
    de: {
      translation: deTranslation
    }
  },
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
