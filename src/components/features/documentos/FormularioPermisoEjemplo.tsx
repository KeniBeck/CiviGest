import { useState } from 'react';
import { PdfField } from '@/components/features/documentos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Ejemplo de cómo integrar campos PDF en un formulario de permisos
 * basado en los campos personalizados de TipoPermiso
 */

interface CampoPersonalizado {
  nombre: string;
  label: string;
  type: string;
  required: boolean;
  descripcion?: string;
}

interface TipoPermiso {
  id: number;
  nombre: string;
  camposPersonalizados: CampoPersonalizado[];
}

export const FormularioPermisoEjemplo = () => {
  // Simulación de un TipoPermiso con campos PDF
  const tipoPermiso: TipoPermiso = {
    id: 1,
    nombre: 'Permiso de Construcción',
    camposPersonalizados: [
      {
        nombre: 'plano_construccion',
        label: 'Plano de Construcción',
        type: 'pdf',
        required: true,
        descripcion: 'Suba el plano arquitectónico del proyecto',
      },
      {
        nombre: 'identificacion_oficial',
        label: 'Identificación Oficial',
        type: 'pdf',
        required: true,
        descripcion: 'INE o IFE del solicitante',
      },
      {
        nombre: 'licencia_uso_suelo',
        label: 'Licencia de Uso de Suelo',
        type: 'pdf',
        required: false,
        descripcion: 'Si aplica, suba la licencia de uso de suelo',
      },
    ],
  };

  // Estado para guardar las rutas de los documentos
  const [camposAdicionales, setCamposAdicionales] = useState<Record<string, string | null>>({});

  const handlePdfChange = (nombre: string, rutaArchivo: string | null) => {
    setCamposAdicionales((prev) => ({
      ...prev,
      [nombre]: rutaArchivo,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    const camposRequeridos = tipoPermiso.camposPersonalizados
      .filter((campo) => campo.required && campo.type === 'pdf')
      .map((campo) => campo.nombre);

    const camposFaltantes = camposRequeridos.filter(
      (nombre) => !camposAdicionales[nombre]
    );

    if (camposFaltantes.length > 0) {
      alert(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
      return;
    }

    // Datos a enviar al backend
    const dataToSubmit = {
      tipoPermisoId: tipoPermiso.id,
      camposAdicionales: camposAdicionales,
      // ...otros datos del permiso
    };

    console.log('Datos a enviar:', dataToSubmit);
    
    /**
     * Ejemplo de datos resultantes:
     * {
     *   tipoPermisoId: 1,
     *   camposAdicionales: {
     *     "plano_construccion": "images/documentos/file-1234567890-123456789.pdf",
     *     "identificacion_oficial": "images/documentos/file-1234567891-987654321.pdf",
     *     "licencia_uso_suelo": "images/documentos/file-1234567892-111111111.pdf"
     *   }
     * }
     */
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{tipoPermiso.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Renderizar campos PDF dinámicamente */}
          {tipoPermiso.camposPersonalizados.map((campo) => {
            if (campo.type === 'pdf') {
              return (
                <PdfField
                  key={campo.nombre}
                  nombre={campo.nombre}
                  label={campo.label}
                  descripcion={campo.descripcion}
                  required={campo.required}
                  value={camposAdicionales[campo.nombre] || undefined}
                  onChange={(ruta) => handlePdfChange(campo.nombre, ruta)}
                />
              );
            }

            // Aquí podrías manejar otros tipos de campos (text, number, date, etc.)
            return null;
          })}

          {/* Botón de envío */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">Enviar Solicitud</Button>
          </div>

          {/* Vista de datos actuales (para debugging) */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Datos actuales:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(camposAdicionales, null, 2)}
            </pre>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

/**
 * Ejemplo de uso con renderizado condicional de diferentes tipos de campos
 */
export const FormularioDinamicoCompleto = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const camposPersonalizados: CampoPersonalizado[] = [
    {
      nombre: 'nombre_proyecto',
      label: 'Nombre del Proyecto',
      type: 'text',
      required: true,
    },
    {
      nombre: 'presupuesto',
      label: 'Presupuesto',
      type: 'number',
      required: true,
    },
    {
      nombre: 'plano_construccion',
      label: 'Plano de Construcción',
      type: 'pdf',
      required: true,
      descripcion: 'Plano arquitectónico en formato PDF',
    },
    {
      nombre: 'fecha_inicio',
      label: 'Fecha de Inicio',
      type: 'date',
      required: true,
    },
  ];

  const handleChange = (nombre: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [nombre]: value,
    }));
  };

  const renderField = (campo: CampoPersonalizado) => {
    switch (campo.type) {
      case 'pdf':
        return (
          <PdfField
            key={campo.nombre}
            nombre={campo.nombre}
            label={campo.label}
            descripcion={campo.descripcion}
            required={campo.required}
            value={formData[campo.nombre]}
            onChange={(value) => handleChange(campo.nombre, value)}
          />
        );

      case 'text':
        return (
          <div key={campo.nombre} className="space-y-2">
            <label className="text-sm font-medium">
              {campo.label}
              {campo.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={formData[campo.nombre] || ''}
              onChange={(e) => handleChange(campo.nombre, e.target.value)}
              required={campo.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={campo.nombre} className="space-y-2">
            <label className="text-sm font-medium">
              {campo.label}
              {campo.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={formData[campo.nombre] || ''}
              onChange={(e) => handleChange(campo.nombre, e.target.value)}
              required={campo.required}
            />
          </div>
        );

      case 'date':
        return (
          <div key={campo.nombre} className="space-y-2">
            <label className="text-sm font-medium">
              {campo.label}
              {campo.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2"
              value={formData[campo.nombre] || ''}
              onChange={(e) => handleChange(campo.nombre, e.target.value)}
              required={campo.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Formulario Dinámico Completo</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {camposPersonalizados.map(renderField)}

          <Button type="submit">Enviar</Button>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Datos del formulario:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
