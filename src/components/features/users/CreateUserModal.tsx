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
import { useCreateUser } from '@/hooks/queries/useUsers';
import { useRoles } from '@/hooks/queries/useRoles';
import { useSubsedesForAccess } from '@/hooks/queries/useSubsedes';
import { useUserLevel } from '@/hooks/useUserLevel';
import { useNotification } from '@/hooks/useNotification';
import { sedeService } from '@/services/sede.service';
import { subsedeService } from '@/services/subsede.service';
import type { CreateUserDto } from '@/types/user.types';
import type { Sede } from '@/types/sede.types';
import type { Subsede } from '@/types/subsede.types';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DOCUMENT_TYPES = [
  { value: 'CURP', label: 'CURP' },
  { value: 'RFC', label: 'RFC' },
  { value: 'INE', label: 'INE' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'VISA', label: 'Visa' },
];

export const CreateUserModal = ({ open, onOpenChange }: CreateUserModalProps) => {
  // ✅ Hooks centralizados
  const notify = useNotification();
  const { userLevel, currentUser, canEditSede, canEditAccessLevel } = useUserLevel();
  const { mutate: createUser, isPending } = useCreateUser();
  const { data: rolesData } = useRoles({ isActive: true });
  
  const [selectedSedeId, setSelectedSedeId] = useState<number | undefined>(
    userLevel === 'ESTATAL' ? currentUser?.sedeId : undefined
  );
  
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
        return roles; // Puede ver todos
      case 'ESTATAL':
        return roles.filter(r => r.level !== 'SUPER_ADMIN'); // No puede crear super admins
      case 'MUNICIPAL':
        return roles.filter(r => r.level === 'MUNICIPAL' || r.level === 'OPERATIVO'); // Solo municipal y operativo
      default:
        return []; // Operativo no puede crear usuarios
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
        return [{ value: 'SUBSEDE', label: 'Municipal (Subsede)' }]; // Solo municipal
      default:
        return [];
    }
  }, [userLevel]);

  // ✅ Estado del formulario con valores por defecto según el usuario
  const getInitialFormData = (): Partial<CreateUserDto> => {
    const baseData = {
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      phoneCountryCode: '+52',
      documentType: 'CURP' as const,
      documentNumber: '',
      roleIds: [] as number[],
      address: '',
      accessLevel: 'SUBSEDE' as const, // Por defecto Municipal
      sedeId: userLevel === 'ESTATAL' ? currentUser?.sedeId || 0 : 0,
    };

    return baseData;
  };

  const [formData, setFormData] = useState<Partial<CreateUserDto>>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Reset form cuando se cierra
  useEffect(() => {
    if (!open) {
      setFormData(getInitialFormData());
      setErrors({});
      setSelectedSedeId(
        userLevel === 'ESTATAL' ? currentUser?.sedeId : undefined
      );
    }
  }, [open, userLevel, currentUser]);

  // ✅ Validación simple
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'El email es requerido';
    if (!formData.username) newErrors.username = 'El usuario es requerido';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!formData.firstName) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'El apellido es requerido';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'El teléfono es requerido';
    if (!formData.documentNumber) newErrors.documentNumber = 'El documento es requerido';
    if (!formData.roleIds || formData.roleIds.length === 0) {
      newErrors.roleIds = 'Debe seleccionar al menos un rol';
    }
    
    // Validar sede (excepto si es MUNICIPAL que usa automáticamente su sede)
    if (userLevel !== 'MUNICIPAL' && (!formData.sedeId || formData.sedeId === 0)) {
      newErrors.sedeId = 'Debe seleccionar un estado';
    }
    
    // ✅ Validar accesos según el NIVEL DE ACCESO seleccionado en el formulario
    if (formData.accessLevel === 'SUBSEDE') {
      // Si el nivel es SUBSEDE (Municipal)
      if (userLevel === 'MUNICIPAL') {
        // Si es MUNICIPAL, no validar subsedeId porque se asigna automáticamente
        // El backend usará currentUser.subsedeId
      } else {
        // Si es SUPER_ADMIN o ESTATAL, debe seleccionar un municipio
        if (!formData.subsedeId) {
          newErrors.subsedeId = 'Debe seleccionar un municipio';
        }
      }
    } else if (formData.accessLevel === 'SEDE') {
      // Si el nivel es SEDE (Estatal), debe seleccionar al menos un municipio (accesos múltiples)
      if (!formData.subsedeAccessIds || formData.subsedeAccessIds.length === 0) {
        newErrors.subsedeAccessIds = 'Debe seleccionar al menos un municipio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // ✅ Limpiar datos según el NIVEL DE ACCESO seleccionado en el formulario
    const dataToSubmit = { ...formData } as CreateUserDto;
    
    // ✅ Si es MUNICIPAL, asignar automáticamente sedeId y subsedeId del usuario logueado
    if (userLevel === 'MUNICIPAL') {
      dataToSubmit.sedeId = currentUser?.sedeId || 0;
      dataToSubmit.subsedeId = currentUser?.subsedeId || 0;
    }
    
    if (formData.accessLevel === 'SUBSEDE') {
      // Si es SUBSEDE (Municipal), NO enviar subsedeAccessIds (solo usar subsedeId)
      delete dataToSubmit.subsedeAccessIds;
    } else if (formData.accessLevel === 'SEDE') {
      // Si es SEDE (Estatal), NO enviar subsedeId (solo usar subsedeAccessIds)
      delete dataToSubmit.subsedeId;
    }
    
    console.log('📤 Enviando datos al backend:', dataToSubmit);
    
    createUser(dataToSubmit, {
      onSuccess: () => {
        notify.success('Usuario Creado', 'El usuario se ha creado correctamente');
        onOpenChange(false);
      },
      onError: (error: any) => {
        console.error('Error al crear usuario:', error);
        notify.apiError(error);
        setErrors({
          submit: error?.response?.data?.message || 'Error al crear el usuario',
        });
      },
    });
  };

  // ✅ Handle input change
  const handleChange = (field: keyof CreateUserDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Complete los datos para registrar un nuevo usuario en el sistema
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Contenedor con scroll personalizado */}
        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-4">
          {/* ✅ Error general */}
          {errors.submit && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
              {errors.submit}
            </div>
          )}

          {/* ✅ Grid 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={formData.email}
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
                placeholder="nombre.usuario"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && <p className="text-xs text-red-600">{errors.username}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
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
                placeholder="Juan"
                value={formData.firstName}
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
                placeholder="Pérez"
                value={formData.lastName}
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
                placeholder="5512345678"
                value={formData.phoneNumber}
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
                placeholder="ABCD123456XYZ"
                value={formData.documentNumber}
                onChange={(e) => handleChange('documentNumber', e.target.value)}
                className={errors.documentNumber ? 'border-red-500' : ''}
              />
              {errors.documentNumber && (
                <p className="text-xs text-red-600">{errors.documentNumber}</p>
              )}
            </div>

            {/* ✅ Nivel de Acceso - Solo si puede editarlo */}
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

            {/* ✅ Estado (Sede) - Solo SUPER_ADMIN puede cambiar el estado */}
            {canEditSede && (
              <div className="space-y-2">
                <Label>Estado *</Label>
                <SearchableSelect
                  placeholder="Seleccionar estado"
                  value={selectedSedeId || 0}
                  onChange={(value) => {
                    setSelectedSedeId(Number(value));
                    handleChange('sedeId', Number(value));
                  }}
                  queryKey={['sedes-modal-create-user']}
                  queryFn={async ({ page, search, limit }) => {
                    const response = await sedeService.getAll({
                      page,
                      search,
                      limit,
                    });
                    return response.data;
                  }}
                  getOptionLabel={(item: Sede) => item.name}
                  getOptionValue={(item: Sede) => item.id}
                  className={errors.sedeId ? 'border-red-500' : ''}
                />
                {errors.sedeId && <p className="text-xs text-red-600">{errors.sedeId}</p>}
              </div>
            )}

          </div>

          {/* ✅ Mostrar estado asignado si es ESTATAL (no editable) */}
          {userLevel === 'ESTATAL' && currentUser?.sedeId && (
            <div className="space-y-2">
              <Label>Estado Asignado</Label>
              <div className="p-3 neomorph-flat rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  ✓ Los usuarios que crees tendrán acceso a los municipios de tu estado
                </p>
              </div>
            </div>
          )}

          {/* ✅ Mostrar estado y municipio asignado si es MUNICIPAL (no editable) */}
          {userLevel === 'MUNICIPAL' && currentUser?.sedeId && currentUser?.subsedeId && (
            <div className="space-y-2">
              <Label>Estado y Municipio Asignado</Label>
              <div className="p-3 neomorph-flat rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  ✓ Los usuarios que crees tendrán acceso automáticamente a tu municipio
                </p>
              </div>
            </div>
          )}

        {/* ✅ SELECTOR DE MUNICIPIO ÚNICO - Cuando el Nivel de Acceso seleccionado es SUBSEDE (Municipal) */}
        {formData.accessLevel === 'SUBSEDE' && (
          <div className="space-y-2">
            {userLevel === 'MUNICIPAL' ? (
              // ✅ Si es MUNICIPAL, mostrar el municipio asignado (no editable)
              <>
                <Label>Municipio Asignado</Label>
                <div className="p-3 neomorph-flat rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    ✓ El usuario que crees tendrá acceso a tu municipio
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Los usuarios creados heredarán tu estado y municipio automáticamente
                  </p>
                </div>
              </>
            ) : (
              // ✅ Si es SUPER_ADMIN o ESTATAL, puede seleccionar el municipio
              <>
                <Label>Municipio *</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Seleccione el municipio al que tendrá acceso este usuario
                </p>
                <SearchableSelect
                  placeholder="Seleccionar municipio"
                  value={formData.subsedeId || 0}
                  onChange={(value) => handleChange('subsedeId', Number(value))}
                  queryKey={['subsedes-modal-create-user-municipal', selectedSedeId || currentUser?.sedeId || 'all']}
                  queryFn={async ({ page, search, limit }) => {
                    const params: any = { page, search, limit };
                    // Filtrar por sede según el usuario autenticado
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
              </>
            )}
          </div>
        )}

        {/* ✅ CHECKBOXES MÚLTIPLES - Cuando el Nivel de Acceso seleccionado es SEDE (Estatal) */}
        {formData.accessLevel === 'SEDE' && (
          <div className="space-y-2">
            <Label>
              Accesos a Municipios {userLevel === 'ESTATAL' ? '*' : '(opcional)'}
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              {userLevel === 'ESTATAL'
                ? 'Seleccione los municipios de su estado a los que el usuario tendrá acceso'
                : selectedSedeId 
                  ? 'Seleccione los municipios a los que el usuario tendrá acceso'
                  : 'Primero seleccione un estado para ver sus municipios'}
            </p>
            {!selectedSedeId && userLevel === 'SUPER_ADMIN' ? (
              <div className="p-4 neomorph-flat rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ Debe seleccionar un estado primero para ver los municipios disponibles
                </p>
              </div>
            ) : loadingSubsedes ? (
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
                No hay municipios disponibles para el estado seleccionado
              </p>
            )}
            {errors.subsedeAccessIds && (
              <p className="text-xs text-red-600">{errors.subsedeAccessIds}</p>
            )}
          </div>
        )}

          {/* ✅ Roles (checkbox múltiple) - Filtrados según permisos */}
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

          {/* ✅ Dirección (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección (opcional)</Label>
            <Input
              id="address"
              placeholder="Calle, número, colonia..."
              value={formData.address}
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
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
