import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import type { Permiso } from '@/types/permiso.type';

interface QRPermisoModalProps {
  open: boolean;
  onClose: () => void;
  permiso: Permiso | null;
}

export const QRPermisoModal = ({ open, onClose, permiso }: QRPermisoModalProps) => {
  const handleDownloadQR = () => {
    if (!permiso?.qr) return;

    // Crear un enlace temporal para descargar el QR
    const link = document.createElement('a');
    link.href = permiso.qr;
    link.download = `permiso-${permiso.folio}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!permiso) return null;

  // Verificar si el permiso está aprobado y tiene QR
  const isApproved = permiso.estatus === 'APROBADO';
  const hasQR = !!permiso.qr;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Código QR del Permiso
            </DialogTitle>
            <Badge
              variant={
                permiso.estatus === 'APROBADO'
                  ? 'default'
                  : permiso.estatus === 'EN_REVISION'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {permiso.estatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Información del Permiso */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Folio:</span>
              <span className="text-base font-semibold text-gray-900">{permiso.folio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Ciudadano:</span>
              <span className="text-base text-gray-900">{permiso.nombreCiudadano}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Tipo:</span>
              <span className="text-base text-gray-900">{permiso.tipoPermiso.nombre}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Vigencia:</span>
              <span className="text-base text-gray-900">
                {new Date(permiso.fechaVencimiento).toLocaleDateString('es-MX')}
              </span>
            </div>
          </div>

          {/* Mensaje de alerta si no está aprobado */}
          {!isApproved && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Permiso no aprobado
                </p>
                <p className="text-sm text-yellow-700">
                  El código QR solo está disponible para permisos con estatus "APROBADO".
                </p>
              </div>
            </div>
          )}

          {/* Mensaje si no tiene QR generado */}
          {isApproved && !hasQR && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  QR no disponible
                </p>
                <p className="text-sm text-blue-700">
                  El código QR se genera automáticamente al aprobar el permiso.
                </p>
              </div>
            </div>
          )}

          {/* Área del QR */}
          {isApproved && hasQR && (
            <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
              <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
                <img
                  src={permiso.pagos?.[0]?.qrComprobante || permiso.qr}
                  alt={`QR Code para permiso ${permiso.folio}`}
                  className="w-64 h-64 object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Código QR disponible
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Este código QR contiene la información del permiso y puede ser escaneado para su verificación.
              </p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="px-6 py-4 border-t bg-gray-50">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        {isApproved && hasQR && (
          <Button onClick={handleDownloadQR} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar QR
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};
