import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export const useTheme = () => {
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    if (!currentTheme) {
      console.log('⚠️ useTheme: No hay tema cargado');
      return;
    }

    console.log('🎨 Aplicando tema:', currentTheme.name);
    console.log('🎨 Colores del tema:', {
      primary: currentTheme.primaryColor,
      secondary: currentTheme.secondaryColor,
      background: currentTheme.backgroundColor,
    });

    const root = document.documentElement;

    // Aplicar colores principales
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

    console.log('✅ Tema aplicado correctamente');
  }, [currentTheme]);

  return { currentTheme };
};
