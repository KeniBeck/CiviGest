import { useState } from 'react';
import { usePatrullas, useDeletePatrulla, useToggleActivePatrulla } from '@/hooks/queries/usePatrulla';
import { useNotification } from '@/hooks/useNotification';
import { CreatePatrullaModal } from '@/components/features/patrullas/CreatePatrullaModal';
import { EditPatrullaModal } from '@/components/features/patrullas/EditPatrullaModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Power } from 'lucide-react';
import type { Patrulla } from '@/types/patrulla.type';

export const PatrullaPage = () => {
  const notify = useNotification();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatrullaId, setSelectedPatrullaId] = useState<number | null>(null);

  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [patrullaToDelete, setPatrullaToDelete] = useState<{ id: number; numero: string } | null>(null);
  const [patrullaToToggle, setPatrullaToToggle] = useState<{ id: number; numero: string; isActive: boolean } | null>(null);

  // ✅ Obtener patrullas con React Query
  const { data, isLoading, error } = usePatrullas({
    page,
    limit,
    search: search || undefined,
  });

  // ✅ Mutations
  const { mutate: deletePatrulla, isPending: isDeleting } = useDeletePatrulla();
  const { mutate: toggleActive, isPending: isToggling } = useToggleActivePatrulla();

  // Handlers
  const handleDelete = (patrulla: Patrulla) => {
    setPatrullaToDelete({ id: patrulla.id, numero: patrulla.numPatrulla });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!patrullaToDelete) return;

    deletePatrulla(patrullaToDelete.id, {
      onSuccess: () => {
        notify.success('Patrulla Eliminada', 'La patrulla se ha eliminado correctamente');
        setPatrullaToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleToggleActive = (patrulla: Patrulla) => {
    setPatrullaToToggle({ 
      id: patrulla.id, 
      numero: patrulla.numPatrulla, 
      isActive: patrulla.isActive 
    });
    setToggleConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!patrullaToToggle) return;

    toggleActive(patrullaToToggle.id, {
      onSuccess: () => {
        const estado = patrullaToToggle.isActive ? 'desactivada' : 'activada';
        notify.success('Estado Actualizado', `La patrulla ha sido ${estado} correctamente`);
        setPatrullaToToggle(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleEdit = (id: number) => {
    setSelectedPatrullaId(id);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  // Columnas de la tabla
  const columns = [
    {
      header: 'ID',
      accessor: (patrulla: Patrulla) => patrulla.id,
    },
    {
      header: 'Número',
      accessor: (patrulla: Patrulla) => (
        <span className="font-semibold text-blue-600">{patrulla.numPatrulla}</span>
      ),
    },
    {
      header: 'Placa',
      accessor: (patrulla: Patrulla) => (
        <span className="font-mono font-semibold">{patrulla.placa}</span>
      ),
    },
    {
      header: 'Marca',
      accessor: (patrulla: Patrulla) => patrulla.marca,
    },
    {
      header: 'Modelo',
      accessor: (patrulla: Patrulla) => patrulla.modelo,
    },
    {
      header: 'Serie',
      accessor: (patrulla: Patrulla) => (
        <span className="text-xs font-mono text-gray-600">{patrulla.serie}</span>
      ),
    },
    {
      header: 'Sede',
      accessor: (patrulla: Patrulla) => patrulla.sede.name,
    },
    {
      header: 'Subsede',
      accessor: (patrulla: Patrulla) => patrulla.subsede.name,
    },
    {
      header: 'Agentes',
      accessor: (patrulla: Patrulla) => {
        const count = patrulla.agentes?.length || 0;
        return (
          <Badge variant="outline">
            {count} {count === 1 ? 'agente' : 'agentes'}
          </Badge>
        );
      },
    },
    {
      header: 'Estado',
      accessor: (patrulla: Patrulla) => (
        <Badge variant={patrulla.isActive ? 'default' : 'secondary'}>
          {patrulla.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessor: (patrulla: Patrulla) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(patrulla.id)}
            className="hover:bg-blue-50 hover:text-blue-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleActive(patrulla)}
            disabled={isToggling}
            className={
              patrulla.isActive
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }
            title={patrulla.isActive ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(patrulla)}
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
          Error al cargar patrullas: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Patrullas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las patrullas del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Patrulla
        </Button>
      </div>

      {/* Buscador */}
      <div className="neomorph-flat p-4">
        <input
          type="text"
          placeholder="Buscar patrullas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 neomorph-input"
        />
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Cargando patrullas...</span>
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
      <CreatePatrullaModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {selectedPatrullaId && (
        <EditPatrullaModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPatrullaId(null);
          }}
          patrullaId={selectedPatrullaId}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Patrulla"
        description={`¿Estás seguro de que deseas eliminar la patrulla "${patrullaToDelete?.numero}"? Esta acción no se puede deshacer.`}
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
        title={patrullaToToggle?.isActive ? "Desactivar Patrulla" : "Activar Patrulla"}
        description={`¿Estás seguro de que deseas ${patrullaToToggle?.isActive ? "desactivar" : "activar"} la patrulla "${patrullaToToggle?.numero}"?`}
        confirmText={patrullaToToggle?.isActive ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={patrullaToToggle?.isActive ? "warning" : "success"}
        onConfirm={confirmToggle}
        isLoading={isToggling}
      />
    </div>
  );
};
