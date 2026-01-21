import { useState } from 'react';
import { useTipoPermisos, useDeleteTipoPermiso, useToggleActiveTipoPermiso } from '@/hooks/queries/useTipoPermiso';
import { useNotification } from '@/hooks/useNotification';
import { CreateTipoPermisoModal } from '@/components/features/tipo-permisos/CreateTipoPermisoModal';
import { EditTipoPermisoModal } from '@/components/features/tipo-permisos/EditTipoPermisoModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Power, FileText } from 'lucide-react';
import type { TipoPermiso } from '@/types/tipo-permiso.type';

export const TipoPermisoPage = () => {
  const notify = useNotification();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTipoPermisoId, setSelectedTipoPermisoId] = useState<number | null>(null);

  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [tipoToToggle, setTipoToToggle] = useState<{ id: number; nombre: string; isActive: boolean } | null>(null);

  // ✅ Obtener tipos de permiso con React Query
  const { data, isLoading, error } = useTipoPermisos({
    page,
    limit,
    search: search || undefined,
  });

  // ✅ Mutations
  const { mutate: deleteTipoPermiso, isPending: isDeleting } = useDeleteTipoPermiso();
  const { mutate: toggleActive, isPending: isToggling } = useToggleActiveTipoPermiso();

  // Handlers
  const handleDelete = (tipoPermiso: TipoPermiso) => {
    setTipoToDelete({ id: tipoPermiso.id, nombre: tipoPermiso.nombre });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!tipoToDelete) return;

    deleteTipoPermiso(tipoToDelete.id, {
      onSuccess: () => {
        notify.success('Tipo de Permiso Eliminado', 'El tipo de permiso se ha eliminado correctamente');
        setTipoToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleToggleActive = (tipoPermiso: TipoPermiso) => {
    setTipoToToggle({ 
      id: tipoPermiso.id, 
      nombre: tipoPermiso.nombre, 
      isActive: tipoPermiso.isActive 
    });
    setToggleConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!tipoToToggle) return;

    toggleActive(tipoToToggle.id, {
      onSuccess: () => {
        const estado = tipoToToggle.isActive ? 'desactivado' : 'activado';
        notify.success('Estado Actualizado', `El tipo de permiso ha sido ${estado} correctamente`);
        setTipoToToggle(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleEdit = (id: number) => {
    setSelectedTipoPermisoId(id);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  // Columnas de la tabla
  const columns = [
    {
      header: 'ID',
      accessor: (tipoPermiso: TipoPermiso) => tipoPermiso.id,
    },
    {
      header: 'Nombre',
      accessor: (tipoPermiso: TipoPermiso) => (
        <div>
          <p className="font-semibold text-gray-900">{tipoPermiso.nombre}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{tipoPermiso.descripcion}</p>
        </div>
      ),
    },
    {
      header: 'Costos',
      accessor: (tipoPermiso: TipoPermiso) => (
        <div className="text-sm">
          <p className="font-medium">${tipoPermiso.costoBase}</p>
          <p className="text-xs text-gray-500">
            {tipoPermiso.numUMAsBase} UMAs / {tipoPermiso.numSalariosBase} Salarios
          </p>
        </div>
      ),
    },
    {
      header: 'Vigencia',
      accessor: (tipoPermiso: TipoPermiso) => (
        <Badge variant="outline">
          {tipoPermiso.vigenciaDefecto} días
        </Badge>
      ),
    },
    {
      header: 'Campos',
      accessor: (tipoPermiso: TipoPermiso) => {
        const numCampos = tipoPermiso.camposPersonalizados?.fields?.length || 0;
        return (
          <Badge variant="secondary">
            <FileText className="h-3 w-3 mr-1" />
            {numCampos} {numCampos === 1 ? 'campo' : 'campos'}
          </Badge>
        );
      },
    },
    {
      header: 'Permisos',
      accessor: (tipoPermiso: TipoPermiso) => (
        <Badge variant="outline">
          {tipoPermiso._count.permisos} {tipoPermiso._count.permisos === 1 ? 'permiso' : 'permisos'}
        </Badge>
      ),
    },
    {
      header: 'Sede',
      accessor: (tipoPermiso: TipoPermiso) => tipoPermiso.sede.name,
    },
    {
      header: 'Subsede',
      accessor: (tipoPermiso: TipoPermiso) => tipoPermiso.subsede.name,
    },
    {
      header: 'Estado',
      accessor: (tipoPermiso: TipoPermiso) => (
        <Badge variant={tipoPermiso.isActive ? 'default' : 'secondary'}>
          {tipoPermiso.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessor: (tipoPermiso: TipoPermiso) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(tipoPermiso.id)}
            className="hover:bg-blue-50 hover:text-blue-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleActive(tipoPermiso)}
            disabled={isToggling}
            className={
              tipoPermiso.isActive
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }
            title={tipoPermiso.isActive ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(tipoPermiso)}
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
      <div className="p-6">
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-800">
          Error al cargar tipos de permiso: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tipos de Permiso</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los tipos de permisos del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tipo de Permiso
        </Button>
      </div>

      {/* Buscador */}
      <div className="neomorph-flat p-4">
        <input
          type="text"
          placeholder="Buscar tipos de permiso..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 neomorph-input"
        />
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Cargando tipos de permiso...</span>
        </div>
      ) : (
        <DataTable
          data={data?.items || []}
          columns={columns}
          currentPage={data?.pagination.currentPage || 1}
          totalPages={data?.pagination.totalPages || 1}
          totalItems={data?.pagination.totalItems || 0}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => console.log('Change size:', newSize)}
        />
      )}

      {/* Modales */}
      <CreateTipoPermisoModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {selectedTipoPermisoId && (
        <EditTipoPermisoModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTipoPermisoId(null);
          }}
          tipoPermisoId={selectedTipoPermisoId}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Tipo de Permiso"
        description={`¿Estás seguro de que deseas eliminar el tipo de permiso "${tipoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />

      {/* Diálogo de confirmación para toggle */}
      <ConfirmDialog
        open={toggleConfirmOpen}
        onOpenChange={setToggleConfirmOpen}
        title={tipoToToggle?.isActive ? "Desactivar Tipo de Permiso" : "Activar Tipo de Permiso"}
        description={`¿Estás seguro de que deseas ${tipoToToggle?.isActive ? "desactivar" : "activar"} el tipo de permiso "${tipoToToggle?.nombre}"?`}
        confirmText={tipoToToggle?.isActive ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={tipoToToggle?.isActive ? "warning" : "success"}
        onConfirm={confirmToggle}
        isLoading={isToggling}
      />
    </div>
  );
};
