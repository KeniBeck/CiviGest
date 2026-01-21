import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateRole } from '@/hooks/queries/useRoles';
import { useNotification } from '@/hooks/useNotification';
import { useUserLevel } from '@/hooks/useUserLevel';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import type { Role, UpdateRoleDto } from '@/types/role.types';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

const EditRoleModal = ({ isOpen, onClose, role }: EditRoleModalProps) => {
  const updateRole = useUpdateRole();
  const notify = useNotification();
  const { userLevel } = useUserLevel();

  // ✅ Verificar si puede editar este rol (solo SUPER_ADMIN puede editar roles globales)
  const canEdit = userLevel === 'SUPER_ADMIN' || !role.isGlobal;

  // ✅ Niveles permitidos según el rol del usuario
  const availableLevels = (() => {
    switch (userLevel) {
      case 'SUPER_ADMIN':
        return [
          { value: 'SUPER_ADMIN', label: 'Super Administrador' },
          { value: 'ESTATAL', label: 'Estatal' },
          { value: 'MUNICIPAL', label: 'Municipal' },
          { value: 'OPERATIVO', label: 'Operativo' },
        ];
      case 'ESTATAL':
        return [
          { value: 'ESTATAL', label: 'Estatal' },
          { value: 'MUNICIPAL', label: 'Municipal' },
          { value: 'OPERATIVO', label: 'Operativo' },
        ];
      case 'MUNICIPAL':
        return [
          { value: 'MUNICIPAL', label: 'Municipal' },
          { value: 'OPERATIVO', label: 'Operativo' },
        ];
      default:
        return [{ value: 'OPERATIVO', label: 'Operativo' }];
    }
  })();

  const [formData, setFormData] = useState<UpdateRoleDto>({
    name: role.name,
    description: role.description,
    level: role.level,
    isActive: role.isActive,
  });

  useEffect(() => {
    if (isOpen && role) {
      setFormData({
        name: role.name,
        description: role.description,
        level: role.level,
        isActive: role.isActive,
      });
    }
  }, [isOpen, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      notify.error('Validación', 'El nombre es requerido');
      return;
    }

    if (!formData.description?.trim()) {
      notify.error('Validación', 'La descripción es requerida');
      return;
    }

    updateRole.mutate(
      { id: role.id, data: formData },
      {
        onSuccess: () => {
          notify.success('Rol Actualizado', 'El rol se ha actualizado correctamente');
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
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Editar Rol</DialogTitle>
              <DialogDescription>
                Modifica los datos del rol <strong>{role.name}</strong>
              </DialogDescription>
            </div>
            {role.isGlobal && (
              <Badge variant="default" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Global
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ✅ Mostrar alerta si no puede editar */}
        {!canEdit && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Rol de Solo Lectura:</strong> Solo los Super Administradores pueden editar roles globales del sistema.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Administrador Municipal"
              disabled={updateRole.isPending || !canEdit}
            />
          </div>

          <div>
            <Label htmlFor="description">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las responsabilidades de este rol..."
              rows={3}
              disabled={updateRole.isPending || !canEdit}
            />
          </div>

          <div>
            <Label htmlFor="level">
              Nivel <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value) =>
                setFormData({ ...formData, level: value as UpdateRoleDto['level'] })
              }
              disabled={updateRole.isPending || !canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {userLevel === 'SUPER_ADMIN' 
                ? 'Define el nivel jerárquico del rol' 
                : `Solo puedes asignar niveles: ${availableLevels.map(l => l.label).join(', ')}`
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={updateRole.isPending || !canEdit}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Rol activo
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateRole.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateRole.isPending || !canEdit}>
              {updateRole.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleModal;
