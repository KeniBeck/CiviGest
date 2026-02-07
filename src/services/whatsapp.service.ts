import { ENV } from '@/config/env';

class WhatsAppService {
  /**
   * Genera el enlace de comprobante de permiso
   */
  generateComprobanteLink(dni: string, idPago: number): string {
    const baseUrl = ENV.FRONTEND_URL;
    const encodedDni = encodeURIComponent(dni);
    return `${baseUrl}/comprobante-permisos?dni=${encodedDni}&idPago=${idPago}`;
  }

  /**
   * Abre WhatsApp Web con un mensaje predefinido
   * @param phoneNumber - Número de teléfono (opcional, sin número abre sin destinatario)
   * @param message - Mensaje a enviar
   */
  sendMessage(phoneNumber: string | null, message: string): void {
    const encodedMessage = encodeURIComponent(message);
    
    let whatsappUrl: string;
    
    if (phoneNumber) {
      // Limpiar el número de teléfono (remover caracteres no numéricos)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    } else {
      // Sin número de teléfono, abre WhatsApp Web sin destinatario
      whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    }
    
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Envía el comprobante de permiso por WhatsApp
   * @param dni - Documento del ciudadano
   * @param idPago - ID del pago
   * @param nombreCiudadano - Nombre del ciudadano
   * @param folio - Folio del permiso
   * @param phoneNumber - Número de teléfono (opcional)
   */
  sendComprobante(params: {
    dni: string;
    idPago: number;
    nombreCiudadano: string;
    folio: string;
    phoneNumber?: string | null;
  }): void {
    const { dni, idPago, nombreCiudadano, folio, phoneNumber } = params;
    
    const link = this.generateComprobanteLink(dni, idPago);
    
    const message = `🎫 *Comprobante de Pago - Tu Ciudad Digital*\n\n` +
      `Hola *${nombreCiudadano}*,\n\n` +
      `Tu comprobante de pago del permiso *${folio}* está listo.\n\n` +
      `Puedes ver y descargar tu ticket en el siguiente enlace:\n` +
      `${link}\n\n` +
      `Gracias por tu pago. 🙏`;
    
    this.sendMessage(phoneNumber || null, message);
  }
}

export const whatsappService = new WhatsAppService();
