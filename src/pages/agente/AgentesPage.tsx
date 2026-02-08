import { useState } from 'react';
import { useAgentes, useDeleteAgente, useToggleActiveAgente } from '@/hooks/queries/useAgentes';
import { useNotification } from '@/hooks/useNotification';
import { CreateAgenteModal } from '@/components/features/agentes/CreateAgenteModal';
import { EditAgenteModal } from '@/components/features/agentes/EditAgenteModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Plus, Pencil, Trash2, Power } from 'lucide-react';
import { imagenesService } from '@/services/imagenes.service';
import type { Agente } from '@/types/agente.type';

export const AgentesPage = () => {
  const notify = useNotification();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgenteId, setSelectedAgenteId] = useState<number | null>(null);

  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [agenteToDelete, setAgenteToDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [agenteToToggle, setAgenteToToggle] = useState<{ id: number; nombre: string; isActive: boolean } | null>(null);

  // ✅ Obtener agentes con React Query
  const { data, isLoading, error } = useAgentes({
    page,
    limit,
    search: search || undefined,
  });

  // ✅ Mutations
  const { mutate: deleteAgente, isPending: isDeleting } = useDeleteAgente();
  const { mutate: toggleActive, isPending: isToggling } = useToggleActiveAgente();

  // Handlers
  const handleDelete = (agente: Agente) => {
    const nombre = `${agente.nombres} ${agente.apellidoPaterno}`;
    setAgenteToDelete({ id: agente.id, nombre });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!agenteToDelete) return;

    deleteAgente(agenteToDelete.id, {
      onSuccess: () => {
        notify.success('Agente Eliminado', 'El agente se ha eliminado correctamente');
        setAgenteToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleToggleActive = (agente: Agente) => {
    const nombre = `${agente.nombres} ${agente.apellidoPaterno}`;
    setAgenteToToggle({ 
      id: agente.id, 
      nombre, 
      isActive: agente.isActive 
    });
    setToggleConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!agenteToToggle) return;

    toggleActive(agenteToToggle.id, {
      onSuccess: () => {
        const estado = agenteToToggle.isActive ? 'desactivado' : 'activado';
        notify.success('Estado Actualizado', `El agente ha sido ${estado} correctamente`);
        setAgenteToToggle(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleEdit = (id: number) => {
    setSelectedAgenteId(id);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  // Columnas de la tabla
  const columns = [
    {
      header: 'Foto',
      accessor: (agente: Agente) => {
        const initials = `${agente.nombres[0]}${agente.apellidoPaterno[0]}`.toUpperCase();
        const imageUrl = agente.foto 
          ? imagenesService.getImageUrl({ type: 'agentes', filename: agente.foto })
          : undefined;
        
        return (
          <Avatar className="h-10 w-10 shadow-md ring-2 ring-gray-100">
            {imageUrl && (
              <AvatarImage 
                src={imageUrl} 
                alt={`${agente.nombres} ${agente.apellidoPaterno}`}
                className="object-cover"
              />
            )}
            <AvatarFallback 
              className="font-semibold text-sm"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      header: 'Nombre Completo',
      accessor: (agente: Agente) => 
        `${agente.nombres} ${agente.apellidoPaterno} ${agente.apellidoMaterno}`,
    },
    {
      header: 'Cargo',
      accessor: (agente: Agente) => agente.cargo,
    },
    {
      header: 'Tipo',
      accessor: (agente: Agente) => agente.tipo.tipo,
    },
    {
      header: 'Departamento',
      accessor: (agente: Agente) => agente.departamento.nombre,
    },
    {
      header: 'Patrulla',
      accessor: (agente: Agente) => 
        agente.patrulla ? agente.patrulla.numPatrulla : 'Sin asignar',
    },
    {
      header: 'Sede',
      accessor: (agente: Agente) => agente.sede.name,
    },
    {
      header: 'Subsede',
      accessor: (agente: Agente) => agente.subsede.name,
    },
    {
      header: 'Estado',
      accessor: (agente: Agente) => (
        <Badge variant={agente.isActive ? 'default' : 'secondary'}>
          {agente.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessor: (agente: Agente) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(agente.id)}
            className="hover:bg-blue-50 hover:text-blue-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleActive(agente)}
            disabled={isToggling}
            className={
              agente.isActive
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }
            title={agente.isActive ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(agente)}
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
          Error al cargar agentes: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agentes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los agentes del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Agente
        </Button>
      </div>

      {/* Buscador */}
      <div className="neomorph-flat p-4">
        <input
          type="text"
          placeholder="Buscar agentes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 neomorph-input"
        />
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Cargando agentes...</span>
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
      <CreateAgenteModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {selectedAgenteId && (
        <EditAgenteModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAgenteId(null);
          }}
          agenteId={selectedAgenteId}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Agente"
        description={`¿Estás seguro de que deseas eliminar al agente "${agenteToDelete?.nombre}"? Esta acción no se puede deshacer.`}
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
        title={agenteToToggle?.isActive ? "Desactivar Agente" : "Activar Agente"}
        description={`¿Estás seguro de que deseas ${agenteToToggle?.isActive ? "desactivar" : "activar"} al agente "${agenteToToggle?.nombre}"?`}
        confirmText={agenteToToggle?.isActive ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={agenteToToggle?.isActive ? "warning" : "success"}
        onConfirm={confirmToggle}
        isLoading={isToggling}
      />
    </div>
  );
};
