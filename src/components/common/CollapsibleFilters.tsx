import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filters } from './Filters';

interface FilterConfig {
  name: string;
  label: string;
  type: 'search' | 'select' | 'searchable-select';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  value: any;
  onChange: (value: any) => void;
  queryKey?: string[];
  queryFn?: (params: { page: number; search: string; limit: number }) => Promise<any>;
  getOptionLabel?: (item: any) => string;
  getOptionValue?: (item: any) => string | number;
  className?: string;
}

interface CollapsibleFiltersProps {
  filters: FilterConfig[];
  onClearFilters?: () => void;
  className?: string;
}

export const CollapsibleFilters = ({ 
  filters, 
  onClearFilters,
  className = '' 
}: CollapsibleFiltersProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // ✅ Contar filtros activos (excluyendo búsqueda que siempre está visible)
  const activeFiltersCount = filters.filter(f => {
    if (f.type === 'search') return false; // No contar búsqueda
    if (f.value === '' || f.value === undefined || f.value === null) return false;
    return true;
  }).length;

  // ✅ Obtener etiquetas de filtros activos para mostrar como badges
  const getActiveFilterLabel = (filter: FilterConfig) => {
    if (!filter.value || filter.value === '') return null;

    if (filter.type === 'select') {
      const option = filter.options?.find(o => String(o.value) === String(filter.value));
      return option ? `${filter.label}: ${option.label}` : null;
    }

    // Para searchable-select, solo mostrar que está activo
    return `${filter.label}: Seleccionado`;
  };

  const activeFilterLabels = filters
    .filter(f => f.type !== 'search')
    .map(getActiveFilterLabel)
    .filter(Boolean);

  return (
    <Card className={`shadow-[2px_2px_6px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.9)] border-none ${className}`}>
      {/* ✅ Header con contador y botón colapsar */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            
            {/* ✅ Badge con contador de filtros activos */}
            {activeFiltersCount > 0 && (
              <Badge 
                variant="default" 
                className="shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]"
              >
                {activeFiltersCount} {activeFiltersCount === 1 ? 'activo' : 'activos'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Botón limpiar filtros */}
            {activeFiltersCount > 0 && onClearFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}

            {/* ✅ Botón colapsar/expandir */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Mostrar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ✅ Mostrar badges de filtros activos cuando está colapsado */}
        {!isOpen && activeFilterLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilterLabels.map((label, idx) => (
              <Badge 
                key={idx} 
                variant="secondary"
                className="shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]"
              >
                {label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Contenido con animación suave */}
      {isOpen && (
        <CardContent className="p-4 animate-in slide-in-from-top-2 duration-200">
          <Filters filters={filters} />
        </CardContent>
      )}
    </Card>
  );
};