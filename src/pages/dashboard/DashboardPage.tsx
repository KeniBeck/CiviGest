import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              CiviGest
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sistema de Gestión Municipal
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Bienvenido, {user?.firstName} {user?.lastName}
            </CardTitle>
            <CardDescription>
              Has iniciado sesión exitosamente en CiviGest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Email
                </p>
                <p className="mt-1 text-lg font-semibold">{user?.email}</p>
              </div>

              <div className="rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Usuario
                </p>
                <p className="mt-1 text-lg font-semibold">{user?.username}</p>
              </div>

              <div className="rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Nivel de Acceso
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {user?.accessLevel}
                </p>
              </div>

              <div className="rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Roles
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {user?.roles.join(', ')}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                🚧 Módulos en Desarrollo
              </p>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Los módulos de gestión estarán disponibles próximamente. Por
                ahora, puedes explorar la interfaz de autenticación.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto border-t bg-white py-4 dark:bg-zinc-950">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          © 2024 CiviGest. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
