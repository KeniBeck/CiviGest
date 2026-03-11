import {
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';

export interface DetalleModalHeaderStatusBadge {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  label: string;
  icon?: LucideIcon;
}

interface DetalleModalHeaderProps {
  /** Título del modal (puede incluir icono), ej: <> <FileText /> Detalle del Permiso </> */
  title: React.ReactNode;
  /** Badge de estatus (variant, label y opcional icon) */
  statusBadge: DetalleModalHeaderStatusBadge;
  /** Información extra bajo el título (ej. folio), opcional */
  extraInfo?: React.ReactNode;
}

/**
 * Encabezado estándar para modales de detalle (Permisos, Infracciones, etc.).
 * Mantiene un mismo diseño: título, badge de estatus y opcionalmente una línea extra (folio, etc.).
 */
export const DetalleModalHeader = ({
  title,
  statusBadge,
  extraInfo,
}: DetalleModalHeaderProps) => {
  const StatusIcon = statusBadge.icon;

  return (
    <DialogHeader className="px-6 pt-6 pb-4 border-b">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-2">
          {title}
        </DialogTitle>
        <div className="flex items-center gap-2">
          <Badge variant={statusBadge.variant} className="text-sm">
            {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
            {statusBadge.label}
          </Badge>
        </div>
      </div>
      {extraInfo != null && <div className="mt-1">{extraInfo}</div>}
    </DialogHeader>
  );
};
