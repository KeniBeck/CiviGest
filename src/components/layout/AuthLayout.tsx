import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-zinc-900">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          CiviGest
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sistema de Gestión Municipal
        </p>
      </div>

      {children}

      <footer className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        © 2024 CiviGest. Todos los derechos reservados.
      </footer>
    </div>
  );
}
