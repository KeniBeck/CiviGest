import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useUploadDocumento, 
  useDeleteDocumento,
  useViewDocumento,
  useDownloadDocumento 
} from '@/hooks/queries/useDocumentos';
import { Upload, FileText, Trash2, Eye, Download, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfFieldProps {
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
   * Valor actual (ruta del archivo)
   */
  value?: string;
  /**
   * Callback cuando cambia el valor
   */
  onChange: (rutaArchivo: string | null) => void;
  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean;
  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Componente para campos de tipo PDF en formularios dinámicos
 * Usado en la integración con TipoPermiso donde camposPersonalizados tiene type="pdf"
 */
export const PdfField = ({
  nombre,
  label,
  descripcion,
  required = false,
  value,
  onChange,
  disabled = false,
  className,
}: PdfFieldProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocumento();
  const deleteMutation = useDeleteDocumento();
  const { view } = useViewDocumento();
  const { download } = useDownloadDocumento();

  const extractFilename = (rutaArchivo: string): string => {
    return rutaArchivo.split('/').pop() || rutaArchivo;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync({ file: selectedFile });
      onChange(result.rutaArchivo);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    try {
      const filename = extractFilename(value);
      await deleteMutation.mutateAsync({ filename });
      onChange(null);
    } catch (error) {
      console.error('Error al eliminar documento:', error);
    }
  };

  const handleView = () => {
    if (!value) return;
    const filename = extractFilename(value);
    view(filename);
  };

  const handleDownload = () => {
    if (!value) return;
    const filename = extractFilename(value);
    download(filename);
  };

  const handleRemoveSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      {/* Si NO hay archivo subido */}
      {!hasValue && (
        <div className="space-y-2">
          {/* Input de archivo */}
          <Input
            ref={fileInputRef}
            id={nombre}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />

          {/* Archivo seleccionado */}
          {hasSelection && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="h-4 w-4 shrink-0" />
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
          )}

          {/* Error de subida */}
          {uploadMutation.isError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {uploadMutation.error?.message || 'Error al subir el documento'}
            </div>
          )}
        </div>
      )}

      {/* Si YA hay archivo subido */}
      {hasValue && (
        <div className="p-3 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-green-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-green-900">Documento subido</p>
                <p className="text-xs text-green-700 truncate">{extractFilename(value)}</p>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleView}
                disabled={disabled}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={disabled}
              >
                <Download className="h-4 w-4" />
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
              {deleteMutation.error?.message || 'Error al eliminar el documento'}
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
