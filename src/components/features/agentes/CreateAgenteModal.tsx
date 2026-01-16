import { useState } from 'react';
import { useCreateAgente } from '@/hooks/queries/useAgentes';
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
import type { CreateAgente } from '@/types/agente.type';

interface CreateAgenteModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateAgenteModal = ({ open, onClose }: CreateAgenteModalProps) => {
  const { mutate: createAgente, isPending } = useCreateAgente();

  const [formData, setFormData] = useState<CreateAgente>({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoId: 0,
    cargo: '',
    numPlantilla: '',
    numEmpleadoBiometrico: '',
    foto: '',
    whatsapp: 0,
    correo: '',
    contrasena: '',
    departamentoId: 0,
    patrullaId: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createAgente(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          nombres: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          tipoId: 0,
          cargo: '',
          numPlantilla: '',
          numEmpleadoBiometrico: '',
          foto: '',
          whatsapp: 0,
          correo: '',
          contrasena: '',
          departamentoId: 0,
          patrullaId: 0,
        });
      },
    });
  };

  const handleChange = (field: keyof CreateAgente, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Crear Nuevo Agente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="space-y-4">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Información Personal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombres">Nombres *</Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => handleChange('nombres', e.target.value)}
                      required
                      placeholder="Ej: Juan Carlos"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                    <Input
                      id="apellidoPaterno"
                      value={formData.apellidoPaterno}
                      onChange={(e) => handleChange('apellidoPaterno', e.target.value)}
                      required
                      placeholder="Ej: García"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apellidoMaterno">Apellido Materno *</Label>
                    <Input
                      id="apellidoMaterno"
                      value={formData.apellidoMaterno}
                      onChange={(e) => handleChange('apellidoMaterno', e.target.value)}
                      required
                      placeholder="Ej: López"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => handleChange('cargo', e.target.value)}
                      required
                      placeholder="Ej: Oficial de Tránsito"
                    />
                  </div>
                </div>
              </div>

              {/* Información Laboral */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Información Laboral</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numPlantilla">Número de Plantilla *</Label>
                    <Input
                      id="numPlantilla"
                      value={formData.numPlantilla}
                      onChange={(e) => handleChange('numPlantilla', e.target.value)}
                      required
                      placeholder="Ej: 12345"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numEmpleadoBiometrico">No. Empleado Biométrico *</Label>
                    <Input
                      id="numEmpleadoBiometrico"
                      value={formData.numEmpleadoBiometrico}
                      onChange={(e) => handleChange('numEmpleadoBiometrico', e.target.value)}
                      required
                      placeholder="Ej: BIO-001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipoId">Tipo de Agente *</Label>
                    <Input
                      id="tipoId"
                      type="number"
                      value={formData.tipoId || ''}
                      onChange={(e) => handleChange('tipoId', parseInt(e.target.value))}
                      required
                      placeholder="ID del tipo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="departamentoId">Departamento *</Label>
                    <Input
                      id="departamentoId"
                      type="number"
                      value={formData.departamentoId || ''}
                      onChange={(e) => handleChange('departamentoId', parseInt(e.target.value))}
                      required
                      placeholder="ID del departamento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="patrullaId">Patrulla (Opcional)</Label>
                    <Input
                      id="patrullaId"
                      type="number"
                      value={formData.patrullaId || ''}
                      onChange={(e) => handleChange('patrullaId', parseInt(e.target.value))}
                      placeholder="ID de la patrulla"
                    />
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Información de Contacto</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="correo">Correo Electrónico *</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      required
                      placeholder="agente@ejemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      type="number"
                      value={formData.whatsapp || ''}
                      onChange={(e) => handleChange('whatsapp', parseInt(e.target.value))}
                      required
                      placeholder="3121234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contrasena">Contraseña *</Label>
                    <Input
                      id="contrasena"
                      type="password"
                      value={formData.contrasena}
                      onChange={(e) => handleChange('contrasena', e.target.value)}
                      required
                      placeholder="Contraseña segura"
                    />
                  </div>

                  <div>
                    <Label htmlFor="foto">URL de Foto (Opcional)</Label>
                    <Input
                      id="foto"
                      value={formData.foto}
                      onChange={(e) => handleChange('foto', e.target.value)}
                      placeholder="https://ejemplo.com/foto.jpg"
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
                'Crear Agente'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
