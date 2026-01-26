import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useUploadDocumento, 
  useUploadMultipleDocumentos,
  useDeleteDocumento,
  useViewDocumento,
  useDownloadDocumento 
} from '@/hooks/queries/useDocumentos';
import { Upload, FileText, Trash2, Eye, Download, Loader2 } from 'lucide-react';

/**
 * Componente ejemplo para subir un documento PDF individual
 */
export const DocumentoUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocumento, setUploadedDocumento] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocumento();
  const deleteMutation = useDeleteDocumento();
  const { view } = useViewDocumento();
  const { download } = useDownloadDocumento();

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
      setUploadedDocumento(result.rutaArchivo);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
    }
  };

  const handleDelete = async () => {
    if (!uploadedDocumento) return;

    try {
      // Extraer el nombre del archivo de la ruta
      const filename = uploadedDocumento.split('/').pop() || '';
      await deleteMutation.mutateAsync({ filename });
      setUploadedDocumento(null);
    } catch (error) {
      console.error('Error al eliminar documento:', error);
    }
  };

  const handleView = () => {
    if (!uploadedDocumento) return;
    const filename = uploadedDocumento.split('/').pop() || '';
    view(filename);
  };

  const handleDownload = () => {
    if (!uploadedDocumento) return;
    const filename = uploadedDocumento.split('/').pop() || '';
    download(filename);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Documento PDF</CardTitle>
        <CardDescription>
          Seleccione un archivo PDF (máximo 10 MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de archivo */}
        <div className="space-y-2">
          <Label htmlFor="pdf-file">Archivo PDF</Label>
          <Input
            ref={fileInputRef}
            id="pdf-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            disabled={uploadMutation.isPending}
          />
        </div>

        {/* Botón de subir */}
        {selectedFile && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{selectedFile.name}</span>
            <Button 
              onClick={handleUpload} 
              disabled={uploadMutation.isPending}
              size="sm"
            >
              {uploadMutation.isPending ? (
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
        )}

        {/* Mensajes de error */}
        {uploadMutation.isError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {uploadMutation.error?.message || 'Error al subir el documento'}
          </div>
        )}

        {/* Documento subido */}
        {uploadedDocumento && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Documento subido exitosamente</p>
                    <p className="text-xs text-muted-foreground">{uploadedDocumento}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleView}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Componente ejemplo para subir múltiples documentos PDF
 */
export const MultipleDocumentosUploader = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocumentos, setUploadedDocumentos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMultipleDocumentos();
  const { view } = useViewDocumento();
  const { download } = useDownloadDocumento();

  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const result = await uploadMutation.mutateAsync({ files: selectedFiles });
      setUploadedDocumentos(result.map(doc => doc.rutaArchivo));
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir documentos:', error);
    }
  };

  const extractFilename = (rutaArchivo: string): string => {
    return rutaArchivo.split('/').pop() || rutaArchivo;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Múltiples Documentos PDF</CardTitle>
        <CardDescription>
          Seleccione hasta 10 archivos PDF (máximo 10 MB cada uno)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de archivos múltiples */}
        <div className="space-y-2">
          <Label htmlFor="pdf-files">Archivos PDF</Label>
          <Input
            ref={fileInputRef}
            id="pdf-files"
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFilesSelect}
            disabled={uploadMutation.isPending}
          />
        </div>

        {/* Lista de archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {selectedFiles.length} archivo(s) seleccionado(s)
            </p>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span className="text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Todos
                </>
              )}
            </Button>
          </div>
        )}

        {/* Mensajes de error */}
        {uploadMutation.isError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {uploadMutation.error?.message || 'Error al subir los documentos'}
          </div>
        )}

        {/* Documentos subidos */}
        {uploadedDocumentos.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-2">
                {uploadedDocumentos.length} documento(s) subido(s) exitosamente
              </p>
              <div className="space-y-2">
                {uploadedDocumentos.map((rutaArchivo, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{extractFilename(rutaArchivo)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => view(extractFilename(rutaArchivo))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => download(extractFilename(rutaArchivo))}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
