import { useState } from 'react';
import {
  useDepartamentos,
  useDeleteDepartamento,
  useToggleDepartamento,
} from '@/hooks/queries/useDepartamento';
import { useNotification } from '@/hooks/useNotification';
import { CreateDepartamentoModal } from '@/components/features/departamentos/CreateDepartamentoModal';
import { EditDepartamentoModal } from '@/components/features/departamentos/EditDepartamentoModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Power, Building } from 'lucide-react';
import type { Departamento } from '@/types/departamento.type';

export const DepartamentoPage = () => {
  const notify = useNotification();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);

  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [deptoToDelete, setDeptoToDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [deptoToToggle, setDeptoToToggle] = useState<{ id: number; nombre: string; isActive: boolean } | null>(null);

  // ✅ Obtener departamentos con React Query
  const { data, isLoading, error } = useDepartamentos({
    page,
    limit,
    search: search || undefined,
  });

  // ✅ Mutations
  const { mutate: deleteDepartamento, isPending: isDeleting } = useDeleteDepartamento();
  const { mutate: toggleDepartamento, isPending: isToggling } = useToggleDepartamento();

  // Handlers
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number, nombre: string) => {
    setDeptoToDelete({ id, nombre });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deptoToDelete) return;

    deleteDepartamento(deptoToDelete.id, {
      onSuccess: () => {
        notify.success('Departamento Eliminado', 'El departamento se ha eliminado correctamente');
        setDeptoToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleToggle = (departamento: Departamento) => {
    setDeptoToToggle({ 
      id: departamento.id, 
      nombre: departamento.nombre, 
      isActive: departamento.isActive 
    });
    setToggleConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!deptoToToggle) return;

    toggleDepartamento(deptoToToggle.id, {
      onSuccess: () => {
        const estado = deptoToToggle.isActive ? 'desactivado' : 'activado';
        notify.success('Estado Actualizado', `El departamento ha sido ${estado} correctamente`);
        setDeptoToToggle(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDepartamento(null);
  };

  // ✅ Configuración de columnas del DataTable
  const columns = [
    {
      header: 'Departamento',
      accessor: (departamento: Departamento) => (
        <div>
          <p className="font-semibold text-gray-900">{departamento.nombre}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{departamento.descripcion}</p>
        </div>
      ),
    },
    {
      header: 'Ubicación',
      accessor: (departamento: Departamento) => (
        <div className="text-sm">
          <p className="text-gray-900">{departamento.sede.name}</p>
          <p className="text-gray-500">{departamento.subsede.name}</p>
        </div>
      ),
    },
    {
      header: 'Multas',
      accessor: (departamento: Departamento) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-gray-900">
            {departamento._count.multas}
          </span>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (departamento: Departamento) => (
        <Badge variant={departamento.isActive ? 'default' : 'outline'}>
          {departamento.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Fecha de Creación',
      accessor: (departamento: Departamento) =>
        new Date(departamento.createdAt).toLocaleDateString('es-MX'),
    },
    {
      header: 'Acciones',
      accessor: (departamento: Departamento) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(departamento)}
            title="Editar"
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggle(departamento)}
            disabled={isToggling}
            className={
              departamento.isActive
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }
            title={departamento.isActive ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(departamento.id, departamento.nombre)}
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
        <p className="text-red-600">Error al cargar los departamentos</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-gray-600 mt-1">
            Gestión de departamentos y áreas de la organización
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Departamento
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar departamento..."
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
      <CreateDepartamentoModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditDepartamentoModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        departamento={selectedDepartamento}
      />

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Departamento"
        description={`¿Estás seguro de que deseas eliminar el departamento "${deptoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
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
        title={deptoToToggle?.isActive ? "Desactivar Departamento" : "Activar Departamento"}
        description={`¿Estás seguro de que deseas ${deptoToToggle?.isActive ? "desactivar" : "activar"} el departamento "${deptoToToggle?.nombre}"?`}
        confirmText={deptoToToggle?.isActive ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={deptoToToggle?.isActive ? "warning" : "success"}
        onConfirm={confirmToggle}
        isLoading={isToggling}
      />
    </div>
  );
};
