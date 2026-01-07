import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SearchableSelect } from './SearchableSelect';

interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterConfig {
  name: string;
  label: string;
  type: 'search' | 'select' | 'searchable-select';
  placeholder?: string;
  options?: FilterOption[];
  value: any;
  onChange: (value: any) => void;
  // ✅ Props para searchable-select
  queryKey?: (string | number)[];
  queryFn?: (params: { page: number; search: string; limit: number }) => Promise<any>;
  getOptionLabel?: (item: any) => string;
  getOptionValue?: (item: any) => string | number;
  className?: string;
}

interface FiltersProps {
  filters: FilterConfig[];
  className?: string;
}

export const Filters = ({ filters, className = '' }: FiltersProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {filters.map((filter) => (
        <div key={filter.name}>
          {filter.type === 'search' ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={filter.placeholder}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="pl-10 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border-none"
              />
            </div>
          ) : filter.type === 'searchable-select' ? (
            // ✅ Select con búsqueda y paginación
            <SearchableSelect
              placeholder={filter.placeholder || ''}
              value={filter.value}
              onChange={filter.onChange}
              queryKey={filter.queryKey || []}
              queryFn={filter.queryFn || (() => Promise.resolve({ items: [], pagination: {} }))}
              getOptionLabel={filter.getOptionLabel || ((item) => item.name)}
              getOptionValue={filter.getOptionValue || ((item) => item.id)}
              className={filter.className}
            />
          ) : (
            // Select normal
            <Select value={String(filter.value)} onValueChange={filter.onChange}>
              <SelectTrigger className="shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] border-none">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
    </div>
  );
};
