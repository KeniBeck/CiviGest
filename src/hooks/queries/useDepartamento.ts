import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departamentoService } from '@/services/departamento.service';
import type {
  CreateDepartamento,
  UpdateDepartamento,
  GetDepartamentoParams,
} from '@/types/departamento.type';

// Query Keys
export const departamentoKeys = {
  all: ['departamentos'] as const,
  lists: () => [...departamentoKeys.all, 'list'] as const,
  list: (params?: GetDepartamentoParams) => [...departamentoKeys.lists(), params] as const,
  details: () => [...departamentoKeys.all, 'detail'] as const,
  detail: (id: number) => [...departamentoKeys.details(), id] as const,
};

// ✅ Hook para obtener todos los departamentos (paginado)
export const useDepartamentos = (params?: GetDepartamentoParams) => {
  return useQuery({
    queryKey: departamentoKeys.list(params),
    queryFn: () => departamentoService.getAll(params),
  });
};

// ✅ Hook para obtener un departamento por ID
export const useDepartamento = (id: number) => {
  return useQuery({
    queryKey: departamentoKeys.detail(id),
    queryFn: () => departamentoService.getById(id),
    enabled: !!id,
  });
};

// ✅ Hook para crear un departamento
export const useCreateDepartamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartamento) => departamentoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departamentoKeys.lists() });
    },
  });
};

// ✅ Hook para actualizar un departamento
export const useUpdateDepartamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartamento }) =>
      departamentoService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departamentoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departamentoKeys.detail(variables.id) });
    },
  });
};

// ✅ Hook para eliminar un departamento
export const useDeleteDepartamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departamentoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departamentoKeys.lists() });
    },
  });
};

// ✅ Hook para restaurar un departamento
export const useRestoreDepartamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departamentoService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departamentoKeys.lists() });
    },
  });
};

// ✅ Hook para toggle active/inactive
export const useToggleDepartamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departamentoService.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: departamentoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departamentoKeys.detail(id) });
    },
  });
};
