import { useState } from 'react';
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
import { useCreateRole } from '@/hooks/queries/useRoles';
import { useNotification } from '@/hooks/useNotification';
import { useUserLevel } from '@/hooks/useUserLevel';
import type { CreateRoleDto } from '@/types/role.types';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoleModal = ({ isOpen, onClose }: CreateRoleModalProps) => {
  const createRole = useCreateRole();
  const notify = useNotification();
  const { userLevel } = useUserLevel();

  // ✅ Determinar el nivel por defecto según el rol del usuario
  const getDefaultLevel = (): CreateRoleDto['level'] => {
    switch (userLevel) {
      case 'SUPER_ADMIN':
        return 'OPERATIVO';
      case 'ESTATAL':
        return 'OPERATIVO';
      case 'MUNICIPAL':
        return 'OPERATIVO';
      default:
        return 'OPERATIVO';
    }
  };

  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    level: getDefaultLevel(),
    isActive: true,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.error('Validación', 'El nombre es requerido');
      return;
    }

    if (!formData.description.trim()) {
      notify.error('Validación', 'La descripción es requerida');
      return;
    }

    createRole.mutate(formData, {
      onSuccess: () => {
        notify.success('Rol Creado', 'El rol se ha creado correctamente');
        handleClose();
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      level: getDefaultLevel(),
      isActive: true,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Rol</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear un nuevo rol en el sistema
          </DialogDescription>
        </DialogHeader>

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
              disabled={createRole.isPending}
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
              disabled={createRole.isPending}
            />
          </div>

          <div>
            <Label htmlFor="level">
              Nivel <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value) =>
                setFormData({ ...formData, level: value as CreateRoleDto['level'] })
              }
              disabled={createRole.isPending}
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
                : `Solo puedes crear roles de nivel ${availableLevels.map(l => l.label).join(', ')}`
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={createRole.isPending}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Rol activo
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={createRole.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRole.isPending}>
              {createRole.isPending ? 'Creando...' : 'Crear Rol'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleModal;
