import { createContext, useContext } from 'react';

export const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.error("useTheme must be used within a ThemeProvider. Falling back to default values.");
    return {
      theme: 'dark',
      language: 'ar',
      toggleTheme: () => console.log("Theme provider not found"),
      toggleLanguage: () => console.log("Theme provider not found")
    };
  }
  return context;
};