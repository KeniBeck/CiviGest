import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Loader2,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  // Data
  data: T[];
  columns: Column<T>[];

  // Estados
  isLoading?: boolean;
  error?: string | null;

  // Paginación
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // Acciones por fila
  actions?: (row: T) => React.ReactNode;

  // Búsqueda (opcional)
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  isLoading = false,
  error = null,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue || '');

  // Debounce para búsqueda
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (onSearchChange) {
      const timeoutId = setTimeout(() => {
        onSearchChange(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  // Calcular rango de registros mostrados
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="w-full space-y-4">
      {/* Búsqueda */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 neomorph-input"
          />
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Estado de carga */}
              {isLoading && (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p className="text-sm">Cargando datos...</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Estado de error */}
              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12"
                  >
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p className="text-sm font-medium">Error al cargar datos</p>
                      <p className="text-xs text-gray-500 mt-1">{error}</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Estado vacío */}
              {!isLoading && !error && data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Inbox className="h-8 w-8 mb-2" />
                      <p className="text-sm">No hay datos disponibles</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Datos */}
              {!isLoading &&
                !error &&
                data.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-gray-100 transition-all duration-200',
                      'hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]',
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900',
                          column.className
                        )}
                      >
                        {typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : String(row[column.accessor])}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {actions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!isLoading && !error && data.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info de registros */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Mostrando {startItem} - {endItem} de {totalItems} registros
              </span>

              {/* Select de items por página */}
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>

            {/* Botones de paginación */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="neomorph-button"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="neomorph-button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-4 py-1 text-sm text-gray-700 bg-gray-100 rounded-lg">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="neomorph-button"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="neomorph-button"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
