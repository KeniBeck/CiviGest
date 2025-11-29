import { useState } from 'react';
import { Edit, Trash, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Filters } from '@/components/common/Filters';
import { DataTable } from '@/components/common/DataTable';
import { useSubsedes, useDeleteSubsede } from '@/hooks/queries/useSubsedes';
import { useDebounce } from '@/hooks/useDebounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { sedeService } from '@/services/sede.service';
import type { Subsede } from '@/types/subsede.types';
import type { Sede } from '@/types/sede.types';
import type { Column } from '@/components/common/DataTable';

const SubsedesPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  // ✅ Determinar si es SUPER_ADMIN
  const isSuperAdmin = currentUser?.roles.some((r) =>
    r.toLowerCase().includes('super')
  );

  // ✅ Estado de filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined as boolean | undefined,
    sedeId: undefined as number | undefined,
  });

  // ✅ Debounce para búsqueda
  const debouncedSearch = useDebounce(filters.search, 500);

  // ✅ Query de subsedes - solo enviar parámetros si NO son undefined
  const { data, isLoading, error } = useSubsedes({
    page: filters.page,
    limit: filters.limit,
    search: debouncedSearch,
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters.sedeId !== undefined && { sedeId: filters.sedeId }),
  });

  const { mutate: deleteSubsede } = useDeleteSubsede();

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta subsede?')) {
      deleteSubsede(id);
    }
  };

  // ✅ Columnas de la tabla
  const columns: Column<Subsede>[] = [
    {
      header: 'Nombre',
      accessor: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">Código: {row.code}</div>
        </div>
      ),
    },
    {
      header: 'Código',
      accessor: 'code',
    },
    // ✅ Columna SEDE - solo para SUPER_ADMIN
    ...(isSuperAdmin
      ? [
          {
            header: 'Estado',
            accessor: (row: Subsede) => row.sede?.name || '-',
          },
        ]
      : []),
    {
      header: 'Usuarios',
      accessor: (row) => (
        <span className="text-sm">{row._count?.users || 0}</span>
      ),
    },
    {
      header: 'Estado',
      accessor: (row) => (
        <Badge variant={row.isActive ? 'default' : 'destructive'}>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  // ✅ Configuración de filtros
  const filterConfigs = [
    {
      name: 'search',
      label: 'Buscar',
      type: 'search' as const,
      placeholder: 'Buscar por nombre o código...',
      value: filters.search,
      onChange: (value: string) =>
        setFilters((prev) => ({ ...prev, search: value, page: 1 })),
    },
    {
      name: 'isActive',
      label: 'Estado',
      type: 'select' as const,
      placeholder: 'Todos los estados',
      options: [
        { label: 'Todos', value: '0' },
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' },
      ],
      value: filters.isActive === undefined ? '0' : String(filters.isActive),
      onChange: (value: string) =>
        setFilters((prev) => ({
          ...prev,
          isActive: value === '0' ? undefined : value === 'true',
          page: 1,
        })),
    },

    // ✅ Filtro SEDE - solo SUPER_ADMIN
    ...(isSuperAdmin
      ? [
          {
            name: 'sedeId',
            label: 'Estado',
            type: 'searchable-select' as const,
            placeholder: 'Todos los estados',
            value: filters.sedeId || '0',
            onChange: (value: string) =>
              setFilters((prev) => ({
                ...prev,
                sedeId: value === '0' ? undefined : Number(value),
                page: 1,
              })),
            queryKey: ['sedes-filter'],
            queryFn: async ({
              page,
              search,
              limit,
            }: {
              page: number;
              search: string;
              limit: number;
            }) => {
              const response = await sedeService.getAll({ page, search, limit });
              return response.data;
            },
            getOptionLabel: (item: Sede) => item.name,
            getOptionValue: (item: Sede) => item.id,
          },
        ]
      : []),
  ];

  const subsedes = data?.items || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    totalPages: 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subsedes (Municipios)
          </h1>
          <p className="text-gray-500 mt-1">Gestiona las subsedes del sistema</p>
        </div>
        <Button className="shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.95)]">
          <MapPin className="h-4 w-4 mr-2" />
          Nueva Subsede
        </Button>
      </div>

      {/* ✅ Filtros dinámicos */}
      <Filters filters={filterConfigs} />

      {/* ✅ Tabla */}
      <DataTable
        data={subsedes}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.itemsPerPage}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) =>
          setFilters((prev) => ({ ...prev, limit, page: 1 }))
        }
        actions={(subsede) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-red-600"
              onClick={() => handleDelete(subsede.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default SubsedesPage;
