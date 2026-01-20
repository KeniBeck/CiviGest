import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLayoutStore } from '@/stores/layoutStore';
import { useNavigation } from '@/hooks/useNavigation';
import { MenuItem } from './MenuItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { menu } = useNavigation();

  return (
    <>
      {/* Overlay para móvil - solo cuando sidebar está abierto */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative top-0 left-0 h-screen lg:h-full bg-gray-50 z-50 transition-all duration-300 shrink-0',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]',
          sidebarCollapsed
            ? '-translate-x-full lg:translate-x-0 lg:w-20'
            : 'translate-x-0 w-72'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header del Sidebar */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h2
                className="font-bold text-lg"
                style={{ color: 'var(--color-primary)' }}
              >
                Tu Ciudad Digital
              </h2>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="ml-auto"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menu.map((item, idx) => (
              <MenuItem key={idx} item={item} collapsed={sidebarCollapsed} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
