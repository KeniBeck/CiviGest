import { useAuthStore } from '@/stores/authStore';

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: 'var(--color-primary)' }}
        >
          Bienvenido, {user?.firstName}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-8">
          {user?.email}
        </p>

        <div
          className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center"
          style={{ borderColor: 'var(--color-primary)' }}
        >
          <p className="text-xl sm:text-2xl text-gray-400">
            🚧 Módulos en desarrollo
          </p>
        </div>
      </div>
    </div>
  );
}
