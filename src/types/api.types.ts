export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// ✅ IMPORTANTE: Usar EXACTAMENTE la estructura del backend
// Backend response: { items: [], pagination: {}, nextPages: [] }
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalUsers?: number;
    activeUsers?: number;
    inactiveUsers?: number;
  };
  nextPages: any[];
}
