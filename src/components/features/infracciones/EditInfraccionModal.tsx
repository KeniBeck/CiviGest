import { useState, useEffect } from 'react';
import { useUpdateInfraccion } from '@/hooks/queries/useInfraccion';
import { useNotification } from '@/hooks/useNotification';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { Infraccion, InfraccionEstatus } from '@/types/infraccion.type';

interface EditInfraccionModalProps {
  open: boolean;
  onClose: () => void;
  infraccion: Infraccion | null;
  onSuccess?: () => void;
}

const ESTATUS_OPTIONS: { value: InfraccionEstatus; label: string }[] = [
  { value: 'LEVANTADA', label: 'Levantada' },
  { value: 'PAGADA', label: 'Pagada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'PRESCRITA', label: 'Prescrita' },
  { value: 'EN_PROCESO', label: 'En proceso' },
];

export const EditInfraccionModal = ({
  open,
  onClose,
  infraccion,
  onSuccess,
}: EditInfraccionModalProps) => {
  const notify = useNotification();
  const { mutate: updateInfraccion, isPending } = useUpdateInfraccion();
  const [estatus, setEstatus] = useState<InfraccionEstatus>('LEVANTADA');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (infraccion && open) {
      setEstatus(infraccion.estatus);
      setObservaciones(infraccion.observaciones ?? '');
    }
  }, [infraccion, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infraccion) return;
    updateInfraccion(
      {
        id: infraccion.id,
        data: { estatus, observaciones: observaciones || undefined },
      },
      {
        onSuccess: () => {
          notify.success('Infracción actualizada', 'Los cambios se han guardado correctamente');
          onClose();
          onSuccess?.();
        },
        onError: (err) => notify.apiError(err),
      }
    );
  };

  if (!infraccion) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Editar Infracción</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Folio: {infraccion.folio}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <Label htmlFor="estatus">Estatus</Label>
              <select
                id="estatus"
                value={estatus}
                onChange={(e) => setEstatus(e.target.value as InfraccionEstatus)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {ESTATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
