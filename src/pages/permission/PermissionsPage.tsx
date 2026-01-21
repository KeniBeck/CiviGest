import { useState } from 'react';
import { Plus, Pencil, Trash2, Power, Shield, XCircle, CheckCircle2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  usePermissions,
  useDeletePermission,
  useActivatePermission,
  useDeactivatePermission,
} from '@/hooks/queries/usePermissions';
import { useNotification } from '@/hooks/useNotification';
import { useUserLevel } from '@/hooks/useUserLevel';
import type { Permission } from '@/types/permission.type'; 
import CreatePermissionModal from '@/components/features/permissions/CreatePermissionModal';
import EditPermissionModal from '@/components/features/permissions/EditPermissionModal';

const PermissionsPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<{ id: number; name: string } | null>(null);
  const [permissionToToggle, setPermissionToToggle] = useState<{ id: number; name: string; isActive: boolean } | null>(null);

  const { data, isLoading } = usePermissions({
    page,
    limit: pageSize,
    search,
  });

  const deletePermission = useDeletePermission();
  const activatePermission = useActivatePermission();
  const deactivatePermission = useDeactivatePermission();
  const notify = useNotification();
  const { userLevel } = useUserLevel();

  // ✅ Solo SUPER_ADMIN puede gestionar permisos
  const canManage = userLevel === 'SUPER_ADMIN';

  const handleDelete = async (permission: Permission) => {
    if (!canManage) {
      notify.warning(
        'Acción No Permitida',
        'Solo los Super Administradores pueden eliminar permisos'
      );
      return;
    }

    setPermissionToDelete({ 
      id: permission.id, 
      name: `${permission.resource}:${permission.action}` 
    });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!permissionToDelete) return;

    deletePermission.mutate(permissionToDelete.id, {
      onSuccess: () => {
        notify.success(
          'Permiso Eliminado',
          `El permiso "${permissionToDelete.name}" ha sido eliminado correctamente`
        );
        setPermissionToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleToggle = async (permission: Permission) => {
    if (!canManage) {
      notify.warning(
        'Acción No Permitida',
        'Solo los Super Administradores pueden modificar permisos'
      );
      return;
    }

    setPermissionToToggle({ 
      id: permission.id, 
      name: `${permission.resource}:${permission.action}`,
      isActive: permission.isActive 
    });
    setToggleConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!permissionToToggle) return;

    const mutation = permissionToToggle.isActive ? deactivatePermission : activatePermission;

    mutation.mutate(permissionToToggle.id, {
      onSuccess: () => {
        const estado = permissionToToggle.isActive ? 'desactivado' : 'activado';
        notify.success(
          'Estado Actualizado',
          `El permiso "${permissionToToggle.name}" ha sido ${estado} correctamente`
        );
        setPermissionToToggle(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleEdit = (permission: Permission) => {
    if (!canManage) {
      notify.warning(
        'Acción No Permitida',
        'Solo los Super Administradores pueden editar permisos'
      );
      return;
    }
    setEditingPermission(permission);
  };

  const columns: Column<Permission>[] = [
    {
      header: 'ID',
      accessor: (permission) => <span className="font-medium text-muted-foreground">#{permission.id}</span>,
    },
    {
      header: 'Recurso',
      accessor: (permission) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{permission.resource}</span>
        </div>
      ),
    },
    {
      header: 'Acción',
      accessor: (permission) => (
        <Badge variant="outline" className="font-mono">
          {permission.action}
        </Badge>
      ),
    },
    {
      header: 'Descripción',
      accessor: (permission) => (
        <span className="text-sm text-muted-foreground">
          {permission.description || 'Sin descripción'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (permission) => (
        <Badge variant={permission.isActive ? 'default' : 'secondary'}>
          {permission.isActive ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Activo
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Inactivo
            </>
          )}
        </Badge>
      ),
    },
  ];

  const renderActions = (permission: Permission) => {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEdit(permission)}
          disabled={!canManage || deletePermission.isPending}
          title={!canManage ? "Solo SUPER_ADMIN puede editar permisos" : "Editar permiso"}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleToggle(permission)}
          disabled={
            !canManage ||
            deletePermission.isPending ||
            activatePermission.isPending ||
            deactivatePermission.isPending
          }
          title={!canManage ? "Solo SUPER_ADMIN puede modificar permisos" : "Activar/Desactivar"}
          className={
            permission.isActive
              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              : "text-green-600 hover:text-green-700 hover:bg-green-50"
          }
        >
          <Power className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDelete(permission)}
          disabled={!canManage || deletePermission.isPending}
          title={!canManage ? "Solo SUPER_ADMIN puede eliminar permisos" : "Eliminar permiso"}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permisos</h1>
          <p className="text-muted-foreground">
            Gestiona los permisos del sistema
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Permiso
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      {data?.stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Permisos</p>
                <p className="text-2xl font-bold">{data.pagination.totalItems}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.stats.totalActive}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-gray-500">
                  {data.stats.totalInactive}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recursos</p>
                <p className="text-2xl font-bold">
                  {data.stats.totalResources}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        currentPage={data?.pagination.currentPage || 1}
        totalPages={data?.pagination.totalPages || 1}
        totalItems={data?.pagination.totalItems || 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        actions={renderActions}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar permisos..."
      />

      {/* Modales */}
      <CreatePermissionModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {editingPermission && (
        <EditPermissionModal
          isOpen={!!editingPermission}
          onClose={() => setEditingPermission(null)}
          permission={editingPermission}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Permiso"
        description={`¿Estás seguro de que deseas eliminar el permiso "${permissionToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        isLoading={deletePermission.isPending}
      />

      {/* Diálogo de confirmación para toggle */}
      <ConfirmDialog
        open={toggleConfirmOpen}
        onOpenChange={setToggleConfirmOpen}
        title={permissionToToggle?.isActive ? "Desactivar Permiso" : "Activar Permiso"}
        description={`¿Estás seguro de que deseas ${permissionToToggle?.isActive ? "desactivar" : "activar"} el permiso "${permissionToToggle?.name}"?`}
        confirmText={permissionToToggle?.isActive ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={permissionToToggle?.isActive ? "warning" : "success"}
        onConfirm={confirmToggle}
        isLoading={activatePermission.isPending || deactivatePermission.isPending}
      />
    </div>
  );
};

export default PermissionsPage;
