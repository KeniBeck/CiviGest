import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  Download,
} from 'lucide-react';
import { imagenesService } from '@/services/imagenes.service';
import { documentosService } from '@/services/documento.service';
import type { Permiso } from '@/types/permiso.type';
import { useTipoPermisos } from '@/hooks/queries/useTipoPermiso';

interface DetallePermisoModalProps {
  open: boolean;
  onClose: () => void;
  permiso: Permiso | null;
}

export const DetallePermisoModal = ({ open, onClose, permiso }: DetallePermisoModalProps) => {
  // Cargar tipo de permiso para obtener campos personalizados
  const { data: tiposPermisoData } = useTipoPermisos({ page: 1, limit: 100, isActive: true });
  
  if (!permiso) return null;
  
  const tipoPermiso = tiposPermisoData?.items.find((tp) => tp.id === permiso.tipoPermisoId);

  const getEstatusConfig = (estatus: string) => {
    const configs = {
      PENDIENTE: {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        variant: 'secondary' as const,
      },
      APROBADO: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        variant: 'default' as const,
      },
      RECHAZADO: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        variant: 'destructive' as const,
      },
      VENCIDO: {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        variant: 'outline' as const,
      },
    };
    return configs[estatus as keyof typeof configs] || configs.PENDIENTE;
  };

  const estatusConfig = getEstatusConfig(permiso.estatus);
  const EstatusIcon = estatusConfig.icon;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalle del Permiso
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={estatusConfig.variant} className="text-sm">
                <EstatusIcon className="h-3 w-3 mr-1" />
                {permiso.estatus}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Información General */}
            <div className={`p-4 rounded-lg ${estatusConfig.bgColor}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Folio</p>
                  <p className="text-lg font-bold text-gray-900">{permiso.folio}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Permiso</p>
                  <p className="text-lg font-semibold text-gray-900">{permiso.tipoPermiso.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Costo</p>
                  <p className="text-lg font-semibold text-gray-900">${permiso.costo}</p>
                </div>
              </div>
            </div>

            {/* Información del Ciudadano */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-700">Información del Ciudadano</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nombre Completo</p>
                  <p className="text-base text-gray-900">{permiso.nombreCiudadano}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Documento</p>
                  <p className="text-base text-gray-900">{permiso.documentoCiudadano}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Domicilio
                  </p>
                  <p className="text-base text-gray-900">{permiso.domicilioCiudadano}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </p>
                  <p className="text-base text-gray-900">{permiso.telefonoCiudadano}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="text-base text-gray-900">{permiso.emailCiudadano}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vigencia y Fechas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-700">Vigencia</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha de Emisión</p>
                  <p className="text-base text-gray-900">{formatDate(permiso.fechaEmision)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha de Vencimiento</p>
                  <p className="text-base text-gray-900">{formatDate(permiso.fechaVencimiento)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Vigencia</p>
                  <p className="text-base text-gray-900">{permiso.vigenciaDias} días</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información del Tipo de Permiso */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-700">Detalles del Tipo de Permiso</h3>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descripción del Tipo</p>
                  <p className="text-base text-gray-900">{permiso.tipoPermiso.descripcion}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Costo Base</p>
                    <p className="text-base text-gray-900">${permiso.tipoPermiso.costoBase}</p>
                  </div>
                  {permiso.numUMAs && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">UMAs</p>
                      <p className="text-base text-gray-900">{permiso.numUMAs}</p>
                    </div>
                  )}
                  {permiso.numSalarios && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Salarios</p>
                      <p className="text-base text-gray-900">{permiso.numSalarios}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Descripción del Permiso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Descripción del Permiso</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-base text-gray-900">{permiso.descripcion}</p>
              </div>
            </div>

            {/* Campos Adicionales */}
            {permiso.camposAdicionales && Object.keys(permiso.camposAdicionales).length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Campos Adicionales</h3>
                  <div className="space-y-4">
                    {tipoPermiso?.camposPersonalizados?.fields ? (
                      // Mostrar según definición de campos personalizados
                      tipoPermiso.camposPersonalizados.fields.map((field) => {
                        const valor = permiso.camposAdicionales[field.name];
                        if (!valor) return null;

                        // Campo tipo imagen
                        if (field.type === 'image') {
                          const imageUrl = imagenesService.getImageUrl({ 
                            type: 'permisos', 
                            filename: valor 
                          });
                          return (
                            <div key={field.name} className="space-y-2">
                              <p className="text-sm font-medium text-gray-600">{field.name}</p>
                              <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                                <div className="mb-3 relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                                  <img 
                                    src={imageUrl} 
                                    alt={field.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <ImageIcon className="h-5 w-5 text-green-600 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-green-900">Imagen</p>
                                      <p className="text-xs text-green-700 truncate">{valor}</p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Campo tipo PDF
                        if (field.type === 'pdf') {
                          const filename = documentosService.extractFilename(valor);
                          return (
                            <div key={field.name} className="space-y-2">
                              <p className="text-sm font-medium text-gray-600">{field.name}</p>
                              <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-blue-900">Documento PDF</p>
                                      <p className="text-xs text-blue-700 truncate">{filename}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => documentosService.viewDocumento(filename)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => documentosService.downloadDocumento(filename)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Descargar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Otros tipos de campos (texto, número, etc.)
                        return (
                          <div key={field.name} className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">{field.name}</p>
                            <p className="text-base text-gray-900">{String(valor)}</p>
                          </div>
                        );
                      })
                    ) : (
                      // Fallback: mostrar como antes si no hay definición de campos
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        {Object.entries(permiso.camposAdicionales).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-sm font-medium text-gray-600">{key}</p>
                            <p className="text-base text-gray-900">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Información de Aprobación/Rechazo */}
            {(permiso.estatus === 'APROBADO' || permiso.estatus === 'RECHAZADO') && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {permiso.estatus === 'APROBADO' ? 'Información de Aprobación' : 'Información de Rechazo'}
                  </h3>
                  <div className={`p-4 rounded-lg ${estatusConfig.bgColor}`}>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fecha</p>
                        <p className="text-base text-gray-900">
                          {formatDateTime(permiso.estatus === 'APROBADO' ? permiso.fechaAprobacion : permiso.fechaRechazo)}
                        </p>
                      </div>
                      {permiso.estatus === 'APROBADO' && permiso.observaciones && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Observaciones</p>
                          <p className="text-base text-gray-900">{permiso.observaciones}</p>
                        </div>
                      )}
                      {permiso.estatus === 'RECHAZADO' && permiso.motivoRechazo && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Motivo de Rechazo</p>
                          <p className="text-base text-gray-900">{permiso.motivoRechazo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Ubicación */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sede</p>
                  <p className="text-base text-gray-900">{permiso.sede.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Subsede</p>
                  <p className="text-base text-gray-900">{permiso.subsede.name}</p>
                </div>
              </div>
            </div>

            {/* Metadatos */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Información del Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">Fecha de Solicitud</p>
                  <p className="text-sm text-gray-700">{formatDateTime(permiso.fechaSolicitud)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Fecha de Creación</p>
                  <p className="text-sm text-gray-700">{formatDateTime(permiso.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Última Actualización</p>
                  <p className="text-sm text-gray-700">{formatDateTime(permiso.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Estado</p>
                  <Badge variant={permiso.isActive ? 'default' : 'outline'} className="text-xs">
                    {permiso.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
