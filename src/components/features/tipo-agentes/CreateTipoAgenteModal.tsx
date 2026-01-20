import { useState } from 'react';
import { useCreateTipoAgente } from '@/hooks/queries/useTipoAgente';
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
import { Loader2 } from 'lucide-react';
import type { CreateTipoAgente } from '@/types/tipo-agente.type';

interface CreateTipoAgenteModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTipoAgenteModal = ({ open, onClose }: CreateTipoAgenteModalProps) => {
  const notify = useNotification();
  const { mutate: createTipoAgente, isPending } = useCreateTipoAgente();

  const [formData, setFormData] = useState<CreateTipoAgente>({
    tipo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTipoAgente(formData, {
      onSuccess: () => {
        notify.success('Tipo de Agente Creado', 'El tipo de agente se ha creado correctamente');
        onClose();
        setFormData({ tipo: '' });
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleChange = (field: keyof CreateTipoAgente, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Tipo de Agente</DialogTitle>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !formData.tipo.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Tipo de Agente'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
