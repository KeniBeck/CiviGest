import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useUploadImage, 
  useDeleteImage 
} from '@/hooks/queries/useImagenes';
import { Upload, Image as ImageIcon, Trash2, Loader2, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImageType } from '@/types/imagenes.type';

interface ImageFieldProps {
  /**
   * Nombre del campo (usado como ID)
   */
  nombre: string;
  /**
   * Etiqueta del campo
   */
  label: string;
  /**
   * Descripción del campo
   */
  descripcion?: string;
  /**
   * Si el campo es obligatorio
   */
  required?: boolean;
  /**
   * Valor actual (filename de la imagen)
   */
  value?: string;
  /**
   * Callback cuando cambia el valor
   */
  onChange: (filename: string | null) => void;
  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean;
  /**
   * Clase CSS adicional
   */
  className?: string;
  /**
   * Tipo de imagen para el endpoint
   */
  imageType?: ImageType;
  /**
   * ID de la entidad (temporal durante creación)
   */
  entityId?: number;
}

/**
 * Componente para campos de tipo imagen en formularios dinámicos
 * Usado en la integración con TipoPermiso donde camposPersonalizados tiene type="image"
 */
export const ImageField = ({
  nombre,
  label,
  descripcion,
  required = false,
  value,
  onChange,
  disabled = false,
  className,
  imageType = 'permisos',
  entityId = 999999, // ID temporal para subidas durante creación
}: ImageFieldProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync({ 
        file: selectedFile,
        id: entityId,
        type: imageType,
      });
      
      // La respuesta viene en result.data.filename
      onChange(result.data.filename);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    try {
      await deleteMutation.mutateAsync({ 
        type: imageType, 
        filename: value 
      });
      onChange(null);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  };

  const handleRemoveSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImageUrl = (filename: string): string => {
    // URL base para visualizar la imagen
    return `/imagenes/${imageType}/${filename}`;
  };

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const hasValue = !!value;
  const hasSelection = !!selectedFile;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <Label htmlFor={nombre}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Descripción */}
      {descripcion && (
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      )}

      {/* Si NO hay imagen subida */}
      {!hasValue && (
        <div className="space-y-2">
          {/* Input de archivo */}
          <Input
            ref={fileInputRef}
            id={nombre}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />

          {/* Preview y archivo seleccionado */}
          {hasSelection && (
            <div className="space-y-2">
              {/* Preview de la imagen */}
              {previewUrl && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  <span className="text-sm truncate">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveSelection}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error de subida */}
          {uploadMutation.isError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {uploadMutation.error?.message || 'Error al subir la imagen'}
            </div>
          )}
        </div>
      )}

      {/* Si YA hay imagen subida */}
      {hasValue && (
        <div className="p-3 border rounded-lg bg-green-50 border-green-200">
          {/* Preview de la imagen subida */}
          <div className="mb-3 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={getImageUrl(value)} 
              alt={label}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <ImageIcon className="h-5 w-5 text-green-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-green-900">Imagen subida</p>
                <p className="text-xs text-green-700 truncate">{value}</p>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(getImageUrl(value), '_blank')}
                disabled={disabled}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={disabled || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Error de eliminación */}
          {deleteMutation.isError && (
            <div className="mt-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {deleteMutation.error?.message || 'Error al eliminar la imagen'}
            </div>
          )}
        </div>
      )}

      {/* Campo requerido y vacío */}
      {required && !hasValue && !hasSelection && (
        <p className="text-xs text-destructive">Este campo es obligatorio</p>
      )}
    </div>
  );
};
