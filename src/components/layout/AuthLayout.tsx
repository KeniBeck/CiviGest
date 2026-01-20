import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Contenido principal (LoginForm con logo incluido) */}
      {children}

      {/* Footer */}
      <footer
        className="mt-8 text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        © {new Date().getFullYear()} Tu Ciudad Digital. Todos los derechos reservados.
      </footer>
    </div>
  );
}
