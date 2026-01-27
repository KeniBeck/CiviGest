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
import { useCreateReembolso } from '@/hooks/queries/usePagosPermisos';
import type { PagoPermiso } from '@/types/pago-permisos.type';

interface ReembolsoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: PagoPermiso | null;
  onSuccess?: () => void;
}

export const ReembolsoModal = ({ 
  open, 
  onOpenChange, 
  pago,
  onSuccess 
}: ReembolsoModalProps) => {
  const notify = useNotification();
  const createReembolso = useCreateReembolso();
  const [motivoReembolso, setMotivoReembolso] = useState('');

  if (!pago) return null;

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
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error al procesar reembolso:', error);
      const errorMessage = error.response?.data?.message || 'Error al procesar el reembolso';
      notify.error('Error', errorMessage);
    }
  };

  const handleCancel = () => {
    setMotivoReembolso('');
    onOpenChange(false);
  };

  // Calcular total a reembolsar
  const totalReembolso = typeof pago.total === 'string' 
    ? parseFloat(pago.total) 
    : pago.total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <RefreshCw className="h-5 w-5" />
            Procesar Reembolso
          </DialogTitle>
          <DialogDescription>
            Ingrese el motivo del reembolso. Esta acción creará un registro de reembolso y actualizará el estado del pago.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        <form id="reembolso-form" onSubmit={handleSubmit} className="space-y-6">{/* Información del pago */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-orange-900 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              <span>Información del Pago</span>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID de Pago:</span>
                <span className="font-semibold">#{pago.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Ciudadano:</span>
                <span className="font-semibold">{pago.nombreCiudadano}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Documento:</span>
                <span className="font-semibold">{pago.documentoCiudadano}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-semibold">
                  {pago.metodoPago === 'EFECTIVO' && 'Efectivo'}
                  {pago.metodoPago === 'TARJETA_DEBITO' && 'Tarjeta de Débito'}
                  {pago.metodoPago === 'TARJETA_CREDITO' && 'Tarjeta de Crédito'}
                  {pago.metodoPago === 'TRANSFERENCIA' && 'Transferencia'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-orange-300">
                <span className="text-gray-600 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Monto a Reembolsar:
                </span>
                <span className="font-bold text-orange-600 text-lg">
                  ${totalReembolso.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Motivo del reembolso */}
          <div className="space-y-2">
            <Label htmlFor="motivoReembolso" className="text-sm font-semibold">
              Motivo del Reembolso <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivoReembolso"
              value={motivoReembolso}
              onChange={(e) => setMotivoReembolso(e.target.value)}
              placeholder="Explique detalladamente el motivo del reembolso..."
              rows={4}
              required
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Este motivo quedará registrado en el sistema y será visible en el historial.
            </p>
          </div>
          </form>
        </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <div className="flex gap-2 w-full sm:w-auto">
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
              form="reembolso-form"
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
                  Procesar Reembolso
                </>
              )}
            </Button>
            </div>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
