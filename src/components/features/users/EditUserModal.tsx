import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useUser, useUpdateUser } from '@/hooks/queries/useUsers';
import { useRoles } from '@/hooks/queries/useRoles';
import { useSubsedesForAccess } from '@/hooks/queries/useSubsedes';
import { useUserLevel } from '@/hooks/useUserLevel';
import { useNotification } from '@/hooks/useNotification';
import { sedeService } from '@/services/sede.service';
import { subsedeService } from '@/services/subsede.service';
import type { UpdateUserDto } from '@/types/user.types';
import type { Sede } from '@/types/sede.types';
import type { Subsede } from '@/types/subsede.types';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
}

const DOCUMENT_TYPES = [
  { value: 'CURP', label: 'CURP' },
  { value: 'RFC', label: 'RFC' },
  { value: 'INE', label: 'INE' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'VISA', label: 'Visa' },
];

export const EditUserModal = ({ open, onOpenChange, userId }: EditUserModalProps) => {
  // ✅ Hooks centralizados
  const { userLevel, currentUser, canEditSede, canEditSubsede, canEditAccessLevel } = useUserLevel();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { data: userData, isLoading: isLoadingUser } = useUser(userId || 0);
  const { data: rolesData } = useRoles({ isActive: true });
  const notify = useNotification();
  
  const [selectedSedeId, setSelectedSedeId] = useState<number | undefined>();
  
  // ✅ Cargar subsedes con useQuery
  const { data: availableSubsedes, isLoading: loadingSubsedes } = useSubsedesForAccess(
    userLevel,
    currentUser?.sedeId,
    selectedSedeId
  );

  // ✅ Filtrar roles según el nivel del usuario autenticado
  const availableRoles = useMemo(() => {
    if (!rolesData?.items) return [];
    
    const roles = rolesData.items;
    
    switch (userLevel) {
      case 'SUPER_ADMIN':
        return roles;
      case 'ESTATAL':
        return roles.filter(r => r.level !== 'SUPER_ADMIN');
      case 'MUNICIPAL':
        return roles.filter(r => r.level === 'MUNICIPAL' || r.level === 'OPERATIVO');
      default:
        return [];
    }
  }, [rolesData, userLevel]);

  // ✅ Opciones de nivel de acceso según el rol del usuario
  const accessLevelOptions = useMemo(() => {
    switch (userLevel) {
      case 'SUPER_ADMIN':
        return [
          { value: 'SEDE', label: 'Estatal (Sede)' },
          { value: 'SUBSEDE', label: 'Municipal (Subsede)' },
        ];
      case 'ESTATAL':
        return [
          { value: 'SEDE', label: 'Estatal (Sede)' },
          { value: 'SUBSEDE', label: 'Municipal (Subsede)' },
        ];
      case 'MUNICIPAL':
        return [{ value: 'SUBSEDE', label: 'Municipal (Subsede)' }];
      default:
        return [];
    }
  }, [userLevel]);

  const [formData, setFormData] = useState<Partial<UpdateUserDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Cargar datos del usuario cuando se obtienen
  useEffect(() => {
    if (userData && open) {
      setFormData({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        phoneCountryCode: userData.phoneCountryCode,
        documentType: userData.documentType,
        documentNumber: userData.documentNumber,
        accessLevel: userData.accessLevel,
        subsedeId: userData.subsedeId || undefined,
        roleIds: userData.roles.map(r => r.role.id),
        // Solo cargar subsedeAccessIds si NO es MUNICIPAL
        ...(userLevel !== 'MUNICIPAL' && { subsedeAccessIds: [] }),
        address: userData.address || '',
      });
      setSelectedSedeId(userData.sedeId);
    }
  }, [userData, open]);

  // ✅ Reset form cuando se cierra
  useEffect(() => {
    if (!open) {
      setFormData({});
      setErrors({});
      setSelectedSedeId(undefined);
    }
  }, [open]);

  // ✅ Validación
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'El email es requerido';
    if (!formData.username) newErrors.username = 'El usuario es requerido';
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!formData.firstName) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'El apellido es requerido';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'El teléfono es requerido';
    if (!formData.documentNumber) newErrors.documentNumber = 'El documento es requerido';
    if (!formData.roleIds || formData.roleIds.length === 0) {
      newErrors.roleIds = 'Debe seleccionar al menos un rol';
    }
    if (formData.accessLevel === 'SUBSEDE' && !formData.subsedeId) {
      newErrors.subsedeId = 'Debe seleccionar un municipio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !userId) return;

    // Limpiar datos antes de enviar
    const dataToSubmit = { ...formData };
    
    // No enviar password si está vacío
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    
    // Si es MUNICIPAL, NO enviar subsedeAccessIds (solo usar subsedeId)
    if (userLevel === 'MUNICIPAL') {
      delete dataToSubmit.subsedeAccessIds;
    }

    updateUser(
      { id: userId, data: dataToSubmit as UpdateUserDto },
      {
        onSuccess: () => {
          notify.success('Usuario Actualizado', 'El usuario se ha actualizado correctamente');
          onOpenChange(false);
        },
        onError: (error: any) => {
          notify.apiError(error);
        },
      }
    );
  };

  // ✅ Handle input change
  const handleChange = (field: keyof UpdateUserDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // ✅ Toggle role selection
  const toggleRole = (roleId: number) => {
    setFormData((prev) => {
      const currentRoles = prev.roleIds || [];
      const newRoles = currentRoles.includes(roleId)
        ? currentRoles.filter((id) => id !== roleId)
        : [...currentRoles, roleId];
      return { ...prev, roleIds: newRoles };
    });
    if (errors.roleIds) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.roleIds;
        return newErrors;
      });
    }
  };

  // ✅ Toggle subsede access
  const toggleSubsedeAccess = (subsedeId: number) => {
    setFormData((prev) => {
      const currentAccess = prev.subsedeAccessIds || [];
      const newAccess = currentAccess.includes(subsedeId)
        ? currentAccess.filter((id) => id !== subsedeId)
        : [...currentAccess, subsedeId];
      return { ...prev, subsedeAccessIds: newAccess };
    });
    if (errors.subsedeAccessIds) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.subsedeAccessIds;
        return newErrors;
      });
    }
  };

  if (isLoadingUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Cargando datos del usuario...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario. Deja la contraseña en blanco si no deseas cambiarla.
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario *</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && <p className="text-xs text-red-600">{errors.username}</p>}
            </div>

            {/* Password (opcional en edición) */}
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Dejar en blanco para mantener actual"
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className={errors.phoneNumber ? 'border-red-500' : ''}
              />
              {errors.phoneNumber && <p className="text-xs text-red-600">{errors.phoneNumber}</p>}
            </div>

            {/* Tipo de Documento */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento *</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => handleChange('documentType', value)}
              >
                <SelectTrigger className="neomorph-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((doc) => (
                    <SelectItem key={doc.value} value={doc.value}>
                      {doc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Número de Documento */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de Documento *</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber || ''}
                onChange={(e) => handleChange('documentNumber', e.target.value)}
                className={errors.documentNumber ? 'border-red-500' : ''}
              />
              {errors.documentNumber && (
                <p className="text-xs text-red-600">{errors.documentNumber}</p>
              )}
            </div>

            {/* Nivel de Acceso */}
            {canEditAccessLevel && (
              <div className="space-y-2">
                <Label htmlFor="accessLevel">Nivel de Acceso *</Label>
                <Select
                  value={formData.accessLevel}
                  onValueChange={(value) => handleChange('accessLevel', value as 'SEDE' | 'SUBSEDE')}
                >
                  <SelectTrigger className="neomorph-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Estado (Sede) */}
            {canEditSede && formData.accessLevel === 'SUBSEDE' && (
              <div className="space-y-2">
                <Label>Estado</Label>
                <SearchableSelect
                  placeholder="Seleccionar estado"
                  value={selectedSedeId || 0}
                  onChange={(value) => setSelectedSedeId(Number(value))}
                  queryKey={['sedes-modal-edit-user']}
                  queryFn={async ({ page, search, limit }) => {
                    const response = await sedeService.getAll({
                      page,
                      search,
                      limit,
                      activatePaginated: true,
                    });
                    return response.data;
                  }}
                  getOptionLabel={(item: Sede) => item.name}
                  getOptionValue={(item: Sede) => item.id}
                />
              </div>
            )}

            {/* Municipio (Subsede) */}
            {formData.accessLevel === 'SUBSEDE' && canEditSubsede && (
              <div className="space-y-2">
                <Label>Municipio *</Label>
                <SearchableSelect
                  placeholder="Seleccionar municipio"
                  value={formData.subsedeId || 0}
                  onChange={(value) => handleChange('subsedeId', Number(value))}
                  queryKey={['subsedes-modal-edit-user', selectedSedeId || currentUser?.sedeId || 'all']}
                  queryFn={async ({ page, search, limit }) => {
                    const params: any = { page, search, limit, activatePaginated: true };
                    if (userLevel === 'ESTATAL') {
                      params.sedeId = currentUser?.sedeId;
                    } else if (selectedSedeId) {
                      params.sedeId = selectedSedeId;
                    }
                    const response = await subsedeService.getAll(params);
                    return response.data;
                  }}
                  getOptionLabel={(item: Subsede) => item.name}
                  getOptionValue={(item: Subsede) => item.id}
                  className={errors.subsedeId ? 'border-red-500' : ''}
                />
                {errors.subsedeId && <p className="text-xs text-red-600">{errors.subsedeId}</p>}
              </div>
            )}

            {/* Mostrar municipio si es MUNICIPAL */}
            {userLevel === 'MUNICIPAL' && currentUser?.subsedeId && (
              <div className="space-y-2">
                <Label>Municipio Asignado</Label>
                <Input
                  value={`Municipio ID: ${currentUser.subsedeId}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            )}
          </div>

          {/* ✅ SECCIÓN: ACCESOS MÚLTIPLES A SUBSEDES */}
          {(userLevel === 'SUPER_ADMIN' || userLevel === 'ESTATAL') && (
            <div className="space-y-2">
              <Label>
                Accesos a Municipios {userLevel === 'ESTATAL' ? '*' : '(opcional)'}
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                {userLevel === 'ESTATAL'
                  ? 'Seleccione los municipios de su estado a los que el usuario tendrá acceso'
                  : 'Seleccione los municipios a los que el usuario tendrá acceso'}
              </p>
              {loadingSubsedes ? (
                <div className="flex items-center justify-center p-4 neomorph-flat rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  <span className="ml-2 text-sm text-gray-500">Cargando municipios...</span>
                </div>
              ) : availableSubsedes && availableSubsedes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 p-4 neomorph-flat rounded-lg max-h-48 overflow-y-auto">
                  {availableSubsedes.map((subsede) => (
                    <label
                      key={subsede.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.subsedeAccessIds?.includes(subsede.id)}
                        onChange={() => toggleSubsedeAccess(subsede.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{subsede.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 p-4 neomorph-flat rounded-lg">
                  {userLevel === 'SUPER_ADMIN' && !selectedSedeId
                    ? 'Seleccione un estado primero para ver sus municipios'
                    : 'No hay municipios disponibles'}
                </p>
              )}
            </div>
          )}

          {/* ✅ Mostrar accesos auto-asignados para MUNICIPAL */}
          {userLevel === 'MUNICIPAL' && currentUser?.subsedeId && (
            <div className="space-y-2">
              <Label>Accesos del Usuario</Label>
              <div className="p-4 neomorph-flat rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  ✓ El usuario tiene acceso a tu municipio
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Estado ID: {userData?.sedeId} | Municipio ID: {userData?.subsedeId}
                </p>
              </div>
            </div>
          )}

          {/* Roles */}
          <div className="space-y-2">
            <Label>Roles *</Label>
            {availableRoles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 p-4 neomorph-flat rounded-lg">
                {availableRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.roleIds?.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{role.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 p-4 neomorph-flat rounded-lg">
                Cargando roles disponibles...
              </p>
            )}
            {errors.roleIds && <p className="text-xs text-red-600">{errors.roleIds}</p>}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección (opcional)</Label>              <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
          </div>

          {/* ✅ Footer fijo en la parte inferior */}
          <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Usuario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
