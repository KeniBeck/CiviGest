import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center px-4 py-6 sm:py-10 overflow-y-auto"
      style={{ backgroundColor: 'var(--color-background, #e8ecf1)' }}
    >
      {/* Spacer para empujar al centro cuando hay espacio */}
      <div className="flex-1" />

      {/* Contenido principal (LoginForm con logo incluido) */}
      {children}

      {/* Spacer + Footer */}
      <div className="flex-1 flex flex-col justify-end">
        <footer
          className="mt-6 sm:mt-8 pb-2 text-center text-xs sm:text-sm font-medium tracking-wide"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          © {new Date().getFullYear()} Tu Ciudad Digital
        </footer>
      </div>
    </div>
  );
}
