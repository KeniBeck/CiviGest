import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type {
  GetUsersParams,
  CreateUserDto,
  UpdateUserDto,
} from '@/types/user.types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// Obtener lista de usuarios (con paginación y filtros)
export const useUsers = (params: GetUsersParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await userService.getAll(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Importante para paginación suave (React Query v5)
  });
};

// Obtener un usuario por ID
export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await userService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Crear usuario
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await userService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Actualizar usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserDto }) => {
      const response = await userService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
};

// Eliminar usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await userService.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Toggle active/inactive usuario
export const useToggleUserActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await userService.toggleActive(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
};
