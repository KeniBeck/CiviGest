import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagoInfraccionService } from '@/services/pago-infraccion.service';
import type {
  FilterPagosInfraccionesDto,
  CreatePagoInfraccionDto,
  UpdatePagoInfraccionDto,
  CreateReembolsoInfraccionDto,
} from '@/types/pago-infraccion.type';
import { infraccionKeys } from './useInfraccion';

export const pagoInfraccionKeys = {
  all: ['pagos-infracciones'] as const,
  lists: () => [...pagoInfraccionKeys.all, 'list'] as const,
  list: (filters: FilterPagosInfraccionesDto) => [...pagoInfraccionKeys.lists(), filters] as const,
  details: () => [...pagoInfraccionKeys.all, 'detail'] as const,
  detail: (id: number) => [...pagoInfraccionKeys.details(), id] as const,
  byFolio: (folioInfraccion: string) =>
    [...pagoInfraccionKeys.all, 'folio', folioInfraccion] as const,
};

export const usePagosInfracciones = (filters: FilterPagosInfraccionesDto = {}) => {
  return useQuery({
    queryKey: pagoInfraccionKeys.list(filters),
    queryFn: async () => {
      const response = await pagoInfraccionService.getAll(filters);
      return response.data;
    },
  });
};

export const usePagoInfraccion = (id: number) => {
  return useQuery({
    queryKey: pagoInfraccionKeys.detail(id),
    queryFn: async () => {
      const response = await pagoInfraccionService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

export const usePagosByFolioInfraccion = (folioInfraccion: string) => {
  return useQuery({
    queryKey: pagoInfraccionKeys.byFolio(folioInfraccion),
    queryFn: async () => {
      const response = await pagoInfraccionService.getByFolioInfraccion(folioInfraccion);
      return response.data;
    },
    enabled: !!folioInfraccion,
  });
};

export const useCreatePagoInfraccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePagoInfraccionDto) => pagoInfraccionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagoInfraccionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pagoInfraccionKeys.all });
      queryClient.invalidateQueries({ queryKey: infraccionKeys.lists() });
    },
  });
};

export const useUpdatePagoInfraccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePagoInfraccionDto }) =>
      pagoInfraccionService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pagoInfraccionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pagoInfraccionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infraccionKeys.lists() });
    },
  });
};

export const useDeletePagoInfraccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pagoInfraccionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagoInfraccionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infraccionKeys.lists() });
    },
  });
};

export const useCreateReembolsoInfraccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReembolsoInfraccionDto) =>
      pagoInfraccionService.createReembolso(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagoInfraccionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pagoInfraccionKeys.all });
      queryClient.invalidateQueries({ queryKey: infraccionKeys.lists() });
    },
  });
};
