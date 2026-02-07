import { useState } from 'react';
import { useCreateTipoPermiso } from '@/hooks/queries/useTipoPermiso';
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
import { Loader2, Plus, X } from 'lucide-react';
import type { CreateTipoPermiso, CampoPersonalizado } from '@/types/tipo-permiso.type';

interface CreateTipoPermisoModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTipoPermisoModal = ({ open, onClose }: CreateTipoPermisoModalProps) => {
  const notify = useNotification();
  const { mutate: createTipoPermiso, isPending } = useCreateTipoPermiso();

  const [formData, setFormData] = useState<CreateTipoPermiso>({
    nombre: '',
    descripcion: '',
    costoBase: 0,
    numUMAsBase: 0,
    numSalariosBase: 0,
    vigenciaDefecto: 30,
    camposPersonalizados: {
      fields: [],
    },
  });

  const [newField, setNewField] = useState<CampoPersonalizado>({
    name: '',
    type: 'text',
    required: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createTipoPermiso(formData, {
      onSuccess: () => {
        notify.success('Tipo de Permiso Creado', 'El tipo de permiso se ha creado correctamente');
        onClose();
        setFormData({
          nombre: '',
          descripcion: '',
          costoBase: 0,
          numUMAsBase: 0,
          numSalariosBase: 0,
          vigenciaDefecto: 30,
          camposPersonalizados: {
            fields: [],
          },
        });
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleChange = (field: keyof CreateTipoPermiso, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    if (newField.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        camposPersonalizados: {
          fields: [...(prev.camposPersonalizados?.fields || []), { ...newField }],
        },
      }));
      setNewField({ name: '', type: 'text', required: false });
    }
  };

  const removeCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      camposPersonalizados: {
        fields: prev.camposPersonalizados?.fields.filter((_, i) => i !== index) || [],
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Crear Nuevo Tipo de Permiso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Información Básica</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Permiso *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      required
                      placeholder="Ej: Permiso de Construcción"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      required
                      placeholder="Descripción detallada del tipo de permiso..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Costos y Vigencia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Costos y Vigencia</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costoBase">Costo Base *</Label>
                    <Input
                      id="costoBase"
                      type="number"
                      step="0.01"
                      value={formData.costoBase || ''}
                      onChange={(e) => handleChange('costoBase', parseFloat(e.target.value))}
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numUMAsBase">Número de UMAs Base *</Label>
                    <Input
                      id="numUMAsBase"
                      type="number"
                      step="0.01"
                      value={formData.numUMAsBase || ''}
                      onChange={(e) => handleChange('numUMAsBase', parseFloat(e.target.value))}
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numSalariosBase">Número de Salarios Base *</Label>
                    <Input
                      id="numSalariosBase"
                      type="number"
                      step="0.01"
                      value={formData.numSalariosBase || ''}
                      onChange={(e) => handleChange('numSalariosBase', parseFloat(e.target.value))}
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vigenciaDefecto">Vigencia por Defecto (días) *</Label>
                    <Input
                      id="vigenciaDefecto"
                      type="number"
                      value={formData.vigenciaDefecto || ''}
                      onChange={(e) => handleChange('vigenciaDefecto', parseInt(e.target.value))}
                      required
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              {/* Campos Personalizados */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Campos Personalizados</h3>
                
                {/* Lista de campos existentes */}
                {formData.camposPersonalizados?.fields && formData.camposPersonalizados.fields.length > 0 && (
                  <div className="space-y-2">
                    {formData.camposPersonalizados.fields.map((field, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{field.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                          {field.required && (
                            <span className="text-xs text-red-600 ml-2">*Requerido</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeCustomField(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar nuevo campo */}
                <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <p className="text-sm font-medium text-gray-700">Agregar Campo</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Input
                        placeholder="Nombre del campo"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="date">Fecha</option>
                        <option value="email">Email</option>
                        <option value="tel">Teléfono</option>
                        <option value="image">Imagen</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Requerido</span>
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addCustomField}
                        disabled={!newField.name.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
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
                'Crear Tipo de Permiso'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
