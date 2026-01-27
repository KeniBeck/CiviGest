
import { Receipt, Calendar, DollarSign, User, FileText, Building2, Printer, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/hooks/useNotification';
import { ticketService } from '@/services/ticket.service';
import { configuracionService } from '@/services/configuracion.service';
import { permisoService } from '@/services/permiso.service';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import type { PagoPermiso } from '@/types/pago-permisos.type';

interface ComprobanteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: PagoPermiso | null;
}

export const ComprobanteModal = ({ open, onOpenChange, pago }: ComprobanteModalProps) => {
  const { user } = useAuthStore();
  const notify = useNotification();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!pago) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateTicket = async () => {
    if (!pago.permisoId) {
      notify.error('Error', 'No se encontró el ID del permiso');
      return;
    }

    setIsGenerating(true);
    try {
      const permisoResponse = await permisoService.getById(pago.permisoId);
      const permiso = permisoResponse.data;

      let configuracion = null;
      if (user?.subsedeId) {
        try {
          const configResponse = await configuracionService.getBySubsede(user.subsedeId);
          configuracion = configResponse.data;
        } catch (error) {
          console.warn('No se pudo cargar la configuración:', error);
        }
      }

      const pdfBlob = await ticketService.generateTicketPermiso({
        pago,
        permiso,
        logoUrl: configuracion?.logo,
        nombreCliente: configuracion?.nombreCliente,
        slogan: configuracion?.slogan,
      });

      ticketService.openPDF(pdfBlob);
      notify.success('Éxito', 'Ticket generado correctamente');
    } catch (error) {
      console.error('Error al generar ticket:', error);
      notify.error('Error', 'Error al generar el ticket');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!pago.permisoId) {
      notify.error('Error', 'No se encontró el ID del permiso');
      return;
    }

    setIsGenerating(true);
    try {
      const permisoResponse = await permisoService.getById(pago.permisoId);
      const permiso = permisoResponse.data;

      let configuracion = null;
      if (user?.subsedeId) {
        try {
          const configResponse = await configuracionService.getBySubsede(user.subsedeId);
          configuracion = configResponse.data;
        } catch (error) {
          console.warn('No se pudo cargar la configuración:', error);
        }
      }

      const pdfBlob = await ticketService.generateTicketPermiso({
        pago,
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
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Helper para convertir valores monetarios (string → number)
  const toNumber = (value: string | number | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    return typeof value === 'string' ? parseFloat(value) || 0 : value;
  };

  // ✅ Convertir valores a números de forma segura
  const costoBase = toNumber(pago.costoBase);
  const descuentoPct = toNumber(pago.descuentoPct);
  const descuentoMonto = toNumber(pago.descuentoMonto);
  const total = toNumber(pago.total);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Comprobante de Pago
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="space-y-6 print:p-8">
            {/* Header del Comprobante */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">COMPROBANTE DE PAGO</h2>
              <p className="text-sm text-gray-600 mt-1">Sistema Tu Ciudad Digital</p>
            </div>

          {/* QR Code */}
          {pago.qrComprobante && (
            <div className="flex justify-center">
              <img
                src={pago.qrComprobante}
                alt="QR Comprobante"
                className="w-32 h-32 border-2 border-gray-200 rounded"
              />
            </div>
          )}

          {/* Información Principal */}
          <div className="grid grid-cols-2 gap-4">
            {/* ID de Pago */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                ID de Pago
              </p>
              <p className="text-sm font-semibold text-gray-900">#{pago.id}</p>
            </div>

            {/* Fecha */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de Pago
              </p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(pago.fechaPago)}</p>
            </div>

            {/* Folio del Permiso */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Folio del Permiso
              </p>
              <p className="text-sm font-semibold text-gray-900">{pago.permiso?.folio || 'N/A'}</p>
            </div>

            {/* Tipo de Permiso */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Tipo de Permiso
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {pago.permiso?.tipoPermiso?.nombre || 'N/A'}
              </p>
            </div>

            {/* Ciudadano */}
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <User className="h-3 w-3" />
                Ciudadano
              </p>
              <p className="text-sm font-semibold text-gray-900">{pago.nombreCiudadano}</p>
              <p className="text-xs text-gray-600">{pago.documentoCiudadano}</p>
            </div>

            {/* Sede/Subsede */}
            {pago.sede && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Estado
                </p>
                <p className="text-sm font-semibold text-gray-900">{pago.sede.name}</p>
              </div>
            )}
            {pago.subsede && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Municipio
                </p>
                <p className="text-sm font-semibold text-gray-900">{pago.subsede.name}</p>
              </div>
            )}
          </div>

          {/* Desglose de Pago */}
          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Costo Base:</span>
              <span className="text-sm font-medium text-gray-900">
                ${costoBase.toFixed(2)}
              </span>
            </div>
            {descuentoPct > 0 && (
              <>
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">Descuento ({descuentoPct}%):</span>
                  <span className="text-sm font-medium">-${descuentoMonto.toFixed(2)}</span>
                </div>
                {pago.usuarioAutorizo && (
                  <p className="text-xs text-gray-500">
                    Autorizado por: {pago.usuarioAutorizo.firstName} {pago.usuarioAutorizo.lastName}
                  </p>
                )}
              </>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-lg font-bold text-gray-900">Total Pagado:</span>
              <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Método de Pago:</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {pago.metodoPago === 'EFECTIVO' && 'Efectivo'}
              {pago.metodoPago === 'TARJETA_DEBITO' && 'Tarjeta de Débito'}
              {pago.metodoPago === 'TARJETA_CREDITO' && 'Tarjeta de Crédito'}
              {pago.metodoPago === 'TRANSFERENCIA' && 'Transferencia'}
            </span>
          </div>

          {/* Usuario que Cobró */}
          {pago.usuarioCobro && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-900">Atendido por:</span>
              </div>
              <span className="text-sm font-semibold text-blue-900">
                {pago.usuarioCobro.firstName} {pago.usuarioCobro.lastName}
              </span>
            </div>
          )}

          {/* Observaciones */}
          {pago.observaciones && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-semibold mb-1">Observaciones:</p>
              <p className="text-sm text-yellow-900">{pago.observaciones}</p>
            </div>
          )}

          {/* Estatus */}
          <div className="text-center">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                pago.estatus === 'PAGADO'
                  ? 'bg-green-100 text-green-800'
                  : pago.estatus === 'CANCELADO'
                  ? 'bg-red-100 text-red-800'
                  : pago.estatus === 'REEMBOLSADO'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {pago.estatus}
            </span>
          </div>
        </div>
      </div>

      {/* Footer con Botones */}
      <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-gray-50 print:hidden">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-last sm:order-first"
          >
            Cerrar
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint} 
            className="w-full sm:w-auto border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Receipt className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Imprimir Vista</span>
            <span className="sm:hidden">Vista</span>
          </Button>
          <Button 
            onClick={handleDownloadTicket}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{isGenerating ? 'Generando...' : 'Descargar Ticket'}</span>
            <span className="sm:hidden">{isGenerating ? 'Generando...' : 'Descargar'}</span>
          </Button>
          <Button 
            onClick={handleGenerateTicket}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Printer className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{isGenerating ? 'Generando...' : 'Imprimir Ticket'}</span>
            <span className="sm:hidden">{isGenerating ? 'Generando...' : 'Ticket'}</span>
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};
