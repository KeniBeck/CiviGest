import type { PagoPermiso } from '@/types/pago-permisos.type';
import type { Permiso } from '@/types/permiso.type';

/**
 * Parámetros para generar ticket (igual que ticket.service.ts)
 */
export interface GenerateTicketParams {
  pago: PagoPermiso;
  permiso: Permiso;
  logoUrl?: string;
  nombreCliente?: string;
  slogan?: string;
}

/**
 * Servicio para impresión en impresoras térmicas Sunmi
 * Compatible con dispositivos Sunmi T2, V2, V2s, etc.
 * 
 * Este servicio replica la MISMA ESTRUCTURA del PDF generado por ticket.service.ts
 * pero en formato ESC/POS para impresoras térmicas de 58mm
 */
class SunmiPrinterService {
  /**
   * Detecta si el dispositivo actual es Sunmi
   * Verifica el User-Agent del navegador
   */
  static isSunmiDevice(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }

    const ua = navigator.userAgent.toLowerCase();
    
    // Patrones comunes en dispositivos Sunmi
    const sunmiPatterns = [
      'sunmi',
      't2',      // Sunmi T2
      'v2',      // Sunmi V2, V2s, V2 Pro
      'p2',      // Sunmi P2
      'm2',      // Sunmi M2
      'l2',      // Sunmi L2
    ];

