export interface LoginRequest {
  email: string;
  password: string;
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
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ValidateResponse {
  valid: boolean;
  user: {
    id: number;
    email: string;
    username: string;
  };
}
