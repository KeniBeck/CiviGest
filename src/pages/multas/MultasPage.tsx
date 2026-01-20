import { useState } from 'react';
import {
  useMultas,
  useDeleteMulta,
  useToggleMulta,
} from '@/hooks/queries/useMultas';
import { useDepartamentos } from '@/hooks/queries/useDepartamento';
import { CreateMultaModal } from '@/components/features/multas/CreateMultaModal';
import { EditMultaModal } from '@/components/features/multas/EditMultaModal';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Power, Receipt } from 'lucide-react';
import type { Multas } from '@/types/multas.type';

export const MultasPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [departamentoFilter, setDepartamentoFilter] = useState<number | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMulta, setSelectedMulta] = useState<Multas | null>(null);

  // ✅ Obtener multas con React Query
  const { data, isLoading, error } = useMultas({
    page,
    limit,
    search: search || undefined,
    departamentoId: departamentoFilter || undefined,
  });

  // ✅ Cargar departamentos para filtro
  const { data: departamentosData } = useDepartamentos({ 
    page: 1, 
    limit: 100, 
    isActive: true 
  });

  // ✅ Mutations
  const { mutate: deleteMulta, isPending: isDeleting } = useDeleteMulta();
  const { mutate: toggleMulta, isPending: isToggling } = useToggleMulta();

  // Handlers
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (multa: Multas) => {
    setSelectedMulta(multa);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la multa "${nombre}"?`)) {
      deleteMulta(id);
    }
  };

  const handleToggle = (id: number) => {
    toggleMulta(id);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMulta(null);
  };

  // ✅ Configuración de columnas del DataTable
  const columns = [
    {
      header: 'Código',
      accessor: (multa: Multas) => (
        <div>
          <p className="font-semibold text-gray-900 font-mono">{multa.codigo}</p>
          <p className="text-sm text-gray-500">{multa.nombre}</p>
        </div>
      ),
    },
    {
      header: 'Descripción',
      accessor: (multa: Multas) => (
        <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
          {multa.descripcion}
        </p>
      ),
    },
    {
      header: 'Departamento',
      accessor: (multa: Multas) => (
        <div className="text-sm">
          <p className="text-gray-900">{multa.departamento.nombre}</p>
        </div>
      ),
    },
    {
      header: 'Costo',
      accessor: (multa: Multas) => (
        <div className="flex items-center gap-1">
          <Receipt className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-gray-900">
            ${parseFloat(multa.costo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      ),
    },
    {
      header: 'UMAs / Salarios',
      accessor: (multa: Multas) => (
        <div className="text-sm text-gray-700">
          <p>UMAs: {parseFloat(multa.numUMAs).toFixed(2)}</p>
          <p>Salarios: {parseFloat(multa.numSalarios).toFixed(2)}</p>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (multa: Multas) => (
        <Badge variant={multa.isActive ? 'default' : 'outline'}>
          {multa.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessor: (multa: Multas) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(multa)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggle(multa.id)}
            disabled={isToggling}
            className={
              multa.isActive
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }
            title={multa.isActive ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(multa.id, multa.nombre)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error al cargar las multas</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multas</h1>
          <p className="text-gray-600 mt-1">
            Catálogo de multas e infracciones del sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Multa
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Buscar por código o nombre..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={departamentoFilter}
              onChange={(e) => {
                setDepartamentoFilter(e.target.value ? parseInt(e.target.value) : '');
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los departamentos</option>
              {departamentosData?.data.items.map((depto) => (
                <option key={depto.id} value={depto.id}>
                  {depto.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <DataTable
            data={data?.data.items || []}
            columns={columns}
            currentPage={data?.data.pagination.currentPage || 1}
            totalPages={data?.data.pagination.totalPages || 1}
            totalItems={data?.data.pagination.totalItems || 0}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Modales */}
      <CreateMultaModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditMultaModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        multa={selectedMulta}
      />
    </div>
  );
};
