import { useState } from 'react';
import {
  useMultas,
  useDeleteMulta,
  useToggleMulta,
} from '@/hooks/queries/useMultas';
import { useDepartamentos } from '@/hooks/queries/useDepartamento';
import { useNotification } from '@/hooks/useNotification';
import { useUserLevel } from '@/hooks/useUserLevel';
import { CreateMultaModal } from '@/components/features/multas/CreateMultaModal';
import { EditMultaModal } from '@/components/features/multas/EditMultaModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Trash2, Power, Receipt } from 'lucide-react';
import { sedeService } from '@/services/sede.service';
import { subsedeService } from '@/services/subsede.service';
import type { Multas } from '@/types/multas.type';
import type { Sede } from '@/types/sede.types';
import type { Subsede } from '@/types/subsede.types';

export const MultasPage = () => {
  const notify = useNotification();
  const { userLevel } = useUserLevel();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [departamentoFilter, setDepartamentoFilter] = useState<number | ''>('');
  const [sedeFilter, setSedeFilter] = useState<number | ''>('');
  const [subsedeFilter, setSubsedeFilter] = useState<number | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMulta, setSelectedMulta] = useState<Multas | null>(null);

  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [multaToDelete, setMultaToDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [multaToToggle, setMultaToToggle] = useState<{ id: number; nombre: string; isActive: boolean } | null>(null);

  // ✅ Obtener multas con React Query
  const { data, isLoading, error } = useMultas({
    page,
    limit,
    search: search || undefined,
    departamentoId: departamentoFilter || undefined,
    sedeId: sedeFilter || undefined,
    subsedeId: subsedeFilter || undefined,
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
    setMultaToDelete({ id, nombre });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!multaToDelete) return;

    deleteMulta(multaToDelete.id, {
      onSuccess: () => {
        notify.success('Multa Eliminada', 'La multa se ha eliminado correctamente');
        setMultaToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleToggle = (multa: Multas) => {
    setMultaToToggle({ 
      id: multa.id, 
      nombre: multa.nombre, 
      isActive: multa.isActive 
    });
    setToggleConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!multaToToggle) return;

    toggleMulta(multaToToggle.id, {
      onSuccess: () => {
        const estado = multaToToggle.isActive ? 'desactivada' : 'activada';
        notify.success('Estado Actualizado', `La multa ha sido ${estado} correctamente`);
        setMultaToToggle(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
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
    // Columna condicional según nivel de usuario
    ...(userLevel === 'SUPER_ADMIN' ? [
      {
        header: 'Sede / Municipio',
        accessor: (multa: Multas) => (
          <div className="text-sm">
            <p className="text-gray-900 font-medium">{multa.sede.name}</p>
            <p className="text-gray-500 text-xs">{multa.subsede.name}</p>
          </div>
        ),
      }
    ] : userLevel === 'ESTATAL' ? [
      {
        header: 'Municipio',
        accessor: (multa: Multas) => (
          <div className="text-sm">
            <p className="text-gray-900">{multa.subsede.name}</p>
            <p className="text-gray-500 text-xs">Código: {multa.subsede.code}</p>
          </div>
        ),
      }
    ] : [
      {
        header: 'Departamento',
        accessor: (multa: Multas) => (
          <div className="text-sm">
            <p className="text-gray-900">{multa.departamento.nombre}</p>
          </div>
        ),
      }
    ]),
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
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggle(multa)}
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
          
          {/* Filtro de Sede - Solo para SUPER_ADMIN */}
          {userLevel === 'SUPER_ADMIN' && (
            <div>
              <Label htmlFor="sedeFilter" className="text-sm text-gray-700 mb-1 block">
                Filtrar por Sede
              </Label>
              <SearchableSelect
                placeholder="Todas las sedes"
                value={sedeFilter || 0}
                onChange={(value) => {
                  setSedeFilter(Number(value) || '');
                  setSubsedeFilter(''); // Resetear subsede al cambiar sede
                  setPage(1);
                }}
                queryKey={['sedes-filter-multas']}
                queryFn={async ({ page, search, limit }) => {
                  const response = await sedeService.getAll({
                    page,
                    search,
                    limit,
                    isActive: true,
                  });
                  return response.data;
                }}
                getOptionLabel={(item: Sede) => item.name}
                getOptionValue={(item: Sede) => item.id}
              />
            </div>
          )}

          {/* Filtro de Subsede - Para SUPER_ADMIN y ESTATAL */}
          {(userLevel === 'SUPER_ADMIN' || userLevel === 'ESTATAL') && (
            <div>
              <Label htmlFor="subsedeFilter" className="text-sm text-gray-700 mb-1 block">
                Filtrar por Municipio
              </Label>
              <SearchableSelect
                placeholder="Todos los municipios"
                value={subsedeFilter || 0}
                onChange={(value) => {
                  setSubsedeFilter(Number(value) || '');
                  setPage(1);
                }}
                queryKey={sedeFilter ? ['subsedes-filter-multas', sedeFilter] : ['subsedes-filter-multas']}
                queryFn={async ({ page, search, limit }) => {
                  const response = await subsedeService.getAll({
                    page,
                    search,
                    limit,
                    isActive: true,
                    ...(sedeFilter && { sedeId: sedeFilter }),
                  });
                  return response.data;
                }}
                getOptionLabel={(item: Subsede) => item.name}
                getOptionValue={(item: Subsede) => item.id}
              />
            </div>
          )}

          {/* Filtro de Departamento - Para usuarios MUNICIPAL */}
          {userLevel === 'MUNICIPAL' && (
            <div>
              <Label htmlFor="departamentoFilter" className="text-sm text-gray-700 mb-1 block">
                Filtrar por Departamento
              </Label>
              <select
                id="departamentoFilter"
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
          )}
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

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Multa"
        description={`¿Estás seguro de que deseas eliminar la multa "${multaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
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
        title={multaToToggle?.isActive ? "Desactivar Multa" : "Activar Multa"}
        description={`¿Estás seguro de que deseas ${multaToToggle?.isActive ? "desactivar" : "activar"} la multa "${multaToToggle?.nombre}"?`}
        confirmText={multaToToggle?.isActive ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={multaToToggle?.isActive ? "warning" : "success"}
        onConfirm={confirmToggle}
        isLoading={isToggling}
      />
    </div>
  );
};
