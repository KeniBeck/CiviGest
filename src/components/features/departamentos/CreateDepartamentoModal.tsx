import { useState } from 'react';
import { useCreateDepartamento } from '@/hooks/queries/useDepartamento';
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
import type { CreateDepartamento } from '@/types/departamento.type';

interface CreateDepartamentoModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateDepartamentoModal = ({ open, onClose }: CreateDepartamentoModalProps) => {
  const { mutate: createDepartamento, isPending } = useCreateDepartamento();

  const [formData, setFormData] = useState<CreateDepartamento>({
    nombre: '',
    descripcion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDepartamento(formData, {
      onSuccess: () => {
        onClose();
        setFormData({ nombre: '', descripcion: '' });
      },
    });
  };

  const handleChange = (field: keyof CreateDepartamento, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Departamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Departamento *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
              placeholder="Ej: Recursos Humanos, Finanzas, Seguridad"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción *</Label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              required
              placeholder="Describe las funciones y responsabilidades del departamento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Proporciona una descripción clara de las funciones del departamento
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
            <Button 
              type="submit" 
              disabled={isPending || !formData.nombre.trim() || !formData.descripcion.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Departamento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
