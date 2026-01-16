import { useState, useEffect } from 'react';
import { useUpdateMulta } from '@/hooks/queries/useMultas';
import { useDepartamentos } from '@/hooks/queries/useDepartamento';
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
import { Loader2, DollarSign } from 'lucide-react';
import type { Multas, UpdateMultas } from '@/types/multas.type';

interface EditMultaModalProps {
  open: boolean;
  onClose: () => void;
  multa: Multas | null;
}

export const EditMultaModal = ({ open, onClose, multa }: EditMultaModalProps) => {
  const { mutate: updateMulta, isPending } = useUpdateMulta();
  
  // Cargar departamentos activos
  const { data: departamentosData } = useDepartamentos({ 
    page: 1, 
    limit: 100, 
    isActive: true 
  });

  const [formData, setFormData] = useState<UpdateMultas>({
    nombre: '',
    codigo: '',
    departamentoId: 0,
    descripcion: '',
    costo: 0,
    numUMAs: 0,
    numSalarios: 0,
    recargo: 0,
  });

  // Cargar datos de la multa cuando cambie
  useEffect(() => {
    if (multa) {
      setFormData({
        nombre: multa.nombre,
        codigo: multa.codigo,
        departamentoId: multa.departamentoId,
        descripcion: multa.descripcion,
        costo: parseFloat(multa.costo),
        numUMAs: parseFloat(multa.numUMAs),
        numSalarios: parseFloat(multa.numSalarios),
        recargo: parseFloat(multa.recargo),
      });
    }
  }, [multa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!multa) return;

    updateMulta(
      { id: multa.id, data: formData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleChange = (field: keyof UpdateMultas, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Editar Multa</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={multa?.isActive ? 'default' : 'outline'}>
                {multa?.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Información Básica</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre de la Multa *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      required
                      placeholder="Ej: Exceso de velocidad"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                      required
                      placeholder="Ej: MULT-001"
                      className="uppercase"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="departamentoId">Departamento *</Label>
                    <select
                      id="departamentoId"
                      value={formData.departamentoId || ''}
                      onChange={(e) => handleChange('departamentoId', parseInt(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar departamento...</option>
                      {departamentosData?.data.items.map((depto) => (
                        <option key={depto.id} value={depto.id}>
                          {depto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      required
                      placeholder="Describe la infracción y las condiciones de aplicación..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Costos y Valores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Costos y Valores</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costo">Costo Base (MXN) *</Label>
                    <Input
                      id="costo"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costo}
                      onChange={(e) => handleChange('costo', parseFloat(e.target.value) || 0)}
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numUMAs">Número de UMAs</Label>
                    <Input
                      id="numUMAs"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.numUMAs}
                      onChange={(e) => handleChange('numUMAs', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numSalarios">Número de Salarios</Label>
                    <Input
                      id="numSalarios"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.numSalarios}
                      onChange={(e) => handleChange('numSalarios', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recargo">Recargo (%)</Label>
                    <Input
                      id="recargo"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.recargo}
                      onChange={(e) => handleChange('recargo', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              {multa && (
                <div className="p-3 bg-gray-50 rounded-md space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Costo actual:
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${multa.costo} MXN
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sede:</span>
                    <span className="text-gray-900">{multa.sede.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subsede:</span>
                    <span className="text-gray-900">{multa.subsede.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de creación:</span>
                    <span className="text-gray-900">
                      {new Date(multa.createdAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                </div>
              )}
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
            <Button 
              type="submit" 
              disabled={isPending || !formData.nombre?.trim() || !formData.codigo?.trim() || !formData.departamentoId}
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
