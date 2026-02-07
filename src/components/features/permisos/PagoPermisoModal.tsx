
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
import { useCreatePagoPermiso } from '@/hooks/queries/usePagosPermisos';
import type { Permiso } from '@/types/permiso.type';
import type { CreatePagoPermisoDto } from '@/types/pago-permisos.type';

interface PagoPermisoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permiso: Permiso | null;
  onSuccess?: (pagoCreado: any) => void;
}

export const PagoPermisoModal = ({
  open,
  onOpenChange,
  permiso,
  onSuccess,
}: PagoPermisoModalProps) => {
  const notify = useNotification();
  const { mutate: createPago, isPending } = useCreatePagoPermiso();

  const [formData, setFormData] = useState<Partial<CreatePagoPermisoDto>>({
    metodoPago: 'EFECTIVO',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Cargar datos del permiso cuando se abre el modal
  useEffect(() => {
    if (permiso && open) {
      setFormData({
        permisoId: permiso.id,
        costoBase: parseFloat(permiso.costo) || parseFloat(permiso.tipoPermiso?.costoBase || '0'),
        metodoPago: 'EFECTIVO',
        observaciones: '',
        descuentoPct: 0,
        autorizaDescuento: false,
      });
      setErrors({});
    }
  }, [permiso, open]);

  // ✅ Reset form cuando se cierra
  useEffect(() => {
    if (!open) {
      setFormData({
        metodoPago: 'EFECTIVO',
        observaciones: '',
      });
      setErrors({});
    }
  }, [open]);

  // ✅ Calcular total con descuento
  const calcularTotal = () => {
    const costoBase = formData.costoBase || 0;
    const descuentoPct = formData.descuentoPct || 0;
    const descuentoMonto = (costoBase * descuentoPct) / 100;
    return costoBase - descuentoMonto;
  };

  // ✅ Validación
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.permisoId) newErrors.permisoId = 'Permiso no seleccionado';
    if (!formData.costoBase || formData.costoBase <= 0) {
      newErrors.costoBase = 'El costo base debe ser mayor a 0';
    }
    if (formData.descuentoPct && (formData.descuentoPct < 0 || formData.descuentoPct > 100)) {
      newErrors.descuentoPct = 'El descuento debe estar entre 0 y 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !permiso) return;

    const dataToSubmit: CreatePagoPermisoDto = {
      permisoId: permiso.id,
      costoBase: formData.costoBase!,
      metodoPago: 'EFECTIVO', // Por ahora solo efectivo
      observaciones: formData.observaciones,
      descuentoPct: formData.descuentoPct || 0,
      autorizaDescuento: (formData.descuentoPct || 0) > 0,
    };

    createPago(dataToSubmit, {
      onSuccess: (response) => {
        notify.success('Pago Registrado', 'El pago se ha registrado correctamente');
        onOpenChange(false);
        onSuccess?.(response.data);
      },
      onError: (error: any) => {
        notify.apiError(error);
      },
    });
  };

  // ✅ Handle input change
  const handleChange = (field: keyof CreatePagoPermisoDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!permiso) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar Pago de Permiso
          </DialogTitle>
          <DialogDescription>
            Registra el pago en efectivo del permiso <strong>{permiso.folio}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="space-y-4">
          {/* Información del Permiso */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Folio:</span>
              <span className="text-sm font-semibold text-gray-900">{permiso.folio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tipo:</span>
              <span className="text-sm font-medium text-gray-900">
                {permiso.tipoPermiso?.nombre}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ciudadano:</span>
              <span className="text-sm font-medium text-gray-900">
                {permiso.nombreCiudadano}
              </span>
            </div>
          </div>

          {/* Costo Base */}
          <div className="space-y-2">
            <Label htmlFor="costoBase">Costo Base *</Label>
            <Input
              id="costoBase"
              type="number"
              step="0.01"
              min="0"
              value={formData.costoBase || ''}
              onChange={(e) => handleChange('costoBase', parseFloat(e.target.value))}
              className={errors.costoBase ? 'border-red-500' : ''}
            />
            {errors.costoBase && <p className="text-xs text-red-600">{errors.costoBase}</p>}
          </div>

          {/* Descuento (Opcional - por ahora deshabilitado) */}
          <div className="space-y-2 opacity-50 pointer-events-none">
            <Label htmlFor="descuentoPct">Descuento (%) - Próximamente</Label>
            <Input
              id="descuentoPct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.descuentoPct || 0}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Los descuentos requieren autorización de un administrador
            </p>
          </div>

          {/* Total a Pagar */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-900">Total a Pagar:</span>
              <span className="text-2xl font-bold text-green-700">
                ${calcularTotal().toFixed(2)}
              </span>
            </div>
            {(formData.descuentoPct || 0) > 0 && (
              <div className="mt-2 text-sm text-green-700">
                (Descuento aplicado: {formData.descuentoPct}%)
              </div>
            )}
          </div>

          {/* Método de Pago */}
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Efectivo</span>
                <span className="ml-auto text-xs text-gray-500">(Único método disponible)</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Ejemplo: Pago en ventanilla 3"
              value={formData.observaciones || ''}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
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
              Registrar Pago
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
  );
};
