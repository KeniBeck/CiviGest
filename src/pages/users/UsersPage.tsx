import { useState } from 'react';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useUsers, useDeleteUser } from '@/hooks/queries/useUsers';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/user.types';

const getRoleColorVariant = (
  level: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' => {
  switch (level) {
    case 'SUPER_ADMIN':
      return 'destructive'; // Rojo
    case 'ESTATAL':
      return 'default'; // Azul
    case 'MUNICIPAL':
      return 'success'; // Verde
    case 'OPERATIVO':
      return 'outline'; // Gris
    default:
      return 'default';
  }
};

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
``
  const { data, isLoading, error } = useUsers({
    page,
    limit,
    search: search || undefined,
    isActive,
  });

  const { mutate: deleteUser } = useDeleteUser();

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteUser(id);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Nombre',
      accessor: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Usuario',
      accessor: 'username',
    },
    {
      header: 'Documento',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {row.documentType}: {row.documentNumber}
        </span>
      ),
    },
    {
      header: 'Roles',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((r) => (
            <Badge key={r.id} variant={getRoleColorVariant(r.role.level)}>
              {r.role.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Municipio',
      accessor: (row) => row.subsede?.name || 'Sistema',
    },
    {
      header: 'Estado',
      accessor: (row) => (
        <Badge variant={row.isActive ? 'success' : 'destructive'}>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              Usuarios
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona los usuarios del sistema
            </p>
          </div>
          <Button
            className="shrink-0"
            onClick={() => alert('Formulario en desarrollo')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setIsActive(
                value === 'all' ? undefined : value === 'active'
              );
              setPage(1);
            }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {/* DataTable */}
        <DataTable
          data={data?.items || []}
          columns={columns}
          isLoading={isLoading}
          error={error?.message || null}
          currentPage={page}
          totalPages={data?.pagination?.totalPages || 1}
          totalItems={data?.pagination?.total || 0}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setLimit(size);
            setPage(1);
          }}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Buscar por nombre, email o username..."
          actions={(row) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert(`Editar usuario ${row.id}`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(row.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        />
      </div>
    </div>
  );
}
