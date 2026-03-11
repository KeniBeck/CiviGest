import { useState, useEffect } from 'react';
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/hooks/useNotification';
import { useCreatePagoInfraccion } from '@/hooks/queries/usePagosInfracciones';
import type { Infraccion } from '@/types/infraccion.type';
import type { CreatePagoInfraccionDto } from '@/types/pago-infraccion.type';

interface PagoInfraccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  infraccion: Infraccion | null;
  onSuccess?: (pagoCreado: { data?: unknown }) => void;
}

export const PagoInfraccionModal = ({
  open,
  onOpenChange,
  infraccion,
  onSuccess,
}: PagoInfraccionModalProps) => {
  const notify = useNotification();
  const { mutate: createPago, isPending } = useCreatePagoInfraccion();

  const costoBaseNum =
    infraccion?.costoBase != null ? Number(infraccion.costoBase) : 0;

  const [formData, setFormData] = useState({
    costoBase: costoBaseNum,
    descuentoPct: 0,
    metodoPago: 'EFECTIVO' as CreatePagoInfraccionDto['metodoPago'],
    observaciones: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (infraccion && open) {
      const base = infraccion.costoBase != null ? Number(infraccion.costoBase) : 0;
      setFormData({
        costoBase: base,
        descuentoPct: 0,
        metodoPago: 'EFECTIVO',
        observaciones: '',
      });
      setErrors({});
    }
  }, [infraccion, open]);

  useEffect(() => {
    if (!open) {
      setFormData({ costoBase: 0, descuentoPct: 0, metodoPago: 'EFECTIVO', observaciones: '' });
      setErrors({});
    }
  }, [open]);

  const calcularTotal = () => {
    const descuentoMonto = (formData.costoBase * formData.descuentoPct) / 100;
    return formData.costoBase - descuentoMonto;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.costoBase || formData.costoBase <= 0)
      newErrors.costoBase = 'El costo base debe ser mayor a 0';
    if (formData.descuentoPct < 0 || formData.descuentoPct > 100)
      newErrors.descuentoPct = 'El descuento debe estar entre 0 y 100%';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infraccion || !validateForm()) return;

    const dataToSubmit: CreatePagoInfraccionDto = {
      multaId: infraccion.multaId,
      folioInfraccion: infraccion.folio,
      nombreCiudadano: infraccion.nombreCiudadano,
      documentoCiudadano: infraccion.documentoCiudadano,
      costoBase: formData.costoBase,
      descuentoPct: formData.descuentoPct,
      metodoPago: formData.metodoPago,
      observaciones: formData.observaciones || undefined,
      autorizaDescuento: formData.descuentoPct > 0,
    };

    createPago(dataToSubmit, {
      onSuccess: (response) => {
        notify.success('Pago registrado', 'El pago de la infracción se ha registrado correctamente');
        onOpenChange(false);
        onSuccess?.(response);
      },
      onError: (err) => notify.apiError(err),
    });
  };

  const handleChange = (field: string, value: number | string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (!infraccion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar Pago de Infracción
          </DialogTitle>
          <DialogDescription>
            Folio de infracción: <strong>{infraccion.folio}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Folio:</span>
                <span className="text-sm font-semibold text-gray-900">{infraccion.folio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Multa:</span>
                <span className="text-sm font-medium text-gray-900">
                  {infraccion.multa?.nombre ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ciudadano:</span>
                <span className="text-sm font-medium text-gray-900">{infraccion.nombreCiudadano}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costoBase">Costo base *</Label>
              <Input
                id="costoBase"
                type="number"
                step="0.01"
                min="0"
                value={formData.costoBase || ''}
                onChange={(e) => handleChange('costoBase', parseFloat(e.target.value) || 0)}
                className={errors.costoBase ? 'border-red-500' : ''}
              />
              {errors.costoBase && <p className="text-xs text-red-600">{errors.costoBase}</p>}
            </div>

            <div className="space-y-2 opacity-75">
              <Label htmlFor="descuentoPct">Descuento (%)</Label>
              <Input
                id="descuentoPct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.descuentoPct}
                onChange={(e) => handleChange('descuentoPct', parseFloat(e.target.value) || 0)}
                className={errors.descuentoPct ? 'border-red-500' : ''}
              />
              {errors.descuentoPct && (
                <p className="text-xs text-red-600">{errors.descuentoPct}</p>
              )}
              <p className="text-xs text-gray-500">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                Descuentos pueden requerir autorización
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-green-900">Total a pagar:</span>
                <span className="text-2xl font-bold text-green-700">
                  ${calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Método de pago</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Efectivo</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                placeholder="Ej.: Pago en ventanilla"
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Registrar pago
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
