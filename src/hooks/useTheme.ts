import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export const useTheme = () => {
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    if (!currentTheme) return;

    const root = document.documentElement;

    root.style.setProperty('--color-primary', currentTheme.primaryColor);
    root.style.setProperty('--color-secondary', currentTheme.secondaryColor);
    root.style.setProperty('--color-accent', currentTheme.accentColor);
    root.style.setProperty('--color-background', currentTheme.backgroundColor);
    root.style.setProperty('--color-surface', currentTheme.surfaceColor);
    root.style.setProperty(
      '--color-text-primary',
      currentTheme.textPrimaryColor
    );
    root.style.setProperty(
      '--color-text-secondary',
      currentTheme.textSecondaryColor
    );
    root.style.setProperty('--color-success', currentTheme.successColor);
    root.style.setProperty('--color-warning', currentTheme.warningColor);
    root.style.setProperty('--color-error', currentTheme.errorColor);
    root.style.setProperty('--color-info', currentTheme.infoColor);
  }, [currentTheme]);

  return { currentTheme };
};
