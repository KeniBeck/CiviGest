export interface Role {
  id: number;
  name: string;
  description: string;
  level: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
  sedeId: number | null;
  subsedeId: number | null;
  isGlobal: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions:[
         {
          id: number;
          roleId: number;
          permissionId: number;
          grantedAt: string;
          grantedBy: number;
          permission: {
            id: number;
            resource: string;
            action: string;
            description: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }
        }
  ];
}

export interface CreateRoleDto {
  name: string;
  description: string;
  level: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
  isActive: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  level?: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
  isActive?: boolean;
}

export interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includePermissions?: boolean;
  level?: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
}
