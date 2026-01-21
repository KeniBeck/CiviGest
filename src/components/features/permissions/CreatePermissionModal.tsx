import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { useCreatePermission } from '@/hooks/queries/usePermissions';
import { useNotification } from '@/hooks/useNotification';

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePermissionModal = ({ isOpen, onClose }: CreatePermissionModalProps) => {
  const [formData, setFormData] = useState({
    resource: '',
    action: '',
    description: '',
  });

  const createPermission = useCreatePermission();
  const notify = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resource.trim() || !formData.action.trim()) {
      notify.warning('Campos Requeridos', 'Recurso y Acción son obligatorios');
      return;
    }

    createPermission.mutate(formData, {
      onSuccess: () => {
        notify.success('Permiso Creado', 'El permiso se creó exitosamente');
        handleClose();
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleClose = () => {
    setFormData({ resource: '', action: '', description: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Permiso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource">
              Recurso <span className="text-red-500">*</span>
            </Label>
            <Input
              id="resource"
              placeholder="Ej: users, roles, permissions"
              value={formData.resource}
              onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              El recurso o entidad sobre la cual se aplica el permiso
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">
              Acción <span className="text-red-500">*</span>
            </Label>
            <Input
              id="action"
              placeholder="Ej: create, read, update, delete"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              La acción que se puede realizar sobre el recurso
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del permiso..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPermission.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createPermission.isPending}>
              {createPermission.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Permiso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePermissionModal;
