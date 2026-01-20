import { useState, useEffect } from 'react';
import { useUpdateTipoAgente } from '@/hooks/queries/useTipoAgente';
import { useNotification } from '@/hooks/useNotification';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { TipoAgente, UpdateTipoAgente } from '@/types/tipo-agente.type';

interface EditTipoAgenteModalProps {
  open: boolean;
  onClose: () => void;
  tipoAgente: TipoAgente | null;
}

export const EditTipoAgenteModal = ({ open, onClose, tipoAgente }: EditTipoAgenteModalProps) => {
  const notify = useNotification();
  const { mutate: updateTipoAgente, isPending } = useUpdateTipoAgente();

  const [formData, setFormData] = useState<UpdateTipoAgente>({
    tipo: '',
  });

  // Cargar datos del tipo de agente cuando cambie
  useEffect(() => {
    if (tipoAgente) {
      setFormData({
        tipo: tipoAgente.tipo,
      });
    }
  }, [tipoAgente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipoAgente) return;

    updateTipoAgente(
      { id: tipoAgente.id, data: formData },
      {
        onSuccess: () => {
          notify.success('Tipo de Agente Actualizado', 'El tipo de agente se ha actualizado correctamente');
          onClose();
        },
        onError: (error) => {
          notify.apiError(error);
        },
      }
    );
  };

  const handleChange = (field: keyof UpdateTipoAgente, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Editar Tipo de Agente</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={tipoAgente?.isActive ? 'default' : 'outline'}>
                {tipoAgente?.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Nombre del Tipo *</Label>
            <Input
              id="tipo"
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              required
              placeholder="Ej: Policía Municipal, Tránsito, Seguridad"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingrese el nombre del tipo de agente
            </p>
          </div>

          {/* Información adicional */}
          {tipoAgente && (
            <div className="p-3 bg-gray-50 rounded-md space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Agentes asignados:</span>
                <span className="font-semibold text-gray-900">
                  {tipoAgente._count.agentes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sede:</span>
                <span className="text-gray-900">{tipoAgente.sede.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subsede:</span>
                <span className="text-gray-900">{tipoAgente.subsede.name}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !formData.tipo?.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
