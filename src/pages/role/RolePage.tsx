import { useState } from "react";
import { Plus, Pencil, Trash2, Power, Lock, Shield } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useRoles,
  useDeleteRole,
  useToggleRole,
} from "@/hooks/queries/useRoles";
import { useNotification } from "@/hooks/useNotification";
import { useUserLevel } from "@/hooks/useUserLevel";
import type { Role } from "@/types/role.types";
import CreateRoleModal from "@/components/features/roles/CreateRoleModal";
import EditRoleModal from "@/components/features/roles/EditRoleModal";
import ManageRolePermissionsModal from "@/components/features/roles/ManageRolePermissionsModal";

const RolePage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [managingPermissionsRole, setManagingPermissionsRole] =
    useState<Role | null>(null);
  
  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: number; name: string; isGlobal: boolean } | null>(null);
  const [roleToToggle, setRoleToToggle] = useState<{ id: number; name: string; isActive: boolean; isGlobal: boolean } | null>(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useRoles({
    page,
    limit: pageSize,
    search,
    includePermissions: true,
  });
  const deleteRole = useDeleteRole();
  const toggleRole = useToggleRole();
  const notify = useNotification();
  const { userLevel } = useUserLevel();

  // ✅ Solo SUPER_ADMIN puede modificar roles globales
  const canModifyRole = (role: Role): boolean => {
    if (userLevel === "SUPER_ADMIN") return true;
    return !role.isGlobal;
  };

  const levelBadgeVariant = (level: Role["level"]) => {
    const variants: Record<
      Role["level"],
      "destructive" | "default" | "secondary" | "outline"
    > = {
      SUPER_ADMIN: "destructive",
      ESTATAL: "default",
      MUNICIPAL: "secondary",
      OPERATIVO: "outline",
    };
    return variants[level];
  };

  const levelLabel = (level: Role["level"]) => {
    const labels: Record<Role["level"], string> = {
      SUPER_ADMIN: "Super Admin",
      ESTATAL: "Estatal",
      MUNICIPAL: "Municipal",
      OPERATIVO: "Operativo",
    };
    return labels[level];
  };

  const handleDelete = async (role: Role) => {
    // ✅ Validar si puede modificar roles globales
    if (role.isGlobal && userLevel !== "SUPER_ADMIN") {
      notify.warning(
        "Acción No Permitida",
        "Solo los Super Administradores pueden eliminar roles globales"
      );
      return;
    }

    setRoleToDelete({ id: role.id, name: role.name, isGlobal: role.isGlobal });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!roleToDelete) return;

    deleteRole.mutate(roleToDelete.id, {
      onSuccess: () => {
        notify.success(
          "Rol Eliminado",
          `El rol "${roleToDelete.name}" ha sido eliminado correctamente`
        );
        setRoleToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleToggle = async (role: Role) => {
    // ✅ Validar si puede modificar roles globales
    if (role.isGlobal && userLevel !== "SUPER_ADMIN") {
      notify.warning(
        "Acción No Permitida",
        "Solo los Super Administradores pueden modificar roles globales"
      );
      return;
    }

    setRoleToToggle({ 
      id: role.id, 
      name: role.name, 
      isActive: role.isActive, 
      isGlobal: role.isGlobal 
    });
    setToggleConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!roleToToggle) return;

    toggleRole.mutate(roleToToggle.id, {
      onSuccess: () => {
        const action = roleToToggle.isActive ? "desactivado" : "activado";
        notify.success(
          "Estado Actualizado",
          `El rol "${roleToToggle.name}" ha sido ${action} correctamente`
        );
        setRoleToToggle(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  const handleEdit = (role: Role) => {
    // ✅ Validar si puede modificar roles globales
    if (role.isGlobal && userLevel !== "SUPER_ADMIN") {
      notify.warning(
        "Acción No Permitida",
        "Solo los Super Administradores pueden editar roles globales"
      );
      return;
    }
    setEditingRole(role);
  };

  const columns: Column<Role>[] = [
    {
      header: "ID",
      accessor: (role) => <span className="font-medium">#{role.id}</span>,
    },
    {
      header: "Nombre",
      accessor: (role) => (
        <div>
          <div className="font-medium">{role.name}</div>
          <div className="text-sm text-muted-foreground">
            {role.description}
          </div>
        </div>
      ),
    },
    {
      header: "Nivel",
      accessor: (role) => (
        <Badge variant={levelBadgeVariant(role.level)}>
          {levelLabel(role.level)}
        </Badge>
      ),
    },
    {
      header: "Alcance",
      accessor: (role) => (
        <Badge variant={role.isGlobal ? "default" : "secondary"}>
          {role.isGlobal ? "Global" : "Local"}
        </Badge>
      ),
    },
    {
      header: "Estado",
      accessor: (role) => (
        <Badge variant={role.isActive ? "default" : "secondary"}>
          {role.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: "Permisos",
      accessor: (role) => (
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
          {role.permissions?.length || 0} permisos
        </Badge>
      ),
    },
  ];

  const renderActions = (role: Role) => {
    const canModify = canModifyRole(role);
    const isGlobalRole = role.isGlobal;

    return (
      <div className="flex items-center gap-2">
        {/* Mostrar ícono de candado para roles globales si no es SUPER_ADMIN */}
        {isGlobalRole && userLevel !== "SUPER_ADMIN" && (
          <div
            className="flex items-center text-gray-400"
            title="Rol global - Solo SUPER_ADMIN"
          >
            <Lock className="h-4 w-4" />
          </div>
        )}

        {/* Botón de permisos */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setManagingPermissionsRole(role)}
          title="Gestionar permisos"
          className="hover:bg-purple-50 hover:text-purple-600"
        >
          <Shield className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEdit(role)}
          disabled={deleteRole.isPending || toggleRole.isPending || !canModify}
          title={
            !canModify
              ? "Solo SUPER_ADMIN puede editar roles globales"
              : "Editar rol"
          }
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleToggle(role)}
          disabled={deleteRole.isPending || toggleRole.isPending || !canModify}
          title={
            !canModify
              ? "Solo SUPER_ADMIN puede modificar roles globales"
              : "Activar/Desactivar"
          }
          className={
            role.isActive
              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              : "text-green-600 hover:text-green-700 hover:bg-green-50"
          }
        >
          <Power className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDelete(role)}
          disabled={deleteRole.isPending || toggleRole.isPending || !canModify}
          title={
            !canModify
              ? "Solo SUPER_ADMIN puede eliminar roles globales"
              : "Eliminar rol"
          }
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">
            Gestiona los roles del sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Rol
        </Button>
      </div>

      <DataTable
        data={data?.items || []}
        columns={columns}
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
        searchPlaceholder="Buscar roles..."
      />

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {editingRole && (
        <EditRoleModal
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          role={editingRole}
        />
      )}

      {managingPermissionsRole && (
        <ManageRolePermissionsModal
          isOpen={!!managingPermissionsRole}
          onClose={() => setManagingPermissionsRole(null)}
          role={managingPermissionsRole}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Rol"
        description={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        isLoading={deleteRole.isPending}
      />

      {/* Diálogo de confirmación para toggle */}
      <ConfirmDialog
        open={toggleConfirmOpen}
        onOpenChange={setToggleConfirmOpen}
        title={roleToToggle?.isActive ? "Desactivar Rol" : "Activar Rol"}
        description={`¿Estás seguro de que deseas ${roleToToggle?.isActive ? "desactivar" : "activar"} el rol "${roleToToggle?.name}"?`}
        confirmText={roleToToggle?.isActive ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={roleToToggle?.isActive ? "warning" : "success"}
        onConfirm={confirmToggle}
        isLoading={toggleRole.isPending}
      />
    </div>
  );
};

export default RolePage;
