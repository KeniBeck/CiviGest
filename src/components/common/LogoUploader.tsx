import { useState, useRef, useEffect } from 'react';
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Loader2,
  Image as ImageIcon,
  X,
  Building2,
} from 'lucide-react';
import { useUploadImage, useReplaceImage, useDeleteImage } from '@/hooks/queries/useImagenes';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ENV } from '@/config/env';
import { cn } from '@/lib/utils';

interface LogoUploaderProps {
  value: string; // filename o URL
  sedeId: number;
  subsedeId: number;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  onUploadSuccess?: (filename: string, file?: File) => void;
  onDelete?: () => void; // Callback para cuando se elimina el logo
  hasConfiguration?: boolean; // Indica si ya existe una configuración
}

export const LogoUploader = ({
  value,
  sedeId,
  subsedeId,
  onChange,
  size = 'lg',
  disabled = false,
  onUploadSuccess,
  onDelete,
  hasConfiguration = false,
}: LogoUploaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [pendingFilePreview, setPendingFilePreview] = useState<string>(''); // Preview temporal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutate: replaceImage, isPending: isReplacing } = useReplaceImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteImage();

  // Determinar si el valor actual es un archivo subido (no es URL externa)
  const isUploadedFile = value && !value.startsWith('http');
  const isPending = isUploading || isReplacing || isDeleting;

  // Generar URL completa para el logo
  const logoUrl = pendingFilePreview // Si hay preview temporal, usarlo primero
    ? pendingFilePreview
    : value
    ? value.startsWith('http')
      ? value
      : `${ENV.API_URL}/imagenes/configuraciones/${value}`
    : '';

  // Tamaños de avatar
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  // Limpiar preview cuando se cierra el diálogo
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedFile(null);
      setPreviewUrl('');
      setUrlInput('');
      setUploadMode('file');
      // NO limpiar pendingFilePreview aquí para mantener el preview en el avatar
    }
  }, [isDialogOpen]);

  // Limpiar URL temporal cuando el valor cambia a un archivo subido real
  useEffect(() => {
    if (hasConfiguration && value && !value.startsWith('http') && value.includes('-')) {
      // Si el valor parece un filename subido real (contiene timestamp), limpiar preview temporal
      if (pendingFilePreview) {
        URL.revokeObjectURL(pendingFilePreview);
        setPendingFilePreview('');
      }
    }
  }, [value, hasConfiguration, pendingFilePreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Usa: JPG, PNG o WEBP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 10MB');
      return;
    }

    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (uploadMode === 'file' && selectedFile) {
      // Si NO hay configuración existente, solo guardar el archivo para subirlo después
      if (!hasConfiguration) {
        // 📁 Crear preview temporal con createObjectURL
        const objectUrl = URL.createObjectURL(selectedFile);
        setPendingFilePreview(objectUrl);
        
        // Guardar referencia temporal (se subirá al crear configuración)
        const tempFilename = selectedFile.name;
        onChange(tempFilename);
        setIsDialogOpen(false);
        onUploadSuccess?.(tempFilename, selectedFile); // Pasar el archivo
        return;
      }

      // Si YA hay configuración
      // Determinar si usar replace o upload
      if (isUploadedFile) {
        // ⚠️ REEMPLAZAR imagen existente - Solicitar confirmación
        setShowReplaceConfirm(true);
      } else {
        // ✅ SUBIR nueva imagen
        performUpload();
      }
    } else if (uploadMode === 'url' && urlInput.trim()) {
      // Usar URL
      onChange(urlInput.trim());
      setIsDialogOpen(false);
      onUploadSuccess?.(urlInput.trim());
    }
  };

  // Ejecutar el reemplazo después de confirmación
  const performReplace = () => {
    if (!selectedFile) return;

    replaceImage(
      {
        file: selectedFile,
        id: sedeId,
        type: 'configuraciones',
        filename: value, // El filename actual que se va a reemplazar
        subId: subsedeId,
      },
      {
        onSuccess: (response) => {
          const filename = response.data.filename;
          onChange(filename);
          setIsDialogOpen(false);
          setShowReplaceConfirm(false);
          onUploadSuccess?.(filename);
        },
        onError: (error) => {
          console.error('Error al reemplazar imagen:', error);
          alert('Error al reemplazar la imagen. Intenta de nuevo.');
          setShowReplaceConfirm(false);
        },
      }
    );
  };

  // Ejecutar upload de imagen nueva
  const performUpload = () => {
    if (!selectedFile) return;

    uploadImage(
      {
        file: selectedFile,
        id: sedeId,
        type: 'configuraciones',
        subId: subsedeId,
      },
      {
        onSuccess: (response) => {
          const filename = response.data.filename;
          onChange(filename);
          setIsDialogOpen(false);
          onUploadSuccess?.(filename);
        },
        onError: (error) => {
          console.error('Error al subir imagen:', error);
          alert('Error al subir la imagen. Intenta de nuevo.');
        },
      }
    );
  };

  const handleRemove = () => {
    // Si hay configuración existente y es un archivo subido, solicitar confirmación
    if (hasConfiguration && isUploadedFile) {
      setShowDeleteConfirm(true);
    } else {
      // Si no hay configuración, solo limpiar el estado local
      onChange('');
      setPendingFilePreview(''); // Limpiar preview temporal
      setIsDialogOpen(false);
    }
  };

  // Ejecutar eliminación después de confirmación
  const performDelete = () => {
    deleteImage(
      {
        type: 'configuraciones',
        filename: value,
      },
      {
        onSuccess: () => {
          onChange('');
          setPendingFilePreview('');
          setIsDialogOpen(false);
          setShowDeleteConfirm(false);
          onDelete?.(); // Notificar al padre
        },
        onError: (error) => {
          console.error('Error al eliminar imagen:', error);
          alert('Error al eliminar la imagen. Intenta de nuevo.');
          setShowDeleteConfirm(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar con botón de cámara */}
      <div className="relative group">
        <Avatar className={cn(sizeClasses[size], 'cursor-pointer transition-all hover:opacity-80')}>
          <AvatarImage src={logoUrl} alt="Logo" />
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
            <Building2 className={iconSizes[size]} />
          </AvatarFallback>
        </Avatar>

        {/* Botón de cámara superpuesto */}
        <button
          type="button"
          onClick={() => !disabled && setIsDialogOpen(true)}
          disabled={disabled}
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/60 text-white rounded-full',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'disabled:cursor-not-allowed disabled:bg-black/30',
            disabled ? 'hidden' : ''
          )}
        >
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {/* Texto indicador */}
      <p className="text-sm text-gray-600 text-center">
        {value ? 'Click en el logo para cambiar' : 'Click para agregar logo'}
      </p>

      {/* Dialog para subir imagen */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Cambiar Logo</DialogTitle>
            <DialogDescription>
              Sube una imagen desde tu dispositivo o ingresa una URL
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="space-y-4">{/* Tabs para seleccionar modo */}
            {/* Tabs para seleccionar modo */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                  'flex items-center justify-center gap-2',
                  uploadMode === 'file'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Upload className="h-4 w-4" />
                Subir Archivo
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                  'flex items-center justify-center gap-2',
                  uploadMode === 'url'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <LinkIcon className="h-4 w-4" />
                URL Externa
              </button>
            </div>

            {/* Modo: Subir archivo */}
            {uploadMode === 'file' && (
              <div className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <ImageIcon className="h-12 w-12" />
                      <p className="text-sm font-medium">
                        {selectedFile ? selectedFile.name : 'Seleccionar imagen'}
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG o WEBP (máx. 10MB)
                      </p>
                    </div>
                  </button>
                </div>

                {/* Preview de la imagen seleccionada */}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Modo: URL */}
            {uploadMode === 'url' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">URL de la imagen</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa la URL completa de la imagen
                  </p>
                </div>

                {/* Preview de URL */}
                {urlInput && (
                  <div className="relative">
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Preview del logo actual o pendiente */}
            {value && !selectedFile && !urlInput && (
              <div>
                <Label className="text-xs text-gray-500">
                  {!hasConfiguration && pendingFilePreview 
                    ? 'Logo seleccionado (pendiente de guardar)' 
                    : 'Logo actual'}
                </Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={pendingFilePreview || logoUrl}
                    alt="Logo actual"
                    className="w-full h-32 object-contain"
                  />
                </div>
                {!hasConfiguration && pendingFilePreview && (
                  <p className="text-xs text-amber-600 mt-2 text-center">
                    ⚠️ Esta imagen se subirá al guardar la configuración
                  </p>
                )}
              </div>
            )}
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 border-t flex-col sm:flex-row gap-2">
            {value && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Quitar Logo
              </Button>
            )}
            <div className="flex gap-2 flex-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={
                  isPending ||
                  (uploadMode === 'file' && !selectedFile) ||
                  (uploadMode === 'url' && !urlInput.trim())
                }
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadMode === 'file' && (isUploadedFile || pendingFilePreview) 
                      ? 'Reemplazando...' 
                      : 'Subiendo...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadMode === 'file' 
                      ? ((isUploadedFile || (!hasConfiguration && pendingFilePreview)) 
                          ? 'Reemplazar' 
                          : 'Seleccionar')
                      : 'Usar URL'
                    }
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación para eliminar logo */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="¿Eliminar Logo?"
        description="Esta acción eliminará permanentemente el logo actual. ¿Deseas continuar?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={performDelete}
        isLoading={isDeleting}
      />

      {/* Confirmación para reemplazar logo */}
      <ConfirmDialog
        open={showReplaceConfirm}
        onOpenChange={setShowReplaceConfirm}
        title="¿Reemplazar Logo?"
        description="Se reemplazará el logo actual por la nueva imagen seleccionada. ¿Deseas continuar?"
        confirmText="Reemplazar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={performReplace}
        isLoading={isReplacing}
      />
    </div>
  );
};
