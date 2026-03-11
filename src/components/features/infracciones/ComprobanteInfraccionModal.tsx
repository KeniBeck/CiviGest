import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt, Calendar, DollarSign, User, Building2 } from 'lucide-react';
import type { PagoInfraccion } from '@/types/pago-infraccion.type';

interface ComprobanteInfraccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: PagoInfraccion | null;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ComprobanteInfraccionModal = ({
  open,
  onOpenChange,
  pago,
}: ComprobanteInfraccionModalProps) => {
  if (!pago) return null;

  const total = typeof pago.total === 'string' ? parseFloat(pago.total) : Number(pago.total);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-600" />
            Comprobante de Pago - Infracción
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Folio infracción:</span>
              <span className="font-mono font-semibold text-gray-900">{pago.folioInfraccion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Referencia de pago:</span>
              <span className="text-sm font-medium text-gray-900">
                {pago.referenciaPago ?? '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <User className="h-5 w-5" />
            <div>
              <p className="text-sm text-gray-600">Ciudadano</p>
              <p className="font-medium">{pago.nombreCiudadano}</p>
              <p className="text-xs text-gray-500">{pago.documentoCiudadano}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="h-5 w-5" />
            <div>
              <p className="text-sm text-gray-600">Fecha de pago</p>
              <p className="font-medium">{formatDate(pago.fechaPago)}</p>
            </div>
          </div>

          {pago.multa && (
            <div className="flex items-center gap-2 text-gray-700">
              <Building2 className="h-5 w-5" />
              <div>
                <p className="text-sm text-gray-600">Concepto</p>
                <p className="font-medium">{pago.multa.nombre}</p>
                <p className="text-xs text-gray-500">{pago.multa.codigo}</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-700">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total pagado
            </span>
            <span className="text-xl font-bold text-green-700">
              ${total.toFixed(2)}
            </span>
          </div>

          {pago.qrComprobante && (
            <div className="flex justify-center p-4 bg-white border rounded-lg">
              <img
                src={pago.qrComprobante}
                alt="QR Comprobante"
                className="w-32 h-32 object-contain"
              />
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
