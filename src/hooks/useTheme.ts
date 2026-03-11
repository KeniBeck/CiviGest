import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

const hexToRgba = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const useTheme = () => {
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    if (!currentTheme) {
      return;
    }

    const root = document.documentElement;

    root.style.setProperty('--color-primary', currentTheme.primaryColor);
    root.style.setProperty('--color-secondary', currentTheme.secondaryColor);
    root.style.setProperty('--color-accent', currentTheme.accentColor);
    root.style.setProperty('--color-background', currentTheme.backgroundColor);
    root.style.setProperty('--color-surface', currentTheme.surfaceColor);
    root.style.setProperty('--color-text-primary', currentTheme.textPrimaryColor);
    root.style.setProperty('--color-text-secondary', currentTheme.textSecondaryColor);
    root.style.setProperty('--color-success', currentTheme.successColor);
    root.style.setProperty('--color-warning', currentTheme.warningColor);
    root.style.setProperty('--color-error', currentTheme.errorColor);
    root.style.setProperty('--color-info', currentTheme.infoColor);

    root.style.setProperty('--scrollbar-track', currentTheme.surfaceColor);
    root.style.setProperty('--scrollbar-thumb', hexToRgba(currentTheme.primaryColor, 0.45));
    root.style.setProperty('--scrollbar-thumb-hover', hexToRgba(currentTheme.primaryColor, 0.7));
    root.style.setProperty('--scrollbar-thumb-active', hexToRgba(currentTheme.primaryColor, 0.9));
  }, [currentTheme]);

  return { currentTheme };
};
