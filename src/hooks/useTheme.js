import { useState, useEffect } from 'react';

const STORAGE_KEY = 'deskbutler-theme';
const THEME_ATTRIBUTE = 'data-theme';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function getEffectiveTheme(theme) {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(theme) {
  const effectiveTheme = getEffectiveTheme(theme);
  document.documentElement.setAttribute(THEME_ATTRIBUTE, effectiveTheme);
}

// Apply theme immediately on module load to prevent flash
const initialTheme = getStoredTheme() || 'dark';
if (typeof document !== 'undefined') {
  applyTheme(initialTheme);
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return getStoredTheme() || 'dark';
  });

  const effectiveTheme = getEffectiveTheme(theme);
  const isDark = effectiveTheme === 'dark';
  const isLight = effectiveTheme === 'light';

  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light' || newTheme === 'system') {
      setThemeState(newTheme);
    }
  };

  return {
    theme,
    setTheme,
    effectiveTheme,
    isDark,
    isLight,
  };
}
