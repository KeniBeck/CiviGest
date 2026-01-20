import { useState } from 'react';
import {
  useTipoAgentes,
  useDeleteTipoAgente,
  useToggleTipoAgente,
} from '@/hooks/queries/useTipoAgente';
import { useNotification } from '@/hooks/useNotification';
import { CreateTipoAgenteModal } from '@/components/features/tipo-agentes/CreateTipoAgenteModal';
import { EditTipoAgenteModal } from '@/components/features/tipo-agentes/EditTipoAgenteModal';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Power, Users } from 'lucide-react';
import type { TipoAgente } from '@/types/tipo-agente.type';

export const TipoAgentePage = () => {
  const notify = useNotification();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTipoAgente, setSelectedTipoAgente] = useState<TipoAgente | null>(null);

  // ✅ Obtener tipos de agente con React Query
  const { data, isLoading, error } = useTipoAgentes({
    page,
    limit,
    search: search || undefined,
  });

  // ✅ Mutations con notificaciones
  const { mutate: deleteTipoAgente, isPending: isDeleting } = useDeleteTipoAgente();
  const { mutate: toggleTipoAgente, isPending: isToggling } = useToggleTipoAgente();

  // Handlers
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (tipoAgente: TipoAgente) => {
    setSelectedTipoAgente(tipoAgente);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el tipo de agente "${nombre}"?`)) {
      deleteTipoAgente(id, {
        onSuccess: () => {
          notify.success('Tipo de Agente Eliminado', 'El tipo de agente se ha eliminado correctamente');
        },
        onError: (error) => {
          notify.apiError(error);
        },
      });
    }
  };

  const handleToggle = (id: number) => {
    toggleTipoAgente(id, {
      onSuccess: (data) => {
        const estado = data.data.isActive ? 'activado' : 'desactivado';
        notify.success('Estado Actualizado', `El tipo de agente ha sido ${estado} correctamente`);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTipoAgente(null);
  };

  // ✅ Configuración de columnas del DataTable
  const columns = [
    {
      header: 'Tipo',
      accessor: (tipoAgente: TipoAgente) => (
        <div>
          <p className="font-semibold text-gray-900">{tipoAgente.tipo}</p>
          <p className="text-xs text-gray-500">
            {tipoAgente.sede.name} - {tipoAgente.subsede.name}
          </p>
        </div>
      ),
    },
    {
      header: 'Agentes',
      accessor: (tipoAgente: TipoAgente) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-gray-900">
            {tipoAgente._count.agentes}
          </span>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (tipoAgente: TipoAgente) => (
        <Badge variant={tipoAgente.isActive ? 'default' : 'outline'}>
          {tipoAgente.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Fecha de Creación',
      accessor: (tipoAgente: TipoAgente) =>
        new Date(tipoAgente.createdAt).toLocaleDateString('es-MX'),
    },
    {
      header: 'Acciones',
      accessor: (tipoAgente: TipoAgente) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(tipoAgente)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggle(tipoAgente.id)}
            disabled={isToggling}
            className={
              tipoAgente.isActive
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }
            title={tipoAgente.isActive ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(tipoAgente.id, tipoAgente.tipo)}
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
        <p className="text-red-600">Error al cargar los tipos de agente</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Agente</h1>
          <p className="text-gray-600 mt-1">
            Gestión de tipos de agentes del sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Tipo de Agente
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar tipo de agente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
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
      <CreateTipoAgenteModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditTipoAgenteModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        tipoAgente={selectedTipoAgente}
      />
    </div>
  );
};