    return sunmiPatterns.some(pattern => ua.includes(pattern));
  }

  /**
   * Imprime un ticket en la impresora térmica Sunmi
   * Usa los mismos parámetros que ticket.service.ts para mantener consistencia
   * @param params - Parámetros del ticket (pago, permiso, configuración)
   */
  static async printTicket(params: GenerateTicketParams): Promise<void> {
    // Verificar si es dispositivo Sunmi
    if (!this.isSunmiDevice()) {
      throw new Error('Este dispositivo no es compatible con impresoras Sunmi');
    }

    try {
      // Generar comandos ESC/POS con la misma estructura que el PDF
      const commands = this.generateESCPOSCommands(params);

      // Intentar usar API nativa de Sunmi (método preferido)
      if (window.SunmiPrinter && typeof window.SunmiPrinter.printText === 'function') {
        await window.SunmiPrinter.printText(commands);
        
        // Imprimir QR si existe
        const qr = params.permiso.qr || params.pago.qrComprobante;
        if (qr) {
          await this.printQRCode(qr);
        }
        
        return;
      }

      // Fallback: Usar deep link de Sunmi
      this.printViaDeepLink(commands);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Genera comandos ESC/POS para formatear el ticket térmico
   * Replica la estructura EXACTA del PDF generado por ticket.service.ts
   * Documentación: https://reference.epson-biz.com/modules/ref_escpos/index.php
   */
  private static generateESCPOSCommands(params: GenerateTicketParams): string {
    const { pago, permiso, nombreCliente, slogan } = params;
    
    const ESC = '\x1B';
    const GS = '\x1D';
    
    // Comandos ESC/POS
    const CMD = {
      INIT: `${ESC}@`,                    // Inicializar impresora
      ALIGN_CENTER: `${ESC}a\x01`,        // Centrar texto
      ALIGN_LEFT: `${ESC}a\x00`,          // Alinear a la izquierda
      BOLD_ON: `${ESC}E\x01`,             // Negrita ON
      BOLD_OFF: `${ESC}E\x00`,            // Negrita OFF
      SIZE_NORMAL: `${GS}!\x00`,          // Tamaño normal
      SIZE_DOUBLE: `${GS}!\x11`,          // Texto tamaño doble
      SIZE_DOUBLE_HEIGHT: `${GS}!\x01`,   // Doble altura
      CUT_PAPER: `${GS}V\x00`,            // Cortar papel
      FEED_LINE: '\n',
    };

    let ticket = '';

    // ========================================
    // 1. INICIALIZAR IMPRESORA
    // ========================================
    ticket += CMD.INIT;
    ticket += CMD.FEED_LINE;

    // ========================================
    // 2. LOGO (Nota: Las impresoras térmicas no pueden mostrar imágenes fácilmente)
    // Se omite pero se puede agregar con comandos avanzados ESC/POS
    // ========================================

    // ========================================
    // 3. NOMBRE DEL CLIENTE (Centrado, Bold, Grande)
    // Igual que el PDF línea 55-60
    // ========================================
    if (nombreCliente) {
      ticket += CMD.ALIGN_CENTER;
      ticket += CMD.SIZE_DOUBLE;
      ticket += CMD.BOLD_ON;
      ticket += nombreCliente.toUpperCase();
      ticket += CMD.BOLD_OFF;
      ticket += CMD.SIZE_NORMAL;
      ticket += CMD.FEED_LINE;
    }

    // ========================================
    // 4. SLOGAN (Centrado, Italic simulado)
    // Igual que el PDF línea 62-71
    // ========================================
    if (slogan) {
      ticket += CMD.ALIGN_CENTER;
      ticket += CMD.SIZE_NORMAL;
      const sloganLines = this.wrapText(slogan, 32);
      sloganLines.forEach(line => {
        ticket += line;
        ticket += CMD.FEED_LINE;
      });
      ticket += CMD.FEED_LINE;
    }

    // ========================================
    // 5. LÍNEA DECORATIVA
    // Igual que el PDF línea 73-76
    // ========================================
    ticket += this.drawLine('-', 32);
    ticket += CMD.FEED_LINE;

    // ========================================
    // 6. TÍTULO DEL DOCUMENTO (Tipo de Permiso)
    // Igual que el PDF línea 78-89
    // ========================================
    const titulo = permiso.tipoPermiso?.nombre || 'Permiso';
    ticket += CMD.ALIGN_CENTER;
    ticket += CMD.SIZE_DOUBLE_HEIGHT;
    ticket += CMD.BOLD_ON;
    const tituloLines = this.wrapText(titulo.toUpperCase(), 16);
    tituloLines.forEach(line => {
      ticket += line;
      ticket += CMD.FEED_LINE;
    });
    ticket += CMD.BOLD_OFF;
    ticket += CMD.SIZE_NORMAL;
    ticket += CMD.FEED_LINE;
    ticket += this.drawLine('-', 32);
    ticket += CMD.FEED_LINE;

    // ========================================
    // 7. DATOS DEL PERMISO
    // Igual que el PDF línea 91-98
    // ========================================
    ticket += CMD.ALIGN_LEFT;
    ticket += CMD.SIZE_NORMAL;
    
    // Fecha
    const fecha = new Date(permiso.fechaEmision).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    ticket += this.drawFieldLine('Fecha:', fecha);
    
    // Agente
    const agente = pago.usuarioCobro?.username || 'N/A';
    ticket += this.drawFieldLine('Agente:', agente);
    
    // Estatus
    ticket += this.drawFieldLine('Estatus:', permiso.estatus);
    ticket += CMD.FEED_LINE;

    // ========================================
    // 8. SECCIÓN SOLICITANTE
    // Igual que el PDF línea 100-156
    // ========================================
    ticket += CMD.BOLD_ON;
    ticket += 'SOLICITANTE';
    ticket += CMD.BOLD_OFF;
    ticket += CMD.FEED_LINE;
    
    // Nombre del ciudadano
    const nombreLines = this.wrapText(permiso.nombreCiudadano, 32);
    nombreLines.forEach(line => {
      ticket += line;
      ticket += CMD.FEED_LINE;
    });
    
    // INE/Documento
    ticket += this.drawFieldLine('INE:', permiso.documentoCiudadano);
    
    // Negocio (si existe en campos adicionales)
    const negocio = this.getCampoAdicional(permiso, 'Negocio', 'negocio', 'nombre_negocio');
    if (negocio) {
      ticket += this.drawFieldLine('Negocio:', negocio);
    }

    // Giro comercial
    const giro = this.getCampoAdicional(permiso, 'Giro', 'giro', 'giro_comercial');
    if (giro) {
      ticket += this.drawFieldLine('Giro:', giro);
    }
    
    // Dirección
    const direccion = this.getCampoAdicional(permiso, 'Dirección', 'direccion', 'domicilio');
    if (direccion) {
      ticket += CMD.BOLD_ON;
      ticket += 'Direccion:';
      ticket += CMD.BOLD_OFF;
      ticket += CMD.FEED_LINE;
      
      const direccionLines = this.wrapText(direccion, 28);
      direccionLines.forEach(line => {
        ticket += '  ' + line;
        ticket += CMD.FEED_LINE;
      });
    }

    // Colonia
    const colonia = this.getCampoAdicional(permiso, 'Colonia', 'colonia');
    if (colonia) {
      ticket += this.drawFieldLine('Colonia:', colonia);
    }

    // Ciudad
    const ciudad = this.getCampoAdicional(permiso, 'Ciudad', 'ciudad');
    if (ciudad) {
      ticket += this.drawFieldLine('Ciudad:', ciudad);
    }

    ticket += CMD.FEED_LINE;

    // ========================================
    // 9. COSTO (Destacado)
    // Igual que el PDF línea 158-174
    // ========================================
    ticket += this.drawLine('=', 32);
    ticket += CMD.FEED_LINE;
    
    ticket += CMD.SIZE_DOUBLE_HEIGHT;
    ticket += CMD.BOLD_ON;
    
    const totalAmount = typeof pago.total === 'string' ? parseFloat(pago.total) : pago.total;
    
    ticket += this.formatLineWithAmount('COSTO:', totalAmount.toFixed(2), 16);
    
    ticket += CMD.BOLD_OFF;
    ticket += CMD.SIZE_NORMAL;
    ticket += this.drawLine('=', 32);
    ticket += CMD.FEED_LINE;

    // ========================================
    // 10. CÓDIGO QR
    // Igual que el PDF línea 176-193
    // Nota: Se imprimirá usando window.SunmiPrinter.printQRCode()
    // ========================================
    ticket += CMD.ALIGN_CENTER;
    ticket += CMD.FEED_LINE;
    ticket += '[VER CODIGO QR ABAJO]';
    ticket += CMD.FEED_LINE;
    ticket += CMD.FEED_LINE;

    // ========================================
    // 11. FOOTER (Sede/Subsede)
    // Igual que el PDF línea 196-217
    // ========================================
    ticket += this.drawLine('-', 32);
    ticket += CMD.FEED_LINE;
    
    ticket += CMD.ALIGN_CENTER;
    const sede = permiso.sede?.name || '';
    const subsede = permiso.subsede?.name || '';
    if (sede || subsede) {
      ticket += `${sede}${sede && subsede ? ' - ' : ''}${subsede}`;
      ticket += CMD.FEED_LINE;
    }

    // Referencia de pago
    if (pago.referenciaPago) {
      ticket += CMD.SIZE_NORMAL;
      const refLines = this.wrapText(pago.referenciaPago, 32);
      refLines.forEach(line => {
        ticket += line;
        ticket += CMD.FEED_LINE;
      });
    }

    ticket += CMD.FEED_LINE;
    ticket += CMD.FEED_LINE;
    ticket += CMD.FEED_LINE;

    // ========================================
    // 12. CORTAR PAPEL
    // ========================================
    ticket += CMD.CUT_PAPER;

    return ticket;
  }

  /**
   * Obtiene un campo adicional del permiso (múltiples posibles nombres)
   * Igual que ticket.service.ts línea 358-369
   */
  private static getCampoAdicional(permiso: Permiso, ...possibleKeys: string[]): string | null {
    if (!permiso.camposAdicionales) return null;

    for (const key of possibleKeys) {
      const value = permiso.camposAdicionales[key];
      if (value && typeof value === 'string' && !this.isFileField(value)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Verifica si un valor es un archivo (imagen o PDF)
   * Igual que ticket.service.ts línea 374-376
   */
  private static isFileField(value: string): boolean {
    return /\.(jpg|jpeg|png|gif|pdf)$/i.test(value);
  }

  /**
   * Dibuja un campo con label: valor
   */
  private static drawFieldLine(label: string, value: string): string {
    const ESC = '\x1B';
    const result = 
      `${ESC}E\x01` +        // Bold ON
      label + 
      `${ESC}E\x00` +        // Bold OFF
      ' ' + value + '\n';
    return result;
  }

  /**
   * Dibuja una línea decorativa
   */
  private static drawLine(char: string = '-', length: number = 32): string {
    return char.repeat(length) + '\n';
  }

  /**
   * Formatea una línea con label a la izquierda y monto a la derecha
   */
  private static formatLineWithAmount(label: string, amount: string, maxWidth: number = 32): string {
    const amountStr = `$${amount}`;
    const spaces = maxWidth - label.length - amountStr.length;
    return label + ' '.repeat(Math.max(1, spaces)) + amountStr + '\n';
  }

  /**
   * Divide texto largo en múltiples líneas
   */
  private static wrapText(text: string, maxWidth: number = 32): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Imprime usando deep link de Sunmi (método fallback)
   */
  private static printViaDeepLink(commands: string): void {
    try {
      // Codificar comandos para URL
      const encodedCommands = encodeURIComponent(commands);
      const deepLink = `sunmiprinter://print?text=${encodedCommands}`;
      
      // Intentar abrir el deep link
      window.location.href = deepLink;
    } catch (error) {
      throw new Error('No se pudo comunicar con la impresora Sunmi');
    }
  }

  /**
   * Imprime código QR usando API de Sunmi
   */
  static async printQRCode(data: string, size: number = 8): Promise<void> {
    if (window.SunmiPrinter && typeof window.SunmiPrinter.printQRCode === 'function') {
      try {
        await window.SunmiPrinter.printQRCode(data, size);
      } catch (error) {
        // Si falla, continuar sin el QR
      }
    }
  }

  /**
   * Obtiene información del método de impresión que se usará
   */
  static getPrintMethod(): 'sunmi' | 'standard' {
    return this.isSunmiDevice() ? 'sunmi' : 'standard';
  }
}

export const sunmiPrinterService = SunmiPrinterService;
