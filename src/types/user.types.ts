// ✅ Type completo según la respuesta del backend
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
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  passwordResetToken: string | null;
  passwordResetExpires: string | null;
  otpRequestCount: number;
  lastOtpRequestAt: string | null;
  lastLoginAt: string | null;
  accessLevel: 'SEDE' | 'SUBSEDE';
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
  subsede: {
    id: number;
    name: string;
    code: string;
  } | null;
  roles: {
    role: {
      id: number;
      name: string;
      level: 'SUPER_ADMIN' | 'ESTATAL' | 'MUNICIPAL' | 'OPERATIVO';
    };
  }[];
  sedeAccess?: {
    id: number;
    userId: number;
    sedeId: number;
    grantedAt: string;
    grantedBy: number;
    isActive: boolean;
    sede: {
      id: number;
      name: string;
      code: string;
    };
  }[];
  subsedeAccess?: {
    id: number;
    userId: number;
    subsedeId: number;
    grantedAt: string;
    grantedBy: number;
    isActive: boolean;
    subsede: {
      id: number;
      name: string;
      code: string;
    };
  }[];
  _count: {
    sedeAccess: number;
    subsedeAccess: number;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  accessLevel?: 'SEDE' | 'SUBSEDE';
  sedeId?: number;
  subsedeId?: number;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  phoneCountryCode?: string;
  documentType: 'CURP' | 'RFC' | 'INE' | 'PASSPORT' | 'VISA';
  documentNumber: string;
  accessLevel: 'SEDE' | 'SUBSEDE';
  sedeId: number;
  subsedeId?: number;
  roleIds: number[];
  subsedeAccessIds?: number[]; // Array de subsedes a las que tiene acceso
  address?: string;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  password?: string;
}
