import { useState, useEffect } from 'react';
import { useCreatePermiso, useAprobarPermiso } from '@/hooks/queries/usePermiso';
import { useTipoPermisos } from '@/hooks/queries/useTipoPermiso';
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
import type { CreatePermiso } from '@/types/permiso.type';

interface CreatePermisoModalProps {
  open: boolean;
  onClose: () => void;
  onPermisoCreado?: (permisoId: number, abrirPago: boolean) => void;
}

export const CreatePermisoModal = ({ open, onClose, onPermisoCreado }: CreatePermisoModalProps) => {
  const notify = useNotification();
  const { mutate: createPermiso, isPending } = useCreatePermiso();
  const { mutate: aprobarPermiso, isPending: isAprobando } = useAprobarPermiso();
  
  // Cargar tipos de permiso
  const { data: tiposPermisoData } = useTipoPermisos({ page: 1, limit: 100, isActive: true });

  const [formData, setFormData] = useState<CreatePermiso>({
    tipoPermisoId: 0,
    nombreCiudadano: '',
    documentoCiudadano: '',
    domicilioCiudadano: '',
    telefonoCiudadano: '',
    emailCiudadano: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    vigenciaDias: 30,
    camposAdicionales: {},
    descripcion: '',
  });

  const [camposAdicionales, setCamposAdicionales] = useState<Record<string, any>>({});
  const [aprobarInmediatamente, setAprobarInmediatamente] = useState(true); // ✅ Por defecto TRUE
  const [registrarPago, setRegistrarPago] = useState(true); // ✅ Por defecto TRUE

  // Obtener el tipo de permiso seleccionado
  const tipoPermisoSeleccionado = tiposPermisoData?.items.find(
    (tp) => tp.id === formData.tipoPermisoId
  );

  // Actualizar vigencia cuando cambia el tipo de permiso
  useEffect(() => {
    if (tipoPermisoSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        vigenciaDias: tipoPermisoSeleccionado.vigenciaDefecto,
      }));
    }
  }, [tipoPermisoSeleccionado]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      camposAdicionales,
    };

    createPermiso(dataToSubmit, {
      onSuccess: (permisoCreado) => {
        notify.success('Permiso Creado', 'El permiso se ha creado correctamente');
        
        // Si se marcó "Aprobar inmediatamente", aprobar el permiso
        if (aprobarInmediatamente && permisoCreado) {
          aprobarPermiso(
            { id: permisoCreado.id, observaciones: 'Aprobado automáticamente al crear' },
            {
              onSuccess: () => {
                notify.success('Permiso Aprobado', 'El permiso ha sido aprobado automáticamente');
                
                // Si también se marcó "Registrar pago", abrir modal de pago
                if (registrarPago && onPermisoCreado) {
                  onPermisoCreado(permisoCreado.id, true);
                }
                
                onClose();
                resetForm();
              },
              onError: (error) => {
                notify.apiError(error);
                onClose();
                resetForm();
              },
            }
          );
        } else {
          onClose();
          resetForm();
        }
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const resetForm = () => {
    setFormData({
      tipoPermisoId: 0,
      nombreCiudadano: '',
      documentoCiudadano: '',
      domicilioCiudadano: '',
      telefonoCiudadano: '',
      emailCiudadano: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      vigenciaDias: 30,
      camposAdicionales: {},
      descripcion: '',
    });
    setCamposAdicionales({});
    setAprobarInmediatamente(false);
    setRegistrarPago(false);
  };

  const handleChange = (field: keyof CreatePermiso, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCampoAdicionalChange = (fieldName: string, value: any) => {
    setCamposAdicionales((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Crear Nuevo Permiso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="space-y-6">
              {/* Tipo de Permiso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Tipo de Permiso</h3>
                
                <div>
                  <Label htmlFor="tipoPermisoId">Tipo de Permiso *</Label>
                  <select
                    id="tipoPermisoId"
                    value={formData.tipoPermisoId || ''}
                    onChange={(e) => handleChange('tipoPermisoId', parseInt(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tipo de permiso...</option>
                    {tiposPermisoData?.items.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre} - ${tipo.costoBase}
                      </option>
                    ))}
                  </select>
                  {tipoPermisoSeleccionado && (
                    <p className="text-sm text-gray-500 mt-1">
                      {tipoPermisoSeleccionado.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* Información del Ciudadano */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Información del Ciudadano</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombreCiudadano">Nombre Completo *</Label>
                    <Input
                      id="nombreCiudadano"
                      value={formData.nombreCiudadano}
                      onChange={(e) => handleChange('nombreCiudadano', e.target.value)}
                      required
                      placeholder="Ej: Juan Pérez García"
                    />
                  </div>

                  <div>
                    <Label htmlFor="documentoCiudadano">Documento de Identidad *</Label>
                    <Input
                      id="documentoCiudadano"
                      value={formData.documentoCiudadano}
                      onChange={(e) => handleChange('documentoCiudadano', e.target.value)}
                      required
                      placeholder="Ej: CURP, INE, RFC"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="domicilioCiudadano">Domicilio *</Label>
                    <Input
                      id="domicilioCiudadano"
                      value={formData.domicilioCiudadano}
                      onChange={(e) => handleChange('domicilioCiudadano', e.target.value)}
                      required
                      placeholder="Calle, número, colonia, CP"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefonoCiudadano">Teléfono *</Label>
                    <Input
                      id="telefonoCiudadano"
                      type="tel"
                      value={formData.telefonoCiudadano}
                      onChange={(e) => handleChange('telefonoCiudadano', e.target.value)}
                      required
                      placeholder="3121234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emailCiudadano">Correo Electrónico *</Label>
                    <Input
                      id="emailCiudadano"
                      type="email"
                      value={formData.emailCiudadano}
                      onChange={(e) => handleChange('emailCiudadano', e.target.value)}
                      required
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              {/* Vigencia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Vigencia y Descripción</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
                    <Input
                      id="fechaEmision"
                      type="date"
                      value={formData.fechaEmision}
                      onChange={(e) => handleChange('fechaEmision', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="vigenciaDias">Vigencia (días) *</Label>
                    <Input
                      id="vigenciaDias"
                      type="number"
                      value={formData.vigenciaDias}
                      onChange={(e) => handleChange('vigenciaDias', parseInt(e.target.value))}
                      required
                      min="1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      required
                      placeholder="Descripción detallada del permiso..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Campos Personalizados del Tipo de Permiso */}
              {tipoPermisoSeleccionado?.camposPersonalizados?.fields &&
                tipoPermisoSeleccionado.camposPersonalizados.fields.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Campos Adicionales</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tipoPermisoSeleccionado.camposPersonalizados.fields.map((field, index) => (
                        <div key={index}>
                          <Label htmlFor={`campo_${field.name}`}>
                            {field.name} {field.required && '*'}
                          </Label>
                          <Input
                            id={`campo_${field.name}`}
                            type={field.type}
                            value={camposAdicionales[field.name] || ''}
                            onChange={(e) => handleCampoAdicionalChange(field.name, e.target.value)}
                            required={field.required}
                            placeholder={`Ingrese ${field.name.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* ✅ Opciones de Aprobación y Pago */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-700">Opciones Adicionales</h3>
              
              {/* Aprobar Inmediatamente */}
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="checkbox"
                  id="aprobarInmediatamente"
                  checked={aprobarInmediatamente}
                  onChange={(e) => {
                    setAprobarInmediatamente(e.target.checked);
                    // Si se desmarca aprobar, también desmarcar pago
                    if (!e.target.checked) {
                      setRegistrarPago(false);
                    }
                  }}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="aprobarInmediatamente" className="cursor-pointer flex-1">
                  <p className="text-sm font-medium text-green-900">
                    ✅ Aprobar permiso inmediatamente
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    El permiso será aprobado automáticamente después de crearlo
                  </p>
                </label>
              </div>

              {/* Registrar Pago (solo si aprobar está marcado) */}
              <div 
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  aprobarInmediatamente 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-100 border-gray-200 opacity-50'
                }`}
              >
                <input
                  type="checkbox"
                  id="registrarPago"
                  checked={registrarPago}
                  onChange={(e) => setRegistrarPago(e.target.checked)}
                  disabled={!aprobarInmediatamente}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 disabled:cursor-not-allowed"
                />
                <label 
                  htmlFor="registrarPago" 
                  className={`flex-1 ${aprobarInmediatamente ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <p className={`text-sm font-medium ${aprobarInmediatamente ? 'text-blue-900' : 'text-gray-600'}`}>
                    💵 Registrar pago inmediatamente
                  </p>
                  <p className={`text-xs mt-1 ${aprobarInmediatamente ? 'text-blue-700' : 'text-gray-500'}`}>
                    {aprobarInmediatamente 
                      ? 'Se abrirá el formulario de pago después de aprobar el permiso'
                      : 'Debes marcar "Aprobar inmediatamente" para habilitar esta opción'
                    }
                  </p>
                </label>
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
            <Button type="submit" disabled={isPending || isAprobando || !formData.tipoPermisoId}>
              {(isPending || isAprobando) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Creando...' : 'Aprobando...'}
                </>
              ) : (
                <>
                  {aprobarInmediatamente 
                    ? (registrarPago ? '✅💵 Crear, Aprobar y Pagar' : '✅ Crear y Aprobar')
                    : 'Crear Permiso'
                  }
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
