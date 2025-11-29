import { useState, useRef } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  placeholder: string;
  value: string | number;
  onChange: (value: string) => void;
  queryKey: (string | number)[];
  queryFn: (params: { page: number; search: string; limit: number }) => Promise<any>;
  getOptionLabel: (item: any) => string;
  getOptionValue: (item: any) => string | number;
  emptyMessage?: string;
  className?: string;
}

export const SearchableSelect = ({
  placeholder,
  value,
  onChange,
  queryKey,
  queryFn,
  getOptionLabel,
  getOptionValue,
  emptyMessage = 'No se encontraron resultados',
  className = '',
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ useInfiniteQuery para paginación automática
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [...queryKey, search],
    queryFn: ({ pageParam = 1 }) =>
      queryFn({ page: pageParam, search, limit: 20 }),
    getNextPageParam: (lastPage) => {
      // ✅ Adaptarse a la estructura del backend (items/pagination)
      const pagination = lastPage.pagination || lastPage.meta;
      if (!pagination) return undefined;

      const { currentPage, totalPages } = pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: open, // Solo cargar cuando el select esté abierto
  });

  // ✅ Combinar todos los items de todas las páginas
  const allItems = data?.pages.flatMap(page => page.items || page.data) || [];

  // ✅ Buscar el item seleccionado para mostrar su label
  const selectedItem = allItems.find(item => String(getOptionValue(item)) === String(value));
  const displayValue = selectedItem ? getOptionLabel(selectedItem) : placeholder;

  // ✅ Infinite scroll: detectar cuando llega al final
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // Si está cerca del final (90%) y hay más páginas, cargar siguiente
    if (scrollHeight - scrollTop <= clientHeight * 1.1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border-none',
            !value && 'text-gray-500',
            className
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {/* ✅ Input de búsqueda */}
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* ✅ Lista de opciones con scroll */}
        <div
          ref={scrollRef}
          className="max-h-[300px] overflow-y-auto"
          onScroll={handleScroll}
        >
          {/* Opción "Todos" */}
          <div
            className={cn(
              'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100',
              value === '0' && 'bg-gray-100'
            )}
            onClick={() => {
              onChange('0');
              setOpen(false);
            }}
          >
            Todos
          </div>

          {/* ✅ Loading inicial */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {/* ✅ Lista de items */}
          {!isLoading && allItems.length > 0 && (
            <>
              {allItems.map((item: any) => {
                const itemValue = String(getOptionValue(item));
                const isSelected = itemValue === String(value);

                return (
                  <div
                    key={itemValue}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100',
                      isSelected && 'bg-gray-100 font-medium'
                    )}
                    onClick={() => {
                      onChange(itemValue);
                      setOpen(false);
                      setSearch(''); // Reset búsqueda al seleccionar
                    }}
                  >
                    {getOptionLabel(item)}
                  </div>
                );
              })}

              {/* ✅ Loading de siguiente página */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Cargando más...</span>
                </div>
              )}
            </>
          )}

          {/* ✅ Estado vacío */}
          {!isLoading && allItems.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-500">
              {emptyMessage}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
