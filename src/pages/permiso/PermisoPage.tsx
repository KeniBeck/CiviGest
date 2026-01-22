import { useState, useEffect } from 'react';
import {
  usePermisos,
  usePermiso,
  useAprobarPermiso,
  useRechazarPermiso,
} from '@/hooks/queries/usePermiso';
import { useNotification } from '@/hooks/useNotification';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CreatePermisoModal } from '@/components/features/permisos/CreatePermisoModal';
import { EditPermisoModal } from '@/components/features/permisos/EditPermisoModal';
import { DetallePermisoModal } from '@/components/features/permisos/DetallePermisoModal';
import { QRPermisoModal } from '@/components/features/permisos/QRPermisoModal';
import { PagoPermisoModal } from '@/components/features/permisos/PagoPermisoModal';
import { ComprobanteModal } from '@/components/features/permisos/ComprobanteModal';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, CheckCircle, XCircle, Eye, QrCode, Edit, DollarSign } from 'lucide-react';
import type { Permiso } from '@/types/permiso.type';
import type { PagoPermiso } from '@/types/pago-permisos.type';

export const PermisoPage = () => {
  const notify = useNotification();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [estatusFilter, setEstatusFilter] = useState<'SOLICITADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO' | 'CANCELADO' | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [isComprobanteModalOpen, setIsComprobanteModalOpen] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  const [selectedPago, setSelectedPago] = useState<PagoPermiso | null>(null);
  
  // Estados para ConfirmDialog
  const [aprobarConfirmOpen, setAprobarConfirmOpen] = useState(false);
  const [rechazarConfirmOpen, setRechazarConfirmOpen] = useState(false);
  const [permisoToApprove, setPermisoToApprove] = useState<{ id: number; folio: string } | null>(null);
  const [permisoToReject, setPermisoToReject] = useState<{ id: number; folio: string } | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [pagarAhora, setPagarAhora] = useState(false);

  // Estado para cargar permiso después de crear
  const [permisoIdParaPago, setPermisoIdParaPago] = useState<number | null>(null);

  // ✅ Obtener permisos con React Query
  const { data, isLoading, error } = usePermisos({
    page,
    limit,
    search: search || undefined,
    estatus: estatusFilter || undefined,
  });

  // Hook para obtener el permiso completo cuando se necesite abrir el modal de pago
  const { data: permisoParaPago, isLoading: isLoadingPermisoParaPago } = usePermiso(
    permisoIdParaPago ?? 0
  );

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
        onSuccess: (response) => {
          notify.success(
            'Permiso Aprobado',
            `El permiso "${permisoToApprove.folio}" ha sido aprobado exitosamente`
          );
          
          // Si el usuario eligió "Pagar Ahora", abrir el modal de pago
          if (pagarAhora && response) {
            setSelectedPermiso(response);
            setIsPagoModalOpen(true);
          }
          
          setObservaciones('');
          setPagarAhora(false);
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

  const handlePermisoCreado = (permisoId: number, abrirPago: boolean) => {
    if (abrirPago) {
      // ✅ Establecer el ID del permiso para que usePermiso lo obtenga
      setPermisoIdParaPago(permisoId);
    }
  };

  // ✅ Efecto para abrir modal de pago cuando se cargue el permiso
  useEffect(() => {
    if (permisoParaPago && !isLoadingPermisoParaPago) {
      setSelectedPermiso(permisoParaPago);
      setIsPagoModalOpen(true);
      setPermisoIdParaPago(null); // Reset
    }
  }, [permisoParaPago, isLoadingPermisoParaPago]);

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

  const handleOpenPago = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setIsPagoModalOpen(true);
  };

  const closePagoModal = () => {
    setIsPagoModalOpen(false);
    setSelectedPermiso(null);
  };

  const closeComprobanteModal = () => {
    setIsComprobanteModalOpen(false);
    setSelectedPago(null);
  };

  // Helper para obtener color del badge según estatus
  const getEstatusBadge = (estatus: string) => {
    const statusMap = {
      SOLICITADO: { variant: 'secondary' as const, label: 'Solicitado', color: 'bg-yellow-100 text-yellow-800' },
      EN_REVISION: { variant: 'secondary' as const, label: 'En Revisión', color: 'bg-blue-100 text-blue-800' },
      APROBADO: { variant: 'default' as const, label: 'Aprobado', color: 'bg-green-100 text-green-800' },
      RECHAZADO: { variant: 'destructive' as const, label: 'Rechazado', color: 'bg-red-100 text-red-800' },
      VENCIDO: { variant: 'outline' as const, label: 'Vencido', color: 'bg-gray-100 text-gray-800' },
      CANCELADO: { variant: 'outline' as const, label: 'Cancelado', color: 'bg-orange-100 text-orange-800' },
    };
    return statusMap[estatus as keyof typeof statusMap] || { variant: 'secondary' as const, label: estatus, color: 'bg-gray-100 text-gray-800' };
  };

  // ✅ Helper para verificar si el permiso tiene pago PAGADO
  const tienePagoPagado = (permiso: Permiso): boolean => {
    return permiso.pagos?.some(pago => pago.estatus === 'PAGADO') ?? false;
  };

  // ✅ Helper para obtener el pago PAGADO
  const getPagoPagado = (permiso: Permiso) => {
    return permiso.pagos?.find(pago => pago.estatus === 'PAGADO');
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
        const estaPagado = tienePagoPagado(permiso);
        
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant}>{label}</Badge>
            {estaPagado && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                💰 PAGADO
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: 'Sede',
      accessor: (permiso: Permiso) => permiso.sede.name,
    },
    {
      header: 'Acciones',
      accessor: (permiso: Permiso) => (
        <div className="flex gap-1 flex-wrap">
          {/* Botón Ver Detalles - Siempre visible */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleViewDetalle(permiso)}
            title="Ver detalles"
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {/* Acciones para permisos SOLICITADOS o EN_REVISION */}
          {(permiso.estatus === 'SOLICITADO' || permiso.estatus === 'EN_REVISION') && (
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

          {/* Acciones para permisos APROBADOS */}
          {permiso.estatus === 'APROBADO' && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewQR(permiso)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                title="Ver QR"
              >
                <QrCode className="h-4 w-4" />
              </Button>
              
              {/* ✅ Verificar si ya tiene pago PAGADO */}
              {tienePagoPagado(permiso) ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const pago = getPagoPagado(permiso);
                    if (pago) {
                      // Construir el objeto PagoPermiso completo desde el permiso
                      const pagoCompleto = {
                        ...pago,
                        permisoId: permiso.id,
                        permiso: permiso,
                        usuarioId: null,
                        sedeId: permiso.sedeId,
                        subsedeId: permiso.subsedeId,
                        costoBase: permiso.costo,
                        descuento: "0",
                        isActive: true,
                        deletedAt: null,
                        createdAt: pago.fechaPago,
                        updatedAt: pago.fechaPago,
                        createdBy: null
                      };
                      setSelectedPago(pagoCompleto as any);
                      setIsComprobanteModalOpen(true);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Ver Comprobante"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="text-xs">Comprobante</span>
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleOpenPago(permiso)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Registrar Pago"
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          {/* Acciones para permisos RECHAZADOS - Solo ver detalles */}
          {permiso.estatus === 'RECHAZADO' && (
            <span className="text-xs text-red-600 px-2 py-1">
              Sin acciones disponibles
            </span>
          )}

          {/* Acciones para permisos VENCIDOS - Solo ver detalles */}
          {permiso.estatus === 'VENCIDO' && (
            <span className="text-xs text-gray-600 px-2 py-1">
              Permiso vencido
            </span>
          )}

          {/* Acciones para permisos CANCELADOS - Solo ver detalles */}
          {permiso.estatus === 'CANCELADO' && (
            <span className="text-xs text-orange-600 px-2 py-1">
              Permiso cancelado
            </span>
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
            <option value="SOLICITADO">Solicitado</option>
            <option value="EN_REVISION">En Revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="VENCIDO">Vencido</option>
            <option value="CANCELADO">Cancelado</option>
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
        onPermisoCreado={handlePermisoCreado}
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
            
            {/* Checkbox para "Pagar Ahora" */}
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <input
                type="checkbox"
                id="pagarAhora"
                checked={pagarAhora}
                onChange={(e) => setPagarAhora(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="pagarAhora" className="text-sm font-medium text-green-900 cursor-pointer">
                💵 Registrar pago inmediatamente después de aprobar
              </label>
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

      {/* Modal de Pago */}
      <PagoPermisoModal
        open={isPagoModalOpen}
        onOpenChange={closePagoModal}
        permiso={selectedPermiso}
        onSuccess={() => {
          // Refrescar datos si es necesario
        }}
      />

      {/* Modal de Comprobante */}
      <ComprobanteModal
        open={isComprobanteModalOpen}
        onOpenChange={closeComprobanteModal}
        pago={selectedPago}
      />
    </div>
  );
};
