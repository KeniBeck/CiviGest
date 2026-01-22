
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagoPermisoService } from '@/services/pago-permiso.service';
import type {
  FilterPagosPermisosDto,
  CreatePagoPermisoDto,
  UpdatePagoPermisoDto,
  CreateReembolsoDto,
} from '@/types/pago-permisos.type';

export const pagoPermisoKeys = {
  all: ['pagos-permisos'] as const,
  lists: () => [...pagoPermisoKeys.all, 'list'] as const,
  list: (filters: FilterPagosPermisosDto) => [...pagoPermisoKeys.lists(), filters] as const,
  details: () => [...pagoPermisoKeys.all, 'detail'] as const,
  detail: (id: number) => [...pagoPermisoKeys.details(), id] as const,
  byPermiso: (permisoId: number) => [...pagoPermisoKeys.all, 'permiso', permisoId] as const,
};

// ✅ Listar pagos con filtros
export const usePagosPermisos = (filters: FilterPagosPermisosDto = {}) => {
  return useQuery({
    queryKey: pagoPermisoKeys.list(filters),
    queryFn: async () => {
      const response = await pagoPermisoService.getAll(filters);
      return response.data;
    },
  });
};

// ✅ Obtener un pago por ID
export const usePagoPermiso = (id: number) => {
  return useQuery({
    queryKey: pagoPermisoKeys.detail(id),
    queryFn: async () => {
      const response = await pagoPermisoService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

// ✅ Obtener pagos de un permiso específico
export const usePagosByPermiso = (permisoId: number) => {
  return useQuery({
    queryKey: pagoPermisoKeys.byPermiso(permisoId),
    queryFn: async () => {
      const response = await pagoPermisoService.getByPermisoId(permisoId);
      return response.data;
    },
    enabled: !!permisoId && permisoId > 0,
  });
};

// ✅ Crear pago
export const useCreatePagoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePagoPermisoDto) => pagoPermisoService.create(data),
    onSuccess: () => {
      // Invalidar queries de pagos
      queryClient.invalidateQueries({ queryKey: pagoPermisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pagoPermisoKeys.all });
      // Invalidar queries de permisos para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

// ✅ Actualizar pago
export const useUpdatePagoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePagoPermisoDto }) =>
      pagoPermisoService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries de pagos
      queryClient.invalidateQueries({ queryKey: pagoPermisoKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pagoPermisoKeys.lists() });
      // Invalidar queries de permisos para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

// ✅ Cancelar pago
export const useDeletePagoPermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pagoPermisoService.delete(id),
    onSuccess: () => {
      // Invalidar queries de pagos
      queryClient.invalidateQueries({ queryKey: pagoPermisoKeys.lists() });
      // Invalidar queries de permisos para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

// ✅ Crear reembolso
export const useCreateReembolso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReembolsoDto) => pagoPermisoService.createReembolso(data),
    onSuccess: () => {
      // Invalidar queries de pagos
      queryClient.invalidateQueries({ queryKey: pagoPermisoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pagoPermisoKeys.all });
      // Invalidar queries de permisos para actualizar la tabla
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

// ✅ Generar enlace público
export const useGenerarEnlacePublico = () => {
  return useMutation({
    mutationFn: (id: number) => pagoPermisoService.generarEnlacePublico(id),
  });
};
