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
import { documentosService } from '@/services/documento.service';
import { imagenesService } from '@/services/imagenes.service';

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
  
  // Estado para archivos pendientes de subir (Files en memoria)
  const [archivosPendientes, setArchivosPendientes] = useState<{
    pdfs: Record<string, File>; // fieldName -> File
    imagenes: Record<string, File>; // fieldName -> File
  }>({
    pdfs: {},
    imagenes: {},
  });
  
  // Estado para archivos ya subidos (para rollback si hay error)
  const [archivosSubidos, setArchivosSubidos] = useState<{
    pdfs: string[]; // nombres de archivos PDF subidos
    imagenes: string[]; // nombres de archivos de imagen subidos
  }>({
    pdfs: [],
    imagenes: [],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 🔵 PASO 1: Subir todos los archivos pendientes PRIMERO
      const camposAdicionalesConArchivos = { ...camposAdicionales };
      const archivosSubidosTemp: { pdfs: string[]; imagenes: string[] } = {
        pdfs: [],
        imagenes: [],
      };

      // Subir PDFs
      for (const [fieldName, file] of Object.entries(archivosPendientes.pdfs)) {
        try {
          const response = await documentosService.uploadDocumento({ file });
          const filename = documentosService.extractFilename(response.data.rutaArchivo);
          camposAdicionalesConArchivos[fieldName] = filename;
          archivosSubidosTemp.pdfs.push(filename);
          console.log(`✅ PDF subido: ${filename}`);
        } catch (error) {
          console.error(`❌ Error al subir PDF ${fieldName}:`, error);
          // Si falla alguna subida, hacer rollback y abortar
          await rollbackArchivosSubidos(archivosSubidosTemp);
          notify.error('Error al subir archivos', 'No se pudo subir uno o más archivos PDF');
          return;
        }
      }

      // Subir imágenes
      for (const [fieldName, file] of Object.entries(archivosPendientes.imagenes)) {
        try {
          const response = await imagenesService.uploadImage({
            file,
            id: 999999, // ID temporal
            type: 'permisos',
          });
          const filename = response.data.data.filename;
          camposAdicionalesConArchivos[fieldName] = filename;
          archivosSubidosTemp.imagenes.push(filename);
          console.log(`✅ Imagen subida: ${filename}`);
        } catch (error) {
          console.error(`❌ Error al subir imagen ${fieldName}:`, error);
          // Si falla alguna subida, hacer rollback y abortar
          await rollbackArchivosSubidos(archivosSubidosTemp);
          notify.error('Error al subir archivos', 'No se pudo subir una o más imágenes');
          return;
        }
      }

      // Guardar archivos subidos para posible rollback
      setArchivosSubidos(archivosSubidosTemp);

      // 🔵 PASO 2: Crear el permiso con los filenames en camposAdicionales
      const dataToSubmit = {
        ...formData,
        camposAdicionales: camposAdicionalesConArchivos,
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
          
          // ❌ ROLLBACK: Eliminar archivos subidos si hay error al crear el permiso
          rollbackArchivosSubidos(archivosSubidosTemp);
        },
      });
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      notify.error('Error', 'Ocurrió un error inesperado');
    }
  };

  /**
   * Eliminar todos los archivos subidos en caso de error
   */
  const rollbackArchivosSubidos = async (archivos?: { pdfs: string[]; imagenes: string[] }) => {
    const archivosAEliminar = archivos || archivosSubidos;
    
    // Eliminar PDFs
    for (const filename of archivosAEliminar.pdfs) {
      try {
        await documentosService.deleteDocumento({ filename });
        console.log(`✅ PDF eliminado: ${filename}`);
      } catch (error) {
        console.error(`❌ Error al eliminar PDF ${filename}:`, error);
      }
    }

    // Eliminar imágenes
    for (const filename of archivosAEliminar.imagenes) {
      try {
        await imagenesService.deleteImage({ type: 'permisos', filename });
        console.log(`✅ Imagen eliminada: ${filename}`);
      } catch (error) {
        console.error(`❌ Error al eliminar imagen ${filename}:`, error);
      }
    }

    // Limpiar estado
    setArchivosSubidos({ pdfs: [], imagenes: [] });
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
    setAprobarInmediatamente(true);
    setRegistrarPago(true);
    setArchivosPendientes({ pdfs: {}, imagenes: {} });
    setArchivosSubidos({ pdfs: [], imagenes: [] });
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

  /**
   * Manejar cambio de campo PDF
   * Solo guarda el File en memoria, NO lo sube inmediatamente
   */
  const handlePdfChange = (fieldName: string, file: File | null) => {
    if (file) {
      // Guardar File en memoria para subir después
      setArchivosPendientes((prev) => ({
        ...prev,
        pdfs: { ...prev.pdfs, [fieldName]: file },
      }));
      
      // Marcar que hay un archivo pendiente
      setCamposAdicionales((prev) => ({
        ...prev,
        [fieldName]: '__PENDING__',
      }));
    } else {
      // Remover archivo pendiente
      setArchivosPendientes((prev) => {
        const newPdfs = { ...prev.pdfs };
        delete newPdfs[fieldName];
        return { ...prev, pdfs: newPdfs };
      });
      
      setCamposAdicionales((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  /**
   * Manejar cambio de campo de imagen
   * Solo guarda el File en memoria, NO lo sube inmediatamente
   */
  const handleImageChange = (fieldName: string, file: File | null) => {
    if (file) {
      // Guardar File en memoria para subir después
      setArchivosPendientes((prev) => ({
        ...prev,
        imagenes: { ...prev.imagenes, [fieldName]: file },
      }));
      
      // Marcar que hay un archivo pendiente
      setCamposAdicionales((prev) => ({
        ...prev,
        [fieldName]: '__PENDING__',
      }));
    } else {
      // Remover archivo pendiente
      setArchivosPendientes((prev) => {
        const newImagenes = { ...prev.imagenes };
        delete newImagenes[fieldName];
        return { ...prev, imagenes: newImagenes };
      });
      
      setCamposAdicionales((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
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
                    
                    <div className="grid grid-cols-1 gap-4">
                      {tipoPermisoSeleccionado.camposPersonalizados.fields.map((field, index) => {
                        // Campo tipo PDF
                        if (field.type === 'pdf') {
                          return (
                            <div key={index} className="space-y-2">
                              <Label htmlFor={`campo_${field.name}`}>
                                {field.name} {field.required && <span className="text-destructive">*</span>}
                              </Label>
                              <Input
                                id={`campo_${field.name}`}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  handlePdfChange(field.name, file || null);
                                }}
                                required={field.required}
                              />
                              {archivosPendientes.pdfs[field.name] && (
                                <p className="text-sm text-green-600">
                                  ✓ {archivosPendientes.pdfs[field.name].name} seleccionado
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Suba un archivo PDF (máx 10 MB)
                              </p>
                            </div>
                          );
                        }

                        // Campo tipo imagen
                        if (field.type === 'image') {
                          return (
                            <div key={index} className="space-y-2">
                              <Label htmlFor={`campo_${field.name}`}>
                                {field.name} {field.required && <span className="text-destructive">*</span>}
                              </Label>
                              <Input
                                id={`campo_${field.name}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  handleImageChange(field.name, file || null);
                                }}
                                required={field.required}
                              />
                              {archivosPendientes.imagenes[field.name] && (
                                <div className="space-y-2">
                                  <p className="text-sm text-green-600">
                                    ✓ {archivosPendientes.imagenes[field.name].name} seleccionada
                                  </p>
                                  {/* Preview de la imagen */}
                                  <img
                                    src={URL.createObjectURL(archivosPendientes.imagenes[field.name])}
                                    alt="Preview"
                                    className="max-w-xs h-auto rounded border"
                                  />
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Suba una imagen (JPG, PNG, GIF)
                              </p>
                            </div>
                          );
                        }

                        // Otros tipos de campos (text, number, date, etc.)
                        return (
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
                        );
                      })}
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
