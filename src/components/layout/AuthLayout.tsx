import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="mb-8 text-center">
        <h1
          className="text-5xl font-bold mb-2"
          style={{ color: 'var(--color-primary)' }}
        >
          CiviGest
        </h1>
        <p
          className="text-base"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Sistema de Gestión Municipal
        </p>
      </div>

      {children}

      <footer
        className="mt-8 text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        © 2024 CiviGest. Todos los derechos reservados.
      </footer>
    </div>
  );
}
