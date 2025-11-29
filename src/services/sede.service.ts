import { api } from './api';
import type {
  Sede,
  GetSedesParams,
  CreateSedeDto,
  UpdateSedeDto,
} from '@/types/sede.types';
import type { PaginatedResponse } from '@/types/api.types';

export const sedeService = {
  getAll: async (params: GetSedesParams) => {
    const response = await api.get<PaginatedResponse<Sede>>('/sedes', { params });
    return response;
  },

  getById: async (id: number) => {
    const response = await api.get<Sede>(`/sedes/${id}`);
    return response;
  },

  create: async (data: CreateSedeDto) => {
    const response = await api.post<Sede>('/sedes', data);
    return response;
  },

  update: async (id: number, data: UpdateSedeDto) => {
    const response = await api.patch<Sede>(`/sedes/${id}`, data);
    return response;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/sedes/${id}`);
    return response;
  },
};
