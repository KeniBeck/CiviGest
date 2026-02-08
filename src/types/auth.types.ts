export interface LoginRequest {
  email: string;
  password: string;
}

export interface AgenteLoginRequest {
  numPlaca: string;
  contrasena: string;
}

export interface Patrulla {
  id: number;
  numPatrulla: string;
  placa: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  sedeId: number;
  subsedeId: number;
  accessLevel: string;
  roles: string[];
  isAgente?: boolean;
  requirePasswordChange?: boolean;
  // Campos específicos de agente
  foto?: string;
  cargo?: string;
  numPlaca?: string;
  whatsapp?: string;
  tipo?: string;
  patrulla?: Patrulla;
  permissions?: string[]; // Renombrado de permisos a permissions para coincidir con el backend
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ValidateResponse {
  valid: boolean;
  user: {
    id: number;
    email: string;
    username: string;
  };
}
