import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../../locales/en.json';
import esTranslations from '../../locales/es.json';

// Detect language based on region
const detectLanguage = (): string => {
  // 1. Check for user's preferred language in localStorage
  const storedLang = localStorage.getItem('preferred-language');
  if (storedLang && (storedLang === 'en' || storedLang === 'es')) {
    return storedLang;
  }
  
  // 2. Fall back to browser language
  const userLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // Spanish-speaking regions
  const spanishRegions = ['es-ES', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-CU', 
                          'es-DO', 'es-EC', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 
                          'es-PE', 'es-PR', 'es-PY', 'es-SV', 'es-UY', 'es-VE'];
  
  // Check if user is from Spanish-speaking region
  if (spanishRegions.includes(userLang) || userLang.startsWith('es')) {
    return 'es';
  }
  
  // Default to English for other regions
  return 'en';
};

// Load translations from JSON files
const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Throw error for missing keys in development
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
  });

export default i18n;
