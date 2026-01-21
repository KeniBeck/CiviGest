import { useState, useEffect } from 'react';
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
import { useUpdatePermission } from '@/hooks/queries/usePermissions';
import { useNotification } from '@/hooks/useNotification';
import type { Permission } from '@/types/permission.type'; 

interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission;
}

const EditPermissionModal = ({ isOpen, onClose, permission }: EditPermissionModalProps) => {
  const [formData, setFormData] = useState({
    resource: '',
    action: '',
    description: '',
  });

  const updatePermission = useUpdatePermission();
  const notify = useNotification();

  useEffect(() => {
    if (permission && isOpen) {
      setFormData({
        resource: permission.resource || '',
        action: permission.action || '',
        description: permission.description || '',
      });
    }
  }, [permission, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resource.trim() || !formData.action.trim()) {
      notify.warning('Campos Requeridos', 'Recurso y Acción son obligatorios');
      return;
    }

    updatePermission.mutate(
      { id: permission.id, data: formData },
      {
        onSuccess: () => {
          notify.success('Permiso Actualizado', 'Los cambios se guardaron exitosamente');
          onClose();
        },
        onError: (error) => {
          notify.apiError(error);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Permiso</DialogTitle>
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
              onClick={onClose}
              disabled={updatePermission.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePermission.isPending}>
              {updatePermission.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPermissionModal;
