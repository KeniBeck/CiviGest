import { useState, useEffect, useRef } from 'react';
import { useAgente, useUpdateAgente } from '@/hooks/queries/useAgentes';
import { useNotification } from '@/hooks/useNotification';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { tipoAgenteService } from '@/services/tipo-agente.service';
import { departamentoService } from '@/services/departamento.service';
import { patrullaService } from '@/services/patrulla.service';
import { imagenesService } from '@/services/imagenes.service';
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
import { Loader2, Upload, X } from 'lucide-react';
import type { UpdateAgente } from '@/types/agente.type';
import type { TipoAgente } from '@/types/tipo-agente.type';
import type { Departamento } from '@/types/departamento.type';
import type { Patrulla } from '@/types/patrulla.type';

interface EditAgenteModalProps {
  open: boolean;
  onClose: () => void;
  agenteId: number;
}

export const EditAgenteModal = ({ open, onClose, agenteId }: EditAgenteModalProps) => {
  const notify = useNotification();
  const { data: agente, isLoading: isLoadingAgente } = useAgente(agenteId);
  const { mutate: updateAgente, isPending } = useUpdateAgente();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UpdateAgente>({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoId: 0,
    cargo: '',
    numPlaca: '',
    numEmpleadoBiometrico: '',
    foto: '',
    whatsapp: '',
    correo: '',
    contrasena: '',
    departamentoId: 0,
    patrullaId: 0,
  });

  // Cargar datos del agente cuando se abra el modal
  useEffect(() => {
    if (agente) {
      setFormData({
        nombres: agente.nombres,
        apellidoPaterno: agente.apellidoPaterno,
        apellidoMaterno: agente.apellidoMaterno,
        tipoId: agente.tipoId,
        cargo: agente.cargo,
        numPlaca: agente.numPlaca,
        numEmpleadoBiometrico: agente.numEmpleadoBiometrico,
        foto: agente.foto,
        whatsapp: agente.whatsapp,
        correo: agente.correo,
        contrasena: '', // No cargar la contraseña por seguridad
        departamentoId: agente.departamentoId,
        patrullaId: agente.patrullaId || 0,
      });
      
      // Cargar URL de la imagen actual si existe
      if (agente.foto) {
        const imageUrl = imagenesService.getImageUrl({
          type: 'agentes',
          filename: agente.foto,
        });
        setCurrentImageUrl(imageUrl);
      }
    }
  }, [agente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUploadingImage(true);
    
    try {
      // 1. Si hay nueva imagen, reemplazar la anterior
      if (selectedFile) {
        // Si hay imagen anterior, usar replace, si no, usar upload
        if (agente?.foto) {
          const replaceResponse = await imagenesService.replaceImage({
            file: selectedFile,
            type: 'agentes',
            filename: agente.foto,
            id: 1,
          });
          formData.foto = replaceResponse.data.data.filename;
        } else {
          const uploadResponse = await imagenesService.uploadImage({
            file: selectedFile,
            type: 'agentes',
            id: 1,
          });
          formData.foto = uploadResponse.data.data.filename;
        }
      }

      // 2. Remover contraseña si está vacía
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.contrasena) {
        delete dataToSubmit.contrasena;
      }

      // 3. Actualizar el agente
      updateAgente(
        { id: agenteId, data: dataToSubmit },
        {
          onSuccess: () => {
            notify.success('Agente Actualizado', 'El agente se ha actualizado correctamente');
            setSelectedFile(null);
            setPreviewUrl('');
            setIsUploadingImage(false);
            onClose();
          },
          onError: (error) => {
            setIsUploadingImage(false);
            notify.apiError(error);
          },
        }
      );
    } catch (error: any) {
      setIsUploadingImage(false);
      notify.error('Error al Subir Imagen', error.message || 'No se pudo subir la imagen');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        notify.error('Archivo Inválido', 'Por favor seleccione una imagen válida');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notify.error('Archivo Muy Grande', 'La imagen no debe superar los 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteCurrentImage = async () => {
    if (!agente?.foto) return;

    try {
      // Eliminar imagen del servidor
      await imagenesService.deleteImage({
        type: 'agentes',
        filename: agente.foto,
      });

      // Actualizar estado local
      setCurrentImageUrl('');
      setFormData((prev) => ({ ...prev, foto: '' }));
      
      notify.success('Foto Eliminada', 'La foto ha sido eliminada correctamente');
    } catch (error: any) {
      notify.error('Error al Eliminar', error.message || 'No se pudo eliminar la foto');
    }
  };

  const handleChange = (field: keyof UpdateAgente, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Editar Agente</DialogTitle>
        </DialogHeader>

        {isLoadingAgente ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Cargando datos...</span>
          </div>
        ) : (
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
                      <Label htmlFor="numPlaca">Número de Placa *</Label>
                      <Input
                        id="numPlaca"
                        value={formData.numPlaca}
                        onChange={(e) => handleChange('numPlaca', e.target.value)}
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
                      <SearchableSelect
                        placeholder="Seleccionar tipo de agente"
                        value={formData.tipoId || 0}
                        onChange={(value) => handleChange('tipoId', Number(value))}
                        queryKey={['tipos-agente-select-edit']}
                        queryFn={async ({ page, search, limit }) => {
                          const response = await tipoAgenteService.getAll({
                            page,
                            search,
                            limit,
                            isActive: true,
                          });
                          return response.data;
                        }}
                        getOptionLabel={(item: TipoAgente) => item.tipo}
                        getOptionValue={(item: TipoAgente) => item.id}
                      />
                    </div>

                    <div>
                      <Label htmlFor="departamentoId">Departamento *</Label>
                      <SearchableSelect
                        placeholder="Seleccionar departamento"
                        value={formData.departamentoId || 0}
                        onChange={(value) => handleChange('departamentoId', Number(value))}
                        queryKey={['departamentos-select-edit']}
                        queryFn={async ({ page, search, limit }) => {
                          const response = await departamentoService.getAll({
                            page,
                            search,
                            limit,
                            isActive: true,
                          });
                          return response.data;
                        }}
                        getOptionLabel={(item: Departamento) => item.nombre}
                        getOptionValue={(item: Departamento) => item.id}
                      />
                    </div>

                    <div>
                      <Label htmlFor="patrullaId">Patrulla (Opcional)</Label>
                      <SearchableSelect
                        placeholder="Seleccionar patrulla"
                        value={formData.patrullaId || 0}
                        onChange={(value) => handleChange('patrullaId', Number(value))}
                        queryKey={['patrullas-select-edit']}
                        queryFn={async ({ page, search, limit }) => {
                          const response = await patrullaService.getAll({
                            page,
                            search,
                            limit,
                            isActive: true,
                          });
                          return response.data;
                        }}
                        getOptionLabel={(item: Patrulla) => `${item.numPatrulla} - ${item.marca} ${item.modelo}`}
                        getOptionValue={(item: Patrulla) => item.id}
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
                        type="tel"
                        value={formData.whatsapp || ''}
                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                        required
                        placeholder="3121234567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contrasena">Nueva Contraseña (Opcional)</Label>
                      <Input
                        id="contrasena"
                        type="password"
                        value={formData.contrasena}
                        onChange={(e) => handleChange('contrasena', e.target.value)}
                        placeholder="Dejar vacío para no cambiar"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Solo completa este campo si deseas cambiar la contraseña
                      </p>
                    </div>

                    {/* Foto del Agente */}
                    <div className="md:col-span-2">
                      <Label>Foto del Agente</Label>
                      <div className="mt-2">
                        {!previewUrl && !currentImageUrl ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative cursor-pointer group"
                          >
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
                              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full shadow-inner mb-3">
                                <Upload className="h-8 w-8 text-blue-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Haz clic para seleccionar una imagen
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, JPEG hasta 5MB</p>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-white shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,1)] p-4">
                            <div className="relative aspect-square max-w-xs mx-auto rounded-xl overflow-hidden shadow-lg ring-2 ring-gray-200">
                              <img
                                src={previewUrl || currentImageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {previewUrl && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemoveNewImage}
                                className="absolute top-6 right-6 rounded-full h-8 w-8 p-0 shadow-lg"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            {!previewUrl && currentImageUrl && (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="absolute top-6 right-6 rounded-xl shadow-lg"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Cambiar
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={handleDeleteCurrentImage}
                                  className="absolute top-6 left-6 rounded-xl shadow-lg"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Eliminar
                                </Button>
                              </>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <div className="mt-4 text-center">
                              {previewUrl && selectedFile ? (
                                <>
                                  <p className="text-sm font-medium text-gray-700 truncate px-4">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {`${(selectedFile.size / 1024).toFixed(2)} KB`}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">Imagen actual</p>
                              )}
                            </div>
                          </div>
                        )}
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
                disabled={isPending || isUploadingImage}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || isUploadingImage}>
                {isPending || isUploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingImage ? 'Subiendo imagen...' : 'Actualizando...'}
                  </>
                ) : (
                  'Actualizar Agente'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
