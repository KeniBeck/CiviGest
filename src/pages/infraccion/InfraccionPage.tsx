import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useInfracciones,
  useDeleteInfraccion,
} from '@/hooks/queries/useInfraccion';
import { useNotification } from '@/hooks/useNotification';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Plus,
  Eye,
  Edit,
  DollarSign,
  RefreshCw,
  Trash2,
  Receipt,
} from 'lucide-react';
import type { Infraccion, InfraccionEstatus } from '@/types/infraccion.type';
import type { PagoInfraccion } from '@/types/pago-infraccion.type';
import {
  CreateInfraccionModal,
  EditInfraccionModal,
  DetalleInfraccionModal,
  PagoInfraccionModal,
  ComprobanteInfraccionModal,
  ReembolsoInfraccionModal,
} from '@/components/features/infracciones';

export const InfraccionPage = () => {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [estatusFilter, setEstatusFilter] = useState<InfraccionEstatus | ''>('');
  const [vencidasFilter, setVencidasFilter] = useState<boolean | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [isComprobanteModalOpen, setIsComprobanteModalOpen] = useState(false);
  const [isReembolsoModalOpen, setIsReembolsoModalOpen] = useState(false);
  const [selectedInfraccion, setSelectedInfraccion] = useState<Infraccion | null>(null);
  const [selectedPago, setSelectedPago] = useState<PagoInfraccion | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [infraccionToCancel, setInfraccionToCancel] = useState<{ id: number; folio: string } | null>(null);

  const { data, isLoading, error } = useInfracciones({
    page,
    limit,
    search: search || undefined,
    estatus: estatusFilter || undefined,
    vencidas: vencidasFilter === '' ? undefined : vencidasFilter,
  });

  const { mutate: deleteInfraccion, isPending: isDeleting } = useDeleteInfraccion();

  const handleCreate = () => setIsCreateModalOpen(true);

  const handleViewDetalle = (infraccion: Infraccion) => {
    setSelectedInfraccion(infraccion);
    setIsDetalleModalOpen(true);
  };

  const handleEdit = (infraccion: Infraccion) => {
    setSelectedInfraccion(infraccion);
    setIsEditModalOpen(true);
  };

  const handleOpenPago = (infraccion: Infraccion) => {
    setSelectedInfraccion(infraccion);
    setIsPagoModalOpen(true);
  };

  const handleCancelInfraccion = (infraccion: Infraccion) => {
    setInfraccionToCancel({ id: infraccion.id, folio: infraccion.folio });
    setCancelConfirmOpen(true);
  };

  const confirmCancel = () => {
    if (!infraccionToCancel) return;
    deleteInfraccion(infraccionToCancel.id, {
      onSuccess: () => {
        notify.success('Infracción cancelada', `La infracción "${infraccionToCancel.folio}" ha sido cancelada`);
        setInfraccionToCancel(null);
      },
      onError: (err) => notify.apiError(err),
    });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedInfraccion(null);
  };

  const closeDetalleModal = () => {
    setIsDetalleModalOpen(false);
    setSelectedInfraccion(null);
  };

  const closePagoModal = () => {
    setIsPagoModalOpen(false);
    setSelectedInfraccion(null);
  };

  const closeComprobanteModal = () => {
    setIsComprobanteModalOpen(false);
    setSelectedPago(null);
  };

  const closeReembolsoModal = () => {
    setIsReembolsoModalOpen(false);
    setSelectedPago(null);
  };

  /** Construye un PagoInfraccion para comprobante/reembolso desde la infracción y el pago en lista */
  const buildPagoFromInfraccion = (inf: Infraccion): PagoInfraccion | null => {
    const pago = getPagoPagado(inf);
    if (!pago) return null;
    return {
      id: pago.id,
      folioInfraccion: inf.folio,
      nombreCiudadano: inf.nombreCiudadano,
      documentoCiudadano: inf.documentoCiudadano,
      costoBase: pago.costoBase,
      descuentoPct: pago.descuentoPct,
      descuentoMonto: pago.descuentoMonto,
      total: pago.total,
      metodoPago: (pago.metodoPago as PagoInfraccion['metodoPago']) ?? 'EFECTIVO',
      referenciaPago: pago.referenciaPago,
      usuarioCobroId: pago.usuarioCobro?.id ?? 0,
      fechaPago: pago.fechaPago,
      estatus: 'PAGADO',
      multaId: inf.multaId,
      sedeId: inf.sedeId,
      subsedeId: inf.subsedeId,
      autorizaDescuento: false,
      autorizadoPor: null,
      firmaAutorizacion: null,
      observaciones: pago.observaciones,
      qrComprobante: pago.qrComprobante ?? null,
      tokenPublico: null,
      tokenExpiraEn: null,
      pagoOriginalId: null,
      esReembolso: false,
      isActive: true,
      deletedAt: null,
      createdAt: pago.fechaPago,
      updatedAt: pago.fechaPago,
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
      multa: inf.multa,
    };
  };

  const getEstatusBadge = (estatus: InfraccionEstatus) => {
    const map: Record<InfraccionEstatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      LEVANTADA: { variant: 'secondary', label: 'Levantada' },
      PAGADA: { variant: 'default', label: 'Pagada' },
      CANCELADA: { variant: 'destructive', label: 'Cancelada' },
      PRESCRITA: { variant: 'outline', label: 'Prescrita' },
      EN_PROCESO: { variant: 'secondary', label: 'En proceso' },
    };
    return map[estatus] || { variant: 'secondary' as const, label: estatus };
  };

  const tienePagoPagado = (infraccion: Infraccion): boolean =>
    infraccion.pagos?.some((p) => p.estatus === 'PAGADO') ?? false;

  const getPagoPagado = (infraccion: Infraccion) =>
    infraccion.pagos?.find((p) => p.estatus === 'PAGADO');

  const columns = [
    {
      header: 'Folio',
      accessor: (inf: Infraccion) => (
        <span className="font-mono font-semibold text-blue-600">{inf.folio}</span>
      ),
    },
    {
      header: 'Multa',
      accessor: (inf: Infraccion) => (
        <div>
          <p className="font-medium">{inf.multa?.nombre ?? '—'}</p>
          <p className="text-xs text-gray-500">{inf.multa?.codigo ?? ''}</p>
        </div>
      ),
    },
    {
      header: 'Ciudadano',
      accessor: (inf: Infraccion) => (
        <div>
          <p className="font-medium">{inf.nombreCiudadano}</p>
          <p className="text-xs text-gray-500">{inf.documentoCiudadano}</p>
        </div>
      ),
    },
    {
      header: 'Fecha infracción',
      accessor: (inf: Infraccion) => (
        <span className="text-sm">
          {inf.fechaInfraccion ? new Date(inf.fechaInfraccion).toLocaleDateString('es-MX') : '—'}
        </span>
      ),
    },
    {
      header: 'Límite pago',
      accessor: (inf: Infraccion) => (
        <span className="text-sm">
          {inf.fechaLimitePago ? new Date(inf.fechaLimitePago).toLocaleDateString('es-MX') : '—'}
        </span>
      ),
    },
    {
      header: 'Costo base',
      accessor: (inf: Infraccion) => (
        <span className="font-medium">
          ${inf.costoBase != null ? Number(inf.costoBase).toFixed(2) : '—'}
        </span>
      ),
    },
    {
      header: 'Estatus',
      accessor: (inf: Infraccion) => {
        const { variant, label } = getEstatusBadge(inf.estatus);
        const pagado = tienePagoPagado(inf);
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant}>{label}</Badge>
            {pagado && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">💰 PAGADO</Badge>
            )}
          </div>
        );
      },
    },
    {
      header: 'Sede',
      accessor: (inf: Infraccion) => inf.sede?.name ?? '—',
    },
    {
      header: 'Acciones',
      accessor: (inf: Infraccion) => (
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetalle(inf)}
            title="Ver detalle"
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {inf.estatus === 'LEVANTADA' && !tienePagoPagado(inf) && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(inf)}
                title="Editar"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenPago(inf)}
                title="Registrar pago"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <DollarSign className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancelInfraccion(inf)}
                disabled={isDeleting}
                title="Cancelar infracción"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          {(inf.estatus === 'PAGADA' || tienePagoPagado(inf)) && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const pago = buildPagoFromInfraccion(inf);
                  if (pago) {
                    setSelectedPago(pago);
                    setIsComprobanteModalOpen(true);
                  }
                }}
                title="Ver comprobante"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Receipt className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const pago = buildPagoFromInfraccion(inf);
                  if (pago) {
                    setSelectedPago(pago);
                    setIsReembolsoModalOpen(true);
                  }
                }}
                title="Reembolsar"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-800">
          Error al cargar infracciones: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Infracciones</h1>
          <p className="text-gray-600 mt-1">Gestiona el levantamiento y pagos de infracciones</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Infracción
        </Button>
      </div>

      <div className="neomorph-flat p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por folio, nombre, documento..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 neomorph-input"
          />
          <select
            value={estatusFilter}
            onChange={(e) => {
              setEstatusFilter(e.target.value as InfraccionEstatus | '');
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estatus</option>
            <option value="LEVANTADA">Levantada</option>
            <option value="PAGADA">Pagada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="PRESCRITA">Prescrita</option>
            <option value="EN_PROCESO">En proceso</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vencidasFilter === true}
              onChange={(e) => {
                setVencidasFilter(e.target.checked ? true : '');
                setPage(1);
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Solo vencidas</span>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Cargando infracciones...</span>
        </div>
      ) : (
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          currentPage={data?.pagination?.currentPage ?? 1}
          totalPages={data?.pagination?.totalPages ?? 1}
          totalItems={data?.pagination?.totalItems ?? 0}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(_newSize) => setPage(1)}
        />
      )}

      <CreateInfraccionModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['infracciones'] })}
      />
      <EditInfraccionModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        infraccion={selectedInfraccion}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['infracciones'] })}
      />
      <DetalleInfraccionModal
        open={isDetalleModalOpen}
        onClose={closeDetalleModal}
        infraccion={selectedInfraccion}
      />
      <PagoInfraccionModal
        open={isPagoModalOpen}
        onOpenChange={(o) => !o && closePagoModal()}
        infraccion={selectedInfraccion}
        onSuccess={(res) => {
          if (res?.data) {
            setSelectedPago(res.data as PagoInfraccion);
            setIsComprobanteModalOpen(true);
          }
          queryClient.invalidateQueries({ queryKey: ['infracciones'] });
        }}
      />
      <ComprobanteInfraccionModal
        open={isComprobanteModalOpen}
        onOpenChange={(o) => !o && closeComprobanteModal()}
        pago={selectedPago}
      />
      <ReembolsoInfraccionModal
        open={isReembolsoModalOpen}
        onOpenChange={(o) => !o && closeReembolsoModal()}
        pago={selectedPago}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['infracciones'] });
          closeReembolsoModal();
        }}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Cancelar infracción"
        description={
          <p>
            ¿Estás seguro de cancelar la infracción con folio <strong>{infraccionToCancel?.folio}</strong>?
            Se realizará una eliminación lógica (soft delete).
          </p>
        }
        confirmText="Cancelar infracción"
        cancelText="No"
        variant="danger"
        onConfirm={confirmCancel}
        isLoading={isDeleting}
      />
    </div>
  );
};
