
export interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionStats {
  totalActive: number;
  totalInactive: number;
  totalResources: number;
  resources: string[];
}

// ✅ Respuesta paginada específica para permisos (incluye stats)
export interface PaginatedPermissionsResponse {
  items: Permission[];
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  nextPages: any[];
  stats: PermissionStats;
}

export interface GetPermissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  resource?: string;
  action?: string;
}

export interface CreatePermissionDto {
  resource: string;
  action: string;
  description: string;
}

export interface UpdatePermissionDto {
  resource?: string;
  action?: string;
  description?: string;
  isActive?: boolean;
}
