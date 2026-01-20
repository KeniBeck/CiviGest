import { Menu } from 'lucide-react';
import { useLayoutStore } from '@/stores/layoutStore';
import { useThemeStore } from '@/stores/themeStore';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { toggleSidebar } = useLayoutStore();
  const { configuracion } = useThemeStore();

  return (
    <header className="h-16 bg-gray-50 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] shrink-0 z-30">
      <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2">
        {/* Left: Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden shrink-0"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {configuracion?.logo && (
              <img
                src={configuracion.logo}
                alt="Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0"
              />
            )}
            <div className="hidden sm:block min-w-0">
              <h1
                className="text-sm sm:text-base md:text-lg font-bold truncate"
                style={{ color: 'var(--color-primary)' }}
              >
                {configuracion?.nombreCliente || 'Tu Ciudad Digital'}
              </h1>
              {configuracion?.slogan && (
                <p className="text-xs text-gray-500 mt-0.5 truncate hidden md:block">
                  {configuracion.slogan}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="shrink-0">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
