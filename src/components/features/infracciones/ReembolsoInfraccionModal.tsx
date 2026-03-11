import { useState } from 'react';
import { RefreshCw, DollarSign, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/hooks/useNotification';
import { useCreateReembolsoInfraccion } from '@/hooks/queries/usePagosInfracciones';
import type { PagoInfraccion } from '@/types/pago-infraccion.type';

interface ReembolsoInfraccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: PagoInfraccion | null;
  onSuccess?: () => void;
}

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA_DEBITO: 'Tarjeta de Débito',
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
  SPEI: 'SPEI',
};

export const ReembolsoInfraccionModal = ({
  open,
  onOpenChange,
  pago,
  onSuccess,
}: ReembolsoInfraccionModalProps) => {
  const notify = useNotification();
  const createReembolso = useCreateReembolsoInfraccion();
  const [motivoReembolso, setMotivoReembolso] = useState('');

  if (!pago) return null;

  const totalReembolso =
    typeof pago.total === 'string' ? parseFloat(pago.total) : Number(pago.total);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoReembolso.trim()) {
      notify.error('Error', 'Debe especificar el motivo del reembolso');
      return;
    }
    try {
      await createReembolso.mutateAsync({
        pagoOriginalId: pago.id,
        motivoReembolso: motivoReembolso.trim(),
      });
      notify.success('Éxito', 'Reembolso procesado correctamente');
      setMotivoReembolso('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ?? 'Error al procesar el reembolso';
      notify.error('Error', message);
    }
  };

  const handleCancel = () => {
    setMotivoReembolso('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <RefreshCw className="h-5 w-5" />
            Procesar Reembolso
          </DialogTitle>
          <DialogDescription>
            Ingrese el motivo del reembolso. Se creará un registro de reembolso y se actualizará el
            estado del pago.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <form id="reembolso-infraccion-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-orange-900 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Información del pago</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de pago:</span>
                  <span className="font-semibold">#{pago.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Folio infracción:</span>
                  <span className="font-semibold">{pago.folioInfraccion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ciudadano:</span>
                  <span className="font-semibold">{pago.nombreCiudadano}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de pago:</span>
                  <span className="font-semibold">
                    {metodoPagoLabel[pago.metodoPago] ?? pago.metodoPago}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-orange-300">
                  <span className="text-gray-600 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Monto a reembolsar:
                  </span>
                  <span className="font-bold text-orange-600 text-lg">
                    ${totalReembolso.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivoReembolso">
                Motivo del reembolso <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivoReembolso"
                value={motivoReembolso}
                onChange={(e) => setMotivoReembolso(e.target.value)}
                placeholder="Explique el motivo del reembolso..."
                rows={4}
                required
                className="resize-none"
              />
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createReembolso.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="reembolso-infraccion-form"
            disabled={createReembolso.isPending || !motivoReembolso.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {createReembolso.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Procesar reembolso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
