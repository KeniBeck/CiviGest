import { useState, useEffect } from 'react';
import { useUpdateDepartamento } from '@/hooks/queries/useDepartamento';
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
import { Loader2, Building } from 'lucide-react';
import type { Departamento, UpdateDepartamento } from '@/types/departamento.type';

interface EditDepartamentoModalProps {
  open: boolean;
  onClose: () => void;
  departamento: Departamento | null;
}

export const EditDepartamentoModal = ({ open, onClose, departamento }: EditDepartamentoModalProps) => {
  const { mutate: updateDepartamento, isPending } = useUpdateDepartamento();
  const notify = useNotification();

  const [formData, setFormData] = useState<UpdateDepartamento>({
    nombre: '',
    descripcion: '',
  });

  // Cargar datos del departamento cuando cambie
  useEffect(() => {
    if (departamento) {
      setFormData({
        nombre: departamento.nombre,
        descripcion: departamento.descripcion,
      });
    }
  }, [departamento]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departamento) return;

    updateDepartamento(
      { id: departamento.id, data: formData },
      {
        onSuccess: () => {
          notify.success('Departamento Actualizado', 'El departamento se ha actualizado correctamente');
          onClose();
        },
        onError: (error) => {
          notify.apiError(error);
        },
      }
    );
  };

  const handleChange = (field: keyof UpdateDepartamento, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Editar Departamento</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={departamento?.isActive ? 'default' : 'outline'}>
                {departamento?.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
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
          </div>

          {/* Información adicional */}
          {departamento && (
            <div className="p-3 bg-gray-50 rounded-md space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Multas asociadas:
                </span>
                <span className="font-semibold text-gray-900">
                  {departamento._count.multas}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sede:</span>
                <span className="text-gray-900">{departamento.sede.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subsede:</span>
                <span className="text-gray-900">{departamento.subsede.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {new Date(departamento.createdAt).toLocaleDateString('es-MX')}
                </span>
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
            <Button 
              type="submit" 
              disabled={isPending || !formData.nombre?.trim() || !formData.descripcion?.trim()}
            >
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
