import jsPDF from 'jspdf';
import type { PagoPermiso } from '@/types/pago-permisos.type';
import type { Permiso } from '@/types/permiso.type';
import { imagenesService } from './imagenes.service';

interface GenerateTicketPermisoParams {
  pago: PagoPermiso;
  permiso: Permiso;
  logoUrl?: string;
  nombreCliente?: string;
  slogan?: string;
}

class TicketService {
  private readonly TICKET_WIDTH = 58; // mm
  private readonly MARGIN = 4; // mm
  private readonly LINE_HEIGHT = 4; // mm
  private readonly FONT_SIZE_TITLE = 10;
  private readonly FONT_SIZE_NORMAL = 8;
  private readonly FONT_SIZE_SMALL = 7;

  /**
   * Genera un PDF de ticket de permiso en formato de 58mm
   */
  async generateTicketPermiso(params: GenerateTicketPermisoParams): Promise<Blob> {
    const { pago, permiso, logoUrl, nombreCliente, slogan } = params;

    // Paso 1: Calcular la altura necesaria con un documento temporal
    const calculatedHeight = await this.calculateTicketHeight(params);
    
    // Paso 2: Crear el documento final con la altura calculada
    const doc = new jsPDF({
      unit: 'mm',
      format: [this.TICKET_WIDTH, calculatedHeight],
    });

    let yPos = this.MARGIN;

    // Logo del cliente (si existe)
    if (logoUrl) {
      try {
        const logoDataUrl = await this.loadImageAsDataUrl(logoUrl);
        const logoSize = 18; // Tamaño del logo aumentado
        const logoX = (this.TICKET_WIDTH - logoSize) / 2;
        doc.addImage(logoDataUrl, 'PNG', logoX, yPos, logoSize, logoSize);
        yPos += logoSize + 3;
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
        // Si falla el logo, continuar sin él
        yPos += 2;
      }
    }

    // Nombre del cliente y slogan
    if (nombreCliente) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      this.drawCenteredText(doc, nombreCliente.toUpperCase(), yPos);
      yPos += this.LINE_HEIGHT + 1;
    }

    if (slogan) {
      doc.setFontSize(this.FONT_SIZE_SMALL);
      doc.setFont('helvetica', 'italic');
      const sloganLines = this.wrapText(doc, slogan, this.TICKET_WIDTH - this.MARGIN * 2);
      sloganLines.forEach(line => {
        this.drawCenteredText(doc, line, yPos);
        yPos += this.LINE_HEIGHT - 1;
      });
      yPos += 1;
    }

    // Línea decorativa
    yPos += 1;
    this.drawLine(doc, yPos, 'dashed');
    yPos += 4; // Espacio entre línea y texto

    // Título del documento con fondo
    doc.setFontSize(this.FONT_SIZE_TITLE);
    doc.setFont('helvetica', 'bold');
    const titulo = permiso.tipoPermiso?.nombre || 'Permiso';
    const tituloLines = this.wrapText(doc, titulo, this.TICKET_WIDTH - this.MARGIN * 2);
    tituloLines.forEach(line => {
      this.drawCenteredText(doc, line, yPos);
      yPos += this.LINE_HEIGHT;
    });
    yPos += 2; // Espacio entre texto y línea
    this.drawLine(doc, yPos, 'dashed');
    yPos += 4;

    // Datos del permiso
    doc.setFontSize(this.FONT_SIZE_NORMAL);
    doc.setFont('helvetica', 'normal');

    yPos = this.drawField(doc, 'Fecha:', this.formatDate(permiso.fechaEmision), yPos);
    yPos = this.drawField(doc, 'Agente:', pago.usuarioCobro?.username || 'N/A', yPos);
    yPos = this.drawField(doc, 'Estatus:', permiso.estatus, yPos);
    yPos += 2;

    // Datos del solicitante - Sección con fondo
    doc.setFillColor(250, 250, 250);
    const solicitanteHeight = 25; // Altura estimada, ajustar según campos
    doc.roundedRect(this.MARGIN, yPos, this.TICKET_WIDTH - this.MARGIN * 2, solicitanteHeight, 1, 1, 'F');
    
    yPos += 4;
    doc.setFontSize(this.FONT_SIZE_SMALL);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITANTE', this.MARGIN + 2, yPos);
    yPos += this.LINE_HEIGHT;

    doc.setFont('helvetica', 'normal');
    yPos = this.drawField(doc, '', permiso.nombreCiudadano, yPos, false);
    yPos = this.drawField(doc, 'INE:', permiso.documentoCiudadano, yPos);
    
