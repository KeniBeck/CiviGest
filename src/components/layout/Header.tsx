import { Menu } from 'lucide-react';
import { useLayoutStore } from '@/stores/layoutStore';
import { useThemeStore } from '@/stores/themeStore';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { toggleSidebar } = useLayoutStore();
  const { configuracion } = useThemeStore();

  return (
    <header className="h-16 bg-gray-50 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Toggle + Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-3">
            {configuracion?.logo && (
              <img
                src={configuracion.logo}
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
            )}
            <div className="hidden sm:block">
              <h1
                className="text-lg font-bold mb-2"
                style={{ color: 'var(--color-primary)' }}
              >
                {configuracion?.nombreCliente || 'CiviGest'}
              </h1>
              {configuracion?.slogan && (
                <p className="text-xs text-gray-500">{configuracion.slogan}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
