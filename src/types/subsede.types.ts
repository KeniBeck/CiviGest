export interface Subsede {
  id: number;
  sedeId: number;
  name: string;
  code: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  sede: {
    id: number;
    name: string;
    code: string;
  };
  _count?: {
    users: number;
  };
}

export interface GetSubsedesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sedeId?: number;
}

export interface CreateSubsedeDto {
  sedeId: number;
  name: string;
  code: string;
}

export interface UpdateSubsedeDto {
  sedeId?: number;
  name?: string;
  code?: string;
  isActive?: boolean;
}