    // Negocio (si existe en campos adicionales)
    const negocio = this.getCampoAdicional(permiso, 'Negocio', 'negocio', 'nombre_negocio');
    if (negocio) {
      yPos = this.drawField(doc, 'Negocio:', negocio, yPos);
    }

    // Giro comercial
    const giro = this.getCampoAdicional(permiso, 'Giro', 'giro', 'giro_comercial');
    if (giro) {
      yPos = this.drawField(doc, 'Giro:', giro, yPos);
    }

    
    // Dirección
    const direccion = this.getCampoAdicional(permiso, 'Dirección', 'direccion', 'domicilio');
    if (direccion) {
      doc.setFont('helvetica', 'bold');
      doc.text('Dirección:', this.MARGIN + 2, yPos);
      yPos += this.LINE_HEIGHT - 0.5;
      
      doc.setFont('helvetica', 'normal');
      const lines = this.wrapText(doc, direccion, this.TICKET_WIDTH - this.MARGIN * 2 - 4);
      lines.forEach(line => {
        doc.text(line, this.MARGIN + 4, yPos);
        yPos += this.LINE_HEIGHT - 0.5;
      });
      yPos += 0.5;
    }

    // Colonia
    const colonia = this.getCampoAdicional(permiso, 'Colonia', 'colonia');
    if (colonia) {
      yPos = this.drawField(doc, 'Colonia:', colonia, yPos);
    }

    // Ciudad
    const ciudad = this.getCampoAdicional(permiso, 'Ciudad', 'ciudad');
    if (ciudad) {
      yPos = this.drawField(doc, 'Ciudad:', ciudad, yPos);
    }

    yPos += 2;

    // Costo - Sección destacada
    yPos += 1;
    doc.setFillColor(240, 240, 240);
    doc.rect(this.MARGIN, yPos, this.TICKET_WIDTH - this.MARGIN * 2, 8, 'F');
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COSTO:', this.MARGIN + 2, yPos);
    
    const totalAmount = typeof pago.total === 'string' ? parseFloat(pago.total) : pago.total;
    const costoText = `$${totalAmount.toFixed(2)}`;
    const costoWidth = doc.getTextWidth(costoText);
    doc.text(costoText, this.TICKET_WIDTH - this.MARGIN - costoWidth - 2, yPos);
    yPos += 4;
    
    yPos += 2;

    // Código QR con marco decorativo
    if (permiso.qr) {
      try {
        const qrDataUrl = await this.generateQRDataUrl(permiso.qr);
        const qrSize = 28;
        const qrX = (this.TICKET_WIDTH - qrSize) / 2;
        
        // Marco decorativo alrededor del QR
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(qrX - 1, yPos - 1, qrSize + 2, qrSize + 2, 1, 1, 'S');
        
        doc.addImage(qrDataUrl, 'PNG', qrX, yPos, qrSize, qrSize);
        yPos += qrSize + 3;
      } catch (error) {
        console.warn('No se pudo generar el QR:', error);
      }
    }

    // Footer - Información adicional
    this.drawLine(doc, yPos, 'dashed');
    yPos += 4; // Espacio entre línea y texto
    
    doc.setFontSize(this.FONT_SIZE_SMALL);
    doc.setFont('helvetica', 'normal');
    const sede = permiso.sede?.name || '';
    const subsede = permiso.subsede?.name || '';
    if (sede || subsede) {
      this.drawCenteredText(doc, `${sede}${sede && subsede ? ' - ' : ''}${subsede}`, yPos);
      yPos += this.LINE_HEIGHT - 0.5;
    }

    // Imprimir datos de pago (referencia)
    if (pago.referenciaPago) {
      doc.setFontSize(6);
      doc.setFont('helvetica', 'italic');
      const lines = this.wrapText(doc, pago.referenciaPago, this.TICKET_WIDTH - this.MARGIN * 2);
      lines.forEach(line => {
        this.drawCenteredText(doc, line, yPos);
        yPos += this.LINE_HEIGHT - 1.5;
      });
    }

    yPos += 2;

