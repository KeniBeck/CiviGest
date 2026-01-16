import { useState } from 'react';
import { useCreatePatrulla } from '@/hooks/queries/usePatrulla';
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
import type { CreatePatrulla } from '@/types/patrulla.type';

interface CreatePatrullaModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePatrullaModal = ({ open, onClose }: CreatePatrullaModalProps) => {
  const { mutate: createPatrulla, isPending } = useCreatePatrulla();

  const [formData, setFormData] = useState<CreatePatrulla>({
    marca: '',
    modelo: '',
    placa: '',
    numPatrulla: '',
    serie: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPatrulla(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          marca: '',
          modelo: '',
          placa: '',
          numPatrulla: '',
          serie: '',
        });
      },
    });
  };

  const handleChange = (field: keyof CreatePatrulla, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Crear Nueva Patrulla</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="space-y-4">
              {/* Información de la Patrulla */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Información del Vehículo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numPatrulla">Número de Patrulla *</Label>
                    <Input
                      id="numPatrulla"
                      value={formData.numPatrulla}
                      onChange={(e) => handleChange('numPatrulla', e.target.value)}
                      required
                      placeholder="Ej: P-001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="placa">Placa *</Label>
                    <Input
                      id="placa"
                      value={formData.placa}
                      onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
                      required
                      placeholder="Ej: ABC-123-XYZ"
                    />
                  </div>

                  <div>
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => handleChange('marca', e.target.value)}
                      required
                      placeholder="Ej: Toyota"
                    />
                  </div>

                  <div>
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => handleChange('modelo', e.target.value)}
                      required
                      placeholder="Ej: Hilux 2023"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="serie">Número de Serie *</Label>
                    <Input
                      id="serie"
                      value={formData.serie}
                      onChange={(e) => handleChange('serie', e.target.value.toUpperCase())}
                      required
                      placeholder="Ej: 1HGBH41JXMN109186"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Patrulla'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
