import { useState } from 'react';
import {
  usePermisos,
  useAprobarPermiso,
  useRechazarPermiso,
} from '@/hooks/queries/usePermiso';
import { useNotification } from '@/hooks/useNotification';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CreatePermisoModal } from '@/components/features/permisos/CreatePermisoModal';
import { EditPermisoModal } from '@/components/features/permisos/EditPermisoModal';
import { DetallePermisoModal } from '@/components/features/permisos/DetallePermisoModal';
import { QRPermisoModal } from '@/components/features/permisos/QRPermisoModal';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, CheckCircle, XCircle, Eye, QrCode, Edit } from 'lucide-react';
import type { Permiso } from '@/types/permiso.type';

export const PermisoPage = () => {
  const notify = useNotification();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [estatusFilter, setEstatusFilter] = useState<'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO' | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  
  // Estados para ConfirmDialog
  const [aprobarConfirmOpen, setAprobarConfirmOpen] = useState(false);
  const [rechazarConfirmOpen, setRechazarConfirmOpen] = useState(false);
  const [permisoToApprove, setPermisoToApprove] = useState<{ id: number; folio: string } | null>(null);
  const [permisoToReject, setPermisoToReject] = useState<{ id: number; folio: string } | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // ✅ Obtener permisos con React Query
  const { data, isLoading, error } = usePermisos({
    page,
    limit,
    search: search || undefined,
    estatus: estatusFilter || undefined,
  });

  // ✅ Mutations
  const { mutate: aprobarPermiso, isPending: isAprobando } = useAprobarPermiso();
  const { mutate: rechazarPermiso, isPending: isRechazando } = useRechazarPermiso();

  // Handlers
  const handleAprobar = (permiso: Permiso) => {
    setPermisoToApprove({ id: permiso.id, folio: permiso.folio });
    setAprobarConfirmOpen(true);
  };

  const confirmAprobar = () => {
    if (!permisoToApprove) return;
    
    aprobarPermiso(
      { id: permisoToApprove.id, observaciones: observaciones || undefined },
      {
        onSuccess: () => {
          notify.success(
            'Permiso Aprobado',
            `El permiso "${permisoToApprove.folio}" ha sido aprobado exitosamente`
          );
          setObservaciones('');
          setPermisoToApprove(null);
        },
        onError: (error) => {
          notify.apiError(error);
        },
      }
    );
  };

  const handleRechazar = (permiso: Permiso) => {
    setPermisoToReject({ id: permiso.id, folio: permiso.folio });
    setRechazarConfirmOpen(true);
  };

  const confirmRechazar = () => {
    if (!permisoToReject || !motivoRechazo.trim()) {
      notify.warning('Campo Requerido', 'Debes proporcionar un motivo de rechazo');
      return;
    }
    
    rechazarPermiso(
      { id: permisoToReject.id, motivoRechazo },
      {
        onSuccess: () => {
          notify.success(
            'Permiso Rechazado',
            `El permiso "${permisoToReject.folio}" ha sido rechazado`
          );
          setMotivoRechazo('');
          setPermisoToReject(null);
        },
        onError: (error) => {
          notify.apiError(error);
        },
      }
    );
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setIsEditModalOpen(true);
  };

  const handleViewDetalle = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setIsDetalleModalOpen(true);
  };

  const handleViewQR = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setIsQRModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPermiso(null);
  };

  const closeDetalleModal = () => {
    setIsDetalleModalOpen(false);
    setSelectedPermiso(null);
  };

  const closeQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedPermiso(null);
  };

  // Helper para obtener color del badge según estatus
  const getEstatusBadge = (estatus: string) => {
    const statusMap = {
      PENDIENTE: { variant: 'secondary' as const, label: 'Pendiente' },
      APROBADO: { variant: 'default' as const, label: 'Aprobado' },
      RECHAZADO: { variant: 'destructive' as const, label: 'Rechazado' },
      VENCIDO: { variant: 'outline' as const, label: 'Vencido' },
    };
    return statusMap[estatus as keyof typeof statusMap] || { variant: 'secondary' as const, label: estatus };
  };

  // Columnas de la tabla
  const columns = [
    {
      header: 'Folio',
      accessor: (permiso: Permiso) => (
        <span className="font-mono font-semibold text-blue-600">{permiso.folio}</span>
      ),
    },
    {
      header: 'Tipo',
      accessor: (permiso: Permiso) => (
        <div>
          <p className="font-medium">{permiso.tipoPermiso.nombre}</p>
          <p className="text-xs text-gray-500">{permiso.descripcion}</p>
        </div>
      ),
    },
    {
      header: 'Ciudadano',
      accessor: (permiso: Permiso) => (
        <div>
          <p className="font-medium">{permiso.nombreCiudadano}</p>
          <p className="text-xs text-gray-500">{permiso.documentoCiudadano}</p>
        </div>
      ),
    },
    {
      header: 'Costo',
      accessor: (permiso: Permiso) => (
        <div className="text-sm">
          <p className="font-medium">${permiso.costo}</p>
          <p className="text-xs text-gray-500">
            {permiso.numUMAs} UMAs / {permiso.numSalarios} Salarios
          </p>
        </div>
      ),
    },
    {
      header: 'Vigencia',
      accessor: (permiso: Permiso) => (
        <div className="text-sm">
          <p>{new Date(permiso.fechaEmision).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {permiso.vigenciaDias} días
          </p>
        </div>
      ),
    },
    {
      header: 'Estatus',
      accessor: (permiso: Permiso) => {
        const { variant, label } = getEstatusBadge(permiso.estatus);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      header: 'Sede',
      accessor: (permiso: Permiso) => permiso.sede.name,
    },
    {
      header: 'Acciones',
      accessor: (permiso: Permiso) => (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleViewDetalle(permiso)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {permiso.estatus === 'PENDIENTE' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(permiso)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAprobar(permiso)}
                disabled={isAprobando}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Aprobar"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRechazar(permiso)}
                disabled={isRechazando}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Rechazar"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}

          {permiso.estatus === 'APROBADO' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleViewQR(permiso)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              title="Ver QR"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-800">
          Error al cargar permisos: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Permisos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los permisos emitidos del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Permiso
        </Button>
      </div>

      {/* Filtros */}
      <div className="neomorph-flat p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar por folio, nombre, documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 neomorph-input"
          />
          <select
            value={estatusFilter}
            onChange={(e) => setEstatusFilter(e.target.value as typeof estatusFilter)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estatus</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="VENCIDO">Vencido</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Cargando permisos...</span>
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
      <CreatePermisoModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditPermisoModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        permiso={selectedPermiso}
      />
      <DetallePermisoModal
        open={isDetalleModalOpen}
        onClose={closeDetalleModal}
        permiso={selectedPermiso}
      />
      <QRPermisoModal
        open={isQRModalOpen}
        onClose={closeQRModal}
        permiso={selectedPermiso}
      />

      {/* Diálogo de confirmación para aprobar */}
      <ConfirmDialog
        open={aprobarConfirmOpen}
        onOpenChange={setAprobarConfirmOpen}
        title="Aprobar Permiso"
        description={
          <div className="space-y-3">
            <p>¿Estás seguro de que deseas aprobar el permiso con folio <strong>{permisoToApprove?.folio}</strong>?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones (opcional)
              </label>
              <Input
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agregar observaciones..."
                className="w-full"
              />
            </div>
          </div>
        }
        confirmText="Aprobar"
        cancelText="Cancelar"
        variant="success"
        onConfirm={confirmAprobar}
        isLoading={isAprobando}
      />

      {/* Diálogo de confirmación para rechazar */}
      <ConfirmDialog
        open={rechazarConfirmOpen}
        onOpenChange={setRechazarConfirmOpen}
        title="Rechazar Permiso"
        description={
          <div className="space-y-3">
            <p>¿Estás seguro de que deseas rechazar el permiso con folio <strong>{permisoToReject?.folio}</strong>?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de rechazo <span className="text-red-500">*</span>
              </label>
              <Input
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Debes proporcionar un motivo..."
                className="w-full"
                required
              />
            </div>
          </div>
        }
        confirmText="Rechazar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmRechazar}
        isLoading={isRechazando}
      />
    </div>
  );
};