    // Retornar el PDF como blob con altura dinámica
    return doc.output('blob');
  }

  /**
   * Calcula la altura necesaria para el ticket haciendo un dry run
   */
  private async calculateTicketHeight(params: GenerateTicketPermisoParams): Promise<number> {
    const { pago, permiso, logoUrl, nombreCliente, slogan } = params;
    
    // Crear documento temporal para calcular dimensiones
    const tempDoc = new jsPDF({
      unit: 'mm',
      format: [this.TICKET_WIDTH, 300],
    });

    let yPos = this.MARGIN;

    // Logo
    if (logoUrl) {
      try {
        await this.loadImageAsDataUrl(logoUrl);
        const logoSize = 18;
        yPos += logoSize + 3;
      } catch (error) {
        yPos += 2;
      }
    }

    // Nombre del cliente
    if (nombreCliente) {
      tempDoc.setFontSize(11);
      tempDoc.setFont('helvetica', 'bold');
      yPos += this.LINE_HEIGHT + 1;
    }

    // Slogan
    if (slogan) {
      tempDoc.setFontSize(this.FONT_SIZE_SMALL);
      const sloganLines = this.wrapText(tempDoc, slogan, this.TICKET_WIDTH - this.MARGIN * 2);
      yPos += (this.LINE_HEIGHT - 1) * sloganLines.length + 1;
    }

    // Línea decorativa
    yPos += 1 + 4;

    // Título del documento
    tempDoc.setFontSize(this.FONT_SIZE_TITLE);
    const titulo = permiso.tipoPermiso?.nombre || 'Permiso';
    const tituloLines = this.wrapText(tempDoc, titulo, this.TICKET_WIDTH - this.MARGIN * 2);
    yPos += this.LINE_HEIGHT * tituloLines.length + 2 + 4;

    // Datos del permiso (3 campos)
    tempDoc.setFontSize(this.FONT_SIZE_NORMAL);
    yPos += this.LINE_HEIGHT * 3 + 2;

    // Datos del solicitante (altura estimada)
    yPos += 4 + this.LINE_HEIGHT * 4; // Título + campos básicos

    // Negocio
    const negocio = this.getCampoAdicional(permiso, 'Negocio', 'negocio', 'nombre_negocio');
    if (negocio) {
      yPos += this.LINE_HEIGHT;
    }

    // Giro
    const giro = this.getCampoAdicional(permiso, 'Giro', 'giro', 'giro_comercial');
    if (giro) {
      yPos += this.LINE_HEIGHT;
    }

    // Dirección (puede ocupar varias líneas)
    const direccion = this.getCampoAdicional(permiso, 'Dirección', 'direccion', 'domicilio');
    if (direccion) {
      tempDoc.setFontSize(this.FONT_SIZE_SMALL);
      const lines = this.wrapText(tempDoc, direccion, this.TICKET_WIDTH - this.MARGIN * 2 - 4);
      yPos += this.LINE_HEIGHT + (this.LINE_HEIGHT - 0.5) * lines.length + 0.5;
    }

    // Colonia
    const colonia = this.getCampoAdicional(permiso, 'Colonia', 'colonia');
    if (colonia) {
      yPos += this.LINE_HEIGHT;
    }

    // Ciudad
    const ciudad = this.getCampoAdicional(permiso, 'Ciudad', 'ciudad');
    if (ciudad) {
      yPos += this.LINE_HEIGHT;
    }

    // Otros campos adicionales tipo texto (no imagen ni PDF)
    if (permiso.camposAdicionales) {
      const camposTexto = Object.entries(permiso.camposAdicionales).filter(
        ([key, value]) => 
          typeof value === 'string' && 
          !this.isFileField(value) &&
          !['Negocio', 'negocio', 'nombre_negocio', 'Giro', 'giro', 'giro_comercial', 
            'Dirección', 'direccion', 'domicilio', 'Colonia', 'colonia', 'Ciudad', 'ciudad'].includes(key)
      );
      
      // Cada campo adicional de texto
      tempDoc.setFontSize(this.FONT_SIZE_SMALL);
      camposTexto.forEach(([, value]) => {
        const lines = this.wrapText(tempDoc, String(value), this.TICKET_WIDTH - this.MARGIN * 2 - 15);
        yPos += this.LINE_HEIGHT * Math.max(1, lines.length);
      });
    }

    yPos += 2;

    // Costo
    yPos += 1 + 8 + 2;

    // QR
    const qrSize = 28;
    yPos += qrSize + 3;

    // Footer
    yPos += 4 + this.LINE_HEIGHT;

    // Referencia de pago
    if (pago.referenciaPago) {
      tempDoc.setFontSize(6);
      const lines = this.wrapText(tempDoc, pago.referenciaPago, this.TICKET_WIDTH - this.MARGIN * 2);
      yPos += (this.LINE_HEIGHT - 1.5) * lines.length;
    }

    yPos += 2 + this.MARGIN;

    // Retornar altura con margen de seguridad
    return Math.ceil(yPos + 5);
  }

  /**
   * Obtiene un campo adicional del permiso (múltiples posibles nombres)
   */
  private getCampoAdicional(permiso: Permiso, ...possibleKeys: string[]): string | null {
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
   */
  private isFileField(value: string): boolean {
    return /\.(jpg|jpeg|png|gif|pdf)$/i.test(value);
  }

  /**
   * Dibuja un campo con label y valor
   */
  private drawField(doc: jsPDF, label: string, value: string, yPos: number, showLabel: boolean = true): number {
    doc.setFontSize(this.FONT_SIZE_SMALL);
    
    if (showLabel && label) {
      doc.setFont('helvetica', 'bold');
      const labelWidth = doc.getTextWidth(label);
      doc.text(label, this.MARGIN + 2, yPos);
      
      doc.setFont('helvetica', 'normal');
      // Wrap text si es muy largo
      const maxWidth = this.TICKET_WIDTH - this.MARGIN * 2 - labelWidth - 4;
      const lines = this.wrapText(doc, value, maxWidth);
      
      if (lines.length === 1 && doc.getTextWidth(value) < maxWidth) {
        doc.text(value, this.MARGIN + labelWidth + 3, yPos);
        return yPos + this.LINE_HEIGHT;
      } else {
        yPos += this.LINE_HEIGHT;
        lines.forEach(line => {
          doc.text(line, this.MARGIN + 4, yPos);
          yPos += this.LINE_HEIGHT - 0.5;
        });
        return yPos + 0.5;
      }
    } else {
      doc.setFont('helvetica', 'normal');
      const lines = this.wrapText(doc, value, this.TICKET_WIDTH - this.MARGIN * 2 - 4);
      lines.forEach(line => {
        doc.text(line, this.MARGIN + 2, yPos);
        yPos += this.LINE_HEIGHT - 0.5;
      });
      return yPos + 0.5;
    }
  }

  /**
   * Dibuja texto centrado
   */
  private drawCenteredText(doc: jsPDF, text: string, yPos: number): void {
    const textWidth = doc.getTextWidth(text);
    const x = (this.TICKET_WIDTH - textWidth) / 2;
    doc.text(text, x, yPos);
  }

  /**
   * Dibuja una línea decorativa simple y profesional
   */
  private drawLine(doc: jsPDF, yPos: number, style: 'solid' | 'dashed' = 'solid'): void {
    doc.setLineWidth(style === 'dashed' ? 0.05 : 0.1);
    
    if (style === 'dashed') {
      // Simular línea discontinua con pequeñas líneas
      const dashLength = 2;
      const gapLength = 1;
      let x = this.MARGIN;
      const endX = this.TICKET_WIDTH - this.MARGIN;
      
      while (x < endX) {
        const lineEnd = Math.min(x + dashLength, endX);
        doc.line(x, yPos, lineEnd, yPos);
        x += dashLength + gapLength;
      }
    } else {
      doc.line(this.MARGIN, yPos, this.TICKET_WIDTH - this.MARGIN, yPos);
    }
  }

  /**
   * Divide texto en múltiples líneas
   */
  private wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Formatea una fecha
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Carga una imagen como Data URL
   */
  private async loadImageAsDataUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      
      // Construir la URL correcta para el logo
      if (url.startsWith('/imagenes/') || url.startsWith('imagenes/')) {
        const parts = url.split('/');
        const type = parts[parts.length - 2]; // Tipo de imagen (ej: 'configuraciones')
        const filename = parts[parts.length - 1]; // Nombre del archivo
        img.src = imagenesService.getImageUrl({
          type: type as any,
          filename: filename,
        });
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        img.src = url;
      } else {
        // Asumir que es un filename de configuraciones
        img.src = imagenesService.getImageUrl({
          type: 'configuraciones' as any,
          filename: url,
        });
      }
    });
  }

  /**
   * Genera un código QR como Data URL
   */
  private async generateQRDataUrl(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      
      // Importar qrcode dinámicamente
      import('qrcode').then(QRCode => {
        QRCode.toCanvas(canvas, data, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: 'M',
        }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(canvas.toDataURL('image/png'));
          }
        });
      }).catch(reject);
    });
  }

  /**
   * Abre el PDF en una nueva pestaña
   */
  openPDF(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Liberar el objeto URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Descarga el PDF
   */
  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Liberar el objeto URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

export const ticketService = new TicketService();
