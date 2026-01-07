import { LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useLogout } from '@/hooks/queries/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const UserMenu = () => {
  const { user } = useAuthStore();
  const { configuracion } = useThemeStore();
  const { mutate: logout, isPending: isLoading } = useLogout();

  if (!user) return null;

  // Iniciales del usuario
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.95)] transition-all">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            <AvatarFallback
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.roles[0]}</p>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {configuracion && (
              <p className="text-xs text-gray-500 mt-1">
                {configuracion.nombreCliente}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Mi Perfil
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Configuración
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => logout()}
          disabled={isLoading}
          className="text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
