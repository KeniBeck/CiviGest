import { useState, useRef } from 'react';
import { useCreateAgente } from '@/hooks/queries/useAgentes';
import { useNotification } from '@/hooks/useNotification';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { tipoAgenteService } from '@/services/tipo-agente.service';
import { departamentoService } from '@/services/departamento.service';
import { patrullaService } from '@/services/patrulla.service';
import { imagenesService } from '@/services/imagenes.service';
import { CreateTipoAgenteModal } from '../tipo-agentes/CreateTipoAgenteModal';
import { CreateDepartamentoModal } from '../departamentos/CreateDepartamentoModal';
import { CreatePatrullaModal } from '../patrullas/CreatePatrullaModal';
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
import { Loader2, Eye, EyeOff, Plus, Upload, X } from 'lucide-react';
import type { CreateAgente } from '@/types/agente.type';
import type { TipoAgente } from '@/types/tipo-agente.type';
import type { Departamento } from '@/types/departamento.type';
import type { Patrulla } from '@/types/patrulla.type';

interface CreateAgenteModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateAgenteModal = ({ open, onClose }: CreateAgenteModalProps) => {
  const notify = useNotification();
  const { mutate: createAgente, isPending } = useCreateAgente();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para modales de creación rápida
  const [showCreateTipoAgente, setShowCreateTipoAgente] = useState(false);
  const [showCreateDepartamento, setShowCreateDepartamento] = useState(false);
  const [showCreatePatrulla, setShowCreatePatrulla] = useState(false);

  const [formData, setFormData] = useState<CreateAgente>({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoId: 0,
    cargo: '',
    numPlantilla: '',
    numEmpleadoBiometrico: '',
    foto: '',
    whatsapp: '',
    correo: '',
    contrasena: '',
    departamentoId: 0,
    patrullaId: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUploadingImage(true);
    let uploadedFilename: string | null = null;

    try {
      // 1. Subir imagen primero si hay archivo seleccionado
      if (selectedFile) {
        const uploadResponse = await imagenesService.uploadImage({
          file: selectedFile,
          type: 'agentes',
          id: 1, // ID temporal, puede ser cualquier valor
        });

        // Acceder correctamente a la estructura de respuesta
        uploadedFilename = uploadResponse.data.data.filename;
        
        // Actualizar formData con el filename
        if (uploadedFilename) {
          formData.foto = uploadedFilename;
        }
      }

      // 2. Crear el agente
      createAgente(formData, {
        onSuccess: () => {
          notify.success('Agente Creado', 'El agente se ha creado correctamente');
          
          // Reset form
          setFormData({
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            tipoId: 0,
            cargo: '',
            numPlantilla: '',
            numEmpleadoBiometrico: '',
            foto: '',
            whatsapp: '',
            correo: '',
            contrasena: '',
            departamentoId: 0,
            patrullaId: 0,
          });
          setSelectedFile(null);
          setPreviewUrl('');
          setIsUploadingImage(false);
          onClose();
        },
        onError: async (error) => {
          // Si falla la creación del agente, eliminar la imagen subida
          if (uploadedFilename) {
            try {
              await imagenesService.deleteImage({
                type: 'agentes',
                filename: uploadedFilename,
              });
            } catch (deleteError) {
              console.error('Error al eliminar imagen:', deleteError);
            }
          }
          
          setIsUploadingImage(false);
          notify.apiError(error);
        },
      });
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

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                    <Label htmlFor="numPlantilla">Número de Placa *</Label>
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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="tipoId">Tipo de Agente *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateTipoAgente(true)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Crear Tipo
                      </Button>
                    </div>
                    <SearchableSelect
                      placeholder="Seleccionar tipo de agente"
                      value={formData.tipoId || 0}
                      onChange={(value) => handleChange('tipoId', Number(value))}
                      queryKey={['tipos-agente-select']}
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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="departamentoId">Departamento *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateDepartamento(true)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Crear Depto.
                      </Button>
                    </div>
                    <SearchableSelect
                      placeholder="Seleccionar departamento"
                      value={formData.departamentoId || 0}
                      onChange={(value) => handleChange('departamentoId', Number(value))}
                      queryKey={['departamentos-select']}
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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="patrullaId">Patrulla (Opcional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreatePatrulla(true)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Crear Patrulla
                      </Button>
                    </div>
                    <SearchableSelect
                      placeholder="Seleccionar patrulla"
                      value={formData.patrullaId || 0}
                      onChange={(value) => handleChange('patrullaId', Number(value))}
                      queryKey={['patrullas-select']}
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
                      value={formData.whatsapp || ''}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      required
                      placeholder="3121234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contrasena">Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="contrasena"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.contrasena}
                        onChange={(e) => handleChange('contrasena', e.target.value)}
                        required
                        placeholder="Contraseña segura"
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Foto del Agente */}
                  <div className="md:col-span-2">
                    <Label>Foto del Agente (Opcional)</Label>
                    <div className="mt-2">
                      {!previewUrl ? (
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
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveImage}
                            className="absolute top-6 right-6 rounded-full h-8 w-8 p-0 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="mt-4 text-center">
                            <p className="text-sm font-medium text-gray-700 truncate px-4">
                              {selectedFile?.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedFile && `${(selectedFile.size / 1024).toFixed(2)} KB`}
                            </p>
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
                  {isUploadingImage ? 'Subiendo imagen...' : 'Creando...'}
                </>
              ) : (
                'Crear Agente'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Modales de creación rápida */}
      <CreateTipoAgenteModal
        open={showCreateTipoAgente}
        onClose={() => setShowCreateTipoAgente(false)}
      />
      <CreateDepartamentoModal
        open={showCreateDepartamento}
        onClose={() => setShowCreateDepartamento(false)}
      />
      <CreatePatrullaModal
        open={showCreatePatrulla}
        onClose={() => setShowCreatePatrulla(false)}
      />
    </Dialog>
  );
};
