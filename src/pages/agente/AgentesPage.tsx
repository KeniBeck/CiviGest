import { useState } from 'react';
import { useAgentes, useDeleteAgente, useToggleActiveAgente } from '@/hooks/queries/useAgentes';
import { CreateAgenteModal } from '@/components/features/agentes/CreateAgenteModal';
import { EditAgenteModal } from '@/components/features/agentes/EditAgenteModal';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Agente } from '@/types/agente.type';

export const AgentesPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgenteId, setSelectedAgenteId] = useState<number | null>(null);

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
  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este agente?')) {
      deleteAgente(id, {
        onSuccess: () => {
          console.log('Agente eliminado exitosamente');
        },
        onError: (error) => {
          console.error('Error al eliminar agente:', error);
        },
      });
    }
  };

  const handleToggleActive = (id: number) => {
    toggleActive(id, {
      onSuccess: () => {
        console.log('Estado del agente actualizado');
      },
      onError: (error) => {
        console.error('Error al cambiar estado:', error);
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
      header: 'ID',
      accessor: (agente: Agente) => agente.id,
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
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleActive(agente.id)}
            disabled={isToggling}
          >
            {agente.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(agente.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </div>
  );
};
