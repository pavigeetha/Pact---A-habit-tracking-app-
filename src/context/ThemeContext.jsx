import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = {
  cottagecore: {
    id: 'cottagecore',
    name: 'Cherry Blossom',
    emoji: '🌸',
    description: 'Cozy cottagecore vibes with cherry blossoms',
    baseImage: '/assets/castle_base.png',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight City',
    emoji: '🌃',
    description: 'Neon-lit cyberpunk cityscape',
    baseImage: '/assets/midnight_base.png',
  },
};

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('pact-theme') || 'cottagecore';
  });

  useEffect(() => {
    localStorage.setItem('pact-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  const theme = THEMES[themeId];
  const toggleTheme = () => setThemeId(prev => prev === 'cottagecore' ? 'midnight' : 'cottagecore');
  const setTheme = (id) => { if (THEMES[id]) setThemeId(id); };

  return (
    <ThemeContext.Provider value={{ theme, themeId, toggleTheme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be within ThemeProvider');
  return ctx;
}
