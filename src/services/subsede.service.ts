import { api } from './api';
import type {
  Subsede,
  GetSubsedesParams,
  CreateSubsedeDto,
  UpdateSubsedeDto,
} from '@/types/subsede.types';
import type { PaginatedResponse } from '@/types/api.types';

export const subsedeService = {
  getAll: async (params: GetSubsedesParams) => {
    const response = await api.get<PaginatedResponse<Subsede>>('/subsedes', { params });
    return response;
  },

  getById: async (id: number) => {
    const response = await api.get<Subsede>(`/subsedes/${id}`);
    return response;
  },

  create: async (data: CreateSubsedeDto) => {
    const response = await api.post<Subsede>('/subsedes', data);
    return response;
  },

  update: async (id: number, data: UpdateSubsedeDto) => {
    const response = await api.patch<Subsede>(`/subsedes/${id}`, data);
    return response;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/subsedes/${id}`);
    return response;
  },
};
