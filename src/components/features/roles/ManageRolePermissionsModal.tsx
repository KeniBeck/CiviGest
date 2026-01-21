import { useState, useEffect, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { useRolePermissions, useSyncPermissions } from '@/hooks/queries/useRoles';
import { usePermissions } from '@/hooks/queries/usePermissions';
import { useNotification } from '@/hooks/useNotification';
import { useUserLevel } from '@/hooks/useUserLevel';
import type { Role } from '@/types/role.types';
import type { Permission } from '@/types/permission.type'; 

interface ManageRolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

const ManageRolePermissionsModal = ({ isOpen, onClose, role }: ManageRolePermissionsModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  const { data: rolePermissions, isLoading: loadingRolePermissions } = useRolePermissions(role.id);
  const { data: allPermissionsData, isLoading: loadingAllPermissions } = usePermissions({ 
    limit: 1000, 
    isActive: true 
  });
  const syncPermissions = useSyncPermissions();
  const notify = useNotification();
  const { userLevel } = useUserLevel();

  // ✅ Solo SUPER_ADMIN puede modificar roles globales
  const canModify = userLevel === 'SUPER_ADMIN' || !role.isGlobal;

  // Cargar permisos actuales del rol
  useEffect(() => {
    if (rolePermissions && isOpen) {

      let permissionIds: number[] = [];
      
      // Caso 1: Array directo de IDs o permisos
      if (Array.isArray(rolePermissions)) {
        permissionIds = rolePermissions
          .filter((rp: any) => {
            // Si es un objeto con permission.id
            if (rp?.permission?.id) return true;
            // Si es un objeto con solo id
            if (rp?.id) return true;
            // Si es un número directo
            if (typeof rp === 'number') return true;
            return false;
          })
          .map((rp: any) => {
            if (rp?.permission?.id) return rp.permission.id;
            if (rp?.id) return rp.id;
            return rp;
          });
      }
      // Caso 2: Objeto con propiedad data o items
      else if (rolePermissions?.data || rolePermissions?.items) {
        const dataArray = rolePermissions.data || rolePermissions.items;
        if (Array.isArray(dataArray)) {
          permissionIds = dataArray
            .filter((rp: any) => rp?.permission?.id || rp?.id || typeof rp === 'number')
            .map((rp: any) => {
              if (rp?.permission?.id) return rp.permission.id;
              if (rp?.id) return rp.id;
              return rp;
            });
        }
      }
      // Caso 3: Array de IDs directos en alguna propiedad
      else if (rolePermissions?.permissionIds) {
        permissionIds = rolePermissions.permissionIds;
      }
      
      setSelectedPermissions(new Set(permissionIds));
    }
  }, [rolePermissions, isOpen]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setResourceFilter('all');
    }
  }, [isOpen]);

  // Obtener recursos únicos para filtros
  const availableResources = useMemo(() => {
    if (!allPermissionsData?.items) return [];
    const resources = new Set(allPermissionsData.items.map((p: Permission) => p.resource));
    return Array.from(resources).sort();
  }, [allPermissionsData]);

  // Filtrar permisos
  const filteredPermissions = useMemo(() => {
    if (!allPermissionsData?.items) return [];
    
    let filtered = allPermissionsData.items;

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((p: Permission) =>
        p.resource.toLowerCase().includes(searchLower) ||
        p.action.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por recurso
    if (resourceFilter !== 'all') {
      filtered = filtered.filter((p: Permission) => p.resource === resourceFilter);
    }

    return filtered;
  }, [allPermissionsData, search, resourceFilter]);

  // Agrupar permisos por recurso
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    
    filteredPermissions.forEach((permission: Permission) => {
      if (!groups[permission.resource]) {
        groups[permission.resource] = [];
      }
      groups[permission.resource].push(permission);
    });

    return groups;
  }, [filteredPermissions]);

  const handleTogglePermission = (permissionId: number) => {
    if (!canModify) {
      notify.warning('Acción No Permitida', 'Solo SUPER_ADMIN puede modificar permisos de roles globales');
      return;
    }

    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (resource: string) => {
    if (!canModify) return;

    const resourcePermissions = groupedPermissions[resource];
    const allSelected = resourcePermissions.every(p => selectedPermissions.has(p.id));

    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      resourcePermissions.forEach(p => {
        if (allSelected) {
          newSet.delete(p.id);
        } else {
          newSet.add(p.id);
        }
      });
      return newSet;
    });
  };

  const handleSave = () => {
    if (!canModify) {
      notify.warning('Acción No Permitida', 'Solo SUPER_ADMIN puede modificar permisos de roles globales');
      return;
    }

    // Calcular cuántos permisos se agregarán/removerán
    const currentPermissionIds = new Set<number>();
    if (rolePermissions) {
      if (Array.isArray(rolePermissions)) {
        rolePermissions.forEach((rp: any) => {
          const id = rp?.permission?.id || rp?.id || rp;
          if (id) currentPermissionIds.add(id);
        });
      } else if (rolePermissions?.data || rolePermissions?.items) {
        const dataArray = rolePermissions.data || rolePermissions.items;
        if (Array.isArray(dataArray)) {
          dataArray.forEach((rp: any) => {
            const id = rp?.permission?.id || rp?.id || rp;
            if (id) currentPermissionIds.add(id);
          });
        }
      }
    }

    const newPermissionIds = Array.from(selectedPermissions);
    const added = newPermissionIds.filter(id => !currentPermissionIds.has(id)).length;
    const removed = Array.from(currentPermissionIds).filter(id => !selectedPermissions.has(id)).length;

    syncPermissions.mutate(
      { roleId: role.id, permissionIds: newPermissionIds },
      {
        onSuccess: (data: any) => {
          // Intentar obtener datos del backend, si no, usar los calculados
          const addedCount = data?.data?.added ?? data?.added ?? added;
          const removedCount = data?.data?.removed ?? data?.removed ?? removed;
          
          if (addedCount === 0 && removedCount === 0) {
            notify.success(
              'Permisos Sincronizados',
              'No se realizaron cambios en los permisos del rol'
            );
          } else {
            notify.success(
              'Permisos Actualizados',
              `Se agregaron ${addedCount} y removieron ${removedCount} permisos exitosamente`
            );
          }
          onClose();
        },
        onError: (error) => {
          notify.apiError(error);
        },
      }
    );
  };

  const isLoading = loadingRolePermissions || loadingAllPermissions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Gestionar Permisos del Rol</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <DialogDescription className="mb-0">
                  Rol: <strong>{role.name}</strong>
                </DialogDescription>
                {role.isGlobal && (
                  <Badge variant="default" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Global
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedPermissions.size} permisos seleccionados
            </div>
          </div>
        </DialogHeader>

        {/* Alerta si no puede modificar */}
        {!canModify && (
          <div className="mx-6 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Solo Lectura:</strong> Solo Super Administradores pueden modificar permisos de roles globales.
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="px-6 py-4 border-b space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar permisos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los recursos</option>
              {availableResources.map(resource => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Cargando permisos...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                <div key={resource} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                      {resource}
                      <Badge variant="outline">{permissions.length}</Badge>
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(resource)}
                      disabled={!canModify}
                    >
                      {permissions.every(p => selectedPermissions.has(p.id))
                        ? 'Deseleccionar todos'
                        : 'Seleccionar todos'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map((permission) => {
                      const isSelected = selectedPermissions.has(permission.id);
                      return (
                        <div
                          key={permission.id}
                          onClick={() => handleTogglePermission(permission.id)}
                          className={`
                            p-3 border rounded-lg cursor-pointer transition-all
                            ${isSelected
                              ? 'bg-blue-50 border-blue-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                            }
                            ${!canModify && 'opacity-60 cursor-not-allowed'}
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {isSelected ? (
                                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-300" />
                                )}
                                {permission.action}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredPermissions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron permisos</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={syncPermissions.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={syncPermissions.isPending || !canModify}
          >
            {syncPermissions.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageRolePermissionsModal;
