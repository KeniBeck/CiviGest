import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import {
  useConfiguracionBySubsede,
  useCreateConfiguracion,
  useUpdateConfiguracion,
} from '@/hooks/queries/useConfiguracion';
import { useTheme } from '@/hooks/queries/useTheme';
import { useUploadImage, useDeleteImage } from '@/hooks/queries/useImagenes';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { LogoUploader } from '@/components/common/LogoUploader';
import { themeService } from '@/services/theme.service';
import { imagenesService } from '@/services/imagenes.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Save, Settings, Palette, CheckCircle } from 'lucide-react';
import type { CreateConfiguracionDto, UpdateConfiguracionDto } from '@/types/configuracion.types';
import type { Theme } from '@/types/theme.types';

export const ConfiguracionPage = () => {
  const { user } = useAuthStore();
  const subsedeId = user?.subsedeId || 0;
  const sedeId = user?.sedeId || 0;
  const { setTheme, updateConfiguracion: updateConfiguracionStore } = useThemeStore();

  // ✅ Obtener configuración existente
  const { data: configuracion, isLoading, error } = useConfiguracionBySubsede(subsedeId);
  
  // ✅ Mutations
  const { mutate: createConfiguracion, isPending: isCreating } = useCreateConfiguracion();
  const { mutate: updateConfiguracion, isPending: isUpdating } = useUpdateConfiguracion();
  const { mutateAsync: uploadImage } = useUploadImage();
  const { mutate: deleteImage } = useDeleteImage();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CreateConfiguracionDto>({
    nombreCliente: '',
    pais: '',
    ciudad: '',
    logo: '',
    slogan: '',
    titular: '',
    themeId: 0,
    salarioMinimo: 0,
    uma: 0,
    correoContacto: '',
    whatsappContacto: '',
    telContacto: '',
    correoAtencion: '',
    whatsappAtencion: '',
    telAtencion: '',
    tasaRecargo: 0,
  });

  const [hasConfiguration, setHasConfiguration] = useState(false);

  // ✅ Hook para cargar tema seleccionado
  const { data: selectedTheme } = useTheme(formData.themeId);

  // ✅ Aplicar tema seleccionado en tiempo real
  useEffect(() => {
    if (selectedTheme) {
      console.log('🎨 Aplicando tema seleccionado:', selectedTheme.name);
      setTheme(selectedTheme);
    }
  }, [selectedTheme, setTheme]);

  // ✅ Cargar datos existentes si hay configuración
  useEffect(() => {
    if (configuracion) {
      setHasConfiguration(true);
      setFormData({
        nombreCliente: configuracion.nombreCliente,
        pais: configuracion.pais,
        ciudad: configuracion.ciudad,
        logo: configuracion.logo,
        slogan: configuracion.slogan,
        titular: configuracion.titular,
        themeId: configuracion.themeId,
        salarioMinimo: parseFloat(configuracion.salarioMinimo),
        uma: parseFloat(configuracion.uma),
        correoContacto: configuracion.correoContacto,
        whatsappContacto: configuracion.whatsappContacto,
        telContacto: configuracion.telContacto,
        correoAtencion: configuracion.correoAtencion,
        whatsappAtencion: configuracion.whatsappAtencion,
        telAtencion: configuracion.telAtencion,
        tasaRecargo: parseFloat(configuracion.tasaRecargo),
      });
    } else if (error) {
      // Si hay error 404, significa que no existe configuración
      setHasConfiguration(false);
    }
  }, [configuracion, error]);

  const handleChange = (field: keyof CreateConfiguracionDto, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Manejador para logo (actualización automática o archivo pendiente)
  const handleLogoUpload = (filename: string, file?: File) => {
    // Actualizar el formData con el nuevo filename
    handleChange('logo', filename);
    
    // Si ya existe configuración, actualizar automáticamente
    if (hasConfiguration && configuracion) {
      const updateData: UpdateConfiguracionDto = {
        ...formData,
        logo: filename,
      };
      
      updateConfiguracion(
        { id: configuracion.id, data: updateData },
        {
          onSuccess: () => {
            console.log('✅ Logo actualizado automáticamente');
            // Actualizar el logo en el themeStore para que se refleje en el Header
            const logoUrl = filename && !filename.startsWith('http')
              ? imagenesService.getImageUrl({ type: 'configuraciones', filename })
              : filename;
            
            updateConfiguracionStore({
              nombreCliente: formData.nombreCliente,
              slogan: formData.slogan,
              logo: logoUrl,
            });
            
            // Mostrar mensaje de éxito
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          },
        }
      );
    } else if (file) {
      // Si es nueva configuración, guardar archivo para subirlo al hacer submit
      console.log('📁 Archivo pendiente de subida al crear configuración');
      setPendingImageFile(file);
    }
  };

  // ✅ Manejador para cuando se elimina el logo
  const handleLogoDelete = () => {
    if (hasConfiguration && configuracion) {
      // Actualizar configuración para remover logo
      const updateData: UpdateConfiguracionDto = {
        ...formData,
        logo: '',
      };
      
      updateConfiguracion(
        { id: configuracion.id, data: updateData },
        {
          onSuccess: () => {
            console.log('✅ Logo eliminado de la configuración');
            // Actualizar el themeStore para remover el logo del Header
            updateConfiguracionStore({
              nombreCliente: formData.nombreCliente,
              slogan: formData.slogan,
              logo: '',
            });
            
            // Mostrar mensaje de éxito
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          },
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasConfiguration && configuracion) {
      // ✅ ACTUALIZAR configuración existente
      const updateData: UpdateConfiguracionDto = formData;
      updateConfiguracion(
        { id: configuracion.id, data: updateData },
        {
          onSuccess: () => {
            // ✅ El tema ya está aplicado en el store gracias al useEffect
            console.log('✅ Configuración actualizada y tema aplicado');
            
            // ✅ Actualizar nombre, slogan e imagen en themeStore para reflejar en Header
            const logoUrl = formData.logo && !formData.logo.startsWith('http')
              ? imagenesService.getImageUrl({ type: 'configuraciones', filename: formData.logo })
              : formData.logo;
            
            updateConfiguracionStore({
              nombreCliente: formData.nombreCliente,
              slogan: formData.slogan,
              logo: logoUrl,
            });

            // ✅ Mostrar mensaje de éxito y recargar página
            setShowSuccessMessage(true);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          },
        }
      );
    } else {
      // ✅ CREAR nueva configuración
      let uploadedFilename: string | null = null;

      try {
        // 1️⃣ Si hay archivo pendiente, subirlo primero
        if (pendingImageFile) {
          console.log('📤 Subiendo imagen antes de crear configuración...');
          const uploadResult = await uploadImage({
            file: pendingImageFile,
            id: sedeId,
            type: 'configuraciones',
            subId: subsedeId,
          });
          uploadedFilename = uploadResult.data.filename;
          console.log('✅ Imagen subida:', uploadedFilename);
          
          // Actualizar formData con el filename de la imagen subida
          formData.logo = uploadedFilename;
        }

        // 2️⃣ Crear configuración con el filename de la imagen (si existe)
        createConfiguracion(formData, {
          onSuccess: () => {
            // ✅ El tema ya está aplicado en el store gracias al useEffect
            console.log('✅ Configuración creada y tema aplicado');
            setHasConfiguration(true);
            setPendingImageFile(null); // Limpiar archivo pendiente
            
            // ✅ Actualizar nombre, slogan e imagen en themeStore para reflejar en Header
            const logoUrl = formData.logo && !formData.logo.startsWith('http')
              ? imagenesService.getImageUrl({ type: 'configuraciones', filename: formData.logo })
              : formData.logo;
            
            updateConfiguracionStore({
              nombreCliente: formData.nombreCliente,
              slogan: formData.slogan,
              logo: logoUrl,
            });

            // ✅ Mostrar mensaje de éxito y recargar página
            setShowSuccessMessage(true);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          },
          onError: (error) => {
            console.error('❌ Error al crear configuración:', error);
            
            // 3️⃣ Si falla la creación, eliminar la imagen subida
            if (uploadedFilename) {
              console.log('🗑️ Eliminando imagen subida debido a error en configuración...');
              deleteImage({
                type: 'configuraciones',
                filename: uploadedFilename,
              });
            }
          },
        });
      } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        // Si falla la subida de imagen, no continuar
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isPending = isCreating || isUpdating;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuración Municipal
          </h1>
          <p className="text-gray-600 mt-1">
            {hasConfiguration
              ? 'Actualiza la configuración de tu municipio'
              : 'Crea la configuración inicial de tu municipio'}
          </p>
        </div>
      </div>

      {/* ✅ Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-800">¡Configuración guardada exitosamente!</p>
            <p className="text-sm text-green-700 mt-1">
              Los cambios se han reflejado automáticamente en el sistema (nombre, slogan, logo y tema).
            </p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card: Información General */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombreCliente">Nombre del Cliente *</Label>
              <Input
                id="nombreCliente"
                value={formData.nombreCliente}
                onChange={(e) => handleChange('nombreCliente', e.target.value)}
                required
                placeholder="Ej: Municipio de Guadalajara"
              />
            </div>

            <div>
              <Label htmlFor="titular">Titular *</Label>
              <Input
                id="titular"
                value={formData.titular}
                onChange={(e) => handleChange('titular', e.target.value)}
                required
                placeholder="Ej: Presidente Municipal"
              />
            </div>

            <div>
              <Label htmlFor="pais">País *</Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => handleChange('pais', e.target.value)}
                required
                placeholder="Ej: México"
              />
            </div>

            <div>
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                required
                placeholder="Ej: Guadalajara"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slogan">Slogan</Label>
              <Input
                id="slogan"
                value={formData.slogan}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="Ej: Comprometidos con el progreso"
              />
            </div>
          </div>
        </Card>

        {/* Card: Logo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Logo Municipal</h2>
          <div className="flex flex-col items-center">
            <LogoUploader
              value={formData.logo}
              sedeId={sedeId}
              subsedeId={subsedeId}
              onChange={(value) => handleChange('logo', value)}
              onUploadSuccess={handleLogoUpload}
              onDelete={handleLogoDelete}
              hasConfiguration={hasConfiguration}
              size="xl"
              disabled={isPending}
            />
            <p className="text-sm text-gray-500 mt-4 text-center max-w-md">
              Puedes subir una imagen desde tu dispositivo o usar una URL externa.
              {!hasConfiguration && ' ⚠️ Completa los campos obligatorios antes de guardar.'}
            </p>
          </div>
        </Card>

        {/* Card: Tema */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Apariencia del Sistema</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="themeId">Tema *</Label>
              <SearchableSelect
                placeholder="Seleccionar tema"
                value={formData.themeId || 0}
                onChange={(value) => handleChange('themeId', Number(value))}
                queryKey={['themes-select']}
                queryFn={async ({ page, search, limit }) => {
                  const response = await themeService.getAll({
                    page,
                    search,
                    limit,
                  });
                  return response.data;
                }}
                getOptionLabel={(item: Theme) => item.name}
                getOptionValue={(item: Theme) => item.id}
              />
              {selectedTheme && (
                <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-800">
                      Vista previa: {selectedTheme.name}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div 
                      className="h-8 w-12 rounded border border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedTheme.primaryColor }}
                      title="Color Primario"
                    />
                    <div 
                      className="h-8 w-12 rounded border border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedTheme.secondaryColor }}
                      title="Color Secundario"
                    />
                    <div 
                      className="h-8 w-12 rounded border border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedTheme.accentColor }}
                      title="Color de Acento"
                    />
                    <div 
                      className="h-8 w-12 rounded border border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedTheme.backgroundColor }}
                      title="Color de Fondo"
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    ✨ Los cambios se están aplicando en tiempo real
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Card: Valores Económicos */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Valores Económicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salarioMinimo">Salario Mínimo (MXN) *</Label>
              <Input
                id="salarioMinimo"
                type="number"
                step="0.01"
                min="0"
                value={formData.salarioMinimo === 0 ? '' : formData.salarioMinimo}
                onChange={(e) => handleChange('salarioMinimo', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="uma">UMA (Unidad de Medida) *</Label>
              <Input
                id="uma"
                type="number"
                step="0.01"
                min="0"
                value={formData.uma === 0 ? '' : formData.uma}
                onChange={(e) => handleChange('uma', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="tasaRecargo">Tasa de Recargo (%) *</Label>
              <Input
                id="tasaRecargo"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tasaRecargo === 0 ? '' : formData.tasaRecargo}
                onChange={(e) => handleChange('tasaRecargo', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                required
                placeholder="0.00"
              />
            </div>
          </div>
        </Card>

        {/* Card: Contacto General */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Información de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="correoContacto">Correo de Contacto *</Label>
              <Input
                id="correoContacto"
                type="email"
                value={formData.correoContacto}
                onChange={(e) => handleChange('correoContacto', e.target.value)}
                required
                placeholder="contacto@municipio.gob.mx"
              />
            </div>

            <div>
              <Label htmlFor="whatsappContacto">WhatsApp de Contacto *</Label>
              <Input
                id="whatsappContacto"
                value={formData.whatsappContacto}
                onChange={(e) => handleChange('whatsappContacto', e.target.value)}
                required
                placeholder="3121234567"
              />
            </div>

            <div>
              <Label htmlFor="telContacto">Teléfono de Contacto *</Label>
              <Input
                id="telContacto"
                value={formData.telContacto}
                onChange={(e) => handleChange('telContacto', e.target.value)}
                required
                placeholder="33 1234 5678"
              />
            </div>
          </div>
        </Card>

        {/* Card: Atención Ciudadana */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Atención Ciudadana</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="correoAtencion">Correo de Atención *</Label>
              <Input
                id="correoAtencion"
                type="email"
                value={formData.correoAtencion}
                onChange={(e) => handleChange('correoAtencion', e.target.value)}
                required
                placeholder="atencion@municipio.gob.mx"
              />
            </div>

            <div>
              <Label htmlFor="whatsappAtencion">WhatsApp de Atención *</Label>
              <Input
                id="whatsappAtencion"
                value={formData.whatsappAtencion}
                onChange={(e) => handleChange('whatsappAtencion', e.target.value)}
                required
                placeholder="3129876543"
              />
            </div>

            <div>
              <Label htmlFor="telAtencion">Teléfono de Atención *</Label>
              <Input
                id="telAtencion"
                value={formData.telAtencion}
                onChange={(e) => handleChange('telAtencion', e.target.value)}
                required
                placeholder="33 9876 5432"
              />
            </div>
          </div>
        </Card>

        {/* Botón de Envío */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {hasConfiguration ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {hasConfiguration ? 'Actualizar Configuración' : 'Crear Configuración'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
