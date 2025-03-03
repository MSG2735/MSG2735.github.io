'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define theme types
export type ThemeType = 'default' | 'classic' | 'modern' | 'neon' | 'dark';
export type CardStyleType = 'classic' | 'minimal' | 'vintage' | 'modern';
export type TableColorType = 'green' | 'blue' | 'red' | 'purple' | 'black';
export type FontSizeType = 'small' | 'medium' | 'large' | 'x-large';

// Theme context type
interface ThemeContextType {
  theme: ThemeType;
  cardStyle: CardStyleType;
  tableColor: TableColorType;
  fontSize: FontSizeType;
  darkMode: boolean;
  updateTheme: (theme: ThemeType) => void;
  updateCardStyle: (style: CardStyleType) => void;
  updateTableColor: (color: TableColorType) => void;
  updateFontSize: (size: FontSizeType) => void;
  toggleDarkMode: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('default');
  const [cardStyle, setCardStyle] = useState<CardStyleType>('classic');
  const [tableColor, setTableColor] = useState<TableColorType>('green');
  const [fontSize, setFontSize] = useState<FontSizeType>('medium');
  const [darkMode, setDarkMode] = useState(true);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('blackjack-theme') as ThemeType;
    const savedCardStyle = localStorage.getItem('blackjack-cardStyle') as CardStyleType;
    const savedTableColor = localStorage.getItem('blackjack-tableColor') as TableColorType;
    const savedFontSize = localStorage.getItem('blackjack-fontSize') as FontSizeType;
    const savedDarkMode = localStorage.getItem('blackjack-darkMode');

    if (savedTheme) setTheme(savedTheme);
    if (savedCardStyle) setCardStyle(savedCardStyle);
    if (savedTableColor) setTableColor(savedTableColor);
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedDarkMode !== null) setDarkMode(savedDarkMode !== 'false');

    // Apply theme settings to document
    applyThemeToDocument(
      savedTheme || 'default',
      savedCardStyle || 'classic',
      savedTableColor || 'green',
      savedFontSize || 'medium',
      savedDarkMode !== 'false'
    );
  }, []);

  // Apply theme settings to document
  const applyThemeToDocument = (
    theme: ThemeType,
    cardStyle: CardStyleType,
    tableColor: TableColorType,
    fontSize: FontSizeType,
    darkMode: boolean
  ) => {
    const root = document.documentElement;
    
    // Remove all previous theme classes
    root.classList.remove(
      'theme-default', 'theme-classic', 'theme-modern', 'theme-neon', 'theme-dark',
      'cards-classic', 'cards-minimal', 'cards-vintage', 'cards-modern',
      'table-green', 'table-blue', 'table-red', 'table-purple', 'table-black',
      'text-small', 'text-medium', 'text-large', 'text-x-large'
    );
    
    // Add new theme classes
    root.classList.add(`theme-${theme}`);
    root.classList.add(`cards-${cardStyle}`);
    root.classList.add(`table-${tableColor}`);
    root.classList.add(`text-${fontSize}`);
    
    // Set dark mode
    if (darkMode) {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
    
    // Apply table color as CSS variable
    let tableColorHex = '#0d7a3e'; // Default green
    switch (tableColor) {
      case 'blue': tableColorHex = '#0d3c7a'; break;
      case 'red': tableColorHex = '#7a0d0d'; break;
      case 'purple': tableColorHex = '#4a0d7a'; break;
      case 'black': tableColorHex = '#1a1a1a'; break;
    }
    root.style.setProperty('--table-color', tableColorHex);
    
    // Apply font size as CSS variable
    let fontSizeValue = '1rem'; // Default medium
    switch (fontSize) {
      case 'small': fontSizeValue = '0.875rem'; break;
      case 'large': fontSizeValue = '1.125rem'; break;
      case 'x-large': fontSizeValue = '1.25rem'; break;
    }
    root.style.setProperty('--base-font-size', fontSizeValue);
  };

  // Update theme
  const updateTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('blackjack-theme', newTheme);
    applyThemeToDocument(newTheme, cardStyle, tableColor, fontSize, darkMode);
  };

  // Update card style
  const updateCardStyle = (newStyle: CardStyleType) => {
    setCardStyle(newStyle);
    localStorage.setItem('blackjack-cardStyle', newStyle);
    applyThemeToDocument(theme, newStyle, tableColor, fontSize, darkMode);
  };

  // Update table color
  const updateTableColor = (newColor: TableColorType) => {
    setTableColor(newColor);
    localStorage.setItem('blackjack-tableColor', newColor);
    applyThemeToDocument(theme, cardStyle, newColor, fontSize, darkMode);
  };

  // Update font size
  const updateFontSize = (newSize: FontSizeType) => {
    setFontSize(newSize);
    localStorage.setItem('blackjack-fontSize', newSize);
    applyThemeToDocument(theme, cardStyle, tableColor, newSize, darkMode);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('blackjack-darkMode', newDarkMode.toString());
    applyThemeToDocument(theme, cardStyle, tableColor, fontSize, newDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        cardStyle,
        tableColor,
        fontSize,
        darkMode,
        updateTheme,
        updateCardStyle,
        updateTableColor,
        updateFontSize,
        toggleDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 