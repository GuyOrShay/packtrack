export interface LoginRequest {
  username: string;
  password: string;
}

export type AppRole = 'admin' | 'driver' | 'client';

export interface AuthUser {
  id: string;
  username: string;
  role: AppRole | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface BootstrapAdminRequest {
  username: string;
  password: string;
}

export interface AdminCreateUserRequest {
  username: string;
  password: string;
  role: AppRole;
}

export interface AdminCreateUserResponse {
  id: string;
  username: string;
  role: AppRole;
}
