import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItem as MenuItemType } from '@/config/navigation';

interface MenuItemProps {
  item: MenuItemType;
  collapsed: boolean;
}

export const MenuItem = ({ item, collapsed }: MenuItemProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = item.path ? location.pathname === item.path : false;
  const hasChildren = item.children && item.children.length > 0;

  // Item sin children - Link directo
  if (!hasChildren && item.path) {
    return (
      <Link
        to={item.path}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]',
          'hover:shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.95)]',
          isActive &&
            'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]',
          isActive && 'bg-[var(--color-primary)] text-white',
          !isActive && 'text-gray-700'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium">{item.label}</span>
        )}
      </Link>
    );
  }

  // Item con children - Accordion
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]',
          'hover:shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.95)]',
          'text-gray-700'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1 text-left">
              {item.label}
            </span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </>
        )}
      </button>

      {/* Subitems */}
      {!collapsed && isOpen && hasChildren && (
        <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
          {item.children!.map((child, idx) => (
            <MenuItem key={idx} item={child} collapsed={false} />
          ))}
        </div>
      )}
    </div>
  );
};
