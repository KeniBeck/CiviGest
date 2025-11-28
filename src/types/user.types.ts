export interface User {
  id: number;
  sedeId: number;
  subsedeId: number | null;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  address: string | null;
  documentType: 'CURP' | 'RFC' | 'INE' | 'PASSPORT' | 'VISA';
  documentNumber: string;
  accessLevel: 'SEDE' | 'SUBSEDE';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  sede: {
    id: number;
    name: string;
    code: string;
  };
  subsede: {
    id: number;
    name: string;
    code: string;
  } | null;
  roles: {
    id: number;
    roleId: number;
    role: {
      id: number;
      name: string;
      level: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
      description: string;
    };
  }[];
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  accessLevel?: 'SEDE' | 'SUBSEDE';
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  documentType: 'CURP' | 'RFC' | 'INE' | 'PASSPORT' | 'VISA';
  documentNumber: string;
  accessLevel: 'SEDE' | 'SUBSEDE';
  subsedeId?: number;
  roleIds: number[];
  address?: string;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  password?: string;
}
