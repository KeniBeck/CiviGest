import { useState } from "react";
import { Trash, MapPin } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useSedes, useDeleteSede } from "@/hooks/queries/useSedes";
import { useNotification } from "@/hooks/useNotification";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sede } from "@/types/sede.types";
import type { Column } from "@/components/common/DataTable";
import { CollapsibleFilters } from "@/components/common/CollapsibleFilters";

const SedesPage = () => {
  const notify = useNotification();
  // ✅ Estado de filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    isActive: undefined as boolean | undefined,
  });

  // Estados para ConfirmDialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sedeToDelete, setSedeToDelete] = useState<{ id: number; name: string } | null>(null);

  // ✅ Debounce para búsqueda
  const debouncedSearch = useDebounce(filters.search, 500);

  // ✅ Query de sedes - solo enviar parámetros si NO son undefined
  const { data, isLoading, error } = useSedes({
    page: filters.page,
    limit: filters.limit,
    search: debouncedSearch,
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
  });

  const { mutate: deleteSede, isPending: isDeleting } = useDeleteSede();

  const handleDelete = (sede: Sede) => {
    setSedeToDelete({ id: sede.id, name: sede.name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!sedeToDelete) return;

    deleteSede(sedeToDelete.id, {
      onSuccess: () => {
        notify.success('Sede Eliminada', 'La sede se ha eliminado correctamente');
        setSedeToDelete(null);
      },
      onError: (error) => {
        notify.apiError(error);
      },
    });
  };

  // ✅ Columnas de la tabla
  const columns: Column<Sede>[] = [
    {
      header: "Nombre",
      accessor: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">Código: {row.code}</div>
        </div>
      ),
    },
    {
      header: "Código",
      accessor: "code",
    },
    {
      header: "Subsedes",
      accessor: (row) => (
        <span className="text-sm">{row._count?.subsedes || 0}</span>
      ),
    },
    {
      header: "Usuarios",
      accessor: (row) => (
        <span className="text-sm">{row._count?.users || 0}</span>
      ),
    },
    {
      header: "Estado",
      accessor: (row) => (
        <Badge variant={row.isActive ? "default" : "destructive"}>
          {row.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  // ✅ Configuración de filtros
  const filterConfigs = [
    {
      name: "search",
      label: "Buscar",
      type: "search" as const,
      placeholder: "Buscar por nombre o código...",
      value: filters.search,
      onChange: (value: string) =>
        setFilters((prev) => ({ ...prev, search: value, page: 1 })),
    },
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
  ];

  // ✅ Limpiar todos los filtros
  const handleClearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      isActive: undefined,
      sedeId: undefined,
      page: 1,
    }));
  };

  const sedes = data?.items || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    totalPages: 0,
  };

  // ✅ Renderizar acciones
  const renderActions = (sede: Sede) => (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleDelete(sede)}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Eliminar"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estados</h1>
          <p className="text-gray-500 mt-1">Gestiona las sedes del sistema</p>
        </div>
        <Button className="shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.95)]">
          <MapPin className="h-4 w-4 mr-2" />
          Nueva Sede
        </Button>
      </div>

      {/* ✅ Filtros */}
      <CollapsibleFilters
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
      />

      {/* ✅ Tabla */}
      <DataTable
        data={sedes}
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
        actions={renderActions}
      />

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Sede"
        description={`¿Estás seguro de que deseas eliminar la sede "${sedeToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SedesPage;
