import { useState, useEffect } from 'react';
import { useUpdatePermiso } from '@/hooks/queries/usePermiso';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Permiso, UpdatePermiso } from '@/types/permiso.type';

interface EditPermisoModalProps {
  open: boolean;
  onClose: () => void;
  permiso: Permiso | null;
}

export const EditPermisoModal = ({ open, onClose, permiso }: EditPermisoModalProps) => {
  const { mutate: updatePermiso, isPending } = useUpdatePermiso();
  const notify = useNotification();
  
  // Cargar tipos de permiso
  const { data: tiposPermisoData } = useTipoPermisos({ page: 1, limit: 100, isActive: true });

  const [formData, setFormData] = useState<UpdatePermiso>({
    tipoPermisoId: 0,
    nombreCiudadano: '',
    documentoCiudadano: '',
    domicilioCiudadano: '',
    telefonoCiudadano: '',
    emailCiudadano: '',
    fechaEmision: '',
    vigenciaDias: 30,
    descripcion: '',
    observaciones: '',
  });

  const [camposAdicionales, setCamposAdicionales] = useState<Record<string, any>>({});

  // Cargar datos del permiso cuando cambie
  useEffect(() => {
    if (permiso) {
      setFormData({
        tipoPermisoId: permiso.tipoPermisoId,
        nombreCiudadano: permiso.nombreCiudadano,
        documentoCiudadano: permiso.documentoCiudadano,
        domicilioCiudadano: permiso.domicilioCiudadano,
        telefonoCiudadano: permiso.telefonoCiudadano,
        emailCiudadano: permiso.emailCiudadano,
        fechaEmision: permiso.fechaEmision.split('T')[0],
        vigenciaDias: permiso.vigenciaDias,
        descripcion: permiso.descripcion,
        observaciones: permiso.observaciones || '',
      });
      setCamposAdicionales(permiso.camposAdicionales || {});
    }
  }, [permiso]);

  // Obtener el tipo de permiso seleccionado
  const tipoPermisoSeleccionado = tiposPermisoData?.items.find(
    (tp) => tp.id === formData.tipoPermisoId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!permiso) return;

    const dataToSubmit = {
      ...formData,
      camposAdicionales,
    };

    updatePermiso(
      { id: permiso.id, data: dataToSubmit },
      {
        onSuccess: () => {
          notify.success('Permiso Actualizado', 'El permiso se ha actualizado correctamente');
          onClose();
        },
        onError: (error) => {
          notify.apiError(error);
        },
      }
    );
  };

  const handleChange = (field: keyof UpdatePermiso, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCampoAdicionalChange = (fieldName: string, value: any) => {
    setCamposAdicionales((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Verificar si el permiso puede ser editado
  const canEdit = permiso?.estatus === 'PENDIENTE';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Editar Permiso</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  permiso?.estatus === 'APROBADO'
                    ? 'default'
                    : permiso?.estatus === 'PENDIENTE'
                    ? 'secondary'
                    : permiso?.estatus === 'RECHAZADO'
                    ? 'destructive'
                    : 'outline'
                }
              >
                {permiso?.estatus}
              </Badge>
              <span className="text-sm text-gray-500">Folio: {permiso?.folio}</span>
            </div>
          </div>
        </DialogHeader>

        {!canEdit && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Permiso no editable
              </p>
              <p className="text-sm text-yellow-700">
                Solo los permisos con estatus "PENDIENTE" pueden ser editados.
              </p>
            </div>
          </div>
        )}

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
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
                      placeholder="Descripción detallada del permiso..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => handleChange('observaciones', e.target.value)}
                      disabled={!canEdit}
                      placeholder="Observaciones adicionales..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                            disabled={!canEdit}
                            placeholder={`Ingrese ${field.name.toLowerCase()}`}
                          />
                        </div>
                      ))}
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
              {canEdit ? 'Cancelar' : 'Cerrar'}
            </Button>
            {canEdit && (
              <Button type="submit" disabled={isPending || !formData.tipoPermisoId}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
