export interface Sede {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  _count?: {
    subsedes: number;
    users: number;
  };
}

export interface GetSedesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateSedeDto {
  name: string;
  code: string;
}

export interface UpdateSedeDto {
  name?: string;
  code?: string;
  isActive?: boolean;
}
