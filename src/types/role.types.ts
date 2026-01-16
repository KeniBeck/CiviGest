export interface Role {
  id: number;
  name: string;
  description: string;
  level: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  level?: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
}
