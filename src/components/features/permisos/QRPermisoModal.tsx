import { useState } from 'react';
import { useGenerarQRPermiso } from '@/hooks/queries/usePermiso';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import type { Permiso } from '@/types/permiso.type';

interface QRPermisoModalProps {
  open: boolean;
  onClose: () => void;
  permiso: Permiso | null;
}

export const QRPermisoModal = ({ open, onClose, permiso }: QRPermisoModalProps) => {
  const { mutate: generarQR, isPending } = useGenerarQRPermiso();
  const [qrGenerated, setQrGenerated] = useState<string | null>(null);

  const handleGenerateQR = () => {
    if (!permiso) return;

    generarQR(permiso.id, {
      onSuccess: (response) => {
        setQrGenerated(response.qr);
      },
    });
  };

  const handleDownloadQR = () => {
    if (!qrGenerated) return;

    // Crear un enlace temporal para descargar el QR
    const link = document.createElement('a');
    link.href = qrGenerated;
    link.download = `permiso-${permiso?.folio}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setQrGenerated(null);
    onClose();
  };

  if (!permiso) return null;

  // Verificar si el permiso está aprobado
  const isApproved = permiso.estatus === 'APROBADO';
  const hasExistingQR = !!permiso.qr;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Código QR del Permiso
            </DialogTitle>
            <Badge
              variant={
                permiso.estatus === 'APROBADO'
                  ? 'default'
                  : permiso.estatus === 'PENDIENTE'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {permiso.estatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                  El código QR solo puede generarse para permisos con estatus "APROBADO".
                </p>
              </div>
            </div>
          )}

          {/* Área del QR */}
          {isApproved && (
            <div className="space-y-4">
              {/* QR existente o generado */}
              {(hasExistingQR || qrGenerated) && (
                <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                  <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
                    <img
                      src={qrGenerated || permiso.qr}
                      alt={`QR Code para permiso ${permiso.folio}`}
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Código QR {qrGenerated ? 'generado' : 'disponible'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Este código QR contiene la información del permiso y puede ser escaneado para su verificación.
                  </p>
                </div>
              )}

              {/* Botón para generar QR si no existe */}
              {!hasExistingQR && !qrGenerated && (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <QrCode className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    No se ha generado un código QR para este permiso
                  </p>
                  <Button
                    onClick={handleGenerateQR}
                    disabled={isPending}
                    className="gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        Generar Código QR
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Botón de regenerar si ya existe */}
              {hasExistingQR && !qrGenerated && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleGenerateQR}
                    disabled={isPending}
                    variant="outline"
                    className="gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Regenerando...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        Regenerar Código QR
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
          {isApproved && (hasExistingQR || qrGenerated) && (
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
