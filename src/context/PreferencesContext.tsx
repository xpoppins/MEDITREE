import React, { createContext, useContext, useEffect, useState } from 'react';

export type TextSize = 'A' | 'A+' | 'A++';
export type Language = 'en' | 'hi';

interface PreferencesContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<string, { en: string; hi: string }> = {
  // App
  appName: { en: 'Family Health Tracker', hi: 'फैमिली हेल्थ ट्रैकर' },
  tagline: { en: "Keep your family's health in one place", hi: 'अपने पूरे परिवार का स्वास्थ्य एक जगह रखें' },
  disclaimer: { en: 'For tracking only. Not medical advice.', hi: 'केवल रिकॉर्ड रखने के लिए। यह डॉक्टरी सलाह नहीं है।' },
  
  // Navigation
  home: { en: 'Home', hi: 'मुख्य पृष्ठ' },
  history: { en: 'History', hi: 'इतिहास' },
  family: { en: 'Family', hi: 'परिवार' },
  me: { en: 'Me', hi: 'मेरा खाता' },
  settings: { en: 'Settings', hi: 'सेटिंग्स' },

  // Actions
  addReading: { en: 'Add Reading', hi: '+ नया माप दर्ज करें' },
  save: { en: 'Save Reading', hi: 'सुरक्षित करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  edit: { en: 'Edit', hi: 'बदलें' },
  delete: { en: 'Delete', hi: 'हटाएं' },
  done: { en: 'Done', hi: 'हो गया' },
  addAnother: { en: 'Add another', hi: 'एक और माप दर्ज करें' },
  confirmDelete: { en: 'Are you sure you want to delete this?', hi: 'क्या आप इसे वाकई हटाना चाहते हैं?' },
  yesDelete: { en: 'Yes, delete', hi: 'हाँ, हटा दें' },

  // Reading Types
  bp: { en: 'Blood Pressure', hi: 'रक्तचाप (BP)' },
  sugar: { en: 'Blood Sugar', hi: 'ब्लड शुगर' },
  weight: { en: 'Weight', hi: 'शरीर का वज़न' },
  pulse: { en: 'Pulse (Heart rate)', hi: 'नाड़ी की धड़कन (Pulse)' },
  upper: { en: 'Upper (Systolic)', hi: 'ऊपर का (Systolic)' },
  lower: { en: 'Lower (Diastolic)', hi: 'नीचे का (Diastolic)' },

  // Sugar Context
  fasting: { en: 'Before food (Fasting)', hi: 'खाली पेट (Fasting)' },
  after_meal: { en: 'After food', hi: 'खाने के 2 घंटे बाद' },
  random: { en: 'Anytime', hi: 'दिन में कभी भी' },

  // Status
  good: { en: 'Good', hi: 'अच्छा' },
  watch: { en: 'Watch', hi: 'ध्यान दें' },
  doctor: { en: 'See doctor', hi: 'डॉक्टर से मिलें' },

  // Voice
  sayIt: { en: 'Say it (Voice)', hi: 'बोलकर बताएं' },
  listening: { en: 'Listening... Please speak', hi: 'सुन रहे हैं... कृपया बोलें' },
  voiceHelp: { en: 'Say: "BP 130 over 85" or "Sugar 140"', hi: 'बोलें: "BP 130 over 85" या "Sugar 140"' },
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('fht_text_size') as TextSize) || 'A';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('fht_language') as Language) || 'en';
  });

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('fht_text_size', size);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fht_language', lang);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-a', 'text-size-a-plus', 'text-size-a-plus-plus');
    if (textSize === 'A') root.classList.add('text-size-a');
    if (textSize === 'A+') root.classList.add('text-size-a-plus');
    if (textSize === 'A++') root.classList.add('text-size-a-plus-plus');
  }, [textSize]);

  const t = (key: string): string => {
    const item = DICTIONARY[key];
    if (!item) return key;
    return item[language] || item.en;
  };

  return (
    <PreferencesContext.Provider value={{ textSize, setTextSize, language, setLanguage, t }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};
