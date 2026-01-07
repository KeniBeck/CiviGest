import { useState } from "react";
import { Edit, Trash, UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Filters } from "@/components/common/Filters";
import { DataTable } from "@/components/common/DataTable";
import { useUsers, useDeleteUser } from "@/hooks/queries/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sedeService } from "@/services/sede.service";
import { subsedeService } from "@/services/subsede.service";
import type { User } from "@/types/user.types";
import type { Sede } from "@/types/sede.types";
import type { Subsede } from "@/types/subsede.types";
import type { Column } from "@/components/common/DataTable";

const UsersPage = () => {
  const currentUser = useAuthStore((state) => state.user);

  // ✅ Determinar rol del usuario autenticado
  const isSuperAdmin = currentUser?.roles.some((r) =>
    r.toLowerCase().includes("super")
  );
  const isEstatal = currentUser?.accessLevel === "SEDE" && !isSuperAdmin;

  // ✅ Estado de filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    isActive: undefined as boolean | undefined,
    sedeId: undefined as number | undefined,
    subsedeId: undefined as number | undefined,
  });

  // ✅ Debounce para búsqueda
  const debouncedSearch = useDebounce(filters.search, 500);

  // ✅ Query de usuarios - solo enviar parámetros si NO son undefined
  const { data, isLoading, error } = useUsers({
    page: filters.page,
    limit: filters.limit,
    search: debouncedSearch,
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters.sedeId !== undefined && { sedeId: filters.sedeId }),
    ...(filters.subsedeId !== undefined && { subsedeId: filters.subsedeId }),
  });

  const { mutate: deleteUser } = useDeleteUser();

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      deleteUser(id);
    }
  };

  // ✅ Helper para colores de roles
  const getRoleVariant = (level: string) => {
    switch (level) {
      case "SUPER_ADMIN":
        return "destructive";
      case "ESTATAL":
        return "default";
      case "MUNICIPAL":
        return "secondary";
      case "OPERATIVO":
        return "outline";
      default:
        return "default";
    }
  };

  // ✅ Columnas dinámicas según rol
  const columns: Column<User>[] = [
    {
      header: "Nombre",
      accessor: (row) => (
        <div>
          <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Usuario",
      accessor: "username",
    },
    {
      header: "Documento",
      accessor: (row) => (
        <span className="text-sm">
          {row.documentType}: {row.documentNumber}
        </span>
      ),
    },
    {
      header: "Roles",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((r, idx) => (
            <Badge key={idx} variant={getRoleVariant(r.role.level)}>
              {r.role.name}
            </Badge>
          ))}
        </div>
      ),
    },

    // ✅ Columna ESTADO (sede) - solo para SUPER_ADMIN
    ...(isSuperAdmin
      ? [
          {
            header: "Estado",
            accessor: (row: User) => row.sede?.name || "-",
          },
        ]
      : []),

    // ✅ Columna MUNICIPIO (subsede) - para SUPER_ADMIN y ESTATAL
    ...(isSuperAdmin || isEstatal
      ? [
          {
            header: "Municipio",
            accessor: (row: User) => row.subsede?.name || "Sistema",
          },
        ]
      : []),

    {
      header: "Estado",
      accessor: (row) => (
        <Badge variant={row.isActive ? "default" : "destructive"}>
          {row.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  // ✅ Configurar filtros dinámicamente según rol
  const filterConfigs = [
    // ✅ 1. BÚSQUEDA - Todos los roles
    {
      name: "search",
      label: "Buscar",
      type: "search" as const,
      placeholder: "Buscar por nombre, email, usuario...",
      value: filters.search,
      onChange: (value: string) =>
        setFilters((prev) => ({ ...prev, search: value, page: 1 })),
    },

    // ✅ 2. ESTADO ACTIVO/INACTIVO - Todos los roles
    {
      name: "isActive",
      label: "Estado",
      type: "select" as const,
      placeholder: "Todos los estados",
      options: [
        { label: "Todos", value: "0" },
        { label: "Activos", value: "true" },
        { label: "Inactivos", value: "false" },
      ],
      value: filters.isActive === undefined ? "0" : String(filters.isActive),
      onChange: (value: string) =>
        setFilters((prev) => ({
          ...prev,
          isActive: value === "0" ? undefined : value === "true",
          page: 1,
        })),
    },

    // ✅ 3. FILTRO ESTADO (sede) - Solo SUPER_ADMIN
    ...(isSuperAdmin
      ? [
          {
            name: "sedeId",
            label: "Estado",
            type: "searchable-select" as const,
            placeholder: "Seleccionar estado",
            value: filters.sedeId || "0",
            onChange: (value: string) =>
              setFilters((prev) => ({
                ...prev,
                sedeId: value === "0" ? undefined : Number(value),
                subsedeId: undefined, // Reset subsede cuando cambia sede
                page: 1,
              })),
            queryKey: ["sedes-filter"],
            queryFn: async ({
              page,
              search,
              limit,
            }: {
              page: number;
              search: string;
              limit: number;
            }) => {
              const response = await sedeService.getAll({
                page,
                search,
                limit,
              });
              return response.data;
            },
            getOptionLabel: (item: Sede) => item.name,
            getOptionValue: (item: Sede) => item.id,
          },
        ]
      : []),

    // ✅ 4. FILTRO MUNICIPIO (subsede) - SUPER_ADMIN y ESTATAL
    ...(isSuperAdmin || isEstatal
      ? [
          {
            name: "subsedeId",
            label: "Municipio",
            type: "searchable-select" as const,
            placeholder: "Seleccionar municipio",
            value: filters.subsedeId || "0",
            onChange: (value: string) =>
              setFilters((prev) => ({
                ...prev,
                subsedeId: value === "0" ? undefined : Number(value),
                page: 1,
              })),
            queryKey: [
              "subsedes-filter",
              ...(filters.sedeId ? [filters.sedeId] : []),
            ],
            queryFn: async ({
              page,
              search,
              limit,
            }: {
              page: number;
              search: string;
              limit: number;
            }) => {
              const params = {
                page,
                search,
                limit,
                ...(filters.sedeId && { sedeId: filters.sedeId }),
              };
              const response = await subsedeService.getAll(params);
              return response.data;
            },
            getOptionLabel: (item: Subsede) => item.name,
            getOptionValue: (item: Subsede) => item.id,
          },
        ]
      : []),
  ];

  const users = data?.items || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    totalPages: 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button className="shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.95)]">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* ✅ Filtros dinámicos según rol */}
      <Filters filters={filterConfigs} />

      {/* ✅ Tabla con columnas dinámicas */}
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.itemsPerPage}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) =>
          setFilters((prev) => ({ ...prev, limit, page: 1 }))
        }
        actions={(user) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-red-600"
              onClick={() => handleDelete(user.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default UsersPage;
