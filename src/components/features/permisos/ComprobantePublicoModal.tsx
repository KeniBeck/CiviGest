import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Building2,
  Download,
  X,
  DollarSign,
  Receipt,
  CreditCard,
} from 'lucide-react';
import type { Permiso } from '@/types/permiso.type';
import { ticketService } from '@/services/ticket.service';
import { useNotification } from '@/hooks/useNotification';
import { imagenesService } from '@/services/imagenes.service';
import { documentosService } from '@/services/documento.service';

interface ComprobantePublicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permiso: Permiso | null;
}

export const ComprobantePublicoModal = ({ 
  open, 
  onOpenChange, 
  permiso 
}: ComprobantePublicoModalProps) => {
  const notify = useNotification();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!permiso) return null;

  // Obtener el primer pago (si existe)
  const pago = permiso.pagos?.[0];
  const configuracion = (pago?.subsede as any)?.configuracion;

  const handleDownloadTicket = async () => {
    if (!pago) {
      notify.error('Error', 'No se encontró información de pago');
      return;
    }

    setIsGenerating(true);
    try {
      const pdfBlob = await ticketService.generateTicketPermiso({
        pago: pago as any,
        permiso,
        logoUrl: configuracion?.logo,
        nombreCliente: configuracion?.nombreCliente,
        slogan: configuracion?.slogan,
      });

      const filename = `ticket-${permiso.folio}-${Date.now()}.pdf`;
      ticketService.downloadPDF(pdfBlob, filename);
      notify.success('Éxito', 'Ticket descargado correctamente');
    } catch (error) {
      console.error('Error al descargar ticket:', error);
      notify.error('Error', 'Error al descargar el ticket');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case 'APROBADO':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'RECHAZADO':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'PENDIENTE':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getMetodoPagoText = (metodo: string) => {
    const metodos: Record<string, string> = {
      EFECTIVO: 'Efectivo',
      TARJETA_DEBITO: 'Tarjeta de Débito',
      TARJETA_CREDITO: 'Tarjeta de Crédito',
      TRANSFERENCIA: 'Transferencia',
    };
    return metodos[metodo] || metodo;
  };

  // Función para verificar si un campo es una imagen
  const isImageField = (value: string) => {
    return /\.(jpg|jpeg|png|gif)$/i.test(value);
  };

  // Función para verificar si un campo es un PDF
  const isPdfField = (value: string) => {
    return /\.pdf$/i.test(value);
  };

  // Renderizar campos adicionales
  const renderCamposAdicionales = () => {
    if (!permiso.camposAdicionales) return null;

    return Object.entries(permiso.camposAdicionales).map(([key, value]) => {
      if (typeof value !== 'string') return null;

      // Si es imagen
      if (isImageField(value)) {
        const imageUrl = imagenesService.getImageUrl({ 
          type: 'permisos', 
          filename: value 
        });
        
        return (
          <div key={key} className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">{key}:</p>
            <img
              src={imageUrl}
              alt={key}
              className="w-full rounded-lg border-2 border-gray-200 shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.png';
              }}
            />
          </div>
        );
      }

      // Si es PDF
      if (isPdfField(value)) {
        const pdfUrl = documentosService.getViewUrl({ filename: value });
        
        return (
          <div key={key} className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">{key}:</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(pdfUrl, '_blank')}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver documento
            </Button>
          </div>
        );
      }

      // Campo de texto normal
      return (
        <div key={key} className="space-y-1">
          <p className="text-xs text-gray-600">{key}:</p>
          <p className="text-sm font-medium text-gray-900">{value}</p>
        </div>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {configuracion?.logo && (
                <img
                  src={imagenesService.getImageUrl({ 
                    type: 'configuraciones', 
                    filename: configuracion.logo 
                  })}
                  alt="Logo"
                  className="w-12 h-12 object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {configuracion?.nombreCliente || 'Comprobante de Permiso'}
                </DialogTitle>
                {configuracion?.slogan && (
                  <p className="text-sm text-gray-600 italic">{configuracion.slogan}</p>
                )}
              </div>
            </div>
            <Badge className={`${getEstatusColor(permiso.estatus)} border`}>
              {permiso.estatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="space-y-6">
            {/* Información del Permiso */}
            <div className="bg-white rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.9)] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Información del Permiso
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Receipt className="h-3 w-3" />
                    Folio
                  </p>
                  <p className="text-sm font-bold text-gray-900">{permiso.folio}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Tipo de Permiso
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {permiso.tipoPermiso?.nombre}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fecha de Emisión
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(permiso.fechaEmision)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fecha de Vencimiento
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(permiso.fechaVencimiento)}
                  </p>
                </div>

                {permiso.sede && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Estado
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {permiso.sede.name}
                    </p>
                  </div>
                )}

                {permiso.subsede && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Municipio
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {permiso.subsede.name}
                    </p>
                  </div>
                )}
              </div>

              {permiso.descripcion && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-600 mb-1">Descripción:</p>
                  <p className="text-sm text-gray-900">{permiso.descripcion}</p>
                </div>
              )}
            </div>

            {/* Información del Solicitante */}
            <div className="bg-white rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.9)] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Información del Solicitante
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Nombre Completo
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {permiso.nombreCiudadano}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Documento de Identidad</p>
                  <p className="text-sm font-medium text-gray-900">
                    {permiso.documentoCiudadano}
                  </p>
                </div>

                {permiso.domicilioCiudadano && (
                  <div className="space-y-1 col-span-full">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Domicilio
                    </p>
                    <p className="text-sm text-gray-900">{permiso.domicilioCiudadano}</p>
                  </div>
                )}

                {permiso.telefonoCiudadano && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Teléfono
                    </p>
                    <p className="text-sm text-gray-900">{permiso.telefonoCiudadano}</p>
                  </div>
                )}

                {permiso.emailCiudadano && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Correo Electrónico
                    </p>
                    <p className="text-sm text-gray-900">{permiso.emailCiudadano}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Campos Adicionales */}
            {permiso.camposAdicionales && Object.keys(permiso.camposAdicionales).length > 0 && (
              <div className="bg-white rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.9)] p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Documentos Adjuntos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderCamposAdicionales()}
                </div>
              </div>
            )}

            {/* Información de Pago */}
            {pago && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.9)] p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Información de Pago
                </h3>
                
                <div className="space-y-4">
                  {/* QR del Comprobante */}
                  {pago.qrComprobante && (
                    <div className="flex justify-center py-4">
                      <img
                        src={pago.qrComprobante}
                        alt="QR Comprobante"
                        className="w-40 h-40 border-4 border-white rounded-xl shadow-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">ID de Pago</p>
                      <p className="text-sm font-bold text-gray-900">#{pago.id}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Fecha de Pago</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(pago.fechaPago)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Método de Pago
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {getMetodoPagoText(pago.metodoPago)}
                      </p>
                    </div>

                    {pago.referenciaPago && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">Referencia</p>
                        <p className="text-xs font-mono text-gray-900">
                          {pago.referenciaPago}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Desglose de Pago */}
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Costo Base:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(pago.costoBase)}
                      </span>
                    </div>
                    
                    {parseFloat(pago.descuentoPct) > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Descuento ({pago.descuentoPct}%):
                          </span>
                          <span className="font-medium text-red-600">
                            -{formatCurrency(pago.descuentoMonto)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-lg font-bold text-slate-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-700">
                        {formatCurrency(pago.total)}
                      </span>
                    </div>
                  </div>

                  {pago.observaciones && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">
                        Observaciones:
                      </p>
                      <p className="text-sm text-yellow-900">{pago.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR del Permiso */}
            {permiso.qr && (
              <div className="flex justify-center py-4">
                <div className="bg-white rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.9)] p-6">
                  <p className="text-xs text-gray-600 text-center mb-3">
                    Código QR del Permiso
                  </p>
                  <img
                    src={`data:image/png;base64,${permiso.qr}`}
                    alt="QR Permiso"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial"
            >
              <X className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
            {pago && (
              <Button 
                onClick={handleDownloadTicket}
                disabled={isGenerating}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generando...' : 'Descargar Ticket'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
