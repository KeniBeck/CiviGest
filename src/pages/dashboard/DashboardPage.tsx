import { useLogout } from '@/hooks/queries/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              Bienvenido, {user?.firstName}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          <Button onClick={() => logout()} disabled={isPending}>
            {isPending ? 'Saliendo...' : 'Cerrar Sesión'}
          </Button>
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-12 text-center"
          style={{ borderColor: 'var(--color-primary)' }}
        >
          <p className="text-2xl text-gray-400">🚧 Módulos en desarrollo</p>
        </div>
      </div>
    </div>
  );
}
