/**
 * Tipos para la integración con impresoras térmicas Sunmi
 */

export interface TicketData {
  header: {
    municipio: string;
    estado: string;
    titulo: string;
    fecha: string;
    hora: string;
    logo?: string; // URL del logo
    slogan?: string;
  };
  pago: {
    id: number;
    folio: string;
    tipoPermiso: string;
    ciudadano: string;
    documento: string;
    costoBase: string;
    descuento: string;
    descuentoPct: string;
    total: string;
    metodoPago: string;
    cajero: string;
    fechaPago: string;
  };
  qr?: string; // Datos del QR (URL o texto)
  footer: {
    mensaje: string;
    avisoLegal: string;
  };
}

/**
 * Interfaz para el objeto global de Sunmi Printer (inyectado por el dispositivo)
 */
export interface SunmiPrinterAPI {
  printText(text: string): Promise<void>;
  printQRCode(data: string, size?: number): Promise<void>;
  cutPaper(): Promise<void>;
  openCashBox(): Promise<void>;
}

/**
 * Extender la interfaz Window para incluir el API de Sunmi
 */
declare global {
  interface Window {
    SunmiPrinter?: SunmiPrinterAPI;
  }
}

export type PrintMethod = 'sunmi' | 'standard';
