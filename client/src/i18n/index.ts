import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    common: {
      "navigation": {
        "home": "Home",
        "features": "Features",
        "chatbot": "Chatbot",
        "map": "Map",
        "feedback": "Feedback",
        "analytics": "Analytics",
        "admin": "Admin",
        "dashboard": "Dashboard",
        "signIn": "Sign In",
        "logout": "Logout",
        "settings": "Settings"
      },
      "common": {
        "submit": "Submit",
        "cancel": "Cancel",
        "save": "Save",
        "edit": "Edit",
        "delete": "Delete",
        "close": "Close",
        "loading": "Loading...",
        "search": "Search",
        "filter": "Filter",
        "all": "All",
        "none": "None",
        "select": "Select",
        "required": "Required",
        "optional": "Optional",
        "yes": "Yes",
        "no": "No",
        "continue": "Continue",
        "back": "Back",
        "next": "Next",
        "previous": "Previous"
      },
      "language": {
        "select": "Select Language",
        "english": "English",
        "hindi": "हिन्दी",
        "marathi": "मराठी",
        "changeLanguage": "Change Language"
      }
    }
  },
  hi: {
    common: {
      "navigation": {
        "home": "होम",
        "features": "सुविधाएं",
        "chatbot": "चैटबॉट",
        "map": "मानचित्र",
        "feedback": "प्रतिक्रिया",
        "analytics": "विश्लेषण",
        "admin": "प्रशासन",
        "dashboard": "डैशबोर्ड",
        "signIn": "साइन इन करें",
        "logout": "लॉग आउट",
        "settings": "सेटिंग्स"
      },
      "common": {
        "submit": "जमा करें",
        "cancel": "रद्द करें",
        "save": "सेव करें",
        "edit": "संपादित करें",
        "delete": "हटाएं",
        "close": "बंद करें",
        "loading": "लोड हो रहा है...",
        "search": "खोजें",
        "filter": "फिल्टर",
        "all": "सभी",
        "none": "कोई नहीं",
        "select": "चुनें",
        "required": "आवश्यक",
        "optional": "वैकल्पिक",
        "yes": "हां",
        "no": "नहीं",
        "continue": "जारी रखें",
        "back": "वापस",
        "next": "अगला",
        "previous": "पिछला"
      },
      "language": {
        "select": "भाषा चुनें",
        "english": "English",
        "hindi": "हिन्दी",
        "marathi": "मराठी",
        "changeLanguage": "भाषा बदलें"
      }
    }
  },
  mr: {
    common: {
      "navigation": {
        "home": "होम",
        "features": "वैशिष्ट्ये",
        "chatbot": "चॅटबॉट",
        "map": "नकाशा",
        "feedback": "प्रतिक्रिया",
        "analytics": "विश्लेषण",
        "admin": "प्रशासन",
        "dashboard": "डॅशबोर्ड",
        "signIn": "साइन इन करा",
        "logout": "लॉग आउट",
        "settings": "सेटिंग्ज"
      },
      "common": {
        "submit": "सबमिट करा",
        "cancel": "रद्द करा",
        "save": "सेव्ह करा",
        "edit": "संपादित करा",
        "delete": "डिलीट करा",
        "close": "बंद करा",
        "loading": "लोड होत आहे...",
        "search": "शोधा",
        "filter": "फिल्टर",
        "all": "सर्व",
        "none": "काहीही नाही",
        "select": "निवडा",
        "required": "आवश्यक",
        "optional": "वैकल्पिक",
        "yes": "होय",
        "no": "नाही",
        "continue": "पुढे चला",
        "back": "मागे",
        "next": "पुढील",
        "previous": "मागील"
      },
      "language": {
        "select": "भाषा निवडा",
        "english": "English",
        "hindi": "हिन्दी",
        "marathi": "मराठी",
        "changeLanguage": "भाषा बदला"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    ns: ['common'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;