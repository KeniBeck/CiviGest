import { useState, useEffect } from 'react';
import { useCreateInfraccion } from '@/hooks/queries/useInfraccion';
import { useMultas } from '@/hooks/queries/useMultas';
import { useAgentes } from '@/hooks/queries/useAgentes';
import { useNotification } from '@/hooks/useNotification';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { CreateInfraccionDto } from '@/types/infraccion.type';

interface CreateInfraccionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateInfraccionModal = ({
  open,
  onClose,
  onSuccess,
}: CreateInfraccionModalProps) => {
  const notify = useNotification();
  const { mutate: createInfraccion, isPending } = useCreateInfraccion();
  const { data: multasResponse } = useMultas({ page: 1, limit: 200, isActive: true });
  const { data: agentesData } = useAgentes({ page: 1, limit: 200, isActive: true });

  const multas = (multasResponse as { data?: { items?: { id: number; nombre: string; codigo: string }[] } })?.data?.items ?? [];
  const agentes = agentesData?.items ?? [];

  const [formData, setFormData] = useState<CreateInfraccionDto>({
    multaId: 0,
    nombreCiudadano: '',
    documentoCiudadano: '',
    domicilioCiudadano: '',
    telefonoCiudadano: '',
    emailCiudadano: '',
    descripcion: '',
    ubicacion: '',
    fechaInfraccion: new Date().toISOString().slice(0, 16),
    agenteId: undefined,
    observaciones: '',
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        multaId: 0,
        nombreCiudadano: '',
        documentoCiudadano: '',
        domicilioCiudadano: '',
        telefonoCiudadano: '',
        emailCiudadano: '',
        descripcion: '',
        ubicacion: '',
        fechaInfraccion: new Date().toISOString().slice(0, 16),
        agenteId: undefined,
        observaciones: '',
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.multaId || !formData.nombreCiudadano?.trim() || !formData.documentoCiudadano?.trim()) {
      notify.warning('Campos requeridos', 'Multa, nombre y documento del ciudadano son obligatorios');
      return;
    }
    const payload: CreateInfraccionDto = {
      ...formData,
      fechaInfraccion: new Date(formData.fechaInfraccion).toISOString(),
      domicilioCiudadano: formData.domicilioCiudadano || undefined,
      telefonoCiudadano: formData.telefonoCiudadano || undefined,
      emailCiudadano: formData.emailCiudadano || undefined,
      descripcion: formData.descripcion || undefined,
      ubicacion: formData.ubicacion || undefined,
      observaciones: formData.observaciones || undefined,
      agenteId: formData.agenteId && formData.agenteId > 0 ? formData.agenteId : undefined,
    };
    createInfraccion(payload, {
      onSuccess: () => {
        notify.success('Infracción creada', 'El levantamiento se ha registrado correctamente');
        onClose();
        onSuccess?.();
      },
      onError: (err) => notify.apiError(err),
    });
  };

  const handleChange = (field: keyof CreateInfraccionDto, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Levantar Infracción
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="multaId">Tipo de multa *</Label>
                <select
                  id="multaId"
                  value={formData.multaId || ''}
                  onChange={(e) => handleChange('multaId', Number(e.target.value))}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione...</option>
                  {multas.map((m: { id: number; nombre: string; codigo: string }) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} - {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="fechaInfraccion">Fecha de infracción *</Label>
                <Input
                  id="fechaInfraccion"
                  type="datetime-local"
                  value={formData.fechaInfraccion?.slice(0, 16) ?? ''}
                  onChange={(e) => handleChange('fechaInfraccion', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nombreCiudadano">Nombre del ciudadano *</Label>
              <Input
                id="nombreCiudadano"
                value={formData.nombreCiudadano}
                onChange={(e) => handleChange('nombreCiudadano', e.target.value)}
                placeholder="Nombre completo"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="documentoCiudadano">Documento (CURP/INE) *</Label>
              <Input
                id="documentoCiudadano"
                value={formData.documentoCiudadano}
                onChange={(e) => handleChange('documentoCiudadano', e.target.value)}
                placeholder="CURP o número de identificación"
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="domicilioCiudadano">Domicilio</Label>
                <Input
                  id="domicilioCiudadano"
                  value={formData.domicilioCiudadano ?? ''}
                  onChange={(e) => handleChange('domicilioCiudadano', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telefonoCiudadano">Teléfono</Label>
                <Input
                  id="telefonoCiudadano"
                  value={formData.telefonoCiudadano ?? ''}
                  onChange={(e) => handleChange('telefonoCiudadano', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emailCiudadano">Correo electrónico</Label>
              <Input
                id="emailCiudadano"
                type="email"
                value={formData.emailCiudadano ?? ''}
                onChange={(e) => handleChange('emailCiudadano', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ubicacion">Ubicación del hecho</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion ?? ''}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                placeholder="Dirección o referencia"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion ?? ''}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Descripción de los hechos"
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="agenteId">Agente que levanta (opcional)</Label>
              <select
                id="agenteId"
                value={formData.agenteId ?? ''}
                onChange={(e) =>
                  handleChange('agenteId', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Ninguno</option>
                {agentes.map((a: { id: number; nombres: string; apellidoPaterno: string; numPlaca?: string }) => (
                  <option key={a.id} value={a.id}>
                    {a.nombres} {a.apellidoPaterno} {a.numPlaca ? `- ${a.numPlaca}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones ?? ''}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Registrar infracción'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
