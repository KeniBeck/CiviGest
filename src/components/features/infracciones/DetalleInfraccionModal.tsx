import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DetalleModalHeader } from '@/components/common/DetalleModalHeader';
import {
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import type { Infraccion, InfraccionEstatus } from '@/types/infraccion.type';

interface DetalleInfraccionModalProps {
  open: boolean;
  onClose: () => void;
  infraccion: Infraccion | null;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getEstatusConfig = (estatus: InfraccionEstatus) => {
  const map: Record<
    InfraccionEstatus,
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
  > = {
    LEVANTADA: { variant: 'secondary', label: 'Levantada' },
    PAGADA: { variant: 'default', label: 'Pagada' },
    CANCELADA: { variant: 'destructive', label: 'Cancelada' },
    PRESCRITA: { variant: 'outline', label: 'Prescrita' },
    EN_PROCESO: { variant: 'secondary', label: 'En proceso' },
  };
  return map[estatus] ?? { variant: 'secondary' as const, label: estatus };
};

export const DetalleInfraccionModal = ({
  open,
  onClose,
  infraccion,
}: DetalleInfraccionModalProps) => {
  if (!infraccion) return null;

  const estatusConfig = getEstatusConfig(infraccion.estatus);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DetalleModalHeader
          title={
            <>
              <FileText className="h-5 w-5" />
              Detalle de la Infracción
            </>
          }
          statusBadge={{
            variant: estatusConfig.variant,
            label: estatusConfig.label,
          }}
          extraInfo={
            <p className="text-sm font-mono text-gray-600">Folio: {infraccion.folio}</p>
          }
        />

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Multa</p>
              <p className="font-semibold text-gray-900">{infraccion.multa?.nombre ?? '—'}</p>
              <p className="text-xs text-gray-500">{infraccion.multa?.codigo ?? ''}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Costo base</p>
              <p className="font-semibold text-gray-900">
                ${infraccion.costoBase != null ? Number(infraccion.costoBase).toFixed(2) : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha límite de pago</p>
              <p className="font-medium text-gray-900">{formatDate(infraccion.fechaLimitePago)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-700">Datos del ciudadano</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre</p>
                <p className="text-gray-900">{infraccion.nombreCiudadano}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Documento</p>
                <p className="text-gray-900">{infraccion.documentoCiudadano}</p>
              </div>
              {infraccion.domicilioCiudadano && (
                <div className="md:col-span-2 flex items-start gap-1">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Domicilio</p>
                    <p className="text-gray-900">{infraccion.domicilioCiudadano}</p>
                  </div>
                </div>
              )}
              {infraccion.telefonoCiudadano && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teléfono</p>
                    <p className="text-gray-900">{infraccion.telefonoCiudadano}</p>
                  </div>
                </div>
              )}
              {infraccion.emailCiudadano && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Correo</p>
                    <p className="text-gray-900">{infraccion.emailCiudadano}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-700">Fechas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha del hecho</p>
                <p className="text-gray-900">{formatDateTime(infraccion.fechaInfraccion)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de levantamiento</p>
                <p className="text-gray-900">{formatDateTime(infraccion.fechaLevantamiento)}</p>
              </div>
            </div>
          </div>

          {infraccion.ubicacion && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-700">Ubicación</h3>
                </div>
                <p className="text-gray-900 p-4 bg-gray-50 rounded-lg">{infraccion.ubicacion}</p>
              </div>
            </>
          )}

          {infraccion.descripcion && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">Descripción</h3>
                <p className="text-gray-900 p-4 bg-gray-50 rounded-lg">{infraccion.descripcion}</p>
              </div>
            </>
          )}

          {infraccion.observaciones && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-700">Observaciones</h3>
                </div>
                <p className="text-gray-900 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  {infraccion.observaciones}
                </p>
              </div>
            </>
          )}

          {infraccion.agente && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">Agente</h3>
                <p className="text-gray-900">
                  {infraccion.agente.nombres} {infraccion.agente.apellidoPaterno}
                  {infraccion.agente.numPlaca ? ` · Placa: ${infraccion.agente.numPlaca}` : ''}
                </p>
              </div>
            </>
          )}

          {infraccion.pagos && infraccion.pagos.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-700">Pagos registrados</h3>
                </div>
                <ul className="space-y-2">
                  {infraccion.pagos.map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <span>
                        {p.fechaPago && formatDateTime(p.fechaPago)} · ${p.total} · {p.estatus}
                      </span>
                      {p.referenciaPago && (
                        <span className="text-gray-500 font-mono">{p.referenciaPago}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {infraccion.qr && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-700">Código QR</h3>
                </div>
                <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg">
                  <img
                    src={infraccion.qr}
                    alt="QR de la infracción"
                    className="w-40 h-40 object-contain"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
