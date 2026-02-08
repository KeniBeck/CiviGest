import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { configuracion } = useThemeStore();
  const { mutate: logout, isPending: isLoading } = useLogout();

  if (!user) return null;

  // Iniciales del usuario
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_12px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,1)] hover:shadow-[2px_2px_8px_rgba(0,0,0,0.12),-2px_-2px_8px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] transition-all duration-200">
          <Avatar className="h-10 w-10 shrink-0 shadow-md ring-2 ring-white">
            <AvatarFallback
              className="font-semibold text-base"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 font-medium truncate">{user.roles[0]}</p>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-72 p-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-2xl"
      >
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 shrink-0 shadow-lg ring-2 ring-gray-100">
              <AvatarFallback
                className="font-bold text-lg"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              {configuracion && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {configuracion.nombreCliente}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem 
          onClick={() => navigate('/perfil')}
          className="rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all duration-200"
        >
          <User className="mr-3 h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Mi Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => navigate('/configuracion')}
          className="rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 transition-all duration-200"
        >
          <Settings className="mr-3 h-4 w-4 text-purple-600" />
          <span className="font-medium text-gray-700">Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={() => logout()}
          disabled={isLoading}
          className="rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 transition-all duration-200 text-red-600 font-medium"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
